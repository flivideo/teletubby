#!/usr/bin/env bash
# Teletubby voice self-test — one command, PASS/FAIL per check, a fix line under every FAIL.
# Runs inside the app when it is up (real mic status), standalone otherwise.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
exec npx --no-install vite-node scripts/voice-selftest.ts
