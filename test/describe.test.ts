import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DescribeDocument, UsageTelemetry } from '@flivideo/core';
import { KYBERNESIS_PHASE_1, TALENTS } from '@shared/script-set';
import { MemoryRepository, createCore } from '@core/index';
import { TELETUBBY_CAPABILITIES } from '@core/agent-layer';
import { startControlServer, type ControlServerHandle } from '../src/main/control-server';
import { teletubbyDescribe } from '../src/main/describe';

/**
 * RPC Map: Teletubby describes itself, counts its calls at the one seam (`core.invoke`), and draws the map — through the
 * real HTTP control surface on an ephemeral port, no Electron.
 */

let handle: ControlServerHandle;
let directory: string;
let usage: UsageTelemetry;
let usageFile: string;
const base = (): string => `http://127.0.0.1:${handle.port}`;
const rpc = async (method: string, params: object = {}): Promise<any> =>
  (
    await fetch(`${base()}/api/rpc`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${handle.token}`, 'x-fli-principal': 'agent:describe-test' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
  ).json();

beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'teletubby-describe-'));
  usageFile = join(directory, 'usage.json');
  usage = new UsageTelemetry({ file: usageFile, flushMs: 20 });
  const describe_ = (): unknown => teletubbyDescribe({ version: '0.1.0-test', gitSha: 'abc1234', startedAt: null }, usage);
  handle = await startControlServer({
    core: createCore({
      repository: new MemoryRepository({ version: 1, sets: [JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1))], talents: JSON.parse(JSON.stringify(TALENTS)) }),
      usage,
      describe: describe_,
    }),
    userDataPath: directory,
    appVersion: '0.1.0-test',
    describe: describe_,
    port: 0,
  });
});
afterAll(async () => {
  await handle.close();
  await usage.close();
  rmSync(directory, { recursive: true, force: true });
});

describe('Teletubby describes itself', () => {
  it('GET /api/describe needs no token and system.describe answers the same describe/1', async () => {
    const res = await fetch(`${base()}/api/describe`); // no Authorization
    expect(res.status).toBe(200);
    const http = DescribeDocument.parse(await res.json());
    const verb = DescribeDocument.parse((await rpc('system.describe')).result);
    expect(http.app).toMatchObject({ name: 'teletubby', version: '0.1.0-test', gitSha: 'abc1234' });
    expect(http.parts).toHaveLength(1);
    expect(http.parts[0]!.commands.map((c) => c.name).sort()).toEqual(Object.keys(TELETUBBY_CAPABILITIES).sort());
    expect(verb.parts[0]!.commands.map((c) => c.name)).toEqual(http.parts[0]!.commands.map((c) => c.name));
    const cmd = (n: string) => http.parts[0]!.commands.find((c) => c.name === n)!;
    expect(cmd('system.describe').access).toBe('read');
    expect(cmd('context.set-active').humanOnly).toBe(true); // the talent's own selection: UI only
    expect(cmd('set.list').humanOnly).toBe(false);
  });

  it('counts calls at the seam under family.verb names (a refusal too), ignores a typo, and writes usage.json', async () => {
    await rpc('set.list');
    await rpc('set.list');
    await rpc('set.get', {}); // missing id → refused, still counted
    await rpc('no.such.verb');
    const doc = DescribeDocument.parse(await (await fetch(`${base()}/api/describe`)).json());
    const cmd = (n: string) => doc.parts[0]!.commands.find((c) => c.name === n)!;
    expect(cmd('set.list').usage).toMatchObject({ calls: 2, lastPrincipal: 'agent:describe-test', lastFailureMode: null });
    expect(cmd('set.get').usage?.calls).toBe(1);
    expect(cmd('set.get').usage?.lastFailureMode).toBeTruthy();
    expect(doc.parts[0]!.commands.some((c) => c.name === 'no.such.verb')).toBe(false);
    await usage.flush();
    const file = JSON.parse(readFileSync(usageFile, 'utf8'));
    expect(file.schema).toBe('usage/1');
    expect(file.verbs['set.list'].calls).toBe(2);
  });

  it('serves the map page at /api/map, no token, reading /api/describe', async () => {
    const res = await fetch(`${base()}/api/map`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('content-security-policy')).toContain("script-src 'sha256-");
    const html = await res.text();
    expect(html).toContain('/api/describe');
    expect(html).toContain('/api/rpc');
  });
});
