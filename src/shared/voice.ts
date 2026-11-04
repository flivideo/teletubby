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
