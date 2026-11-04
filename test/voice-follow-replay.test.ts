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

  it('does not step on unrelated speech', () => {
    const { summary } = replay(paras, speak('completely different words about something else entirely', 0))
    expect(summary.steps).toBe(0)
    expect(summary.early).toBe(0)
  })
})
