# Teletubby

**An open-source teleprompter that you glance at, not read from, driven by an agent or by hand.**

```
┌──────────────┬─────────────────────┬────────────────────────────┐
│ 1. TOPIC     │ 2. TRIGGERS         │ 3. TRANSCRIPT              │
│              │                     │                            │
│ Intro        │ • memory fades      │ "Most teleprompters make   │
│ The problem  │ • not my voice      │  you recite someone else's │
│ The 3 cols   │ • glance not read   │  sentences. That's the     │
│ Close        │                     │  part that breaks..."      │
│              │                     │                            │
│ where you    │ where your EYES     │ the safety net you read    │
│ are          │ live while talking  │ BEFORE you hit record      │
└──────────────┴─────────────────────┴────────────────────────────┘
```

Standard teleprompters make you recite. Teletubby is built on the opposite bet: the words that come out of your mouth
should be *yours*, and the screen's job is only to keep you on track. Scripts that someone else wrote do not come out
naturally, because they are not in your voice, and reading verbatim looks like reading verbatim. The fix is not a better
script; it is needing less of it on screen. **Column 2 is the product.** Everything else is context.

Teletubby **shows and edits scripts**; it does not write them. Whatever writes the words (a person, a script-writing
agent, FliStudio's Story Pilot) hands them over, and Teletubby puts them in front of the talent. It is the teleprompter
of the FliVideo suite: it opens on a project, keeps that project's scripts in `<project>/fli.tubby.json`, and takes
published script variants from FliStudio.

- **Tied to a video project, not to one script**: a numbered set, or many small named pieces, each optionally tagged
  with the video it is for.
- **Drivable**: a loopback control API lets an agent read and write scripts, transcripts and trigger words without the
  UI. Changes appear without a restart and never move the person on camera.
- **Follows your voice, if you ask it to**: off by default, `V` turns it on. Said words fade and the next word gets a
  quiet underline; Apple's on-device speech is the main engine, with a cloud fallback. Details:
  [docs/voice-follow-parity-2026-11-04.md](docs/voice-follow-parity-2026-11-04.md).

**Not built:** writing scripts, trigger generation, recording and clip capture. The app never invents a trigger word.

## Run

```bash
npm install          # npm only: packageManager is pinned
npm run app          # starts detached. Also: app:status, app:stop, app:restart, app:logs
```

**Needs:** macOS · Node and npm · the contract library `@flivideo/core` (a `github:` dependency) ·
**Ports:** renderer 7110 · control API 7111 (loopback).

Keys: `↑` `↓` `Space` step the beat · `⌘←` `⌘→` previous / next script · `S` setup · `T` transcript · `D` focus ·
`V` voice-follow · `M` mirror · `F` fullscreen. Bare `←` `→` are deliberately unbound.

## Open it on a project

Teletubby follows the suite's open contract: pointed at a **brand** and **project** (optionally a **video**) at
launch, or re-pointed while it runs.

```bash
scripts/app.sh start --brand appydave --project d01-flivideo-tour
bin/teletubby.mjs call write_script \
  --input '{"name":"Intro","text":"First paragraph.\n\nSecond paragraph.","video":"flivideo-tour"}'
```

The shared rules and refusal codes live in the contract library's mirror and in
[docs/schema-mirror.md](docs/schema-mirror.md).

## Ask it what it can do

Teletubby describes itself; this README does not copy the command list.

- **`GET /api/describe`** (`describe/1`) and **`GET /api/map`** (the command map): no token needed.
- **`bin/teletubby.mjs capabilities`** lists every verb with its input shape, generated from the app.

## Docs

| Read | For |
| --- | --- |
| [docs/SYSTEM.md](docs/SYSTEM.md) | How it works and why: concepts, workflows, design decisions, failure modes |
| [docs/AGENT-NOTES.md](docs/AGENT-NOTES.md) | What an agent working in this repo needs, and nothing the code already says |
| [docs/schema-mirror.md](docs/schema-mirror.md) | Every data shape, generated from the code and checked for drift |
| [docs/kdd/](docs/kdd/README.md) | Decisions (ADRs) and learnings, one per incident |
| [docs/concept.md](docs/concept.md) | The three-column model, the AI layer, FliHub integration |
| [docs/north-star.md](docs/north-star.md) | What it is for, and the test that settles feature arguments |
| [docs/requirements.md](docs/requirements.md) | What gets built: zone model, camera constraint, trigger styles |
| [docs/open-questions.md](docs/open-questions.md) | What is genuinely unresolved |
| [CLAUDE.md](CLAUDE.md) | How to work on this app: the rules and the gotchas |

## Suite

Part of the FliVideo suite — map: [flivideo/flivideo](https://github.com/flivideo/flivideo#readme). Shared contract:
[`@flivideo/core`](https://github.com/flivideo/fli-core). Siblings: FliStudio · FliHub · FliCut · FliCast · FliEdit ·
FliTools.

## Status

**Built and in use; the control API and docs are current.** True at `16c835e` (2026-11-18).

Public repo `flivideo/teletubby` · MIT, see [LICENSE](LICENSE)
