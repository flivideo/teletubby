/**
 * Voice self-test — one PASS/FAIL line per link of the voice-follow chain, each FAIL with a
 * plain-English fix. Pure: every outside thing (the key, the OS mic gate, Groq, the Apple helper)
 * arrives as a dependency, so the checks are unit-tested with stubs and the SAME runner is used by
 * the app's `voice_selftest` door (real mic status) and by `scripts/voice-selftest.sh` standalone.
 */
import { createVoiceDriver } from './voice-driver.js'

/** What the bundled 2 s sample says, word for word (resources/voice-selftest/sample.wav). */
export const SAMPLE_TEXT = 'The prompter follows my voice as I read.'

/** The rest of paragraph 1 after the sample — so the sample lands INSIDE p1, not at its end. */
const P1_REST = 'It keeps up with me, line by line, without a single key press.'

/** The 2-paragraph script the aligner is checked against: the sample opens paragraph 1. */
export const SELFTEST_SCRIPT = [
  { id: 'p1', text: `${SAMPLE_TEXT} ${P1_REST}` },
  { id: 'p2', text: 'When I keep reading, it steps on to the next paragraph by itself.' },
]

export type CheckName = 'groq-key' | 'mic-permission' | 'groq-roundtrip' | 'apple-helper' | 'aligner'

export interface SelftestCheck {
  name: CheckName
  /** null = not applicable / could not be determined here (shown as SKIP, never as PASS). */
  pass: boolean | null
  detail: string
  /** Plain-English next step, present on every FAIL. */
  fix?: string
}

export interface SelftestReport {
  ok: boolean
  /** Where the test ran: inside the app (real mic status) or standalone. */
  where: 'app' | 'standalone'
  checks: SelftestCheck[]
}

export interface SelftestDeps {
  where: 'app' | 'standalone'
  groqKey: () => string | null
  /** The OS microphone status, or null when it cannot be read from here (app not running). */
  micStatus: () => string | null
  /** The sample as a WAV file. */
  sampleWav: Uint8Array
  /** One Groq transcription of a WAV; never logs the key. */
  groqTranscribe: (key: string, wav: Uint8Array) => Promise<{ status: number; text: string; body?: string }>
  apple: {
    path: string
    exists: () => boolean
    /** Run the helper on the sample: text heard, or an error code from the helper. */
    probe: () => Promise<{ text?: string; error?: string }>
  }
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

const MIC_FIX =
  'Open System Settings → Privacy & Security → Microphone and turn on the app Teletubby was started from (iTerm, or Teletubby). Then quit and restart Teletubby.'

const words = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

/** Share of the expected words that were heard — a crude, honest "did it hear the sample". */
export function overlap(heard: string, expected: string): number {
  const h = new Set(words(heard))
  const e = words(expected)
  return e.length === 0 ? 0 : e.filter((w) => h.has(w)).length / e.length
}

export async function checkGroqKey(deps: SelftestDeps): Promise<SelftestCheck> {
  const key = deps.groqKey()
  return key
    ? { name: 'groq-key', pass: true, detail: `GROQ_API_KEY found (${key.length} chars; value never printed)` }
    : {
        name: 'groq-key',
        pass: false,
        detail: 'no GROQ_API_KEY in the environment, ~/.config/appydave/.env.secrets or ~/.secrets',
        fix: 'Add GROQ_API_KEY=<key> to ~/.config/appydave/.env.secrets, then restart Teletubby.',
      }
}

export async function checkMic(deps: SelftestDeps): Promise<SelftestCheck> {
  const status = deps.micStatus()
  if (status === null)
    return {
      name: 'mic-permission',
      pass: null,
      detail: "the microphone permission can only be read inside the running app, and this run is standalone",
      fix: 'Start (or restart) Teletubby with this version — npm run app — and run the self-test again to check the mic.',
    }
  if (status === 'granted') return { name: 'mic-permission', pass: true, detail: 'microphone: granted' }
  if (status === 'not-determined')
    return {
      name: 'mic-permission',
      pass: true,
      detail: 'microphone: not asked yet — macOS will ask the first time you press V',
    }
  return { name: 'mic-permission', pass: false, detail: `microphone: ${status}`, fix: MIC_FIX }
}

export async function checkGroqRoundtrip(deps: SelftestDeps): Promise<SelftestCheck & { text?: string }> {
  const key = deps.groqKey()
  if (!key) return { name: 'groq-roundtrip', pass: null, detail: 'skipped — no key' }
  const now = deps.now ?? Date.now
  const t0 = now()
  try {
    let r = await deps.groqTranscribe(key, deps.sampleWav)
    if (r.status === 429) {
      // One patient retry: a single 429 is the per-minute window, not a broken key.
      await (deps.sleep ?? ((ms: number) => new Promise((ok) => setTimeout(ok, ms))))(3000)
      r = await deps.groqTranscribe(key, deps.sampleWav)
    }
    const ms = now() - t0
    if (r.status === 401 || r.status === 403)
      return {
        name: 'groq-roundtrip',
        pass: false,
        detail: `Groq refused the key (http ${r.status}, ${ms} ms)`,
        fix: 'The GROQ_API_KEY is wrong or revoked — make a new one at console.groq.com and replace it.',
      }
    if (r.status === 429)
      return {
        name: 'groq-roundtrip',
        pass: false,
        detail: `Groq is rate-limiting this key (http 429 twice, ${ms} ms)`,
        fix: 'Too many requests on this key — is another Teletubby (or app) using voice right now? Turn it off, wait a minute, retry.',
      }
    if (r.status < 200 || r.status >= 300)
      return {
        name: 'groq-roundtrip',
        pass: false,
        detail: `Groq answered http ${r.status} (${ms} ms)${r.body ? `: ${r.body.slice(0, 120)}` : ''}`,
        fix: 'Groq is having trouble — check status.groq.com; voice falls back to Apple meanwhile.',
      }
    const score = overlap(r.text, SAMPLE_TEXT)
    const heard = `heard "${r.text}" in ${ms} ms`
    return score >= 0.6
      ? { name: 'groq-roundtrip', pass: true, detail: heard, text: r.text }
      : {
          name: 'groq-roundtrip',
          pass: false,
          detail: `${heard} — expected "${SAMPLE_TEXT}"`,
          fix: 'Groq answered but did not hear the sample — re-run; if it repeats, the sample file is damaged.',
          text: r.text,
        }
  } catch (error) {
    return {
      name: 'groq-roundtrip',
      pass: false,
      detail: `could not reach Groq: ${error instanceof Error ? error.message : String(error)}`,
      fix: 'No connection to api.groq.com — check the internet connection.',
    }
  }
}

export async function checkApple(deps: SelftestDeps): Promise<SelftestCheck> {
  if (!deps.apple.exists())
    return {
      name: 'apple-helper',
      pass: false,
      detail: `Apple helper missing at ${deps.apple.path} — there is no fallback if Groq fails`,
      fix: 'Build it: bash native/apple-stt/build.sh (in the teletubby folder).',
    }
  const r = await deps.apple.probe()
  if (r.error === 'speech_auth')
    return {
      name: 'apple-helper',
      pass: false,
      detail: 'Apple helper present, but Speech Recognition permission is not granted',
      fix: 'Open System Settings → Privacy & Security → Speech Recognition and allow the app Teletubby was started from (iTerm, or Teletubby).',
    }
  if (r.error === 'timeout')
    return {
      name: 'apple-helper',
      pass: false,
      detail: 'Apple helper present, but it gave no answer in time (it may be waiting on a permission prompt)',
      fix: 'Look for a Speech Recognition prompt and allow it, then re-run.',
    }
  if (r.error)
    return {
      name: 'apple-helper',
      pass: false,
      detail: `Apple helper error: ${r.error}`,
      fix: 'Apple on-device recognition is unavailable — Groq still works; nothing to do unless Groq fails too.',
    }
  return overlap(r.text ?? '', SAMPLE_TEXT) >= 0.5
    ? { name: 'apple-helper', pass: true, detail: `Apple helper heard "${r.text}"` }
    : {
        name: 'apple-helper',
        pass: false,
        detail: `Apple helper ran but heard "${r.text ?? ''}"`,
        fix: 'Apple recognition is not hearing the sample — Groq still works; re-run once.',
      }
}

/**
 * Aligner vs the 2-paragraph script: what was heard of the sample must land in paragraph 1 and
 * not move the prompter; reading on into paragraph 2 must step it forward exactly once.
 */
export function checkAligner(heard: string | undefined): SelftestCheck {
  const sample = heard && heard.trim() ? heard : SAMPLE_TEXT
  const source = heard && heard.trim() ? 'Groq text' : 'the sample text (Groq gave none)'
  const d = createVoiceDriver(SELFTEST_SCRIPT, 'p1')
  const first = d.hear(sample)
  // Reading on, the way the live recogniser reports it: the heard text grows a few words per tick.
  const more = `${P1_REST} ${SELFTEST_SCRIPT[1]!.text}`.split(/\s+/)
  let second = first
  for (let n = 4; n <= more.length + 3; n += 4) {
    second = d.hear(`${sample} ${more.slice(0, n).join(' ')}`)
    if (second.advanced) break
  }
  const ok = !first.advanced && first.paragraphId === 'p1' && second.advanced && second.paragraphId === 'p2'
  const detail = `on ${source}: paragraph 1 → ${first.reason}/${first.paragraphId}, reading on → ${second.reason}/${second.paragraphId}`
  return ok
    ? { name: 'aligner', pass: true, detail }
    : {
        name: 'aligner',
        pass: false,
        detail,
        fix: 'The aligner did not follow a clean reading — this is a code bug; send this output to the developer.',
      }
}

export async function runVoiceSelftest(deps: SelftestDeps): Promise<SelftestReport> {
  const key = await checkGroqKey(deps)
  const mic = await checkMic(deps)
  const groq = await checkGroqRoundtrip(deps)
  const apple = await checkApple(deps)
  const aligner = checkAligner(groq.pass ? groq.text : undefined)
  const { text: _text, ...groqCheck } = groq
  const checks = [key, mic, groqCheck, apple, aligner]
  return { ok: checks.every((c) => c.pass !== false), where: deps.where, checks }
}

/** The printable form: one line per check, a fix line under every FAIL. */
export function formatSelftest(r: SelftestReport): string {
  const lines = [`Teletubby voice self-test (${r.where === 'app' ? 'inside the running app' : 'standalone'})`]
  for (const c of r.checks) {
    const tag = c.pass === true ? 'PASS' : c.pass === false ? 'FAIL' : 'SKIP'
    lines.push(`${tag}  ${c.name.padEnd(15)} ${c.detail}`)
    if (c.pass !== true && c.fix) lines.push(`      → ${c.fix}`)
  }
  lines.push(r.ok ? 'RESULT: PASS — voice-follow is ready' : 'RESULT: FAIL — fix the lines marked FAIL above')
  return lines.join('\n')
}
