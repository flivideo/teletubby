# W6 fix round — rulings on `docs/reviews/overnight-W6.md` (7 blocking, 7 minor)

**For Agents**: you are `teletubby-w6-fix`, model `claude-opus-5`, cwd `/Users/davidcruwys/dev/ad/flivideo/teletubby`.
The W6 build (`463396c..80f76cf`) is on `main`; the review is at `docs/reviews/overnight-W6.md`; the original brief is
`docs/briefs/overnight-W6-teletubby-open-contract.md` (its rulings still bind: **export, not migrate; never delete a
store copy; no automatic migration of the three real sets**). Read all three, then apply every item below. Swagger
(`flistudio-orch`) reproduces and gates. David is asleep; do not ask him.

⚠️ Do not launch the real app with `--brand/--project`, and never run `context_select` against a real store, until
F1–F4 are fixed. Tests use a temp store only. The real store's backup is at `~/fli/lab/teletubby/backup-20260916-0055/`.

## Rulings (apply as the reviewer's Fix sections state unless a line here says otherwise)

| # | Ruling |
|---|---|
| **F1** | Option 1: a set is routed to `fli.tubby.json` only if its id is already in that file; every other set returns to the store untouched. Store sets enter the project file **only** through `set_export_to_project`. Correct CLAUDE.md. The F1 test. |
| **F2** | Dry run returns the untouched store document; the F2 test (store byte-identical, no project file). |
| **F3** | Re-export refuses with `conflict` (409) when the store copy carries `exportedTo` or the project file already holds the id. No silent revert. Test. |
| **F4** | Every write to a store set with `exportedTo` and no matching context → `conflict` with the reviewer's message. **Swagger's ruling on the open question**: with no context, an exported set is **listed read-only** and labelled *lives in `<folder>/fli.tubby.json`* — never hidden, never editable. Record the brand beside the folder (`exportedTo: { brand, project }` or a sibling `exportedBrand`) so a later launch can find the live copy. Correct CLAUDE.md. Test. |
| **F5** | Setup panel fetches `allSets: true` with a two-state filter (this project / all sets, default this project when a context exists); an empty filtered list falls back to all sets with the one-line note, never `setFailure`; an export action on a set row when its `project` equals the open context. Test the empty-filter fallback. |
| **F6** | The change listener never falls back to a different set (keeps the set on stage and marks it); an identical re-select fires **zero** change events (`applied: false`, no announce). Core-level test. |
| **F7** | Door-3 refusals `fail()` with the mapping `missing`→400 `invalid_input`, `unknown-brand`/`project-not-found`→404 `not_found`, `project-ambiguous`→409 `conflict`, `no-brand-root`/`registry-unreadable`→503 `unavailable`; `details: { context, refused }`; publish in `failureModes`; keep `openContext.apply` so `context_get` still shows the refusal; CLI exits non-zero. Tests 3 and 4 assert status + `details.refused.code`. |
| **M1** | Fix the tests as stated (env door variant, deep-equal to the door-2 body, C2 baseline before the first select, pin R31 0 / 1 / 2+, exercise `no-brand-root` and `registry-unreadable`). |
| **M2** | Write the project file first, then mark the store; reads degrade per set with the unreadable file reported in `filter`. |
| **M3** | One per-`projectDir` promise queue for project-file writes; re-read inside it. |
| **M4** | **Ruled**: typecheck is W6's static check; a lint config is David's call (same as FliCast). Note it in the KDD. No change. |
| **M5** | Correct the two CLAUDE.md sentences; put the three export lines **with brand keys** in `docs/briefs/overnight-W6-teletubby-open-contract.md` under a new `## Report` heading, marked *do not run until F1–F4 are gated*. |
| **M6** | Usage guard for a flag without a value in both branches. (The env passthrough smoke is Swagger's after the gate.) |
| **M7** | An invalid `~/.fli/machine.json` → refuse `no-brand-root` with the parse message. Test. |

## Done

`npm test` and `npm run typecheck` green. One commit per finding (`fix(W6): F1 …`), pushed to `main`. Final report:
`git log --oneline 80f76cf..HEAD`, test + typecheck tails, one line per F1–F7 and M1–M7 with the proving test name,
anything you disagreed with and why, then `APPYNET: done — …`.
