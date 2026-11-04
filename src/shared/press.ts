/** Press-log input shape — shared by renderer, preload and main. See src/core/press-log.ts. */
export type PressKind = 'step' | 'back' | 'jump' | 'start' | 'stop';

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
