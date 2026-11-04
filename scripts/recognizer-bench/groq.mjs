// Groq recogniser: every TICK_MS of audio, send the last WINDOW_MS to whisper-large-v3-turbo.
// Key comes from the environment (load ~/.secrets first); never logged.
import { readWav, wavSlice } from './wav.mjs'
const TICK_MS = 2000, WINDOW_MS = 12000
export const groq = {
  name: 'groq whisper-large-v3-turbo',
  async run(wavPath) {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error('GROQ_API_KEY not set')
    const { pcm, durMs } = readWav(wavPath)
    const events = []
    const ticks = []
    for (let t = TICK_MS; t < durMs; t += TICK_MS) ticks.push(t)
    ticks.push(durMs)
    for (const t of ticks) {
      const from = Math.max(0, t - WINDOW_MS)
      const body = wavSlice(pcm, from, t)
      let text = '', ms = 0
      for (let attempt = 0; attempt < 5; attempt++) {
        const fd = new FormData()
        fd.set('model', 'whisper-large-v3-turbo'); fd.set('language', 'en'); fd.set('response_format', 'json')
        fd.set('file', new Blob([body], { type: 'audio/wav' }), 'chunk.wav')
        const t0 = performance.now()
        const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: fd })
        ms = performance.now() - t0
        if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 2000 * (attempt + 1))); continue }
        if (!r.ok) throw new Error(`groq ${r.status}`)
        text = ((await r.json()).text ?? '').trim()
        break
      }
      events.push({ atMs: t + ms, windowStartMs: from, text })
    }
    return events
  },
}
