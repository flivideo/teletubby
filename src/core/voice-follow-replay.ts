/**
 * Replay harness for the voice-follow aligner. Pure; no I/O.
 *
 * Feeds a word-timed transcript to the follower one word at a time (cumulative, like a
 * streaming partial) and reports, per script paragraph, when the aligner stepped into it
 * versus when the paragraph's speech actually began.
 *
 * ⚠️ TRUTH here is "aligner vs SPEECH", not "vs ↓ presses": the speech-start of paragraph N is
 * found by a separate, much simpler locator (first words of N, fuzzy, in order). With a press
 * log (`pressTimesFromLog`) truth is instead "aligner vs David's ↓ presses": pass its result as
 * `truthOverride`; `speechStart` in the rows then holds the PRESS time.
 */
import { createFollower, fuzzyEqual } from './voice-follow';
import type { PressEvent } from './press-log';

export interface TimedWord {
  word: string;
  start: number;
}

export interface ParagraphResult {
  index: number;
  speechStart: number | null;
  stepAt: number | null;
  /** stepAt − speechStart, seconds. null when either side is missing. */
  offset: number | null;
}

export interface ReplaySummary {
  paragraphs: number;
  steps: number;
  located: number;
  within1s: number;
  within2s: number;
  medianOffset: number | null;
  worstOffset: number | null;
  /** Stepped before the paragraph was spoken (offset < −1 s), or stepped where no speech start was found. */
  early: number;
  /** Speech start located but the aligner never stepped. */
  misses: number;
  matchRate: number | null;
}

const clean = (w: string): string =>
  Array.from(w.toLowerCase())
    .filter((c) => /[\p{L}\p{N}]/u.test(c))
    .join('');

/** Speech start of each paragraph: in-order fuzzy match of its first `probe` words. */
export function locateSpeechStarts(
  paragraphs: string[],
  words: TimedWord[],
  probe = 3,
): Array<number | null> {
  const out: Array<number | null> = [];
  let from = 0;
  for (const p of paragraphs) {
    const head = p.split(/\s+/).map(clean).filter(Boolean).slice(0, probe);
    let found: number | null = null;
    for (let i = from; i < words.length && head.length > 0; i++) {
      if (
        head.every(
          (h, k) => words[i + k] !== undefined && fuzzyEqual(h, clean(words[i + k]!.word)),
        )
      ) {
        found = i;
        break;
      }
    }
    if (found === null) {
      out.push(null);
    } else {
      out.push(words[found]!.start);
      from = found + head.length;
    }
  }
  return out;
}

export function replay(
  paragraphs: string[],
  words: TimedWord[],
  /** Ground truth per paragraph (seconds on the transcript clock). Default: located from the speech. */
  truthOverride?: Array<number | null>,
): { rows: ParagraphResult[]; summary: ReplaySummary } {
  const text = paragraphs.join(' ');
  const starts: number[] = [];
  let pos = 0;
  for (const p of paragraphs) {
    starts.push(pos);
    pos += Array.from(p).length + 1;
  }
  const truth = truthOverride ?? locateSpeechStarts(paragraphs, words);
  const stepAt: Array<number | null> = paragraphs.map(() => null);
  const follower = createFollower(text);
  let spoken = '';
  for (const w of words) {
    spoken += (spoken ? ' ' : '') + w.word;
    const at = follower.hear(spoken).cursorChar;
    // Paragraph k is "entered" once progress has passed its first character.
    for (let k = 0; k < paragraphs.length; k++) {
      if (stepAt[k] === null && at > starts[k]!) stepAt[k] = w.start;
    }
  }
  const rows = paragraphs.map((_, i) => ({
    index: i,
    speechStart: truth[i]!,
    stepAt: stepAt[i]!,
    offset: truth[i] !== null && stepAt[i] !== null ? stepAt[i]! - truth[i]! : null,
  }));
  // The first paragraph is entered by definition once any word matches; still counted.
  const offs = rows.map((r) => r.offset).filter((o): o is number => o !== null);
  const sorted = [...offs].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)]! : null;
  const worst = offs.length ? offs.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a)) : null;
  const located = rows.filter((r) => r.speechStart !== null).length;
  const summary: ReplaySummary = {
    paragraphs: rows.length,
    steps: rows.filter((r) => r.stepAt !== null).length,
    located,
    within1s: offs.filter((o) => Math.abs(o) <= 1).length,
    within2s: offs.filter((o) => Math.abs(o) <= 2).length,
    medianOffset: median,
    worstOffset: worst,
    early: rows.filter((r) => r.stepAt !== null && (r.speechStart === null || r.offset! < -1))
      .length,
    misses: rows.filter((r) => r.speechStart !== null && r.stepAt === null).length,
    matchRate: located ? offs.filter((o) => Math.abs(o) <= 2).length / located : null,
  };
  return { rows, summary };
}

export interface PressLogOptions {
  /** Paragraph ids in script order. Absent: ids are numbered by order of first appearance in the log. */
  paragraphIds?: string[];
  /** Wall-clock ISO of the recording's t=0. Absent: the log's first `start` event is t=0. */
  takeStart?: string;
  /** Seconds added to every press time, to nudge a known sync error. */
  shift?: number;
}

/**
 * Per script paragraph, the take-clock second (matching the transcript's `start`) at which David
 * first moved INTO it — `start`, `step` or `jump`, never `back`. null when never pressed.
 */
export function pressTimesFromLog(
  events: PressEvent[],
  paragraphCount: number,
  opts: PressLogOptions = {},
): Array<number | null> {
  const first = events.find((e) => e.kind === 'start') ?? events[0];
  if (!first) return Array.from({ length: paragraphCount }, () => null);
  const zero = Date.parse(opts.takeStart ?? first.t);
  const order = opts.paragraphIds ? [...opts.paragraphIds] : [];
  const out: Array<number | null> = Array.from({ length: paragraphCount }, () => null);
  for (const e of events) {
    if (e.kind === 'back' || e.kind === 'stop' || !e.paragraphId) continue;
    let idx = order.indexOf(e.paragraphId);
    if (idx < 0 && !opts.paragraphIds) {
      order.push(e.paragraphId);
      idx = order.length - 1;
    }
    if (idx < 0 || idx >= paragraphCount || out[idx] !== null) continue;
    out[idx] = (Date.parse(e.t) - zero) / 1000 + (opts.shift ?? 0);
  }
  return out;
}
