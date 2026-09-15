# W6 review — Teletubby open contract (80f76cf)

Verdict: FINDINGS (7 blocking, 7 minor)

Reviewer: session `teletubby-w6-review`, `claude-opus-5`, 2026-09-16. Method: `agent-skills:code-review-and-quality`
(five axes). I read every line of the four builder commits `463396c..80f76cf`: `open-context.ts` and
`project-store.ts` in full, the `handlers.ts` diff in full, plus the renderer's `list_sets` / refresh path that the
change now feeds. Behaviour probes ran against the real `src/core` in a scratch vitest config. They used a temp
`HOME`, a temp store and a temp brand root, never the live estate. Nothing in the repo was edited except this file,
nothing was committed, and the app was not started.

**Summary for Swagger.** Both doors are there and the resolver is solid: C1, C2, C3 on the context itself, C4, the
R31 code rule over plain folders, and `set_active_context` still UI-only. The tests are green and typecheck passes.
The `fli.tubby.json` write path is not safe to point at the real store.

- **Any write** while a context is open moves **every** store set attached to that project into the project file and
  **deletes the store copies** (F1).
- A **dry run** does the same, **without writing the project file**, so the set is simply gone (F2).
- Re-exporting reverts newer project edits (F3).
- An exported set is still editable with no context open, and those edits are silently shadowed later (F4).
- On the UI side, there is no "all sets" toggle (F5), and a door-3 `context_select` can swap the set on stage in front
  of the talent (F6).
- Door-3 refusals return HTTP 200, where FliHub (W3) returns 4xx (F7).

⚠️ **Until F1 and F2 are fixed, nobody should launch the real app with `--brand/--project`, or run `context_select`
against it.** The three real sets are all attached to projects. With a context open, the first edit of any kind (even
a dry run) strips the open project's set out of `teletubby.json`.

---

## Findings

### F1 · Any write with a context open moves every project-attached store set out of the store and deletes it there — BLOCKING

`src/core/handlers.ts:227-268` (`projectAwareUpdate`: `visible` → `fn` → `toProject` / `toStore` split).

- **What is wrong**: the split routes **every** set in the merged document whose `project === openContext.project`
  to `fli.tubby.json`, and drops it from the store document. That covers sets the handler never touched and sets
  that were never exported. Probe P1:
  - store `[a(P), b(P), c(no project)]`, `context_select P`, then `rename_set c`
  - result: store `['c']`, project file `['a:a', 'b:b']`
  - after a "restart" with no context (a new core on the same store), `list_sets` → `['c']`, so `a` and `b` have
    disappeared from the app
- **Why it matters**:
  - The brief's binding ruling is "**export, not migrate** … never deletes the store copy" and "no automatic migration
    of the three real sets".
  - CLAUDE.md and the commit say a set "moves … the next time it is written, one edit at a time". It actually moves on
    the next write to *anything*, and every attached set moves at once.
  - All three real sets are project-linked (backup: `kybernesis-phase-1` → `a01-kybernesis-12-videos`,
    `cutty-audio-cleanup` → `d02-…`, `cutty-presenter-tracking` → `d03-…`).
  - A normal launch (`npm run app`, no args) after one launched session would show none of the moved sets. The
    review brief's regression rule is "sets must not be lost".
- **Fix**:
  1. In `projectAwareUpdate`, route a set to the project file only if its id is **already in the project file**
     (`beforeIds`). Every other set goes back to the store exactly as the handler returned it. A store set enters
     `fli.tubby.json` only through `set_export_to_project`, the one explicit move.
  2. If "edits to a project-linked set are written to fli.tubby.json" must stay lazy, move **only sets whose content
     the handler changed** (compare JSON per id before and after). Keep the store copy, taken from *before* the edit,
     and mark it `exportedTo`, which is exactly the export semantics. Never drop it. Option 1 is simpler and is my
     recommendation.
  3. Correct the CLAUDE.md "moves … the next time it is written" paragraph to match.
  4. Test (`open-contract.test.ts`): store `[a(P), b(P), c]`, context P, `rename_set c`. Assert that the store still
     holds `a` and `b` byte-for-byte and that no project file exists. Then a new core with no context lists all three.

### F2 · A dry run with a context open deletes the project's sets outright — BLOCKING

`src/core/handlers.ts:227-268`: the split runs on the dry-run path, and only the project-file write is skipped
(`:264`).

- **What is wrong**: on a dry run, `fn` returns the document unchanged, but the split still removes the attached sets
  from the store document, and `repository.update` persists that. The comment at `:261-263` guards only the project
  file. Probe P1b:
  - store `[a(P), c]`, context P, `create_set { dryRun: true }` → `ok: true, applied: false`
  - store `['c']`, project file `ABSENT`
  - Set `a` exists nowhere.
- **Why it matters**: this is real data loss from a call whose whole contract is "change nothing" (spec: a preview
  never writes). Every dry-run-capable set write goes through this path: `create_set`, `rename_set`, `create_script`,
  `update_script`, `write_transcript` and `write_trigger_set`. An agent previewing an edit against a launched app
  therefore erases the talent's set. Delete previews are not affected, because `guardedDelete` returns before
  `execute`.
- **Fix**:
  - In `projectAwareUpdate`, `if (context.dryRun) return { document: storeDocument, result }`. Return the untouched
    store document, never the split.
  - The F1 fix shrinks the blast radius, but this guard is needed anyway.
  - Test: context P, store `[a(P)]`. Run a dry-run `create_set`, then a dry-run `write_trigger_set`. Assert the store
    file is byte-identical and there is no project file.

### F3 · Re-exporting overwrites newer `fli.tubby.json` edits with the stale store copy — BLOCKING

`src/core/handlers.ts:586-649` (`set_export_to_project`: reads the set from the **store**, then
`existing.filter(id !== …)`, then appends).

- **What is wrong**: nothing checks whether the set was already exported. Probe P2:
  - export `a` → project `['a:a']`
  - `rename_set a 'edited-in-project'` → project `['a:edited-in-project']`, store copy unchanged, as designed
  - `set_export_to_project a` again → `ok: true`, project `['a:a']`
  - The project edit is gone, with no preview and no confirmation.
- **Why it matters**: the project file is declared the source of truth for its sets. A second export, from an agent
  retrying or from David running the morning line twice, silently reverts it. This is destructive, yet it is not
  `preview → confirm → execute` (CLAUDE.md, destructive verbs).
- **Fix**:
  - Refuse with `conflict` when the store copy already carries `exportedTo`, **or** when the project file already
    holds that id: "already exported to <folder>; the project copy is live".
  - Make a same-id re-export an explicit, separate choice if it is ever needed, never the default.
  - Test: export, edit, re-export → `409`, and the project file keeps the edit.

### F4 · An exported set is still listed and editable with no context; those edits land on the frozen copy and are shadowed — BLOCKING

`src/core/handlers.ts:205-213` (`effectiveDocument` only merges when a context is open) and every write handler
(nothing checks `exportedTo`).

- **What is wrong**: probe P3, after exporting `a`, then a new core with no context:
  - `list_sets` → `a`, with `exportedTo: 'd02-fixture-project'`, shown as a normal set
  - `rename_set a 'offline-edit'` → `ok: true`, and the store copy's title changes
  - `context_select P` then `get_set a` → title `a`: the edit is invisible from then on
- **Why it matters**:
  - CLAUDE.md says the exported store copy is "frozen history, never shown again". It is shown, and it is writable.
  - The talent opening Teletubby the ordinary way (`npm run app`) after an export reads the **stale** copy, and an
    agent editing it loses the work the moment FliStudio opens the project. That is a lost edit, which is the "sets
    must not be lost" rule.
- **Fix**:
  1. Every write handler that resolves a set refuses with `conflict` when the resolved **store** set has `exportedTo`
     and no matching context is open: "set lives in <folder>/fli.tubby.json; open Teletubby at that project".
  2. Correct the CLAUDE.md "never shown again" sentence.
  3. Test: export, then a new core with no context, then `rename_set` → `409`, and the store copy is unchanged.
- **For Swagger, not the builder**: should a plain launch with no context show an exported set's frozen store copy at
  all? It cannot read the live copy, because `ScriptSet` stores a folder name but no brand. That needs a ruling (hide
  it, show it read-only, or record the brand beside `exportedTo`). The write refusal above is needed whichever way it
  goes.

### F5 · The UI has no "all sets" toggle; a `--project` launch hides every other set, and a project with no sets is a dead end — BLOCKING

`src/renderer/src/App.tsx:67-80` (calls `list_sets` with no input), `:116-120` ("No script sets in the store." when the
filtered list is empty). No renderer file was touched by the builder's commits.

- **What is wrong**:
  - `list_sets` now filters by default. The renderer never passes `allSets`, and nothing in the setup panel offers it.
  - Launched with `--project <folder>`, the setup panel's project list holds only that project's sets.
  - Launched at a project with **no** attached set, the stage fails with "No script sets in the store." even though
    the store has sets.
  - Also missing: the brief's "UI action" for export.
- **Why it matters**:
  - Brief §2A: "filtered to sets whose `project` equals the open project folder (**plus an "all sets" toggle**)".
  - Spec §11 #7's success state is "a set attached to the project exists and **the person picks it**". Picking is the
    talent's, so the panel must be able to reach every set.
  - Commit `2f65ebc` ("an empty project is no longer a dead end") regresses for exactly the launched case.
- **Fix**:
  - The setup panel fetches with `allSets: true` and offers a two-state filter (this project / all sets), defaulting
    to this project when a context exists.
  - An empty filtered list falls back to showing all sets with a one-line "no set attached to <project>" note, never
    `setFailure`.
  - Add an export action on a set row, shown only when the set's `project` equals the open context.
  - Test in `setup-panel.test.ts`, or a store test, for the empty-filter fallback.

### F6 · A door-3 `context_select` can swap the set on stage in front of the talent — BLOCKING

`src/renderer/src/App.tsx:136-143` (`onControlChanged` → filtered `fetchSets` → `sets[0]` fallback → `refresh`);
`src/shared/capabilities.ts:208-220` (`context_select` is a command with the default `announces: true`).
`[code reading: the renderer was not run]`

- **What is wrong**:
  1. A successful `context_select` announces a change.
  2. The window re-fetches `list_sets`, which is now filtered to the new project.
  3. If the set on stage is not in that project, `currentId` is not found, and `target = sets[0]` is a **different
     set**.
  4. `refresh(otherSet)` keeps `scriptId` when the other set has a script with the same id (`01`…), so the talent
     silently changes set with no cue.
  - Probe P8: two identical `context_select` calls fire **two** change events, so even a no-op re-point from FliStudio
    runs this path.
- **Why it matters**:
  - CLAUDE.md: "a refresh must never move the talent".
  - Open-contract §4 Teletubby row and the brief: choosing the open set is **UI-only by design**. Door 3 is agent
    reachable, so this path gives an agent the power `set_active_context` withholds.
  - Mid-take, it breaks the live-instrument rule.
- **Fix**:
  - The change listener fetches `allSets: true`, and **never** falls back to a different set. If the current id is
    gone, it keeps what is on stage and marks it.
  - `context_select` returns `applied: false`, so it does not announce, when the resolved context deep-equals the held
    one. Better still, give it `announces: false` and push a separate context-changed signal that re-fetches only the
    set list.
  - Test: a core-level test that an identical re-select fires zero change events.

### F7 · Door-3 refusals return HTTP 200 and CLI exit 0; FliHub (W3) returns 400/404/409 — BLOCKING (cross-app contract)

`src/core/handlers.ts:392-400` (a refusal is a success payload), `src/shared/capabilities.ts:208-220`
(`failureModes: ['invalid_input']` only); `bin/teletubby.mjs:193` (exit code from status).

- **What is wrong**: `context_select { brand: 'nope' }` → `200 { ok: true, data: { applied: false, refused: {…} } }`, and
  `teletubby call context_select …` exits `0`.
- **Why it matters**:
  - Open-contract §3 door 3: "API: `400` naming the missing field", with an error in `--json` mode.
  - The shared W3 ruling ("never for an API call from another app — **that caller already has the 4xx**").
  - W3 FliHub, already gated, returns `400` missing, `404` unknown-brand / project-not-found, `409` ambiguous
    (`flihub/server/src/test/openContract.test.ts:177-192, 303-304`).
  - FliStudio's W7 launch buttons will branch on status. A 200 here reads as "switched" unless W7 special-cases
    Teletubby, which is the per-app drift §3.1 exists to prevent.
- **Fix**:
  1. Keep `openContext.apply(resolution)`, so the refusal is recorded and `context_get` shows it.
  2. Then `fail()` with `details: { context, refused }`, mapped as:
     - `missing` → `invalid_input` (400)
     - `unknown-brand` and `project-not-found` → `not_found` (404)
     - `project-ambiguous` → `conflict` (409)
     - `no-brand-root` and `registry-unreadable` → `unavailable` (503)
  3. Publish those codes in `failureModes`.
  4. `src/main/index.ts:117` already only logs the result, so door 2 is unaffected.
  5. Tests 3 and 4 assert the status codes and `error.details.refused.code`.
  6. `list_sets.filter.missing` still reads from the holder.

### M1 · The contract tests are real but prove less than their names — MINOR

`test/open-contract.test.ts`.

- Test 1 ("launch arguments") calls `parseOpenArgs([...argv], {})` and then `context_select`. It never exercises
  `src/main/index.ts:116` (`process.argv` + `process.env`) or the `FLIVIDEO_*` env path. Add
  `parseOpenArgs([], { FLIVIDEO_BRAND, FLIVIDEO_PROJECT })` feeding the same assertions.
- Test 2 is "deep-equal to 1" in the brief, but it compares select #2 with select #1, not with the door-2 body. It also
  takes the C2 baseline **after** the first select, so a first select that wrote the store would pass. Probe P4 shows
  C2 does hold today: byte-identical measured from before the first select. Move `before` above the first call.
- R31 is required "0 / exactly 1 / 2+" (brief, W3 shared rulings), but only 2+ is tested. Probe P7 shows `d03` →
  resolves `d03-single`, `z99` → `project-not-found`, `../v-fixture` → `project-not-found`. The behaviour is right;
  pin it.
- `no-brand-root` and `registry-unreadable` are never exercised.

### M2 · Export marks the store before writing the project file; an unreadable project file breaks every read — MINOR

`src/core/handlers.ts:596-649`; `src/core/project-store.ts:46-72`; `effectiveDocument` at `:203-212`.

- **What happens**: probe P6 (`fli.tubby.json` is a directory) → export fails `internal`, but the store copy is
  already `exportedTo`. Probe P5 (corrupt JSON) → `list_sets { allSets: true }` fails `internal`, and so does every
  read.
- **Fix**:
  - Write the project file first, then mark the store.
  - For reads, let `allSets` and any set not attached to the open project still answer, with the unreadable project
    file reported in `filter`. R12-style: say what could not be read, rather than failing the whole list.

### M3 · `fli.tubby.json` is read outside the store's serialisation and written after it — MINOR

`src/core/handlers.ts:227-267`.

- **What happens**: `before` is read before `repository.update` takes its queue, and the project file is written after
  that queue has released. Two concurrent writes to project sets (the UI plus an agent) can each read the same
  `before` and the last write wins. `[reasoned, not run]`
- **Fix**: serialise project-file writes through one per-`projectDir` promise queue, and re-read inside it.

### M4 · `npm run lint` does not exist, and there is no coverage threshold — MINOR (not a builder defect)

`package.json:14-32`.

- **What happens**: both briefs require lint "green", and the run report already notes the absence. With no
  threshold, "not lowered" holds trivially.
- **Swagger**: rule whether W6's gate accepts typecheck as the static check, or whether a lint config lands first.

### M5 · Docs claim behaviour the code does not have, and point at a report that is not in the repo — MINOR

`CLAUDE.md` § "The open contract".

- "moves to `fli.tubby.json` the next time it is written": false (F1).
- "frozen history, never shown again": false (F4).
- "See the W6 build report for the exact `context_select` + `set_export_to_project` CLI lines": no such file exists
  in the repo or under `flistudio/docs/runs/`. The lines would need a brand key, and `ScriptSet` records none.
- **Fix**: correct the two sentences after F1 and F4. Put the three export lines, with their brand keys, in the repo
  (for example `docs/briefs/overnight-W6-teletubby-open-contract.md` §Report), and mark them **do not run until F1–F4
  are fixed**.

### M6 · `scripts/app.sh --brand` with no value dies on `set -u`; env reaching Electron through overmind is unproven — MINOR

`scripts/app.sh:130-136`.

- **What happens**: `app.sh start --brand` → `$2: unbound variable` instead of the usage line.
- **Fix**: `[ $# -ge 2 ] || { echo "usage: …"; exit 2; }` in both branches.
- **Not established**: that `FLIVIDEO_*` survive `overmind start` into the tmux-hosted `npm run dev`. The code path
  looks right, but nothing tests it. Swagger's smoke start ran with no args. One smoke start with args, then
  `teletubby call context_get`, proves it.

### M7 · An invalid `~/.fli/machine.json` is silently ignored — MINOR

`src/core/open-context.ts:170-172`.

- **What happens**: `machineResult.kind === 'invalid'` → `machine = null`, so a `brandRoots` override (an external
  drive) is dropped and the registry root is used without a word. The context resolves to the **wrong folder** rather
  than refusing.
- **Fix**: on `invalid`, refuse `no-brand-root` with the parse message. That is C3: never silently fall back.

---

## Deferrals and departures, ruled

- **Own resolver instead of `@flivideo/core`'s `resolveOpenContext`: accepted.** v0.1.0's resolver refuses a folder
  with no `fli.studio.json` (`project-refused / not-a-project`). The brief rules that such folders are accepted as
  `membership: 'folder'`. The code uses the library for every rule it can: `readBrands`, `readMachineSettings`,
  `resolveBrandRoot`, `listProjects`, `parseOpenArgs`, `appFileName`. The refusal-code table is in CLAUDE.md. C1
  holds: door 2 (`src/main/index.ts:116-120`) calls the same `context_select` capability as door 3. When fli-core
  gains a `allowPlainFolders` option, fold this in.
- **Refusal shape `{ applied, context, refused? }`: accepted as the body, not as the status** (F7).
- **Refusal on screen for a launch: not built, accepted for W6.** It is logged (`src/main/index.ts:120`), and
  `context_get` exposes it. A UI line is a follow-up, not a gate item.

## Conformance table

| Requirement (brief / contract) | Verdict | File |
|---|---|---|
| Backup of real store before any code touches it | conforms: `~/fli/lab/teletubby/backup-20260916-0055/teletubby.json` exists, 286,927 bytes, 00:55 (listed read-only). Byte-identity after the smoke was not re-checked by me (the live store is off-limits); Swagger's report asserts it | — |
| `app.sh --brand/--project` → `FLIVIDEO_*` → `parseOpenArgs` | conforms in code (M6 edge; overmind env path unproven) | `scripts/app.sh:123-147`, `src/main/index.ts:112-120` |
| One helper for both doors (C1) | conforms | `src/main/index.ts:116`, `src/core/handlers.ts:392-400` |
| Context never persisted (C2) | conforms: probe P4 byte-identical from before the first select (M1: the test's baseline is weak) | `src/core/open-context.ts:237-254` |
| Typed refusal, previous context untouched (C3) | conforms for the context (test 4, P4); **deviates** on transport (F7); silent machine-settings fallback (M7) | `src/core/open-context.ts:125-219` |
| Re-point without restart (C4) | conforms at the core; the renderer side moves the talent (F6) | `src/core/handlers.ts:392-400` |
| `set_active_context` not agent-callable | conforms: `AGENT_SURFACE` omits it, and `capability-surface.test.ts` pins it (47 pass) | `test/capability-surface.test.ts:65-90` |
| R31 over members + plain folders: 0 / 1 / 2+ | conforms (P7 + test 4); 0 and 1 untested (M1) | `src/core/open-context.ts:80-117` |
| Filter by project; "all sets" toggle; missing → unfiltered | API conforms (`allSets`, `filter.missing`, test 3); **UI toggle absent** (F5) | `src/core/handlers.ts:404-427` |
| `fli.tubby.json` read on context; no duplicate by id | conforms (test 5, test 6) | `src/core/handlers.ts:194-213` |
| Project-linked edits written there, atomic, relative paths | atomic via `@appydave/core` `atomicWrite`; no paths stored, so D4 holds trivially. **Deviates**: moves unrelated sets and deletes store copies (F1), dry run deletes (F2), lock (M3) | `src/core/handlers.ts:227-268`, `src/core/project-store.ts:75-83` |
| `set_export_to_project` writes project file, keeps store copy with `exportedTo` | conforms on first export (test 6, P9); **deviates** on re-export (F3), on a no-context edit (F4), and in its write order (M2); UI action absent (F5) | `src/core/handlers.ts:586-649` |
| No automatic migration of the three real sets | conforms **only while nobody opens a context** (F1, F2) | — |
| Six contract tests, real, temp `userData`/`HOME`/brand root | conforms: all six exist and assert behaviour (M1 gaps) | `test/open-contract.test.ts` |
| Tests never touch real paths | conforms: grep for `video-projects`, `Application Support`, `.config/appydave`, `/Users/davidcruwys`, `homedir`, `HOME` in `test/` hits only `open-contract.test.ts`'s own temp-`HOME` override and `/Users/placeholder` (A5 rewrite to the temp home). Positive control: the same grep finds those lines, so the search reads the file | `test/open-contract.test.ts:31-66` |
| `@flivideo/core` via pinned tag, no new runtime deps | conforms: `github:flivideo/fli-core#v0.1.0`, the only added dependency | `package.json:35` |
| Existing tests/typecheck/lint green, thresholds not lowered | tests 325/325, typecheck 0; **lint script absent**; no coverage threshold exists (M4) | — |
| Touched existing files: no out-of-brief change | conforms: `capabilities.ts`, `input-shapes.ts`, both surface tests, `core/index.ts`, `domain*.ts` and `app.sh` diffs are additive. One test line moved, `list_sets` from "takes nothing" to "publishes `allSets`", which is correct | — |

### The three real sets (from the backup, ids and links only)

| Set | `project` | `exportedTo` | Scripts |
|---|---|---|---|
| `kybernesis-phase-1` | `a01-kybernesis-12-videos` | null | 12 |
| `cutty-audio-cleanup` | `d02-cutty-audio-cleanup` | null | 1 |
| `cutty-presenter-tracking` | `d03-cutty-presenter-tracking` | null | 1 |

The brand key for each is not recorded on the set, and the export lines are not in the repo (M5).

## Checks run (commands + tails)

```
$ pwd
/Users/davidcruwys/dev/ad/flivideo/teletubby

$ git log --oneline 55a6634..HEAD
80f76cf docs: record the W6 open contract — doors, refusal codes, fli.tubby.json
995a8e5 feat(w6): brand+project open contract, fli.tubby.json, set_export_to_project
f59e8e9 feat(domain): ScriptSet carries exportedTo, alongside project
463396c chore(deps): pin @flivideo/core (open-contract shared library)

$ npm test
 ✓ test/capability-surface.test.ts (47 tests) 7ms
 ✓ test/open-contract.test.ts (6 tests) 205ms
 ✓ test/agent-safety.test.ts (27 tests) 227ms
 ✓ test/control-server.test.ts (11 tests) 80ms
 ✓ test/input-shapes.test.ts (10 tests) 10ms
 … (16 files)
 Test Files  16 passed (16)
      Tests  325 passed (325)

$ npm run typecheck
> tsc --noEmit -p tsconfig.node.json --composite false
> tsc --noEmit -p tsconfig.web.json --composite false
(no errors)

$ npm run lint
npm error Missing script: "lint"                                  → M4

$ ls -la ~/fli/lab/teletubby/backup-*/
-rw-------@ 1 davidcruwys  staff  286927 Sep 16 00:55 teletubby.json

# behaviour probes (scratch vitest config aliasing the repo's src/core; temp HOME, temp store, temp brand root)
P1 rename c ok= true | store: [ 'c' ] | project file: [ 'a:a', 'b:b' ]                          → F1
P1 after restart, no context, list_sets: [ 'c' ]                                               → F1
P1b create_set dryRun ok= true {"applied":false,…} | store: [ 'c' ] | project file: ABSENT      → F2
P2 after export: store [ 'a→d02-fixture-project' ] project [ 'a:a' ]
P2 after edit: store [ 'a→d02-fixture-project' ] project [ 'a:edited-in-project' ]
P2 re-export ok= true | project [ 'a:a' ]                                                       → F3
P3 no-context list_sets: [{"id":"a",…,"exportedTo":"d02-fixture-project","scriptCount":0}]
P3 no-context rename ok= true store title: offline-edit
P3 with context, get_set title: a                                                               → F4
P4 store byte-identical after selects: true                                                     (C2 conforms)
P5 list_sets allSets with corrupt project file: {"ok":false,"error":{"code":"internal",…}}      → M2
P6 export ok= false {"code":"internal","message":"could not read …"} | store: [ 'a→d02-fixture-project' ]  → M2
P7 d03: {"brand":"fixture",…,"project":"d03-single","membership":"folder"} | z99: project-not-found | ../: project-not-found   (R31 conforms)
P8 change events for two identical selects: 2                                                   → F6
P9 export b ok= true | store [ 'a→…', 'b→…' ] | project [ 'a:a', 'b:b' ]                         (first export conforms)

# FliHub W3 door-3 status codes, for F7
flihub/server/src/test/openContract.test.ts:177  expectStatus(res, 400);
flihub/server/src/test/openContract.test.ts:188  expectStatus(unknown, 404);
flihub/server/src/test/openContract.test.ts:192  expectStatus(ambiguous, 409);
```

**What these checks did not establish.**

- **The renderer was not run.** F5 and F6 come from reading `App.tsx` and `store.ts`. F6's "silent set swap" depends on
  the other set sharing a script id, which the real `cutty-*` sets (1 script each) and `kybernesis-phase-1` may or may
  not do.
- **Probes ran through `core.invoke`, not over HTTP.** The contract tests already cover the HTTP adapter, and F7's
  status mapping is read from `control-server.ts:253-272`.
- **`FLIVIDEO_*` surviving overmind** into Electron was not run (M6).
- **M3's race** is reasoned, not reproduced.
- **The live store's byte-identity** after Swagger's smoke start was not checked by me, by rule.

APPYNET: done — FINDINGS, 7 blocking, 7 minor
