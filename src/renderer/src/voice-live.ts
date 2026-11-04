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
  toggle: () => void;
}

/** "Following" = the aligner confirmed progress recently; otherwise listening and waiting. */
const FOLLOW_WINDOW_MS = 8000;

export const useVoice = create<VoiceStore>((set, get) => ({
  on: false,
  state: 'off',
  engine: null,
  note: null,
  toggle: () => set({ on: !get().on }),
}));

let mic: { stop: () => void } | null = null;

async function startMic(send: (pcm: ArrayBuffer) => void): Promise<{ stop: () => void }> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false },
  });
  const ctx = new AudioContext({ sampleRate: 16000 });
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
    if (!useVoice.getState().on) return;
    if (event.type === 'status') {
      if (event.state === 'listening') setStatus('waiting', event.engine);
      else if (event.state === 'fallback')
        setStatus('waiting', event.engine, `${event.engine} failed — switching to fallback`);
      else if (event.state === 'error') setStatus('error', null, event.error ?? 'voice unavailable');
      return;
    }
    const d = ensureDriver();
    if (!d) return;
    const r = d.hear(event.text);
    if (r.advanced && r.paragraphId) {
      selfMove = true;
      try {
        if (useProm.getState().voiceAdvance(r.paragraphId)) lastAdvanceAt = Date.now();
      } finally {
        selfMove = false;
      }
    }
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
    void api.voiceControl({ action: 'reset' });
  });

  const offToggle = useVoice.subscribe((v, prev) => {
    if (v.on === prev.on) return;
    if (v.on) {
      setStatus('starting', null);
      void (async () => {
        try {
          const started = await api.voiceControl({ action: 'start' });
          if (!started.ok) throw new Error(started.error ?? 'could not start');
          mic = await startMic((pcm) => api.sendVoicePcm(pcm));
          ensureDriver();
        } catch (e) {
          useVoice.setState({ on: false });
          setStatus('error', null, e instanceof Error ? e.message : String(e));
        }
      })();
    } else {
      mic?.stop();
      mic = null;
      driver = null;
      void api.voiceControl({ action: 'stop' });
      setStatus('off', null);
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
