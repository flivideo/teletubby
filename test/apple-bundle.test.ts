import { describe, expect, it } from 'vitest'
import { buildOpenArgs, mapSpeechAuth, parseHelperLine, SPEECH_SETTINGS_HINT } from '../src/main/voice/apple-bundle.js'

describe('mapSpeechAuth (native status → message)', () => {
  it('authorized is ok', () => expect(mapSpeechAuth(3)).toEqual({ ok: true, reason: 'authorized' }))
  it('denied points at System Settings', () => {
    const r = mapSpeechAuth(1)
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('denied')
    expect(r.reason).toContain(SPEECH_SETTINGS_HINT)
  })
  it('not determined says no answer + how to retry', () => {
    const r = mapSpeechAuth(0)
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('not granted')
    expect(r.reason).toContain('Allow')
  })
  it('restricted is not fixable here', () => {
    const r = mapSpeechAuth(2)
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('restricted')
  })
  it('unknown status is reported, not ok', () => expect(mapSpeechAuth(9).ok).toBe(false))
})

describe('parseHelperLine (stubbed native output)', () => {
  it('partial transcript', () => expect(parseHelperLine('{"atMs":120,"text":"hello","final":false}')).toEqual({ kind: 'partial', text: 'hello', atMs: 120 }))
  it('speech_auth denied → readable error', () => {
    const l = parseHelperLine('{"error":"speech_auth","status":1,"reason":"denied"}')
    expect(l).toMatchObject({ kind: 'error' })
    expect((l as { message: string }).message).toContain('Speech Recognition')
  })
  it('speech_auth not determined', () => {
    const l = parseHelperLine('{"error":"speech_auth","status":0}')
    expect((l as { message: string }).message).toContain('not granted')
  })
  it('unavailable and free-text errors', () => {
    expect(parseHelperLine('{"error":"unavailable"}')).toMatchObject({ kind: 'error' })
    expect(parseHelperLine('{"error":"boom"}')).toEqual({ kind: 'error', message: 'boom' })
  })
  it('info line and garbage', () => {
    expect(parseHelperLine('{"onDevice":true}')).toEqual({ kind: 'info' })
    expect(parseHelperLine('not json')).toBeNull()
  })
})

describe('buildOpenArgs', () => {
  it('waits, new instance, passes args after --args', () =>
    expect(buildOpenArgs('/x/T.app', ['--out', '/o', '--wav', '/w.wav'])).toEqual(['-W', '-n', '-a', '/x/T.app', '--args', '--out', '/o', '--wav', '/w.wav']))
})
