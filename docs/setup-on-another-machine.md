# Teletubby: setup on another machine

**Purpose**: Put the repo and its jump alias on another of David's machines.

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
