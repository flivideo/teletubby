import { beforeEach, describe, expect, it } from 'vitest';
import { KYBERNESIS_PHASE_1 } from '@shared/script-set';
import type { PressInput } from '@shared/press';
import { attachPressLog } from '../src/renderer/src/press-log';
import { useProm } from '../src/renderer/src/store';

const s = () => useProm.getState();

describe('renderer press-log hook', () => {
  let sent: PressInput[];
  let detach: () => void;
  beforeEach(() => {
    detach?.();
    useProm.setState({ set: null, scriptId: null, transcriptId: null, style: null, step: 0 });
    s().load(JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)));
    sent = [];
    detach = attachPressLog((i) => sent.push(i));
  });

  it('starts on attach, logs step / back from the arrows and jump for anything else', () => {
    expect(sent.map((e) => e.kind)).toEqual(['start']);
    expect(sent[0]!.scriptId).toBe(s().scriptId);
    expect(sent[0]!.scriptVersion).toMatch(/^[0-9a-f]{8}$/);
    s().stepNext();
    s().stepNext();
    s().stepPrev();
    useProm.setState({ step: 0 }); // not via the arrows
    const moves = sent.slice(1);
    expect(moves.map((e) => e.kind)).toEqual(['step', 'step', 'back', 'jump']);
    expect(moves[0]).toMatchObject({ from: 0, to: 1 });
    expect(moves[0]!.paragraphId).toBeTruthy();
  });

  it('changing script is stop + start, and a refused step at the boundary logs nothing', () => {
    const first = s().scriptId!;
    s().goToNextScript();
    const tail = sent.slice(-2);
    expect(tail.map((e) => e.kind)).toEqual(['stop', 'start']);
    expect(tail[0]!.scriptId).toBe(first);
    expect(tail[1]!.scriptId).toBe(s().scriptId);
    const n = sent.length;
    useProm.setState({ step: 0 });
    for (let i = 0; i < 400; i++) s().stepNext();
    const before = sent.length;
    s().stepNext(); // end of script: nudge only
    expect(sent.length).toBe(before);
    expect(before).toBeGreaterThan(n);
  });

  it('a throwing sender never reaches the store', () => {
    detach();
    detach = attachPressLog(() => {
      throw new Error('ipc down');
    });
    expect(() => s().stepNext()).not.toThrow();
  });
});
