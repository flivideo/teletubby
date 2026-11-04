import { mkdtemp, readFile, readdir, writeFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PressLog, parsePressLog, type PressEvent } from '../src/core/press-log';
import { pressTimesFromLog, replay } from '../src/core/voice-follow-replay';

const tmp = () => mkdtemp(path.join(tmpdir(), 'presslog-'));
describe('PressLog writer', () => {
  it('writes every kind as one JSON line with ISO ms wall clock and monotonic ms', async () => {
    const dir = await tmp();
    let ms = 1000;
    let wall = Date.parse('2026-11-04T03:20:00.000Z');
    const log = new PressLog({ dir: () => dir, now: () => new Date(wall), clock: () => ms });
    const kinds = ['start', 'step', 'back', 'jump', 'stop'] as const;
    kinds.forEach((kind, i) => {
      ms += 250;
      wall += 250;
      log.record({
        kind,
        scriptId: 'kyb/01',
        scriptVersion: 'abc',
        from: i,
        to: i + 1,
        paragraphId: `p${i}`,
      });
    });
    await log.flush();
    const files = await readdir(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^kyb_01-2026-11-04T03-20-00\.250Z\.jsonl$/);
    const events = parsePressLog(await readFile(path.join(dir, files[0]!), 'utf8'));
    expect(events.map((e) => e.kind)).toEqual([...kinds]);
    expect(events[1]).toMatchObject({
      t: '2026-11-04T03:20:00.500Z',
      mono: 500,
      from: 1,
      to: 2,
      paragraphId: 'p1',
      scriptId: 'kyb/01',
      scriptVersion: 'abc',
    });
    await rm(dir, { recursive: true });
  });

  it('appends: a second start opens a second file; the first is untouched', async () => {
    const dir = await tmp();
    let wall = Date.parse('2026-11-04T03:20:00.000Z');
    const log = new PressLog({ dir: () => dir, now: () => new Date((wall += 1000)) });
    log.record({ kind: 'start', scriptId: 'a' });
    log.record({ kind: 'step', scriptId: 'a', from: 0, to: 1 });
    log.record({ kind: 'stop', scriptId: 'a' });
    log.record({ kind: 'start', scriptId: 'b' });
    await log.flush();
    const files = (await readdir(dir)).sort();
    expect(files).toHaveLength(2);
    expect(
      parsePressLog(await readFile(path.join(dir, files[0]!), 'utf8')).map((e) => e.kind),
    ).toEqual(['start', 'step', 'stop']);
  });

  it('a press with no session opens one; a stray stop writes nothing', async () => {
    const dir = await tmp();
    const log = new PressLog({ dir: () => dir });
    log.record({ kind: 'stop', scriptId: 'a' });
    log.record({ kind: 'step', scriptId: 'a', from: 0, to: 1 });
    await log.flush();
    const [f] = await readdir(dir);
    expect(parsePressLog(await readFile(path.join(dir, f!), 'utf8')).map((e) => e.kind)).toEqual([
      'start',
      'step',
    ]);
  });

  it('tolerates failure: unwritable dir and no dir are reported or ignored, never thrown', async () => {
    const dir = await tmp();
    const blocker = path.join(dir, 'file');
    await writeFile(blocker, 'x');
    const errors: unknown[] = [];
    const bad = new PressLog({
      dir: () => path.join(blocker, 'sub'),
      onError: (e) => errors.push(e),
    });
    expect(() => bad.record({ kind: 'start', scriptId: 'a' })).not.toThrow();
    await bad.flush();
    expect(errors.length).toBeGreaterThan(0);
    const none = new PressLog({ dir: () => null });
    expect(() => none.record({ kind: 'start', scriptId: 'a' })).not.toThrow();
    const throwing = new PressLog({
      dir: () => {
        throw new Error('boom');
      },
      onError: () => {
        throw new Error('worse');
      },
    });
    expect(() => throwing.record({ kind: 'start', scriptId: 'a' })).not.toThrow();
    // junk from the renderer is ignored
    expect(() => bad.record({ kind: 'nope', scriptId: 1 } as never)).not.toThrow();
  });

  it('parsePressLog skips a torn last line', () => {
    const e = { kind: 'step', scriptId: 'a', t: 'x', mono: 1 };
    expect(parsePressLog(JSON.stringify(e) + '\n{"kind":"ste')).toHaveLength(1);
  });
});

describe('replay against a press log', () => {
  const speak = (text: string, t0: number, dt = 0.4) =>
    text.split(' ').map((word, i) => ({ word, start: t0 + i * dt }));
  const paras = [
    'Welcome to the show today everyone',
    'First we look at the teleprompter screen',
    'Finally we record the take and review it',
  ];
  const words = [...speak(paras[0]!, 0), ...speak(paras[1]!, 4), ...speak(paras[2]!, 8)];
  const t0 = Date.parse('2026-11-04T03:20:00.000Z');
  const ev = (kind: PressEvent['kind'], sec: number, paragraphId?: string): PressEvent => ({
    kind,
    scriptId: 's',
    t: new Date(t0 + sec * 1000).toISOString(),
    mono: sec * 1000,
    paragraphId,
  });
  const events = [
    ev('start', 0, 'a'),
    ev('step', 4.3, 'b'),
    ev('back', 5, 'a'),
    ev('step', 6, 'b'),
    ev('step', 8.1, 'c'),
    ev('stop', 12),
  ];

  it('maps first entry per paragraph (never a back) to take-clock seconds', () => {
    expect(pressTimesFromLog(events, 3, { paragraphIds: ['a', 'b', 'c'] })).toEqual([0, 4.3, 8.1]);
    expect(pressTimesFromLog(events, 3)).toEqual([0, 4.3, 8.1]); // ids numbered by first appearance
    expect(pressTimesFromLog(events, 3, { shift: 1 })[1]).toBeCloseTo(5.3);
    expect(pressTimesFromLog(events, 3, { takeStart: new Date(t0 - 1000).toISOString() })[0]).toBe(
      1,
    );
    expect(pressTimesFromLog([], 2)).toEqual([null, null]);
  });

  it('compares aligner steps with presses and summarises', () => {
    const truth = pressTimesFromLog(events, 3);
    const { rows, summary } = replay(paras, words, truth);
    expect(rows.map((r) => r.speechStart)).toEqual([0, 4.3, 8.1]);
    expect(summary.located).toBe(3);
    expect(summary.within2s).toBe(3);
    expect(summary.misses).toBe(0);
    expect(summary.medianOffset).not.toBeNull();
    // a paragraph David pressed but the aligner never reached is a miss
    const short = replay(paras, words.slice(0, 7), truth);
    expect(short.summary.misses).toBeGreaterThan(0);
  });
});
