/**
 * fli-core's OWN zod 4 instance — not a second copy.
 *
 * fli-core's contracts, `toOpenRpc` and the console page read a schema's
 * internals, so a contract's `input` is built by the SAME zod 4 that fli-core
 * reads it with — which fli-core re-exports as `z` since v0.7.3. (Teletubby's
 * own `z`, via `@appydave/core`, was zod 3 until core 0.2.0; it is now zod 4
 * too, taken as a peer, so the app installs one zod.)
 *
 * This used to import zod by path from beneath fli-core's node_modules. That
 * resolved the runtime to one copy and the types to another, so tsc saw two
 * unrelated zod 4 type trees (TS2719 in agent-layer.ts) while tests passed.
 */
export { z } from '@flivideo/core';
