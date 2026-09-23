/**
 * WHAT IS ON STAGE, AND WHO MAY MOVE IT (d04 preflight, 2026-09-23).
 *
 * The standing rule is that an agent never moves the talent. The d04 UAT
 * needs an agent to put a named script on stage when the project already has
 * a set attached (the wrong-set bug), so the rule is kept in its SPIRIT rather
 * than its letter: an agent may choose the stage only while nobody is on the
 * prompter. Two pieces, both in-memory, both per run:
 *
 *   · `StageRequests` — the latest `stage_select`, numbered. The window reads
 *     it on the change event and applies it; it never replays an old one.
 *   · `TalentActivity` — when the talent last MOVED. The renderer writes
 *     `remember_layout` about 400 ms after every step, script change or
 *     corpus flip, carrying the position — so a changed position from the
 *     `ui` principal is the prompter in use. Two writes are NOT activity: the
 *     same position again (a relaunch restoring where it was), and the window
 *     landing on a stage the agent just asked for.
 *
 * "Busy" (quit, restart and stage_select refuse `app_busy`) is activity in the
 * last two minutes. A heuristic, stated as one: Teletubby cannot see Ecamm.
 * Two minutes covers the pauses inside a take; a talent between takes for
 * longer is not interrupted by a stage change they can see and undo.
 */

import type { Clock } from './safety.js';

export const TALENT_BUSY_WINDOW_MS = 2 * 60 * 1000;

export interface StagePosition {
  setId: string | null;
  scriptId: string | null;
  /** The beat, by paragraph id — stepping inside one script changes only this. */
  paragraphId?: string | null;
}

export interface StageRequest {
  /** Increases per request, so the window applies each one exactly once. */
  seq: number;
  setId: string;
  scriptId: string | null;
  /** The principal name that asked (`agent:claude`, `cli`). */
  requestedBy: string;
  at: string;
}

export class StageRequests {
  private latest: StageRequest | null = null;
  constructor(private readonly clock: Clock) {}

  request(setId: string, scriptId: string | null, requestedBy: string): StageRequest {
    this.latest = {
      seq: (this.latest?.seq ?? 0) + 1,
      setId,
      scriptId,
      requestedBy,
      at: new Date(this.clock()).toISOString(),
    };
    return this.latest;
  }

  get(): StageRequest | null {
    return this.latest;
  }
}

export class TalentActivity {
  private lastPosition: StagePosition | null = null;
  private lastMovedAt = 0;
  private where: StagePosition | null = null;

  constructor(
    private readonly clock: Clock,
    private readonly stage: StageRequests,
  ) {}

  /** Called for every `remember_layout` from the window, with its position. */
  observe(position: StagePosition | null | undefined): void {
    const next: StagePosition = {
      setId: position?.setId ?? null,
      scriptId: position?.scriptId ?? null,
      paragraphId: position?.paragraphId ?? null,
    };
    const previous = this.lastPosition;
    this.lastPosition = next;
    // The first write of a run is the window restoring or opening — not a move.
    if (previous === null) return;
    // A layout-only change (a divider, a zone) is set-up, not a take.
    if (
      previous.setId === next.setId &&
      previous.scriptId === next.scriptId &&
      previous.paragraphId === next.paragraphId
    )
      return;
    // The window landing where an agent just asked is the agent's move, not
    // the talent's — otherwise a second stage_select would refuse on the first.
    const asked = this.stage.get();
    const onRequest =
      asked !== null && asked.setId === next.setId && (asked.scriptId ?? next.scriptId) === next.scriptId;
    if (onRequest && (previous.setId !== next.setId || previous.scriptId !== next.scriptId)) return;
    this.lastMovedAt = this.clock();
    this.where = next;
  }

  busy(): { what: string; since: string }[] {
    if (this.lastMovedAt === 0 || this.clock() - this.lastMovedAt >= TALENT_BUSY_WINDOW_MS) return [];
    const where = [this.where?.setId, this.where?.scriptId].filter(Boolean).join(' / ') || 'a script';
    return [{ what: `talent on the prompter (${where})`, since: new Date(this.lastMovedAt).toISOString() }];
  }
}
