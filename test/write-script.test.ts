import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileRepository, createCore, type Core } from '@core/index';
import { KYBERNESIS_PHASE_1 } from '@shared/script-set';
import { onDemandSetId, paragraphsOfText, slugOf } from '../src/core/text-script';

/**
 * SCRIPTS ON DEMAND (B585, ADR-004) — `write_script`.
 *
 * "Teletubby should be tied to a video project, but not tied to one script."
 * An AI conversation hands over an intro as plain text; it lands as one small
 * named script in the OPEN project's own fli.tubby.json, newest first, and the
 * words are the caller's, verbatim.
 *
 * Same isolation as the open-contract suite: a HOME this file owns, so
 * `@flivideo/core` never reads the real brand registry.
 */

let home: string;
let originalHome: string | undefined;
const BRAND = 'fixture';
const PROJECT = 'd01-fixture-tour';
const projectDir = (): string => join(home, 'video-projects', 'v-fixture', PROJECT);
const projectFile = (): string => join(projectDir(), 'fli.tubby.json');

beforeAll(() => {
  home = mkdtempSync(join(tmpdir(), 'teletubby-write-script-home-'));
  mkdirSync(join(home, '.config', 'appydave'), { recursive: true });
  writeFileSync(
    join(home, '.config', 'appydave', 'brands.json'),
    JSON.stringify({
      brands: {
        [BRAND]: {
          name: 'Fixture Brand',
          locations: { video_projects: '/Users/placeholder/video-projects/v-fixture' },
        },
      },
    }),
  );
  mkdirSync(projectDir(), { recursive: true });
  originalHome = process.env.HOME;
  process.env.HOME = home;
});

afterAll(() => {
  process.env.HOME = originalHome;
  rmSync(home, { recursive: true, force: true });
});

let userData: string;
let core: Core;
let changes: string[];

const call = async (capability: string, input: unknown = {}): Promise<any> =>
  core.invoke(capability, input, { principal: 'agent' });

const ok = async (capability: string, input: unknown = {}): Promise<any> => {
  const result = await call(capability, input);
  if (!result.ok) throw new Error(`${capability}: ${result.error.code} ${result.error.message}`);
  return result.data;
};

const INTRO = 'Here is the whole FliVideo suite in five minutes.\n\nStart where every video starts: the folder.';

beforeEach(async () => {
  userData = mkdtempSync(join(tmpdir(), 'teletubby-write-script-store-'));
  const repository = new FileRepository(join(userData, 'teletubby.json'));
  await repository.update((document) => ({
    document: { ...document, sets: [KYBERNESIS_PHASE_1] },
    result: undefined,
  }));
  core = createCore({ repository });
  changes = [];
  core.onChange((event) => changes.push(event.capability));
});

afterEach(() => {
  rmSync(userData, { recursive: true, force: true });
  rmSync(projectFile(), { force: true });
});

const open = (): Promise<any> => ok('context_select', { brand: BRAND, project: PROJECT });

describe('text → script, the pure rules', () => {
  it('splits paragraphs on blank lines and keeps the words verbatim', () => {
    expect(paragraphsOfText('One line.\nStill one.\n\n  Two.  \n\n\n')).toEqual([
      'One line.\nStill one.',
      'Two.',
    ]);
  });

  it('slugs a display name into an id', () => {
    expect(slugOf('Intro — take 2!')).toBe('intro-take-2');
    expect(onDemandSetId('d01-flivideo-tour')).toBe('d01-flivideo-tour-scripts');
  });
});

describe('write_script', () => {
  it('refuses with no open project — a script never lands anywhere but the open one', async () => {
    const result = await call('write_script', { name: 'Intro', text: INTRO });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('invalid_input');
    expect(existsSync(projectFile())).toBe(false);
  });

  it('writes a named script into the open project, and the set is listed as that project’s', async () => {
    await open();
    const data = await ok('write_script', { name: 'Intro', text: INTRO, video: 'flivideo-tour' });

    expect(data).toMatchObject({
      applied: true,
      setId: `${PROJECT}-scripts`,
      replaced: false,
      drivable: false,
      script: { id: 'intro', n: 1, title: 'Intro', video: 'flivideo-tour' },
    });
    expect(changes).toContain('write_script');

    const file = JSON.parse(readFileSync(projectFile(), 'utf8'));
    const set = file.sets.find((s: any) => s.id === `${PROJECT}-scripts`);
    expect(set).toMatchObject({ project: PROJECT, onDemand: true });
    const paragraphs = set.scripts[0].transcripts[0].topics[0].minors[0].paragraphs;
    expect(paragraphs.map((p: any) => p.text)).toEqual(paragraphsOfText(INTRO));

    const listed = await ok('list_sets');
    expect(listed.sets.map((s: any) => s.id)).toContain(`${PROJECT}-scripts`);
  });

  it('lists newest first, and a re-take of the same name is replaced IN PLACE', async () => {
    await open();
    await ok('write_script', { name: 'Intro', text: INTRO });
    await ok('write_script', { name: 'CTA', text: 'Subscribe.' });
    let set = await ok('get_set', { setId: `${PROJECT}-scripts`, full: true });
    expect(set.scripts.map((s: any) => [s.n, s.id])).toEqual([
      [1, 'cta'],
      [2, 'intro'],
    ]);

    const again = await ok('write_script', { name: 'Intro', text: 'A shorter intro.' });
    expect(again.replaced).toBe(true);
    expect(again.previous.transcripts[0].topics[0].minors[0].paragraphs).toHaveLength(2);
    set = await ok('get_set', { setId: `${PROJECT}-scripts`, full: true });
    expect(set.scripts.map((s: any) => s.id)).toEqual(['cta', 'intro']);
    expect(set.scripts[1].transcripts[0].topics[0].minors[0].paragraphs[0].text).toBe(
      'A shorter intro.',
    );
  });

  it('binds caller-authored triggers to the paragraphs they name — never positionally', async () => {
    await open();
    const data = await ok('write_script', {
      name: 'Intro',
      text: INTRO,
      triggers: {
        style: 'loose-keywords',
        items: [
          { text: 'five minutes', paragraph: 1 },
          { text: 'the folder', paragraph: 2 },
        ],
      },
    });
    expect(data.drivable).toBe(true);
    const set = await ok('get_set', { setId: `${PROJECT}-scripts`, full: true });
    const triggerSet = set.scripts[0].transcripts[0].triggerSets[0];
    expect(triggerSet).toMatchObject({ style: 'loose-keywords', authoredBy: 'agent' });
    expect(triggerSet.triggers.map((t: any) => t.paragraphId)).toEqual(['p1', 'p2']);

    const out = await call('write_script', {
      name: 'Bad',
      text: INTRO,
      triggers: { style: 'loose-keywords', items: [{ text: 'a', paragraph: 1 }, { text: 'b', paragraph: 3 }] },
    });
    expect(out.ok).toBe(false);
    expect(out.error.message).toContain('paragraph 3');
  });

  it('refuses a project other than the open one', async () => {
    await open();
    const result = await call('write_script', { name: 'Intro', text: INTRO, project: 'z99-elsewhere' });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('invalid_input');
  });

  it('a dry run previews and writes nothing, and wakes no one', async () => {
    await open();
    changes = [];
    const data = await ok('write_script', { name: 'Intro', text: INTRO, dryRun: true });
    expect(data.applied).toBe(false);
    expect(data.preview.script.id).toBe('intro');
    expect(existsSync(projectFile())).toBe(false);
    expect(changes).toEqual([]);
  });

  it('leaves the numbered Kybernesis set exactly where it was, still openable', async () => {
    await open();
    await ok('write_script', { name: 'Intro', text: INTRO });
    const kyber = await ok('get_set', { setId: KYBERNESIS_PHASE_1.id, full: true });
    expect(kyber.scripts).toHaveLength(KYBERNESIS_PHASE_1.scripts.length);
    const file = JSON.parse(readFileSync(projectFile(), 'utf8'));
    expect(file.sets.map((s: any) => s.id)).toEqual([`${PROJECT}-scripts`]);
  });
});
