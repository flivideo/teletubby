---
created: 2026-11-03
---
# Voice-follow slice 1 — results (2026-11-03)

**Status: PARTIAL — stopped at brief step 3. No real-take numbers exist.**

## Done
- `src/core/voice-follow.ts` — port of Textream `PromptMatcher` + `SpeechTextAlignment` (MIT header, copyright, source
  paths, commit `2c02f3e`). Forward-only, 2-of-3 gate, annotation skipping, `jump`.
- `test/voice-follow.test.ts` — Textream's 2 tests ported, plus a jump test. Typecheck and full suite green.

## Not done: replay harness and the ≥3-take run
Brief step 3: "If no ↓-press record exists anywhere, STOP before inventing one."

**What exists (M2, read-only look):**
- Teletubby writes **nothing per key press**. No `appendFile`/`writeFile`/jsonl in `src/main` or `src/core`; step position
  lives only in the workspace (`list_rigs → workspace.position`), overwritten on change. No `~/Library/Application
  Support/teletubby/` on this machine at all (recording happened on M4 if anywhere).
- `~/dev/video-projects/v-appydave/` holds 5 `.mov` takes (d08 ×2, d10 ×1, d12 ×2) and one DJI `.MP4` — **no transcripts,
  no word timings, no facts logs, no `fli.tubby.json`**. `v-aitldr/` does not exist here. `~/.fli` has only `window-state.json`.
- Not checked: the M4 (where FliHub/FliTools outputs and Teletubby's store likely live) — outside this brief's M2 scope.

## Proposed proxy (orch to decide)
1. **Truth = paragraph boundaries in the transcript**, not ↓ presses: align each script paragraph's first words to the
   word-timed transcript (a plain DP/greedy match, independent of the Textream matcher) to get "when David actually
   started paragraph N". Then compare when the aligner crosses into paragraph N. Measures aligner-vs-speech, which is
   the real question; it cannot measure David's press lag.
2. **Or** add a ↓-press log (append `{t, position}` to a jsonl on every `step`) and record fresh takes. Cheap, but costs a shoot.
3. Needs word-timed FliTools transcripts for ≥3 takes: transcribe the 5 `.mov`s here (FliTools is on this machine, :7161)
   — but those are FliVideo recordings, not Teletubby script reads, so a script they were read from is also needed.
   Real Teletubby takes (script 01 etc.) are the right data; ask where they were recorded.

## Verdict
Unknown. Matcher is ported and unit-tested only on Textream's own cases.
