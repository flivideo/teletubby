/**
 * Word highlight for voice-follow — pure, no React, so the states are testable without a DOM.
 *
 * A paragraph becomes tokens: spoken words (each with a state), `[cue]` spans, and the gaps
 * between them. Word indexes match `scriptWords(text)` exactly, which is what the voice driver's
 * `wordInParagraph` counts, so the window and the aligner can never disagree about which word
 * is which.
 *
 *   said     — before the cursor; recedes
 *   current  — the ONE next unsaid word; a quiet underline. Never a cue (cues are not words).
 *   unsaid   — after it; unchanged
 *
 * `word === null` (the cursor is in another paragraph) → no said/current at all, cues still dim.
 */
import { cueSpans, scriptWords } from './voice-follow.js'

export type WordState = 'said' | 'current' | 'unsaid'

export type HighlightToken =
  | {
      kind: 'word'
      /** Index into `scriptWords(text)`. */
      index: number
      /** Punctuation glued before / after the word: same state, never underlined. */
      lead: string
      core: string
      trail: string
      state: WordState
    }
  | { kind: 'cue'; text: string }
  | { kind: 'gap'; text: string }

export function highlightTokens(text: string, word: number | null): HighlightToken[] {
  const chars = Array.from(text)
  const slice = (a: number, b: number): string => chars.slice(a, b).join('')
  const words = scriptWords(text)
  const cues = cueSpans(text)
  // Every word and cue span in document order.
  const spans: Array<{ kind: 'word' | 'cue'; start: number; end: number; index: number }> = [
    ...words.map((w, index) => ({ kind: 'word' as const, start: w.start, end: w.end, index })),
    ...cues.map(([start, end]) => ({ kind: 'cue' as const, start, end, index: -1 })),
  ].sort((a, b) => a.start - b.start)

  const stateOf = (i: number): WordState =>
    word === null ? 'unsaid' : i < word ? 'said' : i === word ? 'current' : 'unsaid'

  const out: HighlightToken[] = []
  let pos = 0
  let pendingLead = ''
  for (let s = 0; s < spans.length; s++) {
    const span = spans[s]!
    // The gap before this span: glued punctuation goes to the previous word (trail) up to the
    // first whitespace, and the non-space run right before a word becomes its lead.
    let gap = slice(pos, span.start)
    const prev = out[out.length - 1]
    if (prev && prev.kind === 'word' && gap) {
      const m = /^[^\s[\]]*/u.exec(gap)![0]
      prev.trail += m
      gap = gap.slice(m.length)
    }
    if (span.kind === 'word' && gap) {
      const m = /[^\s[\]]*$/u.exec(gap)![0]
      pendingLead = m
      gap = gap.slice(0, gap.length - m.length)
    }
    if (gap) out.push({ kind: 'gap', text: gap })
    if (span.kind === 'cue') {
      out.push({ kind: 'cue', text: slice(span.start, span.end) })
    } else {
      out.push({
        kind: 'word',
        index: span.index,
        lead: pendingLead,
        core: slice(span.start, span.end),
        trail: '',
        state: stateOf(span.index),
      })
      pendingLead = ''
    }
    pos = span.end
  }
  let tail = slice(pos, chars.length)
  const last = out[out.length - 1]
  if (last && last.kind === 'word' && tail) {
    const m = /^[^\s[\]]*/u.exec(tail)![0]
    last.trail += m
    tail = tail.slice(m.length)
  }
  if (tail) out.push({ kind: 'gap', text: tail })
  return out
}

/** The text a token list renders — always the paragraph's own text, character for character. */
export function tokensText(tokens: HighlightToken[]): string {
  return tokens.map((t) => (t.kind === 'word' ? t.lead + t.core + t.trail : t.text)).join('')
}
