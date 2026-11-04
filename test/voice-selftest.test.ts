import { describe, expect, it } from 'vitest'
import {
  SAMPLE_TEXT,
  checkAligner,
  checkApple,
  checkGroqRoundtrip,
  checkMic,
  formatSelftest,
  runVoiceSelftest,
  type SelftestDeps,
} from '../src/core/voice-selftest'

const deps = (over: Partial<SelftestDeps> = {}): SelftestDeps => ({
  where: 'app',
  groqKey: () => 'gsk_test',
  micStatus: () => 'granted',
  sampleWav: new Uint8Array(4),
  groqTranscribe: async () => ({ status: 200, text: SAMPLE_TEXT }),
  apple: { path: '/x/apple-stt', exists: () => true, probe: async () => ({ text: SAMPLE_TEXT }) },
  sleep: async () => {},
  ...over,
})

describe('voice self-test', () => {
  it('passes end to end with healthy stubs, and prints PASS per check', async () => {
    const r = await runVoiceSelftest(deps())
    expect(r.ok).toBe(true)
    expect(r.checks.map((c) => [c.name, c.pass])).toEqual([
      ['groq-key', true],
      ['mic-permission', true],
      ['groq-roundtrip', true],
      ['apple-helper', true],
      ['aligner', true],
    ])
    const out = formatSelftest(r)
    expect(out).toContain('PASS  groq-key')
    expect(out).toContain('RESULT: PASS')
  })

  it('a missing key FAILs with a fix and skips the round trip', async () => {
    const r = await runVoiceSelftest(deps({ groqKey: () => null }))
    expect(r.ok).toBe(false)
    expect(r.checks[0]).toMatchObject({ name: 'groq-key', pass: false })
    expect(r.checks[0]!.fix).toMatch(/GROQ_API_KEY/)
    expect(r.checks[2]).toMatchObject({ name: 'groq-roundtrip', pass: null })
  })

  it('never prints the key', async () => {
    const out = formatSelftest(await runVoiceSelftest(deps({ groqKey: () => 'gsk_SECRET_VALUE' })))
    expect(out).not.toContain('SECRET')
  })

  it.each([
    ['denied', false],
    ['restricted', false],
    ['granted', true],
    ['not-determined', true],
  ])('mic %s → pass=%s, with the System Settings fix on a FAIL', async (status, pass) => {
    const c = await checkMic(deps({ micStatus: () => status }))
    expect(c.pass).toBe(pass)
    if (!pass) expect(c.fix).toMatch(/Privacy & Security → Microphone/)
  })

  it('an unreadable mic status is SKIP, never PASS', async () => {
    const c = await checkMic(deps({ where: 'standalone', micStatus: () => null }))
    expect(c.pass).toBeNull()
    expect(formatSelftest({ ok: true, where: 'standalone', checks: [c] })).toContain('SKIP  mic-permission')
  })

  it('Groq 401 says the key is wrong; 429 twice says rate-limited; a throw says no connection', async () => {
    expect((await checkGroqRoundtrip(deps({ groqTranscribe: async () => ({ status: 401, text: '' }) }))).fix).toMatch(/wrong or revoked/)
    let calls = 0
    const limited = await checkGroqRoundtrip(
      deps({ groqTranscribe: async () => (calls++, { status: 429, text: '' }) }),
    )
    expect(calls).toBe(2)
    expect(limited).toMatchObject({ pass: false })
    expect(limited.detail).toMatch(/429/)
    const offline = await checkGroqRoundtrip(
      deps({ groqTranscribe: async () => { throw new Error('getaddrinfo ENOTFOUND') } }),
    )
    expect(offline.fix).toMatch(/internet/)
  })

  it('a single 429 then success passes (one patient retry)', async () => {
    let calls = 0
    const c = await checkGroqRoundtrip(
      deps({ groqTranscribe: async () => (calls++ === 0 ? { status: 429, text: '' } : { status: 200, text: SAMPLE_TEXT }) }),
    )
    expect(c.pass).toBe(true)
  })

  it('Groq hearing something else FAILs', async () => {
    const c = await checkGroqRoundtrip(deps({ groqTranscribe: async () => ({ status: 200, text: 'Thank you.' }) }))
    expect(c.pass).toBe(false)
  })

  it('Apple: missing helper, no Speech permission and a timeout each FAIL with their own fix', async () => {
    expect((await checkApple(deps({ apple: { path: '/p', exists: () => false, probe: async () => ({}) } }))).fix).toMatch(/build\.sh/)
    expect((await checkApple(deps({ apple: { path: '/p', exists: () => true, probe: async () => ({ error: 'speech_auth' }) } }))).fix).toMatch(/Speech Recognition/)
    expect((await checkApple(deps({ apple: { path: '/p', exists: () => true, probe: async () => ({ error: 'timeout' }) } }))).pass).toBe(false)
  })

  it('aligner: the sample stays in paragraph 1, reading on steps to paragraph 2', () => {
    const c = checkAligner(SAMPLE_TEXT)
    expect(c.pass).toBe(true)
    expect(c.detail).toContain('/p2')
  })

  it('aligner falls back to the sample text when Groq gave none', () => {
    expect(checkAligner(undefined).detail).toContain('the sample text')
  })
})
