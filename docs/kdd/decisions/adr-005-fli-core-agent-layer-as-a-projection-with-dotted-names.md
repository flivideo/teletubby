---
adr: 005
title: The fli-core agent layer is a projection of the catalog, with authored family.verb names
status: accepted
date: 2026-09-23
files:
  - src/core/agent-layer.ts
  - src/core/zod3-json-schema.ts
  - src/core/fli-zod.ts
  - src/core/index.ts
  - src/main/control-server.ts
  - src/main/index.ts
  - test/agent-layer.test.ts
  - api/openrpc.json
---

# ADR-005 — The fli-core agent layer is a projection of the catalog, with authored family.verb names

## Context

David ruled GO on 2026-09-23: FliStudio adopts fli-core v0.7.0's agent-drivable layer first, then
Teletubby, then FliCut. The layer consists of contracts, the ★ fence, refusal codes, the control
file, JSON-RPC, the OpenRPC spec, the docs page and console, and the lifecycle verbs. Two facts made
a straight port impossible:

1. **fli-core requires `family.verb` names** (`/^[a-z][a-z0-9-]*(\.[a-z][a-zA-Z0-9-]*)+$/`). Every
   Teletubby verb is snake case (`list_sets`, `write_script`), published on `/api/invoke`, in the
   CLI, in the `flivideo:teletubby` skill, in the renderer, and already called by peer sessions.
2. **Teletubby's schemas are zod 3** (`z` via `@appydave/core`), while fli-core's contracts,
   `toOpenRpc` and the console are zod 4, and they read a schema's internals.

## Decision

- **A projection, not a second catalog.** `src/core/agent-layer.ts` builds the fli-core contracts
  from `CAPABILITIES`, and fails at import if any published verb lacks a dotted name.
- **An authored name map, both names live.** `/api/invoke` and the CLI keep the snake names;
  `/api/rpc`, `api/openrpc.json`, `/api/docs` and `/api/console` use `family.verb`. No caller
  breaks. The map is written by hand, never derived, so renaming a verb cannot silently rename its
  method.
- **`INPUT` stays THE schema.** It is converted to JSON Schema (`zod3-json-schema.ts`) and rebuilt
  with fli-core's **own** zod 4 (`fli-zod.ts`, `fromJSONSchema`), so the spec describes the same
  object that refuses a bad call. A test fails if any field falls through the converter.
- **The ★ is derived from the surface gate.** A verb the catalog allows only `ui` is
  `humanOnly: true`: `set_active_context`, `remember_layout`, `approve_pending`, `list_pending`.
  `authorize` runs in `core.invoke` beside the old gate. Anything over HTTP that names itself
  `human:*` is refused.
- **Busy means the talent is on the prompter.** *(Superseded by ADR-006: the renderer never set the
  selection, so this first cut never fired. Busy is now the talent moving within the last 2
  minutes.)* It was a selection touched within the last 5 minutes.
  Teletubby cannot see Ecamm; this is the honest signal it has. Quit and restart refuse `app-busy`
  while busy, and `force` is human-only.
- **Restart runs `scripts/app.sh restart`, detached.** `app.relaunch()` cannot survive
  `electron-vite dev`. A packaged build, which has no checkout, falls back to `relaunch()`.

## Rejected

- **Renaming every verb to `family.verb`.** It is cleaner, but it breaks every published caller at
  once. That is a separate, deliberate migration if David wants one.
- **Hand-writing 30-odd zod 4 schemas.** That would create two truths that drift.
- **`humanOnly: true` on quit.** fli-core's contract gives agents quit and restart when the app is
  idle; only `force` is a person's.

## Consequences

- `api/openrpc.json` is committed. `npm run api:check` fails when it is stale; `npm run api:openrpc`
  rewrites it. The refusal numbers are pinned append-only in `test/agent-layer.test.ts`.
- **Main-process changes need a real restart.** None of this reaches a running app until it is
  relaunched.
- If Teletubby ever moves to zod 4, `fli-zod.ts` becomes a plain `import { z } from 'zod'`, and the
  converter can go.
