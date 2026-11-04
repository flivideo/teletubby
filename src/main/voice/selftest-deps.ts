import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SelftestDeps } from '../../core/voice-selftest.js'
import { groqTranscribe } from './groq-live.js'
import { loadGroqKey } from './secrets.js'

/** Run the Apple helper on a WAV; first text or helper error, `timeout` after `ms`. */
export function probeAppleHelper(path: string, wavPath: string, ms = 12_000): Promise<{ text?: string; error?: string }> {
  return new Promise((resolve) => {
    let text: string | undefined
    let error: string | undefined
    let buf = ''
    const child = spawn(path, [wavPath], { stdio: ['ignore', 'pipe', 'ignore'] })
    const timer = setTimeout(() => {
      child.kill()
      resolve(text !== undefined ? { text } : { error: 'timeout' })
    }, ms)
    child.stdout.on('data', (d: Buffer) => {
      buf += d.toString()
      let nl: number
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl)
        buf = buf.slice(nl + 1)
        try {
          const j = JSON.parse(line) as { text?: string; error?: string }
          if (j.error) error = j.error
          else if (typeof j.text === 'string') text = j.text
        } catch {
          /* partial line */
        }
      }
    })
    child.on('error', (e) => {
      error = e.message
    })
    child.on('close', () => {
      clearTimeout(timer)
      resolve(error && !text ? { error } : { text: text ?? '' })
    })
  })
}

/** The real dependencies, given the app root (where resources/ and native/ live). */
export function realSelftestDeps(root: string, where: 'app' | 'standalone', micStatus: () => string | null): SelftestDeps {
  const wavPath = join(root, 'resources', 'voice-selftest', 'sample.wav')
  const helper = join(root, 'native', 'apple-stt', 'apple-stt')
  return {
    where,
    groqKey: () => loadGroqKey(),
    micStatus,
    sampleWav: new Uint8Array(readFileSync(wavPath)),
    groqTranscribe: (key, wav) => groqTranscribe(key, wav),
    apple: {
      path: helper,
      exists: () => process.platform === 'darwin' && existsSync(helper),
      probe: () => probeAppleHelper(helper, wavPath),
    },
  }
}
