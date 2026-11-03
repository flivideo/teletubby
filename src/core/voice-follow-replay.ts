/**
 * Replay harness for the voice-follow aligner. Pure; no I/O.
 *
 * Feeds a word-timed transcript to `PromptMatcher` one word at a time (cumulative, like a
 * streaming partial) and reports, per script paragraph, when the aligner stepped into it
 * versus when the paragraph's speech actually began.
 *
 * ⚠️ TRUTH here is "aligner vs SPEECH", not "vs ↓ presses": the speech-start of paragraph N is
 * found by a separate, much simpler locator (first words of N, fuzzy, in order). No ↓-press log
 * exists yet (Teletubby writes none). The press log is the follow-up.
 */
import { PromptMatcher, isFuzzyMatch } from './voice-follow'

export interface TimedWord {
  word: string
  start: number
}

export interface ParagraphResult {
  index: number
  speechStart: number | null
  stepAt: number | null
  /** stepAt − speechStart, seconds. null when either side is missing. */
  offset: number | null
}

export interface ReplaySummary {
  paragraphs: number
  steps: number
  located: number
  within1s: number
  within2s: number
  medianOffset: number | null
  worstOffset: number | null
  /** Stepped before the paragraph was spoken (offset < −1 s), or stepped where no speech start was found. */
  early: number
  /** Speech start located but the aligner never stepped. */
  misses: number
  matchRate: number | null
}

const clean = (w: string): string => Array.from(w.toLowerCase()).filter((c) => /[\p{L}\p{N}]/u.test(c)).join('')

/** Speech start of each paragraph: in-order fuzzy match of its first `probe` words. */
export function locateSpeechStarts(paragraphs: string[], words: TimedWord[], probe = 3): Array<number | null> {
  const out: Array<number | null> = []
  let from = 0
  for (const p of paragraphs) {
    const head = p.split(/\s+/).map(clean).filter(Boolean).slice(0, probe)
    let found: number | null = null
    for (let i = from; i < words.length && head.length > 0; i++) {
      if (head.every((h, k) => words[i + k] !== undefined && isFuzzyMatch(h, clean(words[i + k]!.word)))) {
        found = i
        break
      }
    }
    if (found === null) {
      out.push(null)
    } else {
      out.push(words[found]!.start)
      from = found + head.length
    }
  }
  return out
}

export function replay(paragraphs: string[], words: TimedWord[]): { rows: ParagraphResult[]; summary: ReplaySummary } {
  const text = paragraphs.join(' ')
  const starts: number[] = []
  let pos = 0
  for (const p of paragraphs) {
    starts.push(pos)
    pos += Array.from(p).length + 1
  }
  const truth = locateSpeechStarts(paragraphs, words)
  const stepAt: Array<number | null> = paragraphs.map(() => null)
  const m = new PromptMatcher(text)
  let spoken = ''
  for (const w of words) {
    spoken += (spoken ? ' ' : '') + w.word
    const at = m.match(spoken)
    // Paragraph k is "entered" once progress has passed its first character.
    for (let k = 0; k < paragraphs.length; k++) {
      if (stepAt[k] === null && at > starts[k]!) stepAt[k] = w.start
    }
  }
  const rows = paragraphs.map((_, i) => ({
    index: i,
    speechStart: truth[i]!,
    stepAt: stepAt[i]!,
    offset: truth[i] !== null && stepAt[i] !== null ? stepAt[i]! - truth[i]! : null
  }))
  // The first paragraph is entered by definition once any word matches; still counted.
  const offs = rows.map((r) => r.offset).filter((o): o is number => o !== null)
  const sorted = [...offs].sort((a, b) => a - b)
  const median = sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)]! : null
  const worst = offs.length ? offs.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a)) : null
  const located = rows.filter((r) => r.speechStart !== null).length
  const summary: ReplaySummary = {
    paragraphs: rows.length,
    steps: rows.filter((r) => r.stepAt !== null).length,
    located,
    within1s: offs.filter((o) => Math.abs(o) <= 1).length,
    within2s: offs.filter((o) => Math.abs(o) <= 2).length,
    medianOffset: median,
    worstOffset: worst,
    early: rows.filter((r) => r.stepAt !== null && (r.speechStart === null || r.offset! < -1)).length,
    misses: rows.filter((r) => r.speechStart !== null && r.stepAt === null).length,
    matchRate: located ? offs.filter((o) => Math.abs(o) <= 2).length / located : null
  }
  return { rows, summary }
}
