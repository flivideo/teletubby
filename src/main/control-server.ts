/**
 * THE CONTROL SURFACE — a loopback HTTP server inside Electron main.
 *
 * This is the whole reason an agent can drive Teletubby. AppyTron apps are
 * agent-unreachable by default because they are windows: ~46 IPC channels that
 * terminate inside the renderer look like a verb catalog and reach nothing.
 * This is that catalog's sibling — the same verbs, also reachable from outside.
 *
 * It is an ADAPTER. It parses a request, names the principal `agent`, and calls
 * `core.invoke`. It holds no business logic, no authorization decisions and no
 * knowledge of what a script is. Delete it and every rule still holds, because
 * the gate is beneath it and the renderer's IPC path runs through the same one.
 *
 * WHY THE SERVER IS IN MAIN, NOT THE RENDERER.
 * The renderer's CSP is `self`-only and stays that way (spec Boundaries). A
 * capability that lives in the UI process is not externally reachable no matter
 * what the catalog says — Open Design shipped an `od export` verb that can
 * never succeed headlessly for exactly that reason. Everything reachable here
 * lives in main, so nothing here is a false promise.
 *
 * ADDRESSING. 127.0.0.1:7111, the slot already reserved in
 * `~/.config/appydave/apps.json`. Never 0.0.0.0 — this is an unattended local
 * surface with write verbs on it.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import {
  PRINCIPAL_HEADER,
  answerJsonRpc,
  bearerMatches,
  newControlToken,
  removeControlFile,
  renderApiPage,
  writeControlFile,
  type CallAnswer,
} from '@flivideo/core';
import type { Core } from '../core/index.js';
import { FAILURE_CODES, RPC_PATH, SNAKE_NAME, teletubbyOpenRpc } from '../core/agent-layer.js';
import type { InvokeResult } from '@shared/capabilities';

/**
 * THE AGENT-DRIVABLE ROUTES (fli-core v0.7.0, 2026-09-23). Same seam, more
 * projections — nothing below decides anything `core.invoke` does not:
 *
 *   POST /api/invoke      snake names (`write_script`) — unchanged, the CLI's door
 *   POST /api/rpc         JSON-RPC 2.0, family.verb names (`script.write`)
 *   GET  /api/openrpc.json  the spec (committed as api/openrpc.json) — no token
 *   GET  /api/docs        the reference page — no token, read-only
 *   GET  /api/console     pick a verb, fill the fields, fire it as agent:console
 *   GET  /api/session     the console's token, same-origin pages only
 *
 * The caller names itself in `x-fli-principal` (agent:<name> or cli). A name
 * claiming to be human is refused in the core: nothing over HTTP is a person.
 */

export const CONTROL_PORT = 7111;

export interface ControlServerOptions {
  core: Core;
  /** Where the discovery file goes — `app.getPath('userData')` in production. */
  userDataPath: string;
  port?: number;
  appVersion: string;
  log?: (message: string, detail?: unknown) => void;
}

export interface ControlServerHandle {
  port: number;
  /** The interface actually bound. Always 127.0.0.1; asserted by a test. */
  address: string;
  token: string;
  discoveryPath: string;
  close(): Promise<void>;
}

/** Body cap. An agent has no reason to post a megabyte, and a stall is a bug. */
const MAX_BODY_BYTES = 1_000_000;

const json = (response: ServerResponse, status: number, body: unknown): void => {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    // Not a browser surface. Nothing about this should be reachable from a page.
    'access-control-allow-origin': 'null',
    'x-content-type-options': 'nosniff',
  });
  response.end(payload);
};

const readBody = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new Error('request body too large');
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
};

/** The caller's own name for itself, or undefined (the core then says agent:http). */
const principalOf = (request: IncomingMessage): string | undefined => {
  const named = request.headers[PRINCIPAL_HEADER];
  return typeof named === 'string' && named.trim() ? named.trim() : undefined;
};

/** The generated page runs one inline script: allow exactly that script by its hash, nothing else. */
const sendPage = (response: ServerResponse, html: string): void => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    (m) => `'sha256-${createHash('sha256').update(m[1] ?? '').digest('base64')}'`,
  );
  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy':
      `default-src 'none'; script-src ${scripts.join(' ')}; style-src 'unsafe-inline'; ` +
      "connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    'x-content-type-options': 'nosniff',
  });
  response.end(html);
};

/**
 * Start the control surface.
 *
 * FAILS CLOSED. If the discovery file cannot be written, the server does not
 * start — because a running surface nobody can address is worse than no
 * surface: the agent falls back to guessing, and the logs report success.
 * Absence of confirmation is not confirmation of absence.
 */
export async function startControlServer(
  options: ControlServerOptions,
): Promise<ControlServerHandle> {
  const port = options.port ?? CONTROL_PORT;
  const log = options.log ?? ((): void => undefined);

  // Minted per launch rather than stored. A stable secret on disk outlives the
  // app that issued it; this one dies with the window.
  const token = newControlToken();
  const discoveryPath = join(options.userDataPath, 'control.json');

  const server: Server = createServer((request, response) => {
    void handle(request, response).catch((error: unknown) => {
      log('control request failed', error);
      json(response, 500, {
        ok: false,
        error: {
          code: 'internal',
          message: error instanceof Error ? error.message : String(error),
        },
      });
    });
  });

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');

    // Unauthenticated, and deliberately says nothing but "something is here".
    // It exists so the CLI can tell "app not running" from "wrong token" —
    // the failure mode Open Design's MCP server also thought about.
    if (request.method === 'GET' && url.pathname === '/api/health') {
      json(response, 200, {
        ok: true,
        app: 'teletubby',
        version: options.appVersion,
        port: (server.address() as { port: number } | null)?.port ?? port,
      });
      return;
    }

    // The spec and the reference page are read-only and safe unauthenticated —
    // the whole point is that an agent can read the surface before it has a
    // token. The console is the same page plus a Fire button; it fetches its
    // token from /api/session, which only a same-origin page may read.
    if (request.method === 'GET' && url.pathname === '/api/openrpc.json') {
      json(response, 200, openRpc());
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/docs') {
      sendPage(response, renderApiPage(openRpc(), { otherPage: { href: '/api/console', label: 'Console' } }));
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/console') {
      sendPage(
        response,
        renderApiPage(openRpc(), {
          console: { rpcPath: RPC_PATH, principal: 'agent:console', tokenPath: '/api/session' },
          otherPage: { href: '/api/docs', label: 'Reference' },
        }),
      );
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/session') {
      // Browsers set Sec-Fetch-Site; another site's page gets `cross-site`. A
      // local process can still read control.json — the token keeps out the
      // web, not you.
      if (request.headers['sec-fetch-site'] !== 'same-origin') {
        json(response, 403, {
          ok: false,
          error: { code: 'permission_denied', failureMode: 'forbidden', message: 'the session token is for Teletubby’s own pages' },
        });
        return;
      }
      json(response, 200, { token });
      return;
    }

    if (!bearerMatches(request.headers.authorization, token)) {
      json(response, 401, {
        ok: false,
        error: {
          code: 'permission_denied',
          message: `missing or invalid bearer token — read it from ${discoveryPath}`,
        },
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/capabilities') {
      json(
        response,
        200,
        await options.core.invoke('describe_capabilities', {}, { principal: 'agent' }),
      );
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/invoke') {
      const body = (await readBody(request)) as {
        capability?: unknown;
        input?: unknown;
        idempotencyKey?: unknown;
      };
      if (typeof body.capability !== 'string') {
        json(response, 400, {
          ok: false,
          error: {
            code: 'invalid_input',
            message: '"capability" must be a string',
          },
        });
        return;
      }
      const result: InvokeResult = await options.core.invoke(body.capability, body.input ?? {}, {
        // The SURFACE is set here and cannot be supplied by the caller:
        // anything that reaches this server is an agent or the CLI, whatever
        // it claims. Its NAME is its own (`x-fli-principal`).
        principal: 'agent',
        as: principalOf(request),
        idempotencyKey: typeof body.idempotencyKey === 'string' ? body.idempotencyKey : undefined,
      });
      json(response, result.ok ? 200 : statusFor(result), result);
      return;
    }

    if (request.method === 'POST' && url.pathname === RPC_PATH) {
      const as = principalOf(request);
      const answer = await answerJsonRpc(
        await readBody(request),
        async (method, params): Promise<CallAnswer> => {
          const snake = SNAKE_NAME[method];
          if (!snake)
            return {
              ok: false,
              error: {
                failureMode: 'unknown-capability',
                message: `no capability "${method}"`,
                details: { available: Object.keys(SNAKE_NAME).sort() },
              },
            };
          const result = await options.core.invoke(snake, params, { principal: 'agent', as });
          if (result.ok) return { ok: true, value: result.data };
          const { failureMode, message, details } = result.error;
          return {
            ok: false,
            error: { failureMode: failureMode ?? 'internal', message, ...(details === undefined ? {} : { details }) },
          };
        },
        {
          codes: FAILURE_CODES,
          names: { unknownCapability: 'unknown-capability', invalidInput: 'invalid-input', internal: 'internal' },
        },
      );
      if (answer === null) {
        response.writeHead(204).end();
        return;
      }
      json(response, 200, answer);
      return;
    }

    json(response, 404, {
      ok: false,
      error: {
        code: 'not_found',
        message: `no route ${request.method} ${url.pathname}`,
        details: {
          routes: [
            'GET /api/health',
            'GET /api/openrpc.json',
            'GET /api/docs',
            'GET /api/console',
            'GET /api/capabilities',
            'POST /api/invoke',
            `POST ${RPC_PATH}`,
          ],
        },
      },
    });
  }

  // Built once: the catalog is fixed for the life of the process.
  let doc: ReturnType<typeof teletubbyOpenRpc> | null = null;
  const openRpc = (): ReturnType<typeof teletubbyOpenRpc> => (doc ??= teletubbyOpenRpc());

  const closeServer = (): Promise<void> =>
    new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

  /**
   * Stop listening AND take the control file down, so a reader sees `absent`
   * rather than a door that no longer answers. `removeControlFile` only
   * removes it while it is still this process's — a newer run's file survives.
   */
  const close = async (): Promise<void> => {
    await closeServer();
    await removeControlFile(discoveryPath, process.pid).catch(() => false);
  };

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    // 127.0.0.1 only. Binding wider would publish write verbs to the network.
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  // Read the port BACK from the socket rather than trusting the requested one.
  // With `port: 0` the OS assigns it, and a handle that reported the request
  // instead of the reality would hand every caller an address nothing is
  // listening on — which fails as a connection error, not as a config error.
  const address = server.address();
  const boundPort = typeof address === 'object' && address !== null ? address.port : port;
  const boundAddress =
    typeof address === 'object' && address !== null ? address.address : '127.0.0.1';

  // FAILS CLOSED, and only now — the discovery file has to carry the port that
  // is actually bound. A surface nobody can address is worse than no surface:
  // the caller falls back to guessing and the log reports success.
  try {
    // fli-core's shape and mode (0600, with pid), so every Fli reader —
    // FliStudio's included — reads it the same way, and `stale` when the pid
    // is gone.
    await writeControlFile(discoveryPath, {
      port: boundPort,
      token,
      pid: process.pid,
      startedAt: new Date().toISOString(),
      version: options.appVersion,
    });
  } catch (error) {
    await closeServer();
    throw error;
  }

  log(`control surface listening on http://127.0.0.1:${boundPort} (token in ${discoveryPath})`);

  return {
    port: boundPort,
    address: boundAddress,
    token,
    discoveryPath,
    close,
  };
}

/** Map a capability error onto a status a `fetch()` caller can branch on. */
function statusFor(result: InvokeResult): number {
  if (result.ok) return 200;
  switch (result.error.code) {
    case 'not_found':
      return 404;
    case 'invalid_input':
    case 'domain_invalid':
      return 400;
    case 'permission_denied':
    case 'confirmation_required':
    case 'confirmation_invalid':
      return 403;
    case 'conflict':
    case 'app_busy':
      return 409;
    case 'rate_limited':
      return 429;
    case 'unavailable':
      return 503;
    default:
      return 500;
  }
}
