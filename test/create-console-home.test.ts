import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CT-0043: the template's APPYTRON_HOME seam, adopted verbatim into `src/main/create-console.ts`. An isolated run
 * (teletubby-isolated, a UAT) must never reach the real userData — `teletubby.json` and `control.json` both live
 * there (`app.getPath('userData')` in `src/main/index.ts`). Electron is mocked: the test records what the console
 * tells `app`, and when.
 */

const calls: string[] = [];
const setPath = vi.fn((name: string, value: string) => calls.push(`setPath ${name} ${value}`));
vi.mock('electron', () => ({
  app: {
    setPath,
    whenReady: vi.fn(async () => {
      calls.push('whenReady');
    }),
    on: vi.fn(),
    quit: vi.fn(),
  },
  ipcMain: { handle: vi.fn(), removeHandler: vi.fn() },
  BrowserWindow: class {},
  shell: { openExternal: vi.fn() },
}));

let home: string;
beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'teletubby-home-'));
  calls.length = 0;
  setPath.mockClear();
});
afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(home, { recursive: true, force: true });
});

async function start() {
  const { createConsole } = await import('../src/main/create-console');
  const onReady = vi.fn();
  await createConsole({ name: 'teletubby-test', onReady }).start();
  return onReady;
}

describe('Feature: APPYTRON_HOME moves the data root (CT-0043)', () => {
  it('Scenario: given APPYTRON_HOME=<tmp>, when the console starts, then userData and pictures move under it, before the app is ready', async () => {
    vi.stubEnv('APPYTRON_HOME', home);
    const onReady = await start();

    expect(setPath).toHaveBeenCalledWith('userData', join(home, 'userData'));
    expect(setPath).toHaveBeenCalledWith('pictures', join(home, 'pictures'));
    // setPath('userData') is only honoured while the app is un-ready.
    expect(calls.indexOf('whenReady')).toBeGreaterThan(calls.indexOf(`setPath userData ${join(home, 'userData')}`));
    expect(statSync(join(home, 'userData')).isDirectory()).toBe(true);
    expect(statSync(join(home, 'userData')).mode & 0o777).toBe(0o700);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('Scenario: given no APPYTRON_HOME, when the console starts, then no path is touched (a real launch is unchanged)', async () => {
    vi.stubEnv('APPYTRON_HOME', '');
    await start();
    expect(setPath).not.toHaveBeenCalled();
  });
});
