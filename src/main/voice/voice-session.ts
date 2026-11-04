import type { LiveRecognizer, RecognizerEvent } from '../../core/recognizer.js'
import type { VoiceEngine, VoiceEvent } from '../../shared/voice.js'

export interface VoiceSessionOptions {
  /** Engines in preference order; the first that starts is primary, the rest are fallbacks. */
  engines: Array<() => LiveRecognizer | null>
  emit: (e: VoiceEvent) => void
}

/**
 * One listening session: PCM in, text events out. Runs the primary recogniser; if it reports
 * failure, swaps to the next engine (same audio stream, fresh window) and says so.
 */
export class VoiceSession {
  private active: LiveRecognizer | null = null
  private index = -1
  private running = false

  constructor(private readonly opts: VoiceSessionOptions) {}

  get engine(): VoiceEngine | null {
    return (this.active?.name as VoiceEngine | undefined) ?? null
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.index = -1
    this.next('starting')
  }

  private next(why: string): void {
    this.active?.stop()
    this.active = null
    while (++this.index < this.opts.engines.length) {
      const r = this.opts.engines[this.index]!()
      if (!r) continue
      this.active = r
      r.start(
        (e: RecognizerEvent) => {
          if (this.active === r) this.opts.emit({ type: 'text', engine: r.name as VoiceEngine, text: e.text, atMs: e.atMs })
        },
        (reason) => {
          if (this.active !== r || !this.running) return
          this.opts.emit({ type: 'status', state: 'fallback', engine: r.name as VoiceEngine, error: reason })
          this.next(reason)
        },
      )
      this.opts.emit({ type: 'status', state: 'listening', engine: r.name as VoiceEngine })
      return
    }
    this.running = false
    this.opts.emit({ type: 'status', state: 'error', engine: null, error: `no recogniser available (${why})` })
  }

  push(pcm: Uint8Array): void {
    if (this.running) this.active?.push(pcm)
  }

  reset(): void {
    this.active?.reset()
  }

  stop(): void {
    if (!this.running && !this.active) return
    this.running = false
    this.active?.stop()
    this.active = null
    this.opts.emit({ type: 'status', state: 'off', engine: null })
  }
}
