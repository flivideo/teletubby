import { cleanHints, type VoiceControl, type VoiceLog } from '../../shared/voice.js'

/** The OS microphone gate, injectable so the error paths are testable without Electron. */
export interface MicGate {
  status(): string
  ask(): Promise<boolean>
}

export interface VoiceControlDeps {
  session: { start(): void; stop(): void; reset(): void; hints?(words: string[]): void }
  /** null off macOS: there is no TCC gate to ask. */
  mic: MicGate | null
  log: VoiceLog
}

export type VoiceControlResult = { ok: boolean; error?: string }

/** Plain-English fix for a mic that is not granted, shown on the chip and in the self-test. */
export const MIC_FIX =
  'System Settings → Privacy & Security → Microphone → turn on the app that launched Teletubby (iTerm or Teletubby), then press V again'

/**
 * The main half of the Voice chip / V key. Every step is one log line, so "nothing happens"
 * always leaves a trail in `.logs/app.log`: the command, the mic status BEFORE asking, the ask
 * result, and the session start/stop (logged by the session itself).
 */
export function createVoiceControl(deps: VoiceControlDeps): (command: VoiceControl) => Promise<VoiceControlResult> {
  const { session, mic, log } = deps
  return async (command) => {
    log('control.received', {
      action: command?.action ?? null,
      ...(command?.action === 'hints' ? { words: Array.isArray(command.words) ? command.words.length : null } : {}),
    })
    try {
      if (command.action === 'start') {
        if (mic) {
          const before = mic.status()
          log('mic.status', { status: before })
          if (before === 'denied' || before === 'restricted') {
            log('mic.blocked', { status: before })
            return { ok: false, error: `microphone ${before} — ${MIC_FIX}` }
          }
          const granted = await mic.ask()
          log('mic.ask', { granted, statusAfter: mic.status() })
          if (!granted) return { ok: false, error: `microphone permission denied — ${MIC_FIX}` }
        }
        session.start()
      } else if (command.action === 'reset') session.reset()
      else if (command.action === 'hints') session.hints?.(cleanHints(command.words))
      else if (command.action === 'stop') session.stop()
      else {
        log('control.unknown', { command })
        return { ok: false, error: 'unknown voice command' }
      }
      return { ok: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log('control.error', { action: command?.action ?? null, error: message })
      return { ok: false, error: message }
    }
  }
}
