import { Chip } from './Controls';
import { useVoice } from '../voice-live';

/**
 * Voice-follow switch + a quiet state word. OFF by default. The word is deliberately small and
 * muted: it must be readable at a glance in rehearsal and ignorable on camera (north star).
 */
export function VoiceChip(): JSX.Element {
  const { on, state, engine, note } = useVoice();
  const word =
    state === 'following'
      ? 'following'
      : state === 'waiting'
        ? 'waiting'
        : state === 'starting'
          ? 'starting…'
          : state === 'error'
            ? 'error'
            : '';
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Chip
        on={on}
        onClick={() => useVoice.getState().toggle('chip')}
        title={note ?? 'Voice follow — the prompter steps forward as you read (V). ↓/↑ always win.'}
      >
        Voice {on ? 'on' : 'off'}
      </Chip>
      {state === 'error' && note ? (
        // An error is ALWAYS readable on the chip, even after it flipped back to off — a silent
        // failure here is what made "nothing happens" undiagnosable (2026-11-04).
        <span
          className="max-w-[28rem] truncate font-mono text-[0.65rem] font-semibold text-ink"
          title={note}
          data-testid="voice-state"
        >
          voice error: {note}
        </span>
      ) : on && word && (
        <span
          className="font-mono text-[0.65rem] text-muted"
          title={note ?? undefined}
          data-testid="voice-state"
        >
          {word}
          {engine ? ` · ${engine}` : ''}
        </span>
      )}
    </div>
  );
}
