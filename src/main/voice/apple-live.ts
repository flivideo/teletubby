import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { LiveRecognizer, RecognizerEvent } from '../../core/recognizer.js'

/** Apple on-device streaming recogniser: the native helper in `--stdin` mode. Reset = respawn. */
export class AppleLive implements LiveRecognizer {
  readonly name = 'apple'
  private child: ChildProcess | null = null
  private origin = 0
  private clockMs = 0
  private onEvent: (e: RecognizerEvent) => void = () => {}
  private onFail: (r: string) => void = () => {}
  private stopped = false

  constructor(private readonly helperPath: string) {}

  static available(helperPath: string): boolean {
    return process.platform === 'darwin' && existsSync(helperPath)
  }

  start(onEvent: (e: RecognizerEvent) => void, onFail: (r: string) => void): void {
    this.onEvent = onEvent
    this.onFail = onFail
    this.spawnHelper()
  }

  private spawnHelper(): void {
    const child = spawn(this.helperPath, ['--stdin'], { stdio: ['pipe', 'pipe', 'ignore'] })
    this.child = child
    this.origin = this.clockMs
    let buf = ''
    child.stdout!.on('data', (d: Buffer) => {
      buf += d.toString()
      let nl: number
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl)
        buf = buf.slice(nl + 1)
        try {
          const j = JSON.parse(line) as { text?: string; error?: string }
          if (j.error) this.fail(j.error)
          else if (j.text !== undefined && child === this.child)
            this.onEvent({ atMs: this.clockMs, windowStartMs: this.origin, text: j.text })
        } catch {
          /* ignore a partial line */
        }
      }
    })
    child.stdin!.on('error', () => {})
    child.on('error', (e) => this.fail(e.message))
  }

  private fail(reason: string): void {
    if (!this.stopped) this.onFail(`apple: ${reason}`)
  }

  push(pcm: Uint8Array): void {
    this.clockMs += pcm.length / 32
    try {
      this.child?.stdin?.write(pcm)
    } catch {
      /* helper gone: reported through its own error/exit */
    }
  }

  reset(): void {
    this.killChild()
    this.spawnHelper()
  }

  stop(): void {
    this.stopped = true
    this.killChild()
  }

  private killChild(): void {
    const c = this.child
    this.child = null
    try {
      c?.stdin?.end()
      c?.kill()
    } catch {
      /* already gone */
    }
  }
}
