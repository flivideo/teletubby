import type { LiveRecognizer, RecognizerEvent } from '../../core/recognizer.js'
import { silentVoiceLog, type VoiceLog } from '../../shared/voice.js'
import { bundleAvailable, launchAppleHelper, type AppleHelper } from './apple-bundle.js'
import { createPartialFilter, type PartialFilter } from './apple-partials.js'

/**
 * Apple on-device streaming recogniser: TeletubbySpeech.app, fed through a FIFO, launched ONCE per
 * session. The helper swaps its own recognition task every ~50 s and retries its own errors; a
 * re-anchor is a trim + a 300 ms ignore here (apple-partials.ts), never a relaunch.
 */
export class AppleLive implements LiveRecognizer {
  readonly name = 'apple'
  private helper: AppleHelper | null = null
  private origin = 0
  private clockMs = 0
  private filter: PartialFilter = createPartialFilter()
  private hintWords: string[] = []
  private onEvent: (e: RecognizerEvent) => void = () => {}
  private onFail: (r: string) => void = () => {}
  private stopped = false

  /** `bundlePath` = native/apple-stt/build/TeletubbySpeech.app. `now` is injectable for tests. */
  constructor(
    private readonly bundlePath: string,
    private readonly log: VoiceLog = silentVoiceLog,
    private readonly now: () => number = Date.now,
  ) {}

  static available(bundlePath: string): boolean {
    return bundleAvailable(bundlePath)
  }

  start(onEvent: (e: RecognizerEvent) => void, onFail: (r: string) => void): void {
    this.onEvent = onEvent
    this.onFail = onFail
    this.launch()
  }

  private launch(): void {
    this.origin = this.clockMs
    this.filter = createPartialFilter()
    this.log('apple.launch', { bundle: this.bundlePath, hints: this.hintWords.length })
    const h: AppleHelper = launchAppleHelper(
      this.bundlePath,
      { hints: this.hintWords },
      (l) => {
        if (h !== this.helper) return
        if (l.kind === 'error') this.fail(l.message)
        else if (l.kind === 'retry') this.log('apple.retry', { ...l })
        else if (l.kind === 'task') {
          if (this.filter.task(l.task)) this.origin = this.clockMs
          this.log('apple.task', { task: l.task, reason: l.reason, hints: l.hints })
        } else if (l.kind === 'partial') this.partial(l.task, l.text)
      },
      (err) => {
        this.log('apple.exit', { error: err?.message ?? null, current: h === this.helper })
        if (h !== this.helper || this.stopped) return
        // The helper ends only on stop or a fatal line; an exit without either is a failure too.
        this.fail(err?.message ?? 'helper exited')
      },
    )
    this.helper = h
  }

  /** One helper partial through the trim / ignore / stale filter (public for tests). */
  partial(task: number, text: string): void {
    const v = this.filter.partial(task, text, this.now())
    if (v.kind === 'drop') {
      this.log('apple.partial.dropped', { task, reason: v.reason })
      return
    }
    if (v.swapped) this.origin = this.clockMs
    this.onEvent({ atMs: this.clockMs, windowStartMs: this.origin, text: v.text })
  }

  private fail(reason: string): void {
    this.log('apple.error', { reason })
    if (!this.stopped) this.onFail(`apple: ${reason}`)
  }

  push(pcm: Uint8Array): void {
    this.clockMs += pcm.length / 32
    this.helper?.write(pcm)
  }

  hint(words: string[]): void {
    this.hintWords = words
    this.helper?.setHints(words)
  }

  reset(): void {
    this.filter.reset(this.now())
    this.origin = this.clockMs
    this.log('apple.reset', { task: this.filter.state.task, prefixChars: this.filter.state.prefix.length })
  }

  stop(): void {
    this.stopped = true
    const old = this.helper
    this.helper = null
    old?.kill()
  }
}
