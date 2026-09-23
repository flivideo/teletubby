---
adr: 004
title: Scripts on demand — one project file, many named scripts, an optional video tag
status: accepted
date: 2026-09-23
files:
  - src/core/text-script.ts
  - src/core/handlers.ts
  - src/core/input-shapes.ts
  - src/shared/capabilities.ts
  - src/shared/domain.ts
  - src/shared/domain-schema.ts
  - src/renderer/src/store.ts
  - src/renderer/src/components/SetupPanel.tsx
  - test/write-script.test.ts
  - test/setup-panel.test.ts
---

# ADR-004 — Scripts on demand: one project file, many named scripts, an optional video tag

## Context

David, B585: *"Teletubby should be tied to a video project, but not tied to one script."* The
workflow: he talks to an AI over whichever transcript he picks, gets a title and an intro (or a CTA,
an outro), and each one becomes a small teleprompter script he re-records. A project may hold
several videos (Kybernesis `a01` has about 12) or several small parts of one video (D01).

Teletubby's unit until now was a **set** of numbered scripts, attached to a project by folder name
and kept in the app store. `fli.tubby.json` existed (W6), but only an explicit export put a set
there.

## Decision

Delivered as C5 of deliver-2026-09-23-B584-B585, recommended by d01-work and taken here.

1. **Storage is ONE file per project, `<project>/fli.tubby.json`, NOT one file per video.** Inside
   it, the project's on-demand scripts live in one set, `<project>-scripts` (`onDemand: true`),
   created on the first write. One project file fits both shapes, a multi-video project and a
   multi-part video, without choosing between them.
2. **A script may be tagged with a D15 video** (`video: <name>`, the `videos/<name>/` folder name
   verbatim). It is a **tag, not an identity**. Several scripts can share a video, and nothing is
   resolved against disk: `a01` has no `videos/` folder today.
3. **`write_script` is the way in** (agent and UI surfaces). It takes plain text plus a name, an
   optional video and optional triggers, and always writes to the OPEN project; naming another
   project is refused. A new name goes to the **top** (newest first). The same id is replaced **in
   place**, so a re-take doesn't move around the list, and the previous version is returned.
4. **Teletubby never writes the words.** It shows and edits scripts; a writer (Scribe, later)
   produces them. Paragraphs are the caller's text, split on blank lines and
   kept verbatim. Triggers are optional and **caller-authored**, each bound to a 1-based paragraph
   number the caller chose. That is an authored map, not a positional guess (rule 3). With no
   triggers, the script is stored and listed, and column 2 says nobody has authored them.
5. **Opening a project only ever opens that project's own sets**, including the remembered one.
   That closes the gap ADR-003 left: D02 no longer reopens on D03's script. The panel still lists
   every set, one click away.
6. **The picker lists on-demand scripts by name, with the video tag** (setup panel, `S`). Numbered
   sets (Kybernesis 01–12) keep their number chips.

## Consequences

- `kybernesis-phase-1` is untouched: still in the app store, still numbered, still opens.
  `write_script` touches only `<project>-scripts` and writes every other set in the file back as
  read.
- A store set that already has the id `<project>-scripts` makes `write_script` refuse (`conflict`)
  rather than shadow it.
- `write_script` needs an open context (`context_select` or launch arguments), because the project
  directory is the only place it knows to write.
- The script's `takeaway` and `summary` default to its name. The schema requires them, and a
  two-line intro has no other honest value.
- **Not built here, and not Teletubby's to build:** writing a script. Teletubby only **shows and
  edits** scripts in a teleprompter. Writing them is a future app, **Scribe** (stage 1 of the suite;
  David's correction, relayed 2026-09-23). `write_script` is the door a writer such as Scribe, or
  an AI conversation, hands its text through. Also not built: grouping the picker by video.
