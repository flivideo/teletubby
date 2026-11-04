import { describe, expect, it } from 'vitest'
import { createVoiceControl } from '../src/main/voice/voice-control'
import { VoiceSession } from '../src/main/voice/voice-session'
import { GroqLive } from '../src/main/voice/groq-live'

type Line = [string, Record<string, unknown> | undefined]
const collector = () => {
  const lines: Line[] = []
  return { lines, log: (e: string, d?: Record<string, unknown>) => void lines.push([e, d]), names: () => lines.map((l) => l[0]) }
}
const session = () => {
  const calls: string[] = []
  return { calls, start: () => void calls.push('start'), stop: () => void calls.push('stop'), reset: () => void calls.push('reset') }
}

describe('voice control logs every step, errors included', () => {
  it('start: received → mic.status → mic.ask, then the session starts', async () => {
    const c = collector()
    const s = session()
    const handle = createVoiceControl({ session: s, mic: { status: () => 'not-determined', ask: async () => true }, log: c.log })
    expect(await handle({ action: 'start' })).toEqual({ ok: true })
    expect(c.names()).toEqual(['control.received', 'mic.status', 'mic.ask'])
    expect(s.calls).toEqual(['start'])
  })

  it('a denied ask is logged and returned as an error with the fix; the session never starts', async () => {
    const c = collector()
    const s = session()
    const handle = createVoiceControl({ session: s, mic: { status: () => 'not-determined', ask: async () => false }, log: c.log })
    const r = await handle({ action: 'start' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/Privacy & Security/)
    expect(c.lines.find((l) => l[0] === 'mic.ask')?.[1]).toMatchObject({ granted: false })
    expect(s.calls).toEqual([])
  })

  it('an already-denied mic is reported WITHOUT asking (macOS would not prompt again)', async () => {
    const c = collector()
    let asked = false
    const handle = createVoiceControl({
      session: session(),
      mic: { status: () => 'denied', ask: async () => ((asked = true), true) },
      log: c.log,
    })
    expect((await handle({ action: 'start' })).ok).toBe(false)
    expect(asked).toBe(false)
    expect(c.names()).toContain('mic.blocked')
  })

  it('a throw anywhere is logged as control.error and returned, never swallowed', async () => {
    const c = collector()
    const handle = createVoiceControl({
      session: { ...session(), start: () => { throw new Error('boom') } },
      mic: null,
      log: c.log,
    })
    expect(await handle({ action: 'start' })).toEqual({ ok: false, error: 'boom' })
    expect(c.lines.at(-1)).toEqual(['control.error', { action: 'start', error: 'boom' }])
  })
})

describe('session and Groq log their error paths', () => {
  it('no engine left → recogniser.skipped per engine, then recogniser.none', () => {
    const c = collector()
    const s = new VoiceSession({ engines: [() => null, () => { throw new Error('bad') }], emit: () => {}, log: c.log })
    s.start()
    expect(c.names()).toEqual(['session.start', 'recogniser.skipped', 'recogniser.error', 'recogniser.skipped', 'recogniser.none'])
  })

  it('a Groq http error is logged with status and body, never the key', async () => {
    const c = collector()
    const g = new GroqLive({
      key: 'gsk_SECRET',
      tickMs: 1_000_000,
      log: c.log,
      fetchImpl: (async () => new Response('{"error":"invalid_api_key"}', { status: 401 })) as typeof fetch,
    })
    g.start(() => {}, () => {})
    g.push(new Uint8Array(32 * 1000))
    await (g as unknown as { tick: () => Promise<void> }).tick()
    g.stop()
    const line = c.lines.find((l) => l[0] === 'groq.error')
    expect(line?.[1]).toMatchObject({ error: 'groq http 401', failures: 1 })
    expect(JSON.stringify(c.lines)).not.toContain('SECRET')
  })

  it('a Groq 429 is logged as a request (status 429) and is not a failure', async () => {
    const c = collector()
    let failed = false
    const g = new GroqLive({
      key: 'k',
      tickMs: 1_000_000,
      maxFailures: 1,
      log: c.log,
      fetchImpl: (async () => new Response('', { status: 429 })) as typeof fetch,
    })
    g.start(() => {}, () => { failed = true })
    g.push(new Uint8Array(32 * 1000))
    await (g as unknown as { tick: () => Promise<void> }).tick()
    g.stop()
    expect(c.lines.find((l) => l[0] === 'groq.request')?.[1]).toMatchObject({ status: 429 })
    expect(failed).toBe(false)
  })
})
