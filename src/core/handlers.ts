/**
 * THE CAPABILITY IMPLEMENTATIONS — the only place business logic lives.
 *
 * Adapters (IPC, HTTP, CLI) hold none of this. They parse a transport envelope,
 * name a principal, and call `core.invoke`. If a rule is here, all three
 * surfaces obey it; if it were in an adapter, they would each obey a different
 * one and users would discover the divergence.
 *
 * Two conventions run through every handler:
 *
 *   · **Return the previous value on a mutation.** `previous` in the output is
 *     not decoration — it is what makes the operation auditable and usually
 *     undoable, without a second round trip.
 *   · **Never make the caller guess an id.** A `not_found` carries the ids that
 *     do exist. Exact-identifier dependence is a named failure mode.
 */

import { z } from '@appydave/core';
import { INPUT, describeInput } from './input-shapes.js';
import {
  findScript,
  findTranscript,
  findTriggerSet,
  paragraphsOf,
  transcriptText,
  validateScriptSet,
  validateTranscript,
  validateTriggerSet,
  type MajorTopic,
  type Script,
  type ScriptSet,
  type Talent,
  type Transcript,
  type TriggerSet,
} from '@shared/domain';
import { rigSchema, scriptSetSchema, talentSchema } from '@shared/domain-schema';
import {
  canonicalZones,
  validateRig,
  validateRigLayout,
  type Rig,
  type RigLayout,
} from '@shared/rig';
import {
  CAPABILITIES,
  type CapabilityMeta,
  type ErrorCode,
  type Principal,
} from '@shared/capabilities';
import type { ActiveContextHolder } from './active-context.js';
import { scoreAgainst } from './cadence.js';
import {
  projectDirOf,
  resolveOpenArgs,
  type OpenContextHolder,
  type OpenRefusalCode,
} from './open-context.js';
import { projectFilePath, readProjectSets, writeProjectSets } from './project-store.js';
import type { Repository, RepositoryDocument } from './repository.js';
import { ConfirmationLedger, fail, fingerprint } from './safety.js';

export interface HandlerContext {
  repository: Repository;
  active: ActiveContextHolder;
  /** The session's brand/project context (W6, door 2 + door 3). Never persisted. */
  openContext: OpenContextHolder;
  confirmations: ConfirmationLedger;
  principal: Principal;
  capability: CapabilityMeta;
  /** True when the caller asked for a preview rather than an act. */
  dryRun: boolean;
  confirmationId?: string;
  /** Hand the prior state to the audit log. Call it before you overwrite. */
  recordPrior: (prior: unknown) => void;
}

export type Handler = (input: unknown, context: HandlerContext) => Promise<unknown>;

/* ------------------------------------------------------------------ *
 * Shared input plumbing
 * ------------------------------------------------------------------ */

const parse = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const parsed = schema.safeParse(input ?? {});
  if (!parsed.success) {
    fail('invalid_input', 'the input does not match this capability’s schema', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  return (parsed as { data: T }).data;
};







/** Open-contract refusal code → capability error (and so HTTP status). Shared with FliHub W3. */
const REFUSAL_ERROR: Record<OpenRefusalCode, ErrorCode> = {
  missing: 'invalid_input', // 400
  'unknown-brand': 'not_found', // 404
  'project-not-found': 'not_found', // 404
  'project-ambiguous': 'conflict', // 409
  'no-brand-root': 'unavailable', // 503
  'registry-unreadable': 'unavailable', // 503
};

/* ------------------------------------------------------------------ *
 * Resolution — with ambient context as the default argument
 * ------------------------------------------------------------------ */

interface Resolved {
  document: RepositoryDocument;
  set: ScriptSet;
  script: Script;
  transcript: Transcript;
}

const resolveSet = (
  document: RepositoryDocument,
  setId: string | undefined,
  active: ActiveContextHolder,
): ScriptSet => {
  const id = setId ?? active.defaulted('setId') ?? undefined;
  if (!id) {
    // Degrade with a hint, the way `get_active_context` does. An agent told
    // "which set?" can ask the human; an agent told "TypeError" cannot.
    fail('not_found', 'no set specified and nothing is open in Teletubby', {
      hint: 'Pass setId, or ask the talent to open a set.',
      available: document.sets.map((s) => s.id),
    });
  }
  const set = document.sets.find((candidate) => candidate.id === id);
  if (!set)
    fail('not_found', `no script set "${id}"`, {
      available: document.sets.map((s) => s.id),
    });
  return set;
};

/**
 * `resolveSet` for a WRITE. In the merged view a set carrying `exportedTo` is
 * always the app store's frozen copy — the project's own copy is written with
 * it cleared — so the only way to reach one is with no context open on its
 * project (or with a project file that no longer holds it). An edit there
 * would land on the stale copy and be shadowed the moment the project opens:
 * a lost edit with no error (W6 fix F4). Refused, dry run included, so a
 * preview never promises a write that cannot happen.
 */
const resolveWritableSet = (
  document: RepositoryDocument,
  setId: string | undefined,
  context: HandlerContext,
): ScriptSet => {
  const set = resolveSet(document, setId, context.active);
  assertWritable(set);
  return set;
};

const assertWritable = (set: ScriptSet): void => {
  if (!set.exportedTo) return;
  const where = set.exportedBrand
    ? `brand "${set.exportedBrand}" project "${set.exportedTo}"`
    : `project "${set.exportedTo}"`;
  fail(
    'conflict',
    `set "${set.id}" lives in ${set.exportedTo}/fli.tubby.json; open Teletubby at ${where} to edit it`,
    { exportedTo: set.exportedTo, exportedBrand: set.exportedBrand ?? null },
  );
};

const resolveScript = (
  set: ScriptSet,
  scriptId: string | undefined,
  active: ActiveContextHolder,
): Script => {
  const id = scriptId ?? active.defaulted('scriptId') ?? undefined;
  if (!id)
    fail('not_found', 'no script specified and nothing is open in Teletubby', {
      hint: 'Pass scriptId, or ask the talent to open a script.',
      available: set.scripts.map((s) => s.id),
    });
  const script = findScript(set, id);
  if (!script)
    fail('not_found', `no script "${id}" in set "${set.id}"`, {
      available: set.scripts.map((s) => s.id),
    });
  return script;
};

const resolveTranscript = (
  script: Script,
  transcriptId: string | undefined,
  active: ActiveContextHolder,
): Transcript => {
  const id = transcriptId ?? active.defaulted('transcriptId') ?? undefined;
  if (!id)
    fail('not_found', 'no transcript specified and nothing is open in Teletubby', {
      hint: 'Pass transcriptId, or ask the talent to open one.',
      available: script.transcripts.map((t) => t.id),
    });
  const transcript = findTranscript(script, id);
  if (!transcript)
    fail('not_found', `no transcript "${id}" on script "${script.id}"`, {
      available: script.transcripts.map((t) => ({
        id: t.id,
        kind: t.kind,
        corpus: t.corpus,
      })),
    });
  return transcript;
};

const resolveAll = async (
  context: HandlerContext,
  ids: { setId?: string; scriptId?: string; transcriptId?: string },
): Promise<Resolved> => {
  const document = await effectiveDocument(context);
  const set = resolveSet(document, ids.setId, context.active);
  const script = resolveScript(set, ids.scriptId, context.active);
  const transcript = resolveTranscript(script, ids.transcriptId, context.active);
  return { document, set, script, transcript };
};

/* ------------------------------------------------------------------ *
 * fli.tubby.json — the open project's OWN sets, merged over the store
 * ------------------------------------------------------------------ *
 *
 * Only the CURRENTLY OPEN project's file is ever read. A set attached to a
 * DIFFERENT project than the one open right now stays exactly where it is in
 * the app store — this is what keeps tonight's real sets un-migrated (W6
 * brief §2B "export, not migrate") without a special case: nothing routes a
 * set anywhere until Teletubby is actually pointed at its project.
 */

/** Store sets with the project file's same-id sets removed, plus the project file's sets appended (they win). */
function mergeSets(storeSets: ScriptSet[], projectSets: ScriptSet[]): ScriptSet[] {
  if (projectSets.length === 0) return storeSets;
  const projectIds = new Set(projectSets.map((set) => set.id));
  return [...storeSets.filter((set) => !projectIds.has(set.id)), ...projectSets];
}

/**
 * The document every READ handler sees: the app store, with the open
 * project's `fli.tubby.json` (if any) merged over it. The store's copy of a
 * set also present in the project file is stale and is never shown twice.
 */
async function effectiveDocument(context: HandlerContext): Promise<RepositoryDocument> {
  return (await effectiveView(context)).document;
}

/** `effectiveDocument`, plus which ids came from the project file. */
async function effectiveView(
  context: HandlerContext,
): Promise<{ document: RepositoryDocument; projectIds: Set<string> }> {
  const document = await context.repository.read();
  const status = context.openContext.get();
  if (!status.context) return { document, projectIds: new Set() };
  const projectSets = await readProjectSets(projectDirOf(status.context));
  const projectIds = new Set(projectSets.map((set) => set.id));
  if (projectSets.length === 0) return { document, projectIds };
  return { document: { ...document, sets: mergeSets(document.sets, projectSets) }, projectIds };
}

/**
 * Every WRITE handler that touches `document.sets` goes through this instead
 * of `context.repository.update` directly. `fn` still only ever sees and
 * returns ONE document — the merge is transparent to it — but the RESULT is
 * split back apart before anything is persisted.
 *
 * ⚠️ THE ROUTE IS BY ID, NEVER BY `project`. A set goes back to
 * `fli.tubby.json` only if its id was ALREADY in that file; every other set
 * returns to the app store exactly as the handler left it. A store set enters
 * the project file through `set_export_to_project` and nothing else (W6 fix
 * F1). Routing by `project` moved every attached set out of the store on the
 * first write to ANYTHING — and dropped the store copies — which is a
 * migration the brief forbids, performed silently.
 *
 * Without an open context, or with a project file that holds nothing, every
 * set stays in the store and the project file is never written.
 */
async function projectAwareUpdate<T>(
  context: HandlerContext,
  fn: (document: RepositoryDocument) => { document: RepositoryDocument; result: T },
): Promise<T> {
  const status = context.openContext.get();
  const openContext = status.context;
  const projectDir = openContext ? projectDirOf(openContext) : null;
  const before = projectDir ? await readProjectSets(projectDir) : [];
  const beforeIds = new Set(before.map((set) => set.id));
  // Snapshot NOW: handlers mutate the merged sets in place, and those are the
  // very objects in `before`, so comparing afterwards would always say "same".
  const beforeJson = JSON.stringify(before);

  let after: ScriptSet[] | null = null;

  const result = await context.repository.update<T>((storeDocument) => {
    // The store's copy of an id the project file holds is stale history —
    // never part of the merged view a handler edits, and re-attached below
    // byte-for-byte rather than reconstructed from it.
    const visible = storeDocument.sets.filter((set) => !beforeIds.has(set.id));
    const merged: RepositoryDocument = { ...storeDocument, sets: [...visible, ...before] };

    const { document: mergedAfter, result: handlerResult } = fn(merged);

    // A preview changes nothing — so it persists the store document it was
    // handed, untouched, and never the split (W6 fix F2). The split on this
    // path is what erased a set outright from a call whose contract is "change
    // nothing".
    if (context.dryRun) return { document: storeDocument, result: handlerResult };

    if (beforeIds.size === 0) return { document: mergedAfter, result: handlerResult };

    const toProject: ScriptSet[] = [];
    const edited = new Map<string, ScriptSet>();
    for (const set of mergedAfter.sets) {
      if (beforeIds.has(set.id)) toProject.push(set);
      else edited.set(set.id, set);
    }
    after = toProject;
    // Store order is kept: each store set is replaced in place by its edited
    // version (or kept, if the project file shadows it); new sets go last.
    const storeSets = storeDocument.sets.flatMap((set) => {
      if (beforeIds.has(set.id)) return [set];
      const next = edited.get(set.id);
      return next ? [next] : [];
    });
    const storeIds = new Set(storeDocument.sets.map((set) => set.id));
    const added = [...edited.values()].filter((set) => !storeIds.has(set.id));
    return { document: { ...mergedAfter, sets: [...storeSets, ...added] }, result: handlerResult };
  });

  // Only a real change to the project's own sets reaches the file. A dry run,
  // or a write that only touched store sets, leaves it alone — writing back
  // identical content is still a write.
  if (
    projectDir &&
    after !== null &&
    !context.dryRun &&
    JSON.stringify(after) !== beforeJson
  ) {
    await writeProjectSets(projectDir, openContext!.project, after);
  }

  return result;
}

/* ------------------------------------------------------------------ *
 * Projections — what a caller gets back
 * ------------------------------------------------------------------ */

/**
 * The set view (requirements §6). A summary per script so twelve are scannable
 * in one sitting, and enough shape to choose — never the full transcripts,
 * which is what makes it scannable.
 */
const setSummary = (set: ScriptSet): unknown => ({
  id: set.id,
  title: set.title,
  description: set.description,
  project: set.project ?? null,
  scriptCount: set.scripts.length,
  scripts: set.scripts.map((script) => ({
    id: script.id,
    n: script.n,
    title: script.title,
    summary: script.summary,
    takeaway: script.takeaway,
    transcripts: script.transcripts.map((transcript) => ({
      id: transcript.id,
      kind: transcript.kind,
      corpus: transcript.corpus,
      talentId: transcript.talentId,
      styles: transcript.triggerSets.map((triggerSet) => triggerSet.style),
    })),
  })),
});

/* ------------------------------------------------------------------ *
 * Id minting — stable, in-document, and never positional at read time
 * ------------------------------------------------------------------ */

const mintTopicIds = (topics: MajorTopic[]): MajorTopic[] => {
  let paragraph = 0;
  return topics.map((major, m) => ({
    ...major,
    id: major.id || `t${m + 1}`,
    minors: major.minors.map((minor, n) => ({
      ...minor,
      id: minor.id || `t${m + 1}.${n + 1}`,
      paragraphs: minor.paragraphs.map((p) => ({
        ...p,
        id: p.id || `p${++paragraph}`,
      })),
    })),
  }));
};

const mintTriggerIds = (set: TriggerSet): TriggerSet => ({
  ...set,
  triggers: set.triggers.map((trigger, index) => ({
    ...trigger,
    id: trigger.id || `g${index + 1}`,
  })),
});

/* ------------------------------------------------------------------ *
 * Input schemas
 * ------------------------------------------------------------------ */






const normalizeLayout = (layout: RigLayout): RigLayout => ({
  ...layout,
  visible: canonicalZones(layout.visible),
  weights: { ...layout.weights },
});



/* ------------------------------------------------------------------ *
 * The handlers
 * ------------------------------------------------------------------ */

export function createHandlers(): Record<string, Handler> {
  const handlers: Record<string, Handler> = {};

  /* --- self-description ------------------------------------------- */

  handlers.describe_capabilities = async (_input, context) => ({
    // Only what THIS principal can reach. Advertising a verb the caller may
    // not call is how an agent burns a turn discovering a permission error.
    capabilities: CAPABILITIES.filter((capability) =>
      capability.principals.includes(context.principal),
    ).map((capability) => ({
      ...capability,
      // GENERATED from the same zod schema the gate validates with — one
      // truth. A verb that takes nothing publishes [], never a missing key,
      // so absence is impossible (2026-09-02: an agent could discover
      // rename_set existed and not that it takes a title).
      input: INPUT[capability.name] ? describeInput(INPUT[capability.name]) : [],
    })),
    principal: context.principal,
  });

  /* --- ambient context -------------------------------------------- */

  handlers.get_active_context = async (_input, context) => context.active.get();

  handlers.set_active_context = async (input, context) => {
    const parsed = parse(INPUT.set_active_context, input);
    return context.active.set(parsed as never);
  };

  /* --- open context (door 3) — brand + project, W6 ------------------ */

  // `context_get` and `context_select` publish the SAME body shape
  // (`{ applied, context, refused? }`) on purpose: a caller that re-selects
  // the context it already has back gets an identical answer to one that
  // just asked what is currently open (open-contract §3.1, contract test 2).
  handlers.context_get = async (_input, context) => {
    const report = context.openContext.get();
    return { applied: report.context !== null, ...report };
  };

  handlers.context_select = async (input, context) => {
    const parsed = parse(INPUT.context_select, input);
    const resolution = await resolveOpenArgs(parsed);
    // Recorded FIRST, so `context_get` and `list_sets.filter.missing` still
    // show the refusal — and the previous context stands (C3).
    const report = context.openContext.apply(resolution);
    if (resolution.kind === 'refused') {
      // A refusal is a FAILURE on the wire, the same status FliHub (W3) sends
      // for the same code — FliStudio's launch buttons branch on status, and a
      // 200 here would read as "switched" (W6 fix F7).
      const { code, message } = resolution.refusal;
      fail(REFUSAL_ERROR[code], message, { context: report.context, refused: report.refused });
    }
    // `applied` also gates the change event (core/index.ts `didApply`).
    return { applied: true, ...report };
  };

  /* --- reading ----------------------------------------------------- */

  handlers.list_sets = async (input, context) => {
    const { allSets } = parse(INPUT.list_sets, input);
    const { document, projectIds } = await effectiveView(context);
    const status = context.openContext.get();
    const project = !allSets && status.context ? status.context.project : null;
    const sets = document.sets.filter((set) => project === null || set.project === project);
    return {
      sets: sets.map((set) => ({
        id: set.id,
        title: set.title,
        description: set.description,
        project: set.project ?? null,
        exportedTo: set.exportedTo ?? null,
        exportedBrand: set.exportedBrand ?? null,
        // An exported store copy is LISTED, never hidden and never editable:
        // with no context on its project it is the only copy this launch can
        // see, and the talent can still prompt from it (W6 fix F4, Swagger).
        readOnly: Boolean(set.exportedTo),
        livesIn: set.exportedTo ? `${set.exportedTo}/fli.tubby.json` : null,
        source: projectIds.has(set.id) ? 'project' : 'store',
        scriptCount: set.scripts.length,
      })),
      // Missing context → today's unfiltered list, with WHY reported here
      // rather than left for the caller to infer from an empty filter.
      filter: {
        project,
        allSets: Boolean(allSets),
        missing: status.refused?.code === 'missing' ? (status.refused.missing ?? []) : [],
      },
    };
  };

  handlers.get_set = async (input, context) => {
    const { setId, full } = parse(INPUT.get_set, input);
    const document = await effectiveDocument(context);
    const set = resolveSet(document, setId, context.active);
    // Summary by default — that is what makes twelve scripts scannable in one
    // sitting (§6). A caller that has to RENDER the set asks for `full`; making
    // it the default would push the whole corpus through every list view.
    return full ? set : setSummary(set);
  };

  handlers.get_script = async (input, context) => {
    const { setId, scriptId } = parse(INPUT.get_script, input);
    const document = await effectiveDocument(context);
    const set = resolveSet(document, setId, context.active);
    return {
      setId: set.id,
      script: resolveScript(set, scriptId, context.active),
    };
  };

  handlers.get_transcript = async (input, context) => {
    const ids = parse(INPUT.get_transcript, input);
    const { set, script, transcript } = await resolveAll(context, ids);
    return {
      setId: set.id,
      scriptId: script.id,
      transcript,
      paragraphCount: paragraphsOf(transcript).length,
    };
  };

  handlers.get_trigger_set = async (input, context) => {
    const ids = parse(INPUT.get_trigger_set, input);
    const { script, transcript } = await resolveAll(context, ids);
    const triggerSet = findTriggerSet(transcript, ids.style);
    if (!triggerSet)
      fail('not_found', `transcript "${transcript.id}" has no "${ids.style}" trigger set`, {
        available: transcript.triggerSets.map((t) => t.style),
      });
    return { scriptId: script.id, transcriptId: transcript.id, triggerSet };
  };

  handlers.list_talents = async (_input, context) => {
    const document = await context.repository.read();
    return { talents: document.talents };
  };

  handlers.get_talent = async (input, context) => {
    const { talentId } = parse(INPUT.get_talent, input);
    const document = await context.repository.read();
    const talent = document.talents.find((candidate) => candidate.id === talentId);
    if (!talent)
      fail('not_found', `no talent "${talentId}"`, {
        available: document.talents.map((t) => t.id),
      });
    return { talent };
  };

  handlers.score_transcript = async (input, context) => {
    const parsed = parse(INPUT.score_transcript, input);

    const document = await context.repository.read();
    const talent = document.talents.find((candidate) => candidate.id === parsed.talentId);
    if (!talent)
      fail('not_found', `no talent "${parsed.talentId}" — an envelope belongs to one person`, {
        available: document.talents.map((t) => t.id),
      });

    let text = parsed.text;
    let scored: { scriptId?: string; transcriptId?: string } = {};
    if (!text) {
      const { script, transcript } = await resolveAll(context, parsed);
      text = transcriptText(transcript);
      scored = { scriptId: script.id, transcriptId: transcript.id };
    }

    return {
      ...scored,
      talentId: talent.id,
      score: scoreAgainst(text, talent.envelope, parsed.mustTerms ?? []),
    };
  };

  /* --- writing ----------------------------------------------------- */

  handlers.create_set = async (input, context) => {
    const parsed = parse(INPUT.create_set, input);
    const set: ScriptSet = {
      id: parsed.id,
      title: parsed.title,
      description: parsed.description ?? '',
      project: parsed.project ?? null,
      exportedTo: null,
      scripts: [],
    };
    assertShape(scriptSetSchema, set, 'set');

    return projectAwareUpdate<unknown>(context, (document) => {
      if (document.sets.some((existing) => existing.id === set.id))
        fail('conflict', `a set "${set.id}" already exists`);
      if (context.dryRun) return { document, result: { applied: false, preview: { set } } };
      document.sets.push(set);
      return { document, result: { applied: true, set } };
    });
  };

  /**
   * Rename = the TITLE, never the identity. Mirrors what FliHub actually has:
   * no project rename exists over there either — titles (.flihub-state.json,
   * FR-157) are the mutable display layer over an immutable folder name. So
   * nothing this verb does can desynchronise the two apps.
   *
   * `project` here is an ATTACH: null→value backfills a set onto its FliHub
   * project. value→different is refused in David's own words — a code change
   * is a move, not a rename, and moves are unbuilt in both apps by ruling.
   */
  handlers.rename_set = async (input, context) => {
    const parsed = parse(INPUT.rename_set, input);
    if (parsed.title === undefined && parsed.project == null)
      fail('invalid_input', 'nothing to do — pass a new title, a project to attach, or both');

    return projectAwareUpdate<unknown>(context, (document) => {
      const set = resolveWritableSet(document, parsed.setId, context);

      if (parsed.project != null && set.project && set.project !== parsed.project)
        fail(
          'invalid_input',
          `set "${set.id}" is attached to project "${set.project}" — changing the project ` +
            `identity is a move, not a rename, and moves are not built (in either app)`,
        );

      const previous = { title: set.title, project: set.project ?? null };
      const next = {
        title: parsed.title ?? set.title,
        project: parsed.project ?? set.project ?? null,
      };
      if (context.dryRun)
        return { document, result: { applied: false, preview: { ...next }, previous } };

      set.title = next.title;
      set.project = next.project;
      context.recordPrior(previous);
      return {
        document,
        result: { applied: true, set: { id: set.id, ...next }, previous },
      };
    });
  };

  /**
   * Write, not migrate. Requires the open context to name the SAME project the
   * set already carries — Teletubby has no other way to know which directory
   * `fli.tubby.json` belongs in, and it never guesses one from `set.project`
   * alone (roadmap §3 W6, brief §2B "export, not migrate"). Never deletes the
   * store copy: it is marked `exportedTo` instead, so `list_sets` stops
   * showing it a second time (`mergeSets`) without losing the history.
   */
  handlers.set_export_to_project = async (input, context) => {
    const parsed = parse(INPUT.set_export_to_project, input);
    const status = context.openContext.get();
    if (!status.context)
      fail(
        'invalid_input',
        'no open context — point Teletubby at the set\'s project first (context_select)',
      );
    const openContext = status.context;
    const alreadyInProject = (await readProjectSets(projectDirOf(openContext))).some(
      (candidate) => candidate.id === parsed.setId,
    );

    return context.repository.update<unknown>((document) => {
      const set = document.sets.find((candidate) => candidate.id === parsed.setId);
      if (!set)
        fail('not_found', `no set "${parsed.setId}" in the app store`, {
          available: document.sets.map((s) => s.id),
        });
      // A second export would copy the STALE store data over the live project
      // copy — a silent revert of every edit made since (W6 fix F3). Refused,
      // never the default; nothing here offers a same-id overwrite.
      if (set.exportedTo || alreadyInProject)
        fail(
          'conflict',
          `set "${set.id}" is already exported to "${set.exportedTo ?? openContext.project}"; ` +
            `the project copy (fli.tubby.json) is live`,
          { exportedTo: set.exportedTo ?? openContext.project, inProjectFile: alreadyInProject },
        );
      if (!set.project)
        fail(
          'invalid_input',
          `set "${set.id}" is not attached to a project — attach one with rename_set first`,
        );
      if (set.project !== openContext.project)
        fail(
          'invalid_input',
          `set "${set.id}" is attached to "${set.project}", but Teletubby is open on ` +
            `"${openContext.project}" — open Teletubby at "${set.project}" to export it`,
        );

      if (context.dryRun)
        return {
          document,
          result: { applied: false, preview: { setId: set.id, project: openContext.project } },
        };

      context.recordPrior({ exportedTo: set.exportedTo ?? null, exportedBrand: set.exportedBrand ?? null });
      set.exportedTo = openContext.project;
      set.exportedBrand = openContext.brand;
      // The store copy is captured BEFORE the mark above is persisted, so the
      // exported copy in fli.tubby.json is the clean data, not `{…exportedTo}`
      // of itself — `exportedTo` describes where the app-store copy went, and
      // is meaningless on the project's own copy.
      const exported: ScriptSet = { ...set, exportedTo: null, exportedBrand: null };
      return { document, result: { applied: true, exported, projectDir: projectDirOf(openContext) } };
    }).then(async (result) => {
      const outcome = result as {
        applied: boolean;
        exported?: ScriptSet;
        projectDir?: string;
        preview?: unknown;
      };
      if (!outcome.applied || !outcome.exported || !outcome.projectDir) return outcome;

      const existing = await readProjectSets(outcome.projectDir);
      const next = [
        ...existing.filter((candidate) => candidate.id !== outcome.exported!.id),
        outcome.exported,
      ];
      await writeProjectSets(outcome.projectDir, openContext.project, next);
      return {
        applied: true,
        set: outcome.exported,
        projectFile: projectFilePath(outcome.projectDir),
      };
    });
  };

  handlers.create_script = async (input, context) => {
    const parsed = parse(INPUT.create_script, input);

    return projectAwareUpdate<unknown>(context, (document) => {
      const set = resolveWritableSet(document, parsed.setId, context);
      if (findScript(set, parsed.id))
        fail('conflict', `set "${set.id}" already has a script "${parsed.id}"`);

      const script: Script = {
        id: parsed.id,
        n: parsed.n ?? set.scripts.length + 1,
        title: parsed.title,
        takeaway: parsed.takeaway,
        summary: parsed.summary,
        transcripts: parsed.provenance
          ? [
              {
                id: parsed.provenance.id ?? 'provenance',
                kind: 'provenance',
                corpus: parsed.provenance.corpus,
                talentId: null,
                source: parsed.provenance.source,
                topics: mintTopicIds(parsed.provenance.topics as MajorTopic[]),
                triggerSets: [],
              },
            ]
          : [],
      };

      const candidate: ScriptSet = {
        ...set,
        scripts: [...set.scripts, script],
      };
      assertDomain(validateScriptSet(candidate));

      if (context.dryRun) return { document, result: { applied: false, preview: { script } } };
      set.scripts.push(script);
      return { document, result: { applied: true, setId: set.id, script } };
    });
  };

  handlers.update_script = async (input, context) => {
    const parsed = parse(INPUT.update_script, input);

    return projectAwareUpdate<unknown>(context, (document) => {
      const set = resolveWritableSet(document, parsed.setId, context);
      const script = resolveScript(set, parsed.scriptId, context.active);
      const previous = {
        title: script.title,
        takeaway: script.takeaway,
        summary: script.summary,
      };
      const next = {
        title: parsed.title ?? script.title,
        takeaway: parsed.takeaway ?? script.takeaway,
        summary: parsed.summary ?? script.summary,
      };
      context.recordPrior(previous);

      if (context.dryRun)
        return {
          document,
          result: { applied: false, preview: { previous, next } },
        };

      Object.assign(script, next);
      // Returning `previous` is what makes this auditable and undoable without
      // a second round trip.
      return {
        document,
        result: { applied: true, scriptId: script.id, previous, current: next },
      };
    });
  };

  handlers.write_transcript = async (input, context) => {
    const parsed = parse(INPUT.write_transcript, input);

    return projectAwareUpdate<unknown>(context, (document) => {
      const set = resolveWritableSet(document, parsed.setId, context);
      const script = resolveScript(set, parsed.scriptId, context.active);
      const existing = findTranscript(script, parsed.id);

      const transcript: Transcript = {
        id: parsed.id,
        kind: parsed.kind,
        corpus: parsed.corpus,
        talentId: parsed.talentId ?? null,
        source: parsed.source,
        topics: mintTopicIds(parsed.topics as MajorTopic[]),
        // Replacing the text does NOT silently drop the trigger sets — but it
        // can invalidate their map, so they are re-validated below and the
        // write is refused if a trigger now points at a paragraph that is gone.
        triggerSets: existing?.triggerSets ?? [],
      };

      assertDomain(validateTranscript(transcript, `transcript[${transcript.id}]`));

      const candidate: Script = {
        ...script,
        transcripts: existing
          ? script.transcripts.map((t) => (t.id === transcript.id ? transcript : t))
          : [...script.transcripts, transcript],
      };
      assertDomain(validateScriptSet({ ...set, scripts: [candidate] }));

      context.recordPrior(existing ?? null);
      if (context.dryRun)
        return {
          document,
          result: {
            applied: false,
            preview: { previous: existing ?? null, next: transcript },
          },
        };

      script.transcripts = candidate.transcripts;
      return {
        document,
        result: {
          applied: true,
          scriptId: script.id,
          previous: existing ?? null,
          transcript,
        },
      };
    });
  };

  handlers.write_trigger_set = async (input, context) => {
    const parsed = parse(INPUT.write_trigger_set, input);

    return projectAwareUpdate<unknown>(context, (document) => {
      const set = resolveWritableSet(document, parsed.setId, context);
      const script = resolveScript(set, parsed.scriptId, context.active);
      const transcript = resolveTranscript(script, parsed.transcriptId, context.active);
      const previous = findTriggerSet(transcript, parsed.style) ?? null;

      const triggerSet = mintTriggerIds({
        style: parsed.style,
        authoredBy: parsed.authoredBy ?? 'agent',
        note: parsed.note,
        triggers: parsed.triggers as TriggerSet['triggers'],
      });

      // The map is authored data and it is validated on write, not on read.
      // A wrong sync is worse than none (prior-art §5), so a bad map is
      // refused at the door rather than discovered mid-take.
      assertDomain(validateTriggerSet(triggerSet, transcript, `triggerSet[${parsed.style}]`));

      context.recordPrior(previous);
      if (context.dryRun)
        return {
          document,
          result: { applied: false, preview: { previous, next: triggerSet } },
        };

      transcript.triggerSets = [
        ...transcript.triggerSets.filter((existing) => existing.style !== parsed.style),
        triggerSet,
      ];
      return {
        document,
        result: {
          applied: true,
          scriptId: script.id,
          transcriptId: transcript.id,
          previous,
          triggerSet,
        },
      };
    });
  };

  handlers.upsert_talent = async (input, context) => {
    const parsed = parse(INPUT.upsert_talent, input);

    const talent: Talent = {
      id: parsed.id,
      name: parsed.name,
      envelope: {
        ...parsed.envelope,
        antiVoice: parsed.envelope.antiVoice ?? [],
        bookends: parsed.envelope.bookends ?? [],
      },
    };
    assertShape(talentSchema, talent, 'talent');

    return context.repository.update<unknown>((document) => {
      const index = document.talents.findIndex((candidate) => candidate.id === talent.id);
      const previous = index >= 0 ? document.talents[index] : null;
      context.recordPrior(previous);

      if (context.dryRun)
        return {
          document,
          result: { applied: false, preview: { previous, next: talent } },
        };

      if (index >= 0) document.talents[index] = talent;
      else document.talents.push(talent);
      return { document, result: { applied: true, previous, talent } };
    });
  };

  /* --- rigs: the arrangement in front of the talent ----------------- */

  /**
   * Rigs and the workspace come back together because the UI needs both in the
   * same breath — which arrangements exist, and which one to open on. Two
   * queries would mean a window that can render the chips before it knows
   * which is lit.
   */
  handlers.list_rigs = async (_input, context) => {
    const document = await context.repository.read();
    return { rigs: document.rigs, workspace: document.workspace };
  };

  handlers.save_rig = async (input, context) => {
    const parsed = parse(INPUT.save_rig, input);

    const rig: Rig = {
      id: parsed.id,
      label: parsed.label,
      layout: normalizeLayout(parsed.layout),
    };
    assertShape(rigSchema, rig, 'rig');
    // The shape gate says the fields are the right types; this says the
    // arrangement is one the app would let a human build. A rig that drives a
    // hidden zone passes the first and must never pass the second.
    assertDomain(validateRig(rig));

    return context.repository.update<unknown>((document) => {
      const index = document.rigs.findIndex((candidate) => candidate.id === rig.id);
      const previous = index >= 0 ? document.rigs[index] : null;
      context.recordPrior(previous);

      if (context.dryRun)
        return { document, result: { applied: false, preview: { previous, next: rig } } };

      if (index >= 0) document.rigs[index] = rig;
      else document.rigs.push(rig);
      return { document, result: { applied: true, previous, rig } };
    });
  };

  handlers.rename_rig = async (input, context) => {
    const parsed = parse(INPUT.rename_rig, input);

    return context.repository.update<unknown>((document) => {
      const rig = document.rigs.find((candidate) => candidate.id === parsed.id);
      if (!rig)
        fail('not_found', `no rig "${parsed.id}"`, {
          available: document.rigs.map((r) => r.id),
        });

      const previous = rig.label;
      context.recordPrior(previous);
      // Renaming touches the label and NOTHING else — the id is the stable
      // handle the workspace points at, so a rename can never orphan it.
      const next: Rig = { ...rig, label: parsed.label };
      assertShape(rigSchema, next, 'rig');

      if (context.dryRun)
        return { document, result: { applied: false, preview: { previous, label: parsed.label } } };

      rig.label = parsed.label;
      return { document, result: { applied: true, previous, rig } };
    });
  };

  /**
   * The sticky layout: what the talent had on screen when they last touched it.
   *
   * UI-only, like `set_active_context`. It is not a fact about the data, it is
   * the human's own working state — and an agent writing it would decide what
   * appears in front of a person at the moment a take starts, which is exactly
   * when nobody is looking at the screen to catch it.
   */
  handlers.remember_layout = async (input, context) => {
    const parsed = parse(INPUT.remember_layout, input);

    const layout = normalizeLayout(parsed.layout);
    assertDomain(validateRigLayout(layout));

    return context.repository.update<unknown>((document) => {
      // A pointer to a rig that has since been deleted is dropped rather than
      // stored: the layout is still the talent's, the attribution is not.
      const rigId =
        parsed.rigId && document.rigs.some((rig) => rig.id === parsed.rigId) ? parsed.rigId : null;
      context.recordPrior(document.workspace);
      document.workspace = { layout, rigId, position: parsed.position ?? null };
      return { document, result: { applied: true, workspace: document.workspace } };
    });
  };

  /* --- removal: preview → confirm → execute ------------------------ */

  handlers.delete_trigger_set = async (input, context) => {
    const parsed = parse(INPUT.delete_trigger_set, input);
    const { set, transcript } = await resolveAll(context, parsed);
    assertWritable(set);
    const target = findTriggerSet(transcript, parsed.style);
    if (!target)
      fail('not_found', `transcript "${transcript.id}" has no "${parsed.style}" trigger set`, {
        available: transcript.triggerSets.map((t) => t.style),
      });

    const preview = {
      wouldRemove: `${parsed.style} trigger set`,
      transcriptId: transcript.id,
      triggerCount: target.triggers.length,
      authoredBy: target.authoredBy,
    };

    return guardedDelete(context, input, preview, async () =>
      projectAwareUpdate<unknown>(context, (document) => {
        const set = resolveWritableSet(document, parsed.setId, context);
        const script = resolveScript(set, parsed.scriptId, context.active);
        const live = resolveTranscript(script, parsed.transcriptId, context.active);
        const removed = findTriggerSet(live, parsed.style) ?? null;
        context.recordPrior(removed);
        live.triggerSets = live.triggerSets.filter((existing) => existing.style !== parsed.style);
        return { document, result: { applied: true, removed } };
      }),
    );
  };

  handlers.delete_script = async (input, context) => {
    const parsed = parse(INPUT.delete_script, input);
    const document = await effectiveDocument(context);
    const set = resolveWritableSet(document, parsed.setId, context);
    const script = resolveScript(set, parsed.scriptId, context.active);

    // Consequences, not intent. This is the whole value of the preview step —
    // a human sees what disappears, not what was asked for.
    const preview = {
      wouldRemove: script.title,
      scriptId: script.id,
      transcripts: script.transcripts.map((transcript) => ({
        id: transcript.id,
        kind: transcript.kind,
        corpus: transcript.corpus,
        paragraphs: paragraphsOf(transcript).length,
        triggerSets: transcript.triggerSets.map((t) => t.style),
      })),
    };

    return guardedDelete(context, input, preview, async () =>
      projectAwareUpdate<unknown>(context, (live) => {
        const liveSet = resolveWritableSet(live, parsed.setId, context);
        const removed = findScript(liveSet, script.id) ?? null;
        context.recordPrior(removed);
        liveSet.scripts = liveSet.scripts.filter((candidate) => candidate.id !== script.id);
        return { document: live, result: { applied: true, removed } };
      }),
    );
  };

  /* --- the confirmation channel (UI only) -------------------------- */

  handlers.list_pending = async (_input, context) => ({
    pending: context.confirmations.list(),
  });

  handlers.approve_pending = async (input, context) => {
    const { pendingId } = parse(INPUT.approve_pending, input);
    const approved = context.confirmations.approve(pendingId);
    return { approved: true, pending: approved };
  };

  handlers.delete_rig = async (input, context) => {
    const parsed = parse(INPUT.delete_rig, input);
    const document = await context.repository.read();
    const rig = document.rigs.find((candidate) => candidate.id === parsed.id);
    if (!rig)
      fail('not_found', `no rig "${parsed.id}"`, {
        available: document.rigs.map((r) => r.id),
      });

    // Consequences, not intent: the name being lost and the arrangement it
    // stood for, so the human approving it recognises what they are dropping.
    const preview = {
      wouldRemove: rig.label,
      rigId: rig.id,
      layout: rig.layout,
      inUse: document.workspace.rigId === rig.id,
    };

    return guardedDelete(context, input, preview, async () =>
      context.repository.update((live) => {
        const removed = live.rigs.find((candidate) => candidate.id === parsed.id) ?? null;
        context.recordPrior(removed);
        live.rigs = live.rigs.filter((candidate) => candidate.id !== parsed.id);
        // Deleting a rig must NOT rearrange a screen someone is talking to. The
        // layout stays exactly as it is; only the attribution to a rig that no
        // longer exists is dropped.
        if (live.workspace.rigId === parsed.id) live.workspace = { ...live.workspace, rigId: null };
        return { document: live, result: { applied: true, removed } };
      }),
    );
  };

  return handlers;
}

/* ------------------------------------------------------------------ *
 * Assertion helpers
 * ------------------------------------------------------------------ */

function assertShape<T>(schema: z.ZodType<T>, value: T, label: string): void {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    fail('domain_invalid', `the ${label} is not a valid domain object`, {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
}

function assertDomain(violations: { path: string; message: string }[]): void {
  if (violations.length > 0)
    fail('domain_invalid', 'the write would break a domain rule', {
      violations,
    });
}

/**
 * The destructive path. Kept as one function so that adding a destructive verb
 * cannot accidentally omit the gate — there is only one way through.
 */
async function guardedDelete<T>(
  context: HandlerContext,
  input: unknown,
  preview: unknown,
  execute: () => Promise<T>,
): Promise<unknown> {
  const print = fingerprint(input);

  if (context.dryRun || !context.confirmationId) {
    const pending = context.confirmations.open(
      context.capability.name,
      context.principal,
      preview,
      print,
    );
    return {
      applied: false,
      preview,
      pendingId: pending.id,
      expiresAt: pending.expiresAt,
      hint: 'A human must approve this in Teletubby, then call again with the same input plus confirmationId.',
    };
  }

  context.confirmations.consume(context.confirmationId, context.capability.name, print);
  return execute();
}
