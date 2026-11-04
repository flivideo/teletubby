/**
 * One interface for "audio in, words out", so Apple (on-device) and Groq (cloud) can be swapped
 * or stacked (primary + fallback) behind the aligner. Pure types — implementations live outside
 * core (a native helper for Apple, an HTTP client for Groq).
 *
 * A recogniser emits events as it hears. `text` is what it currently believes was said in the
 * audio since `windowStartMs`; it may revise its tail between events. `atMs` is when that text
 * became AVAILABLE on the audio clock (audio position of the request + the recogniser's own
 * delay), which is what latency is measured from.
 */
export interface RecognizerEvent {
  atMs: number
  windowStartMs: number
  text: string
}

export interface Recognizer {
  readonly name: string
  /** Real-time simulation over a mono 16 kHz WAV: events in arrival order. */
  run(wavPath: string): Promise<RecognizerEvent[]>
}

/**
 * Live (streaming) shape used by the app. Audio is mono 16 kHz signed 16-bit PCM pushed as it is
 * captured; `onEvent` fires with the recogniser's current text. `reset()` forgets all audio so far
 * (a manual re-anchor: only speech after it is relevant). Implementations never throw from `push`.
 */
export interface LiveRecognizer {
  readonly name: string
  start(onEvent: (e: RecognizerEvent) => void, onFail: (reason: string) => void): void
  push(pcm: Uint8Array): void
  reset(): void
  stop(): void
  /** Optional vocabulary hint (nearest upcoming script words). Engines without one ignore it. */
  hint?(words: string[]): void
}
