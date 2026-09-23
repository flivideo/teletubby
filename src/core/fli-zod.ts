/**
 * fli-core's OWN zod 4 instance — not a second copy.
 *
 * Teletubby's `z` is zod 3 (via `@appydave/core`); fli-core's contracts,
 * `toOpenRpc` and the console page are zod 4 and read a schema's internals.
 * A contract's `input` must therefore be built by the SAME zod 4 that
 * fli-core reads it with, and fli-core does not re-export `z`. So it is
 * imported from where npm installed it, beneath fli-core.
 *
 * If this import ever fails to resolve, npm has hoisted zod differently
 * (e.g. Teletubby moved to zod 4 itself) — then import `z` from 'zod' here
 * and delete this note. It fails at build time, never silently.
 */
export { z } from '../../node_modules/@flivideo/core/node_modules/zod/index.js';
