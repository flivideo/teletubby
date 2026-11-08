import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { highlightTokens, type HighlightToken } from '../../../core/voice-highlight';
import type { MajorTopic, MinorTopic, Paragraph, Transcript } from '@shared/domain';
import { paragraphsOf } from '@shared/domain';
import { ZONE_LABEL, useProm, type Rank, type RecordingZone } from '../store';
import EndCard from './EndCard';

/**
 * THE ZONES — requirements §1.
 *
 * Each zone renders the same one position in the script from a different
 * altitude: where you are (major), what you are on (minor), what to say
 * (triggers), and the words themselves (paragraph). None of them holds a
 * cursor; they are all handed the current position by the store.
 *
 * **Ranking is not decided here.** A component may render `rank`; it may not
 * work out which zone is driven — that is the store's job, and keeping it there
 * is what makes "never two strong markers" testable without a DOM.
 */

const markerBar = (rank: Rank, active: boolean): string => {
  if (!active) return 'border-l-2 border-transparent';
  return rank === 'driven'
    ? 'border-l-4 border-driven bg-driven-wash'
    : 'border-l-4 border-follower bg-follower-wash';
};

/**
 * Holds the active row at the READING LINE — a fixed height on screen, with the
 * script moving up underneath it.
 *
 * It used to scroll to centre, which is why Jan could see David reading: on a
 * 32" screen the whole script fits, so his eyes tracked down the page instead
 * of the page coming to him (B437). `block: 'start'` plus the container's
 * `scroll-padding-top` puts the beat at the line with two or three said lines
 * above it. See .tt-lane-scroll in index.css.
 */
function useReadingLine(active: boolean, deps: unknown[], contentSeq = 0) {
  const ref = useRef<HTMLLIElement | null>(null);
  const seatedFor = useRef(contentSeq);
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const row = ref.current;
    // Words changing under the talent re-seat the row with no glide; only a move of theirs eases.
    const instant = seatedFor.current !== contentSeq;
    seatedFor.current = contentSeq;
    /*
     * ⚠️ ONE FRAME LATE, ON PURPOSE.
     *
     * `scrollIntoView` reads `scroll-padding-top`, which IS the reading line —
     * and the reclaimed state moves it (26vh -> 0.5rem). The state is published
     * as a root data attribute from an effect in `Stage`, and React runs CHILD
     * effects before parent ones, so scrolling straight away would use the OLD
     * line and leave the live beat half off the top. That is exactly what it
     * did. An animation frame lands after the attribute is on the element and
     * after layout, so the row seats against the line that is actually current.
     */
    const frame = requestAnimationFrame(() =>
      row.scrollIntoView({ block: 'start', ...(instant ? { behavior: 'instant' as const } : {}) }),
    );
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, contentSeq]);
  return ref;
}

function ZoneShell({
  zone,
  rank,
  children,
}: {
  zone: RecordingZone;
  rank: Rank;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section
      aria-label={ZONE_LABEL[zone]}
      data-zone={zone}
      data-rank={rank}
      className={[
        'flex h-full w-full flex-col',
        rank === 'driven' ? 'bg-canvas' : 'bg-lane-alt',
      ].join(' ')}
    >
      {/* The scroll container is THIS div, not the section, so the label below
          stays pinned while the list moves under the reading line. `.tt-lane-pad`
          is the hook the reclaimed state collapses — see index.css. */}
      <div className="tt-lane-scroll tt-lane-pad min-h-0 flex-1 px-6 py-6">{children}</div>

      {/* THE ZONE LABEL IS AT THE FOOT OF THE LANE, and it is never hidden.

          It used to sit at the top and be collapsed by the reclaimed state,
          because up there it was 0.65rem of text between the lens and the first
          word. Then David reviewed a script with four lanes on screen and could
          not tell which was which: "you can't tell, there's no heading, and I
          don't want the heading at the top because I need the top to be very
          thin. That's why I thought it could be at the bottom" (2026-08-30).

          Nobody's eyes travel BELOW the script on the way to a lens above it, so
          down here it costs nothing — which is also why it no longer needs to
          hide under D. The reclaimed screenshot he sent is exactly the state
          where the labels had vanished. Same reasoning that moved the control
          strip to the footer. */}
      <p className="flex shrink-0 items-center gap-2 border-t border-edge px-6 py-1.5 font-display text-xs uppercase tracking-[0.2em] text-muted">
        {ZONE_LABEL[zone]}
        {/* The driven zone says so in words as well as colour — a marker you
            have to decode is a thing to learn, which the Star's test forbids. */}
        {rank === 'driven' && (
          <span className="rounded-sm bg-driven px-1.5 py-0.5 text-[0.6rem] text-ink">driving</span>
        )}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Major topic — where you are in the script
 * ------------------------------------------------------------------ */

export function MajorZone({
  transcript,
  current,
  rank,
  focus,
}: {
  transcript: Transcript;
  current: MajorTopic | undefined;
  rank: Rank;
  focus: boolean;
}): JSX.Element {
  return (
    <ZoneShell zone="major" rank={rank}>
      <ol className="tt-reading-list space-y-1">
        {transcript.topics.map((major, i) => {
          const active = major.id === current?.id;
          return (
            <Row key={major.id} active={active} dep={current?.id} rank={rank} focus={focus}>
              <span className="mr-2 font-mono text-[0.7rem] text-sequence">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={[
                  'font-display text-bullet uppercase tracking-wide',
                  active ? 'text-ink' : 'text-muted',
                ].join(' ')}
              >
                {major.heading}
              </span>
            </Row>
          );
        })}
      </ol>
    </ZoneShell>
  );
}

/* ------------------------------------------------------------------ *
 * Minor topic — the sub-point under it
 * ------------------------------------------------------------------ */

export function MinorZone({
  transcript,
  current,
  rank,
  focus,
}: {
  transcript: Transcript;
  current: MinorTopic | undefined;
  rank: Rank;
  focus: boolean;
}): JSX.Element {
  const minors = transcript.topics.flatMap((major) => major.minors);
  return (
    <ZoneShell zone="minor" rank={rank}>
      <ol className="tt-reading-list space-y-1">
        {minors.map((minor, i) => (
          <Row
            key={minor.id}
            active={minor.id === current?.id}
            dep={current?.id}
            rank={rank}
            focus={focus}
          >
            <span className="mr-2 font-mono text-[0.7rem] text-sequence">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={[
                'font-display text-topic uppercase tracking-wide',
                minor.id === current?.id ? 'text-ink' : 'text-muted',
              ].join(' ')}
            >
              {minor.heading}
            </span>
          </Row>
        ))}
      </ol>
    </ZoneShell>
  );
}

/* ------------------------------------------------------------------ *
 * Triggers — the product. Glance, don't read.
 * ------------------------------------------------------------------ */

export function TriggerZone({
  triggers,
  step,
  rank,
  focus,
}: {
  triggers: { text: string; paragraphId: string }[];
  step: number;
  rank: Rank;
  focus: boolean;
}): JSX.Element {
  const last = triggers.length - 1;

  return (
    <ZoneShell zone="triggers" rank={rank}>
      {triggers.length === 0 ? (
        // Never invent one. Say plainly that nobody has authored them, so the
        // talent knows this is a gap in the data rather than a broken app.
        <p className="rounded border border-edge bg-card px-4 py-3 font-body text-script text-muted">
          No trigger words authored for this transcript yet. Pick another corpus, or have an agent
          write a set through the control API.
        </p>
      ) : (
        <ol className="tt-reading-list space-y-2">
          {triggers.map((trigger, i) => (
            <Row
              key={i}
              active={i === step}
              dep={step}
              rank={rank}
              focus={focus}
              opacity={focus ? 'opacity-25' : 'opacity-55'}
            >
              <span
                className={[
                  'text-bullet leading-snug',
                  // Hook and landing lines are display type — the middle points
                  // are what you actually glance at mid-sentence.
                  i === 0 || i === last
                    ? 'font-display font-semibold uppercase tracking-wide text-ink'
                    : 'font-body text-ink',
                ].join(' ')}
              >
                {i !== 0 && i !== last && <span className="mr-3 text-follower">▪</span>}
                {trigger.text}
              </span>
            </Row>
          ))}
        </ol>
      )}
      <EndCard />
    </ZoneShell>
  );
}

/* ------------------------------------------------------------------ *
 * Paragraph — the transcript for the beat you are on, and only that
 * ------------------------------------------------------------------ */

/**
 * Voice-follow's view of the paragraph on screen. `null` = voice off: the zone renders exactly
 * as it always has. `word` is the aligner's next-unsaid word in THIS paragraph, or null when the
 * cursor is somewhere else (e.g. driving Major, a step can span paragraphs and the one shown is
 * not the one being read) — then nothing is tinted, only the cues are dimmed.
 */
export interface ParagraphVoice {
  word: number | null;
  /** Bumps on a manual re-anchor: the in-beat scroll may then go back. */
  anchorSeq: number;
}

/** Said words recede; the one current word gets a quiet underline in the driven colour. States snap. */
const WORD_CLASS = {
  said: 'opacity-40',
  current: 'underline decoration-ink decoration-2 underline-offset-4',
  unsaid: '',
} as const;

function VoiceWords({
  tokens,
  currentRef,
}: {
  tokens: HighlightToken[];
  currentRef: React.MutableRefObject<HTMLSpanElement | null>;
}): JSX.Element {
  return (
    <>
      {tokens.map((t, i) => {
        if (t.kind === 'gap') return <span key={i}>{t.text}</span>;
        // A direction, not a word to say: italic, dim, always — and never current.
        if (t.kind === 'cue')
          return (
            <span key={i} className="italic text-muted opacity-60" data-cue="">
              {t.text}
            </span>
          );
        return (
          <span key={i} className={t.state === 'said' ? WORD_CLASS.said : undefined} data-word={t.state}>
            {t.lead}
            <span
              ref={t.state === 'current' ? currentRef : undefined}
              className={t.state === 'current' ? WORD_CLASS.current : undefined}
            >
              {t.core}
            </span>
            {t.trail}
          </span>
        );
      })}
    </>
  );
}

/** ~0.5 s ease for the in-beat scroll — the only thing on this zone that animates. */
const SCROLL_MS = 500;
const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Keep the current word's LINE in view when the paragraph is taller than the lane: once per new
 * line (never per word), forward only unless a manual press re-anchored, eased, and only the
 * lane's scrollTop — never the lane weights. Seats the line at the reading line (rule 7).
 */
function useWordLine(
  voice: ParagraphVoice | null,
  paragraphId: string | undefined,
  beatRef: React.RefObject<HTMLDivElement>,
  currentRef: React.MutableRefObject<HTMLSpanElement | null>,
): void {
  const on = voice !== null;
  const word = voice?.word ?? null;
  const anchorSeq = voice?.anchorSeq ?? 0;
  const lastLine = useRef<number | null>(null);
  const seq = useRef<number | null>(null);
  const shownId = useRef<string | undefined>(undefined);
  const anim = useRef<number | null>(null);

  // A new beat on stage starts at its top (voice on only — voice off is untouched).
  useLayoutEffect(() => {
    if (!on || shownId.current === paragraphId) return;
    shownId.current = paragraphId;
    lastLine.current = null;
    const scroller = beatRef.current?.closest('.tt-lane-scroll') as HTMLElement | null;
    if (scroller) scroller.scrollTop = 0;
  }, [on, paragraphId, beatRef]);

  useEffect(() => {
    if (!on) return;
    const beat = beatRef.current;
    const word = currentRef.current;
    const scroller = beat?.closest('.tt-lane-scroll') as HTMLElement | null;
    const reanchored = seq.current !== null && seq.current !== anchorSeq;
    seq.current = anchorSeq;
    if (reanchored) lastLine.current = null;
    if (!beat || !scroller) return;
    // The line to hold: the current word's, or the top of the beat after a re-anchor with no word.
    const lineTop = word
      ? word.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
      : null;
    if (lineTop === null) return;
    const prev = lastLine.current;
    if (prev !== null && Math.abs(lineTop - prev) < 2) return; // same line: the page stays still
    if (prev !== null && lineTop < prev && !reanchored) return; // forward only
    lastLine.current = lineTop;
    if (beat.offsetHeight <= scroller.clientHeight) return; // it fits: nothing to keep in view
    const line = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0;
    const max = scroller.scrollHeight - scroller.clientHeight;
    const target = Math.max(0, Math.min(max, lineTop - line));
    const from = scroller.scrollTop;
    if (target === from || (target < from && !reanchored)) return;
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    const t0 = performance.now();
    const step = (t: number): void => {
      const k = Math.min(1, (t - t0) / SCROLL_MS);
      scroller.scrollTop = from + (target - from) * ease(k);
      anim.current = k < 1 ? requestAnimationFrame(step) : null;
    };
    anim.current = requestAnimationFrame(step);
  }, [on, word, anchorSeq, paragraphId, beatRef, currentRef]);

  useEffect(
    () => () => {
      if (anim.current !== null) cancelAnimationFrame(anim.current);
    },
    [],
  );
}

export function ParagraphZone({
  paragraph,
  next,
  rank,
  voice = null,
}: {
  paragraph: Paragraph | undefined;
  next: Paragraph | undefined;
  rank: Rank;
  voice?: ParagraphVoice | null;
}): JSX.Element {
  const beatRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLSpanElement | null>(null);
  const word = voice?.word ?? null;
  const tokens = useMemo(
    () => (voice && paragraph ? highlightTokens(paragraph.text, word) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [voice !== null, paragraph?.text, word],
  );
  if (!tokens) currentRef.current = null;
  useWordLine(voice, paragraph?.id, beatRef, currentRef);
  return (
    <ZoneShell zone="paragraph" rank={rank}>
      {/*
        THE DRIVEN-BEAT HIGHLIGHT — and note `markerBar(rank, true)`.

        In every other zone the wash marks ONE ROW of a list, so it is the width
        of the marker's claim: "of these, you are on this one." Here there is no
        list — the zone renders exactly one paragraph — so `active` is hardcoded
        true and the wash paints the whole zone. On script 01 beat 11 that was a
        516px slab, 66% of the stage height, measured.

        Why THAT beat: paragraph 3 is the long one in BOTH corpora — 375 chars
        in v01-rewrite against a 212 mean, and 338 in tom-original, so switching
        corpus does not shrink it. The text is verbatim and stays verbatim; the
        height is a rhythm problem and is fixed here, not in the words.

        `leading-snug` rather than `leading-relaxed` is the lever, and it is not
        a new invention — it is what the trigger rows already use. At the stage
        preset it takes the line box from 45px to 38px, which on an 11-line
        paragraph is 77px off the slab.
      */}
      <div
        ref={beatRef}
        data-testid="live-paragraph"
        data-paragraph-id={paragraph?.id}
        className={['tt-beat rounded-r px-4 py-1.5', markerBar(rank, true)].join(' ')}
      >
        {/* One paragraph, not a scrolling wall. This was the configuration that
            actually worked on camera — Jan, watching David's eyes: "the eyes is
            fixed just on the camera" (B437). With voice on, the same text as
            word spans: said recedes, the one current word is underlined. */}
        <p className="font-body text-script leading-snug text-ink">
          {tokens ? <VoiceWords tokens={tokens} currentRef={currentRef} /> : (paragraph?.text ?? '—')}
        </p>
      </div>

      {/*
        A PEEK at what is coming, and deliberately only below — "with the
        paragraph one I only want to see below" (B437).

        Kept faint and clipped on purpose. David asked to know a second
        paragraph was coming; he did NOT ask for a second paragraph to read, and
        the two-paragraph take is the one Jan liked least. This is a hint that
        something follows, not more script.
      */}
      {next && (
        <div className="mt-4 max-h-24 overflow-hidden border-l-2 border-transparent px-4">
          <p className="tt-zone-label font-display text-[0.6rem] uppercase tracking-[0.2em] text-muted">
            Next
          </p>
          <p className="mt-1 font-body text-script leading-relaxed text-muted opacity-45">
            {next.text}
          </p>
        </div>
      )}
    </ZoneShell>
  );
}

/* ------------------------------------------------------------------ *
 * The full transcript — a skim surface, and an OVERLAY
 * ------------------------------------------------------------------ */

/**
 * requirements open item 1 asks whether this overlays the recording set or
 * displaces it. It overlays, and that is derived rather than chosen: §2 says
 * the driven zone must sit nearest the lens, and displacing the columns to make
 * room would push it away from the lens the moment the talent went looking for
 * their place. Overlaying leaves the arrangement exactly where it was.
 */
export function TranscriptDrawer({
  transcript,
  currentParagraphId,
  edge,
  open,
  onClose,
}: {
  transcript: Transcript;
  currentParagraphId: string | null;
  edge: 'left' | 'right';
  open: boolean;
  onClose: () => void;
}): JSX.Element | null {
  if (!open) return null;
  const paragraphs = paragraphsOf(transcript);

  return (
    <div className="absolute inset-0 z-20 flex" onClick={onClose} role="presentation">
      <div
        className={[
          'tt-lane-scroll h-full w-[46%] border-edge bg-panel px-7 py-6 shadow-xl',
          edge === 'left' ? 'order-first border-r' : 'order-last ml-auto border-l',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <p className="mb-4 flex items-baseline gap-3 font-display text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Full transcript
          <span className="font-mono normal-case tracking-normal">
            {transcript.variant?.label ?? transcript.corpus}
          </span>
          <span className="ml-auto font-mono text-[0.65rem] normal-case tracking-normal">
            T to close
          </span>
        </p>
        <ol className="tt-reading-list space-y-3">
          {paragraphs.map((paragraph, i) => (
            <Row
              key={paragraph.id}
              active={paragraph.id === currentParagraphId}
              dep={currentParagraphId}
              // Always the quiet marker. This is where you are LOOKING, never
              // what you are driving — the driven zone keeps the strong one.
              rank="follower"
              focus={false}
            >
              <span className="mr-3 font-mono text-[0.7rem] text-sequence">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-body text-script leading-relaxed text-ink">
                {paragraph.text}
              </span>
            </Row>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Row({
  active,
  dep,
  rank,
  focus,
  opacity,
  children,
}: {
  active: boolean;
  dep: unknown;
  rank: Rank;
  focus: boolean;
  opacity?: string;
  children: React.ReactNode;
}): JSX.Element {
  // `focus` is in the deps because it IS the reclaimed state, and reclaiming
  // MOVES the reading line (26vh -> 0.5rem). Without it the lane keeps the
  // scroll offset it had before the toggle, so the live beat lands wherever the
  // old line used to be — half off the top, in the case that caught this.
  const contentSeq = useProm((s) => s.contentSeq);
  const ref = useReadingLine(active, [dep, focus], contentSeq);
  return (
    <li ref={ref}>
      <div
        data-testid={active ? 'live-row' : undefined}
        className={[
          'rounded-r px-4 py-2 transition-all duration-150',
          markerBar(rank, active),
          active ? 'opacity-100' : (opacity ?? (focus ? 'opacity-25' : 'opacity-60')),
        ].join(' ')}
      >
        {children}
      </div>
    </li>
  );
}
