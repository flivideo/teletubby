/** Press-log input shape — shared by renderer, preload and main. See src/core/press-log.ts. */
/** `voice` = the aligner moved the position (not David) — keeps live reads from polluting press truth. */
export type PressKind = 'step' | 'back' | 'jump' | 'start' | 'stop' | 'voice';

/** What the renderer reports. */
export interface PressInput {
  kind: PressKind;
  scriptId: string;
  /** Hash of the active transcript's paragraph text, to tell script versions apart. */
  scriptVersion?: string;
  from?: number | null;
  to?: number | null;
  paragraphId?: string | null;
}
