/**
 * SCRIPTS ON DEMAND (B585, ADR-004) — a plain-text script handed over by an
 * AI conversation becomes one small named script in the open project.
 *
 * "Teletubby should be tied to a video project, but not tied to one script."
 * David talks to an AI over whichever transcript he picks, gets a title, an
 * intro, a CTA, and re-records each one here. So a project holds MANY small
 * named scripts, each optionally tagged with the D15 video it is for.
 *
 * ⚠️ Teletubby never writes the words. Paragraphs are the caller's text split
 * on blank lines, verbatim. Trigger words are the caller's too, bound to a
 * paragraph by the caller's own 1-based number — an authored map, never a
 * positional guess (rule 3). No triggers → the script is stored and listed,
 * and column 2 says plainly that nobody has authored them.
 *
 * Pure: no I/O, so the shape rules are testable without a project on disk.
 */

import type { Paragraph, Script, ScriptSet, TriggerSet, TriggerStyle } from '@shared/domain';

export interface TextScriptInput {
  /** Script id; defaults to the slug of `name`. */
  id?: string;
  name: string;
  text: string;
  video?: string | null;
  takeaway?: string;
  source?: string;
  triggers?: {
    style: TriggerStyle;
    items: { text: string; paragraph: number }[];
  };
}

/** The one on-demand set per project. Its id is derived, so there is only ever one. */
export const onDemandSetId = (project: string): string => `${project}-scripts`;

/** `"Intro — take 2!"` → `intro-take-2`. Empty when nothing sluggable is left. */
export const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Blank-line-separated paragraphs, trimmed, verbatim otherwise. */
export const paragraphsOfText = (text: string): string[] =>
  text
    .split(/\r?\n\s*\r?\n/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

/**
 * Build the Script. Returns a problem string instead of throwing, so the
 * handler owns the error vocabulary.
 */
export function scriptFromText(
  input: TextScriptInput,
  n: number,
): { script: Script } | { problem: string } {
  const id = input.id ?? slugOf(input.name);
  if (!id) return { problem: `name "${input.name}" has nothing to make an id from — pass an id` };

  const texts = paragraphsOfText(input.text);
  if (texts.length === 0) return { problem: 'text has no paragraphs' };
  const paragraphs: Paragraph[] = texts.map((text, i) => ({ id: `p${i + 1}`, text }));

  const triggerSets: TriggerSet[] = [];
  if (input.triggers) {
    for (const item of input.triggers.items) {
      if (item.paragraph < 1 || item.paragraph > paragraphs.length)
        return {
          problem: `trigger "${item.text}" names paragraph ${item.paragraph}, but the text has ${paragraphs.length}`,
        };
    }
    triggerSets.push({
      style: input.triggers.style,
      authoredBy: 'agent',
      note: 'write_script — authored by the caller with the text',
      triggers: input.triggers.items.map((item, i) => ({
        id: `t${i + 1}`,
        text: item.text,
        paragraphId: `p${item.paragraph}`,
      })),
    });
  }

  const name = input.name.trim();
  return {
    script: {
      id,
      n,
      title: name,
      // Required by the schema, and Teletubby never invents one: the name is
      // the only honest default for a two-line intro.
      takeaway: input.takeaway?.trim() || name,
      summary: name,
      video: input.video ?? null,
      transcripts: [
        {
          id: 'text',
          kind: 'provenance',
          corpus: 'as-written',
          talentId: null,
          source: input.source?.trim() || 'write_script',
          topics: [
            {
              id: 'm1',
              heading: name,
              minors: [{ id: 'm1-n1', heading: name, paragraphs }],
            },
          ],
          triggerSets,
        },
      ],
    },
  };
}

/**
 * Put `script` into the project's on-demand set: a NEW id goes FIRST (newest
 * first is the picker's order), a known id is replaced IN PLACE — a re-take of
 * the intro must not jump it around the list. Numbers follow the order.
 */
export function upsertOnDemand(
  set: ScriptSet,
  script: Script,
): { set: ScriptSet; previous: Script | null } {
  const index = set.scripts.findIndex((candidate) => candidate.id === script.id);
  const previous = index >= 0 ? set.scripts[index]! : null;
  const scripts =
    index >= 0
      ? set.scripts.map((candidate, i) => (i === index ? script : candidate))
      : [script, ...set.scripts];
  return {
    set: { ...set, scripts: scripts.map((candidate, i) => ({ ...candidate, n: i + 1 })) },
    previous,
  };
}

export const emptyOnDemandSet = (project: string): ScriptSet => ({
  id: onDemandSetId(project),
  title: `${project} scripts`,
  description: 'Small named scripts written for this project on demand (write_script).',
  project,
  onDemand: true,
  scripts: [],
});
