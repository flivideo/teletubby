import { spawn, execFileSync, type ChildProcess } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync, mkdtempSync, openSync, rmSync, constants } from 'node:fs'
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

export type HelperLine = { kind: 'partial'; text: string; atMs: number } | { kind: 'error'; message: string } | { kind: 'info' }

/** One JSON line from the helper → a partial transcript, a human-readable error, or ignorable info. */
export function parseHelperLine(line: string): HelperLine | null {
  let j: { text?: string; atMs?: number; error?: string; status?: number }
  try {
    j = JSON.parse(line)
  } catch {
    return null
  }
  if (j.error === 'speech_auth') return { kind: 'error', message: mapSpeechAuth(typeof j.status === 'number' ? j.status : 0).reason }
  if (j.error === 'unavailable') return { kind: 'error', message: 'Apple speech recognition is unavailable (en-US model not ready on this Mac).' }
  if (j.error) return { kind: 'error', message: j.error }
  if (j.text !== undefined) return { kind: 'partial', text: j.text, atMs: j.atMs ?? 0 }
  return { kind: 'info' }
}

/** Arguments for `open`: -W waits for exit, -n new instance each time (reset = relaunch). */
export function buildOpenArgs(bundle: string, helperArgs: string[]): string[] {
  return ['-W', '-n', '-a', bundle, '--args', ...helperArgs]
}

export function bundleAvailable(bundle: string): boolean {
  return process.platform === 'darwin' && existsSync(join(bundle, 'Contents', 'MacOS', 'apple-stt'))
}

export interface AppleHelper {
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
  opts: { wav?: string },
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
  const helperArgs = ['--out', out, ...(opts.wav ? ['--wav', opts.wav] : ['--in', inn])]
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
