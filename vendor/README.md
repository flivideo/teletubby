# vendor/

Vendored, SHA-stamped tarball of `@appydave/core`. It replaces the npm range `^0.1.0` (zod 3)
until `@appydave/core` 0.2.0 is published.

## Current tarball

- `appydave-core-0.2.0-1cd0e79.tgz` (zod 4; `zod` is a **peer dependency**, `^4.0.0`, satisfied by this app's own zod 4)
- Source: branch `core-0.2.0-zod4` @ `1cd0e79` of `appydave-foundation` (package `@appydave/core`),
  packed 2026-10-29 from `/Users/davidcruwys/dev/ad/apps/appydave-foundation-worktrees/core-0.2.0-zod4`.

## After the npm publish

Replace this tarball with the npm range `^0.2.0` (package.json `@appydave/core` and the
`appytron.json` `core` marker together, so they stay equal), `npm install`, and delete `vendor/`.
