import { describe, expect, it, vi } from 'vitest';
import { KYBERNESIS_PHASE_1, TALENTS } from '@shared/script-set';
import { MemoryRepository, createCore } from '@core/index';
import { showPrompter, type ShowableWindow } from '../src/main/show-window';

/**
 * `system_show` — FliStudio said "in front now" and no window appeared
 * (flivideo-orch, 2026-09-24). The reply must be what the window SAYS after
 * the raise, and every step of the raise must happen.
 */

class FakeWindow implements ShowableWindow {
  minimized: boolean;
  visible: boolean;
  focused = false;
  destroyed = false;
  calls: string[] = [];
  private ready: (() => void) | null = null;
  constructor(state: { minimized?: boolean; visible?: boolean } = {}) {
    this.minimized = state.minimized ?? false;
    this.visible = state.visible ?? true;
  }
  isDestroyed = () => this.destroyed;
  isMinimized = () => this.minimized;
  isVisible = () => this.visible;
  isFocused = () => this.focused;
  restore = () => {
    this.calls.push('restore');
    this.minimized = false;
  };
  show = () => {
    this.calls.push('show');
    this.visible = true;
  };
  moveTop = () => this.calls.push('moveTop');
  focus = () => {
    this.calls.push('focus');
    this.focused = true;
  };
  once = (_event: 'ready-to-show', listener: () => void) => {
    this.ready = listener;
  };
  paint = () => this.ready?.();
}

const deps = (existing: FakeWindow[], opened = new FakeWindow({ visible: false })) => ({
  windows: () => existing,
  open: vi.fn(() => {
    queueMicrotask(opened.paint);
    return opened;
  }),
  activateApp: vi.fn(),
  settleMs: 0,
  readyTimeoutMs: 50,
});

describe('showPrompter', () => {
  it('restores a minimised window, then shows, raises and focuses it', async () => {
    const win = new FakeWindow({ minimized: true });
    const d = deps([win]);
    const shown = await showPrompter(d);
    expect(win.calls).toEqual(['restore', 'show', 'moveTop', 'focus']);
    expect(d.activateApp).toHaveBeenCalledOnce();
    expect(d.open).not.toHaveBeenCalled();
    expect(shown).toEqual({ visible: true, focused: true, minimized: false, created: false });
  });

  it('creates the window when there is none (closed on macOS, process alive)', async () => {
    const opened = new FakeWindow({ visible: false });
    const d = deps([], opened);
    const shown = await showPrompter(d);
    expect(d.open).toHaveBeenCalledOnce();
    expect(opened.calls).toEqual(['show', 'moveTop', 'focus']);
    expect(shown).toMatchObject({ visible: true, focused: true, created: true });
  });

  it('skips a destroyed window rather than raising it', async () => {
    const dead = new FakeWindow();
    dead.destroyed = true;
    const d = deps([dead]);
    const shown = await showPrompter(d);
    expect(dead.calls).toEqual([]);
    expect(shown.created).toBe(true);
  });

  it('reports what the window says — an unfocused window is reported unfocused', async () => {
    const stubborn = new FakeWindow();
    stubborn.focus = () => stubborn.calls.push('focus'); // the OS refused focus
    const shown = await showPrompter(deps([stubborn]));
    expect(shown.focused).toBe(false);
  });
});

describe('system_show', () => {
  const store = () =>
    new MemoryRepository({
      version: 1,
      sets: [JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1))],
      talents: JSON.parse(JSON.stringify(TALENTS)),
    });
  const host = (show?: () => Promise<unknown>) => ({
    app: 'teletubby',
    version: '0.1.0-test',
    pid: 4242,
    startedAt: '2026-09-24T00:00:00.000Z',
    quit: vi.fn(),
    restart: vi.fn(),
    ...(show ? { show } : {}),
  });

  it('is agent-callable and replies with the host’s read-back', async () => {
    const reply = { visible: true, focused: true, minimized: false, created: false };
    const core = createCore({ repository: store(), lifecycle: host(async () => reply) as never });
    const result = await core.invoke('system_show', {}, { principal: 'agent', as: 'agent:flistudio' });
    expect(result).toMatchObject({ ok: true, data: reply });
  });

  it('is not refused while the talent is on the prompter — raising moves nothing on stage', async () => {
    const show = vi.fn(async () => ({ visible: true, focused: true, minimized: false, created: false }));
    const core = createCore({ repository: store(), lifecycle: host(show) as never });
    await core.invoke('set_active_context', { setId: KYBERNESIS_PHASE_1.id }, { principal: 'ui' });
    const result = await core.invoke('system_show', {}, { principal: 'agent' });
    expect(result.ok).toBe(true);
    expect(show).toHaveBeenCalledOnce();
  });

  it('answers unavailable headless, never pretending', async () => {
    for (const lifecycle of [undefined, host()]) {
      const core = createCore({ repository: store(), ...(lifecycle ? { lifecycle } : {}) });
      const result = await core.invoke('system_show', {}, { principal: 'agent' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.failureMode).toBe('unavailable');
    }
  });

  it('wakes no other client', async () => {
    const core = createCore({
      repository: store(),
      lifecycle: host(async () => ({ visible: true, focused: true, minimized: false, created: false })) as never,
    });
    const events: unknown[] = [];
    core.onChange((e) => events.push(e));
    await core.invoke('system_show', {}, { principal: 'agent' });
    expect(events).toEqual([]);
  });
});
