/**
 * Voice-follow aligner — a TypeScript port of Textream's `PromptMatcher`
 * (+ `SpeechTextAlignment`). Pure functions, no I/O, no Electron.
 *
 * Third-party notice
 * ------------------
 * Derived from Textream — https://github.com/f/textream
 *   Source:    TextreamiOS/Speech/PromptMatcher.swift, SpeechTextAlignment.swift
 *              (and splitPromptTextIntoWords in TextreamiOS/Models/PromptTextProcessor.swift)
 *   Commit:    2c02f3e (v1.7.1)
 *   Licence:   MIT
 *   Copyright (c) 2026 Fatih Kadir Akin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions: The above
 * copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 * (Full text: Textream's LICENSE.)
 *
 * Semantics kept: forward-only; commit when both strategies progressed, an annotation was
 * skipped, the step is <= 15 chars, or 2 of the last 3 candidates agree within 10 chars;
 * `jump` re-anchors and clears history. Offsets are in code points, not UTF-16 units.
 */

const isLetter = (c: string): boolean => /\p{L}/u.test(c)
const isNumber = (c: string): boolean => /\p{N}/u.test(c)
const isAlnum = (c: string): boolean => isLetter(c) || isNumber(c)
const isSpace = (c: string): boolean => /\s/u.test(c)
const alnumOnly = (s: string): string => Array.from(s).filter(isAlnum).join('')

/** Half-open [start, end) ranges of `[bracket cues]`, in code points. */
export function annotationRanges(text: string): Array<[number, number]> {
  const out: Array<[number, number]> = []
  let open: number | null = null
  Array.from(text).forEach((c, i) => {
    if (c === '[' && open === null) open = i
    else if (c === ']' && open !== null) {
      out.push([open, i + 1])
      open = null
    }
  })
  return out
}

export function advancePastAnnotations(
  text: string,
  ranges: Array<[number, number]>,
  from: number
): number {
  const chars = Array.from(text)
  let current = Math.max(0, Math.min(from, chars.length))
  let skipped = false
  while (current < chars.length) {
    const inside = ranges.find(([a, b]) => current >= a && current < b)
    if (inside) {
      current = inside[1]
      skipped = true
      continue
    }
    let next = current
    while (next < chars.length && isSpace(chars[next]!)) next++
    const starts = ranges.find(([a]) => a === next)
    if (starts) {
      current = starts[1]
      skipped = true
      continue
    }
    return skipped ? next : current
  }
  return current
}

export function bestOffset(characterResult: number, wordResult: number, tolerance = 20): number {
  return Math.abs(characterResult - wordResult) <= tolerance
    ? Math.trunc((characterResult + wordResult) / 2)
    : Math.max(characterResult, wordResult)
}

export function shouldCommit(a: {
  characterResult: number
  wordResult: number
  current: number
  rawCandidate: number
  candidate: number
  confirmed: boolean
}): boolean {
  const bothProgressed = Math.min(a.characterResult, a.wordResult) > 0
  const skippedAnnotation = a.candidate > a.rawCandidate
  const smallStep = a.candidate - a.current <= 15
  return bothProgressed || skippedAnnotation || a.confirmed || smallStep
}

export function editDistance(first: string, second: string): number {
  const a = Array.from(first)
  const b = Array.from(second)
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j]!
      row[j] = a[i - 1] === b[j - 1] ? previous : Math.min(previous, row[j]!, row[j - 1]!) + 1
      previous = temp
    }
  }
  return row[b.length]!
}

export function isFuzzyMatch(first: string, second: string): boolean {
  if (!first || !second) return false
  if (first === second) return true
  const a = Array.from(first)
  const b = Array.from(second)
  const shorter = Math.min(a.length, b.length)
  if (shorter >= 3 && (first.startsWith(second) || second.startsWith(first))) return true
  let shared = 0
  while (shared < shorter && a[shared] === b[shared]) shared++
  if (shorter >= 3 && shared >= Math.max(3, Math.trunc((shorter * 3) / 5))) return true
  const d = editDistance(first, second)
  if (shorter <= 2) return false
  if (shorter <= 4) return d <= 1
  if (shorter <= 8) return d <= 2
  return d <= Math.trunc(Math.max(a.length, b.length) / 3)
}

const isAnnotationWord = (w: string): boolean =>
  (w.startsWith('[') && w.endsWith(']')) || Array.from(w).every((c) => !isAlnum(c))

const normalize = (t: string): string =>
  Array.from(t.toLowerCase())
    .filter((c) => isAlnum(c) || isSpace(c))
    .join('')

export class PromptMatcher {
  private chars: string[]
  private ranges: Array<[number, number]>
  private recent: number[] = []
  /** Code-point offset the script has been followed to. Never decreases except via `jump`. */
  recognizedCharacterCount: number
  matchStartOffset: number

  constructor(
    public readonly text: string,
    startingAt = 0
  ) {
    this.chars = Array.from(text)
    this.ranges = annotationRanges(text)
    const start = advancePastAnnotations(text, this.ranges, startingAt)
    this.recognizedCharacterCount = start
    this.matchStartOffset = start
  }

  get characterCount(): number {
    return this.chars.length
  }

  restartFromCurrentProgress(): void {
    this.matchStartOffset = this.recognizedCharacterCount
    this.recent = []
  }

  /** Manual re-anchor (a ↑/↓ press). Clears history, like Textream's jump. */
  jump(offset: number): number {
    const clamped = Math.max(0, Math.min(offset, this.chars.length))
    const target = advancePastAnnotations(this.text, this.ranges, clamped)
    this.recognizedCharacterCount = target
    this.matchStartOffset = target
    this.recent = []
    return target
  }

  /** Feed the WHOLE transcript since the last anchor (partials are cumulative). */
  match(transcript: string): number {
    if (!transcript || this.matchStartOffset >= this.chars.length) return this.recognizedCharacterCount
    const characterResult = this.characterLevelMatch(transcript)
    const wordResult = this.wordLevelMatch(transcript)
    const best = bestOffset(characterResult, wordResult)
    const rawCandidate = Math.min(this.matchStartOffset + best, this.chars.length)
    const candidate = advancePastAnnotations(this.text, this.ranges, rawCandidate)
    if (candidate <= this.recognizedCharacterCount) return this.recognizedCharacterCount

    this.recent.push(candidate)
    if (this.recent.length > 3) this.recent.shift()
    const confirmed = this.recent.filter((p) => Math.abs(p - candidate) <= 10).length >= 2
    if (
      shouldCommit({
        characterResult,
        wordResult,
        current: this.recognizedCharacterCount,
        rawCandidate,
        candidate,
        confirmed
      })
    ) {
      this.recognizedCharacterCount = candidate
    }
    return this.recognizedCharacterCount
  }

  private characterLevelMatch(spoken: string): number {
    const src = Array.from(this.chars.slice(this.matchStartOffset).join('').toLowerCase())
    const spk = Array.from(normalize(spoken))
    let si = 0
    let pi = 0
    let lastGood = 0
    while (si < src.length && pi < spk.length) {
      const sc = src[si]!
      const pc = spk[pi]!
      if (sc === '[') {
        const close = src.indexOf(']', si)
        if (close !== -1) {
          si = close + 1
          lastGood = si
          continue
        }
      }
      if (!isAlnum(sc)) {
        si++
        continue
      }
      if (!isAlnum(pc)) {
        pi++
        continue
      }
      if (sc === pc) {
        si++
        pi++
        lastGood = si
        continue
      }
      let found = false
      const maxSpoken = Math.min(5, spk.length - pi - 1)
      for (let k = 1; k <= maxSpoken; k++) {
        if (spk[pi + k] === sc) {
          pi += k
          found = true
          break
        }
      }
      if (found) continue
      const maxSource = Math.min(5, src.length - si - 1)
      for (let k = 1; k <= maxSource; k++) {
        if (src[si + k] === pc) {
          si += k
          found = true
          break
        }
      }
      if (found) continue
      pi++
    }
    while (si < src.length) {
      if (src[si] === '[' && src.indexOf(']', si) !== -1) {
        si = src.indexOf(']', si) + 1
        lastGood = si
      } else if (!isAlnum(src[si]!)) {
        si++
        lastGood = si
      } else break
    }
    return lastGood
  }

  private wordLevelMatch(spoken: string): number {
    const rest = this.chars.slice(this.matchStartOffset).join('')
    const srcWords = rest.split(' ').filter((w) => w.length > 0 || false)
    // Swift split(separator:" ") omits empty subsequences by default — same as the filter above.
    const spkWords = spoken
      .toLowerCase()
      .replace(/\n/g, ' ')
      .split(/\s+/u)
      .filter(Boolean)
    const len = (w: string): number => Array.from(w).length
    let si = 0
    let pi = 0
    let matched = 0
    let inside = false
    const beginsAnnotation = (i: number): boolean =>
      srcWords[i]!.startsWith('[') && srcWords.slice(i).some((w) => w.includes(']'))
    while (si < srcWords.length && pi < spkWords.length) {
      const sw = srcWords[si]!
      const begins = beginsAnnotation(si)
      if (inside || begins || isAnnotationWord(sw)) {
        if (begins) inside = true
        if (sw.includes(']')) inside = false
        matched += len(sw)
        if (si < srcWords.length - 1) matched += 1
        si++
        continue
      }
      const sourceWord = alnumOnly(sw.toLowerCase())
      const spokenWord = alnumOnly(spkWords[pi]!)
      if (sourceWord === spokenWord || isFuzzyMatch(sourceWord, spokenWord)) {
        matched += len(sw)
        si++
        pi++
        if (si < srcWords.length) matched += 1
        continue
      }
      let foundSpoken = false
      const maxSpoken = Math.min(5, spkWords.length - pi - 1)
      for (let k = 1; k <= maxSpoken; k++) {
        const next = alnumOnly(spkWords[pi + k]!)
        if (sourceWord === next || isFuzzyMatch(sourceWord, next)) {
          pi += k
          foundSpoken = true
          break
        }
      }
      if (foundSpoken) continue
      let foundSource = false
      const maxSource = Math.min(5, srcWords.length - si - 1)
      for (let k = 1; k <= maxSource; k++) {
        const next = alnumOnly(srcWords[si + k]!.toLowerCase())
        if (next === spokenWord || isFuzzyMatch(next, spokenWord)) {
          for (let s = 0; s < k; s++) matched += len(srcWords[si + s]!) + 1
          si += k
          foundSource = true
          break
        }
      }
      if (foundSource) continue
      if (sourceWord === '') {
        matched += len(sw)
        if (si < srcWords.length - 1) matched += 1
        si++
      } else pi++
    }
    while (si < srcWords.length) {
      const sw = srcWords[si]!
      const begins = beginsAnnotation(si)
      if (!(inside || begins || isAnnotationWord(sw))) break
      if (begins) inside = true
      if (sw.includes(']')) inside = false
      matched += len(sw)
      if (si < srcWords.length - 1) matched += 1
      si++
    }
    return matched
  }
}
