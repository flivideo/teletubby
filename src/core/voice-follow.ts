/**
 * Voice-follow aligner: from the script and the talent's live (cumulative) recognised speech,
 * work out how far through the script they have read, so the prompter can scroll itself.
 *
 * Pure. No I/O, no timers. Word agreement is the only mechanism: a stretch of several script
 * words appearing in order in the speech is evidence; a coincidental word is not. Speech that
 * is unrelated to the script (an ad-lib in a trigger zone) therefore never moves the cursor.
 *
 * Offsets are code points (Array.from indexes), not UTF-16 units.
 */

export interface FollowOptions {
  /** Script words looked at ahead of the cursor. */
  window: number;
  /** Script words that may be skipped between two consecutive matches (talent dropped a word). */
  maxScriptSkip: number;
  /** Heard words that may be skipped between two consecutive matches (stray insert / noise). */
  maxHeardSkip: number;
  /** Guard: matched pairs required ... */
  runNeeded: number;
  /** ... within the last this-many heard words of the chain. */
  runOf: number;
  /** A chain this long commits without waiting for a second agreeing partial. */
  longRun: number;
  /** Far jump (beyond the window): consecutive, unskipped matched pairs required. */
  farRun: number;
  /** Script words before the cursor still used as matching context (never as progress). */
  lookback: number;
  /** Only the last this-many heard words are considered (cost cap). */
  heardCap: number;
}

export const DEFAULT_OPTIONS: FollowOptions = {
  window: 12,
  maxScriptSkip: 2,
  maxHeardSkip: 3,
  runNeeded: 3,
  runOf: 4,
  longRun: 5,
  farRun: 5,
  lookback: 4,
  heardCap: 80,
};

export type FollowReason =
  | 'advanced'
  | 'held-no-agreement'
  | 'held-unconfirmed'
  | 'no-match'
  | 'end';

export interface FollowResult {
  cursorChar: number;
  cursorWord: number;
  advanced: boolean;
  reason: FollowReason;
}

export interface FollowState {
  cursorChar: number;
  cursorWord: number;
  wordCount: number;
  /** Paragraph (blank-line separated) of the next unread word; last paragraph at the end. */
  cursorParagraph: number;
}

export interface Follower {
  hear(cumulativeText: string): FollowResult;
  anchor(offset: number): FollowState;
  state(): FollowState;
}

export interface ScriptWord {
  /** Lower-cased letters and digits only. */
  word: string;
  start: number;
  end: number;
  paragraph: number;
}

const isWordChar = (c: string | undefined): boolean => c !== undefined && /[\p{L}\p{N}]/u.test(c);
const isJoiner = (c: string | undefined): boolean => c === "'" || c === '’';

/** Cue spans `[...]` as [start, end) code-point ranges. An unclosed `[` is not a cue. */
function findCues(chars: string[]): Array<[number, number]> {
  const cues: Array<[number, number]> = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== '[') continue;
    let j = i + 1;
    while (j < chars.length && chars[j] !== ']') j++;
    if (j >= chars.length) break;
    cues.push([i, j + 1]);
    i = j;
  }
  return cues;
}

function wordsOf(chars: string[], cues: Array<[number, number]>): ScriptWord[] {
  const out: ScriptWord[] = [];
  let cue = 0;
  let paragraph = 0;
  let lastEnd = 0;
  let i = 0;
  while (i < chars.length) {
    while (cue < cues.length && cues[cue]![1] <= i) cue++;
    if (cue < cues.length && i >= cues[cue]![0]) {
      i = cues[cue]![1];
      continue;
    }
    if (!isWordChar(chars[i])) {
      i++;
      continue;
    }
    const start = i;
    let w = '';
    while (
      i < chars.length &&
      (isWordChar(chars[i]) || (isJoiner(chars[i]) && isWordChar(chars[i - 1]) && isWordChar(chars[i + 1])))
    ) {
      if (isWordChar(chars[i])) w += chars[i]!.toLowerCase();
      i++;
    }
    let breaks = 0;
    for (let k = lastEnd; k < start; k++) if (chars[k] === '\n') breaks++;
    if (out.length > 0 && breaks >= 2) paragraph++;
    out.push({ word: w, start, end: i, paragraph });
    lastEnd = i;
  }
  return out;
}

/** Normalised words of a heard string (same rules as the script view, no cues). */
export function heardWords(text: string): string[] {
  const chars = Array.from(text);
  return wordsOf(chars, []).map((w) => w.word);
}

/** The script's spoken words with code-point spans and paragraph. Cue spans produce none. */
export function scriptWords(text: string): ScriptWord[] {
  const chars = Array.from(text);
  return wordsOf(chars, findCues(chars));
}

function editDistance(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  let prev = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) {
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (x[i - 1] === y[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[y.length]!;
}

/**
 * "Same word" for alignment: equal; or long enough and sharing a long prefix (misheard
 * endings: record / recorded); or a small edit distance scaled by length. Words under 4
 * letters must match exactly.
 */
export function fuzzyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const x = Array.from(a);
  const y = Array.from(b);
  const lo = Math.min(x.length, y.length);
  const hi = Math.max(x.length, y.length);
  if (lo < 4) return false;
  let p = 0;
  while (p < lo && x[p] === y[p]) p++;
  if (p * 10 >= lo * 6) return true;
  const limit = lo <= 4 ? 1 : lo <= 8 ? 2 : Math.floor(hi / 3);
  return editDistance(a, b) <= limit;
}

interface Chain {
  /** Script index one past the last matched pair. */
  candidate: number;
  length: number;
  tail: number;
  firstHeard: number;
  firstScript: number;
  lastHeard: number;
}

export function createFollower(
  scriptText: string,
  startChar = 0,
  options: Partial<FollowOptions> = {},
): Follower {
  const opt: FollowOptions = { ...DEFAULT_OPTIONS, ...options };
  const chars = Array.from(scriptText);
  const cues = findCues(chars);
  const words = wordsOf(chars, cues);
  const n = words.length;

  let cursorWord = 0;
  let cursorChar = 0;
  let prevCandidate: number | null = null;

  const cueEndAt = (pos: number): number | null => {
    for (const [s, e] of cues) if (pos >= s && pos < e) return e;
    return null;
  };
  /** Move past whitespace and cue spans. */
  const skipFiller = (from: number): number => {
    let pos = from;
    for (;;) {
      while (pos < chars.length && /\s/u.test(chars[pos]!)) pos++;
      const e = cueEndAt(pos);
      if (e === null) return pos;
      pos = e;
    }
  };
  /** After a word: punctuation attached to it, then whitespace and cues. */
  const afterWord = (end: number): number => {
    let pos = end;
    while (
      pos < chars.length &&
      !/\s/u.test(chars[pos]!) &&
      !isWordChar(chars[pos]) &&
      cueEndAt(pos) === null &&
      chars[pos] !== '['
    )
      pos++;
    return skipFiller(pos);
  };

  const place = (offset: number): void => {
    const pos = skipFiller(Math.max(0, Math.min(chars.length, Math.floor(offset))));
    cursorChar = pos;
    let k = 0;
    while (k < n && words[k]!.start < pos) k++;
    cursorWord = k;
    prevCandidate = null;
  };
  place(startChar);

  const state = (): FollowState => ({
    cursorChar,
    cursorWord,
    wordCount: n,
    cursorParagraph: n === 0 ? 0 : words[Math.min(cursorWord, n - 1)]!.paragraph,
  });
  const result = (advanced: boolean, reason: FollowReason): FollowResult => ({
    cursorChar,
    cursorWord,
    advanced,
    reason,
  });

  /** Best chain reaching beyond the cursor that satisfies the agreement guard. */
  function findChain(heard: string[]): { chain: Chain | null; anyMatch: boolean } {
    const m = heard.length;
    const hs = Math.max(0, m - opt.heardCap);
    const j0 = Math.max(0, cursorWord - opt.lookback);
    const j1 = Math.min(n, cursorWord + opt.window);
    const W = j1 - j0;
    if (W <= 0) return { chain: null, anyMatch: false };
    const H = m - hs;
    // len[i][j]: longest chain ending at pair (i, j); prev pointers for the tail walk.
    const len: number[][] = [];
    const from: Array<Array<[number, number] | null>> = [];
    let anyMatch = false;
    let best: Chain | null = null;
    for (let a = 0; a < H; a++) {
      len.push(new Array<number>(W).fill(0));
      from.push(new Array<[number, number] | null>(W).fill(null));
      for (let b = 0; b < W; b++) {
        const j = j0 + b;
        if (!fuzzyEqual(heard[hs + a]!, words[j]!.word)) continue;
        if (j >= cursorWord) anyMatch = true;
        let bl = 1;
        let bp: [number, number] | null = null;
        for (let da = 1; da <= opt.maxHeardSkip + 1 && a - da >= 0; da++) {
          for (let db = 1; db <= opt.maxScriptSkip + 1 && b - db >= 0; db++) {
            const l = len[a - da]![b - db]!;
            if (l > 0 && l + 1 > bl) {
              bl = l + 1;
              bp = [a - da, b - db];
            }
          }
        }
        len[a]![b] = bl;
        from[a]![b] = bp;
        if (j + 1 <= cursorWord) continue;
        // Walk back for the tail count and the first pair.
        let tail = 0;
        let ca = a;
        let cb = b;
        let fa = a;
        let fb = b;
        for (;;) {
          if (ca >= a - (opt.runOf - 1)) tail++;
          fa = ca;
          fb = cb;
          const p = from[ca]![cb]!;
          if (!p) break;
          [ca, cb] = p;
        }
        const first = j0 + fb;
        const chain: Chain = {
          candidate: j + 1,
          length: bl,
          tail,
          firstHeard: fa,
          firstScript: first,
          lastHeard: a,
        };
        const strong = tail >= opt.runNeeded;
        const short =
          !strong &&
          bl <= 2 &&
          a === H - 1 &&
          hs === 0 &&
          fa <= 2 &&
          first >= cursorWord &&
          first <= cursorWord + 1;
        if (!strong && !short) continue;
        if (
          !best ||
          chain.candidate > best.candidate ||
          (chain.candidate === best.candidate && chain.length > best.length)
        )
          best = chain;
      }
    }
    return { chain: best, anyMatch };
  }

  /** Beyond the window: only a long, unskipped, consecutive run is believed. */
  function findFar(heard: string[]): number | null {
    const m = heard.length;
    const hs = Math.max(0, m - opt.heardCap);
    let bestCand: number | null = null;
    for (let i = hs; i < m; i++) {
      for (let j = cursorWord + opt.window; j < n; j++) {
        let k = 0;
        while (i + k < m && j + k < n && fuzzyEqual(heard[i + k]!, words[j + k]!.word)) k++;
        if (k >= opt.farRun) {
          const cand = j + k;
          if (bestCand === null || cand > bestCand) bestCand = cand;
        }
      }
    }
    return bestCand;
  }

  const commit = (candidate: number): FollowResult => {
    cursorWord = candidate;
    cursorChar = afterWord(words[candidate - 1]!.end);
    prevCandidate = candidate;
    return result(true, 'advanced');
  };

  return {
    hear(cumulativeText: string): FollowResult {
      if (cursorWord >= n) return result(false, 'end');
      const heard = heardWords(cumulativeText);
      if (heard.length === 0) return result(false, 'no-match');
      const { chain, anyMatch } = findChain(heard);
      if (!chain) {
        const far = findFar(heard);
        if (far !== null) return commit(far);
        prevCandidate = null;
        return result(false, anyMatch ? 'held-no-agreement' : 'no-match');
      }
      const confirmed =
        chain.length >= opt.longRun ||
        (prevCandidate !== null && Math.abs(prevCandidate - chain.candidate) <= 2);
      if (confirmed) return commit(chain.candidate);
      prevCandidate = chain.candidate;
      return result(false, 'held-unconfirmed');
    },
    anchor(offset: number): FollowState {
      place(offset);
      return state();
    },
    state,
  };
}
