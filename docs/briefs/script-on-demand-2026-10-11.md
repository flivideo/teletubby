# Script on demand — fill-in and rescue (D08 candidate, Teletubby slot)

**Status: draft brief (2026-10-11), not authorised to build.** Agreed with David in a Q&A on 2026-10-11.
**Spec page:** https://claude.ai/artifact/DhRNnM6BwwS2HgAmfwYpWG, source `/Users/davidcruwys/dev/ad/flivideo/teletubby/docs/briefs/script-on-demand-spec.html`.

## What David wants

Between takes, at the desk, he asks an agent for a script and it lands on the prompter. Two modes:

1. **Fill-in** — "write me a CTA from what I've said so far". Reads the video's **kept** takes so far (landed
   recordings, in chapter order) plus the video's Knowledge. Writes something not yet said. Lands as the next segment.
   Trashed takes are never read.
2. **Rescue** — "just write me the damn script". He has stumbled through the same piece several times. Reads the
   **Incoming** takes (not yet accepted, not trashed) plus Knowledge, and writes what he was trying to say, cleaned
   up. Lands as a new version of the segment he is stuck on.

Trash is a different thing: takes that were rejected after ingestion. Neither mode reads it.

## The missing piece

Incoming (the Ecamm watch folder, `watchDirectory`, today `~/ecamm`) is not transcribed. FliHub transcribes a take
when it lands (`flihub/server/src/utils/renameRecording.ts:268-277`, via FliTools `POST /api/transcribe`,
`flihub/server/src/utils/flitoolsClient.ts:94`). Rescue needs a **fast, basic** transcript of each Incoming take:
FliTools pass 1 (`groq-whisper` or `mlx-whisper`, `fli-core/src/brand-settings.ts:15`), not CrisperWhisper.

## Scope

- FliHub: pass-1 transcript for each Incoming take; a way for an agent to read them (e.g. a CLI/API verb listing
  Incoming takes with their quick text).
- `flivideo:segment-writer`: the two modes and their inputs; loads through `flivideo:teletubby` as today
  (`script.create` → `write_transcript` → `write_trigger_set`, dry run first).
- Teletubby itself: no change expected.

## Open (David's calls, on the spec page)

Where Incoming transcripts are kept; transcribe every Incoming take on arrival or only on request; rescue replaces the
stuck segment or sits beside it as a new version.
