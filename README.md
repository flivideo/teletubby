# Teletubby

An open-source teleprompter that you **glance at**, not read from.

Standard teleprompters make you recite. Teletubby is built on the opposite bet: the
words that come out of your mouth should be *yours*, and the screen's job is only to
keep you on track. It does that with three columns instead of one scrolling wall of text.

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

**Column 2 is the product.** Everything else is context.

## Why it exists

David's own constraint, stated plainly: *"my memory is going — I can't hold recited
sentences in my head."* Scripts written by someone (or something) else don't come out
naturally, because they aren't in his voice. Reading verbatim looks like reading
verbatim. The fix isn't a better script — it's needing less of it on screen.

## What it does

True at `f48874f` (2026-11-09).

Teletubby **shows and edits scripts** in a teleprompter. It does not write them. Today the agent
**Sally** and the script-writing skills do that; whether scripting needs its own app is undecided.
Whatever writes the words hands them to Teletubby, and Teletubby puts them in front of the talent.

- **Tied to a video project, not to one script.** Open it on a FliVideo project and it shows
  that project's scripts: a numbered set such as the twelve Kybernesis explainers, or many small
  named pieces (an intro, a title, a CTA), each optionally tagged with the video it is for.
- **Drivable.** A loopback control API on `7111` lets an agent read and write scripts,
  transcripts and trigger words without the UI. Changes appear in the window without a restart,
  and never move the person on camera.
- **Follows your voice, if you ask it to.** Voice-follow is off by default; press `V`. Said words fade
  and the next word gets a quiet underline. Apple's on-device speech is the main engine and Groq the
  fallback; a key press re-anchors it. Details:
  [docs/voice-follow-parity-2026-11-04.md](docs/voice-follow-parity-2026-11-04.md).
- **Takes scripts from Story Pilot.** FliStudio's Story Pilot publishes each variant of a script
  through `write_script`. Variants appear as chips on the strip, and a new version keeps the talent
  on the same words.
- **Part of the FliVideo suite.** It opens through the same `{ brand, project }` contract as
  FliHub, FliCut, FliCast and FliEdit, and keeps a project's own scripts in `<project>/fli.tubby.json`.

## Quick start

```bash
npm install          # npm only — packageManager is pinned
npm run app          # starts detached; renderer on 7110, control API on 7111
npm run app:status   # is it up?
```

Open it on a project, then hand it a script:

```bash
scripts/app.sh start --brand appydave --project d01-flivideo-tour
bin/teletubby.mjs call write_script \
  --input '{"name":"Intro","text":"First paragraph.\n\nSecond paragraph.","video":"flivideo-tour"}'
```

`bin/teletubby.mjs capabilities` lists every verb with its input shape. The list is generated
from the app, so it is always current.

| Key | Does |
|---|---|
| `↑` `↓` `Space` | step the beat, at the scale of the driven zone; clamped inside the script, never crosses into the next |
| `⌘←` `⌘→` | previous / next script |
| `S` | setup panel: script, project, zones, camera side, rigs (`Esc` closes) |
| `T` | the full transcript, sliding out from the edge away from the lens |
| `D` | focus: dim everything but the current beat and reclaim the top of the window |
| `V` | voice-follow on or off |
| `M` | mirror, for prompter glass |
| `F` | fullscreen |

Bare `←` `→` are deliberately unbound: the zone model has no single axis for them to mean.

**Not built:** writing scripts, trigger generation, recording and clip capture (Ecamm records; FliHub
watches the folder). The app never invents a trigger word; an agent writes them through the control API.

## Docs

| Doc | What's in it |
|---|---|
| [docs/SYSTEM.md](docs/SYSTEM.md) | How it works and why: the core concepts, workflows, design decisions and failure modes |
| [docs/AGENT-NOTES.md](docs/AGENT-NOTES.md) | The short list an agent working in this repo needs, and nothing the code already says |
| [docs/schema-mirror.md](docs/schema-mirror.md) | Every data shape, generated from the code and checked for drift |
| [docs/kdd/](docs/kdd/README.md) | Decisions (ADRs) and learnings, one per incident |
| [docs/concept.md](docs/concept.md) | The three-column model, the AI layer, FliHub integration |
| [docs/open-questions.md](docs/open-questions.md) | What's genuinely unresolved — trigger words, scrolling, scope |
| [docs/source/b421-2026-08-19-plaud.md](docs/source/b421-2026-08-19-plaud.md) | Raw origin brainstorm (Captain's Log B421) |
| [docs/north-star.md](docs/north-star.md) | What it is for, and the test that settles feature arguments |
| [docs/requirements.md](docs/requirements.md) | What gets built — zone model, camera constraint, trigger styles |
| [CLAUDE.md](CLAUDE.md) | How to work on this app — the rules, the data pipeline, the gotchas |
| [docs/prior-art-kybernesis-prompter.md](docs/prior-art-kybernesis-prompter.md) | A working two-column prompter built the day before — what it settled, what it didn't |
| [docs/setup-on-another-machine.md](docs/setup-on-another-machine.md) | The clone location and the jump alias, for another of David's machines |

## Related

- **FliVideo suite map**: `~/dev/ad/flivideo/README.md`. FliStudio opens Teletubby on a
  project and its Story Pilot publishes scripts here; FliHub (`~/dev/ad/flivideo/flihub`) captures
  and queues the takes; FliCut and FliEdit take it from there.
- **`@flivideo/core`** (`~/dev/ad/flivideo/fli-core`): the shared open contract and window-state
  helper.
- **Kybernesis**: the video channel this was first built to serve.

MIT licensed. See [LICENSE](LICENSE).
