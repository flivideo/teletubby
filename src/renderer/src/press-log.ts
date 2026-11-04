/**
 * Renderer side of the press log: watches the prompter store and reports every position
 * change as a `PressInput`. Pure of Electron — `send` is injected (`window.appytron.logPress`).
 *
 * `stepNext` / `stepPrev` call `markPress` just before they set `step`, so those moves are
 * logged as `step` / `back`; any other move of the position (style or corpus switch, a rewrite
 * re-seating the paragraph, jumping to a script) is a `jump`. Script change = stop + start.
 */
import { paragraphsOf, type Transcript } from '@shared/domain';
import type { PressInput, PressKind } from '@shared/press';
import { activeTriggers, currentTranscript, useProm } from './store';

let pending: 'step' | 'back' | 'voice' | null = null;
export const markPress = (kind: 'step' | 'back' | 'voice'): void => {
  pending = kind;
};

/** FNV-1a over the transcript's paragraph text — cheap, stable, enough to tell versions apart. */
export function hashTranscript(t: Transcript | undefined): string | undefined {
  if (!t) return undefined;
  let h = 0x811c9dc5;
  for (const p of paragraphsOf(t)) {
    for (const ch of p.id + '\u0000' + p.text + '\u0001') {
      h ^= ch.codePointAt(0)!;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, '0');
}

type State = ReturnType<typeof useProm.getState>;

export function attachPressLog(
  send: (input: PressInput) => void,
  store: typeof useProm = useProm,
): () => void {
  const view = (s: State) => ({
    scriptId: s.scriptId,
    step: s.step,
    paragraphId: activeTriggers(s)[s.step]?.paragraphId ?? null,
    version: hashTranscript(currentTranscript(s)),
  });
  const emit = (kind: PressKind, scriptId: string, extra: Partial<PressInput> = {}): void => {
    try {
      send({ kind, scriptId, ...extra });
    } catch {
      /* never reaches the talent */
    }
  };
  let last = view(store.getState());
  if (last.scriptId)
    emit('start', last.scriptId, {
      scriptVersion: last.version,
      to: last.step,
      paragraphId: last.paragraphId,
    });

  const unsubscribe = store.subscribe((s) => {
    const now = view(s);
    if (now.scriptId !== last.scriptId) {
      pending = null;
      if (last.scriptId)
        emit('stop', last.scriptId, { scriptVersion: last.version, from: last.step });
      if (now.scriptId)
        emit('start', now.scriptId, {
          scriptVersion: now.version,
          to: now.step,
          paragraphId: now.paragraphId,
        });
    } else if (now.scriptId && now.step !== last.step) {
      const kind: PressKind = pending ?? 'jump';
      emit(kind, now.scriptId, {
        scriptVersion: now.version,
        from: last.step,
        to: now.step,
        paragraphId: now.paragraphId,
      });
    }
    pending = null;
    last = now;
  });

  const onUnload = (): void => {
    if (last.scriptId)
      emit('stop', last.scriptId, { scriptVersion: last.version, from: last.step });
  };
  if (typeof window !== 'undefined') window.addEventListener('beforeunload', onUnload);
  return () => {
    unsubscribe();
    if (typeof window !== 'undefined') window.removeEventListener('beforeunload', onUnload);
  };
}
