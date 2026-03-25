async function handleSubmit(feedbackData) {
    const feedbackActionURL =
        configuration.feedbackActionURL ?? "/o/c/portalfeedbacks";

    const payload = {
        ...feedbackData,
        pathname: window.location.pathname,
        ratingType: configuration.ratingType,
        userAgent: navigator.userAgent,
    };

    const fetch = feedbackActionURL.includes("http")
        ? window.fetch
        : Liferay.Util.fetch;

    const response = await fetch(feedbackActionURL, {
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    });

    if (!response.ok) {
        return console.error("Something went wrong to submit feedback");
    }
}

async function main() {
    const closeBtn = fragmentElement.querySelector(
        ".lfr-share-feedback__close",
    );
    const form = fragmentElement.querySelector(".lfr-share-feedback__form");
    const modal = fragmentElement.querySelector(".lfr-share-feedback__modal");
    const screenshotBtn = fragmentElement.querySelector(
        ".lfr-share-feedback__screenshot-btn",
    );
    const successMsg = fragmentElement.querySelector(
        ".lfr-share-feedback__success-message",
    );
    const triggerBtn = fragmentElement.querySelector(
        ".lfr-share-feedback__trigger",
    );

    let screenshotDataUrl = null;

    if (triggerBtn && modal) {
        triggerBtn.addEventListener("click", () => {
            modal.classList.toggle("is-open");

            const isOpen = modal.classList.contains("is-open");

            triggerBtn.setAttribute("aria-expanded", isOpen);
            modal.setAttribute("aria-hidden", !isOpen);

            // Focus management
            if (isOpen) {
                setTimeout(() => {
                    const firstInput = form.querySelector(
                        "input, textarea, select",
                    );
                    if (firstInput) firstInput.focus();
                }, 300);
            }
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("is-open");
            triggerBtn.setAttribute("aria-expanded", "false");
            modal.setAttribute("aria-hidden", "true");
        });
    }

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (
            modal?.classList?.contains("is-open") &&
            !modal.contains(e.target) &&
            !triggerBtn.contains(e.target)
        ) {
            modal.classList.remove("is-open");
            triggerBtn.setAttribute("aria-expanded", "false");
            modal.setAttribute("aria-hidden", "true");
        }
    });

    if (screenshotBtn) {
        screenshotBtn.addEventListener("click", async () => {
            // Check if html2canvas is loaded
            if (typeof html2canvas === "undefined") {
                screenshotBtn.classList.add("is-loading");
                screenshotBtn.innerHTML = `
                    <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                    </svg>
                    Loading...
                `;

                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src =
                            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                } catch (e) {
                    console.error("Failed to load html2canvas");
                    screenshotBtn.innerHTML = "Failed to capture";
                    screenshotBtn.classList.remove("is-loading");
                    return;
                }
            }

            // Capture process starts
            screenshotBtn.classList.add("is-loading");
            screenshotBtn.innerHTML = `
                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
                Capturing...
            `;

            // Hide modal temporarily for screenshot
            const modalIsOpen = modal.classList.contains("is-open");

            if (modalIsOpen) {
                modal.classList.remove("is-open");
                // Wait for animation
                await new Promise((resolve) => setTimeout(resolve, 300));
            }

            try {
                // Calculate a safe scale to reduce dimensions dramatically
                // Scales high-res displays down so the max width is ~800px
                const safeScale = Math.min(1, 800 / window.innerWidth);

                const canvas = await html2canvas(document.body, {
                    logging: false,
                    useCORS: true,
                    scale: safeScale,
                    ignoreElements: (element) =>
                        element.classList.contains("lfr-share-feedback"),
                });

                // Use highly-compressed JPEG (0.4 quality) instead of lossless PNG
                // This ensures base64 strings easily stay below the 65000-char limits
                screenshotDataUrl = canvas.toDataURL("image/jpeg", 0.4);

                const previewContainer = fragmentElement.querySelector(
                    ".lfr-share-feedback__screenshot-preview",
                );

                const previewImg = previewContainer.querySelector("img");

                previewImg.src = screenshotDataUrl;
                previewContainer.classList.remove("hidden");
                screenshotBtn.classList.add("hidden");

                // Add remove listener
                const removeBtn = previewContainer.querySelector(
                    ".lfr-share-feedback__screenshot-remove",
                );
                removeBtn.addEventListener("click", () => {
                    screenshotDataUrl = null;
                    previewContainer.classList.add("hidden");
                    screenshotBtn.classList.remove("hidden");
                });
            } catch (error) {
                console.error("Screenshot capture failed:", error);
            } finally {
                // Restore button state and modal
                screenshotBtn.classList.remove("is-loading");
                screenshotBtn.innerHTML = `
                    <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    Retake Screenshot
                `;

                if (modalIsOpen) {
                    modal.classList.add("is-open");
                }
            }
        });
    }

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const submitBtn = form.querySelector(
                ".lfr-share-feedback__submit-btn",
            );

            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";

            // Gather form data
            const formData = new FormData(form);

            const feedbackData = Object.fromEntries(formData.entries());

            if (screenshotDataUrl) {
                feedbackData.screenshot = screenshotDataUrl;
            }

            await handleSubmit(feedbackData);

            // Simulate API request
            setTimeout(() => {
                // Display success message
                const formElements = form.querySelectorAll(
                    ".lfr-share-feedback__group, .lfr-share-feedback__footer",
                );
                formElements.forEach((el) => el.classList.add("hidden"));

                if (successMsg) {
                    successMsg.classList.remove("hidden");
                }

                // Reset form after delay
                setTimeout(() => {
                    modal.classList.remove("is-open");

                    setTimeout(() => {
                        form.reset();
                        formElements.forEach((el) =>
                            el.classList.remove("hidden"),
                        );
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Send Feedback";
                        if (successMsg) successMsg.classList.add("hidden");

                        // Reset screenshot
                        const previewContainer = fragmentElement.querySelector(
                            ".lfr-share-feedback__screenshot-preview",
                        );
                        if (previewContainer) {
                            previewContainer.classList.add("hidden");
                            if (screenshotBtn)
                                screenshotBtn.classList.remove("hidden");
                            screenshotDataUrl = null;
                        }
                    }, 300);
                }, 3000);
            }, 800);
        });
    }
}

main();
