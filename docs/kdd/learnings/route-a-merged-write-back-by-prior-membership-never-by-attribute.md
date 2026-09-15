---
learning: route-a-merged-write-back-by-prior-membership-never-by-attribute
category: correctness
severity: critical
date: 2026-09-16
status: fixed
story_reference: W6 fix round (docs/reviews/overnight-W6.md F1, F2)
recurrence_count: 1
files:
  - src/core/handlers.ts
  - test/open-contract.test.ts
---

# Route a merged write back by prior membership, never by an attribute

**The one-line version**: W6 merged `fli.tubby.json` over the app store so each handler edits
one document, then split the result back apart **by `set.project`**. Any write while a context was
open moved every attached set out of the store and dropped the store copies. A dry run persisted
the same split, so a "change nothing" preview erased a set.

## What happened

`projectAwareUpdate` read the open project's file, merged it over the store, ran the handler, and
then routed each set: `project === open project` went to the project file, and everything else went
to the store. The attribute says which sets *could* belong to the project. It does not say which
sets *already live there*. The reviewer's probe:

- store `[a(P), b(P), c]`, context P, `rename_set c`
- result: store `['c']`, project file `['a', 'b']`
- a plain relaunch with no context listed `['c']`, so `a` and `b` were gone from the app

The split also ran on `dryRun`. Only the project-file write was guarded, so the store lost the set
and the project file never received it. The build brief's binding rule was *"export, not migrate —
never delete the store copy"*. The code performed a migration silently, on the first write of any
kind.

## The fix

```ts
// wrong way — route by what the set IS: every candidate moves, on any write
(set.project === openContext.project ? toProject : toStore).push(set);

// right way — route by where the set ALREADY IS; moving it is a separate, explicit verb
(beforeIds.has(set.id) ? toProject : toStore).push(set);

// and a preview persists the document it was handed, never the split
if (context.dryRun) return { document: storeDocument, result: handlerResult };
```

A store set now enters the project file only through `set_export_to_project`.

**Found while fixing it**: the first cut compared `after` with `before` to skip no-op project
writes, and it always said "same". The handler mutates the merged sets **in place**, and those are
the very objects in `before`. Contract test 5 caught it. Snapshot (`JSON.stringify`) before handing
objects to a mutating callback.

## The general rule

When one view is assembled from two stores, the write-back has to put each record **where it came
from**. Use membership recorded before the handler ran, not a property that merely makes a record
eligible for the other store. Moving a record between stores is its own verb, with its own tests.
The preview path must persist nothing, including the reshuffle.

Regression tests: `F1 · a write never moves a set…` and `F2 · a dry run with a context open
changes nothing on disk` in `test/open-contract.test.ts`.
