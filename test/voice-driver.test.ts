import { describe, expect, it } from 'vitest'
import { createVoiceDriver } from '../src/core/voice-driver'

const paras = [
  { id: 'p1', text: 'Welcome to the show today we are building a prompter' },
  { id: 'p2', text: 'The second idea is that the talent should look at the lens' },
  { id: 'p3', text: 'Finally we record the take and learn from every fumble' },
]

describe('voice driver', () => {
  it('starts on the given paragraph and does not move on unrelated speech', () => {
    const d = createVoiceDriver(paras, 'p1')
    const r = d.hear('completely different words about something else entirely')
    expect(r.advanced).toBe(false)
    expect(d.paragraphId).toBe('p1')
  })

  it('advances forward as the talent reads through paragraph one into two', () => {
    const d = createVoiceDriver(paras, 'p1')
    const r1 = d.hear('welcome to the show today we are building a prompter')
    const r2 = d.hear('welcome to the show today we are building a prompter the second idea is that the talent')
    expect(r1.paragraphId === 'p2' || r2.paragraphId === 'p2').toBe(true)
    expect(d.paragraphId).toBe('p2')
  })

  it('never goes backwards by voice; anchor is the only way', () => {
    const d = createVoiceDriver(paras, 'p3')
    d.hear('welcome to the show today we are building a prompter')
    expect(d.paragraphId).toBe('p3')
    d.anchor('p1')
    expect(d.paragraphId).toBe('p1')
  })

  it('ignores an unknown anchor', () => {
    const d = createVoiceDriver(paras, 'p2')
    d.anchor('nope')
    expect(d.paragraphId).toBe('p2')
  })
})
