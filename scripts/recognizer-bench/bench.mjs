#!/usr/bin/env node
// Usage: npx vite-node scripts/recognizer-bench/bench.mjs <groq|apple> <take.wav> <flitools-transcript.json> [more pairs...]
// Set -a; . ~/.secrets for Groq. Apple needs native/apple-stt/build.sh and a one-time Speech permission click.
// Per take: latency (spoken word -> available), word recovery vs the FliTools transcript, and steps through the aligner
// (script = the reference transcript's segments, so this isolates the RECOGNISER's effect on the aligner).
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createFollower, fuzzyEqual, heardWords } from '../../src/core/voice-follow.ts'
import { groq } from './groq.mjs'

const apple = {
  name: 'apple on-device',
  run: (wav) => new Promise((resolve, reject) => {
    const p = spawn(new URL('../../native/apple-stt/apple-stt', import.meta.url).pathname, [wav])
    let out = ''
    p.stdout.on('data', (d) => (out += d))
    p.on('close', () => {
      const lines = out.split('\n').filter(Boolean).map((l) => JSON.parse(l))
      const err = lines.find((l) => l.error)
      if (err) return reject(new Error(`apple: ${JSON.stringify(err)}`))
      resolve(lines.filter((l) => l.text !== undefined).map((l) => ({ atMs: l.atMs, windowStartMs: 0, text: l.text })))
    })
    p.on('error', reject)
  }),
}
const [engineName, ...rest] = process.argv.slice(2)
const engine = { groq, apple }[engineName]
if (!engine || rest.length < 2 || rest.length % 2) { console.error('usage: bench.mjs <groq|apple> <wav> <transcript.json> ...'); process.exit(2) }

const clean = (w) => Array.from(w.toLowerCase()).filter((c) => /[\p{L}\p{N}]/u.test(c)).join('')
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : null }
const all = { lat: [], words: 0, recovered: 0, paras: 0, ok: 0, early: 0, late: 0 }

for (let i = 0; i < rest.length; i += 2) {
  const [wav, trPath] = [rest[i], rest[i + 1]]
  const tr = JSON.parse(readFileSync(trPath, 'utf8'))
  const ref = tr.words.filter((w) => w.kind === undefined || w.kind === 'word').map((w) => ({ w: clean(w.word), s: w.start * 1000, e: (w.endRefined ?? w.end) * 1000 })).filter((x) => x.w)
  const events = await engine.run(wav)

  // coverage: furthest reference word each event has reached (in-order greedy fuzzy walk from its window start)
  let reachedSoFar = -1
  const firstAvail = new Array(ref.length).fill(null)
  for (const ev of events) {
    const hw = heardWords(ev.text)
    let ri = Math.max(0, ref.findIndex((r) => r.e >= ev.windowStartMs - 300))
    let last = -1
    for (const h of hw) {
      for (let k = ri; k < Math.min(ref.length, ri + 4); k++) {
        if (fuzzyEqual(h, ref[k].w)) { last = k; ri = k + 1; break }
      }
    }
    if (last > reachedSoFar) {
      for (let j = reachedSoFar + 1; j <= last; j++) firstAvail[j] = ev.atMs
      reachedSoFar = last
    }
  }
  const lat = firstAvail.map((a, j) => (a === null ? null : a - ref[j].e)).filter((x) => x !== null)
  const recovered = firstAvail.filter((a) => a !== null).length

  // steps: aligner over the reference's own paragraphs
  const segs = tr.segments.map((s) => ({ text: s.text.trim(), start: s.start * 1000, end: s.end * 1000 })).filter((s) => s.text)
  const script = segs.map((s) => s.text).join('\n\n')
  const f = createFollower(script)
  const stepAt = new Array(segs.length).fill(null)
  for (const ev of events) {
    f.hear(ev.text)
    const p = f.state().cursorParagraph
    for (let q = 1; q <= p && q < segs.length; q++) if (stepAt[q] === null) stepAt[q] = ev.atMs
  }
  let ok = 0, early = 0, late = 0
  for (let q = 1; q < segs.length; q++) {
    const lo = segs[q - 1].end, hi = segs[q].start + 2000
    if (stepAt[q] === null || stepAt[q] > hi) late++
    else if (stepAt[q] < lo) early++
    else ok++
  }
  const name = wav.split('/').pop()
  console.log(`${name}: events ${events.length} · words recovered ${recovered}/${ref.length} · latency median ${Math.round(pct(lat, 0.5))} ms p90 ${Math.round(pct(lat, 0.9))} ms · steps ok ${ok}/${segs.length - 1} early ${early} late/missed ${late}`)
  all.lat.push(...lat); all.words += ref.length; all.recovered += recovered; all.paras += segs.length - 1; all.ok += ok; all.early += early; all.late += late
}
console.log(`ALL [${engine.name}]: latency median ${Math.round(pct(all.lat, 0.5))} ms · p90 ${Math.round(pct(all.lat, 0.9))} ms · words ${all.recovered}/${all.words} (${((100 * all.recovered) / all.words).toFixed(1)}%) · steps ok ${all.ok}/${all.paras} early ${all.early} late ${all.late}`)
