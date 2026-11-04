/**
 * Voice-follow, renderer side. OFF by default. When on: mic → 16 kHz PCM → main (Groq, Apple
 * fallback) → text back → the aligner → the prompter steps FORWARD. Any other move of the
 * position (a ↓/↑ press, a jump, a script change) re-anchors the aligner there and tells main to
 * forget the audio so far, so a manual press always wins.
 */
import { create } from 'zustand';
import { createVoiceDriver, type VoiceDriver } from '../../core/voice-driver';
import { paragraphsOf } from '@shared/domain';
import type { VoiceEngine, VoiceEvent } from '@shared/voice';
import { activeTriggers, currentTranscript, useProm } from './store';

export type VoiceState = 'off' | 'starting' | 'following' | 'waiting' | 'error';

interface VoiceStore {
  on: boolean;
  state: VoiceState;
  engine: VoiceEngine | null;
  note: string | null;
  /** `source` is only for the log: which hand flipped it (the V key or the chip). */
  toggle: (source?: 'key' | 'chip') => void;
}

/** "Following" = the aligner confirmed progress recently; otherwise listening and waiting. */
const FOLLOW_WINDOW_MS = 8000;

export const useVoice = create<VoiceStore>((set, get) => ({
  on: false,
  state: 'off',
  engine: null,
  note: null,
  toggle: (source) => {
    const on = !get().on;
    vlog('toggle', { source: source ?? 'unknown', on });
    set({ on });
  },
}));

/** One voice-path line into main's `.logs/app.log`. Never throws — logging must not reach the talent. */
function vlog(event: string, detail?: Record<string, unknown>): void {
  try {
    window.appytron?.logVoice?.(event, detail);
  } catch {
    /* ignore */
  }
}

const describeError = (e: unknown): string =>
  e instanceof Error ? (e.name && e.name !== 'Error' ? `${e.name}: ${e.message}` : e.message) : String(e);

let mic: { stop: () => void } | null = null;

async function startMic(send: (pcm: ArrayBuffer) => void): Promise<{ stop: () => void }> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false },
    });
  } catch (e) {
    vlog('mic.getUserMedia.failed', { error: describeError(e) });
    throw new Error(`microphone: ${describeError(e)}`);
  }
  const track = stream.getAudioTracks()[0];
  vlog('mic.getUserMedia.ok', { device: track?.label ?? null, sampleRate: track?.getSettings().sampleRate ?? null });
  const ctx = new AudioContext({ sampleRate: 16000 });
  // An AudioContext can come up 'suspended' (no user gesture); then onaudioprocess never fires.
  if (ctx.state !== 'running') {
    vlog('mic.audioContext', { state: ctx.state, action: 'resume' });
    await ctx.resume().catch((e: unknown) => vlog('mic.audioContext.resumeFailed', { error: describeError(e) }));
  }
  vlog('mic.audioContext', { state: ctx.state, sampleRate: ctx.sampleRate });
  const source = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const mute = ctx.createGain();
  mute.gain.value = 0;
  node.onaudioprocess = (e) => {
    const f = e.inputBuffer.getChannelData(0);
    const out = new Int16Array(f.length);
    for (let i = 0; i < f.length; i++) out[i] = Math.max(-1, Math.min(1, f[i]!)) * 0x7fff;
    send(out.buffer);
  };
  source.connect(node);
  node.connect(mute);
  mute.connect(ctx.destination);
  return {
    stop: () => {
      node.onaudioprocess = null;
      source.disconnect();
      node.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}

export function attachVoiceFollow(): () => void {
  const api = window.appytron;
  let driver: VoiceDriver | null = null;
  let driverKey = '';
  let selfMove = false;
  let lastAdvanceAt = 0;
  let startFailed = false;

  const paragraphAtStep = (): string | null => {
    const s = useProm.getState();
    return activeTriggers(s)[s.step]?.paragraphId ?? null;
  };

  const ensureDriver = (): VoiceDriver | null => {
    const s = useProm.getState();
    const t = currentTranscript(s);
    if (!t) return null;
    const key = `${s.scriptId}|${t.id}`;
    if (!driver || key !== driverKey) {
      driver = createVoiceDriver(
        paragraphsOf(t).map((p) => ({ id: p.id, text: p.text })),
        paragraphAtStep(),
      );
      driverKey = key;
    }
    return driver;
  };

  const setStatus = (state: VoiceState, engine?: VoiceEngine | null, note?: string | null): void =>
    useVoice.setState((v) => ({ state, engine: engine === undefined ? v.engine : engine, note: note ?? null }));

  const offVoice = api.onVoiceEvent((event: VoiceEvent) => {
    if (!useVoice.getState().on) {
      if (event.type === 'status' && event.state !== 'off') vlog('event.ignored', { reason: 'voice off', state: event.state });
      return;
    }
    if (event.type === 'status') {
      if (event.state === 'listening') setStatus('waiting', event.engine);
      else if (event.state === 'fallback')
        setStatus('waiting', event.engine, `${event.engine} failed — switching to fallback`);
      else if (event.state === 'error') setStatus('error', null, event.error ?? 'voice unavailable');
      return;
    }
    const d = ensureDriver();
    if (!d) {
      vlog('aligner.noScript', { chars: event.text.length });
      setStatus('error', event.engine, 'no transcript open — voice has nothing to follow');
      return;
    }
    const r = d.hear(event.text);
    let moved = false;
    if (r.advanced && r.paragraphId) {
      selfMove = true;
      try {
        moved = useProm.getState().voiceAdvance(r.paragraphId);
        if (moved) lastAdvanceAt = Date.now();
      } finally {
        selfMove = false;
      }
    }
    vlog('aligner.step', {
      engine: event.engine,
      chars: event.text.length,
      reason: r.reason,
      paragraphId: r.paragraphId,
      advanced: r.advanced,
      moved,
    });
    setStatus(Date.now() - lastAdvanceAt < FOLLOW_WINDOW_MS ? 'following' : 'waiting', event.engine);
  });

  // Any position change that is not ours is the talent's own hand: re-anchor, forget the audio.
  let lastStep = useProm.getState().step;
  let lastScript = useProm.getState().scriptId;
  const offStore = useProm.subscribe((s) => {
    const moved = s.step !== lastStep || s.scriptId !== lastScript;
    lastStep = s.step;
    lastScript = s.scriptId;
    if (!moved || selfMove || !useVoice.getState().on) return;
    driver = null; // rebuilt lazily from the new position
    ensureDriver();
    vlog('reanchor', { step: s.step, scriptId: s.scriptId });
    void api.voiceControl({ action: 'reset' });
  });

  const offToggle = useVoice.subscribe((v, prev) => {
    if (v.on === prev.on) return;
    if (v.on) {
      setStatus('starting', null);
      void (async () => {
        try {
          const started = await api.voiceControl({ action: 'start' });
          vlog('control.start.reply', { ...started });
          if (!started.ok) throw new Error(started.error ?? 'could not start');
          mic = await startMic((pcm) => api.sendVoicePcm(pcm));
          vlog('mic.started');
          if (!ensureDriver()) vlog('aligner.noScript', { at: 'start' });
        } catch (e) {
          const message = describeError(e);
          vlog('start.failed', { error: message });
          // Error BEFORE flipping off, and the chip shows error text even when off (VoiceChip).
          setStatus('error', null, message);
          startFailed = true;
          useVoice.setState({ on: false });
        }
      })();
    } else {
      mic?.stop();
      mic = null;
      driver = null;
      void api.voiceControl({ action: 'stop' });
      // Keep a start error visible after the flip to off; a deliberate off clears it.
      if (startFailed) startFailed = false;
      else setStatus('off', null);
    }
  });

  return () => {
    offVoice();
    offStore();
    offToggle();
    mic?.stop();
    mic = null;
    void api.voiceControl({ action: 'stop' });
  };
}
