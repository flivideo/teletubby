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
  it('partial transcript (no task id = task 0)', () => expect(parseHelperLine('{"atMs":120,"text":"hello","final":false}')).toEqual({ kind: 'partial', text: 'hello', atMs: 120, task: 0 }))
  it('partial carries its task id', () => expect(parseHelperLine('{"task":3,"atMs":5,"text":"hi","final":false}')).toMatchObject({ kind: 'partial', task: 3 }))
  it('task start line', () =>
    expect(parseHelperLine('{"task":2,"started":true,"startMs":50000,"hints":12,"reason":"swap"}')).toEqual({ kind: 'task', task: 2, startMs: 50000, hints: 12, reason: 'swap' }))
  it('a retry is NOT an error (the helper handles it; no fallback)', () => {
    expect(parseHelperLine('{"retry":"No speech detected","task":4,"attempt":0,"delayMs":0,"expected":true}')).toEqual({
      kind: 'retry', message: 'No speech detected', task: 4, attempt: 0, delayMs: 0, expected: true,
    })
    expect(parseHelperLine('{"retry":"boom","task":4,"attempt":3,"delayMs":1500,"expected":false}')).toMatchObject({ kind: 'retry', attempt: 3, delayMs: 1500, expected: false })
  })
  it('retries exhausted → fatal error (fallback)', () => {
    const l = parseHelperLine('{"error":"boom","fatal":true,"attempts":10}')
    expect(l).toMatchObject({ kind: 'error' })
    expect((l as { message: string }).message).toContain('10 retries')
    expect((l as { message: string }).message).toContain('boom')
  })
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
