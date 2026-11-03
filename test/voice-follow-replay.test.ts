import { describe, expect, it } from 'vitest'
import { locateSpeechStarts, replay } from '../src/core/voice-follow-replay'

const speak = (text: string, t0: number, dt = 0.4) =>
  text.split(' ').map((word, i) => ({ word, start: t0 + i * dt }))

const paras = [
  'Welcome to the show today everyone',
  'First we look at the teleprompter screen',
  'Finally we record the take and review it'
]
const words = [...speak(paras[0]!, 0), ...speak(paras[1]!, 4), ...speak(paras[2]!, 8)]

describe('voice-follow replay', () => {
  it('locates each paragraph start from word timings', () => {
    expect(locateSpeechStarts(paras, words)).toEqual([0, 4, 8])
  })

  it('steps each paragraph within 2 s when the script is read verbatim', () => {
    const { rows, summary } = replay(paras, words)
    expect(rows.every((r) => r.stepAt !== null)).toBe(true)
    expect(summary.within2s).toBe(3)
    expect(summary.misses).toBe(0)
  })

  it('reports a miss when a paragraph is skipped', () => {
    const { summary } = replay(paras, [...speak(paras[0]!, 0), ...speak(paras[2]!, 8)])
    expect(summary.located).toBe(2)
  })

  // KNOWN CHARACTERISTIC of the Textream algorithm (see docs/voice-follow-slice1-results): the
  // char-level scan advances on stray letter matches, so unrelated speech still moves it (here
  // ~45 chars, into paragraph 2). Pinned so a change to the matcher is a deliberate decision.
  it('false-steps on unrelated speech, but not all the way through the script', () => {
    const { rows, summary } = replay(paras, speak('completely different words about something else entirely', 0))
    expect(summary.steps).toBe(2)
    expect(rows[2]!.stepAt).toBeNull()
    expect(summary.early).toBe(2)
  })
})
