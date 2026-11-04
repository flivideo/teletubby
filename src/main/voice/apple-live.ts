import type { LiveRecognizer, RecognizerEvent } from '../../core/recognizer.js'
import { bundleAvailable, launchAppleHelper, type AppleHelper } from './apple-bundle.js'

/** Apple on-device streaming recogniser: TeletubbySpeech.app, fed through a FIFO. Reset = relaunch. */
export class AppleLive implements LiveRecognizer {
  readonly name = 'apple'
  private helper: AppleHelper | null = null
  private origin = 0
  private clockMs = 0
  private onEvent: (e: RecognizerEvent) => void = () => {}
  private onFail: (r: string) => void = () => {}
  private stopped = false

  /** `bundlePath` = native/apple-stt/build/TeletubbySpeech.app */
  constructor(private readonly bundlePath: string) {}

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
    const h: AppleHelper = launchAppleHelper(
      this.bundlePath,
      {},
      (l) => {
        if (h !== this.helper) return
        if (l.kind === 'error') this.fail(l.message)
        else if (l.kind === 'partial') this.onEvent({ atMs: this.clockMs, windowStartMs: this.origin, text: l.text })
      },
      (err) => {
        if (err && h === this.helper) this.fail(err.message)
      },
    )
    this.helper = h
  }

  private fail(reason: string): void {
    if (!this.stopped) this.onFail(`apple: ${reason}`)
  }

  push(pcm: Uint8Array): void {
    this.clockMs += pcm.length / 32
    this.helper?.write(pcm)
  }

  reset(): void {
    const old = this.helper
    this.helper = null
    old?.kill()
    this.launch()
  }

  stop(): void {
    this.stopped = true
    const old = this.helper
    this.helper = null
    old?.kill()
  }
}
