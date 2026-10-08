import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CT-0108 (Tester): what create-console-home.test.ts and the skill's own verify_cmd do not reach.
 *  1. the pre-step file is the template's, byte for byte, and the seam also behaves for a home that does not exist yet;
 *  2. the segment-writer skill (uncommitted in the appydave-plugins checkout) keeps its contract: names, fixture,
 *     example draft inside David's envelope, every cited id real.
 * Skill-side tests skip when the plugins checkout is not on this machine.
 */

const TEMPLATE = '/Users/davidcruwys/dev/ad/apps/appytron/template/src/main/create-console.ts';
const SKILL = '/Users/davidcruwys/dev/ad/appydave-plugins/flivideo/skills/segment-writer';
const VOICE = '/Users/davidcruwys/dev/video-projects/v-appydave/voice-profile.md';

// ── 1. the pre-step ────────────────────────────────────────────────────────────────────────────────────────────────

const calls: string[] = [];
const setPath = vi.fn((name: string, value: string) => calls.push(`setPath ${name} ${value}`));
const warn = vi.fn();
vi.mock('electron', () => ({
  app: {
    setPath,
    whenReady: vi.fn(async () => {
      calls.push('whenReady');
    }),
    on: vi.fn(),
    quit: vi.fn(),
  },
  ipcMain: { handle: vi.fn(), removeHandler: vi.fn() },
  BrowserWindow: class {},
  shell: { openExternal: vi.fn() },
}));
vi.mock('@appydave/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@appydave/core')>();
  return {
    ...actual,
    createLogger: () => ({ warn, info: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn() }),
  };
});

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'teletubby-ct0108-'));
  calls.length = 0;
  setPath.mockClear();
  warn.mockClear();
});
afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(root, { recursive: true, force: true });
});

async function start() {
  const { createConsole } = await import('../src/main/create-console');
  await createConsole({ name: 'teletubby-ct0108', onReady: vi.fn() }).start();
}

describe('Feature: the CT-0043 pre-step is the template seam, adopted as is', () => {
  it.skipIf(!existsSync(TEMPLATE))(
    'Scenario: given the template, when create-console.ts is compared, then it is byte-identical (diff -q empty)',
    () => {
      expect(readFileSync(join(__dirname, '..', 'src', 'main', 'create-console.ts'), 'utf8')).toBe(
        readFileSync(TEMPLATE, 'utf8'),
      );
    },
  );

  it('Scenario: given APPYTRON_HOME names folders that do not exist yet, when the console starts, then they are created private and the paths move', async () => {
    const home = join(root, 'not', 'there', 'yet');
    vi.stubEnv('APPYTRON_HOME', home);
    await start();
    expect(statSync(join(home, 'userData')).mode & 0o777).toBe(0o700);
    expect(statSync(join(home, 'pictures')).mode & 0o777).toBe(0o700);
    expect(setPath).toHaveBeenCalledWith('userData', join(home, 'userData'));
    expect(setPath).toHaveBeenCalledWith('pictures', join(home, 'pictures'));
  });

  it('Scenario: given APPYTRON_HOME is set, when the console starts, then it warns that this is an isolated run, naming the folder', async () => {
    vi.stubEnv('APPYTRON_HOME', root);
    await start();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain(`APPYTRON_HOME=${root}`);
  });

  it('Scenario: given APPYTRON_HOME is unset, when the console starts, then nothing is warned and nothing is created', async () => {
    vi.stubEnv('APPYTRON_HOME', '');
    await start();
    expect(warn).not.toHaveBeenCalled();
    expect(setPath).not.toHaveBeenCalled();
  });
});

// ── 2. the skill ───────────────────────────────────────────────────────────────────────────────────────────────────

const haveSkill = existsSync(join(SKILL, 'SKILL.md'));
const skill = () => readFileSync(join(SKILL, 'SKILL.md'), 'utf8');
const fixture = () =>
  JSON.parse(readFileSync(join(SKILL, 'references', 'knowledge-fixture.json'), 'utf8'));
const example = () => readFileSync(join(SKILL, 'references', 'example-load.md'), 'utf8');

/** The draft table in example-load.md: `| p1 | text | r_kn0001, r_kn0004 |`. */
function draftRows(): Array<{ id: string; text: string; uses: string[] }> {
  return example()
    .split('\n')
    .map((l) => /^\|\s*(p\d+)\s*\|\s*(.+?)\s*\|\s*(r_[\w, ]+?)\s*\|\s*$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ id: m[1], text: m[2], uses: m[3].split(',').map((s) => s.trim()) }));
}

describe.skipIf(!haveSkill)('Feature: the segment-writer skill keeps its contract', () => {
  it('Scenario: given SKILL.md, when read, then it names the authoring order, the trigger minimum, dry runs and the voice profile', () => {
    const s = skill();
    for (const must of [
      'script.create',
      'create_script',
      'write_transcript',
      'write_trigger_set',
      'dryRun: true',
      'voice-profile',
      'At least 2 triggers',
    ]) {
      expect(s, must).toContain(must);
    }
    expect(s).toMatch(/Never invent facts/i);
    expect(existsSync(VOICE)).toBe(true);
    expect(s).toContain(VOICE);
  });

  it('Scenario: given the fixture, when parsed, then it has 3+ knowledge items of the allowed kinds, unique ids, each with meta.why', () => {
    const d = fixture();
    expect(d.schema).toBe(1);
    const ids = d.resources.map((r: { id: string }) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(d.resources.length).toBeGreaterThanOrEqual(3);
    for (const r of d.resources) {
      expect(['dossier', 'capture', 'link', 'note'], r.id).toContain(r.kind);
      expect(typeof r.meta?.why === 'string' && r.meta.why.length > 10, r.id).toBe(true);
    }
  });

  it('Scenario: given the example draft, when measured, then it is one segment inside the envelope (40-120 words, 2-4 paragraphs of 250 chars or fewer, no em-dash, no anti-voice words)', () => {
    const rows = draftRows();
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.length).toBeLessThanOrEqual(4);
    const words = rows.reduce((n, r) => n + r.text.split(/\s+/).length, 0);
    expect(words).toBeGreaterThanOrEqual(40);
    expect(words).toBeLessThanOrEqual(120);
    for (const r of rows) {
      expect(r.text.length, r.id).toBeLessThanOrEqual(250);
      expect(r.text, r.id).not.toContain('—');
      expect(r.text.toLowerCase(), r.id).not.toMatch(
        /game.changing|revolutionary|ultimate|supercharge|unleash|unlock|seamless|10x|mind blowing|fast paced/,
      );
    }
  });

  it('Scenario: given the example trace list, when each cited id is looked up, then it exists in the fixture and every paragraph cites one', () => {
    const known = new Set(fixture().resources.map((r: { id: string }) => r.id));
    for (const r of draftRows()) {
      expect(r.uses.length, r.id).toBeGreaterThan(0);
      for (const id of r.uses) expect(known.has(id), `${r.id} cites ${id}`).toBe(true);
    }
  });

  it('Scenario: given the example transcript source, when its ids are looked up, then each is a fixture id', () => {
    const known = new Set(fixture().resources.map((r: { id: string }) => r.id));
    const source = /"source":"[^"]*\(([^)]*)\)"/.exec(example());
    expect(source).not.toBeNull();
    for (const id of source![1].split(',').map((s) => s.trim()))
      expect(known.has(id), id).toBe(true);
  });

  // Round-1 finding, fixed in round 2: the call block now lists each dry run AND the real write that followed it,
  // in the order they ran (re-run 2026-10-08 under APPYTRON_HOME=/tmp/teletubby-isolated.YQooV4).
  it(
    'Scenario: given the example call block, when its calls are read, then each of create_script, write_transcript and write_trigger_set also appears without dryRun',
    () => {
      const lines = example().split('\n');
      for (const verb of ['create_script', 'write_transcript', 'write_trigger_set']) {
        const calls = lines.filter((l) => l.includes(`call ${verb} `));
        expect(
          calls.some((l) => !l.includes('"dryRun":true')),
          verb,
        ).toBe(true);
      }
    },
  );

  // Round-1 finding, fixed in round 2: p1 no longer claims a wish or a duration; it states only the dossier's gap
  // (nothing turns research into a segment). The loaded transcript was re-written to match.
  it(
    'Scenario: given the example draft, when its sentences are checked against the knowledge, then it makes no claim about how long David has wanted this',
    () => {
      const draft = draftRows()
        .map((r) => r.text)
        .join(' ')
        .toLowerCase();
      expect(draft).not.toContain('for a while');
    },
  );
});
