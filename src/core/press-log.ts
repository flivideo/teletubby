/**
 * Press log — an append-only JSONL record of every position change while presenting.
 *
 * Why: voice-follow can only be judged against what David actually did. Replaying a take's
 * word-timed transcript through the aligner and comparing with these presses gives ground truth
 * (`scripts/voice-follow-replay.mjs <transcript> <script> --press-log <file>`).
 *
 * One file per session (`start` … `stop`) at `<dir>/<scriptId>-<ISO>.jsonl`. Always on. Never
 * blocks the UI and never throws: a write failure goes to `onError`, not to the talent.
 * Main stamps `t` and `mono` itself so the renderer cannot skew them.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { PressInput, PressKind } from '../shared/press.js';

export type { PressKind, PressInput };

export interface PressEvent extends PressInput {
  /** ISO wall clock with ms — lines a take up with its recording. */
  t: string;
  /** Monotonic ms since the logger was created. */
  mono: number;
}

export interface PressLogOptions {
  /** Directory for press logs, or null when there is nowhere to write. Called per session start. */
  dir: () => string | null;
  onError?: (error: unknown) => void;
  now?: () => Date;
  /** Monotonic ms clock. */
  clock?: () => number;
}

const KINDS = new Set<string>(['step', 'back', 'jump', 'start', 'stop']);

/** Filesystem-safe ISO stamp: `2026-11-04T10-20-31.123Z`. */
const stamp = (d: Date): string => d.toISOString().replace(/:/g, '-');
const safe = (s: string): string => s.replace(/[^\w.-]+/g, '_');

export class PressLog {
  private file: string | null = null;
  private chain: Promise<void> = Promise.resolve();
  private readonly origin: number;
  private readonly now: () => Date;
  private readonly clock: () => number;

  constructor(private readonly opts: PressLogOptions) {
    this.now = opts.now ?? (() => new Date());
    this.clock = opts.clock ?? (() => performance.now());
    this.origin = this.clock();
  }

  /** Synchronous and non-throwing; the write is queued. Resolves via `flush()`. */
  record(input: PressInput): void {
    try {
      if (!input || !KINDS.has(input.kind) || typeof input.scriptId !== 'string' || !input.scriptId)
        return;
      const at = this.now();
      const event: PressEvent = {
        ...input,
        t: at.toISOString(),
        mono: Math.round(this.clock() - this.origin),
      };
      if (input.kind === 'stop' && this.file === null) return;
      if (input.kind === 'start' || this.file === null) {
        const dir = this.opts.dir();
        if (!dir) return;
        this.file = path.join(dir, `${safe(input.scriptId)}-${stamp(at)}.jsonl`);
        if (input.kind !== 'start') {
          // A press with no session yet: open one so nothing is lost.
          this.write(this.file, { ...event, kind: 'start' });
        }
      }
      this.write(this.file!, event);
      if (input.kind === 'stop') this.file = null;
    } catch (error) {
      this.fail(error);
    }
  }

  /** Resolves when every queued write has settled. For tests and shutdown. */
  flush(): Promise<void> {
    return this.chain;
  }

  private write(file: string, event: PressEvent): void {
    const line = JSON.stringify(event) + '\n';
    this.chain = this.chain
      .then(async () => {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.appendFile(file, line, 'utf8');
      })
      .catch((error) => this.fail(error));
  }

  private fail(error: unknown): void {
    try {
      this.opts.onError?.(error);
    } catch {
      /* the log must never throw */
    }
  }
}

/** Parse a press-log file's text. Skips blank and malformed lines. */
export function parsePressLog(text: string): PressEvent[] {
  const out: PressEvent[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line) as PressEvent;
      if (e && KINDS.has(e.kind)) out.push(e);
    } catch {
      /* torn last line from a crash */
    }
  }
  return out;
}
