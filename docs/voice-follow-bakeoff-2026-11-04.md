---
created: 2026-11-04
---
# Voice-follow recogniser bake-off (Phase B) and the M4 steps

**Status: Groq measured (M2). Apple NOT measured** — the Speech permission needs a human click and the M2 can't grant it
(helper reports authorization status 0 "not determined"). **Working primary = Groq, Apple = fallback; the final pick stays
open until Apple's numbers exist.** Decision rule (David): Groq if better on latency AND quality, else Apple primary.

## Method
Four short d01-flivideo-tour takes (01-2-intro, 02-1-overview, 05-2-flicast, 07-1-teletuby; ~80 s of speech), fed at real
time. Reference = the FliTools transcript (CrisperWhisper). Groq: `whisper-large-v3-turbo`, every 2 s send the last 12 s.
- **Latency** = (first moment a reference word appears in recogniser output, on the audio clock incl. the request time) −
  (that word's end in the reference). Includes the wait for the next 2 s tick, so it is a ceiling for this setup.
- **Words** = reference words that showed up in order in some output (does not penalise extra wrong words).
- **Steps** = the aligner (`src/core/voice-follow.ts`) over the reference's own segments as the script; a step is correct
  if it lands between the previous paragraph's end and the next paragraph's start + 2 s. Isolates the recogniser's effect;
  the takes are ad-libbed so there is no true read-aloud script yet.

## Groq result (M2, 2026-11-04)
| Take | Words | Latency median / p90 | Steps ok |
|---|---|---|---|
| 01-2-intro | 27/27 | 822 / 1770 ms | 1/1 |
| 02-1-overview | 111/113 | 1386 / 2161 ms | 6/7 (1 late) |
| 05-2-flicast | 48/48 | 1170 / 1866 ms | 2/2 |
| 07-1-teletuby | 73/73 | 1217 / 2021 ms | 3/3 |
| **All** | **259/261 (99.2%)** | **1214 / 2022 ms** | **12/13, 0 early** |

## Apple — exact steps on the M4 (orch + David at the first live read)
```bash
cd ~/dev/ad/flivideo/teletubby-worktrees/voice-follow-2     # or: git -C ~/dev/ad/flivideo/teletubby worktree add ../teletubby-worktrees/voice-follow-2 origin/voice-follow-2
git pull && npm ci
./native/apple-stt/build.sh                                  # builds native/apple-stt/apple-stt (git-ignored)
scripts/recognizer-bench/run.sh apple                        # iTerm2. First run: macOS asks for Speech Recognition → David clicks Allow
scripts/recognizer-bench/run.sh groq                         # same takes, same machine, for a like-for-like column
```
If it prints `apple: {"error":"speech_auth"...}` the permission was not granted: System Settings → Privacy & Security →
Speech Recognition → allow iTerm, then rerun. Paste the `ALL [...]` line for each engine back to flivideo-orch; apply the
decision rule on both columns.

## Phase C — what is wired (branch `voice-follow-2`)
- Renderer: `Voice on/off` chip (key **V**), **off by default**, quiet state word `following` / `waiting` + engine.
  Mic → 16 kHz PCM → main. `↓`/`↑`/jump/script change re-anchor the aligner at the new position and reset the audio
  window, so a manual press always wins. Voice only ever steps FORWARD.
- Main: `VoiceSession` runs Groq first (key from env / `~/.config/appydave/.env.secrets` / `~/.secrets`, never logged or
  sent to the renderer); on 3 consecutive failures or no key it swaps to Apple (`native/apple-stt/apple-stt --stdin`).
- Press log keeps running; voice-driven moves are logged as kind `voice` (ignored by the replay's press truth), so every
  live read is test data.
- Mic/Speech usage strings added to `scripts/brand-launcher.mjs` (FORMAT 2: the dev launcher is rebuilt once) and
  `electron-builder.yml`. First live run triggers the macOS Microphone prompt for Teletubby.
- NOT verified here: a live mic read (needs the M4 + David). Unit tests cover the driver, session failover, Groq window/
  failure handling, key loading; typecheck and build are green.
