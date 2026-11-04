---
created: 2026-11-04
---
# Voice-follow recogniser bake-off (Phase B) and the M4 steps

**Status: Groq measured (M2). Apple NOT measured** — the Speech permission needs a human click and the M2 can't grant it
(helper reports authorization status 0 "not determined"). **Since the parity round (2026-11-04): Apple = primary, Groq =
fallback** — Apple streams partials for free; Groq on the Developer plan cannot (20 req/min, 7,200 audio-s/hour, 10 s
billed minimum — see `docs/voice-follow-parity-2026-11-04.md` § Engines). The bake-off still decides on real numbers:
Decision rule (David): Groq if better on latency AND quality, else Apple primary.

⚠️ The Groq numbers below were measured at the OLD cadence (2 s tick, 12 s window). The app and the bench now use a
**5 s tick and a 10 s window**, so re-run `run.sh groq` for a like-for-like column — expect higher latency.

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
cd ~/dev/ad/flivideo/teletubby          # or the worktree carrying branch voice-parity
git pull && npm ci
./native/apple-stt/build.sh             # → native/apple-stt/build/TeletubbySpeech.app (git-ignored, ad-hoc signed)
scripts/recognizer-bench/run.sh apple   # First run: macOS asks for Speech Recognition for "Teletubby Speech" → David clicks Allow
scripts/recognizer-bench/run.sh groq    # same takes, same machine, 5 s / 10 s cadence, for a like-for-like column
```
1. The Speech prompt names **"Teletubby Speech"** (the bundle asks for itself, so any terminal works). If the bench prints
   `apple: Speech Recognition permission was …`, open System Settings → Privacy & Security → Speech Recognition → allow
   "Teletubby Speech", then rerun.
2. The bench prints `apple: N recognition task(s), M retry line(s)` per take — takes over ~50 s should show 2+ tasks
   (the ~1-minute limit is handled by a task swap, not a stall).
3. Paste the `ALL [...]` line for each engine back to flivideo-orch; apply the decision rule on both columns.
4. **Live read**: `npm run app`, open a script, press **V**. The chip should say `waiting · apple`, then `following ·
   apple` as you read. In the paragraph zone the words you have said fade, the next word is underlined, `[cues]` are
   italic and dim. Press ↓ mid-paragraph: the underline jumps to the next beat's first word with no restart (no relaunch
   pause). Read past a minute without stopping: the highlight keeps moving. `.logs/app.log` lines `apple.task` /
   `apple.retry` / `recogniser.chosen` tell the story of the take.

## Phase C — what is wired (branch `voice-follow-2`)
- Renderer: `Voice on/off` chip (key **V**), **off by default**, quiet state word `following` / `waiting` + engine.
  Mic → 16 kHz PCM → main. `↓`/`↑`/jump/script change re-anchor the aligner at the new position and reset the audio
  window, so a manual press always wins. Voice only ever steps FORWARD.
- Main: `VoiceSession` runs **Apple first** (TeletubbySpeech.app, launched once per session; swaps its recognition task
  every ~50 s, retries its own errors, reset = trim + 300 ms ignore, never a relaunch). Fallback = Groq (key from env /
  `~/.config/appydave/.env.secrets` / `~/.secrets`, never logged or sent to the renderer), throttled to 5 s / 10 s inside
  a 7,200 audio-s rolling-hour budget; 3 consecutive errors **or 3 consecutive 429s** fail it over. Every switch logs
  `recogniser.chosen { engine, from, why }`.
- Word highlight (parity round): the driver exposes `{ paragraphId, wordInParagraph }`; the paragraph zone renders word
  spans (said fade, one current word underlined, cues italic + dim) and keeps the current line in view inside a tall
  paragraph. Recogniser hint: the nearest ≤50 upcoming 5+-letter words, re-read by the helper at each task start.
- Press log keeps running; voice-driven moves are logged as kind `voice` (ignored by the replay's press truth), so every
  live read is test data.
- Mic/Speech usage strings added to `scripts/brand-launcher.mjs` (FORMAT 2: the dev launcher is rebuilt once) and
  `electron-builder.yml`. First live run triggers the macOS Microphone prompt for Teletubby.
- NOT verified here: a live mic read (needs the M4 + David). Unit tests cover the driver, session failover, Groq window/
  failure handling, key loading; typecheck and build are green.
