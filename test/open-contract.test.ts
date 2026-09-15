import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseOpenArgs } from '@flivideo/core';
import { FileRepository, readProjectSets, writeProjectSets, type Core, createCore } from '@core/index';
import { KYBERNESIS_PHASE_1 } from '@shared/script-set';
import { startControlServer, type ControlServerHandle } from '../src/main/control-server';

/**
 * THE OPEN CONTRACT, DOOR BY DOOR (W6, open-contract §3.1).
 *
 * One fixture, shared by every test: a brand root and two plain (no
 * `fli.studio.json`) project folders under a HOME this suite owns outright —
 * `readBrands`/`readMachineSettings`/`resolveBrandRoot` all fall back to
 * `os.homedir()`, and overriding `process.env.HOME` for the file is the same
 * mechanism `@flivideo/core`'s own suite uses to guarantee nothing real is
 * ever touched (README "Tests never touch the live estate").
 *
 * The app store (`teletubby.json`) and the control server are re-created
 * PER TEST, never shared — a context or a store mutation from one test must
 * never leak into the next.
 */

let home: string;
let originalHome: string | undefined;
const BRAND = 'fixture';
const PROJECT = 'd02-fixture-project';
const AMBIGUOUS_CODE_A = 'd02-fixture-project';
const AMBIGUOUS_CODE_B = 'd02-another-project';
const SINGLE_CODE = 'd03-single';
/** Registered, but with no `video_projects` location — `resolveBrandRoot` → null. */
const ROOTLESS_BRAND = 'rootless';
/** Registered, pointing at a root folder that does not exist. */
const NOWHERE_BRAND = 'nowhere';

beforeAll(() => {
  home = mkdtempSync(join(tmpdir(), 'teletubby-open-contract-home-'));
  mkdirSync(join(home, '.config', 'appydave'), { recursive: true });
  writeFileSync(
    join(home, '.config', 'appydave', 'brands.json'),
    JSON.stringify(
      {
        brands: {
          [BRAND]: {
            name: 'Fixture Brand',
            // The A5 home-prefix rewrite (fli-core) strips `/Users/<anyone>`
            // and rejoins under the CURRENT home — this is what lets one
            // fixture registry entry work on any machine, including this one.
            locations: { video_projects: '/Users/placeholder/video-projects/v-fixture' },
          },
          [ROOTLESS_BRAND]: { name: 'Rootless Brand' },
          [NOWHERE_BRAND]: {
            name: 'Nowhere Brand',
            locations: { video_projects: '/Users/placeholder/video-projects/v-nowhere' },
          },
        },
      },
      null,
      2,
    ),
  );
  const brandRoot = join(home, 'video-projects', 'v-fixture');
  // Plain folders — no `fli.studio.json`. Real projects on this machine are
  // exactly this shape today (verified 2026-09-16: none of the three
  // project-linked script sets has an identity file yet), so Teletubby's own
  // `membership: 'folder'` path is what this fixture exercises.
  mkdirSync(join(brandRoot, AMBIGUOUS_CODE_A), { recursive: true });
  mkdirSync(join(brandRoot, AMBIGUOUS_CODE_B), { recursive: true });
  mkdirSync(join(brandRoot, SINGLE_CODE), { recursive: true });

  originalHome = process.env.HOME;
  process.env.HOME = home;
});

afterAll(() => {
  process.env.HOME = originalHome;
  rmSync(home, { recursive: true, force: true });
});

let userData: string;
let storePath: string;
let core: Core;
let control: ControlServerHandle;

const post = async (
  capability: string,
  input: unknown = {},
): Promise<{ status: number; body: any }> => {
  const response = await fetch(`http://127.0.0.1:${control.port}/api/invoke`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${control.token}` },
    body: JSON.stringify({ capability, input }),
  });
  return { status: response.status, body: await response.json() };
};

const invoke = async (capability: string, input: unknown = {}): Promise<any> => {
  const { body } = await post(capability, input);
  if (!body.ok) throw new Error(`${capability}: ${body.error.code} ${body.error.message}`);
  return body.data;
};

beforeEach(async () => {
  userData = mkdtempSync(join(tmpdir(), 'teletubby-open-contract-store-'));
  storePath = join(userData, 'teletubby.json');
  const repository = new FileRepository(storePath);
  await repository.update((document) => ({
    document: {
      ...document,
      sets: [
        { id: 'attached-set', title: 'Attached', description: '', project: PROJECT, exportedTo: null, scripts: [] },
        { id: 'other-set', title: 'Elsewhere', description: '', project: 'z09-somewhere-else', exportedTo: null, scripts: [] },
        { id: 'export-me', title: 'Export Me', description: '', project: PROJECT, exportedTo: null, scripts: [] },
      ],
    },
    result: undefined,
  }));

  core = createCore({ repository });
  control = await startControlServer({ core, userDataPath: userData, appVersion: '0.1.0-test', port: 0 });
});

afterEach(async () => {
  await control.close();
  rmSync(userData, { recursive: true, force: true });
  // The fixture HOME is shared by the file; a project file one test wrote must
  // never be the "already exported" state the next test starts from.
  rmSync(PROJECT_FILE(), { recursive: true, force: true });
});

/** Door 2 exactly as src/main/index.ts runs it: parse argv/env, invoke in-process as `agent`. */
const door2 = async (target: Core, argv: string[], env: Record<string, string>): Promise<any> => {
  const openArgs = parseOpenArgs(argv, env);
  expect(openArgs.missing).toEqual([]);
  const result = await target.invoke('context_select', openArgs.context, { principal: 'agent' });
  if (!result.ok) throw new Error(`door 2: ${result.error.code} ${result.error.message}`);
  return result.data;
};

const DOOR_2_SOURCES: [string, string[], Record<string, string>][] = [
  ['argv (--brand/--project)', ['--brand', BRAND, '--project', PROJECT], {}],
  ['env (FLIVIDEO_BRAND/FLIVIDEO_PROJECT, what scripts/app.sh exports)', [], { FLIVIDEO_BRAND: BRAND, FLIVIDEO_PROJECT: PROJECT }],
];

describe('door 2 — launch arguments resolve the same way door 3 does (C1)', () => {
  it.each(DOOR_2_SOURCES)('1 · via %s: reports the context and filters the set list to the project', async (_label, argv, env) => {
    const selected = await door2(core, argv, env);
    expect(selected.applied).toBe(true);
    expect(selected.context).toMatchObject({ brand: BRAND, project: PROJECT, membership: 'folder' });

    const got = await invoke('context_get');
    expect(got).toEqual(selected);

    const listed = await invoke('list_sets');
    expect(listed.sets.map((s: { id: string }) => s.id)).toEqual(['attached-set', 'export-me']);
    expect(listed.filter).toEqual({ project: PROJECT, allSets: false, missing: [], unreadable: null });
  });

  it('2 · door 3 on a fresh session returns the door-2 body, deep-equal, and neither touches teletubby.json (C2)', async () => {
    // Baseline BEFORE the first select, so a select that wrote the store fails here.
    const before = readFileSync(storePath, 'utf8');

    // Door 2 on its own session (a separate core over the same store)…
    const launched = await door2(restartedCore(), ['--brand', BRAND, '--project', PROJECT], {});
    // …and door 3, over HTTP, on this test's fresh session.
    const selected = await invoke('context_select', { brand: BRAND, project: PROJECT });
    expect(selected).toEqual(launched);

    // A re-select of the context already held changes nothing, so it applies
    // nothing (W6 fix F6) — the context itself is identical.
    const again = await invoke('context_select', { brand: BRAND, project: PROJECT });
    expect(again).toEqual({ ...launched, applied: false });

    expect(readFileSync(storePath, 'utf8')).toBe(before);
  });
});

describe('R31 · a code reference over members and plain folders: 0 / exactly 1 / 2+', () => {
  it('0 matches → 404 project-not-found', async () => {
    const none = await post('context_select', { brand: BRAND, project: 'z99' });
    expect(none.status).toBe(404);
    expect(none.body.error.details.refused.code).toBe('project-not-found');
  });

  it('exactly 1 match → resolves to that folder', async () => {
    const one = await invoke('context_select', { brand: BRAND, project: 'd03' });
    expect(one.context).toMatchObject({ project: SINGLE_CODE, membership: 'folder' });
  });

  it('2+ matches → 409 project-ambiguous listing every folder', async () => {
    const many = await post('context_select', { brand: BRAND, project: 'd02' });
    expect(many.status).toBe(409);
    expect(many.body.error.details.refused.candidates.sort()).toEqual([AMBIGUOUS_CODE_A, AMBIGUOUS_CODE_B].sort());
  });

  it('a path escape is not a reference → 404', async () => {
    const escape = await post('context_select', { brand: BRAND, project: '../v-fixture' });
    expect(escape.status).toBe(404);
    expect(escape.body.error.details.refused.code).toBe('project-not-found');
  });
});

describe('the two refusals the build never exercised → 503 unavailable', () => {
  it('no-brand-root: a registered brand with no video_projects location', async () => {
    const refused = await post('context_select', { brand: ROOTLESS_BRAND, project: PROJECT });
    expect(refused.status).toBe(503);
    expect(refused.body.error.details.refused.code).toBe('no-brand-root');
  });

  it('no-brand-root: a brand whose root folder does not exist on this machine', async () => {
    const refused = await post('context_select', { brand: NOWHERE_BRAND, project: PROJECT });
    expect(refused.status).toBe(503);
    expect(refused.body.error.details.refused.code).toBe('no-brand-root');
  });

  it('registry-unreadable: brands.json is not JSON', async () => {
    const brandsFile = join(home, '.config', 'appydave', 'brands.json');
    const original = readFileSync(brandsFile, 'utf8');
    writeFileSync(brandsFile, '{ not json');
    try {
      const refused = await post('context_select', { brand: BRAND, project: PROJECT });
      expect(refused.status).toBe(503);
      expect(refused.body.error.details.refused.code).toBe('registry-unreadable');
    } finally {
      writeFileSync(brandsFile, original);
    }
  });

  it('registry-unreadable: brands.json does not exist', async () => {
    const brandsFile = join(home, '.config', 'appydave', 'brands.json');
    const original = readFileSync(brandsFile, 'utf8');
    rmSync(brandsFile);
    try {
      const refused = await post('context_select', { brand: BRAND, project: PROJECT });
      expect(refused.status).toBe(503);
      expect(refused.body.error.details.refused.code).toBe('registry-unreadable');
    } finally {
      writeFileSync(brandsFile, original);
    }
  });
});

describe('missing and refused (C3) — the previous context is never disturbed', () => {
  it('3 · missing arguments fail 400 with the refusal, and list_sets stays unfiltered', async () => {
    const empty = await post('context_select', {});
    expect(empty.status).toBe(400);
    expect(empty.body.error.code).toBe('invalid_input');
    expect(empty.body.error.details.refused).toMatchObject({ code: 'missing', missing: ['brand', 'project'] });
    expect(empty.body.error.details.context).toBeNull();

    // Still recorded, so the holder reports it.
    expect((await invoke('context_get')).refused?.code).toBe('missing');

    const listed = await invoke('list_sets');
    expect(listed.sets.map((s: { id: string }) => s.id).sort()).toEqual([
      'attached-set',
      'export-me',
      'other-set',
    ]);
    expect(listed.filter).toMatchObject({ project: null, allSets: false, missing: ['brand', 'project'] });
  });

  it('4 · an unknown brand (404) and an ambiguous project (409) refuse without moving the context', async () => {
    const good = await invoke('context_select', { brand: BRAND, project: PROJECT });
    expect(good.applied).toBe(true);

    const unknownBrand = await post('context_select', { brand: 'no-such-brand', project: PROJECT });
    expect(unknownBrand.status).toBe(404);
    expect(unknownBrand.body.error.code).toBe('not_found');
    expect(unknownBrand.body.error.details.refused.code).toBe('unknown-brand');
    expect(unknownBrand.body.error.details.context).toEqual(good.context);

    // "d02" matches BOTH fixture folders by code (R31, extended over plain folders).
    const ambiguous = await post('context_select', { brand: BRAND, project: 'd02' });
    expect(ambiguous.status).toBe(409);
    expect(ambiguous.body.error.code).toBe('conflict');
    expect(ambiguous.body.error.details.refused.code).toBe('project-ambiguous');
    expect(ambiguous.body.error.details.refused.candidates.sort()).toEqual(
      [AMBIGUOUS_CODE_A, AMBIGUOUS_CODE_B].sort(),
    );
    expect(ambiguous.body.error.details.context).toEqual(good.context);

    // And a third call confirms the CONTEXT itself was never touched — even
    // though context_get now also surfaces the most recent refusal reason.
    const current = await invoke('context_get');
    expect(current.context).toEqual(good.context);
    expect(current.refused?.code).toBe('project-ambiguous');
  });

  it('the CLI exits non-zero on a refusal', async () => {
    const run = await new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve) => {
      // Async, never spawnSync: the control server answering this call lives
      // in THIS process, and a blocked event loop would deadlock it.
      execFile(
        process.execPath,
        ['bin/teletubby.mjs', 'call', 'context_select', '--input', JSON.stringify({ brand: 'no-such-brand', project: PROJECT })],
        {
          encoding: 'utf8',
          timeout: 10_000,
          env: {
            ...process.env,
            TELETUBBY_URL: `http://127.0.0.1:${control.port}`,
            TELETUBBY_TOKEN: control.token,
            TELETUBBY_CONTROL_FILE: join(userData, 'no-such-control.json'),
          },
        },
        (error, stdout, stderr) =>
          resolve({ status: error ? ((error as { code?: number }).code ?? 1) : 0, stdout, stderr }),
      );
    });
    expect(run.status).not.toBe(0);
    expect(run.stdout + run.stderr).toContain('unknown-brand');
  });
});

describe('fli.tubby.json — the project’s own copy', () => {
  it('5 · a write lands in the project file and reads back equal; the store copy is never shown twice', async () => {
    const brandRoot = join(home, 'video-projects', 'v-fixture');
    const projectDir = join(brandRoot, PROJECT);

    // A prior session already exported a DIFFERENT version of this id into
    // the project file — this is what "not shown twice" actually has to
    // resolve: the project file's copy must win over the store's.
    await writeProjectSets(projectDir, PROJECT, [
      { id: 'attached-set', title: 'Attached (from fli.tubby.json)', description: '', project: PROJECT, exportedTo: null, scripts: [] },
    ]);

    await invoke('context_select', { brand: BRAND, project: PROJECT });

    const listed = await invoke('list_sets');
    const ids = listed.sets.map((s: { id: string }) => s.id);
    expect(ids.filter((id: string) => id === 'attached-set')).toHaveLength(1);
    expect(listed.sets.find((s: { id: string }) => s.id === 'attached-set')?.title).toBe(
      'Attached (from fli.tubby.json)',
    );

    // Now write through the capability surface, while the context matches
    // the set's project — the round trip the brief asks for.
    const renamed = await invoke('rename_set', { setId: 'attached-set', title: 'Renamed In Project' });
    expect(renamed.applied).toBe(true);

    const onDisk = await readProjectSets(projectDir);
    expect(onDisk.find((s) => s.id === 'attached-set')?.title).toBe('Renamed In Project');

    // The store's own same-id entry predates the project file taking over —
    // it is inert history now (never shown, per the assertion above) and this
    // write must not have touched it: only the project file's copy moves.
    const storeDoc = JSON.parse(readFileSync(storePath, 'utf8'));
    expect(storeDoc.sets.find((s: { id: string }) => s.id === 'attached-set')?.title).toBe('Attached');
  });
});

/* ------------------------------------------------------------------ *
 * The W6 fix round (docs/reviews/overnight-W6.md) — each test is the
 * reviewer's probe, turned into a regression that fails on the old code.
 * ------------------------------------------------------------------ */

const bare = (id: string, project: string | null) => ({
  id,
  title: id,
  description: '',
  project,
  exportedTo: null,
  scripts: [],
});

const PROJECT_DIR = (): string => join(home, 'video-projects', 'v-fixture', PROJECT);
const PROJECT_FILE = (): string => join(PROJECT_DIR(), 'fli.tubby.json');

const replaceStoreSets = async (sets: unknown[]): Promise<void> => {
  await core.repository.update((document) => ({
    document: { ...document, sets: sets as never },
    result: undefined,
  }));
};

/** A "restart": a new core on the same store file, with no context open. */
const restartedCore = (): Core => createCore({ repository: new FileRepository(storePath) });

const storeSet = (id: string): any =>
  JSON.parse(readFileSync(storePath, 'utf8')).sets.find((s: { id: string }) => s.id === id);

describe('F1 · a write never moves a set it was not already routing to fli.tubby.json', () => {
  it('renaming an unrelated set leaves attached sets in the store and writes no project file', async () => {
    await replaceStoreSets([bare('a', PROJECT), bare('b', PROJECT), bare('c', null)]);
    const a = JSON.stringify(storeSet('a'));
    const b = JSON.stringify(storeSet('b'));

    await invoke('context_select', { brand: BRAND, project: PROJECT });
    const renamed = await invoke('rename_set', { setId: 'c', title: 'c renamed' });
    expect(renamed.applied).toBe(true);

    expect(JSON.stringify(storeSet('a'))).toBe(a);
    expect(JSON.stringify(storeSet('b'))).toBe(b);
    expect(existsSync(PROJECT_FILE())).toBe(false);

    const listed = await restartedCore().invoke('list_sets', {}, { principal: 'agent' });
    expect(listed.ok && (listed.data as any).sets.map((s: { id: string }) => s.id).sort()).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('editing an attached set that was never exported edits the store copy, not the project file', async () => {
    await replaceStoreSets([bare('a', PROJECT)]);
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    await invoke('rename_set', { setId: 'a', title: 'edited' });
    expect(storeSet('a').title).toBe('edited');
    expect(existsSync(PROJECT_FILE())).toBe(false);
  });
});

describe('F2 · a dry run with a context open changes nothing on disk', () => {
  const phase1 = (): any => ({ ...JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)), project: PROJECT });
  const triggerPreview = {
    setId: 'kybernesis-phase-1',
    scriptId: 'kybernesis-phase-1/02',
    transcriptId: 'tom-original',
    style: 'near-verbatim',
    // Every paragraph covered, in order — the same map capabilities.test.ts authors.
    triggers: [
      { text: "you've got an AI assistant at work", paragraphId: 'p1' },
      { text: 'a full agent system', paragraphId: 'p2' },
      { text: 'one problem genuinely worth solving', paragraphId: 'p3' },
      { text: 'start small without thinking small', paragraphId: 'p4' },
    ],
    dryRun: true,
  };

  it('with no project file: the store is byte-identical and no project file appears', async () => {
    await replaceStoreSets([phase1()]);
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    const before = readFileSync(storePath, 'utf8');

    const created = await invoke('create_set', { id: 'new-set', title: 'New', project: PROJECT, dryRun: true });
    expect(created.applied).toBe(false);
    const previewed = await invoke('write_trigger_set', triggerPreview);
    expect(previewed.applied).toBe(false);

    expect(readFileSync(storePath, 'utf8')).toBe(before);
    expect(existsSync(PROJECT_FILE())).toBe(false);
  });

  it('with a project file: neither the store nor the project file moves', async () => {
    // The store still holds a stale copy of the id the project file owns, AHEAD
    // of an unrelated set — the split used to re-order (and, before F1, drop)
    // exactly this shape even on a preview.
    await replaceStoreSets([phase1(), bare('c', null)]);
    await writeProjectSets(PROJECT_DIR(), PROJECT, [phase1()]);
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    const store = readFileSync(storePath, 'utf8');
    const project = readFileSync(PROJECT_FILE(), 'utf8');

    expect((await invoke('write_trigger_set', triggerPreview)).applied).toBe(false);
    expect((await invoke('rename_set', { setId: 'c', title: 'x', dryRun: true })).applied).toBe(false);

    expect(readFileSync(storePath, 'utf8')).toBe(store);
    expect(readFileSync(PROJECT_FILE(), 'utf8')).toBe(project);
  });
});

describe('F3 · re-exporting never reverts the live project copy', () => {
  it('export, edit in the project, re-export → 409 and the edit survives', async () => {
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    expect((await invoke('set_export_to_project', { setId: 'export-me' })).applied).toBe(true);
    await invoke('rename_set', { setId: 'export-me', title: 'edited-in-project' });

    const again = await post('set_export_to_project', { setId: 'export-me' });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('conflict');

    const onDisk = await readProjectSets(PROJECT_DIR());
    expect(onDisk.find((s) => s.id === 'export-me')?.title).toBe('edited-in-project');
  });

  it('refuses when only the project file holds the id (the store copy was never marked)', async () => {
    await writeProjectSets(PROJECT_DIR(), PROJECT, [bare('attached-set', PROJECT)]);
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    const refused = await post('set_export_to_project', { setId: 'attached-set' });
    expect(refused.status).toBe(409);
    expect(storeSet('attached-set').exportedTo).toBeNull();
  });
});

describe('F4 · an exported set is listed read-only with no context, and never editable there', () => {
  it('rename with no context → 409; the store copy is unchanged; the brand is recorded', async () => {
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    await invoke('set_export_to_project', { setId: 'export-me' });
    const frozen = JSON.stringify(storeSet('export-me'));
    expect(storeSet('export-me')).toMatchObject({ exportedTo: PROJECT, exportedBrand: BRAND });

    // A plain launch: new core, new control server, no context.
    const plain = restartedCore();
    const plainDir = mkdtempSync(join(tmpdir(), 'teletubby-open-contract-plain-'));
    const server = await startControlServer({ core: plain, userDataPath: plainDir, appVersion: 't', port: 0 });
    try {
      const call = async (capability: string, input: unknown) => {
        const response = await fetch(`http://127.0.0.1:${server.port}/api/invoke`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${server.token}` },
          body: JSON.stringify({ capability, input }),
        });
        return { status: response.status, body: (await response.json()) as any };
      };

      const renamed = await call('rename_set', { setId: 'export-me', title: 'offline-edit' });
      expect(renamed.status).toBe(409);
      expect(renamed.body.error.message).toContain(`${PROJECT}/fli.tubby.json`);
      expect(renamed.body.error.details).toEqual({ exportedTo: PROJECT, exportedBrand: BRAND });

      // A preview is refused too — it must never promise a write that cannot land.
      expect((await call('rename_set', { setId: 'export-me', title: 'x', dryRun: true })).status).toBe(409);
      expect(JSON.stringify(storeSet('export-me'))).toBe(frozen);

      // Listed — never hidden — and labelled where the live copy is.
      const listed = await call('list_sets', {});
      expect(listed.body.data.sets.find((s: { id: string }) => s.id === 'export-me')).toMatchObject({
        readOnly: true,
        livesIn: `${PROJECT}/fli.tubby.json`,
        exportedBrand: BRAND,
        source: 'store',
      });
      // Reading it for the stage still works.
      expect((await call('get_set', { setId: 'export-me', full: true })).status).toBe(200);
    } finally {
      await server.close();
      rmSync(plainDir, { recursive: true, force: true });
    }
  });

  it('with the matching context open, the project copy is the one listed and it is editable', async () => {
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    await invoke('set_export_to_project', { setId: 'export-me' });
    const listed = await invoke('list_sets');
    expect(listed.sets.find((s: { id: string }) => s.id === 'export-me')).toMatchObject({
      readOnly: false,
      source: 'project',
    });
    expect((await invoke('rename_set', { setId: 'export-me', title: 'live edit' })).applied).toBe(true);
  });
});

describe('F6 · a no-op re-point wakes nobody', () => {
  it('an identical context_select fires zero change events; a real switch fires one', async () => {
    const events: string[] = [];
    const unsubscribe = core.onChange((event) => events.push(event.capability));
    try {
      const first = await core.invoke('context_select', { brand: BRAND, project: PROJECT }, { principal: 'agent' });
      expect(first.ok && (first.data as any).applied).toBe(true);
      expect(events).toEqual(['context_select']);

      const again = await core.invoke('context_select', { brand: BRAND, project: PROJECT }, { principal: 'agent' });
      expect(again.ok && (again.data as any).applied).toBe(false);
      expect(events).toHaveLength(1);

      await core.invoke('context_select', { brand: BRAND, project: AMBIGUOUS_CODE_B }, { principal: 'agent' });
      expect(events).toHaveLength(2);

      // A refusal is not a change either.
      await core.invoke('context_select', { brand: 'no-such-brand', project: PROJECT }, { principal: 'agent' });
      expect(events).toHaveLength(2);
    } finally {
      unsubscribe();
    }
  });
});

describe('M2 · an unusable project file never costs a set', () => {
  it('export writes the project file FIRST: a failed write leaves the store copy unmarked', async () => {
    mkdirSync(PROJECT_FILE(), { recursive: true }); // fli.tubby.json is a directory
    await invoke('context_select', { brand: BRAND, project: PROJECT });
    const refused = await post('set_export_to_project', { setId: 'export-me' });
    expect(refused.body.ok).toBe(false);
    expect(storeSet('export-me').exportedTo).toBeNull();
  });

  it('a corrupt project file degrades per set, and list_sets says what it could not read', async () => {
    writeFileSync(PROJECT_FILE(), '{ not json');
    await invoke('context_select', { brand: BRAND, project: PROJECT });

    const listed = await invoke('list_sets', { allSets: true });
    expect(listed.sets.map((s: { id: string }) => s.id).sort()).toEqual(['attached-set', 'export-me', 'other-set']);
    expect(listed.filter.unreadable.file).toBe(PROJECT_FILE());
    expect(listed.sets.find((s: { id: string }) => s.id === 'attached-set').readOnly).toBe(true);
    expect(listed.sets.find((s: { id: string }) => s.id === 'other-set').readOnly).toBe(false);

    // A set the file cannot own answers, reads and writes alike…
    expect((await post('get_set', { setId: 'other-set' })).status).toBe(200);
    expect((await post('rename_set', { setId: 'other-set', title: 'still works' })).status).toBe(200);
    // …and one it might own refuses, saying why, rather than serving a stale copy.
    const attached = await post('get_set', { setId: 'attached-set' });
    expect(attached.status).toBe(503);
    expect(attached.body.error.details.unreadable.file).toBe(PROJECT_FILE());
    expect((await post('rename_set', { setId: 'attached-set', title: 'no' })).status).toBe(503);
    expect(storeSet('attached-set').title).toBe('Attached');
  });
});

describe('M3 · concurrent writes to one project file never lose an edit', () => {
  it('two simultaneous renames of two project sets both land', async () => {
    await writeProjectSets(PROJECT_DIR(), PROJECT, [bare('x', PROJECT), bare('y', PROJECT)]);
    await invoke('context_select', { brand: BRAND, project: PROJECT });

    const results = await Promise.all([
      core.invoke('rename_set', { setId: 'x', title: 'X edited' }, { principal: 'ui' }),
      core.invoke('rename_set', { setId: 'y', title: 'Y edited' }, { principal: 'agent' }),
    ]);
    expect(results.every((result) => result.ok)).toBe(true);

    const onDisk = await readProjectSets(PROJECT_DIR());
    expect(onDisk.map((s) => `${s.id}:${s.title}`)).toEqual(['x:X edited', 'y:Y edited']);
  });

  it('an export racing an edit keeps both', async () => {
    await writeProjectSets(PROJECT_DIR(), PROJECT, [bare('x', PROJECT)]);
    await invoke('context_select', { brand: BRAND, project: PROJECT });

    await Promise.all([
      core.invoke('rename_set', { setId: 'x', title: 'X edited' }, { principal: 'ui' }),
      core.invoke('set_export_to_project', { setId: 'export-me' }, { principal: 'agent' }),
    ]);

    const onDisk = await readProjectSets(PROJECT_DIR());
    expect(onDisk.map((s) => `${s.id}:${s.title}`).sort()).toEqual(['export-me:Export Me', 'x:X edited']);
  });
});

describe('M7 · an invalid ~/.fli/machine.json refuses rather than silently using the registry root', () => {
  it('context_select → 503 no-brand-root naming the parse failure; the context does not move', async () => {
    const good = await invoke('context_select', { brand: BRAND, project: PROJECT });
    const machineDir = join(home, '.fli');
    mkdirSync(machineDir, { recursive: true });
    writeFileSync(join(machineDir, 'machine.json'), '{ not json');
    try {
      const refused = await post('context_select', { brand: BRAND, project: AMBIGUOUS_CODE_B });
      expect(refused.status).toBe(503);
      expect(refused.body.error.details.refused.code).toBe('no-brand-root');
      expect(refused.body.error.message).toContain('machine.json');
      expect(refused.body.error.details.context).toEqual(good.context);
    } finally {
      rmSync(machineDir, { recursive: true, force: true });
    }
  });
});

describe('set_export_to_project', () => {
  it('6 · writes the project file and leaves the store copy in place, marked exportedTo', async () => {
    await invoke('context_select', { brand: BRAND, project: PROJECT });

    const exported = await invoke('set_export_to_project', { setId: 'export-me' });
    expect(exported.applied).toBe(true);
    expect(exported.set.id).toBe('export-me');

    const brandRoot = join(home, 'video-projects', 'v-fixture');
    const onDisk = await readProjectSets(join(brandRoot, PROJECT));
    expect(onDisk.map((s) => s.id)).toContain('export-me');
    // The project's own copy names no export target — that field describes
    // where the STORE copy went, not itself.
    expect(onDisk.find((s) => s.id === 'export-me')?.exportedTo ?? null).toBeNull();

    const storeDoc = JSON.parse(readFileSync(storePath, 'utf8'));
    const storeCopy = storeDoc.sets.find((s: { id: string }) => s.id === 'export-me');
    expect(storeCopy).toBeDefined();
    expect(storeCopy.exportedTo).toBe(PROJECT);

    // And it is still not shown twice: list_sets shows the project file's copy only.
    const listed = await invoke('list_sets', { allSets: true });
    expect(listed.sets.filter((s: { id: string }) => s.id === 'export-me')).toHaveLength(1);
  });
});
