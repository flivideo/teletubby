/**
 * THE CAPABILITY CATALOG — what the application can do, said once.
 *
 * Every verb Teletubby has lives in this list, with a typed contract and
 * metadata about its nature. The renderer reaches it over IPC, an agent reaches
 * it over loopback HTTP, and the CLI is a `fetch()` wrapper over that. None of
 * the three is privileged and none of them holds business logic.
 *
 * Why the catalog is DATA and not just a set of functions: it is the thing the
 * safety gate reads (`sideEffects`, `principals`, `confirmationRequired`), the
 * thing `describe_capabilities` returns, and the thing `test/capability-surface`
 * pins. One declaration, several projections.
 *
 * ⚠️ Metadata is NEVER enforcement. `destructive: true` here is a claim used to
 * decide how carefully to treat a verb; the *enforcement* lives in
 * `src/core/safety.ts`, beneath every adapter. See agent-safety.md §2.
 *
 * ⚠️ Adding a verb here fails `test/capability-surface.test.ts` until the
 * published set is updated deliberately. That is on purpose — it is the one
 * enforcement mechanism the brain says to build if you build only one.
 */

/* ------------------------------------------------------------------ *
 * Principals — the agent is not the user
 * ------------------------------------------------------------------ */

/**
 * `ui`    — the renderer, over the typed IPC bridge. A human is at the keyboard.
 * `agent` — anything reaching the loopback control server: Claude Code, the
 *           CLI, a script. Strictly NARROWER than `ui`.
 *
 * The narrowing is not cosmetic. A human clicking *delete* has read the label
 * and aimed a cursor; an agent can call a destructive verb fifty times in three
 * seconds because a retrieved document told it to (agent-safety.md §0).
 */
export const PRINCIPALS = ['ui', 'agent'] as const;
export type Principal = (typeof PRINCIPALS)[number];

/* ------------------------------------------------------------------ *
 * Classification
 * ------------------------------------------------------------------ */

export const SIDE_EFFECTS = [
  'read-only',
  'reversible-write',
  'destructive',
  'external-side-effect',
] as const;
export type SideEffect = (typeof SIDE_EFFECTS)[number];

export type CapabilityKind = 'query' | 'command';

/**
 * Failure modes are part of the contract. An agent that cannot tell *why*
 * something failed retries the same call, gives up, or invents a workaround —
 * "opaque error semantics" is a named structural mismatch between CRUD APIs and
 * autonomous callers.
 */
export const ERROR_CODES = [
  'not_found',
  'invalid_input',
  'domain_invalid',
  'conflict',
  'permission_denied',
  'confirmation_required',
  'confirmation_invalid',
  'rate_limited',
  'unavailable',
  'internal',
  /** A quit or restart would interrupt the talent mid-session (fli-core `app-busy`). */
  'app_busy',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export interface CapabilityMeta {
  name: string;
  /** One line, written for a caller that has never seen this app. */
  summary: string;
  kind: CapabilityKind;
  sideEffects: SideEffect;
  /** Which surfaces may invoke it. A verb absent from `agent` is UI-only. */
  principals: readonly Principal[];
  /** Same input, same effect, however many times. */
  idempotent: boolean;
  /** Refuses to execute without an approved confirmation. */
  confirmationRequired: boolean;
  /** Accepts `dryRun: true` and returns a preview instead of acting. */
  supportsDryRun: boolean;
  /**
   * Whether a real change here wakes every other client.
   *
   * True for anything that changes the DATA — that is the whole reason the
   * Event primitive exists, so an agent's edit reaches the window without a
   * restart. False for a command that only records the human's own working
   * state: their selection, their arrangement. Broadcasting those makes every
   * window re-fetch the entire set each time the talent nudges a divider, on a
   * channel whose meaning is "the data changed underneath you".
   */
  announces: boolean;
  /** Honours `idempotencyKey` and replays the original result on retry. */
  supportsIdempotencyKey: boolean;
  failureModes: readonly ErrorCode[];
}

const READ_FAILURES = ['not_found', 'invalid_input', 'permission_denied'] as const;
const WRITE_FAILURES = [
  'not_found',
  'invalid_input',
  'domain_invalid',
  'conflict',
  'permission_denied',
  'rate_limited',
] as const;

const query = (
  name: string,
  summary: string,
  extra: Partial<CapabilityMeta> = {},
): CapabilityMeta => ({
  name,
  summary,
  kind: 'query',
  sideEffects: 'read-only',
  principals: PRINCIPALS,
  idempotent: true,
  confirmationRequired: false,
  supportsDryRun: false,
  supportsIdempotencyKey: false,
  announces: false,
  failureModes: READ_FAILURES,
  ...extra,
});

const command = (
  name: string,
  summary: string,
  extra: Partial<CapabilityMeta> = {},
): CapabilityMeta => ({
  name,
  summary,
  kind: 'command',
  sideEffects: 'reversible-write',
  principals: PRINCIPALS,
  idempotent: false,
  confirmationRequired: false,
  supportsDryRun: true,
  supportsIdempotencyKey: true,
  announces: true,
  failureModes: WRITE_FAILURES,
  ...extra,
});

/**
 * A destructive verb: not recoverable from data we retain, so it requires
 * preview → confirm → execute (agent-safety.md §4).
 */
const destructive = (name: string, summary: string): CapabilityMeta =>
  command(name, summary, {
    sideEffects: 'destructive',
    confirmationRequired: true,
    failureModes: [...WRITE_FAILURES, 'confirmation_required', 'confirmation_invalid'],
  });

/* ------------------------------------------------------------------ *
 * The published set
 * ------------------------------------------------------------------ */

export const CAPABILITIES: readonly CapabilityMeta[] = [
  /* --- self-description ------------------------------------------- */
  query(
    'describe_capabilities',
    'List every capability with its contract, so a caller that has never seen this app can learn it.',
    { failureModes: [] },
  ),

  /* --- ambient context -------------------------------------------- */
  query(
    'get_active_context',
    'What the talent has open right now: set, script, transcript, trigger style, beat. Expires; degrades to {active:false, hint} rather than erroring.',
    { failureModes: [] },
  ),
  command(
    'set_active_context',
    "Record what the talent has open. UI ONLY — an agent forging the human's selection is a wrong-target bug with no error.",
    {
      // NOT on the agent surface. This is the human's selection, and most verbs
      // default to it; an agent that could set it could aim every other verb.
      principals: ['ui'],
      idempotent: true,
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      // The talent moving through their own script is not news to anybody.
      announces: false,
    },
  ),

  /* --- open context (door 3) — brand + project, W6 -------------------
   *
   * Both doors set the SAME session-scoped context (C1, C2): launch
   * arguments at startup, and `context_select` here while running, with no
   * restart (C4). Neither principal is withheld — unlike `set_active_context`
   * (the human's in-app selection), aiming Teletubby at a project is exactly
   * what FliStudio's launch/switch buttons are for (open-contract §3.1, D11).
   */
  query(
    'context_get',
    'The brand and project Teletubby is currently pointed at, if any — the same shape context_select returns.',
    { failureModes: [] },
  ),
  command(
    'context_select',
    'Point Teletubby at a brand and project (door 3). Sets the SESSION context only — never written to the store (C2) — and is what list_sets filters by. Refuses and says why rather than falling back to the previous project (C3); a refusal leaves the previous context untouched.',
    {
      idempotent: true,
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      // A refusal FAILS, with `details: { context, refused }` — the same
      // statuses FliHub (W3) returns: missing → invalid_input (400),
      // unknown-brand / project-not-found → not_found (404),
      // project-ambiguous → conflict (409), no-brand-root /
      // registry-unreadable → unavailable (503). The refusal is still recorded,
      // so context_get shows it.
      failureModes: ['invalid_input', 'not_found', 'conflict', 'unavailable'],
    },
  ),

  /* --- reading ----------------------------------------------------- */
  query(
    'list_sets',
    'The script sets available — the set is the unit, not the script. Filtered to the open project once a context is set (pass allSets to see everything).',
  ),
  query('get_set', 'One set with a summary per script, scannable in one sitting.'),
  query('get_script', 'One script with all its transcripts and trigger sets.'),
  query('get_transcript', 'One transcript: topics, paragraphs, and its trigger sets.'),
  query('get_trigger_set', 'One trigger style for one transcript, with its own map.'),
  query('list_talents', 'Every talent, with the cadence envelope measured for them.'),
  query('get_talent', 'One talent and their measured envelope.'),
  query(
    'score_transcript',
    "Score a transcript against a talent's measured envelope. Eight deterministic threshold rules — no model, no listening, no transcript of a take.",
  ),

  /* --- writing ----------------------------------------------------- */
  command(
    'create_set',
    'Create an empty script set, optionally attached to a FliHub project (full folder name, verbatim).',
    {
      failureModes: [...WRITE_FAILURES],
    },
  ),
  command(
    'rename_set',
    'Change a set’s TITLE, and/or ATTACH an unattached set to its FliHub project. Never changes an attached project — that is a move, not a rename, and moves are not built.',
    {
      failureModes: [...WRITE_FAILURES],
    },
  ),
  command(
    'set_export_to_project',
    "Write a set's data into its project's fli.tubby.json (W6). Requires the open context to match the set's project. Never deletes the app-store copy — it is marked exportedTo instead, so a caller reading the store directly is not misled into thinking it is still live.",
    { failureModes: [...WRITE_FAILURES] },
  ),
  command('create_script', 'Add a script to a set, optionally with its provenance transcript.'),
  command(
    'write_script',
    'Add or replace one small NAMED script in the open project from plain text — an intro, a title, a CTA an AI conversation wrote. Optional video tag and caller-authored trigger words. Returns the previous version.',
  ),
  command(
    'update_script',
    'Change a script’s title, takeaway or summary. Returns the previous values.',
  ),
  command(
    'write_transcript',
    'Create or replace a transcript on a script — provenance or cadence, with its topics and paragraphs. Returns the previous version.',
  ),
  command(
    'write_trigger_set',
    'Author one trigger style (A/B/C) for a transcript, with its own trigger→paragraph map. THE verb an agent uses to fill column 2. Returns the previous set.',
  ),
  command('upsert_talent', 'Create or update a talent and their measured cadence envelope.'),

  /* --- removal ----------------------------------------------------- */
  destructive('delete_trigger_set', 'Remove one trigger style from a transcript.'),
  destructive('delete_script', 'Remove a script and every transcript on it.'),
  destructive('delete_rig', 'Remove a saved rig. The arrangement on screen is not disturbed.'),

  /* --- rigs: the arrangement in front of the talent ----------------- */
  query(
    'list_rigs',
    'Every saved rig, plus the workspace — the layout the talent last had on screen and the rig it came from.',
    { failureModes: [] },
  ),
  command(
    'save_rig',
    'Create or replace a named rig: which zones are on screen, which one is driven, the camera edge, the text preset. Layout only — never which script or corpus. Returns the previous rig.',
    { failureModes: [...WRITE_FAILURES] },
  ),
  command(
    'rename_rig',
    'Change a rig’s name without touching its layout. Returns the previous name.',
  ),
  command(
    'remember_layout',
    'Record the arrangement the talent has on screen, so the next launch opens the way they left it. UI ONLY — an agent that could set it would decide what the talent sees tomorrow.',
    {
      // Same reasoning as `set_active_context`, and for the same reason: this is
      // the human's own working state, not a fact about the data. An agent
      // writing it changes what appears in front of a person at the START of a
      // take, which is precisely when nobody is watching the screen.
      principals: ['ui'],
      idempotent: true,
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      // Fires on every nudge of a divider. Waking every window to re-fetch the
      // whole set for that would be a busy loop wearing an event's clothes.
      announces: false,
    },
  ),

  /* --- the confirmation channel ------------------------------------ */
  command(
    'approve_pending',
    'Approve a previewed destructive action. UI ONLY — the mechanism that satisfies a control must never be reachable through the surface that control constrains.',
    {
      // ImageDrip built a human confirmation gate and then published the verb
      // that ANSWERS it on the agent surface. Do not become the second
      // instance. (agent-safety.md §4, field-notes §2.1)
      principals: ['ui'],
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      failureModes: ['not_found', 'invalid_input', 'permission_denied', 'confirmation_invalid'],
    },
  ),
  query('list_pending', 'Previewed destructive actions awaiting a human decision. UI ONLY.', {
    principals: ['ui'],
    failureModes: [],
  }),

  /* The stage — agent-callable since the d04 preflight (2026-09-23): an agent
   * may choose what is on stage ONLY while the talent is not on the
   * prompter; mid-take it refuses app_busy. The window applies the request. */
  command(
    'stage_select',
    'Put a set (and optionally one script) on stage. Refused (app_busy) while the talent is on the prompter. The window applies it; read the result from list_rigs → workspace.position.',
    {
      supportsIdempotencyKey: false,
      failureModes: ['not_found', 'invalid_input', 'app_busy', 'unavailable'],
    },
  ),
  query(
    'stage_get',
    'The latest stage request (who asked, what, when) and whether the talent is busy.',
    { failureModes: [] },
  ),

  /* Lifecycle — fli-core's LIFECYCLE_CAPABILITIES (system.status / quit /
   * restart), bound here. The reply goes out BEFORE the process does. Quit
   * and restart refuse `app_busy` while the talent is on the prompter;
   * `force` is human-only (fli-core's fence, applied in core.invoke). */
  query(
    'system_status',
    'Is the app up, which run is it, what project is open, and is the talent mid-session (busy).',
    { failureModes: [] },
  ),
  /* Bring the window in front (FliStudio's "open it for me"). Changes no
   * data, so it wakes nobody; it moves nothing on stage, so it is not
   * busy-gated — the talent mid-take is already looking at this window. */
  command(
    'system_show',
    'Bring the prompter window in front: create it if none, restore if minimised, raise and focus it. Replies with visible/focused READ from the window, never assumed.',
    {
      sideEffects: 'external-side-effect',
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      announces: false,
      failureModes: ['unavailable'],
    },
  ),
  command(
    'system_quit',
    'Quit Teletubby. Refused (app_busy) while the talent is on the prompter, unless a person forces it.',
    {
      sideEffects: 'external-side-effect',
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      announces: false,
      failureModes: ['app_busy', 'permission_denied'],
    },
  ),
  command(
    'system_restart',
    'Quit and start again on the same brand and project (scripts/app.sh restart). Refused (app_busy) like quit.',
    {
      sideEffects: 'external-side-effect',
      supportsDryRun: false,
      supportsIdempotencyKey: false,
      announces: false,
      failureModes: ['app_busy', 'permission_denied', 'unavailable'],
    },
  ),
] as const;

export type CapabilityName = (typeof CAPABILITIES)[number]['name'];

export const CAPABILITY_BY_NAME: ReadonlyMap<string, CapabilityMeta> = new Map(
  CAPABILITIES.map((capability) => [capability.name, capability]),
);

/** Names reachable by a given principal, sorted — used by the pinning test. */
export function capabilityNamesFor(principal: Principal): string[] {
  return CAPABILITIES.filter((capability) => capability.principals.includes(principal))
    .map((capability) => capability.name)
    .sort();
}

/* ------------------------------------------------------------------ *
 * The wire envelope — one shape for every adapter
 * ------------------------------------------------------------------ */

export interface InvokeRequest {
  capability: string;
  input?: unknown;
  /** Retry-safe key. On repeat the ORIGINAL result comes back, not a new one. */
  idempotencyKey?: string;
}

export interface CapabilityError {
  code: ErrorCode;
  /** The suite's kebab name for this refusal (fli-core), with a frozen JSON-RPC number. */
  failureMode?: string;
  message: string;
  /** Structural detail an agent can act on — which field, which id. */
  details?: unknown;
}

export type InvokeResult<T = unknown> =
  { ok: true; data: T; replayed?: boolean } | { ok: false; error: CapabilityError };
