/**
 * `fli.tubby.json` — THE PROJECT'S OWN COPY of its script sets (W6, roadmap
 * §1.1 D1, §1.3 Teletubby row).
 *
 * The relationship this file implements: the app store
 * (`userData/teletubby.json`) is the index and the home of everything that is
 * NOT a project's — talents, rigs, the workspace. A `fli.tubby.json` inside a
 * project is the source of truth for THAT project's own sets. A set only ever
 * lives in one or the other for a given read: see `mergeProjectSets` in
 * `handlers.ts`, which treats the project file's copy as current and the
 * store's same-id copy as stale, never showing both.
 *
 * Talent profiles and rigs are never written here — they stay in the app
 * store, always (roadmap §1.3: "talent profiles and rigs stay in Teletubby's
 * own app store").
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { atomicWrite, z } from '@appydave/core';
import { appFileName } from '@flivideo/core';
import { scriptSetSchema } from '@shared/domain-schema';
import type { ScriptSet } from '@shared/domain';
import { fail } from './safety.js';

/** `fli.tubby.json` — naming scheme D (roadmap §1.1), via the shared library's own builder. */
export const PROJECT_FILE_NAME: string = appFileName({ app: 'tubby' });

export function projectFilePath(projectDir: string): string {
  return path.join(projectDir, PROJECT_FILE_NAME);
}

const projectFileSchema = z.object({
  schema: z.literal(1),
  project: z.string().min(1),
  sets: z.array(scriptSetSchema),
});

/**
 * Read a project's own sets. Absent file → `[]`, the ordinary state for a
 * project nothing has been exported to yet — never a failure. A file that
 * EXISTS but will not parse is a capability failure, not a silent empty
 * result: the talent's own edits may live there, and a corrupt file must
 * never look identical to "nothing exported yet" (R12-style: empty ≠ unreadable).
 */
export async function readProjectSets(projectDir: string): Promise<ScriptSet[]> {
  const file = projectFilePath(projectDir);
  let raw: string;
  try {
    raw = await fs.readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    fail('internal', `could not read "${file}": ${(error as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail('internal', `"${file}" is not valid JSON: ${(error as Error).message}`);
  }

  const result = projectFileSchema.safeParse(parsed);
  if (!result.success)
    fail('internal', `"${file}" does not match the fli.tubby.json shape`, {
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  return (result as { success: true; data: z.infer<typeof projectFileSchema> }).data.sets;
}

/**
 * One promise queue per project directory (W6 fix M3). Every read-modify-write
 * of a `fli.tubby.json` runs inside it, re-reading the file INSIDE, so two
 * concurrent edits (the UI and an agent) can never both start from the same
 * old file and have the last write silently win.
 *
 * Lock order is always project queue → store queue (the repository's own), so
 * the two can never wait on each other.
 */
const projectQueues = new Map<string, Promise<unknown>>();

export function withProjectLock<T>(projectDir: string, fn: () => Promise<T>): Promise<T> {
  const key = path.resolve(projectDir);
  const run = (projectQueues.get(key) ?? Promise.resolve()).then(fn);
  const settled = run.catch(() => undefined);
  projectQueues.set(key, settled);
  // Drop the entry once nothing is queued behind this run, so the map does not
  // grow with every project a long session has touched.
  void settled.then(() => {
    if (projectQueues.get(key) === settled) projectQueues.delete(key);
  });
  return run;
}

export interface UnreadableProjectFile {
  file: string;
  message: string;
}

/**
 * `readProjectSets`, but a file that exists and cannot be used is REPORTED
 * rather than thrown — so a read can still answer for every set the file does
 * not own, and say what it could not read (W6 fix M2). Absent is still `[]`
 * with nothing reported: absent and unreadable must never look alike.
 */
export async function readProjectSetsReport(
  projectDir: string,
): Promise<{ sets: ScriptSet[]; unreadable: UnreadableProjectFile | null }> {
  try {
    return { sets: await readProjectSets(projectDir), unreadable: null };
  } catch (error) {
    return {
      sets: [],
      unreadable: { file: projectFilePath(projectDir), message: (error as Error).message },
    };
  }
}

/** Atomic write of the project's own sets — the whole file, always rewritten in full. */
export async function writeProjectSets(
  projectDir: string,
  project: string,
  sets: ScriptSet[],
): Promise<void> {
  const file = projectFilePath(projectDir);
  const content = `${JSON.stringify({ schema: 1, project, sets }, null, 2)}\n`;
  await atomicWrite(file, content);
}
