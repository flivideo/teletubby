import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileRepository, createCore, type Core } from '@core/index';
import { KYBERNESIS_PHASE_1 } from '@shared/script-set';
import { DEFAULT_LAYOUT } from '@shared/rig';
import { validateTranscript } from '@shared/domain';
import { onDemandSetId, paragraphsOfText, scriptFromText, slugOf } from '../src/core/text-script';

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

  it('the builder refuses chapter shapes on its own, without the schema in front', () => {
    const text = 'One.\n\nTwo.';
    expect(scriptFromText({ name: 'X', text, chapters: [{ name: ' ', paragraph: 1 }] }, 1)).toEqual({
      problem: 'chapter 1 has an empty name',
    });
    expect(scriptFromText({ name: 'X', text, chapters: [{ name: 'A', paragraph: 0 }] }, 1)).toMatchObject({
      problem: expect.stringContaining('numbered from 1'),
    });
  });

  it('slugs a display name into an id', () => {
    expect(slugOf('Intro — take 2!')).toBe('intro-take-2');
    expect(onDemandSetId('d01-flivideo-tour')).toBe('d01-flivideo-tour-scripts');
  });
});

describe('write_script with a variant — the publish contract', () => {
  const STORY = 'storypilot-project';
  const LONG = { id: 'main-aaaa1111', label: 'Tolkien · teaching · long', version: 8 };
  const SHORT = { id: 'main-bbbb2222', label: 'Spielberg · short', version: 3 };
  const publish = (variant: unknown, text = INTRO, extra: object = {}): Promise<any> =>
    call('write_script', { id: STORY, name: 'Story', text, variant, ...extra });
  const stored = (): any =>
    JSON.parse(readFileSync(projectFile(), 'utf8')).sets[0].scripts.find((s: any) => s.id === STORY);
  const wordsOf = (transcript: any): string[] =>
    transcript.topics.flatMap((m: any) => m.minors.flatMap((n: any) => n.paragraphs.map((p: any) => p.text)));

  beforeEach(() => open());

  it('a first publish creates the script with one labelled variant, and no version history', async () => {
    const result = await publish(LONG);
    expect(result.data.variant).toEqual({ id: LONG.id, version: 8, previousVersion: null, created: true });
    expect(stored().transcripts).toHaveLength(1);
    expect(stored().transcripts[0]).toMatchObject({
      id: LONG.id,
      corpus: LONG.id,
      kind: 'variant',
      talentId: null,
      variant: { label: LONG.label, version: 8 },
    });
    expect(Object.keys(stored().transcripts[0].variant).sort()).toEqual(['label', 'version']);
  });

  it('a new id is appended, and the script’s own title is left alone', async () => {
    await publish(LONG);
    const result = await call('write_script', { id: STORY, name: 'Other title', text: 'Short words.', variant: SHORT });
    expect(result.data.variant).toMatchObject({ created: true, previousVersion: null });
    expect(stored().transcripts.map((t: any) => t.id)).toEqual([LONG.id, SHORT.id]);
    expect(stored().title).toBe('Story');
  });

  it('same id, higher version replaces that variant in place and touches no other', async () => {
    await publish(LONG);
    await publish(SHORT, 'Short words.');
    changes.length = 0;
    const result = await publish({ ...LONG, version: 9 }, 'New words.\n\nSecond.');
    expect(result.data.variant).toEqual({ id: LONG.id, version: 9, previousVersion: 8, created: false });
    expect(stored().transcripts.map((t: any) => t.id)).toEqual([LONG.id, SHORT.id]);
    expect(wordsOf(stored().transcripts[0])).toEqual(['New words.', 'Second.']);
    expect(wordsOf(stored().transcripts[1])).toEqual(['Short words.']);
    expect(changes).toEqual(['write_script']);
  });

  it('identical content writes nothing and wakes nobody', async () => {
    await publish(LONG);
    const before = readFileSync(projectFile(), 'utf8');
    changes.length = 0;
    const result = await publish(LONG);
    expect(result.data).toMatchObject({ applied: false, unchanged: true });
    expect(readFileSync(projectFile(), 'utf8')).toBe(before);
    expect(changes).toEqual([]);
  });

  it('identical content is still recognised after a round trip through the file', async () => {
    await publish(LONG, INTRO, { chapters: [{ name: 'Open', paragraph: 1 }] });
    const result = await publish(LONG, INTRO, { chapters: [{ name: 'Open', paragraph: 1 }] });
    expect(result.data.unchanged).toBe(true);
  });

  it('same version with a new label, chapters or text replaces in place; the number stays', async () => {
    await publish(LONG);
    await publish({ ...LONG, label: 'My own name' });
    expect(stored().transcripts[0].variant).toEqual({ label: 'My own name', version: 8 });

    // A recorded paragraph becomes a cue line: the sent text changes, the version's words do not.
    const result = await publish({ ...LONG, label: 'My own name' }, 'RECORDED: plays here.\n\nSecond.');
    expect(result.ok).toBe(true);
    expect(result.data.variant).toMatchObject({ version: 8, previousVersion: 8, created: false });
    expect(wordsOf(stored().transcripts[0])).toEqual(['RECORDED: plays here.', 'Second.']);
  });

  it('a lower version is refused and the words stay', async () => {
    await publish({ ...LONG, version: 9 }, 'Newest words.');
    const before = readFileSync(projectFile(), 'utf8');
    changes.length = 0;
    const result = await publish({ ...LONG, version: 7 }, 'Older words.');
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('conflict');
    expect(result.error.details).toEqual({ held: 9, sent: 7 });
    expect(readFileSync(projectFile(), 'utf8')).toBe(before);
    expect(changes).toEqual([]);
  });

  it('the first variant publish replaces the old unlabelled body', async () => {
    await ok('write_script', { id: STORY, name: 'Story', text: INTRO });
    expect(stored().transcripts.map((t: any) => t.id)).toEqual(['text']);
    const result = await publish(LONG);
    // The same story arriving as a variant: an update to the talent, not a new chip to go and find.
    expect(result.data.variant).toMatchObject({ created: false, previousVersion: null });
    expect(stored().transcripts.map((t: any) => t.id)).toEqual([LONG.id]);
  });

  it('a plain write on a script with variants is refused, so nothing is silently deleted', async () => {
    await publish(LONG);
    const result = await call('write_script', { id: STORY, name: 'Story', text: 'Plain.' });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('conflict');
    expect(stored().transcripts.map((t: any) => t.id)).toEqual([LONG.id]);
  });

  it('a plain write with no variants behaves exactly as before', async () => {
    await ok('write_script', { id: STORY, name: 'Story', text: INTRO });
    const data = await ok('write_script', { id: STORY, name: 'Story two', text: 'Plain again.' });
    expect(data).toMatchObject({ applied: true, replaced: true });
    expect(data.variant).toBeUndefined();
    expect(stored().title).toBe('Story two');
    expect(stored().transcripts[0]).not.toHaveProperty('variant');
  });

  it('a variant cannot be forged through write_transcript, and the mark needs its kind', async () => {
    await publish(LONG);
    const result = await call('write_transcript', {
      scriptId: STORY,
      id: 'forged',
      kind: 'variant',
      corpus: 'forged',
      source: 'test',
      topics: [{ heading: 'A', minors: [{ heading: 'A', paragraphs: [{ text: 'x' }] }] }],
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('invalid_input');

    const base = { id: 't', corpus: 't', talentId: null, source: 's', topics: [], triggerSets: [] };
    expect(validateTranscript({ ...base, kind: 'variant' })).not.toEqual([]);
    expect(
      validateTranscript({
        ...base,
        kind: 'variant',
        talentId: 'someone',
        variant: { label: 'x', version: 1 },
      }).map((v) => v.path),
    ).toContain('transcript.talentId');
    expect(
      validateTranscript({ ...base, kind: 'provenance', variant: { label: 'x', version: 1 } }),
    ).not.toEqual([]);
  });

  it('refuses a bad variant at the door', async () => {
    for (const bad of [
      { ...LONG, id: 'has space' },
      { ...LONG, label: '   ' },
      { ...LONG, label: 'x'.repeat(81) },
      { ...LONG, version: 0 },
      { ...LONG, version: 1.5 },
    ]) {
      const result = await publish(bad);
      expect(result.ok, JSON.stringify(bad)).toBe(false);
      expect(result.error.code).toBe('invalid_input');
    }
    expect(existsSync(projectFile())).toBe(false);
  });

  it('a dry run previews and writes nothing', async () => {
    const result = await call('write_script', { id: STORY, name: 'Story', text: INTRO, variant: LONG, dryRun: true });
    expect(result.data).toMatchObject({ applied: false, variant: { id: LONG.id, created: true } });
    expect(existsSync(projectFile())).toBe(false);
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

const FOUR = 'One.\n\nTwo.\n\nThree.\n\nFour.';
const headings = (script: any): string[] => script.transcripts[0].topics.map((t: any) => t.heading);
const idsByTopic = (script: any): string[][] =>
  script.transcripts[0].topics.map((t: any) => t.minors.flatMap((m: any) => m.paragraphs.map((p: any) => p.id)));

describe('write_script chapters — column-1 headings over global paragraph numbers', () => {
  const chapters = [
    { name: 'Hook', paragraph: 1 },
    { name: ' Body ', paragraph: 2 },
    { name: 'Close', paragraph: 4 },
  ];

  it('makes one major topic per chapter, each running to the next, ids unchanged', async () => {
    await open();
    const data = await ok('write_script', {
      name: 'Intro',
      text: FOUR,
      chapters,
      triggers: {
        style: 'loose-keywords',
        items: [
          { text: 'one', paragraph: 1 },
          { text: 'four', paragraph: 4 },
        ],
      },
    });
    expect(data.drivable).toBe(true);
    const { script } = await ok('get_script', { setId: `${PROJECT}-scripts`, scriptId: 'intro' });
    expect(script.transcripts[0].topics).toEqual([
      { id: 'm1', heading: 'Hook', minors: [{ id: 'm1-n1', heading: 'Hook', paragraphs: [{ id: 'p1', text: 'One.' }] }] },
      {
        id: 'm2',
        heading: 'Body',
        minors: [
          {
            id: 'm2-n1',
            heading: 'Body',
            paragraphs: [
              { id: 'p2', text: 'Two.' },
              { id: 'p3', text: 'Three.' },
            ],
          },
        ],
      },
      { id: 'm3', heading: 'Close', minors: [{ id: 'm3-n1', heading: 'Close', paragraphs: [{ id: 'p4', text: 'Four.' }] }] },
    ]);
    expect(script.transcripts[0].triggerSets[0].triggers.map((t: any) => t.paragraphId)).toEqual(['p1', 'p4']);
  });

  it('absent or empty chapters → one topic named after the script, same paragraph ids', async () => {
    await open();
    await ok('write_script', { name: 'Plain', text: FOUR, chapters: [] });
    const { script } = await ok('get_script', { setId: `${PROJECT}-scripts`, scriptId: 'plain' });
    expect(headings(script)).toEqual(['Plain']);
    expect(script.transcripts[0].topics[0].id).toBe('m1');
    expect(idsByTopic(script)).toEqual([['p1', 'p2', 'p3', 'p4']]);
  });

  it('a dry run reports the chaptered shape and writes nothing', async () => {
    await open();
    const data = await ok('write_script', { name: 'Intro', text: FOUR, chapters, dryRun: true });
    expect(data.applied).toBe(false);
    expect(headings(data.preview.script)).toEqual(['Hook', 'Body', 'Close']);
    expect(idsByTopic(data.preview.script)).toEqual([['p1'], ['p2', 'p3'], ['p4']]);
    expect(existsSync(projectFile())).toBe(false);
  });

  it.each([
    ['the first chapter must start at paragraph 1', [{ name: 'A', paragraph: 2 }], 'must start at paragraph 1'],
    [
      'starts strictly increase',
      [
        { name: 'A', paragraph: 1 },
        { name: 'B', paragraph: 3 },
        { name: 'C', paragraph: 3 },
      ],
      'strictly increase',
    ],
    [
      'a start past the text',
      [
        { name: 'A', paragraph: 1 },
        { name: 'B', paragraph: 5 },
      ],
      'the text has 4',
    ],
  ])('refuses %s, naming the problem, and writes nothing', async (_label, bad, message) => {
    await open();
    const result = await call('write_script', { name: 'Intro', text: FOUR, chapters: bad });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('invalid_input');
    expect(result.error.message).toContain(message);
    expect(existsSync(projectFile())).toBe(false);
  });

  // Shape problems are the schema's refusal, like every other field: the
  // issue's path names the chapter and the field.
  it.each([
    ['an empty name', [{ name: '   ', paragraph: 1 }], 'chapters.0.name'],
    ['paragraph 0', [{ name: 'A', paragraph: 0 }], 'chapters.0.paragraph'],
    ['a fractional paragraph', [{ name: 'A', paragraph: 1.5 }], 'chapters.0.paragraph'],
  ])('refuses %s at the schema, naming the field', async (_label, bad, path) => {
    await open();
    const result = await call('write_script', { name: 'Intro', text: FOUR, chapters: bad });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('invalid_input');
    expect(result.error.details.issues.map((issue: any) => issue.path)).toContain(path);
    expect(existsSync(projectFile())).toBe(false);
  });
});

/**
 * THE d04 PREFLIGHT (2026-09-23): a project that ALREADY has a set attached,
 * two named scripts written by an agent, both listed back — and the agent
 * puts one on stage, which the window then applies. Refused mid-take.
 */
describe('d04: two named scripts, listed, one put on stage by an agent', () => {
  const agent = { principal: 'agent' as const, as: 'agent:d04-uat' };
  const asAgent = async (capability: string, input: unknown = {}): Promise<any> =>
    core.invoke(capability, input, agent);

  beforeEach(async () => {
    // The wrong-set bug's shape: a set already attached to the project.
    const repository = new FileRepository(join(userData, 'teletubby.json'));
    await repository.update((document) => ({
      document: {
        ...document,
        sets: [
          KYBERNESIS_PHASE_1,
          { ...JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)), id: 'existing-set', project: PROJECT },
        ],
      },
      result: undefined,
    }));
    core = createCore({ repository });
    await open();
  });

  it('writes two, proves both belong to the project without a window, and stages one', async () => {
    const intro = await asAgent('write_script', { name: 'Intro (improved)', text: INTRO, video: 'd04-demo' });
    const outro = await asAgent('write_script', { name: 'Outro', text: 'Thanks for watching.\n\nSee you next time.' });
    expect(intro.ok && outro.ok).toBe(true);

    // Listed back: the set is the project's own, and it holds exactly these two, newest first.
    const listed = await asAgent('list_sets');
    const row = listed.data.sets.find((s: any) => s.id === `${PROJECT}-scripts`);
    expect(row).toMatchObject({ project: PROJECT, onDemand: true, source: 'project', scriptCount: 2 });
    const set = await asAgent('get_set', { setId: `${PROJECT}-scripts` });
    expect(set.data).toMatchObject({ project: PROJECT, onDemand: true });
    expect(set.data.scripts.map((s: any) => [s.title, s.video])).toEqual([
      ['Outro', null],
      ['Intro (improved)', 'd04-demo'],
    ]);

    // The agent chooses the stage — not the existing set the window opened on.
    const staged = await asAgent('stage_select', { setId: `${PROJECT}-scripts`, scriptId: 'intro-improved' });
    expect(staged).toMatchObject({ ok: true, data: { applied: true, project: PROJECT } });
    const readBack = await asAgent('stage_get');
    expect(readBack.data.request).toMatchObject({
      seq: 1,
      setId: `${PROJECT}-scripts`,
      scriptId: 'intro-improved',
      requestedBy: 'agent:d04-uat',
    });
  });

  describe('staging a variant', () => {
    const SET = `${PROJECT}-scripts`;
    const LONG = { id: 'long', label: 'Long', version: 1 };
    const SHORT = { id: 'short', label: 'Short', version: 1 };
    const seen = async (transcriptId: string, paragraphId = 'p1'): Promise<void> => {
      const written = await core.invoke(
        'remember_layout',
        {
          layout: DEFAULT_LAYOUT,
          rigId: null,
          position: { setId: SET, scriptId: 'story', transcriptId, style: null, paragraphId },
        },
        { principal: 'ui' },
      );
      expect(written.ok).toBe(true);
    };
    const select = (variantId?: string): Promise<any> =>
      asAgent('stage_select', { setId: SET, scriptId: 'story', ...(variantId ? { variantId } : {}) });

    beforeEach(async () => {
      await asAgent('write_script', { id: 'story', name: 'Story', text: INTRO, variant: LONG });
      await asAgent('write_script', { id: 'story', name: 'Story', text: 'Short.', variant: SHORT });
    });

    it('already on stage and idle: nothing is asked of the window', async () => {
      await seen('long');
      const result = await select('long');
      expect(result).toMatchObject({ ok: true, data: { applied: false, alreadyOnStage: true } });
      expect((await asAgent('stage_get')).data.request).toBeNull();
    });

    it('already on stage while the talent is mid-take: still no refusal, still nothing asked', async () => {
      await seen('long', 'p1');
      await seen('long', 'p2'); // a move: the talent is busy
      const result = await select('long');
      expect(result).toMatchObject({ ok: true, data: { applied: false, alreadyOnStage: true } });
      expect((await asAgent('stage_get')).data.request).toBeNull();
    });

    it('a dry run of where they already are carries the same preview as any other', async () => {
      await seen('long');
      const result = await asAgent('stage_select', {
        setId: SET,
        scriptId: 'story',
        variantId: 'long',
        dryRun: true,
      });
      expect(result.data).toMatchObject({
        applied: false,
        alreadyOnStage: true,
        preview: { setId: SET, scriptId: 'story', variantId: 'long' },
      });
    });

    it('reports drivable for the variant just published, not the first one', async () => {
      const triggers = {
        style: 'loose-keywords',
        items: [
          { text: 'a', paragraph: 1 },
          { text: 'b', paragraph: 1 },
        ],
      };
      const data = await asAgent('write_script', {
        id: 'story',
        name: 'Story',
        text: 'Words.',
        triggers,
        variant: { id: 'third', label: 'Third', version: 1 },
      });
      expect(data.data.drivable).toBe(true);
    });

    it('naming only the script they are on counts as there', async () => {
      await seen('long');
      expect(await select()).toMatchObject({ ok: true, data: { alreadyOnStage: true } });
    });

    it('another variant, idle: the request carries it to the window', async () => {
      await seen('long');
      const result = await select('short');
      expect(result).toMatchObject({ ok: true, data: { applied: true, variantId: 'short' } });
      expect((await asAgent('stage_get')).data.request).toMatchObject({ variantId: 'short' });
    });

    it('another variant, talent busy: refused, and nothing is asked', async () => {
      await seen('long', 'p1');
      await seen('long', 'p2');
      const result = await select('short');
      expect(result.ok).toBe(false);
      expect(result.error.failureMode).toBe('app-busy');
      expect((await asAgent('stage_get')).data.request).toBeNull();
    });

    it('a variant the script does not have, or one with no script, is refused', async () => {
      expect((await select('nope')).error.failureMode).toBe('not-found');
      const noScript = await asAgent('stage_select', { setId: SET, variantId: 'long' });
      expect(noScript.ok).toBe(false);
      expect(noScript.error.code).toBe('invalid_input');
    });
  });

  it('refuses a script the set does not have, naming what it does have', async () => {
    await asAgent('write_script', { name: 'Intro', text: INTRO });
    const result = await asAgent('stage_select', { setId: `${PROJECT}-scripts`, scriptId: 'nope' });
    expect(result.ok).toBe(false);
    expect(result.error.failureMode).toBe('not-found');
    expect(result.error.details.available).toEqual([{ id: 'intro', title: 'Intro' }]);
  });

  it('refuses app-busy while the talent is stepping — and the window landing on the agent’s pick is not "busy"', async () => {
    await asAgent('write_script', { name: 'Intro', text: INTRO });
    await asAgent('write_script', { name: 'Outro', text: 'Bye.' });
    const where = (setId: string, scriptId: string, paragraphId: string): unknown => ({
      layout: DEFAULT_LAYOUT,
      rigId: null,
      position: { setId, scriptId, transcriptId: null, style: null, paragraphId },
    });
    const window = async (position: unknown): Promise<void> => {
      const written = await core.invoke('remember_layout', position, { principal: 'ui' });
      expect(written.ok, JSON.stringify(written)).toBe(true);
    };

    // The window opens (first write: not a move), the agent stages a script,
    // the window lands on it (the agent's move: not busy either).
    await window(where('existing-set', '01', 'p1'));
    expect((await asAgent('stage_select', { setId: `${PROJECT}-scripts`, scriptId: 'intro' })).ok).toBe(true);
    await window(where(`${PROJECT}-scripts`, 'intro', 'p1'));
    expect((await asAgent('stage_select', { setId: `${PROJECT}-scripts`, scriptId: 'outro' })).ok).toBe(true);

    // The talent steps a beat: now an agent may not move them.
    await window(where(`${PROJECT}-scripts`, 'outro', 'p1'));
    await window(where(`${PROJECT}-scripts`, 'outro', 'p2'));
    const refused = await asAgent('stage_select', { setId: `${PROJECT}-scripts`, scriptId: 'intro' });
    expect(refused.ok).toBe(false);
    expect(refused.error.failureMode).toBe('app-busy');
    expect(refused.error.details.busy[0].what).toContain('talent on the prompter');
  });

  it('an agent cannot make the app look busy — only the window’s own writes count', async () => {
    await asAgent('write_script', { name: 'Intro', text: INTRO });
    const forged = await core.invoke(
      'remember_layout',
      { layout: DEFAULT_LAYOUT, rigId: null, position: { setId: 'x', scriptId: 'y', transcriptId: null, style: null, paragraphId: 'p9' } },
      agent,
    );
    expect(forged.ok).toBe(false); // remember_layout is UI-only (★)
    expect((await asAgent('stage_select', { setId: `${PROJECT}-scripts` })).ok).toBe(true);
  });
});

/**
 * d04 FINDINGS (live run, 2026-09-23): `n` is POSITION and shifts on the next
 * write, and a project FOLDER RENAME (step 10) must not orphan its scripts.
 */
describe('d04 findings: n is position; a renamed folder keeps its scripts', () => {
  it('says n is position by returning the whole order after each write', async () => {
    await open();
    const intro = await ok('write_script', { name: 'Intro', text: INTRO });
    expect(intro.script.n).toBe(1);
    const outro = await ok('write_script', { name: 'Outro', text: 'Bye.' });
    // The intro's earlier n:1 is superseded — this reply says so directly.
    expect(outro.order.map((s: any) => [s.n, s.id])).toEqual([
      [1, 'outro'],
      [2, 'intro'],
    ]);
    const set = await ok('get_set', { setId: `${PROJECT}-scripts` });
    expect(set.scripts.map((s: any) => [s.n, s.id])).toEqual([
      [1, 'outro'],
      [2, 'intro'],
    ]);
  });

  it('after a folder rename, the scripts are still the project’s, and new ones join the SAME set', async () => {
    const renamed = 'd01-renamed-tour';
    const from = projectDir();
    const to = join(from, '..', renamed);
    await open();
    await ok('write_script', { name: 'Intro', text: INTRO });
    const setId = `${PROJECT}-scripts`;

    renameSync(from, to);
    try {
      await ok('context_select', { brand: BRAND, project: renamed });

      // Listed as the renamed project's (the filter keys on the code).
      const listed = await ok('list_sets');
      expect(listed.filter.project).toBe(renamed);
      expect(listed.sets.map((s: any) => [s.id, s.project])).toContainEqual([setId, renamed]);

      // A new script joins the existing set — no second set beside it.
      const outro = await ok('write_script', { name: 'Outro', text: 'Bye.' });
      expect(outro.setId).toBe(setId);
      const file = JSON.parse(readFileSync(join(to, 'fli.tubby.json'), 'utf8'));
      expect(file.sets.map((s: any) => s.id)).toEqual([setId]);
      expect(file.sets[0].project).toBe(renamed); // corrected by the real write
      expect(file.sets[0].scripts.map((s: any) => s.id)).toEqual(['outro', 'intro']);

      // write_script naming the OLD folder name is the same project (same code).
      expect((await call('write_script', { name: 'CTA', text: 'Subscribe.', project: PROJECT })).ok).toBe(true);
    } finally {
      renameSync(to, from);
    }
  });

  it('an app-store set attached by the old name follows the code too', async () => {
    const repository = new FileRepository(join(userData, 'teletubby.json'));
    await repository.update((document) => ({
      document: {
        ...document,
        sets: [{ ...JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)), id: 'store-set', project: 'd01-an-older-name' }],
      },
      result: undefined,
    }));
    core = createCore({ repository });
    await open();
    const listed = await ok('list_sets');
    expect(listed.sets.map((s: any) => s.id)).toContain('store-set');
  });
});
