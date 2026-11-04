/**
 * Voice driver — the pure glue between recogniser text and the prompter's paragraphs.
 *
 * Holds one follower over the open script (paragraphs joined by blank lines) and answers, per
 * piece of heard text: which paragraph is the talent now in, which WORD of it is next, and did
 * that move FORWARD past where the prompter already is. The prompter never moves backwards by
 * voice; re-anchoring (a manual press, a script change) is the only way back.
 *
 * The word cursor is an index into the paragraph's spoken words as `scriptWords(paragraph.text)`
 * produces them — never a character offset, because the driver flattens newlines and the
 * window renders the paragraph's own text.
 */
import { createFollower, scriptWords, type Follower, type FollowReason } from './voice-follow.js'

export interface DriverParagraph {
  id: string
  text: string
}

/** Where the talent is: the paragraph and the index of its next unsaid spoken word. */
export interface VoiceCursor {
  paragraphId: string
  /** 0 = nothing said yet; === the paragraph's word count = all of it said. */
  wordInParagraph: number
}

export interface DriverResult {
  /** Paragraph the talent has reached, or null before anything is confirmed. */
  paragraphId: string | null
  /** True only when `paragraphId` is later than where the driver last stood. */
  advanced: boolean
  reason: FollowReason
  cursor: VoiceCursor | null
}

export interface VoiceDriver {
  hear(text: string): DriverResult
  /** Put the talent at the START of this paragraph; drops pending evidence. */
  anchor(paragraphId: string): void
  readonly paragraphId: string | null
  readonly cursor: VoiceCursor | null
  /**
   * Recogniser vocabulary hint: the NEAREST upcoming distinct words of `minLetters`+ letters from
   * the cursor, at most `max`, in script order and original spelling (names like Kybernesis).
   */
  hints(max?: number, minLetters?: number): string[]
}

const flat = (t: string): string => t.replace(/\s*\n\s*/g, ' ').trim()

export function createVoiceDriver(paragraphs: DriverParagraph[], startId?: string | null): VoiceDriver {
  const starts: number[] = []
  /** First global word index of each paragraph, and its word count. */
  const wordStart: number[] = []
  const wordCount: number[] = []
  let script = ''
  let words = 0
  paragraphs.forEach((p, i) => {
    if (i > 0) script += '\n\n'
    starts.push(Array.from(script).length)
    const text = flat(p.text)
    script += text
    const n = scriptWords(text).length
    wordStart.push(words)
    wordCount.push(n)
    words += n
  })
  const chars = Array.from(script)
  const all = scriptWords(script)
  const follower: Follower = createFollower(script)
  let at: number = 0
  const idx = (id: string | null | undefined): number => paragraphs.findIndex((p) => p.id === id)

  /** Paragraph holding global word `k` (the next unsaid one); the last paragraph with words at the end. */
  const paragraphOfWord = (k: number): number => {
    for (let i = 0; i < paragraphs.length; i++) if (wordCount[i]! > 0 && k < wordStart[i]! + wordCount[i]!) return i
    for (let i = paragraphs.length - 1; i >= 0; i--) if (wordCount[i]! > 0) return i
    return 0
  }

  const cursorNow = (): VoiceCursor | null => {
    const p = paragraphs[at]
    if (!p) return null
    const k = follower.state().cursorWord
    // The driver's paragraph never moves back, so clamp the follower's word into it.
    const w = Math.max(0, Math.min(wordCount[at]!, k - wordStart[at]!))
    return { paragraphId: p.id, wordInParagraph: w }
  }

  const anchor = (id: string): void => {
    const i = idx(id)
    if (i < 0) return
    follower.anchor(starts[i]!)
    at = i
  }
  if (startId) anchor(startId)

  return {
    get paragraphId() {
      return paragraphs[at]?.id ?? null
    },
    get cursor() {
      return cursorNow()
    },
    anchor,
    hear(text) {
      const r = follower.hear(text)
      const i = Math.min(Math.max(paragraphOfWord(follower.state().cursorWord), 0), paragraphs.length - 1)
      const advanced = i > at
      if (advanced) at = i
      return { paragraphId: paragraphs[at]?.id ?? null, advanced, reason: r.reason, cursor: cursorNow() }
    },
    hints(max = 50, minLetters = 5) {
      const out: string[] = []
      const seen = new Set<string>()
      for (let k = follower.state().cursorWord; k < all.length && out.length < max; k++) {
        const w = all[k]!
        if (Array.from(w.word).length < minLetters || seen.has(w.word)) continue
        seen.add(w.word)
        out.push(chars.slice(w.start, w.end).join(''))
      }
      return out
    },
  }
}
