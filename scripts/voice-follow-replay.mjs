#!/usr/bin/env node
// Usage: npx vite-node scripts/voice-follow-replay.mjs <transcript.json> <script-paragraphs.json|txt>
// transcript: FliTools flitools.transcript/2 ({words:[{word,start}]}). script: JSON array of strings, or text split on blank lines.
// Result is "aligner vs SPEECH", not vs ↓ presses.
import { readFileSync } from 'node:fs'
import { replay } from '../src/core/voice-follow-replay.ts'

const [tPath, sPath] = process.argv.slice(2)
if (!tPath || !sPath) {
  console.error('usage: voice-follow-replay.mjs <transcript.json> <script.json|txt>')
  process.exit(2)
}
const t = JSON.parse(readFileSync(tPath, 'utf8'))
const words = (t.words ?? []).filter((w) => w.kind === undefined || w.kind === 'word').map((w) => ({ word: w.word, start: w.start }))
const raw = readFileSync(sPath, 'utf8')
const paragraphs = sPath.endsWith('.json') ? JSON.parse(raw) : raw.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
const { rows, summary } = replay(paragraphs, words)
console.table(rows)
console.log(JSON.stringify(summary, null, 2))
