/**
 * THE AGENT-DRIVABLE LAYER — fli-core v0.7.0, adopted over Teletubby's own
 * capability core (David's GO, 2026-09-23: FliStudio, then Teletubby, then
 * FliCut).
 *
 * This is a PROJECTION of the catalog in `src/shared/capabilities.ts`, never a
 * second catalog:
 *
 *   · names    — the suite names verbs `family.verb`; Teletubby published
 *                `list_sets`. Renaming would break the CLI, the skill, the
 *                renderer and every peer already calling `write_script`, so
 *                the snake name stays canonical on `/api/invoke` and the
 *                dotted name is the JSON-RPC method, the spec and the page.
 *                The map below is AUTHORED — a derived name would silently
 *                change when a verb is renamed.
 *   · inputs   — `INPUT` (zod 3) is still THE schema. It is converted to JSON
 *                Schema and rebuilt in fli-core's zod 4 (`fromJSONSchema`), so
 *                the spec and the console describe the object that refuses.
 *   · the ★    — a verb the catalog allows only the `ui` principal is
 *                `humanOnly: true` here. `authorize` runs in `core.invoke`,
 *                beneath every door, alongside the older principal gate.
 *   · refusals — Teletubby's snake error codes, named in the suite's kebab
 *                vocabulary with frozen numbers (`FAILURE_CODES`).
 *
 * Main-process only: it reaches fli-core, which reaches node:*.
 */

import {
  JSONRPC_CODES,
  LIFECYCLE_CAPABILITIES,
  SUITE_FAILURE_CODES,
  SUITE_REFUSAL_DETAILS,
  defineCapabilities,
  defineCapability,
  defineFailureCodes,
  toOpenRpc,
  type CapabilityContract,
  type OpenRpcDocument,
} from '@flivideo/core';
import { z as z4 } from './fli-zod.js';
import { CAPABILITIES, type CapabilityError, type CapabilityMeta, type ErrorCode } from '@shared/capabilities';
import { INPUT } from './input-shapes.js';
import { toJsonSchema } from './zod3-json-schema.js';

/* ------------------------------------------------------------------ *
 * Names — snake (published) ↔ dotted (fli-core)
 * ------------------------------------------------------------------ */

/** Every published verb's fli-core name. A verb missing here fails at import (see below). */
export const DOTTED_NAME: Readonly<Record<string, string>> = {
  describe_capabilities: 'capabilities.describe',
  get_active_context: 'context.active',
  set_active_context: 'context.set-active',
  context_get: 'context.get',
  context_select: 'context.select',
  list_sets: 'set.list',
  get_set: 'set.get',
  create_set: 'set.create',
  rename_set: 'set.rename',
  set_export_to_project: 'set.export-to-project',
  get_script: 'script.get',
  create_script: 'script.create',
  write_script: 'script.write',
  update_script: 'script.update',
  delete_script: 'script.delete',
  get_transcript: 'transcript.get',
  write_transcript: 'transcript.write',
  score_transcript: 'transcript.score',
  get_trigger_set: 'trigger-set.get',
  write_trigger_set: 'trigger-set.write',
  delete_trigger_set: 'trigger-set.delete',
  list_talents: 'talent.list',
  get_talent: 'talent.get',
  upsert_talent: 'talent.upsert',
  list_rigs: 'rig.list',
  save_rig: 'rig.save',
  rename_rig: 'rig.rename',
  delete_rig: 'rig.delete',
  remember_layout: 'rig.remember-layout',
  approve_pending: 'pending.approve',
  list_pending: 'pending.list',
  system_status: 'system.status',
  system_quit: 'system.quit',
  system_restart: 'system.restart',
};

export const SNAKE_NAME: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(DOTTED_NAME).map(([snake, dotted]) => [dotted, snake]),
);

for (const meta of CAPABILITIES) {
  if (!DOTTED_NAME[meta.name])
    throw new Error(`agent-layer: published verb "${meta.name}" has no family.verb name`);
}

/* ------------------------------------------------------------------ *
 * Refusals — the suite's names, frozen numbers
 * ------------------------------------------------------------------ */

/**
 * ASSIGNED ONCE, NEVER RENUMBERED. Append with the next free number in
 * -32002…-32099 (skipping the suite's). Pinned against the committed
 * `api/openrpc.json` in `test/agent-layer.test.ts`.
 */
export const FAILURE_CODES = defineFailureCodes({
  'invalid-input': JSONRPC_CODES.invalidParams,
  'unknown-capability': JSONRPC_CODES.methodNotFound,
  internal: JSONRPC_CODES.internalError,
  'not-found': -32002,
  'domain-invalid': -32003,
  conflict: -32004,
  'confirmation-required': -32005,
  'confirmation-invalid': -32006,
  'rate-limited': -32007,
  unavailable: -32008,
});

const MODE_OF_CODE: Record<ErrorCode, string> = {
  not_found: 'not-found',
  invalid_input: 'invalid-input',
  domain_invalid: 'domain-invalid',
  conflict: 'conflict',
  permission_denied: 'forbidden',
  confirmation_required: 'confirmation-required',
  confirmation_invalid: 'confirmation-invalid',
  rate_limited: 'rate-limited',
  unavailable: 'unavailable',
  internal: 'internal',
  app_busy: 'app-busy',
};

/**
 * The suite name for a refusal. An open-contract refusal (`context_select`)
 * carries its own suite name in `details.refused.code` — that name wins, so a
 * caller reads `unknown-brand`, not the generic `not-found` it maps to on
 * `/api/invoke`.
 */
export function failureModeOf(error: CapabilityError): string {
  const refused = (error.details as { refused?: { code?: unknown } } | undefined)?.refused?.code;
  if (typeof refused === 'string' && refused in SUITE_FAILURE_CODES) return refused;
  return MODE_OF_CODE[error.code] ?? 'internal';
}

/* ------------------------------------------------------------------ *
 * Contracts
 * ------------------------------------------------------------------ */

const kebab = (code: string): string => MODE_OF_CODE[code as ErrorCode] ?? code.replace(/_/g, '-');

const contractFor = (meta: CapabilityMeta): CapabilityContract => {
  const lifecycle = (LIFECYCLE_CAPABILITIES as Record<string, CapabilityContract>)[
    DOTTED_NAME[meta.name]!
  ];
  if (lifecycle) return lifecycle;
  const humanOnly = !meta.principals.includes('agent');
  const schema = INPUT[meta.name];
  return defineCapability({
    kind: meta.kind,
    description: meta.summary,
    input: schema
      ? (z4.fromJSONSchema(toJsonSchema(schema) as never) as z4.ZodType)
      : z4.object({}),
    output: z4.unknown(),
    sideEffects: meta.sideEffects,
    idempotent: meta.idempotent,
    confirmationRequired: meta.confirmationRequired,
    failureModes: meta.failureModes.map(kebab),
    humanOnly,
    ...(humanOnly ? { principals: ['human'] as const } : {}),
  });
};

/** The set as fli-core contracts, keyed by `family.verb`. */
export const TELETUBBY_CAPABILITIES: Readonly<Record<string, CapabilityContract>> =
  defineCapabilities(
    Object.fromEntries(CAPABILITIES.map((meta) => [DOTTED_NAME[meta.name]!, contractFor(meta)])),
  );

/** The contract for a published (snake) name. */
export const contractOf = (snake: string): CapabilityContract | undefined =>
  TELETUBBY_CAPABILITIES[DOTTED_NAME[snake] ?? ''];

/* ------------------------------------------------------------------ *
 * Principals — who is calling, by name
 * ------------------------------------------------------------------ */

/** The renderer's name for itself. */
export const UI_PRINCIPAL = 'human:prompter';
/** A caller over HTTP that did not name itself. */
export const ANONYMOUS_AGENT = 'agent:http';

/* ------------------------------------------------------------------ *
 * The spec
 * ------------------------------------------------------------------ */

export const RPC_PATH = '/api/rpc';

export function teletubbyOpenRpc(version = 'api1'): OpenRpcDocument {
  return toOpenRpc({
    title: 'Teletubby capability API',
    version,
    description:
      'The teleprompter that shows and edits scripts. Every client — the prompter window, `bin/teletubby.mjs`, ' +
      '`POST /api/invoke` (snake names) and `POST /api/rpc` (these family.verb names) — calls one seam, ' +
      '`core.invoke`. Port and bearer token: `~/Library/Application Support/teletubby/control.json`. ' +
      'Name yourself in `x-fli-principal: agent:<name>`.',
    servers: [
      {
        name: 'loopback',
        url: 'http://127.0.0.1:{port}/api/rpc',
        summary: 'Loopback only; the port and token are in the control file.',
        variables: { port: { default: '7111' } },
      },
    ],
    capabilities: TELETUBBY_CAPABILITIES as Record<string, CapabilityContract>,
    codes: FAILURE_CODES,
    refusalDetails: SUITE_REFUSAL_DETAILS,
    alwaysPossible: ['forbidden', 'invalid-input', 'unknown-capability', 'rate-limited', 'internal'],
    generatedBy: 'src/core/agent-layer.ts (npm run api:openrpc)',
  });
}
