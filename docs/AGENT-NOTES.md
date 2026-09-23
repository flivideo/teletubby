---
generated: 2026-09-23
generator: system-context
audience: agent
status: snapshot
commit: 6547eca
---

# Teletubby — Agent Notes

Only what the code cannot tell you, and nothing CLAUDE.md already says. It already covers
launching, the capability core, the open contract, the styling rules and the gotchas.

## Tooling

- Launch with `npm run app` (overmind, detached). Never `npm run dev` from an agent.
- Drive the app with `bin/teletubby.mjs call <verb> --input '<json>'`. Read verb shapes from
  `teletubby capabilities` (generated), not from any doc.
- Schema drift check: `python3 /Users/davidcruwys/dev/ad/appydave-plugins/dev-team/skills/schema-mirror/scripts/verify_mirror.py docs/schema-mirror.json`.
  Regenerate with `extract_typescript.py` + `render_mirror.py` after any change to
  `src/shared/*` or `src/core/input-shapes.ts`.
- The mirror covers the domain zod schemas but **not the per-verb input schemas**. `INPUT` in
  `src/core/input-shapes.ts` is listed under "Declared but not read". Get verb inputs from
  `teletubby capabilities`, which is generated from `INPUT`.

## Pitfalls

- **Main-process changes need a real restart.** HMR only reaches the renderer. The window-state
  and dock-icon code in `src/main/` takes effect on the next launch, and the rule is that an
  agent does not restart a running Teletubby.
- **`onReady` is also the macOS `activate` handler** (`create-console.ts`). Anything added to
  `onReady` in `src/main/index.ts` must sit **after** the `if (core)` early return, or a dock
  click runs it a second time.
- **`write_script` needs an open context.** No context → `invalid_input`. `project` in the input
  must equal the open one; it never selects a project.
- **A script written with no triggers is stored and listed, but cannot be stepped.** That is
  correct — do not "fix" it by deriving triggers from paragraphs; rule 3 forbids positional maps.
- **The derived set id `<project>-scripts` is reserved.** A store set with that id makes
  `write_script` refuse `conflict`.

## Decisions worth knowing

- **Teletubby shows and edits scripts; it never writes them.** Writing is a future app, Scribe.
  Any verb that would generate text or triggers belongs there, not here (David, 2026-09-23).
- **Opening is scoped to the open project** — the remembered set included (ADR-003, ADR-004).
  Do not reintroduce a cross-project fallback "so the stage is never empty"; that fallback put
  D03's script on stage under D01.
- **One project file with named scripts, not per-video files** (ADR-004). `video` is a tag,
  never resolved against disk.

---
Deep comprehension narrative for humans: [SYSTEM.md](./SYSTEM.md). It is not loaded into agent
context. Data shapes: [schema-mirror.md](./schema-mirror.md).
