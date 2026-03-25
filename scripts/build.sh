#!/bin/sh

FOLDER_NAME=share-feedback-fragment-set

mkdir -p "./build"

zip -r "build/$FOLDER_NAME.zip" "./$FOLDER_NAME"