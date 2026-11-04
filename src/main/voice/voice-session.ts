import type { LiveRecognizer, RecognizerEvent } from '../../core/recognizer.js'
import { silentVoiceLog, type VoiceEngine, type VoiceEvent, type VoiceLog } from '../../shared/voice.js'

export interface VoiceSessionOptions {
  /** Engines in preference order; the first that starts is primary, the rest are fallbacks. */
  engines: Array<() => LiveRecognizer | null>
  emit: (e: VoiceEvent) => void
  /** One line per decision (engine chosen / skipped / failed / none left). Never sees a key. */
  log?: VoiceLog
}

/**
 * One listening session: PCM in, text events out. Runs the primary recogniser; if it reports
 * failure, swaps to the next engine (same audio stream, fresh window) and says so.
 */
export class VoiceSession {
  private active: LiveRecognizer | null = null
  private index = -1
  private running = false
  /** Latest vocabulary hint; handed to every engine as it is chosen (a fallback starts primed). */
  private hintWords: string[] = []

  private readonly log: VoiceLog

  constructor(private readonly opts: VoiceSessionOptions) {
    this.log = opts.log ?? silentVoiceLog
  }

  get engine(): VoiceEngine | null {
    return (this.active?.name as VoiceEngine | undefined) ?? null
  }

  start(): void {
    if (this.running) {
      this.log('session.start.ignored', { reason: 'already running', engine: this.engine })
      return
    }
    this.log('session.start')
    this.running = true
    this.index = -1
    this.next('starting')
  }

  private next(why: string): void {
    const from = this.active?.name ?? null
    this.active?.stop()
    this.active = null
    while (++this.index < this.opts.engines.length) {
      let r: LiveRecognizer | null
      try {
        r = this.opts.engines[this.index]!()
      } catch (error) {
        this.log('recogniser.error', { index: this.index, phase: 'create', error: String(error) })
        r = null
      }
      if (!r) {
        this.log('recogniser.skipped', { index: this.index, reason: 'unavailable' })
        continue
      }
      this.active = r
      // Every engine switch is one line with its reason: `from` is null on the first pick.
      this.log('recogniser.chosen', { engine: r.name, index: this.index, why, from })
      if (this.hintWords.length) r.hint?.(this.hintWords)
      r.start(
        (e: RecognizerEvent) => {
          if (this.active === r) this.opts.emit({ type: 'text', engine: r.name as VoiceEngine, text: e.text, atMs: e.atMs })
        },
        (reason) => {
          if (this.active !== r || !this.running) return
          this.log('recogniser.failed', { engine: r.name, reason })
          this.opts.emit({ type: 'status', state: 'fallback', engine: r.name as VoiceEngine, error: reason })
          this.next(reason)
        },
      )
      this.opts.emit({ type: 'status', state: 'listening', engine: r.name as VoiceEngine })
      return
    }
    this.running = false
    this.log('recogniser.none', { why })
    this.opts.emit({ type: 'status', state: 'error', engine: null, error: `no recogniser available (${why})` })
  }

  push(pcm: Uint8Array): void {
    if (this.running) this.active?.push(pcm)
  }

  hints(words: string[]): void {
    this.hintWords = words
    this.active?.hint?.(words)
  }

  reset(): void {
    this.log('session.reset', { engine: this.engine })
    this.active?.reset()
  }

  stop(): void {
    if (!this.running && !this.active) return
    this.log('session.stop', { engine: this.engine })
    this.running = false
    this.active?.stop()
    this.active = null
    this.opts.emit({ type: 'status', state: 'off', engine: null })
  }
}
