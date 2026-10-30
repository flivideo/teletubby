# Teletubby ticket — stage_select follow-ups (2026-10-17)

**Purpose**: Two gaps found when an agent first put D09 on stage with `stage_select`.

**For Agents**:
- Read before changing FliStudio's Teletubby door or `active-context.ts`
- Both items are small; neither blocked D09 recording

**Raised by**: yt-scripting-dev session on the M4, 2026-10-17. Status: **CLOSED** (2026-10-30).

**Resolution**:
- Item 1 — **done** in FliStudio branch `tubby-lands` (FliStudio Job A of
  `/Users/davidcruwys/dev/ad/flivideo/docs/briefs/teletubby-lands-2026-10-30.md`): one door sequence,
  `context_select` → `script.write` → `stage_select` → `list_rigs` read-back, shared by the Teletubby
  door and Story Pilot's send. Teletubby's side (branch `tubby-panel`): the panel lists only the open
  project's sets, and a cold start with no context opens the empty shell.
- Item 2 — **(a) kept**: agents read `list_rigs` → `workspace.position`; `get_active_context` stays the
  talent's own touches.

## Context

`stage_select` exists and works. On 2026-10-17 at 08:00 it put set `openrig-coding-team`,
script `openrig-coding-team/1`, on stage. `list_rigs` → `workspace.position` matched and the window
showed "1 · COLD OPEN" (checked by screenshot).

## 1. FliStudio "Open in Teletubby" never stages a script — GAP (confirmed in code)

`/Users/davidcruwys/dev/ad/flivideo/flistudio/server/src/launch/doors.ts` (Teletubby door, ~L280–320)
calls `context_select` then `list_sets`, and says in a comment that "choosing the set is UI-only by
design". That premise is out of date: `stage_select` is now on the agent surface, and David wants
agents to drive the stage.

**Fix**: after `context_select`, when exactly one set is attached to the project, call
`stage_select { setId }` (default script), unless `busy` is non-empty. Report `app_busy` as
"not staged: talent is on the prompter", never as a failure of the switch. Update the comment.

**Done when**: FliStudio → D-project → Open in Teletubby leaves that project's set on stage, proven by
`list_rigs` → `workspace.position.setId`.

## 2. `get_active_context` stays empty after an agent stages a script — DESIGN QUESTION

Right after `stage_select`, `get_active_context` returned `{active:false, "Nothing is open"}`.
`/Users/davidcruwys/dev/ad/flivideo/teletubby/src/core/active-context.ts` explains why: only the
talent's own UI touches fill it, and it expires after 5 minutes, because "it belongs to the human".

That's coherent, but an agent asking "what's on stage?" gets a misleading "nothing". Options:
- (a) leave it, and point agents at `workspace.position` (already in the teletubby skill as of
  2026-10-17), or
- (b) have the window's apply of a stage request count as a talent-side `set`.

Recommendation: (a) now; revisit (b) only if an agent misreads it again. **David decides.**
