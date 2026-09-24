import type { WindowShown } from '../core/index.js';

/** The slice of a BrowserWindow a raise touches — a fake in tests, so no window ever pops. */
export interface ShowableWindow {
  isDestroyed(): boolean;
  isMinimized(): boolean;
  isVisible(): boolean;
  isFocused(): boolean;
  restore(): void;
  show(): void;
  moveTop(): void;
  focus(): void;
  once(event: 'ready-to-show', listener: () => void): void;
}

export interface ShowDeps<W extends ShowableWindow> {
  /** The prompter windows that exist now. */
  windows(): W[];
  /** Build the prompter (it is created hidden and shows on ready-to-show). */
  open(): W;
  /** `app.show()` on macOS (un-hides the app) + `app.focus({ steal: true })`. */
  activateApp(): void;
  /** Focus is applied by the window server asynchronously; wait this long before reading it back. */
  settleMs?: number;
  /** A fresh window that never paints still gets an honest answer after this. */
  readyTimeoutMs?: number;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * FliStudio said "in front now" while no window appeared (flivideo-orch,
 * 2026-09-24; the same bug as FliCut/FliCast). Teletubby had no raise at all —
 * FliStudio fell back to activating a bare Electron bundle and asking System
 * Events, which needs Accessibility and can start a SECOND Electron.
 *
 * So the app raises itself: create if none, restore if minimised, show, move
 * to top, focus, steal app focus — and the reply is READ FROM THE WINDOW
 * afterwards. A caller that says "in front" must be able to know it is.
 */
export async function showPrompter<W extends ShowableWindow>(deps: ShowDeps<W>): Promise<WindowShown> {
  let win = deps.windows().find((w) => !w.isDestroyed());
  const created = !win;
  if (!win) {
    win = deps.open();
    const fresh = win;
    await Promise.race([
      new Promise<void>((resolve) => fresh.once('ready-to-show', resolve)),
      wait(deps.readyTimeoutMs ?? 10_000),
    ]);
  }
  if (win.isMinimized()) win.restore();
  deps.activateApp();
  win.show();
  win.moveTop();
  win.focus();
  await wait(deps.settleMs ?? 150);
  return {
    visible: win.isVisible(),
    focused: win.isFocused(),
    minimized: win.isMinimized(),
    created,
  };
}
