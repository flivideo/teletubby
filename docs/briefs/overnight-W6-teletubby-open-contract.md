# W6 — Teletubby meets the open contract (launch args, brand/project context filters sets, `fli.tubby.json`)

**Purpose**: Teletubby starts pointed at a brand and project, filters its script sets by that context, and keeps the
project's script set as `fli.tubby.json` inside the project. Roadmap W6 — the smallest app change.

**For Agents**:
- You are the W6 **builder**, session `teletubby-w6`, model `claude-sonnet-5`, cwd
  `/Users/davidcruwys/dev/ad/flivideo/teletubby`. You run inside the GUI-session tmux (`aqua`). The orchestrator
  (Swagger, `flistudio-orch`) reads your evidence and holds the gate.
- David is asleep. Do not ask him. Decide from the documents; list decisions in your report.
- **Do not lose existing sets.** All three real sets are project-linked (roadmap §1.3). Before any code that can
  migrate or rewrite the store runs against a real file, back up
  `~/Library/Application Support/teletubby/teletubby.json` (if it exists — say if it does not) to
  `~/fli/lab/teletubby/backup-<YYYYMMDD-HHMM>/teletubby.json` and print the path.
- Written 2026-09-15 by Swagger from `flistudio/docs/runs/overnight-2026-09-15.md` §6 W6, roadmap §1.3 Teletubby row,
  §3 W6, open-contract §3–§4.

---

## 1 · Read first

1. `/Users/davidcruwys/dev/ad/flivideo/flistudio/docs/open-contract.md` — §2, **§3 + §3.1 (RULED)**, §4 Teletubby row
   (a set carries `project` = FliHub folder name; choosing the open set is UI-only *by design*), §5.
2. `/Users/davidcruwys/dev/ad/flivideo/flistudio/docs/roadmap.md` — §1.1 (D: `fli.tubby.json`), §1.3 Teletubby row
   ("talent profiles and rigs stay in Teletubby's own app store"), §3 W6 ("how it moves out of the app-settings store
   is decided in the task list" — decide it here), §3.1.
3. `/Users/davidcruwys/dev/ad/flivideo/flistudio/docs/specification.md` — §6.2 Teletubby row, R4, D1/D4, §11 #7.
4. `/Users/davidcruwys/dev/ad/flivideo/fli-core/README.md` + `src/index.ts` (`parseOpenArgs`, `readBrands`,
   `resolveBrandRoot`, `listProjects`, `resolveProject`, `appFileName`). Install as
   `"@flivideo/core": "github:flivideo/fli-core#v0.1.0"`.
5. This repo: `scripts/app.sh`, `src/main/index.ts` (`:77-82` store at `userData/teletubby.json`),
   `src/shared/domain-schema.ts:96-106` (set carries `project`), `src/shared/capabilities.ts` (`:180-190`
   `set_active_context` UI-only; `:211-218` `create_set`/`rename_set`), `src/core/input-shapes.ts:126-144`,
   `bin/teletubby.mjs`, `test/`, `vitest.config.ts`.

## 2 · Build

### A · Doors 2 and 3

- `scripts/app.sh start --brand <key> --project <folder>` → `FLIVIDEO_*` env → main process parses with
  `parseOpenArgs`, resolves through the library (`not-a-project` folders accepted as `membership: 'folder'` — sets
  today link by folder name), holds an `OpenContext` for the session (C2; never written into the store).
- **Context filters sets**: with a context, the set list the UI shows is filtered to sets whose `project` equals the
  open project folder (plus an "all sets" toggle). Missing context → today's unfiltered list, `context.missing`
  reported. Unresolvable → refuse and say why (C3).
- Door 3: capability `context_select { brand, project }` + `context_get` over the control API (7111) and
  `bin/teletubby.mjs`, same helper as startup (C1), no restart (C4), typed failures `missing` / `notFound` /
  `ambiguous`. **Do not** make `set_active_context` agent-callable — that withholding is by design (open-contract §4);
  the UI still picks the set. The contract's success state is: *a set attached to the project exists and the person
  picks it* (spec §11 #7).

### B · `fli.tubby.json` — the project's script set in the project (decide and document)

**Ruling (Swagger, from roadmap §1.3 + spec R4 + D1/D4)**: the project's script set becomes a file
**`<projectDir>/fli.tubby.json`** (via `appFileName({ app: 'tubby' })`) holding that project's **sets and scripts**;
**talent profiles and rigs stay in the app store** (`userData/teletubby.json`), referenced from the project file by id.
Relationship, stated in the README: *the app store is the index and the home of non-project things; a project file is
the source of truth for its own sets*. Mechanics:

- Reading: on startup and on context change, if `<projectDir>/fli.tubby.json` exists, its sets are loaded and shown
  for that project; the app store's copy of a set with the same id is treated as stale and **not** shown twice.
- Writing: edits to a project-linked set are written to `fli.tubby.json` (atomic write, relative paths); sets with no
  project stay in the app store as today.
- **Export, not migrate**: add a capability `set_export_to_project { setId }` (and a UI action) that writes an
  existing store set into the project's `fli.tubby.json` and marks the store copy `exportedTo: <folder>` — it never
  deletes the store copy. No automatic migration of the three real sets tonight; **list them** in your report with the
  exact CLI line David would run for each. (If, and only if, the export is tested on a temp copy of the real store and
  green, you may state that it is safe to run in the morning.)

### C · Contract tests — one per door (open-contract §3.1)

Fixture brand root + project in a temp dir; `HOME` and the brands file injected; store at an injected temp
`userData`; control server on an ephemeral port; no window:

1. Launch args → `context_get` reports the context; the set list is filtered to the project's sets.
2. `context_select` → the same body (deep-equal to 1); `teletubby.json` unchanged (C2).
3. Missing → `missing: [...]`, unfiltered list served.
4. Refusals bite: unknown brand / ambiguous project → typed failure, previous context unchanged.
5. `fli.tubby.json` round-trip: a set written to a fixture project reads back equal; the app store copy is not duplicated in the list.
6. `set_export_to_project` on a fixture store copy writes the project file and leaves the store copy in place with `exportedTo`.

Existing `npm test`, `npm run typecheck`, `npm run lint` stay green; thresholds not lowered.

## 3 · Hard rules

- Tests never touch the real `~/Library/Application Support/teletubby`, `~/.config/appydave`, `~/.fli` or
  `/Users/davidcruwys/dev/video-projects`. Back up the real store before any code that could touch it (header).
- Do not kill processes you did not start (`lsof -nP -iTCP:7111 -sTCP:LISTEN` first). One windowed smoke start via
  `scripts/app.sh start` at the end is allowed, then `scripts/app.sh stop`.
- `@flivideo/core` only via the pinned tag; no `file:` path; no new runtime deps beyond it.
- Commit small conventional commits to `main`; push after each green slice. Commit this brief first.

## 4 · Done — your final report (raw data)

1. `git log --oneline <start>..HEAD`.
2. Tails of `npm test` (+ coverage table if configured), `npm run typecheck`, `npm run lint`.
3. The six contract-test names with pass lines.
4. The backup path of the real store (or "no store file existed").
5. The three real sets and the export line for each. **Deferred**, **Decisions**, **anything this brief got wrong**.
6. One line: `APPYNET: done — <doors, filter, fli.tubby, export; tests>` or `APPYNET: blocked — <why>`.
