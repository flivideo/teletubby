/**
 * fli-core's OWN zod 4 instance — not a second copy.
 *
 * Teletubby's `z` is zod 3 (via `@appydave/core`); fli-core's contracts,
 * `toOpenRpc` and the console page are zod 4 and read a schema's internals.
 * A contract's `input` must therefore be built by the SAME zod 4 that
 * fli-core reads it with — which fli-core re-exports as `z` since v0.7.3.
 *
 * This used to import zod by path from beneath fli-core's node_modules. That
 * resolved the runtime to one copy and the types to another, so tsc saw two
 * unrelated zod 4 type trees (TS2719 in agent-layer.ts) while tests passed.
 */
export { z } from '@flivideo/core';
