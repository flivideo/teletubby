import { app, ipcMain, screen, systemPreferences, type BrowserWindow } from 'electron';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  appScriptArgs,
  loadWindow,
  parseOpenArgs,
  placeWindow,
  trackWindow,
  windowKey,
} from '@flivideo/core';
import { IPC, type AppInfo, type ControlStatus, type InvokePayload } from '@shared/ipc';
import type { InvokeResult } from '@shared/capabilities';
import { KYBERNESIS_PHASE_1, TALENTS } from '@shared/script-set';
import type { PressInput } from '@shared/press';
import type { VoiceControl, VoiceLog } from '@shared/voice';
import { VoiceSession } from './voice/voice-session.js';
import { GroqLive } from './voice/groq-live.js';
import { AppleLive } from './voice/apple-live.js';
import { loadGroqKey } from './voice/secrets.js';
import { createVoiceControl, type VoiceControlResult } from './voice/voice-control.js';
import { PressLog } from '../core/press-log.js';
import { projectDirOf } from '../core/open-context.js';
import { FileRepository, createCore, seed, type Core, type LifecycleHooks } from '../core/index.js';
import { startControlServer, type ControlServerHandle } from './control-server.js';
import { createConsole } from './create-console.js';
import { showPrompter } from './show-window.js';
import type { WindowManager } from './window-manager.js';

let core: Core | null = null;
let windowsRef: WindowManager | null = null;
let control: ControlServerHandle | null = null;
let pressLogDir: () => string | null = () => null;
const pressLog = new PressLog({
  dir: () => pressLogDir(),
  onError: (error) => console.error('[press-log] write failed', error),
});

/**
 * The prompter reopens where David left it — same monitor, position and size —
 * through the ONE helper FliCut and FliCast use too (fli-core v0.4.0, ruled
 * 2026-09-22). The store is `~/.fli/window-state.json` in the account's real
 * home. A monitor that has gone → centred on the primary display, never
 * off-screen. Restored BEFORE show, so there is no flash at the default spot.
 */
const PROMPTER_KEY = windowKey('teletubby', 'prompter');

function openPrompter(windows: WindowManager): BrowserWindow {
  const primaryId = screen.getPrimaryDisplay().id;
  const displays = screen.getAllDisplays().map((d) => ({
    id: d.id,
    workArea: d.workArea,
    primary: d.id === primaryId,
  }));
  // Wide by default — three columns need the horizontal room, and this is a
  // surface you drive from across the room, not a utility panel.
  const at = placeWindow(loadWindow(PROMPTER_KEY), displays, { width: 1440, height: 900 });
  const win = windows.create({ x: at.x, y: at.y, width: at.width, height: at.height });
  if (at.maximized) win.maximize();
  trackWindow(win, PROMPTER_KEY, { displayIdOf: (b) => screen.getDisplayMatching(b).id });
  return win;
}

/**
 * The host half of fli-core's lifecycle verbs. The core has already decided
 * WHETHER (busy, the ★ on `force`) and replied; these only do it.
 *
 * Quit: `app.quit()` → `will-quit` below → the control server closes and its
 * file is removed → Electron exits → overmind, whose only process it was,
 * stops too.
 *
 * Restart: `app.relaunch()` cannot work under `electron-vite dev` (the dev
 * server dies with the first process), so the app runs its own
 * `scripts/app.sh restart` — the same door every outside caller uses. It is
 * spawned DETACHED, in its own session, because `overmind quit` is about to
 * kill everything in this process's tree; and with overmind's, tmux's and
 * Electron's variables stripped, so the new `overmind start` is not nested
 * inside the old one.
 */
function lifecycleHooks(windows: WindowManager): LifecycleHooks {
  const startedAt = new Date().toISOString();
  return {
    app: 'teletubby',
    version: app.getVersion(),
    pid: process.pid,
    startedAt,
    show: () =>
      showPrompter({
        windows: () => windows.all(),
        open: () => openPrompter(windows),
        activateApp: () => {
          if (process.platform === 'darwin') app.show();
          app.focus({ steal: true });
        },
      }),
    quit: () => app.quit(),
    restart: (open) => {
      const root = app.getAppPath();
      const script = join(root, 'scripts', 'app.sh');
      if (!existsSync(script)) {
        // A packaged build has no checkout to run; relaunch the binary instead.
        app.relaunch();
        app.quit();
        return;
      }
      const env = Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => !/^(OVERMIND_|TMUX|ELECTRON_|VITE_|FLIVIDEO_)/.test(key) && key !== 'PORT',
        ),
      );
      spawn('bash', [script, ...appScriptArgs('restart', open ?? undefined)], {
        cwd: root,
        env,
        detached: true,
        stdio: 'ignore',
      }).unref();
    },
  };
}

const desktop = createConsole({
  name: 'teletubby',

  registerIpc({ ipc, logger }) {
    ipc.register<void, AppInfo>({
      channel: IPC.appInfo,
      handle: () => ({
        name: app.getName(),
        version: app.getVersion(),
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        platform: process.platform,
      }),
    });

    /**
     * The renderer's door onto the capability core — the same core the agent
     * reaches over HTTP, with the `ui` principal instead of `agent`.
     *
     * The principal is hard-coded here and is NOT read from the payload. A
     * renderer that could name its own principal could name itself anything.
     */
    ipc.register<InvokePayload, InvokeResult>({
      channel: IPC.controlInvoke,
      handle: async (payload) => {
        if (!core)
          return {
            ok: false,
            error: {
              code: 'unavailable',
              message: 'the capability core is not ready yet',
            },
          };
        if (!payload || typeof payload.capability !== 'string')
          return {
            ok: false,
            error: {
              code: 'invalid_input',
              message: '"capability" must be a string',
            },
          };
        return core.invoke(payload.capability, payload.input ?? {}, {
          principal: 'ui',
          idempotencyKey: payload.idempotencyKey,
        });
      },
    });

    ipc.register<void, ControlStatus>({
      channel: IPC.controlStatus,
      // The token is deliberately absent. The renderer has no use for it, and a
      // secret that reaches the DOM is a secret in the devtools.
      handle: () => ({
        running: control !== null,
        port: control?.port ?? null,
        discoveryPath: control?.discoveryPath ?? null,
      }),
    });

    // Press log: fire-and-forget from the renderer. Lands in the open project's
    // `teletubby/press-logs/`, else `userData/press-logs/`. Failures are logged, never shown.
    ipcMain.on(IPC.pressLog, (_event, input: unknown) => {
      pressLog.record(input as PressInput);
    });

    // Voice-follow: mic PCM in from the renderer, recogniser text back out. OFF until the renderer
    // asks. Groq is the working primary; Apple on-device is the fallback behind the same interface.
    // Every step of the path logs one line here (`"voice":"<event>"`), renderer half included.
    const voiceLog: VoiceLog = (event, detail) => logger.info({ voice: event, ...detail }, 'voice');
    const helper = join(app.getAppPath(), 'native', 'apple-stt', 'build', 'TeletubbySpeech.app');
    const voice = new VoiceSession({
      log: voiceLog,
      engines: [
        () => {
          const key = loadGroqKey();
          voiceLog('groq.key', { found: key !== null });
          return key ? new GroqLive({ key, log: voiceLog }) : null;
        },
        () => {
          const ok = AppleLive.available(helper);
          voiceLog('apple.helper', { found: ok, path: helper });
          return ok ? new AppleLive(helper, voiceLog) : null;
        },
      ],
      emit: (event) => {
        if (event.type === 'status') voiceLog('status.emit', { ...event });
        for (const win of windowsRef?.all() ?? [])
          if (!win.isDestroyed()) win.webContents.send(IPC.voiceEvent, event);
      },
    });
    // PCM arrives ~4×/s; log the FIRST chunk and then one summary line every 10 s, not every chunk.
    let pcmBytes = 0;
    let pcmChunks = 0;
    let pcmLoggedAt = 0;
    let pcmPeak = 0; // loudest sample since the last pcm.flow line, 0..1 — 0.000 means a silent mic
    ipcMain.on(IPC.voicePcm, (_event, pcm: unknown) => {
      let bytes: Uint8Array | null = null;
      if (pcm instanceof ArrayBuffer) bytes = new Uint8Array(pcm);
      else if (ArrayBuffer.isView(pcm)) bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
      if (!bytes) {
        voiceLog('pcm.rejected', { type: Object.prototype.toString.call(pcm) });
        return;
      }
      pcmBytes += bytes.byteLength;
      pcmChunks++;
      const samples = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength >> 1);
      for (let i = 0; i < samples.length; i += 8) pcmPeak = Math.max(pcmPeak, Math.abs(samples[i]!) / 0x7fff);
      const now = Date.now();
      if (pcmChunks === 1 || now - pcmLoggedAt >= 10_000) {
        pcmLoggedAt = now;
        voiceLog('pcm.flow', {
          chunks: pcmChunks,
          bytes: pcmBytes,
          audioMs: Math.round(pcmBytes / 32),
          peak: Number(pcmPeak.toFixed(3)),
        });
        pcmPeak = 0;
      }
      voice.push(bytes);
    });
    ipcMain.on(IPC.voiceLog, (_event, entry: unknown) => {
      const e = entry as { event?: unknown; detail?: unknown } | null;
      if (!e || typeof e.event !== 'string') return;
      const detail = e.detail && typeof e.detail === 'object' ? (e.detail as Record<string, unknown>) : {};
      voiceLog(`ui.${e.event}`, detail);
    });
    const voiceControl = createVoiceControl({
      session: {
        start: () => {
          pcmBytes = 0;
          pcmChunks = 0;
          voice.start();
        },
        stop: () => voice.stop(),
        reset: () => voice.reset(),
      },
      mic:
        process.platform === 'darwin'
          ? {
              status: () => systemPreferences.getMediaAccessStatus('microphone'),
              ask: () => systemPreferences.askForMediaAccess('microphone'),
            }
          : null,
      log: voiceLog,
    });
    ipc.register<VoiceControl, VoiceControlResult>({
      channel: IPC.voiceControl,
      handle: voiceControl,
    });
    app.on('will-quit', () => voice.stop());

    logger.info('capability surface registered on the IPC bridge');
  },

  async onReady({ windows, logger }) {
    // macOS re-runs onReady on `activate` (dock click with no window open).
    // Only the WINDOW is missing then. Re-running the rest built a second core
    // over the same store, re-resolved the launch context and tried to bind
    // 7111 again — which fails, so `control` went null while the OLD server
    // kept answering agents from the OLD core: the window and the agent on
    // two different cores (found 2026-09-22).
    windowsRef = windows;
    if (core) {
      openPrompter(windows);
      logger.info('prompter window reopened');
      return;
    }

    const userData = app.getPath('userData');
    pressLogDir = () => {
      const ctx = core?.openContext.get().context;
      return ctx ? join(projectDirOf(ctx), 'teletubby', 'press-logs') : join(userData, 'press-logs');
    };

    // The generated set is the SEED, not the live copy. Seeding never
    // overwrites — an agent's trigger set written yesterday survives today's
    // build, which would not be true if the bundle were the source of truth.
    const repository = new FileRepository(join(userData, 'teletubby.json'));
    core = createCore({
      lifecycle: lifecycleHooks(windows),
      repository,
      auditSink: (entry) =>
        logger.info(
          {
            principal: entry.principal,
            capability: entry.capability,
            ok: entry.ok,
            errorCode: entry.errorCode,
            dryRun: entry.dryRun,
          },
          'capability',
        ),
    });

    // Push a change to every open window, so an agent authoring a trigger set
    // through the control API shows up in front of the talent without a
    // restart. The renderer decides what to do with it; main just relays.
    core.onChange((event) => {
      for (const win of windows.all()) {
        if (!win.isDestroyed()) win.webContents.send(IPC.controlChanged, event);
      }
    });

    const seeded = await seed(repository, [KYBERNESIS_PHASE_1], TALENTS);
    if (seeded.setsAdded.length > 0 || seeded.talentsAdded.length > 0)
      logger.info(seeded, 'seeded store');

    // Door 2 (open-contract §3.1, C1): the SAME helper `context_select` (door
    // 3) uses, so launch and a later switch resolve identically. Missing or
    // unresolvable is reported, never a crash — the window still opens and the
    // person picks a set the way they do today (spec §11 #7).
    const openArgs = parseOpenArgs(process.argv, process.env);
    const contextReport = await core.invoke('context_select', openArgs.context, {
      principal: 'agent',
    });
    logger.info(contextReport, 'open context resolved at startup');

    try {
      control = await startControlServer({
        core,
        userDataPath: userData,
        appVersion: app.getVersion(),
        log: (message, detail) => logger.info({ detail }, message),
      });
    } catch (error) {
      // The window still opens. A prompter that cannot be driven by an agent is
      // degraded; a prompter that will not start is useless, and the talent may
      // be about to record.
      control = null;
      logger.error({ error }, 'control surface failed to start — the app is UI-only this session');
    }

    openPrompter(windows);
    logger.info('prompter window opened');
  },
});

desktop.lifecycle.onStop(async () => {
  await control?.close();
  control = null;
});

/**
 * ⌘Q and `system_quit` land here, and on macOS nothing else runs the stop
 * hooks — which is how a control.json naming a dead pid was left behind.
 * Hold the quit once, stop cleanly (the control file is removed), then let it
 * go. `lifecycle.stop()` is memoised, so a signal-driven stop racing this one
 * is harmless.
 */
let stopping = false;
app.on('will-quit', (event) => {
  if (stopping) return;
  stopping = true;
  event.preventDefault();
  void desktop.lifecycle.stop().finally(() => app.quit());
});

void desktop.start();
