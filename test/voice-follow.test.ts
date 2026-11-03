import { describe, expect, it } from 'vitest'
import { PromptMatcher } from '../src/core/voice-follow'

// The two tests are ports of Textream's PromptCoreTests (commit 2c02f3e).
describe('PromptMatcher (ported from Textream)', () => {
  it('skips a cue and moves forward with a fuzzy transcript', () => {
    const m = new PromptMatcher('Welcome [smile] to the presentation today')
    const first = m.match('welcome to the')
    const second = m.match('welcome to the presentation')
    expect(first).toBeGreaterThan('Welcome'.length)
    expect(second).toBeGreaterThanOrEqual(first)
    expect(second).toBeGreaterThan('Welcome [smile] to the'.length)
  })

  it('never moves backward', () => {
    const m = new PromptMatcher('one two three four five six')
    const forward = m.match('one two three four')
    expect(m.match('one')).toBe(forward)
  })

  it('jump re-anchors and clears history', () => {
    const m = new PromptMatcher('one two three four five six')
    m.match('one two three four')
    expect(m.jump(0)).toBe(0)
    expect(m.recognizedCharacterCount).toBe(0)
  })
})
