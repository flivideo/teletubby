import type { LiveRecognizer, RecognizerEvent } from '../../core/recognizer.js'
import { silentVoiceLog, type VoiceLog } from '../../shared/voice.js'

const TICK_MS = 2000
const WINDOW_MS = 12000
const BYTES_PER_MS = 32 // 16 kHz * 2 bytes

export function wavOf(pcm: Uint8Array): Uint8Array {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0)
  h.writeUInt32LE(36 + pcm.length, 4)
  h.write('WAVEfmt ', 8)
  h.writeUInt32LE(16, 16)
  h.writeUInt16LE(1, 20)
  h.writeUInt16LE(1, 22)
  h.writeUInt32LE(16000, 24)
  h.writeUInt32LE(32000, 28)
  h.writeUInt16LE(2, 32)
  h.writeUInt16LE(16, 34)
  h.write('data', 36)
  h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

export interface GroqLiveOptions {
  key: string
  fetchImpl?: typeof fetch
  tickMs?: number
  /** Consecutive failures before the recogniser reports itself failed. */
  maxFailures?: number
  /** One line per request: status, ms, audio sent, text length. NEVER the key. */
  log?: VoiceLog
}

/** Rolling-window Groq recogniser: every tick, the last 12 s of audio since the last reset. */
export class GroqLive implements LiveRecognizer {
  readonly name = 'groq'
  private chunks: Buffer[] = []
  private bytes = 0
  private sentBytes = 0
  private windowStartMs = 0
  private clockMs = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private busy = false
  private failures = 0
  private generation = 0
  private onEvent: (e: RecognizerEvent) => void = () => {}
  private onFail: (r: string) => void = () => {}

  constructor(private readonly opts: GroqLiveOptions) {}

  start(onEvent: (e: RecognizerEvent) => void, onFail: (r: string) => void): void {
    this.onEvent = onEvent
    this.onFail = onFail
    this.timer = setInterval(() => void this.tick(), this.opts.tickMs ?? TICK_MS)
  }

  push(pcm: Uint8Array): void {
    this.chunks.push(Buffer.from(pcm))
    this.bytes += pcm.length
    this.clockMs += pcm.length / BYTES_PER_MS
    const keep = WINDOW_MS * BYTES_PER_MS
    while (this.bytes - (this.chunks[0]?.length ?? 0) >= keep && this.chunks.length > 1) {
      const dropped = this.chunks.shift()!
      this.bytes -= dropped.length
      this.sentBytes = Math.max(0, this.sentBytes - dropped.length)
      this.windowStartMs += dropped.length / BYTES_PER_MS
    }
  }

  reset(): void {
    this.generation++
    this.chunks = []
    this.bytes = 0
    this.sentBytes = 0
    this.windowStartMs = this.clockMs
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.generation++
  }

  private async tick(): Promise<void> {
    if (this.busy || this.bytes - this.sentBytes < 500 * BYTES_PER_MS) return
    this.busy = true
    const log = this.opts.log ?? silentVoiceLog
    const t0 = Date.now()
    const audioMs = Math.round(this.bytes / BYTES_PER_MS)
    const gen = this.generation
    const body = wavOf(Buffer.concat(this.chunks))
    const windowStartMs = this.windowStartMs
    this.sentBytes = this.bytes
    try {
      const fd = new FormData()
      fd.set('model', 'whisper-large-v3-turbo')
      fd.set('language', 'en')
      fd.set('response_format', 'json')
      fd.set('file', new Blob([body as BlobPart], { type: 'audio/wav' }), 'chunk.wav')
      const f = this.opts.fetchImpl ?? fetch
      const r = await f('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.opts.key}` },
        body: fd,
      })
      if (r.status === 429) {
        log('groq.request', { status: 429, ms: Date.now() - t0, audioMs, note: 'rate limited — next tick retries' })
        return // back off: next tick retries, not a failure
      }
      if (!r.ok) {
        let body = ''
        try {
          body = (await r.text()).slice(0, 200)
        } catch {
          /* no body */
        }
        throw Object.assign(new Error(`groq http ${r.status}`), { body })
      }
      const text = (((await r.json()) as { text?: string }).text ?? '').trim()
      log('groq.request', { status: r.status, ms: Date.now() - t0, audioMs, chars: text.length, tail: text.slice(-60), stale: gen !== this.generation })
      this.failures = 0
      if (gen === this.generation) this.onEvent({ atMs: this.clockMs, windowStartMs, text })
    } catch (error) {
      this.failures++
      log('groq.error', {
        ms: Date.now() - t0,
        audioMs,
        failures: this.failures,
        error: error instanceof Error ? error.message : String(error),
        body: (error as { body?: string }).body,
      })
      if (this.failures >= (this.opts.maxFailures ?? 3))
        this.onFail(error instanceof Error ? error.message : String(error))
    } finally {
      this.busy = false
    }
  }
}
