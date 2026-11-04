#!/bin/sh
# Builds build/TeletubbySpeech.app (ad-hoc signed). Its own bundle id => macOS asks for Speech permission for IT, not iTerm2.
set -e
cd "$(dirname "$0")"
APP=build/TeletubbySpeech.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
swiftc -O main.swift -o "$APP/Contents/MacOS/apple-stt"
cp Info.plist "$APP/Contents/Info.plist"
codesign --force --sign - "$APP"
echo "built $(pwd)/$APP"
