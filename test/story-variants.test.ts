import { beforeEach, describe, expect, it } from 'vitest';
import type { MajorTopic, Paragraph, Script, ScriptSet, Transcript } from '@shared/domain';
import { useProm } from '../src/renderer/src/store';
import { reanchorParagraph, wordOverlap } from '../src/core/reanchor';
import { StageRequests, TalentActivity } from '../src/core/stage';

/**
 * Story variants on the stage. A new version of the variant being read updates
 * it in place and never moves the talent; a staging request for where they
 * already are does nothing; a variant switch has its own memory.
 */

const paras = (...texts: string[]): Paragraph[] => texts.map((text, i) => ({ id: `p${i + 1}`, text }));
const para = (id: string, text: string): { id: string; text: string } => ({ id, text });

const topics = (paragraphs: Paragraph[]): MajorTopic[] => [
  { id: 'm1', heading: 'A', minors: [{ id: 'm1-n1', heading: 'A', paragraphs }] },
];

const variant = (id: string, version: number, texts: string[], perParagraph = 1): Transcript => {
  const paragraphs = paras(...texts);
  return {
    id,
    kind: 'variant',
    corpus: id,
    talentId: null,
    source: 'test',
    topics: topics(paragraphs),
    triggerSets: [
      {
        style: 'loose-keywords',
        authoredBy: 'agent',
        triggers: paragraphs.flatMap((p, i) =>
          Array.from({ length: perParagraph }, (_, k) => ({
            id: `t${i + 1}-${k + 1}`,
            text: `${p.id}/${k + 1}`,
            paragraphId: p.id,
          })),
        ),
      },
    ],
    variant: { label: id.toUpperCase(), version },
  };
};

const plain = (texts: string[]): Transcript => ({
  ...variant('text', 1, texts),
  kind: 'provenance',
  corpus: 'as-written',
  variant: undefined,
});

const setOf = (...transcripts: Transcript[]): ScriptSet => ({
  id: 'set',
  title: 'Set',
  description: '',
  scripts: [
    { id: 'story', n: 1, title: 'Story', takeaway: 'T', summary: 'S', transcripts } as Script,
  ],
});

const WORDS = [
  'The first thing you hear is the door closing behind you.',
  'Then the long walk down the corridor begins in silence.',
  'At the end there is a window nobody has opened for years.',
  'You open it and the whole valley is suddenly right there.',
];

const s = () => useProm.getState();
const paragraphNow = (): string | undefined => {
  const state = s();
  const transcript = state.set?.scripts[0]?.transcripts.find((t) => t.id === state.transcriptId);
  const style = transcript?.triggerSets[0];
  return style?.triggers[state.step]?.paragraphId;
};

const open = (...transcripts: Transcript[]): void => {
  useProm.setState({ requestedVariant: null, variantPlaces: {}, freshTranscripts: {}, cue: null });
  s().load(setOf(...transcripts));
};
const stepTo = (paragraphId: string): void => {
  const state = s();
  const transcript = state.set!.scripts[0]!.transcripts.find((t) => t.id === state.transcriptId)!;
  useProm.setState({
    step: transcript.triggerSets[0]!.triggers.findIndex((t) => t.paragraphId === paragraphId),
  });
};

describe('reanchorParagraph: the words are the anchor', () => {
  const before = [para('p1', 'alpha beta gamma'), para('p2', 'delta epsilon zeta'), para('p3', 'eta theta iota')];

  it('a word edit stays on that paragraph', () => {
    const after = [para('p1', 'alpha beta gamma'), para('p2', 'delta epsilon omega'), para('p3', 'eta theta iota')];
    expect(reanchorParagraph(before, 'p2', after)).toBe('p2');
  });
  it('a paragraph inserted before moves the id, and the talent stays on the words', () => {
    const after = [para('p1', 'brand new opener'), ...before.map((p, i) => para(`p${i + 2}`, p.text))];
    expect(reanchorParagraph(before, 'p2', after)).toBe('p3');
  });
  it('an insert before AND a word edit on the live paragraph still finds it', () => {
    const after = [
      para('p1', 'brand new opener'),
      para('p2', 'alpha beta gamma'),
      para('p3', 'delta epsilon zeta plus'),
      para('p4', 'eta theta iota'),
    ];
    expect(reanchorParagraph(before, 'p2', after)).toBe('p3');
  });
  it('a paragraph removed before moves the id the other way', () => {
    const after = [para('p1', 'delta epsilon zeta'), para('p2', 'eta theta iota')];
    expect(reanchorParagraph(before, 'p2', after)).toBe('p1');
  });
  it('a deleted live paragraph lands on the next thing to say', () => {
    const after = [para('p1', 'alpha beta gamma'), para('p2', 'eta theta iota')];
    expect(reanchorParagraph(before, 'p2', after)).toBe('p2');
  });
  it('a full rewrite holds the place, clamped to the end', () => {
    const after = [para('p1', 'nothing the same here')];
    expect(reanchorParagraph(before, 'p3', after)).toBe('p1');
  });
  it('of two identical paragraphs, takes the nearest', () => {
    const repeat = [para('p1', 'same'), para('p2', 'x y z'), para('p3', 'same')];
    expect(reanchorParagraph(repeat, 'p3', [para('p1', 'same'), para('p2', 'q'), para('p3', 'r'), para('p4', 'same')])).toBe('p4');
  });
  it('nothing to land on is null, not a guess', () => {
    expect(reanchorParagraph(before, 'p1', [])).toBeNull();
  });
  it('overlap ignores case and punctuation, and counts repeats once each', () => {
    expect(wordOverlap('Hello, world!', 'hello world')).toBe(1);
    expect(wordOverlap('a a a a', 'a b c d')).toBe(0.25);
    expect(wordOverlap('', 'a')).toBe(0);
  });
});

describe('a new version of the variant on stage', () => {
  beforeEach(() => open(variant('long', 8, WORDS)));

  const republish = (texts: string[], version = 9, perParagraph = 1): void =>
    s().refresh(setOf(variant('long', version, texts, perParagraph)));

  it('changes the words and nothing else: no cue, no move, no arrival dot', () => {
    stepTo('p3');
    const before = s().step;
    republish([WORDS[0]!, WORDS[1]!, 'At the end there is a window nobody has touched for years.', WORDS[3]!]);
    expect(s().step).toBe(before);
    expect(paragraphNow()).toBe('p3');
    expect(s().cue).toBeNull();
    expect(s().freshTranscripts).toEqual({});
    expect(s().transcriptId).toBe('long');
  });
  it('tells the lane to re-seat, once per real change', () => {
    const seq = s().contentSeq;
    republish(['Different opener entirely here.', ...WORDS.slice(1)]);
    expect(s().contentSeq).toBe(seq + 1);
    republish(['Different opener entirely here.', ...WORDS.slice(1)]);
    expect(s().contentSeq).toBe(seq + 1);
  });
  it('a paragraph inserted above keeps the talent on the same words', () => {
    stepTo('p3');
    republish(['A brand new opening line for this story.', ...WORDS]);
    expect(paragraphNow()).toBe('p4');
    expect(s().cue).toBeNull();
  });
  it('keeps the beat inside the paragraph', () => {
    open(variant('long', 8, WORDS, 3));
    useProm.setState({ step: 8 }); // p3, third trigger
    republish(['A brand new opening line for this story.', ...WORDS], 9, 3);
    expect(s().set!.scripts[0]!.transcripts[0]!.triggerSets[0]!.triggers[s().step]!.text).toBe('p4/3');
  });
  it('clamps the beat when the paragraph has fewer triggers now', () => {
    open(variant('long', 8, WORDS, 3));
    useProm.setState({ step: 8 }); // p3, third trigger
    republish(WORDS, 9, 2);
    expect(s().set!.scripts[0]!.transcripts[0]!.triggerSets[0]!.triggers[s().step]!.text).toBe('p3/2');
  });
});

describe('the first publish over yesterday’s unlabelled script', () => {
  it('is an update: the talent stays on the words, on the new chip, with no cue', () => {
    open(plain(WORDS));
    stepTo('p3');
    s().refresh(setOf(variant('main', 9, ['A brand new opening line for this story.', ...WORDS])));
    expect(s().transcriptId).toBe('main');
    expect(paragraphNow()).toBe('p4');
    expect(s().cue).toBeNull();
  });
});

describe('another variant arriving', () => {
  it('does not move the talent, and marks its chip', () => {
    open(variant('long', 8, WORDS));
    stepTo('p2');
    const step = s().step;
    s().refresh(setOf(variant('long', 8, WORDS), variant('short', 1, ['Short words.', 'Done.'])));
    expect(s().transcriptId).toBe('long');
    expect(s().step).toBe(step);
    expect(s().freshTranscripts).toEqual({ story: ['short'] });
  });
});

describe('switching variants', () => {
  beforeEach(() => open(variant('long', 8, WORDS), variant('short', 1, ['One.', 'Two.', 'Three.'])));

  it('a first visit starts at the top, silently', () => {
    stepTo('p3');
    s().selectTranscript('short');
    expect(paragraphNow()).toBe('p1');
    expect(s().cue).toBeNull();
  });
  it('going back returns to where you were', () => {
    stepTo('p3');
    s().selectTranscript('short');
    stepTo('p2');
    s().selectTranscript('long');
    expect(paragraphNow()).toBe('p3');
    s().selectTranscript('short');
    expect(paragraphNow()).toBe('p2');
  });
  it('looking at it clears the arrival dot', () => {
    useProm.setState({ freshTranscripts: { story: ['short'] } });
    s().selectTranscript('short');
    expect(s().freshTranscripts).toEqual({});
  });
});

describe('a staging request in the window', () => {
  beforeEach(() => open(variant('long', 8, WORDS), variant('short', 1, ['One.', 'Two.'])));

  it('for where the talent already is: nothing moves, no cue (defect 1)', () => {
    stepTo('p3');
    const step = s().step;
    s().applyStageRequest('set', 'story', 'long');
    expect(s().step).toBe(step);
    expect(s().cue).toBeNull();
  });
  it('naming only the script they are on: still nothing', () => {
    stepTo('p3');
    const step = s().step;
    s().applyStageRequest('set', 'story', null);
    expect(s().step).toBe(step);
    expect(s().cue).toBeNull();
  });
  it('for another variant: moves there', () => {
    s().applyStageRequest('set', 'story', 'short');
    expect(s().transcriptId).toBe('short');
  });
  it('for a variant that has not arrived yet: lands when it does, once', () => {
    s().applyStageRequest('set', 'story', 'late');
    expect(s().transcriptId).toBe('long');
    s().refresh(setOf(variant('long', 8, WORDS), variant('short', 1, ['One.', 'Two.']), variant('late', 1, ['L.', 'M.'])));
    expect(s().transcriptId).toBe('late');
    expect(s().requestedVariant).toBeNull();
  });
  it('the talent stepping cancels a request still waiting', () => {
    s().applyStageRequest('set', 'story', 'late');
    stepTo('p2');
    s().refresh(setOf(variant('long', 8, WORDS), variant('short', 1, ['One.', 'Two.']), variant('late', 1, ['L.', 'M.'])));
    expect(s().transcriptId).toBe('long');
    expect(s().requestedVariant).toBeNull();
  });
  it('opening another set cancels a request still waiting', () => {
    s().applyStageRequest('set', 'story', 'late');
    s().load(setOf(variant('long', 8, WORDS)));
    expect(s().requestedVariant).toBeNull();
  });
  it('a request only lands on the script it asked about', () => {
    useProm.setState({ requestedVariant: { scriptId: 'other', variantId: 'late', step: s().step } });
    s().refresh(setOf(variant('long', 8, WORDS), variant('short', 1, ['One.', 'Two.']), variant('late', 1, ['L.', 'M.'])));
    expect(s().transcriptId).toBe('long');
  });
  it('the talent choosing cancels a request still waiting', () => {
    s().applyStageRequest('set', 'story', 'late');
    s().selectTranscript('short');
    s().refresh(setOf(variant('long', 8, WORDS), variant('short', 1, ['One.', 'Two.']), variant('late', 1, ['L.', 'M.'])));
    expect(s().transcriptId).toBe('short');
  });
});

describe('talent activity sees the variant', () => {
  const at = (transcriptId: string, paragraphId = 'p1') => ({
    setId: 's',
    scriptId: 'c',
    transcriptId,
    paragraphId,
  });
  const make = () => {
    let now = 1000;
    const stage = new StageRequests(() => now);
    const activity = new TalentActivity(() => now, stage);
    return { stage, activity, tick: (ms: number) => (now += ms) };
  };

  it('remembers which variant is on stage', () => {
    const { activity } = make();
    activity.observe(at('long'));
    expect(activity.position()).toMatchObject({ transcriptId: 'long' });
  });
  it('a variant switch is the talent moving', () => {
    const { activity } = make();
    activity.observe(at('long'));
    activity.observe(at('short'));
    expect(activity.busy()).toHaveLength(1);
  });
  it('landing where an agent asked is not', () => {
    const { activity, stage } = make();
    activity.observe(at('long'));
    stage.request('s', 'c', 'agent:x', 'short');
    activity.observe(at('short'));
    expect(activity.busy()).toEqual([]);
  });
  it('a variant other than the one asked for is the talent', () => {
    const { activity, stage } = make();
    activity.observe(at('long'));
    stage.request('s', 'c', 'agent:x', 'short');
    activity.observe(at('third'));
    expect(activity.busy()).toHaveLength(1);
  });
});
