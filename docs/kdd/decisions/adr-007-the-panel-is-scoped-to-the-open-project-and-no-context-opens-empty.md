---
adr: 007
title: The panel is scoped to the open project, and no context opens empty
status: accepted
date: 2026-10-30
supersedes-in-part: [003, 004]
files:
  - src/renderer/src/store.ts
  - src/renderer/src/App.tsx
  - src/renderer/src/components/SetupPanel.tsx
  - test/setup-panel.test.ts
---

# ADR-007 — The panel is scoped to the open project, and no context opens empty

## Context

The B674 demo (2026-10-30): FliStudio pointed Teletubby at `d13-overlay-pilot` with
`context_select`, and Kybernesis stayed on stage. Context and stage are two things; the context
moved and the stage did not. FliStudio's "here" dot read the context, so it was green while the
wrong words were on screen. Two Teletubby behaviours kept that failure easy to reach:

- the setup panel's "All sets" chip, and the empty-project fallback to every set (W6 F5,
  ADR-003, ADR-004 §5), put another project's sets one click away under this project's name;
- a cold start with no `--brand/--project` opened the remembered set, which is always some
  project's.

## Decision

David's go, relayed by flivideo-orch (brief `flivideo/docs/briefs/teletubby-lands-2026-10-30.md`, Job D):

- **With a project open, the PROJECT row lists only that project's sets.** The "This project / All
  sets" chips and `setFilter` are gone. A project with none attached lists nothing and says so.
  Choosing between that project's sets and scripts stays the talent's.
- **With no project open, the row lists every set.** There is nothing to scope to, and the panel is
  the only way onto the stage from the shell.
- **No context → the empty shell** ("No project open — pick a set from the panel"), never the
  remembered set. `pickOpeningSet` returns `null` without a project, at launch and in the
  change-event path that fills an empty stage. With a context the B585 rule stands.
- Landing the right set is FliStudio's job, through `stage_select` (FliStudio Job A).

## Consequences

- Reverses ADR-003's "every other set is one click away" and ADR-004 §5's "the panel still lists
  every set". Both ADRs' opening rules are unchanged.
- Changing project from inside Teletubby is now FliStudio's (or `context_select`'s), not a panel
  chip's.
- Pinned in `test/setup-panel.test.ts` ("the PROJECT row lists only the open project's sets",
  "a cold start with no context opens the empty shell").
