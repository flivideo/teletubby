---
created: 2026-11-03
---
# Voice-follow slice 1 — results (2026-11-03)

**Verdict: UNKNOWN on real takes — the data to test it does not exist. Matcher ported, harness built, one risk found.**

⚠️ Everything here is **aligner vs speech, not vs ↓ presses.** Teletubby writes no ↓-press log. A press log is the
follow-up: it needs a **new ask** to David and **a shoot** (append `{t, position}` on every `step`, then record takes).

## Built
- `src/core/voice-follow.ts` — port of Textream `PromptMatcher` + `SpeechTextAlignment` (MIT header, © 2026 Fatih Kadir
  Akin, source paths, commit `2c02f3e`). Forward-only, 2-of-3 gate, `[cue]` skipping, `jump`.
- `src/core/voice-follow-replay.ts` + `scripts/voice-follow-replay.mjs` (`npx vite-node scripts/voice-follow-replay.mjs
  <transcript.json> <script.json|txt>`). Feeds a FliTools word-timed transcript word by word (cumulative, like a streaming
  partial) and prints, per script paragraph: speech start, aligner step time, offset; plus ±1 s / ±2 s counts, median,
  worst, early steps, misses. "Speech start" = the paragraph's first 3 words located in order, fuzzily, in the transcript.
- Tests: Textream's 2 ported + jump (`test/voice-follow.test.ts`); 4 harness tests (`test/voice-follow-replay.test.ts`).

## Data: why there are no per-take numbers
Copied read-only from the M4: d01-flivideo-tour's 20 transcripts (`hub/transcripts/*.json`) and `fli.tubby.json`.
- `fli.tubby.json` holds **two unrelated CTA stubs** (`cta-v1`, `cta-test`, 3 + 2 short paragraphs). Nothing in it is a
  script any of the 20 takes was read from.
- The takes are **ad-libbed screen-demo narration** (e.g. 02-1-overview: "Now two weeks ago I was traveling in
  Vietnam…"; 07-2: "So to do this call to action, I'm probably going to need…"). No source script exists in the
  project. The only grep hit for take text outside transcripts is FliCut's own words file.
- So the take↔paragraph mapping is not ambiguous — **there is none**. Not even one take is clear. I did not invent one.

**Smoke test only** (not evidence): 02-1-overview with its own segments as the "script" → 8/8 at offset 0 s. Trivial by
construction.

## One real finding (from the unit probe, not from takes)
**The char-level scan false-steps on unrelated speech.** Against a 3-paragraph script, speaking
"completely different words about something else entirely" (nothing in the script) advanced the matcher **45 chars**, into
paragraph 2. It skips spoken chars to find any later matching letter, so stray letters count. Textream's own README
assumes verbatim reading; this is the ad-lib risk the harvest doc predicted, now shown. Pinned in the test. For Teletubby
this matters most for trigger driving (improvised by design).

## What it would take to get a real verdict
1. Record **≥3 takes actually read from a Teletubby script** (script 01 of the Kybernesis set, or a `write_script` CTA),
   then transcribe through FliTools. Any real script would do. Or
2. The ↓-press log (needs the new ask) so the comparison is against David, not just speech.

Until then I would not call it promising or not. The false-step finding says verbatim-only, paragraph-driven, with a
guard (e.g. require the word-level strategy to agree) before going to slice 2.
