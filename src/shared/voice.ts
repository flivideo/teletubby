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

export type VoiceControl = { action: 'start' } | { action: 'stop' } | { action: 'reset' }

/**
 * One voice-path log line: an event name plus small, key-free detail. Main writes it to
 * `.logs/app.log`; the renderer sends its half through `logVoice` so the whole path is in ONE file.
 */
export type VoiceLog = (event: string, detail?: Record<string, unknown>) => void

/** A logger that drops everything — the default when a caller supplies none (tests, the bench). */
export const silentVoiceLog: VoiceLog = () => {}
