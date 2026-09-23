/**
 * THE CAPABILITY CORE — one API, N clients, none privileged.
 *
 *              ┌─ renderer (IPC) ──┐
 *              │                   │
 *              ├─ agent (HTTP) ────┼──►  core.invoke  ──►  [GATE]  ──►  handler  ──►  repository
 *              │                   │
 *              └─ CLI (fetch) ─────┘
 *
 * The bar is not "an API exists". It is **can the agent do what the UI can do**,
 * against the same store, with no window open. Everything the renderer will do
 * in sessions 2 and 3 goes through this function, which is what keeps that true
 * — a capability wired straight into the UI is unreachable from outside no
 * matter what the catalog says, and that failure is invisible until someone
 * tries it.
 *
 * `createCore` takes a repository and nothing else. No Electron, no HTTP, no
 * filesystem assumption — which is why the whole surface is testable in a node
 * environment with a MemoryRepository.
 */

import { authorize, principalKind } from '@flivideo/core';
import type { CapabilityMeta, InvokeResult, Principal } from '@shared/capabilities';
import { ActiveContextHolder } from './active-context.js';
import {
  ANONYMOUS_AGENT,
  DOTTED_NAME,
  UI_PRINCIPAL,
  contractOf,
  failureModeOf,
} from './agent-layer.js';
import { createHandlers, type Handler, type HandlerContext } from './handlers.js';
import { OpenContextHolder } from './open-context.js';
import type { Repository } from './repository.js';
import {
  AuditLog,
  CapabilityFailure,
  ConfirmationLedger,
  IdempotencyLedger,
  RateLimiter,
  assertPrincipalMay,
  resolveCapability,
  systemClock,
  type AuditEntry,
  type Clock,
} from './safety.js';

export interface CoreOptions {
  repository: Repository;
  /** Injectable so every time-dependent control is testable without sleeping. */
  clock?: Clock;
  /** Where audit entries go beyond the in-memory ring — a logger, usually. */
  auditSink?: (entry: AuditEntry) => void;
  /**
   * The process around the core, for `system_status` / `system_quit` /
   * `system_restart`. Absent in tests and headless use — those verbs then
   * answer `unavailable` rather than pretending.
   */
  lifecycle?: LifecycleHooks;
}

/** What only the host process can do. The core decides WHETHER; the host does it. */
export interface LifecycleHooks {
  app: string;
  version: string;
  pid: number;
  startedAt: string;
  /** Called after the reply is sent. */
  quit(): void;
  /** Called after the reply is sent, with the context to reopen on. */
  restart(open: { brand: string; project: string } | null): void;
}

export interface InvokeOptions {
  principal: Principal;
  /**
   * Who is calling, by name (fli-core): `human:<surface>`, `agent:<name>` or
   * `cli`. Defaults to `human:prompter` over the UI bridge and `agent:http`
   * over HTTP. A name whose kind contradicts the surface is refused — nothing
   * reaching the HTTP door may call itself human.
   */
  as?: string;
  idempotencyKey?: string;
}

/**
 * Emitted after a command actually changes the DATA — not on a query, not on a
 * dry run, not on a refused call, and not for a command that records only the
 * human's own working state (`announces: false` in the catalog).
 *
 * This is the Event primitive, and it was earned rather than assumed: the
 * renderer loads once at startup, so an agent authoring a trigger set left the
 * store changed and the window stale. A client reduced to restarting is exactly
 * the signal that an event belongs here (capability-model.md §1).
 */
export interface ChangeEvent {
  capability: string;
  principal: Principal;
  at: number;
}

export interface Core {
  invoke(name: string, input: unknown, options: InvokeOptions): Promise<InvokeResult>;
  /** Subscribe to state changes. Returns an unsubscribe function. */
  onChange(listener: (event: ChangeEvent) => void): () => void;
  /** The renderer's own selection state, so the UI can drive it directly. */
  readonly active: ActiveContextHolder;
  /** The session's brand/project context (W6) — set by door 2 or `context_select`, never persisted. */
  readonly openContext: OpenContextHolder;
  readonly audit: AuditLog;
  readonly repository: Repository;
}

export function createCore(options: CoreOptions): Core {
  const clock = options.clock ?? systemClock;
  const active = new ActiveContextHolder(clock);
  const openContext = new OpenContextHolder();
  const confirmations = new ConfirmationLedger(clock);
  const idempotency = new IdempotencyLedger(clock);
  const limiter = new RateLimiter(clock);
  const audit = new AuditLog(1000, options.auditSink);
  const handlers = createHandlers();
  const listeners = new Set<(event: ChangeEvent) => void>();

  async function invoke(
    name: string,
    input: unknown,
    invokeOptions: InvokeOptions,
  ): Promise<InvokeResult> {
    const { principal } = invokeOptions;
    let capability: CapabilityMeta | undefined;
    let prior: unknown;
    const record = (ok: boolean, extra: Partial<AuditEntry> = {}): void =>
      audit.record({
        at: clock(),
        principal,
        capability: name,
        input,
        ok,
        prior,
        ...extra,
      });

    try {
      capability = resolveCapability(name);

      // 1 · The gate. Before anything else, and identical for every adapter.
      //     Two fences, both beneath every door: fli-core's ★ (`authorize`,
      //     by principal NAME and, for `force`, by input) and the surface
      //     gate this app has always had (`ui` vs `agent`).
      const principalName = invokeOptions.as ?? (principal === 'ui' ? UI_PRINCIPAL : ANONYMOUS_AGENT);
      const kind = principalKind(principalName);
      if (kind === null || (kind === 'human') !== (principal === 'ui'))
        throw new CapabilityFailure(
          'permission_denied',
          `"${principalName}" cannot call over the ${principal} surface — ` +
            (principal === 'ui' ? 'the prompter window is human' : 'name yourself agent:<name> or cli'),
          { capability: name, principal: principalName, surface: principal },
        );
      const gate = authorize(DOTTED_NAME[name]!, contractOf(name)!, principalName, input ?? {});
      if (!gate.ok)
        throw new CapabilityFailure('permission_denied', gate.refusal.message, gate.refusal.details);
      assertPrincipalMay(capability, principal);

      const envelope = (input ?? {}) as Record<string, unknown>;
      const dryRun = envelope.dryRun === true;
      const confirmationId =
        typeof envelope.confirmationId === 'string' ? envelope.confirmationId : undefined;
      const idempotencyKey =
        invokeOptions.idempotencyKey ??
        (typeof envelope.idempotencyKey === 'string' ? envelope.idempotencyKey : undefined);

      // 2 · Rate limit commands only. A read-only poll is the caller doing the
      //     right thing; a write loop is the thing a prompt cannot stop.
      if (capability.kind === 'command') limiter.check(principal);

      // 3 · Idempotency. A retry returns the ORIGINAL result, flagged, so the
      //     caller learns "it already happened" rather than having to tell
      //     "already done" apart from "failed".
      if (idempotencyKey && capability.supportsIdempotencyKey && !dryRun) {
        const recalled = idempotency.recall(name, idempotencyKey);
        if (recalled.hit) {
          record(true, { replayed: true, dryRun });
          return { ok: true, data: recalled.result, replayed: true };
        }
      }

      const handler: Handler | undefined = handlers[name];
      if (!handler)
        return {
          ok: false,
          error: {
            code: 'internal',
            message: `"${name}" is published but has no implementation`,
          },
        };

      const context: HandlerContext = {
        lifecycle: options.lifecycle,
        repository: options.repository,
        active,
        openContext,
        confirmations,
        principal,
        capability,
        dryRun,
        confirmationId,
        recordPrior: (value) => {
          prior = value;
        },
      };

      const data = await handler(input, context);

      if (idempotencyKey && capability.supportsIdempotencyKey && !dryRun)
        idempotency.remember(name, idempotencyKey, data);

      record(true, { dryRun });

      // Announce only a real change to the DATA. A query, a dry run and a
      // refused call all leave the store exactly as it was, and waking every
      // client for those would train them to ignore the event. Nor does a
      // command that records only the human's own working state — see
      // `announces` in the catalog.
      if (capability.kind === 'command' && capability.announces && !dryRun && didApply(data)) {
        const event: ChangeEvent = { capability: name, principal, at: clock() };
        for (const listener of listeners) {
          try {
            listener(event);
          } catch {
            // A broken listener must not fail the caller's write.
          }
        }
      }

      return { ok: true, data };
    } catch (error) {
      if (error instanceof CapabilityFailure) {
        record(false, { errorCode: error.code });
        const failure = error.toError();
        // The suite's name for it, on every door. An unknown verb is its own
        // name — `not-found` would read as "that set does not exist".
        failure.failureMode = capability ? failureModeOf(failure) : 'unknown-capability';
        return { ok: false, error: failure };
      }
      record(false, { errorCode: 'internal' });
      return {
        ok: false,
        error: {
          code: 'internal',
          failureMode: 'internal',
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  return {
    invoke,
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    active,
    openContext,
    audit,
    repository: options.repository,
  };
}

/**
 * A command returns `{ applied: false, ... }` when it previewed instead of
 * acting. Anything else that reached the end of a handler changed something.
 */
function didApply(data: unknown): boolean {
  return !(data && typeof data === 'object' && (data as { applied?: unknown }).applied === false);
}

export { MemoryRepository, FileRepository, seed, EMPTY_DOCUMENT } from './repository.js';
export type { Repository, RepositoryDocument } from './repository.js';
export { scoreAgainst, measure } from './cadence.js';
export type { CadenceScore, CadenceRule, CadenceMeasurements } from './cadence.js';
export { ActiveContextHolder, ACTIVE_CONTEXT_TTL_MS } from './active-context.js';
export type { ActiveContext } from './active-context.js';
export { OpenContextHolder, resolveOpenArgs, projectDirOf } from './open-context.js';
export type { OpenContext, OpenRefusal, OpenRefusalCode, OpenResolution, ContextReport } from './open-context.js';
export { readProjectSets, writeProjectSets, projectFilePath, PROJECT_FILE_NAME } from './project-store.js';
export { CONFIRMATION_TTL_MS } from './safety.js';
export type { AuditEntry } from './safety.js';
