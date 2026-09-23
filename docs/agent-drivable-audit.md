# Teletubby — agent-drivable audit against the FliCast reference

**Status**: read-only audit, 2026-09-23. True at `a5c44a7`. Nothing was built and the app was not
started. The reference checklist is
`/Users/davidcruwys/dev/ad/flivideo/flicast/docs/agent-drivable-reference.md` (flicast `dd157ad`).
The Teletubby side comes from reading the code only.

**Grades**: HAVE · PARTIAL · MISSING · N-A. **Effort to close**: S (hours) · M (a day or two) ·
L (several days).

## Verdict

Teletubby already has the hard part: **one capability core that the UI, the HTTP door and the CLI
all go through**, with a pinned surface, dry runs, idempotency keys, a UI-only fence and the open
contract. What it lacks is the *projections* FliCast adds on top of that core: an MCP server, a
generated spec, a self-served docs page, an in-app console, an event stream, and undo. It also
has no way to be quit or restarted except from a shell.

## Can an agent quit or restart Teletubby today?

**Only from a shell, never through the app.**

| Action | Through the door / CLI | Through a shell | Human only |
|---|---|---|---|
| Is it up? | `GET /api/health` (no token), `teletubby health` | `npm run app:status` → `scripts/app.sh status` | — |
| Start on a project | — (the app must be up to answer) | `scripts/app.sh start [--brand <k> --project <folder>]` | — |
| Re-point while running | `context_select { brand, project }` | — | — |
| Logs | — (no log verb) | `scripts/app.sh tail` (snapshot) or `logs` (follows without end; do not use from an agent) | — |
| **Quit** | **No verb.** Nothing on `/api/*` or in the CLI stops the app | `npm run app:stop` → `scripts/app.sh stop` (`overmind quit`, falling back to `overmind kill` after 15 s) | ⌘Q |
| **Restart** | **No.** | `scripts/app.sh restart` (stop, then start) | — |
| Bring to front | — | — (no `show` command) | click the dock icon (recreates the window since `7e412ba`) |

Evidence: `scripts/app.sh:143-150`, `src/main/control-server.ts:125-189` (three routes only),
`bin/teletubby.mjs`. A shell stop is safe to run: it goes through overmind, so it never needs
`pkill -f electron`, which would match other Fli apps.

## The checklist

### 1 · The core

| Item | Grade | Evidence | To close |
|---|---|---|---|
| One capability core; every edit is a named verb; a test fails on an unannounced verb | **HAVE** | `src/shared/capabilities.ts` (catalog: kind, side effects, principals, failure modes), `src/core/index.ts` (`core.invoke`, the one seam), `test/capability-surface.test.ts` (pins the UI and agent surfaces) | — |
| The UI is a client of the core, never an editor | **HAVE** (no boundary test) | The renderer reaches data only through `window.appytron.invoke` (`src/renderer/src/App.tsx`). Selection and layout are verbs too (`set_active_context`, `remember_layout`). No `test/renderer-boundary`-style guard | S: a test that fails if the renderer imports `@shared/script-set` or writes outside `invoke` |
| Dry run, undo, idempotency on every command | **PARTIAL** | `dryRun` and `idempotencyKey` are on by default for commands (`capabilities.ts:132-149`, `core/index.ts:121-167`). Destructive verbs go preview → approve → execute (`src/core/safety.ts`). **No undo:** handlers return `previous` and the prior state goes to the audit log (`core/index.ts:159`, `safety.ts:300`), but there is no `undo` verb and no per-principal history | M: a history ledger plus `history.undo` scoped by principal |
| Long work is a Task | **N-A** | No verb is slow. Scripts are small JSON writes, and there is no export, render or audio job | — (revisit if an import or scoring job appears) |

### 2 · The doors

| Item | Grade | Evidence | To close |
|---|---|---|---|
| HTTP control door on loopback | **PARTIAL** | `127.0.0.1:7111`: `GET /api/health`, `GET /api/capabilities`, `POST /api/invoke` (`control-server.ts:125-189`). No JSON-RPC route, no `/events` stream, a fixed port (no `0` / environment override in production), and the routes are `/api/*` rather than `/v1/*` | M: `/v1` aliases, JSON-RPC, and an ND-JSON event stream over `core.onChange` |
| Auth by a per-launch token in a control file | **HAVE** | 32-byte token, constant-time compare, 401 names the file (`control-server.ts:80-142`). `~/Library/Application Support/teletubby/control.json` holds port and token. The principal is fixed to `agent` by the adapter (`:174`), so a caller **cannot name itself** (`agent:<name>` like FliCast) | S: an optional caller label recorded in the audit, never widening the principal |
| A CLI that is only a client of the door | **PARTIAL** | `bin/teletubby.mjs`: `health`, `capabilities` (generated from the running app), `call <verb> --input`. Refuses a stray positional. No per-verb `--help`, no `--dry-run` / `--idempotency-key` / `--json` flags (they go inside `--input`) | S: generate per-verb help from `/api/capabilities`, and map the flags to the envelope |
| An MCP server (describe + call) | **MISSING** | No `bin/*-mcp.mjs`, no `.mcp.json` | S–M: two tools (`teletubby_describe`, `teletubby_call`) forwarding to `/api/invoke`, plus a few curated ones (`list_sets`, `write_script`, `context_select`) |
| A Claude skill that speaks the CLI | **HAVE** (hand-written) | `flivideo:teletubby` (`~/dev/ad/appydave-plugins/flivideo/skills/teletubby/SKILL.md`). It points at `teletubby capabilities` as the authority rather than copying the verb list, which avoids the stale-copy problem without a generator | — |

### 3 · Swagger-like: the self-describing surface

| Item | Grade | Evidence | To close |
|---|---|---|---|
| A machine-readable spec | **PARTIAL** | `describe_capabilities` / `GET /api/capabilities` returns every verb with its contract and **per-verb input shapes derived from the same zod schema that validates the call** (`src/core/input-shapes.ts`, pinned in `test/input-shapes.test.ts`). It is JSON of Teletubby's own shape, not OpenRPC. No committed spec file, no `--check` | M: an `api/openrpc.json` generator from the catalog plus `INPUT`, and a `--check` script |
| A human reference page served by the app | **MISSING** | No `/docs` route, no generated HTML | S once the spec exists (render it, serve it unauthenticated and read-only) |
| Pick a verb, fill the fields, fire — inside the app | **MISSING** | No console window or page | M–L: a console window with a narrow preload, calling as `agent` so the UI-only fence refuses in front of the reader |

### 4 · Refusals are data

| Item | Grade | Evidence | To close |
|---|---|---|---|
| Named failure modes, stable codes, typed details | **PARTIAL** | Named string codes (`ERROR_CODES`, `capabilities.ts:59`) mapped to HTTP statuses. `details` is carried (`safety.ts:44-63`) and several refusals already give enough to retry: `available` set ids, `refused` context, open-contract `details`, `unreadable`. There are **no stable integer codes** and `details` is untyped (`unknown`) | M: a typed details schema per failure mode; integer codes only if the suite standardises on them |

### 5 · Context: brand / project / video

| Item | Grade | Evidence | To close |
|---|---|---|---|
| Launch pointed at a project, re-point while running | **HAVE** (no `--video`) | Door 2 is `scripts/app.sh start --brand --project` (the environment variables into `parseOpenArgs`, `src/main/index.ts`). Door 3 is `context_select`. Refusals use the suite's codes and never move the context (`src/core/open-context.ts`, `test/open-contract.test.ts`). **No `--video` argument**: a script only carries an optional video *tag* (ADR-004) | S to accept and record `--video`; wanting more is a product ruling, not a gap |
| Say what is active | **HAVE** | `context_get` (the project, with `refused`) and `get_active_context` (which set, script and transcript the talent is on, with a staleness TTL) | — |

### 6 · Lifecycle — see the table above

| Item | Grade | To close |
|---|---|---|
| Quit / restart through the door | **MISSING** (shell only) | S: an agent-callable `app_quit` that runs the same graceful stop, but it has to be refused during a take, which needs a "recording" signal Teletubby does not have (Ecamm records). A quit that could land mid-take is the reason to keep it human or shell-only for now |
| Logs through the door | **MISSING** | S: `system_logs { tail }` reading `.logs/app.log` |
| Bring to front | **MISSING** | S: `app.sh show` (`open -a`) |

### 7 · The launcher

| Item | Grade | Evidence |
|---|---|---|
| Runs as its own bundle, started by LaunchServices | **N-A** | Teletubby needs no macOS privacy (TCC) grant: no screen, camera or microphone capture. It runs under overmind (`Procfile`, `scripts/app.sh`), which is fine for an app with no grant to misattribute |

### 8 · The test harness

| Item | Grade | Evidence | To close |
|---|---|---|---|
| A fake engine beneath the real app | **N-A** | There is no hardware or capture engine to fake | — |
| uat stories drive the BUILT app over CDP, controls located by verb | **MISSING** | No `uat/`, and no `data-verb` attributes in `src/renderer`. The renderer is tested through pure store functions (`test/setup-panel.test.ts`, `test/prompter-navigation.test.ts`), which is why "look at the window" is a written rule | L: `data-verb` on every control, a CDP harness, and a self-test story that must fail |
| Isolated homes | **PARTIAL** | Suites that touch `@flivideo/core` own a temporary `HOME` (`test/open-contract.test.ts`, `test/write-script.test.ts`), and the store is a temp file per test. There is no launch-level isolated environment for the built app, and `userData` is not overridable (`src/main/index.ts:115`) | S–M: a `TELETUBBY_HOME` override for `userData` and `control.json`, used by any future harness |

### 9 · Agent-safety rules

| Item | Grade | Evidence |
|---|---|---|
| A fence in the core | **HAVE** | Four UI-only verbs (`approve_pending`, `list_pending`, `set_active_context`, `remember_layout`): the agent surface excludes them, and the gate enforces it beneath every adapter (`src/core/safety.ts`). Destructive verbs require an approval that only the UI can give |
| No OS keystrokes or clicks to drive the app | **HAVE** (by rule) | Everything is a verb. The rule is in CLAUDE.md and has been kept in every session so far. No harness enforces it |
| Privacy by construction | **N-A** | Teletubby captures no typing, audio or screen |
| Never `pkill -f electron` | **HAVE** | Stop is `overmind quit`. CLAUDE.md warns that `pgrep -f "electron-vite dev"` is ambiguous on this machine (FliCut runs the same command line) |

### 10 · Shared through `@flivideo/core`

Already using the shared pieces (pinned to fli-core `v0.4.1`): `parseOpenArgs`, `readBrands` /
`resolveBrandRoot` / `listProjects` (open context), `appFileName` (`fli.tubby.json`), and
`placeWindow` / `loadWindow` / `trackWindow` (window state). Teletubby's resolver is looser than
fli-core's `resolveOpenContext` (it accepts plain folders), for the same reason FliCast's is; both
move to fli-core when `acceptFolders` ships. **Not used, and not needed yet**: `labPath`,
`videoFolderName` / `videoFileName`. The D15 video tag is stored verbatim and never resolved.

## Order I would close the gaps in

1. **MCP server** (S–M). Every agent then reaches every verb with no curl or CLI knowledge. This is
   the largest gain for the least work, because the core is already there.
2. **Generated spec + self-served docs page** (M). This is the "Swagger" David asked for, and it
   comes almost for free from the catalog and `INPUT`, which already publish input shapes.
3. **Event stream** (S–M) over the existing `core.onChange`, so an agent can watch instead of poll.
4. **Undo + per-principal history** (M). The `previous` values are already returned.
5. **Console window** and the **uat / `data-verb` harness** (L) last. They pay off once the surface
   stops changing.

Lifecycle through the door (quit / restart) should stay shell-only until there is a way to know a
take is in progress. That needs a ruling from David, not a build.
