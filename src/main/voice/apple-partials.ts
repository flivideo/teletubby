/**
 * Apple partials → aligner text, across task swaps and re-anchors. Pure: the clock is handed in.
 *
 * The helper keeps ONE recognition task running for ~50 s and then swaps it for a fresh one
 * (Apple's ~1-minute limit). Each task numbers its partials, and every partial is that task's
 * whole transcript so far, with the tail revised as it goes.
 *
 * A re-anchor (a manual press) must not relaunch the helper — LaunchServices takes long enough
 * that the next words are lost. Instead:
 *   - the text heard so far in the current task is remembered, and trimmed off the front of
 *     every later partial of the SAME task (the cut may land up to SLACK chars early, on a word
 *     boundary, because the recogniser revises its tail);
 *   - partials for IGNORE_MS after the press are dropped (they are speech from before it) — and
 *     extend the remembered prefix, since that is what they are;
 *   - a task swap clears the prefix: a new task never heard the old speech.
 * A partial from an OLDER task than the newest seen is stale and dropped.
 */
export const IGNORE_MS = 300
export const SLACK = 24

export type PartialVerdict =
  | { kind: 'text'; text: string; task: number; swapped: boolean }
  | { kind: 'drop'; reason: 'stale-task' | 'after-reset'; task: number }

export interface PartialFilter {
  /** The helper says task `task` started (also implied by the first partial of a newer task). */
  task(task: number): boolean
  partial(task: number, text: string, nowMs: number): PartialVerdict
  reset(nowMs: number): void
  readonly state: { task: number; prefix: string; ignoreUntil: number }
}

/** Cut `prefix` off the front of `text`; with revisions, land on a word boundary within SLACK. */
export function trimHeard(text: string, prefix: string): string {
  if (!prefix) return text
  if (text.startsWith(prefix)) return text.slice(prefix.length).trimStart()
  const hi = Math.min(text.length, prefix.length)
  const lo = Math.max(0, prefix.length - SLACK)
  if (hi <= lo) return text.length <= lo ? '' : text.slice(hi).trimStart()
  // Last whitespace in [lo, hi] — the end of an old word that the revision did not move.
  let cut = hi
  for (let i = hi; i >= lo; i--) {
    if (/\s/u.test(text[i] ?? '')) {
      cut = i
      break
    }
  }
  return text.slice(cut).trimStart()
}

export function createPartialFilter(): PartialFilter {
  let task = -1
  let prefix = ''
  let lastRaw = ''
  let ignoreUntil = -Infinity

  const swapTo = (t: number): boolean => {
    if (t <= task) return false
    task = t
    prefix = ''
    lastRaw = ''
    return true
  }

  return {
    get state() {
      return { task, prefix, ignoreUntil }
    },
    task: swapTo,
    partial(t, text, nowMs) {
      if (t < task) return { kind: 'drop', reason: 'stale-task', task: t }
      const swapped = swapTo(t)
      lastRaw = text
      if (nowMs < ignoreUntil) {
        prefix = text
        return { kind: 'drop', reason: 'after-reset', task: t }
      }
      return { kind: 'text', text: trimHeard(text, prefix), task: t, swapped }
    },
    reset(nowMs) {
      prefix = lastRaw
      ignoreUntil = nowMs + IGNORE_MS
    },
  }
}
