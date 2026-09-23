import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { assertAppendOnly, openRpcText, readControlFile } from '@flivideo/core';
import { KYBERNESIS_PHASE_1, TALENTS } from '@shared/script-set';
import { CAPABILITIES } from '@shared/capabilities';
import { MemoryRepository, createCore, type Core, type LifecycleHooks } from '@core/index';
import {
  DOTTED_NAME,
  FAILURE_CODES,
  TELETUBBY_CAPABILITIES,
  teletubbyOpenRpc,
} from '../src/core/agent-layer';
import { UNCONVERTED } from '../src/core/zod3-json-schema';
import { startControlServer, type ControlServerHandle } from '../src/main/control-server';

/**
 * THE AGENT-DRIVABLE LAYER (fli-core v0.7.0) — contracts, the ★ fence, the
 * frozen refusal codes, the lifecycle verbs, and the doors that project them.
 */

const store = (): MemoryRepository =>
  new MemoryRepository({
    version: 1,
    sets: [JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1))],
    talents: JSON.parse(JSON.stringify(TALENTS)),
  });

/* ------------------------------------------------------------------ *
 * Contracts and codes
 * ------------------------------------------------------------------ */

describe('the contract projection', () => {
  it('gives every published verb a family.verb name and a contract', () => {
    for (const meta of CAPABILITIES) {
      expect(TELETUBBY_CAPABILITIES[DOTTED_NAME[meta.name]!], meta.name).toBeDefined();
    }
    expect(Object.keys(TELETUBBY_CAPABILITIES)).toHaveLength(CAPABILITIES.length);
  });

  it('converts every INPUT field — nothing falls through to "accept anything"', () => {
    teletubbyOpenRpc();
    expect(UNCONVERTED).toEqual([]);
  });

  it('makes EXACTLY the UI-only verbs human-only (★), plus force on quit/restart', () => {
    const star = Object.entries(TELETUBBY_CAPABILITIES)
      .filter(([, c]) => c.humanOnly === true)
      .map(([name]) => name)
      .sort();
    expect(star).toEqual(['context.set-active', 'pending.approve', 'pending.list', 'rig.remember-layout']);
    for (const verb of ['system.quit', 'system.restart'])
      expect(typeof TELETUBBY_CAPABILITIES[verb]!.humanOnly).toBe('object');
  });

  it('never renumbers a published refusal code', () => {
    // The table as first published with api/openrpc.json (2026-09-23). Append only.
    const PUBLISHED = {
      'invalid-input': -32602,
      'unknown-capability': -32601,
      internal: -32603,
      'not-found': -32002,
      'domain-invalid': -32003,
      conflict: -32004,
      'confirmation-required': -32005,
      'confirmation-invalid': -32006,
      'rate-limited': -32007,
      unavailable: -32008,
      forbidden: -32001,
      'app-busy': -32049,
      'unknown-brand': -32043,
      'project-not-found': -32038,
    };
    expect(assertAppendOnly(PUBLISHED, FAILURE_CODES)).toEqual([]);
  });

  /**
   * THE COMMITTED SPEC. `npm run api:openrpc` rewrites it; `npm run api:check`
   * (this test) fails when it is stale — a verb, a field or a code changed and
   * nobody regenerated the document an outside caller reads.
   */
  it('api/openrpc.json is current', () => {
    const file = join(__dirname, '..', 'api', 'openrpc.json');
    const text = openRpcText(teletubbyOpenRpc());
    if (process.env.UPDATE_OPENRPC === '1') {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, text);
    }
    expect(existsSync(file), 'run: npm run api:openrpc').toBe(true);
    expect(readFileSync(file, 'utf8'), 'stale — run: npm run api:openrpc').toBe(text);
  });
});

/* ------------------------------------------------------------------ *
 * The fence, in the one seam
 * ------------------------------------------------------------------ */

describe('the ★ fence in core.invoke', () => {
  const core = createCore({ repository: store() });

  it('refuses an agent a human-only verb, with the suite name and typed details', async () => {
    const result = await core.invoke('set_active_context', { setId: 'x' }, { principal: 'agent', as: 'agent:claude' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatchObject({ code: 'permission_denied', failureMode: 'forbidden' });
    expect(result.error.details).toMatchObject({ humanOnly: true, principal: 'agent:claude' });
  });

  it('lets the prompter window call it — its name is human:prompter', async () => {
    const result = await core.invoke('set_active_context', { setId: KYBERNESIS_PHASE_1.id }, { principal: 'ui' });
    expect(result.ok).toBe(true);
  });

  it('refuses anything over HTTP that calls itself human', async () => {
    const result = await core.invoke('list_sets', {}, { principal: 'agent', as: 'human:ui' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.failureMode).toBe('forbidden');
  });

  it('names an unknown verb unknown-capability, not not-found', async () => {
    const result = await core.invoke('no_such_verb', {}, { principal: 'agent' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.failureMode).toBe('unknown-capability');
  });

  it('carries the open contract’s own suite name through (unknown-brand, not not-found)', async () => {
    const home = mkdtempSync(join(tmpdir(), 'teletubby-agent-layer-home-'));
    const original = process.env.HOME;
    process.env.HOME = home;
    mkdirSync(join(home, '.config', 'appydave'), { recursive: true });
    writeFileSync(join(home, '.config', 'appydave', 'brands.json'), JSON.stringify({ brands: {} }));
    try {
      const result = await core.invoke('context_select', { brand: 'nope', project: 'd01-x' }, { principal: 'agent' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.failureMode).toBe('unknown-brand');
    } finally {
      process.env.HOME = original;
      rmSync(home, { recursive: true, force: true });
    }
  });
});

/* ------------------------------------------------------------------ *
 * Lifecycle
 * ------------------------------------------------------------------ */

describe('system_status / system_quit / system_restart', () => {
  const hooks = (): LifecycleHooks & { quit: ReturnType<typeof vi.fn>; restart: ReturnType<typeof vi.fn> } => ({
    app: 'teletubby',
    version: '0.1.0-test',
    pid: 4242,
    startedAt: '2026-09-23T00:00:00.000Z',
    quit: vi.fn(),
    restart: vi.fn(),
  });
  afterEach(() => vi.useRealTimers());

  it('answers unavailable with no host process, never pretending', async () => {
    const core = createCore({ repository: store() });
    const result = await core.invoke('system_status', {}, { principal: 'agent' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.failureMode).toBe('unavailable');
  });

  it('reports status, and busy while the talent is on the prompter', async () => {
    const core = createCore({ repository: store(), lifecycle: hooks() });
    let status = await core.invoke('system_status', {}, { principal: 'agent', as: 'agent:claude' });
    expect(status).toMatchObject({ ok: true, data: { app: 'teletubby', pid: 4242, busy: [] } });

    await core.invoke('set_active_context', { setId: KYBERNESIS_PHASE_1.id, scriptId: '01' }, { principal: 'ui' });
    status = await core.invoke('system_status', {}, { principal: 'agent' });
    expect(status.ok && (status.data as { busy: unknown[] }).busy).toHaveLength(1);
  });

  it('quits AFTER replying when idle', async () => {
    vi.useFakeTimers();
    const host = hooks();
    const core = createCore({ repository: store(), lifecycle: host });
    const result = await core.invoke('system_quit', {}, { principal: 'agent', as: 'agent:claude' });
    expect(result).toMatchObject({ ok: true, data: { pid: 4242 } });
    expect(host.quit).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(host.quit).toHaveBeenCalledOnce();
  });

  it('refuses app-busy mid-session, with what is busy — and force is a person’s', async () => {
    vi.useFakeTimers();
    const host = hooks();
    const core = createCore({ repository: store(), lifecycle: host });
    await core.invoke('set_active_context', { setId: KYBERNESIS_PHASE_1.id }, { principal: 'ui' });

    const busy = await core.invoke('system_quit', {}, { principal: 'agent', as: 'agent:claude' });
    expect(busy.ok).toBe(false);
    if (!busy.ok) {
      expect(busy.error.failureMode).toBe('app-busy');
      expect((busy.error.details as { busy: unknown[] }).busy).toHaveLength(1);
    }

    const forcedByAgent = await core.invoke('system_quit', { force: true }, { principal: 'agent', as: 'agent:claude' });
    expect(forcedByAgent.ok).toBe(false);
    if (!forcedByAgent.ok) expect(forcedByAgent.error.failureMode).toBe('forbidden');

    const forcedByPerson = await core.invoke('system_quit', { force: true }, { principal: 'ui' });
    expect(forcedByPerson.ok).toBe(true);
    vi.runAllTimers();
    expect(host.quit).toHaveBeenCalledOnce();
  });

  it('restarts on the open context', async () => {
    vi.useFakeTimers();
    const host = hooks();
    const core = createCore({ repository: store(), lifecycle: host });
    await core.invoke('system_restart', {}, { principal: 'agent' });
    vi.runAllTimers();
    expect(host.restart).toHaveBeenCalledWith(null);
  });
});

/* ------------------------------------------------------------------ *
 * The doors
 * ------------------------------------------------------------------ */

describe('the HTTP projections', () => {
  let handle: ControlServerHandle;
  let directory: string;
  let core: Core;
  const base = (): string => `http://127.0.0.1:${handle.port}`;
  const rpc = async (body: unknown, principal?: string): Promise<any> => {
    const response = await fetch(`${base()}/api/rpc`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${handle.token}`,
        ...(principal ? { 'x-fli-principal': principal } : {}),
      },
      body: JSON.stringify(body),
    });
    return response.json();
  };

  beforeAll(async () => {
    directory = mkdtempSync(join(tmpdir(), 'teletubby-agent-door-'));
    core = createCore({ repository: store() });
    handle = await startControlServer({ core, userDataPath: directory, appVersion: '0.1.0-test', port: 0 });
  });
  afterAll(async () => {
    await handle.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it('writes fli-core’s control file: 0600, with this pid, read as live', async () => {
    expect(statSync(handle.discoveryPath).mode & 0o777).toBe(0o600);
    const read = await readControlFile(handle.discoveryPath);
    expect(read.kind).toBe('live');
    if (read.kind === 'live') expect(read.control).toMatchObject({ port: handle.port, pid: process.pid });
  });

  it('answers JSON-RPC with family.verb names', async () => {
    const answer = await rpc({ jsonrpc: '2.0', id: 1, method: 'set.list', params: {} }, 'agent:test');
    expect(answer.result.sets.map((s: { id: string }) => s.id)).toContain(KYBERNESIS_PHASE_1.id);
  });

  it('refuses the ★ over JSON-RPC with the stable code and the name', async () => {
    const answer = await rpc({ jsonrpc: '2.0', id: 2, method: 'context.set-active', params: { setId: 'x' } }, 'agent:test');
    expect(answer.error.code).toBe(-32001);
    expect(answer.error.data.failureMode).toBe('forbidden');
  });

  it('names an unknown method unknown-capability (-32601)', async () => {
    const answer = await rpc({ jsonrpc: '2.0', id: 3, method: 'set.nope', params: {} });
    expect(answer.error.code).toBe(-32601);
    expect(answer.error.data.failureMode).toBe('unknown-capability');
  });

  it('serves the spec and the reference page without a token; the page is CSP-pinned', async () => {
    const spec = await fetch(`${base()}/api/openrpc.json`);
    expect(spec.status).toBe(200);
    expect((await spec.json()).methods.length).toBe(CAPABILITIES.length);

    const page = await fetch(`${base()}/api/docs`);
    expect(page.status).toBe(200);
    expect(page.headers.get('content-security-policy')).toMatch(/script-src 'sha256-/);
  });

  it('gives the console its token only on a same-origin fetch', async () => {
    expect((await fetch(`${base()}/api/session`, { headers: { 'sec-fetch-site': 'cross-site' } })).status).toBe(403);
    const same = await fetch(`${base()}/api/session`, { headers: { 'sec-fetch-site': 'same-origin' } });
    expect((await same.json()).token).toBe(handle.token);
  });

  it('removes the control file on close — no door left naming a dead pid', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'teletubby-agent-close-'));
    const h = await startControlServer({ core, userDataPath: dir, appVersion: 't', port: 0 });
    expect(existsSync(h.discoveryPath)).toBe(true);
    await h.close();
    expect(existsSync(h.discoveryPath)).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });
});
