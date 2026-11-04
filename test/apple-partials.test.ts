import { describe, expect, it } from 'vitest'
import { createPartialFilter, IGNORE_MS, SLACK, trimHeard } from '../src/main/voice/apple-partials'
import { AppleLive } from '../src/main/voice/apple-live'
import type { RecognizerEvent } from '../src/core/recognizer'

describe('trimHeard', () => {
  it('cuts an exact prefix', () => expect(trimHeard('one two three four', 'one two')).toBe('three four'))
  it('no prefix → unchanged', () => expect(trimHeard('one two', '')).toBe('one two'))
  it('a revised tail is cut on a word boundary within the slack', () => {
    // "recorded" was revised to "record" after the press; the cut still lands before new speech.
    const prefix = 'we have recorded'
    const out = trimHeard('we have record the next take', prefix)
    expect(out).toBe('the next take')
  })
  it('never keeps more than SLACK chars of the old text', () => {
    const prefix = 'x'.repeat(60) + ' old words here'
    const out = trimHeard('y'.repeat(60) + ' old words here and new speech', prefix)
    expect(out.length).toBeLessThanOrEqual(' and new speech'.length + SLACK)
  })
})

describe('apple partial filter', () => {
  it('reset: trims the heard text off later partials of the same task', () => {
    const f = createPartialFilter()
    f.task(1)
    expect(f.partial(1, 'welcome to the show', 0)).toMatchObject({ kind: 'text', text: 'welcome to the show' })
    f.reset(1000)
    expect(f.partial(1, 'welcome to the show the second idea', 1000 + IGNORE_MS + 1)).toMatchObject({
      kind: 'text',
      text: 'the second idea',
    })
  })

  it('ignores partials for 300 ms after a reset, and counts them as old speech', () => {
    const f = createPartialFilter()
    f.partial(1, 'welcome to', 0)
    f.reset(1000)
    expect(f.partial(1, 'welcome to the show', 1200)).toEqual({ kind: 'drop', reason: 'after-reset', task: 1 })
    // The late "the show" belonged to before the press, so it is trimmed too.
    expect(f.partial(1, 'welcome to the show second idea', 1301)).toMatchObject({ kind: 'text', text: 'second idea' })
  })

  it('a task swap clears the remembered prefix', () => {
    const f = createPartialFilter()
    f.partial(1, 'welcome to the show', 0)
    f.reset(1000)
    expect(f.task(2)).toBe(true)
    expect(f.state.prefix).toBe('')
    expect(f.partial(2, 'second idea', 2000)).toMatchObject({ kind: 'text', text: 'second idea' })
  })

  it('a partial of a newer task implies the swap', () => {
    const f = createPartialFilter()
    f.partial(1, 'welcome to the show', 0)
    f.reset(10)
    expect(f.partial(2, 'the show', 5000)).toMatchObject({ kind: 'text', text: 'the show', swapped: true })
  })

  it('drops a stale partial from an older task', () => {
    const f = createPartialFilter()
    f.task(3)
    expect(f.partial(2, 'old text', 0)).toEqual({ kind: 'drop', reason: 'stale-task', task: 2 })
    expect(f.partial(3, 'new text', 0)).toMatchObject({ kind: 'text', text: 'new text' })
  })
})

describe('AppleLive reset (no relaunch)', () => {
  it('reset trims and ignores without touching the helper', () => {
    let now = 0
    const a = new AppleLive('/nonexistent/TeletubbySpeech.app', undefined, () => now)
    const got: RecognizerEvent[] = []
    // Not started (no helper launched): exercise the filter path the helper lines take.
    ;(a as unknown as { onEvent: (e: RecognizerEvent) => void }).onEvent = (e) => got.push(e)
    a.partial(1, 'welcome to the show')
    now = 1000
    a.reset()
    a.partial(1, 'welcome to the show today') // within 300 ms: dropped
    now = 1400
    a.partial(1, 'welcome to the show today we build')
    a.partial(0, 'stale old task')
    expect(got.map((e) => e.text)).toEqual(['welcome to the show', 'we build'])
  })
})
