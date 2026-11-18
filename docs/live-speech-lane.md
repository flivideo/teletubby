---
created: 2026-11-18
---
# Live speech: its own lane (C4-15)

**What this is.** Teletubby does two different things with words, and they must not be mixed up:

| | Scripts lane | Live speech lane |
|---|---|---|
| What it handles | Written text: set → script → transcript → paragraphs → trigger sets | Sound: David talking to camera, heard while he reads |
| Where it lives | `src/core/` + `src/shared/capabilities.ts`; stored in `fli.tubby.json` / the app store | `src/main/voice/*`, `src/core/voice-*.ts`, `src/core/recognizer.ts` |
| Reached by | The agent door: JSON-RPC on `/api/rpc` (loopback 7111), the CLI, the renderer | The window only: the Voice chip and the **V** key (IPC), plus one self-test command |
| Time | Whenever; edits are saved data | Right now, a take in progress; nothing is saved except the log |
| Cost | Free, local | Apple on-device: free. Groq fallback: cloud, **paid per audio-second** (see Engines) |
| Failure looks like | A refusal with a failure mode (`not-found`, `conflict`…) | A chip state (`starting`, `following`, `waiting`, `error`) and a line in `.logs/app.log` |

Plain words: the **script** is the map; **live speech** is the GPS dot moving on it. Following the voice never changes the script. It only moves the highlight (paragraph and word), and only forward.

## How it runs

1. **Mic in the window** captures audio; main pipes PCM to a `VoiceSession` (`src/main/voice/voice-session.ts`).
2. The session runs one **engine** at a time (a `LiveRecognizer`, `src/core/recognizer.ts`): Apple streaming is primary, Groq is the fallback; a failing engine hands the same audio to the next, and every switch is logged with the reason (`recogniser.chosen` / `failed`).
3. Heard text goes to the **driver** (`src/core/voice-driver.ts`, built on the aligner `src/core/voice-follow.ts`), which answers: which paragraph, which next word, did it move forward past where the prompter already is. Cues in `[brackets]` are skipped; ad-libs are refused, not followed.
4. A manual press (↓, ↑, jump) **re-anchors** the aligner, the only way back. Voice-driven moves are logged to the press log as kind `voice` (`src/core/press-log.ts`), so every live read is test data.

## Engines (and what they cost)

- **Apple streaming** (`apple-live.ts`, helper app): on-device, free, partial results as he speaks. Primary. Restarts its recognition task before the system's ~1-minute limit.
- **Groq** (`groq-live.ts`): `whisper-large-v3-turbo`, cloud. Throttled to a 5 s tick with a 10 s window (the billing minimum) and a rolling-hour budget of 7,200 audio-seconds so it never exceeds the plan. **This is the one paid path in the lane**; it only runs when Apple fails. Numbers: `docs/voice-follow-parity-2026-11-04.md` § Engines.
- FliTools has **no streaming recogniser** (it transcribes whole recordings). Teletubby is therefore a second Groq caller for live speech; it is not a bypass of `transcribe.run`.

## Commands

On the agent door, live speech has exactly **one** command:

| Command | Access | What it does |
|---|---|---|
| `voice.selftest` | read | Checks the chain: Groq key, microphone permission, a Groq round trip on a bundled 2 s sample, the Apple helper, and the aligner on a 2-paragraph script. PASS/FAIL per check with a plain-English fix on every FAIL. It runs in the app's own process, which is why it is behind the door. |

Everything else that touches the lane is reached **through the scripts lane**, because the voice follows whatever is on stage:

| Command | Why it matters to live speech |
|---|---|
| `stage.select` / `stage.get` | Put a set or script on stage; the driver is keyed on the script + transcript on stage. Refused with `app-busy` mid-take. |
| `script.get`, `transcript.get`, `context.get` | The text the aligner follows. |
| `transcript.write`, `script.update` | Change the words under the voice mid-session (agent edits are rare; the driver may hold stale text until the next re-anchor). |
| `system.status` | `busy` says whether the talent is mid-session. |
| `system.quit` / `system.restart` | Refuse `app-busy` while the talent is on the prompter. |

**Not on the door (by design, today):** start, stop, reset and vocabulary hints. Those are the Voice chip and **V** (`src/main/voice/voice-control.ts`: `start`, `stop`, `reset`, `hints`), because a prompter that an agent could start listening, or close, while David is on camera would break the rule that the talent's screen only does what he asked. Any new voice command on the door should be a read (status, last heard words) or go through the ★ human-only fence.

## Rules that hold in this lane

- Voice only moves **forward**; a press is the only way back.
- Silence is not an error: a still highlight means "waiting for you".
- The mic belongs to the window; engines never own it.
- Audio stays on the machine unless Apple has failed and Groq takes over; the log says when.

## Where to look

- Behaviour list and rounds: `docs/voice-follow-parity-2026-11-04.md`
- Engine numbers and the bake-off: `docs/voice-follow-bakeoff-2026-11-04.md`, `docs/voice-follow-slice1-results-2026-11-03.md`
- Open item that builds on this lane: `docs/backlog.md` ("Drive a narrated deck by David's voice")
