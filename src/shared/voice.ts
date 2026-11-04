/** Voice-follow IPC shapes, shared by renderer, preload and main. */
export type VoiceEngine = 'groq' | 'apple'

export type VoiceEvent =
  | { type: 'text'; engine: VoiceEngine; text: string; atMs: number }
  | {
      type: 'status'
      state: 'listening' | 'fallback' | 'error' | 'off'
      engine: VoiceEngine | null
      error?: string
    }

export type VoiceControl =
  | { action: 'start' }
  | { action: 'stop' }
  | { action: 'reset' }
  /** Recogniser vocabulary hint: the nearest upcoming script words (Apple contextual strings). */
  | { action: 'hints'; words: string[] }

/** Cap on hint words and on each word's length — main enforces both, whatever the renderer sends. */
export const MAX_HINT_WORDS = 50
export const MAX_HINT_CHARS = 48

/** Keep only plausible hint words: strings, trimmed, non-empty, short, at most MAX_HINT_WORDS. */
export function cleanHints(words: unknown): string[] {
  if (!Array.isArray(words)) return []
  const out: string[] = []
  for (const w of words) {
    if (typeof w !== 'string') continue
    const t = w.trim()
    if (t && t.length <= MAX_HINT_CHARS) out.push(t)
    if (out.length >= MAX_HINT_WORDS) break
  }
  return out
}

/**
 * One voice-path log line: an event name plus small, key-free detail. Main writes it to
 * `.logs/app.log`; the renderer sends its half through `logVoice` so the whole path is in ONE file.
 */
export type VoiceLog = (event: string, detail?: Record<string, unknown>) => void

/** A logger that drops everything — the default when a caller supplies none (tests, the bench). */
export const silentVoiceLog: VoiceLog = () => {}
