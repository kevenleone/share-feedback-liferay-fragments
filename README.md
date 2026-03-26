# Share Feedback Liferay Fragment

A Liferary Fragment that allows users to submit feedback directly from any Liferary page.

## Features

- **Trigger Styles**: Floating tab or icon button
- **Rating Types**: Emoji, Star (1-5), NPS (0-10), Thumbs up/down, or none
- **Category Selection**: Suggestion, Bug Report, Compliment, Other
- **Comments**: Rich text area for detailed feedback
- **Email Collection**: Optional email field for follow-up
- **Screenshot Capture**: Users can attach screenshots
- **Customization**: Theme colors, position, and more configurable via Liferary's UI

## Installation

1. Build the fragment:

    ```bash
    npm run build
    ```

2. Deploy to Liferary:
    ```bash
    npm run deploy
    ```

## Development

Run the watcher to automatically rebuild on changes:

```bash
npm run watcher
```

## Configuration

The fragment provides these configuration options in Liferary:

| Option                 | Description       | Default              |
| ---------------------- | ----------------- | -------------------- |
| Trigger Style          | Tab or icon       | tab                  |
| Tab Text               | Text shown on tab | Feedback             |
| Modal Title            | Header title      | Share Feedback       |
| Theme Background Color | Primary color     | #E44B23              |
| Theme Text Color       | Primary text      | #ffffff              |
| Rating Type            | Rating style      | emoji                |
| Collect Email          | Show email field  | false                |
| Capture Screenshot     | Enable screenshot | false                |
| Signed Users Only      | Require login     | true                 |
| Show Category          | Category dropdown | false                |
| Feedback Action URL    | Form endpoint     | /o/c/portalfeedbacks |
| Button Position        | Floating position | bottom-right         |

## License

MIT
