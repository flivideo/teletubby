---
created: 2026-11-04
---
# Voice-follow parity checklist (2026-11-04)

**Parity means usefulness, not feature-matching** (David, 2026-11-04). The use: David reads a script, Teletubby follows
his voice and shows where he is. A row is **in** only if it serves that; everything else is **not needed** with a
one-line reason. Rows marked **question** are not built — they wait for David.

**Clean room.** The left column describes behaviour only, from a reader's behaviour spec of the upstream prompter
(`~/dev/upstream/clean-room/textream-voice-parity/spec.md`, sha256 `9c1df07d…0bea6`, overlap gate exit 0). No upstream
code was read by the builder. Row numbers (R1…R41) are the spec's.

Teletubby refs are at branch `voice-parity` base `c2a86cf` + `2af4ee9` (Apple bundle cherry-pick).

## Display — where am I

| # | Behaviour (what it does) | Teletubby today | Gap | Round | Why |
|---|---|---|---|---|---|
| R1 | Per-word three states: said words recede (low opacity), the one current word is marked (underline), unsaid stays full strength. Whole words, never letters. | Highlights the whole beat only (`src/renderer/src/components/Zones.tsx:289`); the aligner's word cursor (`src/core/voice-follow.ts` `cursorWord`) is dropped by the driver (`src/core/voice-driver.ts:57-63`, paragraph only) | No word-level display | **in** | This *is* "shows where he is" inside a paragraph. Quiet AppyDave tokens. |
| R2 | No colour animation; states snap. Only the scroll eases. | n/a | — | **in** | A fade smears across words when reading fast. |
| R3 | Exactly one current word, never a cue. | n/a | — | **in** | One marker = one claim (rule 4's spirit). |
| R4 | Bracketed `[cues]` drawn italic and dim; never matched; progress jumps over them. | Aligner already skips cues (`voice-follow.ts:85-98`); display draws them as plain text | Display treatment | **in** | Directions stay visible but are clearly not words to say. One fixed treatment, no presets. |
| R5 | No highlight in timed modes. | n/a | — | not needed | No timed modes (R24). |
| R6 | Fixed reading spot; text slides up under it, eased ~0.5 s. | Already the rule-7 reading line (`Zones.tsx:30-56`, `--tt-reading-line`) per beat | Within a long paragraph the current line can fall below view | **in** (adapted) | Keep the reading line; inside a paragraph taller than the space, keep the current word's line in view. |
| R7 | Scroll only goes forward unless the human moved it. | Voice only steps forward (`voice-live.ts:147`, `store.ts:656`) | Needs to hold for the in-paragraph scroll too | **in** | Partials revise; without it the text bounces. |
| R8 | Moves once per line, not per word. | n/a | — | **in** | Calm page while reading along a line. |
| R9 | Continuous timed crawl anchored low. | — | — | not needed | Constant-speed scroll fights the beat model; David doesn't use it. |
| R10 | Soft 5% fade at top/bottom edges. | — | — | not needed | Cosmetic; adds nothing to "where am I". |
| R11 | Optional paragraph dividers (dots). | Teletubby shows one paragraph at a time + a faint peek | — | not needed | Paragraphs are already separate beats. |
| R12 | CJK per-character words, right-to-left scripts. | — | — | not needed | English scripts only. |
| R13 | Manual scroll rules per mode, rubber band. | Manual ↓/↑/Space stepping (`App.tsx`, `store.ts:615-668`) | — | not needed | Teletubby's stepping is its manual mode and stays unchanged. |
| R14 | Off-screen culling. | — | — | not needed | One paragraph on screen; nothing to cull. |

## Matching speech to the script

| # | Behaviour | Teletubby today | Gap | Round | Why |
|---|---|---|---|---|---|
| R15–R17 | Letter + word matchers, fuzzy equality, forward-only gated commits. | Own clean-room word aligner with agreement guard, confirmation, far jump (`src/core/voice-follow.ts`) | — | not needed | Already have a word-level aligner that also refuses ad-libs (stronger for trigger zones). |
| R18 | Every partial is matched at once; no throttle. | Every recogniser event is fed to the aligner (`voice-live.ts:127-165`); Groq only emits every 2 s (`groq-live.ts:4`) | Speed is the engine, not the matcher | **in** | Apple streaming partials straight through = the "highlights a lot more often" David saw. |
| R19 | Recogniser primed with vocabulary from the unread script (≤50 words of 5+ letters), refreshed on start/restart/far jump. Upstream picks them in effect at random. | None (`native/apple-stt/main.swift`) | No hint | **in** (better) | Names like *Kybernesis* get misheard. Ours: the **nearest** ≤50 upcoming words, refreshed at each recognition-task start and after a re-anchor. |
| R20 | Dictation-style recognition with partials; on-device never forced. | Partials on; on-device **forced when supported** (`main.swift`) | Task hint | **in** | Keep forcing on-device (audio stays local); add the dictation hint. |

## Jumps and re-anchoring

| # | Behaviour | Teletubby today | Gap | Round | Why |
|---|---|---|---|---|---|
| R21 | Click/tap a word to jump there. | ↓/↑/jump re-anchor the aligner (`voice-live.ts:167-179`) | No click | **question** | Keys already re-anchor; a mouse on camera is a look-away. Ask David whether he'd ever click. |
| R22 | After a jump, the transcript heard so far is trimmed off new partials (with slack for revisions) and results within ~0.3 s are ignored. | Reset = Groq drops its window; Apple **relaunches the helper app** (`apple-live.ts` `reset`) | Relaunch through LaunchServices is slow (speech lost while it starts); no ignore window | **in** | A press must re-anchor instantly and not drop the next words. |
| R23 | Live script edits keep progress. | Data refresh never moves the talent (`store.refresh`); the voice driver is keyed on script+transcript id (`voice-live.ts:113`) | Driver may hold stale text after an agent edit | not needed (this round) | Agent edits mid-take are rare; revisit if it bites. |

## Modes, recovery, silence

| # | Behaviour | Teletubby today | Gap | Round | Why |
|---|---|---|---|---|---|
| R24 | Three modes: word tracking · classic constant scroll · voice-activated timer. | Voice on/off chip + `V` (`VoiceChip.tsx`); manual stepping otherwise | — | **word tracking: exists** · classic: not needed · voice-activated: not needed | Constant speed and a voice-gated timer don't follow the words; the beat model + voice tracking cover the use. |
| R25 | Recognition task replaced every ~55 s, ahead of the system's ~1-minute limit; audio keeps flowing. | Apple helper runs one task forever (`main.swift`) | Apple would stall after ~1 min | **in** | Without it Apple-primary dies a minute into every read. |
| R26 | Expected errors (time limit) restart at once; other errors back off (0.5 s × attempt, ≤1.5 s, ≤10 tries); a good result resets the count. | Any helper error → fallback (`apple-live.ts` `fail`) | No restart/backoff | **in** | A transient error shouldn't hand a read to the cloud. |
| R27 | Mic change rebuilds the audio input. | Mic is captured in the renderer (`voice-live.ts:53-94`) and piped to the helper | — | not needed | One rig mic; the helper never owns the mic. |
| R28 | Stale results from an older session/task are dropped (generation numbers). | Groq has a generation counter (`groq-live.ts:46`); Apple drops by helper identity (`apple-live.ts`) | Needs to cover task swaps (R25) | **in** | Keeps a restart from replaying old text after a press. |
| R29 | Voice activity detector (level thresholds, 0.75 s hangover). | — | — | not needed | Only drives the voice-activated timer (R24). |
| R30 | Silence doesn't affect tracking; no "lost" detector. | Chip says `following` / `waiting` (`voice-live.ts:24-25`) | — | exists | Already right: a still highlight means "waiting for you". |

## Language, mic, status

| # | Behaviour | Teletubby today | Gap | Round | Why |
|---|---|---|---|---|---|
| R31–R32 | Language picker; script-language suggestion banner. | en-US fixed | — | not needed | English only. |
| R33 | Mic picker. | System default mic | — | not needed | One rig mic. |
| R34 | Level waveform doubling as a progress bar. | — | — | not needed | Adds something to look at (North Star test fails). |
| R35 | Last 3 heard words shown. | Logged to `.logs/app.log` only | — | **question** | Useful when the highlight stalls, but it is text to read on camera. Ask David. |
| R36 | One red error line; opens privacy settings on denial. | Chip shows the error text (`VoiceChip.tsx`); Apple denial maps to a System Settings hint (`src/main/voice/apple-bundle.ts` `mapSpeechAuth`) | — | exists | — |
| R37 | Mic button states (starting / listening / stopped). | Chip states `starting` / `following` / `waiting` / `error` | — | exists | — |
| R38 | Elapsed timer. | — | — | not needed | Not about where he is. |
| R39 | Pages; "Done!" and auto-close at the end. | End card at the edge + cue cards (rule 2) | — | not needed | Teletubby's boundary cards cover it; a prompter must never close itself on the talent. |
| R40 | Open/close animations. | — | — | not needed | Polish. |
| R41 | Mirrored/browser copies in sync. | `M` mirror (`store.ts`) | — | not needed | Already have mirror; no remote copy wanted. |

## Engines — Teletubby-only rows (not from the upstream)

Measured facts (flivideo-orch, 2026-11-04): Groq Developer plan, `whisper-large-v3-turbo`: **20 requests/min** and
**7,200 audio-seconds/hour** (console.groq.com/docs/rate-limits). Billing: **10 s minimum per request**, $0.04 per audio
hour (Groq docs, speech-to-text). Today's design (12 s window every 2 s) = 30 req/min → about ⅓ get 429; it bills
~360 audio-s/min, so it breaks the hourly audio cap in ~20 min. **Groq is a poor fit for live follow.**

Arithmetic for the throttle: the hourly cap allows 2 audio-s per wall-clock second; with a 10 s billed minimum that is
**12 req/min (a 5 s tick)** sustained indefinitely. 15 req/min (4 s tick) bills 150 audio-s/min and hits the cap after
~48 min.

| # | Behaviour | Teletubby today | Gap | Round | Why |
|---|---|---|---|---|---|
| E1 | Apple streaming is the **primary** live engine; Groq is the fallback. | Groq first, Apple fallback (`src/main/index.ts:193-206`) | Order | **in** | Apple partials are live and free; Groq can't be (above). The bake-off still decides on real numbers. |
| E2 | Groq throttled: 5 s tick (12 req/min), 10 s window (the billing minimum, so a shorter window saves nothing), plus a rolling-hour audio-seconds budget that refuses a request rather than exceed 7,200. | 2 s tick, 12 s window (`groq-live.ts:4-5`) | Over both limits | **in** | Stay inside the plan; never surprise-bill. |
| E3 | Sustained 429s count toward fallback (3 in a row, or most of the last few), so a rate-limited Groq can't starve the other engine. | 429 never counts (`groq-live.ts:107-110`) | Starvation | **in** | Brief point 3b. |
| E4 | Every engine switch is logged with the reason. | `recogniser.chosen` / `failed` (`voice-session.ts:58-66`) | Needs the 429 reason | **in** | One file tells the whole story of a take. |

## Summary

- **In (build this round):** R1–R4, R6–R8 (word highlight, cue dimming, current word kept in view, forward-only and
  per-line), R18–R20 (streaming partials, nearest-word hint, dictation hint), R22 (instant re-anchor, trim + 0.3 s
  ignore), R25–R26, R28 (Apple restart/backoff/stale-drop), E1–E4 (Apple primary, Groq throttled, 429 fallback, logged).
- **Exists already:** word tracking mode, the aligner (R15–R17), silence/waiting (R30), error line + chip states (R36–R37).
- **Not needed:** timed/voice-activated modes and VAD, edge fade, dividers, CJK/RTL, culling, manual scroll rules,
  mic/language pickers, waveform, timer, pages/auto-close, animations, remote copies, live-edit carry-over (later).
- **Questions for David:** R21 click-a-word to jump? · R35 show the last few heard words while listening?
