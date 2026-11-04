import { describe, expect, it } from 'vitest';
import { createFollower, fuzzyEqual, scriptWords } from '../src/core/voice-follow';

const P1 = 'Welcome to the show today everyone and thanks for joining me';
const P2 = 'First we look at the teleprompter screen and how it scrolls';
const P3 = 'Finally we record the take and review it together carefully';
const SCRIPT = `${P1}\n\n${P2}\n\n${P3}`;

/** Feed the follower one more word at a time, like a streaming partial. */
function readAloud(f: ReturnType<typeof createFollower>, text: string) {
  const ws = text.split(' ');
  let last = f.state();
  const cursors: number[] = [];
  for (let i = 1; i <= ws.length; i++) {
    f.hear(ws.slice(0, i).join(' '));
    last = f.state();
    cursors.push(last.cursorChar);
  }
  return { last, cursors };
}

describe('voice-follow', () => {
  it('reading exactly advances word by word and never goes backward', () => {
    const f = createFollower(SCRIPT);
    const { last, cursors } = readAloud(f, P1);
    for (let i = 1; i < cursors.length; i++) expect(cursors[i]!).toBeGreaterThanOrEqual(cursors[i - 1]!);
    expect(last.cursorWord).toBe(11);
    // cursor sits at the start of paragraph 2 (after the blank line)
    expect(last.cursorChar).toBe(Array.from(P1).length + 2);
    expect(last.cursorParagraph).toBe(1);
  });

  it('unrelated ad-lib on a 3-paragraph script leaves the cursor unmoved', () => {
    const f = createFollower(SCRIPT);
    const before = f.state();
    const words = 'honestly I was thinking about my dog and some pizza yesterday'.split(' ');
    for (let i = 1; i <= words.length; i++) {
      const r = f.hear(words.slice(0, i).join(' '));
      expect(r.advanced).toBe(false);
    }
    expect(f.state().cursorChar).toBe(before.cursorChar);
    expect(f.state().cursorWord).toBe(0);
  });

  it('scattered single shared words do not advance', () => {
    const f = createFollower(SCRIPT);
    const speech = 'so this show is a long thing that everyone likes to talk about for me';
    const words = speech.split(' ');
    for (let i = 1; i <= words.length; i++) f.hear(words.slice(0, i).join(' '));
    expect(f.state().cursorWord).toBe(0);
  });

  it('tolerates misheard endings and a dropped word', () => {
    const f = createFollower(SCRIPT);
    // "welcomed to show today everybody" : ending changed, "the" dropped, last word misheard
    const r1 = f.hear('welcomed to show today everyones');
    const r2 = f.hear('welcomed to show today everyones and thanks');
    const r3 = f.hear('welcomed to show today everyones and thanks for joining');
    expect(r1.advanced || r2.advanced || r3.advanced).toBe(true);
    expect(f.state().cursorWord).toBeGreaterThanOrEqual(9);
  });

  it('jumps to paragraph 3 only with a strong run', () => {
    const weak = createFollower(SCRIPT);
    weak.hear('Welcome to the');
    const before = weak.state().cursorWord;
    // far-ahead words, only 3 consecutive, and one coincidence
    weak.hear('Finally we record');
    weak.hear('Finally we record');
    expect(weak.state().cursorWord).toBe(before);

    const strong = createFollower(SCRIPT);
    strong.hear('Welcome to the');
    const r = strong.hear('Finally we record the take and review it');
    expect(r.advanced).toBe(true);
    expect(r.reason).toBe('advanced');
    expect(strong.state().cursorWord).toBeGreaterThanOrEqual(scriptWords(SCRIPT).findIndex((w) => w.word === 'review'));
    expect(strong.state().cursorParagraph).toBe(2);
  });

  it('cue at the start: cursor starts after it', () => {
    const text = '[pause for the camera] Hello there my friends';
    const f = createFollower(text);
    expect(f.state().cursorChar).toBe(Array.from('[pause for the camera] ').length);
    expect(f.state().cursorWord).toBe(0);
    expect(scriptWords(text).map((w) => w.word)).toEqual(['hello', 'there', 'my', 'friends']);
  });

  it('two cues in a row at the start are both skipped', () => {
    const text = '[one] [two]\n[three] Hello there';
    const f = createFollower(text);
    expect(f.state().cursorChar).toBe(text.indexOf('Hello'));
  });

  it('a cue in the middle is skipped and never leaves the cursor in front of it', () => {
    const text = 'Hello there my friends. [look at camera] Today we talk about prompters';
    const f = createFollower(text);
    readAloud(f, 'Hello there my friends');
    expect(f.state().cursorChar).toBe(text.indexOf('Today'));
    // cue words are invisible to matching
    f.hear('Hello there my friends look at camera today we talk');
    expect(f.state().cursorWord).toBe(7);
  });

  it('a cue at the end of the script is skipped too', () => {
    const text = 'The end is here [fade out]';
    const f = createFollower(text);
    readAloud(f, 'The end is here');
    expect(f.state().cursorChar).toBe(Array.from(text).length);
    expect(f.hear('The end is here and more').reason).toBe('end');
  });

  it('anchor sets the cursor (any direction), clears evidence, then follows new speech', () => {
    const f = createFollower(SCRIPT);
    readAloud(f, P1);
    const p2 = SCRIPT.indexOf('First');
    expect(f.anchor(0).cursorChar).toBe(0);
    expect(f.state().cursorWord).toBe(0);
    const s = f.anchor(p2);
    expect(s.cursorChar).toBe(p2);
    expect(s.cursorWord).toBe(11);
    readAloud(f, 'First we look at the');
    expect(f.state().cursorWord).toBe(16);
  });

  it('anchor onto a cue lands after it', () => {
    const text = 'One two [beat] three four';
    const f = createFollower(text);
    expect(f.anchor(text.indexOf('[')).cursorChar).toBe(text.indexOf('three'));
  });

  it('revised-shorter cumulative text never moves the cursor back', () => {
    const f = createFollower(SCRIPT);
    readAloud(f, 'Welcome to the show today everyone and');
    const at = f.state().cursorChar;
    f.hear('Welcome to the show');
    expect(f.state().cursorChar).toBe(at);
    f.hear('well');
    expect(f.state().cursorChar).toBe(at);
    f.hear('');
    expect(f.state().cursorChar).toBe(at);
  });

  it('end of script: reports end and stays put', () => {
    const f = createFollower('Just three words');
    readAloud(f, 'Just three words');
    const s = f.state();
    expect(s.cursorWord).toBe(3);
    const r = f.hear('Just three words and more');
    expect(r).toMatchObject({ advanced: false, reason: 'end', cursorWord: 3 });
  });

  it('empty heard text is no-match, cursor unchanged', () => {
    const f = createFollower(SCRIPT);
    expect(f.hear('   ')).toMatchObject({ advanced: false, reason: 'no-match', cursorWord: 0 });
  });

  it('options can be overridden', () => {
    const f = createFollower('alpha beta gamma delta epsilon', 0, { longRun: 3 });
    f.hear('alpha beta gamma');
    expect(f.state().cursorWord).toBe(3);
  });

  it('startChar starts the cursor partway', () => {
    const f = createFollower(SCRIPT, SCRIPT.indexOf('First'));
    expect(f.state().cursorWord).toBe(11);
  });

  it('fuzzy equality: endings and typos yes, short or unrelated words no', () => {
    expect(fuzzyEqual('record', 'recorded')).toBe(true);
    expect(fuzzyEqual('teleprompter', 'teleprompters')).toBe(true);
    expect(fuzzyEqual('screen', 'screed')).toBe(true);
    expect(fuzzyEqual('the', 'she')).toBe(false);
    expect(fuzzyEqual('is', 'it')).toBe(false);
    expect(fuzzyEqual('show', 'dog')).toBe(false);
  });
});
