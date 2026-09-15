# W6 review — Teletubby open contract (launch args, context filters sets, `fli.tubby.json`, export-not-migrate)

**Purpose**: The independent review pass roadmap §3.1 requires before the W6 gate. You review; you fix nothing.

**For Agents**:
- You are the W6 **reviewer**, session `teletubby-w6-review`, model `claude-opus-5`, cwd `/Users/davidcruwys/dev/ad/flivideo/teletubby`.
  The builder (`teletubby-w6`) is a separate session; the orchestrator (Swagger, `flistudio-orch`) routes the fixes.
- **Edit nothing except your findings file. Do not commit. Do not start the app.** Never touch
  `~/Library/Application Support/teletubby` or `/Users/davidcruwys/dev/video-projects`.
- David is asleep; do not ask him.

## 1 · Inputs

Builder brief `docs/briefs/overnight-W6-teletubby-open-contract.md` (binding rulings, incl. the `fli.tubby.json`
ruling: project sets in the project file, talent/rigs in the app store, **export not migrate**), the builder's
commits, and the contract: `open-contract.md` §3, §3.1, §4 Teletubby row (`set_active_context` stays UI-only), §5,
C1–C4; `roadmap.md` §1.1, §1.3 Teletubby row, §3 W6, §3.1; `specification.md` R4, D1/D4, §6.2 Teletubby row, §11 #7;
`/Users/davidcruwys/dev/ad/flivideo/fli-core/README.md`.

## 2 · Method (`agent-skills:code-review-and-quality`)

1. **Backup**: the builder's report names the backup path of the real store under `~/fli/lab/teletubby/backup-*/` (or
   says no store file existed); confirm the file exists if named (read-only `ls`).
2. **Doors**: `scripts/app.sh` flags → env → `parseOpenArgs`/`resolveOpenContext` (`@flivideo/core#v0.1.0`);
   `context_select`/`context_get` capabilities over the control API and `bin/teletubby.mjs`; one helper (C1); context
   not persisted in `teletubby.json` (C2, test proves the file unchanged); typed refusals, previous context unchanged
   (C3); no restart (C4). **`set_active_context` is still not agent-callable.**
3. **Filter**: with a context the set list is filtered by `project` folder name, with an "all sets" toggle; without,
   unfiltered.
4. **`fli.tubby.json`**: read on startup/context change; project-linked set edits written there (atomic, relative
   paths); store copy with the same id not shown twice; `set_export_to_project` writes the project file and marks the
   store copy `exportedTo`, never deletes it; **no automatic migration** of the three real sets.
5. **Contract tests**: the six named exist and are real; temp `userData`; fixtures in temp dirs; grep tests for the
   real paths — any hit is BLOCKING; thresholds not lowered.
6. **Regression sweep**: `npm test`, `npm run typecheck`, `npm run lint` run by you, tails pasted; diffs of touched
   existing files read for out-of-brief changes (sets must not be lost).

## 3 · Output

`/Users/davidcruwys/dev/ad/flivideo/teletubby/docs/reviews/overnight-W6.md`, same shape as
`fli-core/docs/reviews/overnight-W1.md`. End: `APPYNET: done — <verdict, n blocking, m minor>`.
