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

True at `6547eca` (2026-09-23).

Teletubby **shows and edits scripts** in a teleprompter. It does not write them. Writing a
script is a separate, future FliVideo app, **Scribe**. Whatever writes the words hands them to
Teletubby, and Teletubby puts them in front of the talent.

- **Tied to a video project, not to one script.** Open it on a FliVideo project and it shows
  that project's scripts: a numbered set such as the twelve Kybernesis explainers, or many small
  named pieces (an intro, a title, a CTA), each optionally tagged with the video it is for.
- **Drivable.** A loopback control API on `7111` lets an agent read and write scripts,
  transcripts and trigger words without the UI. Changes appear in the window without a restart,
  and never move the person on camera.
- **Part of the FliVideo suite.** It opens through the same `{ brand, project }` contract as
  FliHub, FliCut and FliCast, and keeps a project's own scripts in `<project>/fli.tubby.json`.

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
| `M` | mirror, for prompter glass |
| `F` | fullscreen |

Bare `←` `→` are deliberately unbound: the zone model has no single axis for them to mean.

**Not built:** writing scripts (that is Scribe), the AI layer (listening, sync-to-voice, trigger
generation), recording and clip capture (Ecamm records; FliHub watches the folder). The app
never invents a trigger word; an agent writes them through the control API.

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

## Setup on another machine

Canonical location — **do not clone it anywhere else**, several docs reference this path:

```
~/dev/ad/flivideo/teletubby      # git@github.com:flivideo/teletubby.git
```

Moved from `~/dev/ad/apps/teletubby` on 2026-09-10; dated handovers that name the
old path were right at the time.

Jump alias: **`jfli-tubby`** (registry key `teletubby`), following the `jfli-<name>`
convention of the other FliVideo apps.

**The alias is already registered and pushed**, so another machine does not re-add it —
it pulls it. The registry is git-synced; only the generated shell file is per-machine:

```bash
git -C ~/.config/appydave pull                     # locations.json — source of truth, synced
cd ~/dev/ad/flivideo && gh repo clone flivideo/teletubby

# regenerate this machine's shell aliases from the registry
~/dev/ad/appydave-tools/bin/jump.rb generate aliases > /tmp/aliases-jump.zsh
diff ~/.oh-my-zsh/custom/aliases-jump.zsh /tmp/aliases-jump.zsh    # expect only additions
cp /tmp/aliases-jump.zsh ~/.oh-my-zsh/custom/aliases-jump.zsh
source ~/.oh-my-zsh/custom/aliases-jump.zsh
```

Three ways this goes wrong, all seen before:

- **Never edit `aliases-jump.zsh` by hand.** It is generated; `locations.json` is the
  source of truth and a hand edit is silently overwritten on the next regen.
- **Generate to a temp file and diff before copying.** Redirecting straight onto the real
  file truncates it the moment the generator errors, and you lose every alias at once.
- **Over SSH, initialise rbenv first.** A non-login shell on the Minis can land on system
  Ruby 2.6, where `jump.rb` fails — combined with the point above, that is exactly how the
  alias file gets wiped.

If `jfli-tubby` is missing after all that, the registry pull is what failed, not the
clone — check `~/.config/appydave` is on `origin/main` before regenerating again.

## Related

- **FliVideo suite map**: `~/dev/ad/flivideo/README.md`. FliStudio opens Teletubby on a
  project; FliHub (`~/dev/ad/flivideo/flihub`) captures and queues the takes; Scribe (future)
  writes the scripts.
- **`@flivideo/core`** (`~/dev/ad/flivideo/fli-core`): the shared open contract and window-state
  helper.
- **Kybernesis**: the video channel this was first built to serve.

MIT licensed. See [LICENSE](LICENSE).
