/**
 * Voice driver — the pure glue between recogniser text and the prompter's paragraphs.
 *
 * Holds one follower over the open script (paragraphs joined by blank lines) and answers, per
 * piece of heard text: which paragraph is the talent now in, and did that move FORWARD past
 * where the prompter already is. The prompter never moves backwards by voice; re-anchoring
 * (a manual press, a script change) is the only way back.
 */
import { createFollower, type Follower, type FollowReason } from './voice-follow.js'

export interface DriverParagraph {
  id: string
  text: string
}

export interface DriverResult {
  /** Paragraph the talent has reached, or null before anything is confirmed. */
  paragraphId: string | null
  /** True only when `paragraphId` is later than where the driver last stood. */
  advanced: boolean
  reason: FollowReason
}

export interface VoiceDriver {
  hear(text: string): DriverResult
  /** Put the talent at the START of this paragraph; drops pending evidence. */
  anchor(paragraphId: string): void
  readonly paragraphId: string | null
}

const flat = (t: string): string => t.replace(/\s*\n\s*/g, ' ').trim()

export function createVoiceDriver(paragraphs: DriverParagraph[], startId?: string | null): VoiceDriver {
  const starts: number[] = []
  let script = ''
  paragraphs.forEach((p, i) => {
    if (i > 0) script += '\n\n'
    starts.push(Array.from(script).length)
    script += flat(p.text)
  })
  const follower: Follower = createFollower(script)
  let at: number = 0
  const idx = (id: string | null | undefined): number => paragraphs.findIndex((p) => p.id === id)

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
    anchor,
    hear(text) {
      const r = follower.hear(text)
      const para = follower.state().cursorParagraph
      const i = Math.min(Math.max(para, 0), paragraphs.length - 1)
      const advanced = i > at
      if (advanced) at = i
      return { paragraphId: paragraphs[at]?.id ?? null, advanced, reason: r.reason }
    },
  }
}
