/**
 * Where is the talent, after the words changed underneath them?
 *
 * Paragraph ids are positions (`p1..pN`, minted on every write), so after a new
 * version an id can name a different paragraph. The words are what the talent
 * was reading, so the words are the anchor.
 *
 * Pure, and renderer-safe: no node imports.
 */

interface Para {
  id: string;
  text: string;
}

const MIN_OVERLAP = 0.5;

const wordsOf = (text: string): string[] => text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];

/** Dice coefficient over word counts: 1 is the same words, 0 is none in common. */
export function wordOverlap(a: string, b: string): number {
  const left = wordsOf(a);
  const right = wordsOf(b);
  if (left.length === 0 || right.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const word of left) counts.set(word, (counts.get(word) ?? 0) + 1);
  let shared = 0;
  for (const word of right) {
    const left_ = counts.get(word) ?? 0;
    if (left_ > 0) {
      shared += 1;
      counts.set(word, left_ - 1);
    }
  }
  return (2 * shared) / (left.length + right.length);
}

/**
 * The paragraph in `after` that the talent's paragraph became, in order:
 * the same text (nearest the old place), else the best word overlap of at least
 * a half (nearest on a tie), else the same place, clamped. A deleted paragraph
 * therefore lands on the next thing to say.
 */
export function reanchorParagraph(before: Para[], id: string, after: Para[]): string | null {
  if (after.length === 0) return null;
  const at = Math.max(
    0,
    before.findIndex((paragraph) => paragraph.id === id),
  );
  const text = before[at]?.text ?? '';
  const distance = (index: number): number => Math.abs(index - at);

  let exact = -1;
  after.forEach((paragraph, index) => {
    if (paragraph.text === text && (exact < 0 || distance(index) < distance(exact))) exact = index;
  });
  if (exact >= 0) return after[exact]!.id;

  let best = -1;
  let bestScore = 0;
  after.forEach((paragraph, index) => {
    const score = wordOverlap(text, paragraph.text);
    if (score < MIN_OVERLAP) return;
    if (score > bestScore || (score === bestScore && distance(index) < distance(best))) {
      best = index;
      bestScore = score;
    }
  });
  if (best >= 0) return after[best]!.id;

  return after[Math.min(at, after.length - 1)]!.id;
}
