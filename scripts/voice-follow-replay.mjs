#!/usr/bin/env node
// Usage: npx vite-node scripts/voice-follow-replay.mjs <transcript.json> <script.json|txt> [--press-log <file.jsonl>] [--take-start <ISO>] [--shift <sec>]
// transcript: FliTools flitools.transcript/2 ({words:[{word,start}]}). script: JSON array of strings (or {id,text} objects), or text split on blank lines.
// Without --press-log the result is "aligner vs SPEECH". With it, truth is David's own presses (src/core/press-log.ts):
// per paragraph, aligner step vs press time; offset = aligner - press (negative = aligner EARLY), plus ±1 s / ±2 s, median, worst, early, misses.
// --take-start: wall-clock ISO of the recording's t=0 (default: the log's first `start` event is t=0, which is only right if you hit record then).
import { readFileSync } from 'node:fs'
import { replay, pressTimesFromLog } from '../src/core/voice-follow-replay.ts'
import { parsePressLog } from '../src/core/press-log.ts'

const argv = process.argv.slice(2)
const flag = (name) => {
  const i = argv.indexOf(name)
  if (i < 0) return undefined
  return argv.splice(i, 2)[1]
}
const pressPath = flag('--press-log')
const takeStart = flag('--take-start')
const shift = flag('--shift')
const [tPath, sPath] = argv
if (!tPath || !sPath) {
  console.error('usage: voice-follow-replay.mjs <transcript.json> <script.json|txt> [--press-log <file.jsonl>] [--take-start <ISO>] [--shift <sec>]')
  process.exit(2)
}
const t = JSON.parse(readFileSync(tPath, 'utf8'))
const words = (t.words ?? []).filter((w) => w.kind === undefined || w.kind === 'word').map((w) => ({ word: w.word, start: w.start }))
const raw = readFileSync(sPath, 'utf8')
const items = sPath.endsWith('.json') ? JSON.parse(raw) : raw.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
const paragraphs = items.map((p) => (typeof p === 'string' ? p : p.text))
const ids = items.every((p) => typeof p === 'object' && p.id) ? items.map((p) => p.id) : undefined
let truth
if (pressPath) {
  const events = parsePressLog(readFileSync(pressPath, 'utf8'))
  if (!takeStart) console.error('note: no --take-start; treating the log\'s first start event as the recording\'s t=0')
  truth = pressTimesFromLog(events, paragraphs.length, { paragraphIds: ids, takeStart, shift: shift === undefined ? undefined : Number(shift) })
}
const { rows, summary } = replay(paragraphs, words, truth)
console.table(rows)
console.log(JSON.stringify(summary, null, 2))
