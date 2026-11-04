import { spawn, execFileSync, type ChildProcess } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync, mkdtempSync, openSync, renameSync, rmSync, writeFileSync, constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Readable, Writable } from 'node:stream'

/**
 * The Apple speech helper lives in TeletubbySpeech.app so macOS treats it as its OWN responsible process
 * (a bare binary under node/iTerm2 inherits iTerm2, which cannot show the Speech prompt). LaunchServices owns the
 * helper's stdio, so audio goes in and JSON lines come out through two FIFOs.
 */

export const SPEECH_SETTINGS_HINT = 'System Settings → Privacy & Security → Speech Recognition → allow "Teletubby Speech"'

/** SFSpeechRecognizerAuthorizationStatus: 0 notDetermined, 1 denied, 2 restricted, 3 authorized. */
export function mapSpeechAuth(status: number): { ok: boolean; reason: string } {
  switch (status) {
    case 3:
      return { ok: true, reason: 'authorized' }
    case 1:
      return { ok: false, reason: `Speech Recognition permission was denied. Fix: ${SPEECH_SETTINGS_HINT}, then retry.` }
    case 2:
      return { ok: false, reason: 'Speech Recognition is restricted on this Mac (Screen Time / device management); it cannot be enabled here.' }
    case 0:
      return { ok: false, reason: `Speech Recognition permission was not granted (no answer to the prompt). Retry and click Allow, or: ${SPEECH_SETTINGS_HINT}.` }
    default:
      return { ok: false, reason: `Speech Recognition returned an unknown status (${status}).` }
  }
}

export type HelperLine =
  /** `task` numbers the recognition task (swapped every ~50 s); a helper without it is task 0. */
  | { kind: 'partial'; text: string; atMs: number; task: number }
  /** A recognition task started; `startMs` is its first sample on the helper's audio clock. */
  | { kind: 'task'; task: number; startMs: number; hints: number; reason: string }
  /** The helper is restarting a task after an error — NOT a failure; it handles it itself. */
  | { kind: 'retry'; message: string; task: number; attempt: number; delayMs: number; expected: boolean }
  /** Only these mean the engine is gone (→ fallback): permission, availability, retries exhausted. */
  | { kind: 'error'; message: string }
  | { kind: 'info' }

/**
 * One JSON line from the helper → a partial, a task start, a self-handled retry, a human-readable
 * fatal error, or ignorable info.
 */
export function parseHelperLine(line: string): HelperLine | null {
  let j: {
    text?: string
    atMs?: number
    error?: string
    status?: number
    task?: number
    started?: boolean
    startMs?: number
    hints?: number
    reason?: string
    retry?: string
    attempt?: number
    delayMs?: number
    expected?: boolean
    fatal?: boolean
    attempts?: number
  }
  try {
    j = JSON.parse(line)
  } catch {
    return null
  }
  if (j.error === 'speech_auth') return { kind: 'error', message: mapSpeechAuth(typeof j.status === 'number' ? j.status : 0).reason }
  if (j.error === 'unavailable') return { kind: 'error', message: 'Apple speech recognition is unavailable (en-US model not ready on this Mac).' }
  if (j.error && j.fatal) return { kind: 'error', message: `recognition kept failing after ${j.attempts ?? '?'} retries (last: ${j.error})` }
  if (j.error) return { kind: 'error', message: j.error }
  if (typeof j.retry === 'string')
    return {
      kind: 'retry',
      message: j.retry,
      task: j.task ?? 0,
      attempt: j.attempt ?? 0,
      delayMs: j.delayMs ?? 0,
      expected: j.expected === true,
    }
  if (j.started && typeof j.task === 'number')
    return { kind: 'task', task: j.task, startMs: j.startMs ?? 0, hints: j.hints ?? 0, reason: j.reason ?? '' }
  if (j.text !== undefined) return { kind: 'partial', text: j.text, atMs: j.atMs ?? 0, task: j.task ?? 0 }
  return { kind: 'info' }
}

/** Arguments for `open`: -W waits for exit, -n a new instance per session (never per reset any more). */
export function buildOpenArgs(bundle: string, helperArgs: string[]): string[] {
  return ['-W', '-n', '-a', bundle, '--args', ...helperArgs]
}

export function bundleAvailable(bundle: string): boolean {
  return process.platform === 'darwin' && existsSync(join(bundle, 'Contents', 'MacOS', 'apple-stt'))
}

/** Name of the vocabulary-hint file in the helper's temp dir; the helper re-reads it at each task start. */
export const HINTS_FILE = 'hints.json'

export interface AppleHelper {
  /** Replace the vocabulary hint (JSON array of words); read by the helper at its next task start. */
  setHints(words: string[]): void
  /** write raw mono 16k s16le PCM (live mode only) */
  write(pcm: Uint8Array): void
  /** end audio and let the app finish */
  stop(): void
  /** tear down now (reset) */
  kill(): void
}

/**
 * Launch the bundle. `wav` = bench mode (helper feeds the file at real time); otherwise live (use `write`).
 * onLine gets parsed lines; onExit fires once when the app exits.
 */
export function launchAppleHelper(
  bundle: string,
  opts: { wav?: string; hints?: string[] },
  onLine: (l: HelperLine) => void,
  onExit: (err?: Error) => void,
): AppleHelper {
  const dir = mkdtempSync(join(tmpdir(), 'teletubby-speech-'))
  const out = join(dir, 'out')
  const inn = join(dir, 'in')
  execFileSync('mkfifo', opts.wav ? [out] : [out, inn])
  // O_RDWR on our ends so opening never blocks waiting for the app to show up.
  const outFd = openSync(out, constants.O_RDWR)
  const inFd = opts.wav ? -1 : openSync(inn, constants.O_RDWR)
  const reader: Readable = createReadStream(out, { fd: outFd, autoClose: true })
  const writer: Writable | null = opts.wav ? null : createWriteStream(inn, { fd: inFd, autoClose: true })
  writer?.on('error', () => {})
  const hints = join(dir, HINTS_FILE)
  const writeHints = (words: string[]): void => {
    try {
      // Write-then-rename so the helper never reads half a file.
      writeFileSync(`${hints}.tmp`, JSON.stringify(words))
      renameSync(`${hints}.tmp`, hints)
    } catch {
      /* the dir is gone (helper exited); a hint is never worth an error */
    }
  }
  writeHints(opts.hints ?? [])
  const helperArgs = ['--out', out, '--hints', hints, ...(opts.wav ? ['--wav', opts.wav] : ['--in', inn])]
  const child: ChildProcess = spawn('open', buildOpenArgs(bundle, helperArgs), { stdio: 'ignore' })
  let buf = ''
  reader.on('data', (d: Buffer) => {
    buf += d.toString()
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const l = parseHelperLine(buf.slice(0, nl))
      buf = buf.slice(nl + 1)
      if (l) onLine(l)
    }
  })
  let done = false
  const finish = (err?: Error): void => {
    if (done) return
    done = true
    // let the last lines drain, then clean up
    setTimeout(() => {
      reader.destroy()
      writer?.destroy()
      rmSync(dir, { recursive: true, force: true })
      onExit(err)
    }, 150)
  }
  child.on('error', finish)
  child.on('exit', () => finish())
  const killNow = (): void => {
    try {
      execFileSync('pkill', ['-f', out])
    } catch {
      /* already gone */
    }
  }
  return {
    setHints: (words) => {
      if (!done) writeHints(words)
    },
    kill: () => {
      writer?.destroy()
      killNow()
    },
    write: (pcm) => {
      if (!done) writer?.write(pcm)
    },
    stop: () => {
      writer?.end()
      if (!done) {
        // the app exits on its own after endAudio; make sure it does
        setTimeout(killNow, 6000).unref()
      }
    },
  }
}
