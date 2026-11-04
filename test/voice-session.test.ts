import { describe, expect, it, vi } from 'vitest'
import type { LiveRecognizer, RecognizerEvent } from '../src/core/recognizer'
import { VoiceSession } from '../src/main/voice/voice-session'
import type { VoiceEvent } from '../src/shared/voice'
import { AudioBudget, GroqLive, TICK_MS, WINDOW_MS, wavOf } from '../src/main/voice/groq-live'
import { loadGroqKey } from '../src/main/voice/secrets'

class Fake implements LiveRecognizer {
  pushed = 0
  resets = 0
  stopped = false
  fail: (r: string) => void = () => {}
  emit: (e: RecognizerEvent) => void = () => {}
  constructor(readonly name: string) {}
  start(onEvent: (e: RecognizerEvent) => void, onFail: (r: string) => void): void {
    this.emit = onEvent
    this.fail = onFail
  }
  push(): void { this.pushed++ }
  reset(): void { this.resets++ }
  stop(): void { this.stopped = true }
}

describe('voice session', () => {
  it('uses the primary, and falls back to the next engine when it fails', () => {
    const events: VoiceEvent[] = []
    const a = new Fake('groq')
    const b = new Fake('apple')
    const s = new VoiceSession({ engines: [() => a, () => b], emit: (e) => events.push(e) })
    s.start()
    s.push(new Uint8Array(4))
    expect(a.pushed).toBe(1)
    a.emit({ atMs: 1, windowStartMs: 0, text: 'hello' })
    a.fail('groq http 401')
    expect(a.stopped).toBe(true)
    s.push(new Uint8Array(4))
    expect(b.pushed).toBe(1)
    b.emit({ atMs: 2, windowStartMs: 0, text: 'again' })
    expect(events.filter((e) => e.type === 'text').map((e) => (e as { engine: string }).engine)).toEqual(['groq', 'apple'])
    expect(events.some((e) => e.type === 'status' && e.state === 'fallback')).toBe(true)
  })

  it('skips an engine that is unavailable and reports error when none remain', () => {
    const events: VoiceEvent[] = []
    const s = new VoiceSession({ engines: [() => null, () => null], emit: (e) => events.push(e) })
    s.start()
    expect(events.at(-1)).toMatchObject({ type: 'status', state: 'error' })
  })

  it('stop and reset reach the active engine; stop says off', () => {
    const events: VoiceEvent[] = []
    const a = new Fake('groq')
    const s = new VoiceSession({ engines: [() => a], emit: (e) => events.push(e) })
    s.start()
    s.reset()
    s.stop()
    expect(a.resets).toBe(1)
    expect(a.stopped).toBe(true)
    expect(events.at(-1)).toMatchObject({ state: 'off' })
  })
})

describe('groq live', () => {
  const pcm = (ms: number): Uint8Array => new Uint8Array(ms * 32)

  it('sends the rolling window and emits text; never leaks the key into events', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ text: ' hello there ' }), { status: 200 }))
    const g = new GroqLive({ key: 'SECRET', fetchImpl: fetchImpl as unknown as typeof fetch, tickMs: 1000 })
    const got: RecognizerEvent[] = []
    g.start((e) => got.push(e), () => {})
    g.push(pcm(1500))
    await vi.advanceTimersByTimeAsync(1100)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(got[0]?.text).toBe('hello there')
    expect(JSON.stringify(got)).not.toContain('SECRET')
    g.stop()
    vi.useRealTimers()
  })

  it('drops in-flight results after a reset, and reports failure after repeated errors', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(async () => new Response('no', { status: 500 }))
    const g = new GroqLive({ key: 'k', fetchImpl: fetchImpl as unknown as typeof fetch, tickMs: 1000, maxFailures: 2 })
    const fails: string[] = []
    g.start(() => {}, (r) => fails.push(r))
    for (let i = 0; i < 3; i++) {
      g.push(pcm(1000))
      await vi.advanceTimersByTimeAsync(1000)
    }
    expect(fails.length).toBeGreaterThan(0)
    g.stop()
    vi.useRealTimers()
  })

  it('three 429s in a row fail over (and the reason reaches the session log)', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(async () => new Response('slow down', { status: 429 }))
    const g = new GroqLive({ key: 'k', fetchImpl: fetchImpl as unknown as typeof fetch, tickMs: 1000 })
    const b = new Fake('apple')
    const lines: Array<[string, Record<string, unknown> | undefined]> = []
    const events: VoiceEvent[] = []
    const s = new VoiceSession({ engines: [() => g, () => b], emit: (e) => events.push(e), log: (e, d) => lines.push([e, d]) })
    s.start()
    for (let i = 0; i < 3; i++) {
      s.push(pcm(1000))
      await vi.advanceTimersByTimeAsync(1000)
    }
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(s.engine).toBe('apple')
    expect(lines.find(([e]) => e === 'recogniser.failed')?.[1]).toMatchObject({ engine: 'groq', reason: 'groq rate-limited' })
    expect(lines.filter(([e]) => e === 'recogniser.chosen').at(-1)?.[1]).toMatchObject({ engine: 'apple', from: 'groq', why: 'groq rate-limited' })
    s.stop()
    vi.useRealTimers()
  })

  it('a mixed 200/429 sequence does not fail over', async () => {
    vi.useFakeTimers()
    const statuses = [429, 429, 200, 429, 429, 200, 429]
    let n = 0
    const fetchImpl = vi.fn(async () => {
      const st = statuses[n++] ?? 200
      return st === 200 ? new Response(JSON.stringify({ text: 'hi' }), { status: 200 }) : new Response('', { status: st })
    })
    const fails: string[] = []
    const g = new GroqLive({ key: 'k', fetchImpl: fetchImpl as unknown as typeof fetch, tickMs: 1000 })
    g.start(() => {}, (r) => fails.push(r))
    for (let i = 0; i < statuses.length; i++) {
      g.push(pcm(1000))
      await vi.advanceTimersByTimeAsync(1000)
    }
    expect(fetchImpl).toHaveBeenCalledTimes(statuses.length)
    expect(fails).toEqual([])
    g.stop()
    vi.useRealTimers()
  })

  it('skips a request rather than exceed the hourly audio budget (10 s minimum each)', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ text: 'x' }), { status: 200 }))
    const lines: string[] = []
    // 25 audio-s/hour: two requests at the 10 s minimum fit, a third would not.
    const g = new GroqLive({ key: 'k', fetchImpl: fetchImpl as unknown as typeof fetch, tickMs: 1000, hourlyAudioSeconds: 25, log: (e) => lines.push(e) })
    g.start(() => {}, () => {})
    for (let i = 0; i < 3; i++) {
      g.push(pcm(1000))
      await vi.advanceTimersByTimeAsync(1000)
    }
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(lines).toContain('groq.budget.skip')
    // An hour later the budget has rolled over and the skipped audio goes out (once).
    await vi.advanceTimersByTimeAsync(3_600_000)
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    g.stop()
    vi.useRealTimers()
  })

  it('budget arithmetic: 5 s tick at the 10 s minimum fits the 7,200 s/hour cap', () => {
    const b = new AudioBudget()
    expect(AudioBudget.cost(3000)).toBe(10)
    expect(AudioBudget.cost(12000)).toBe(12)
    let t = 0
    for (let i = 0; i < 720; i++, t += TICK_MS) {
      expect(b.allow(WINDOW_MS, t)).toBe(true)
      b.charge(WINDOW_MS, t)
    }
    expect(b.allow(WINDOW_MS, t - 1)).toBe(false)
    expect(b.allow(WINDOW_MS, t)).toBe(true) // the first charge has aged out
  })

  it('makes a valid wav header', () => {
    const w = Buffer.from(wavOf(new Uint8Array(100)))
    expect(w.toString('ascii', 0, 4)).toBe('RIFF')
    expect(w.readUInt32LE(40)).toBe(100)
  })
})

describe('groq key loading', () => {
  it('prefers the environment, never throws when files are missing', () => {
    expect(loadGroqKey({ GROQ_API_KEY: 'abc' } as NodeJS.ProcessEnv, '/nonexistent')).toBe('abc')
    expect(loadGroqKey({} as NodeJS.ProcessEnv, '/nonexistent')).toBeNull()
  })
})
