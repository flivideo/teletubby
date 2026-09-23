---
adr: 006
title: An agent may choose what is on stage — only while the talent is not on the prompter
status: accepted
date: 2026-09-23
files:
  - src/core/stage.ts
  - src/core/handlers.ts
  - src/core/index.ts
  - src/renderer/src/App.tsx
  - src/renderer/src/store.ts
  - test/write-script.test.ts
---

# ADR-006 — An agent may choose what is on stage, only while the talent is not on the prompter

## Context

Teletubby's founding rule: **an agent never moves the talent.** Choosing the set on stage was
UI-only, like `set_active_context`. The d04 autopilot UAT, planned in
`/Users/davidcruwys/dev/ad/brains/docs/handovers/deliver-2026-09-23-B587-B588-d04-uat.md` §5a and
green-lit by David, needs an agent to write two named scripts into a project that already has a set
attached and put one on stage. That is the wrong-set bug: the window opens on the existing set, and
an agent had no way to change it.

A second finding came out of the same work: **the renderer never calls `set_active_context`.** The
"busy" signal that `system.quit` refused on (ADR-005) could therefore never fire in the live app.

## Decision

- **The rule is kept in spirit, narrowed in letter.** `stage_select { setId, scriptId? }`
  (`stage.select`) is agent-callable, and it refuses `app-busy` while the talent is on the
  prompter. Mid-take, an agent still cannot move them.
- **Busy means the talent MOVED in the last 2 minutes.** The window writes `remember_layout` about
  400 ms after every step, script change or corpus flip, carrying the position. Three writes do NOT
  count:
  - the first write of a run (a relaunch restoring where it was);
  - a layout-only change;
  - the window landing on a stage an agent just asked for.

  Only the `ui` principal's writes count, so an agent can make the app look neither busy nor idle.
  `system_quit` and `system_restart` use the same signal.
- **The core records; the window applies.** The request is numbered, and the window reads it on the
  change event (`stage_get`) and applies each request exactly once, through the setup panel's own
  `requestedSetId` path plus the script. An agent reads where the window actually landed from
  `list_rigs → workspace.position`.
- `set_active_context` stays UI-only (★). It records the talent's own selection; `stage_select` is
  a request that the window honours.

## Rejected

- **Making `set_active_context` agent-callable.** That lets an agent forge the talent's selection,
  which is a different act from asking the window to change stage.
- **Busy = the selection is fresh** (ADR-005's first cut). Nothing ever set it, so it was always idle.
- **Opening the project's on-demand set in preference automatically.** That's a guess about what the
  talent wants. An explicit agent request, refused mid-take, is honest.

## Consequences

- The 2-minute window is a heuristic, not a fact. Teletubby cannot see Ecamm. A talent paused for
  longer than 2 minutes between takes can be moved, sees it happen, and can move back.
- Nothing here has been run in the live app. The window path is covered by store-level tests, not
  by a driven UI (see `docs/agent-drivable-audit.md` §8).
- `CLAUDE.md` still states the absolute form of the rule. It needs a one-line update to point here;
  that is left for David to approve.
