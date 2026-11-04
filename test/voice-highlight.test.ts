import { describe, expect, it } from 'vitest'
import { highlightTokens, tokensText, type HighlightToken } from '../src/core/voice-highlight'
import { createVoiceDriver } from '../src/core/voice-driver'
import { scriptWords } from '../src/core/voice-follow'

const words = (t: HighlightToken[]) => t.filter((x): x is Extract<HighlightToken, { kind: 'word' }> => x.kind === 'word')
const states = (t: HighlightToken[]) => words(t).map((w) => `${w.core}:${w.state}`)

describe('word highlight (pure)', () => {
  const text = 'Welcome back, everyone. [pause] Today we build "Teletubby".'

  it('renders the paragraph text exactly, word indexes matching scriptWords', () => {
    const t = highlightTokens(text, 2)
    expect(tokensText(t)).toBe(text)
    expect(words(t).map((w) => w.core.toLowerCase())).toEqual(scriptWords(text).map((w) => w.word))
    expect(words(t).map((w) => w.index)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('said before the cursor, exactly one current, unsaid after', () => {
    expect(states(highlightTokens(text, 2))).toEqual([
      'Welcome:said',
      'back:said',
      'everyone:current',
      'Today:unsaid',
      'we:unsaid',
      'build:unsaid',
      'Teletubby:unsaid',
    ])
    const cur = words(highlightTokens(text, 4)).filter((w) => w.state === 'current')
    expect(cur.map((w) => w.core)).toEqual(['we'])
  })

  it('punctuation rides with its word but is not the word', () => {
    const w = words(highlightTokens(text, 0))
    expect(w[1]).toMatchObject({ core: 'back', trail: ',' })
    expect(w[6]).toMatchObject({ lead: '"', core: 'Teletubby', trail: '".' })
  })

  it('cues are their own tokens and never the current word', () => {
    const t = highlightTokens(text, 3) // word 3 = "Today", right after the cue
    expect(t.filter((x) => x.kind === 'cue').map((x) => (x as { text: string }).text)).toEqual(['[pause]'])
    const cur = words(t).filter((w) => w.state === 'current')
    expect(cur).toHaveLength(1)
    expect(cur[0]!.core).toBe('Today')
  })

  it('cursor elsewhere (null): nothing said, nothing current', () => {
    const w = words(highlightTokens(text, null))
    expect(w.every((x) => x.state === 'unsaid')).toBe(true)
  })

  it('cursor at the end: all said, no current', () => {
    const w = words(highlightTokens(text, 7))
    expect(w.every((x) => x.state === 'said')).toBe(true)
  })

  it('a paragraph with newlines indexes the same as the flattened text', () => {
    const multi = 'First line here\nsecond line there'
    expect(words(highlightTokens(multi, 3)).find((w) => w.state === 'current')?.core).toBe('second')
  })
})

const paras = [
  { id: 'p1', text: 'Welcome to the show today we are building a prompter' },
  { id: 'p2', text: 'The second idea is that the talent should look at the lens' },
  { id: 'p3', text: 'Finally we record the take and learn from every fumble' },
]

describe('driver word cursor', () => {
  it('follows the talent word by word inside the paragraph', () => {
    const d = createVoiceDriver(paras, 'p1')
    expect(d.cursor).toEqual({ paragraphId: 'p1', wordInParagraph: 0 })
    d.hear('welcome to the show today')
    d.hear('welcome to the show today')
    expect(d.cursor?.paragraphId).toBe('p1')
    expect(d.cursor?.wordInParagraph).toBe(5)
    const t = highlightTokens(paras[0]!.text, d.cursor!.wordInParagraph)
    expect(words(t).find((w) => w.state === 'current')?.core).toBe('we')
  })

  it('crossing into the next paragraph restarts the word count there', () => {
    const d = createVoiceDriver(paras, 'p1')
    const full = 'welcome to the show today we are building a prompter the second idea'
    d.hear(full)
    const r = d.hear(full)
    expect(r.cursor).toEqual({ paragraphId: 'p2', wordInParagraph: 3 })
  })

  it('re-anchor puts the cursor at the paragraph start (tint clears)', () => {
    const d = createVoiceDriver(paras, 'p1')
    d.hear('welcome to the show today we')
    d.hear('welcome to the show today we')
    expect(d.cursor!.wordInParagraph).toBeGreaterThan(0)
    d.anchor('p1')
    expect(d.cursor).toEqual({ paragraphId: 'p1', wordInParagraph: 0 })
    d.anchor('p3')
    expect(d.cursor).toEqual({ paragraphId: 'p3', wordInParagraph: 0 })
  })

  it('hints are the NEAREST upcoming distinct 5+-letter words, original spelling, capped', () => {
    const d = createVoiceDriver(
      [{ id: 'a', text: 'Meet Kybernesis and the kybernesis team. Then prompters, prompters everywhere.' }],
      'a',
    )
    expect(d.hints(50, 5)).toEqual(['Kybernesis', 'prompters', 'everywhere'])
    expect(d.hints(2, 5)).toEqual(['Kybernesis', 'prompters'])
    const e = createVoiceDriver(paras, 'p2')
    expect(e.hints(3, 5)).toEqual(['second', 'talent', 'should'])
  })
})
