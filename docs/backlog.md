# Teletubby backlog

**Purpose**: Teletubby work that is planned but not active. Nothing here is built without David's go.

**For Agents**: Read before starting Teletubby work. Each entry gives its source and what it waits on.

*Status 2026-11-04: **warm**. David: "it's for the future because I'm not using it today… I might be using it at the
end of the afternoon. Keep it warm. We'll want to test our scripts on it today."*

## Warm: likely today, late afternoon

- **Test today's story scripts on Teletubby.** David: "rather than me reading scripts from Story Pilot I can easily just
  update it on Teletubby and play it from there."
  - Already built: Story Pilot's `story.script.send` writes the script into Teletubby (set `<folder>-scripts`, script
    `storypilot-<video>`, see `flistudio/modules/storypilot/server/story.ts` §Teletubby).
  - Check before he starts: the send works end to end on today's video, and he can **edit** the text on Teletubby.
  - Open question: when he edits on Teletubby, does the change flow back to Story Pilot's script versions (W4), or does
    it fork? Today it forks. Decide before it matters.

## Next, needs David's ask

- **↓-press log.** Write a timestamped log of David's ↓ presses during a take. Without it, voice-follow can only be
  measured against speech, not against when David actually moved on (`docs/voice-follow-slice1-results-2026-11-03.md`).
  CLAUDE.md requires David's ask for new logging. Recommended: yes.
- **Voice-follow real numbers.** After the press log: record at least 3 scripted takes and compare follow vs presses.
  Slice 1 (`d748f8a`, ported Textream PromptMatcher) is merged but switched off.

## Banked

- Script on demand (fill-in and rescue): `docs/briefs/script-on-demand-2026-10-11.md`, a draft, not authorised.
