# Checkpoint: Teletubby — agent layer + d04 UAT support — 2026-09-24

Session `teletubby` (2026-09-22 → 24). The work came from peer sessions, mostly: `flivideo-orch`
(orchestrates the d04 autopilot UAT), `flistudio` (fli-core agent-layer rollout), `d01-work` and
`d04-work`. Repo: `/Users/davidcruwys/dev/ad/flivideo/teletubby`, main at `711e315`, tree clean,
everything pushed. **The app is DOWN** as of this checkpoint (stopped by someone after the
`711e315` restart).

## Current step
**Idle. Waiting on peers.** Nothing is in flight. The next work arrives by cross-session message.
The d04 UAT (plan: `/Users/davidcruwys/dev/ad/brains/docs/handovers/deliver-2026-09-23-B587-B588-d04-uat.md`)
was at step 10 (the project folder rename) when last heard from.

## Progress
### Done (newest first; each is committed and pushed)
- [x] `711e315` — project identity is the CODE (`sameProject`, `src/shared/domain.ts`). Scripts
      survive a folder rename; `write_script` finds its set by flag and returns `order`
      (`n` = position). ADR-004 amended. Restarted live on 711e315 for d04 and verified.
- [x] `6e3f2da` — `stage_select` / `stage_get`: an agent can put a set or script on stage,
      refused `app_busy` while the talent moved in the last 2 min. The real busy signal is
      `src/core/stage.ts`. ADR-006.
- [x] `8d36664` — fli-core v0.7.0 agent-drivable layer. It projects the catalog with an authored
      snake→`family.verb` map, `/api/rpc`, `api/openrpc.json`, `/api/docs`, `/api/console`, the ★
      fence, `FAILURE_CODES`, the control-file helpers, `system_status/quit/restart`, and
      `will-quit` cleanup. ADR-005.
- [x] `243e255` — `docs/agent-drivable-audit.md` (read-only audit against FliCast's checklist).
- [x] `a5c44a7` / `9015c03` / `deef359` — doc set: schema mirror, SYSTEM.md, AGENT-NOTES.md,
      README refresh; all three doc gates exit 0.
- [x] `806729c` — `write_script`: scripts on demand, many named scripts per project (B585). ADR-004.
- [x] `cc703ec` — an empty project opens empty, not on the remembered set. ADR-003.
- [x] `7e412ba`, `e0af131`, `f9412d1` — fli-core window state, dock-icon (`activate`) fix, pin bumps.

### Pending — waiting on David
- [ ] **`CLAUDE.md` still states the absolute rule** "neither the talent's selection nor the
      arrangement they open on is the agent's to forge". ADR-006 narrowed it (agents may stage while
      the talent is idle). It needs a one-line pointer to ADR-006. **Not edited: `CLAUDE.md` changes
      need David's OK.** Also stale there: "`npm test` # 382 tests" (it is 423) and "The chat that
      writes them is L19" (it is Scribe).
- [ ] **North Star disagrees with the code:** `docs/north-star.md` says Teletubby "never touches a
      file" (it writes `fli.tubby.json`) and "does not edit them" (David now says it shows AND edits).
      Reported, not fixed.

### Optional, low priority
- [ ] Bump `@flivideo/core` to v0.7.3 and make `src/core/fli-zod.ts` a plain
      `import { z } from '@flivideo/core'`. That removes the `node_modules` path import. The
      zod3→JSON Schema rebuild must STAY: Teletubby's `INPUT` is zod 3.
- [ ] The schema-mirror extractor does not read the `INPUT` object (every verb's input schema is
      "declared but not read"). The defect belongs to dev-team; it was reported to flivideo-orch.

## Before starting the next step
- **Never restart or start the app without an explicit go** from David or the orchestrator while a
  UAT or recording run is live. Main-process changes need a restart, which means announcing it
  first.
- Every CLI call: `node bin/teletubby.mjs call <verb> --input '<json>' --as agent:<name>`. In zsh,
  do not put the command in a variable (`$T` is one word).
- After changing a verb, field or refusal code: run `npm run api:openrpc`, regenerate the schema
  mirror (`extract_typescript.py` + `render_mirror.py`), and run the three doc gates
  (`verify_mirror.py`, `check_context.py`, `check_readme.py --ref origin/main`).

## Ruled out this window
- **Renaming every verb to `family.verb`** for fli-core: it breaks the CLI, the skill, the renderer
  and peer callers at once. The authored two-name map is used instead (ADR-005).
- **Hand-writing zod 4 copies of `INPUT`**: two truths that drift. The JSON Schema rebuild is used
  instead.
- **Busy = a fresh `set_active_context`**: the renderer never calls it, so that busy never fired.
  Busy is now the window's own `remember_layout` position changes (ADR-006).
- **Making `set_active_context` agent-callable** to fix the wrong-set bug: it forges the talent's own
  selection. `stage_select` (a request the window honours) is used instead.
- **`app.relaunch()` for restart**: it dies with `electron-vite dev`. It spawns a detached
  `scripts/app.sh restart` instead.
- **Opening the project's on-demand set in preference automatically**: that guesses intent. An
  explicit agent request is used instead.
- **Matching projects by folder name**: a rename orphans the scripts. Matching is by project code
  (`d04`), per the flivideo-orch ruling.
