---
generated: 2026-09-23
generator: system-context
audience: human
status: snapshot
commit: 6547eca
sources:
  - CLAUDE.md
  - README.md
  - package.json
  - docs/north-star.md
  - docs/schema-mirror.md
  - docs/kdd/README.md
  - docs/kdd/decisions/adr-003-an-empty-project-opens-empty-not-on-the-remembered-set.md
  - docs/kdd/decisions/adr-004-scripts-on-demand-one-project-file-many-named-scripts.md
  - docs/kdd/learnings/chrome-inside-the-loaded-branch-makes-every-empty-state-a-dead-end.md
  - src/shared/domain.ts
  - src/shared/domain-schema.ts
  - src/shared/capabilities.ts
  - src/core/handlers.ts
  - src/core/input-shapes.ts
  - src/core/open-context.ts
  - src/core/project-store.ts
  - src/core/text-script.ts
  - src/core/index.ts
  - src/main/index.ts
  - src/main/create-console.ts
  - src/main/window-manager.ts
  - src/main/control-server.ts
  - src/renderer/src/App.tsx
  - src/renderer/src/store.ts
  - src/renderer/src/components/Zones.tsx
  - src/renderer/src/components/SetupPanel.tsx
  - test/capability-surface.test.ts
  - test/open-contract.test.ts
  - test/setup-panel.test.ts
  - test/write-script.test.ts
  - context.globs.json
regenerate: "Run /dev-team:system-context in the repo root (docs/ convention, see /Users/davidcruwys/dev/ad/flivideo/docs/agent-comprehension-docs.md)"
---

# Teletubby — System Context

Data shapes are not repeated here. They live in [schema-mirror.md](./schema-mirror.md), which is
generated from the code and checked by `verify_mirror.py`. Operating rules, key bindings and the
list of what is not built live in [CLAUDE.md](../CLAUDE.md). This document is the *why* and *how
it fits together*.

## Purpose

Teletubby **shows and edits scripts** in a teleprompter the person on camera (the *talent*) can
glance at and talk to rather than read from — for David first, then any creator who struggles
to recite. It writes no scripts; producing them is a future app, **Scribe**.

## Core Abstractions

- **Script set → script → transcript → topics/paragraphs → trigger sets.** A *set* is the unit
  handed to the talent (Kybernesis Phase 1 is one set of twelve numbered scripts). A *script* has
  one or more *transcripts*. Each transcript is a *corpus* (a body of wording: Tom's originals,
  David's re-cadenced rewrites, or `as-written` for a script handed in by `write_script`). A
  transcript holds two heading levels (major and minor topic) over verbatim *paragraphs*. On top
  of those sit zero or more *trigger sets*, one per style A/B/C. Stepping, the zones and the
  end-of-script card all read from the active trigger set.
- **The trigger → paragraph map.** Every trigger carries the id of the paragraph it belongs to.
  That id *is* the synchronisation between column 2 (the trigger words, "the product") and every
  other zone. It is authored data, bound by **id**, never computed from position; a wrong sync
  is judged worse than none.
- **The capability core.** One catalog of verbs (`src/shared/capabilities.ts`) with one
  implementation (`src/core/`), reached by three peers: the renderer (principal `ui`, over IPC),
  an agent (principal `agent`, loopback HTTP on 7111) and the `teletubby` CLI (a wrapper over
  HTTP). The agent surface is the UI surface minus four UI-only verbs. This is how "scripts are
  editable" is met without the app growing an editor: agents edit through verbs, the window
  re-renders.
- **The open context** (`{ brand, project }`). It is set at launch (arguments or `FLIVIDEO_*`
  environment variables) or later with `context_select`, and resolved through `@flivideo/core`.
  It decides which project's `fli.tubby.json` is merged into every read, and which sets are
  allowed to open.
- **Two stores.** The app store (`userData/teletubby.json`) holds talents, rigs, the workspace
  and any set not yet exported. A project's `fli.tubby.json` holds that project's own sets,
  including its on-demand scripts. Reads merge the project file over the store **by set id**.
- **The rig / workspace.** A saved *layout* only: which zones are shown, which is driven, the
  camera edge, the text preset. It is deliberately not the script, corpus or style.

## Key Workflows

### Recording a take from a prepared set
1. The talent opens Teletubby, from FliStudio with `--brand/--project` or directly. Main resolves
   the context, starts the control server and opens the prompter where it was last left
   (fli-core window state).
2. The renderer loads rigs and the workspace first, then the context, then the set list. It opens
   the remembered set **only if it belongs to the open project**. A project with no set attached
   opens on "No script for <project> yet" with the setup panel open.
3. The talent picks a corpus and a trigger style on the footer strip, then steps with `↑ ↓ Space`
   at the scale of the driven zone. Recording happens in Ecamm; FliHub picks up the file.

### An agent re-voices or adds trigger words mid-session
1. The agent calls `write_transcript` or `write_trigger_set` over HTTP (with `dryRun` first if it
   wants a preview).
2. The core validates the input against the zod schema, writes to the store or the project file
   (whichever already owns that set id) and fires `onChange`.
3. Main relays `control:changed` to the window, which re-fetches. `store.refresh()` keeps the
   talent's script, corpus and step; the stage never moves because data changed.

### A script handed in on demand (B585)
1. Something that writes scripts (Scribe in future, or an AI conversation today) produces an
   intro, a title or a CTA as plain text.
2. It calls `context_select` for the project if needed, then `write_script { name, text, video? }`.
3. The script lands at the top of `<project>-scripts` in that project's `fli.tubby.json`. If the
   stage was empty, the window opens that set; otherwise the new script appears in the setup
   panel, listed by name.
4. The talent records it. A re-take with the same name replaces it in place.

### Exporting an app-store set into its project
1. Open the set's project as the context. Call `set_export_to_project { setId }`.
2. The project file is written first, then the store copy is marked `exportedTo`, and is from
   then on listed read-only when that project is not open.

## Design Decisions

- **Drivable, not an editor.** The North Star rules that scripts are edited *through* Teletubby by
  an agent, never by growing editing controls.
  - *Alternative considered*: a built-in text editor.
  - *Why rejected*: it adds something to read and a control to learn, which fails the product
    test ("more attention on the camera, less on the screen").
- **Destructive verbs go preview → approve → execute, and approval is UI-only.** A `dryRun`
  returns a `pendingId`; a human approves it in the window.
  - *Alternative considered*: trusting agents with a confirm flag.
  - *Why rejected*: the mechanism that satisfies a control must not be reachable through the
    surface it constrains.
- **Writes to the project file are routed by prior membership (set id), never by the
  `project` attribute.**
  - *Alternative considered*: routing by `project` (the first W6 build).
  - *Why rejected*: the first write to anything moved every attached set out of the store and
    dropped the store copies — a silent migration.
- **A stepping unit set by the driven zone, clamped inside the script.**
  - *Alternative considered*: arrows that always walk one trigger, and roll over into the next
    script (the original prompter).
  - *Why rejected*: both got David lost mid-take (B437, prior art).
- **On-demand scripts live in one project file with named scripts, not one file per video**
  (ADR-004).
  - *Alternative considered*: `fli.tubby.<video>.json` per video.
  - *Why rejected*: a project may be many videos (Kybernesis a01) or many small parts of one video
    (D01). A video *tag* on each script fits both shapes without choosing one.
- **An empty project opens empty** (ADR-003).
  - *Alternative considered*: fall back to the remembered set (W6 F5).
  - *Why rejected*: D01 opened on D03's script under a D01 footer.

## Non-obvious Constraints

- **A transcript without a trigger set cannot be stepped at all.** All navigation indexes into the
  active trigger set. A script handed in with no triggers renders, but column 2 says nobody
  authored them. The app never invents a trigger.
- **The generated seed never overwrites the store.** `npm run build:data` produces the seed; an
  agent's trigger set written yesterday survives today's rebuild. Editing the seed and expecting
  the running app to change is a common surprise.
- **An exported set's app-store copy is read-only and still listed** when its project is not
  open. It is the only copy that launch can see; every write to it refuses `conflict` (409).
- **Physical size is unknowable.** Electron gives device-independent pixels (DIPs), never
  centimetres, so anything about the lens position has to arrive as a screen fraction the talent
  sets.
- **Rigs never carry script, corpus or style.** Those are the A/B/C experiment's axes and change
  during a session. A rig that restored them would silently move the talent.
- **`write_script` only ever writes to the open project.** With no context it refuses; naming a
  different project refuses.

## Expert Mental Model

- **Column 2 is the product; every other zone is a follower.** A newcomer treats the paragraph
  zone as the script and the triggers as decoration. An expert reads it the other way round:
  everything on screen derives from one number, the step into the trigger set.
- **"Nothing may move the talent" outranks "show the latest data".** Refresh keeps the position;
  a change event never swaps the set on stage; a context switch changes what is *listed*, not
  what is *shown*. When a feature argument comes up, ask whether it could move the person on
  camera without them choosing to.
- **Absence and failure must never look alike.** Many fixes in `docs/kdd/learnings/` are
  instances of this. Examples: an unreadable project file versus an empty one; a stray CLI
  argument versus a missing set; an empty picker versus no data. An expert checks what an empty
  result *means* before trusting it.
- **Provenance versus cadence.** A provenance transcript is the originator's meaning and is never
  rewritten; a cadence transcript is the same meaning in the talent's voice, per talent. Cadence
  thresholds belong to one person and are never ported.

## Scope Limits

- Does NOT write scripts. That is Scribe (future, stage 1); text arrives through `write_script`
  or `write_transcript` from whatever wrote it.
- Does NOT record or capture clips. Ecamm records and FliHub watches the folder and queues takes.
- Does NOT listen, detect waffle, sync to voice or generate triggers (the AI layer is explicitly
  unbuilt).
- Does NOT resolve D15 videos on disk. `video` on a script is a tag; nothing checks that
  `videos/<name>/` exists.
- Does NOT migrate sets into projects on its own. Only `set_export_to_project` or `write_script`
  writes a project file.

## Failure Modes

- **The window paints nothing, and every check is green.** A Zustand selector that builds a new
  array re-renders forever. Build, typecheck and tests all pass. Recognise it by a blank window
  with nothing in the console; fix it with `useShallow`.
- **A translucent surface renders with no background.** Tailwind silently drops an opacity
  modifier on a `var()` colour (`bg-canvas/92`). Declare a real token instead.
- **An empty or wrong set opens on launch.** Check `context_get` and `list_sets`: a set only opens
  if it belongs to the open project. With no context open, the remembered set opens wherever it
  belongs.
- **`not_found: no set specified` from the CLI.** Input was passed as a bare positional instead
  of `--input`. The CLI now refuses the positional, but older transcripts show the confusing
  version.
- **A project file will not parse.** Reads report it as `unreadable` rather than empty; sets that
  belong to that project refuse (`unavailable`) and the stage is held, not blanked.
- **The dock icon re-ran startup (fixed in 7e412ba).** Before that commit, reopening the window on
  macOS built a second core and lost the control server. [inferred] The signature would be a
  second "open context resolved at startup" line for the same process id in `.logs/app.log`.
- **The schema mirror does not show the verb input schemas.** `INPUT` in
  `src/core/input-shapes.ts` (every verb's zod input) is listed under "Declared but not read", so
  `verify_mirror.py` exits 0 while those shapes change freely. The published contract for them is
  `teletubby capabilities`, which is generated from `INPUT`.
