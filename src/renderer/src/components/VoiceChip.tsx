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
        onClick={() => useVoice.getState().toggle()}
        title={note ?? 'Voice follow — the prompter steps forward as you read (V). ↓/↑ always win.'}
      >
        Voice {on ? 'on' : 'off'}
      </Chip>
      {on && word && (
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
