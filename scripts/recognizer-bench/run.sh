#!/bin/bash
# Usage: scripts/recognizer-bench/run.sh <groq|apple> [hub-dir]
# Runs the bake-off over four d01-flivideo-tour takes (read-only copies are converted to temp WAVs).
# groq: loads GROQ_API_KEY from ~/.secrets. apple: needs native/apple-stt/build.sh first and a one-time
# "Speech Recognition" Allow click the first time (run it from iTerm2).
set -euo pipefail
cd "$(dirname "$0")/../.."
ENGINE="${1:?groq|apple}"
HUB="${2:-$HOME/dev/video-projects/v-appydave/d01-flivideo-tour/hub}"
TMP="$(mktemp -d)"
args=()
for t in 01-2-intro 02-1-overview 05-2-flicast 07-1-teletuby; do
  ffmpeg -loglevel error -y -i "$HUB/recordings/$t.mov" -vn -ac 1 -ar 16000 "$TMP/$t.wav"
  args+=("$TMP/$t.wav" "$HUB/transcripts/$t.json")
done
if [ "$ENGINE" = groq ]; then set -a; . ~/.secrets; set +a; fi
npx vite-node scripts/recognizer-bench/bench.mjs "$ENGINE" "${args[@]}"
