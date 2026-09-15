/**
 * THE OPEN CONTEXT — which brand and project Teletubby is pointed at (W6,
 * FliVideo open-contract §3–§5).
 *
 * SESSION-SCOPED, NEVER PERSISTED (C2). This is the whole reason it lives here
 * and not in the repository: a context belongs to the launch or the last
 * `context_select` call, never to a sticky setting written to disk. Restarting
 * the app loses it — that is correct, not a bug — and it is set the same way
 * whichever door set it (C1): launch arguments at startup and the
 * `context_select` capability both call `resolveOpenArgs` below.
 *
 * ⚠️ TELETUBBY IS LOOSER THAN `@flivideo/core`'s OWN `resolveOpenContext`.
 * That helper requires a valid `fli.studio.json` (FliStudio's identity file,
 * not yet written for any real project) and returns `project-refused` for a
 * folder that lacks one. Teletubby's script sets have linked to a FliHub
 * folder NAME since before FliStudio or identity files existed (`project` on
 * `ScriptSet`, unchanged by this work) — so a folder fli-core would classify
 * `not-a-project` is accepted here as `membership: 'folder'`, not refused.
 * This is a deliberate, DOCUMENTED departure (open-contract §4 Teletubby row;
 * roadmap §3 W6), not an oversight: the day FliStudio writes identity files
 * into these folders, `membership` flips to `'project'` automatically and
 * nothing else here has to change.
 */

import path from 'node:path';
import {
  listProjects,
  readBrands,
  readMachineSettings,
  resolveBrandRoot,
  type ProjectListing,
} from '@flivideo/core';

/** The shared refusal vocabulary (W3 review, binding for every app). */
export const OPEN_REFUSAL_CODES = [
  'missing',
  'unknown-brand',
  'no-brand-root',
  'registry-unreadable',
  'project-not-found',
  'project-ambiguous',
] as const;
export type OpenRefusalCode = (typeof OPEN_REFUSAL_CODES)[number];

export interface OpenRefusal {
  code: OpenRefusalCode;
  message: string;
  /** Present only when `code === 'missing'`. */
  missing?: string[];
  /** Present only when `code === 'project-ambiguous'`: every folder that matched. */
  candidates?: string[];
}

export interface OpenContext {
  /** `brands.json` key. */
  brand: string;
  /** This machine's absolute root for that brand (A5). */
  brandRoot: string;
  /** The FliHub folder name, verbatim — the same identity `ScriptSet.project` already uses. */
  project: string;
  /** `'project'` when the folder holds a valid `fli.studio.json`; `'folder'` otherwise (see file header). */
  membership: 'project' | 'folder';
}

export type OpenResolution =
  | { kind: 'resolved'; context: OpenContext }
  | { kind: 'refused'; refusal: OpenRefusal };

export interface ResolveOpenArgsOptions {
  /** Home directory; default `os.homedir()`. Tests inject a fixture home so nothing real is ever touched. */
  home?: string;
}

/**
 * R31, extended per the W3 review's shared ruling: a code reference (`a01`)
 * matches over BOTH members (have identity) and plain folders (do not) —
 * 0 → not-found, exactly 1 → resolved, 2+ → ambiguous listing every folder
 * name. An exact folder name matches directly, in either collection.
 */
function resolveTeletubbyProject(
  listing: ProjectListing,
  ref: string,
):
  | { kind: 'found'; folder: string; membership: 'project' | 'folder' }
  | { kind: 'ambiguous'; candidates: string[] }
  | { kind: 'not-found' } {
  if (listing.members.state !== 'scanned' || listing.otherFolders.state !== 'scanned') {
    return { kind: 'not-found' };
  }
  const members = listing.members.items;
  const others = listing.otherFolders.items;

  const memberByFolder = members.find((member) => member.folder === ref);
  if (memberByFolder) return { kind: 'found', folder: memberByFolder.folder, membership: 'project' };

  const otherByFolder = others.find((folder) => folder.folder === ref);
  if (otherByFolder) return { kind: 'found', folder: otherByFolder.folder, membership: 'folder' };

  if (/^[a-z]\d{2}$/.test(ref)) {
    const memberMatches = members.filter((member) => member.parsed?.code === ref);
    const otherMatches = others.filter((folder) => folder.parsed?.code === ref);
    const total = memberMatches.length + otherMatches.length;
    if (total === 1) {
      return memberMatches.length === 1
        ? { kind: 'found', folder: memberMatches[0]!.folder, membership: 'project' }
        : { kind: 'found', folder: otherMatches[0]!.folder, membership: 'folder' };
    }
    if (total > 1) {
      return {
        kind: 'ambiguous',
        candidates: [...memberMatches, ...otherMatches].map((match) => match.folder),
      };
    }
  }

  return { kind: 'not-found' };
}

/**
 * Resolve `{ brand, project }` (door 2's launch args, or door 3's
 * `context_select` input) to an `OpenContext`, or a typed refusal saying why
 * not (C3). Read-only: at most one brand-root listing. Never falls back to
 * another project.
 */
export async function resolveOpenArgs(
  args: { brand?: string | undefined; project?: string | undefined },
  options: ResolveOpenArgsOptions = {},
): Promise<OpenResolution> {
  const missing: string[] = [];
  if (!args.brand) missing.push('brand');
  if (!args.project) missing.push('project');
  if (missing.length > 0) {
    return {
      kind: 'refused',
      refusal: {
        code: 'missing',
        message: `missing: ${missing.join(', ')}`,
        missing,
      },
    };
  }
  const brandKey = args.brand as string;
  const projectRef = args.project as string;

  const brandsResult = await readBrands(options.home ? { home: options.home } : {});
  if (brandsResult === null) {
    return {
      kind: 'refused',
      refusal: { code: 'registry-unreadable', message: 'brands.json does not exist' },
    };
  }
  if (brandsResult.kind === 'invalid') {
    return {
      kind: 'refused',
      refusal: {
        code: 'registry-unreadable',
        message: `brands.json ${brandsResult.reason}: ${brandsResult.message}`,
      },
    };
  }

  const brand = brandsResult.value.find((candidate) => candidate.key === brandKey);
  if (!brand) {
    return {
      kind: 'refused',
      refusal: { code: 'unknown-brand', message: `no brand "${brandKey}" in the registry` },
    };
  }

  const machineResult = await readMachineSettings(options.home ? { home: options.home } : {});
  // A machine.json that exists and cannot be used REFUSES (C3). Dropping it
  // silently would also drop its `brandRoots` override — an external drive —
  // and resolve to the registry root: the wrong folder, with no word said
  // (W6 fix M7). Absent is fine; fli-core reports that as defaults.
  if (machineResult.kind === 'invalid') {
    return {
      kind: 'refused',
      refusal: {
        code: 'no-brand-root',
        message: `${machineResult.path} ${machineResult.reason}: ${machineResult.message}`,
      },
    };
  }
  const machine = machineResult.value;
  const root = resolveBrandRoot(brand, machine, options.home ? { home: options.home } : {});
  if (root === null || !path.isAbsolute(root)) {
    return {
      kind: 'refused',
      refusal: {
        code: 'no-brand-root',
        message: `brand "${brandKey}" has no resolvable root on this machine`,
      },
    };
  }

  const listing = await listProjects(root);
  if (listing.members.state === 'unscanned') {
    return {
      kind: 'refused',
      refusal: {
        code: 'no-brand-root',
        message: `could not read "${listing.members.path}": ${listing.members.message}`,
      },
    };
  }

  const resolved = resolveTeletubbyProject(listing, projectRef);
  if (resolved.kind === 'ambiguous') {
    return {
      kind: 'refused',
      refusal: {
        code: 'project-ambiguous',
        message: `"${projectRef}" matches more than one folder in brand "${brandKey}"`,
        candidates: resolved.candidates,
      },
    };
  }
  if (resolved.kind === 'not-found') {
    return {
      kind: 'refused',
      refusal: {
        code: 'project-not-found',
        message: `no project or folder "${projectRef}" in brand "${brandKey}"`,
      },
    };
  }

  return {
    kind: 'resolved',
    context: { brand: brand.key, brandRoot: root, project: resolved.folder, membership: resolved.membership },
  };
}

/** The absolute directory an `OpenContext` points at — where `fli.tubby.json` would live. */
export function projectDirOf(context: OpenContext): string {
  return path.join(context.brandRoot, context.project);
}

export interface ContextReport {
  context: OpenContext | null;
  refused?: OpenRefusal;
}

/**
 * The session's held context. Set at startup from launch arguments and again
 * by `context_select` (door 3) — same helper, same shape (C1). A refused call
 * NEVER changes `context`: the previous one (or `null`) stands (open-contract
 * §3.1, "refused launch: previous context untouched").
 */
export class OpenContextHolder {
  private context: OpenContext | null = null;
  private refusal: OpenRefusal | null = null;

  apply(resolution: OpenResolution): ContextReport {
    if (resolution.kind === 'resolved') {
      this.context = resolution.context;
      this.refusal = null;
    } else {
      this.refusal = resolution.refusal;
    }
    return this.get();
  }

  get(): ContextReport {
    return this.refusal ? { context: this.context, refused: this.refusal } : { context: this.context };
  }
}
