---
adr: 003
title: An empty project opens empty, not on the remembered set
status: accepted
date: 2026-09-22
files:
  - src/renderer/src/store.ts
  - src/renderer/src/App.tsx
  - test/setup-panel.test.ts
---

# ADR-003 — An empty project opens empty, not on the remembered set

## Context

W6 fix F5 made a project with no attached set "never a dead end": the setup panel falls back to
listing every set, and launch opened the remembered set (`workspace.position.setId`), else the
first.

On 2026-09-22 David opened Teletubby on D01 (`d01-flivideo-tour`, a real project with footage and
no scripts). The context resolved correctly, but the stage showed **D03's
`cutty-presenter-tracking` script under a D01 footer**. His verdict: it "does not open
correctly". The fallback had put another project's words in front of the talent under this
project's name.

## Decision

Ruled by David (relayed by the d01-work session): **when a project context is open and no set is
attached to it, the window opens on an honest empty stage**. It says *"No script for \<project\>
yet"*, the setup panel is open, and every other set is one click away. The remembered set is
**not** auto-loaded in that case.

- `emptyProjectOf(sets, openProject)` in `store.ts` is the one rule. It is applied at launch
  **and** in the change-event path that fills an empty stage, so a later `context_select` onto an
  empty project cannot load the fallback either.
- This reverses F5's *auto-load* half and keeps its *never a dead end* half: `visibleSets` still
  falls back to every set, with its note. The shell renders the rail and the panel, per
  [the dead-end learning](../learnings/chrome-inside-the-loaded-branch-makes-every-empty-state-a-dead-end.md).
- With no context open, nothing changes: the remembered set still opens.

## Consequences

- An empty project writes nothing into `workspace.position`, because no set is on stage. So a
  relaunch does not "remember" its way anywhere.
- **Not changed, and the same bug class:** when the open project HAS sets, the remembered set
  still wins, even if it belongs to a different project (open D02 → D03 remembered → D03 opens).
  This was not ruled. Revisit it with the script↔video binding (option 2 of the D01 review),
  which is awaiting David.
- Pinned in `test/setup-panel.test.ts` ("a project with no set attached opens EMPTY").
