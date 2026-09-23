import { beforeEach, describe, expect, it } from 'vitest';
import { KYBERNESIS_PHASE_1 } from '@shared/script-set';
import { DEFAULT_LAYOUT, type Rig, type RigLayout } from '@shared/rig';
import {
  currentParagraph,
  currentScript,
  layoutOf,
  nextScript,
  prevScript,
  setupEdge,
  holdsStage,
  emptyProjectOf,
  pickOpeningSet,
  stageSetGone,
  useProm,
  visibleSets,
  type SetSummary,
} from '../src/renderer/src/store';

/**
 * THE SETUP PANEL — the slide-out that replaced six toolbar rows.
 *
 * The rules under all of this: the panel may take WIDTH and it may never take
 * anything else. It must not move the talent, must not rewrite the rig, and
 * must not come between them and the driven zone.
 */

const s = () => useProm.getState();

const layout = (patch: Partial<RigLayout> = {}): RigLayout => ({
  ...DEFAULT_LAYOUT,
  visible: [...DEFAULT_LAYOUT.visible],
  weights: { ...DEFAULT_LAYOUT.weights },
  ...patch,
});

const STAGE_LEFT: Rig = {
  id: 'stage-left',
  label: 'Stage left',
  layout: layout({ driven: 'paragraph', camera: 'left', text: 'stage' }),
};

const reset = (): void => {
  useProm.setState({
    set: null,
    scriptId: null,
    transcriptId: null,
    style: null,
    step: 0,
    ...layout(),
    transcriptOpen: false,
    transcriptEdge: 'left',
    setupOpen: false,
    rigs: [],
    rigId: null,
    rigsLoaded: false,
    restoredLayout: false,
    cue: null,
    nudge: 0,
  });
  s().load(JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)));
};

beforeEach(reset);

describe('opening and closing it', () => {
  it('toggles, and closes on demand', () => {
    expect(s().setupOpen).toBe(false);
    s().toggleSetup();
    expect(s().setupOpen).toBe(true);
    s().closeSetup();
    expect(s().setupOpen).toBe(false);
  });

  it('does not move the talent', () => {
    // THE rule. Opening a config drawer is not a boundary crossing and must
    // not change which script, corpus, style or beat is in front of them.
    s().selectScript('kybernesis-phase-1/03');
    s().stepNext();
    const before = {
      scriptId: s().scriptId,
      transcriptId: s().transcriptId,
      style: s().style,
      step: s().step,
      paragraph: currentParagraph(s())?.id,
    };

    s().toggleSetup();

    expect(s().scriptId).toBe(before.scriptId);
    expect(s().transcriptId).toBe(before.transcriptId);
    expect(s().style).toBe(before.style);
    expect(s().step).toBe(before.step);
    expect(currentParagraph(s())?.id).toBe(before.paragraph);
  });

  it('never touches the lane weights', () => {
    // The lanes narrow because a flex sibling took width, and they spring back
    // when it closes. Lane widths are a saved rig property, so a panel that
    // rebalanced them would rewrite the talent's rig every time it opened.
    s().loadRigs([STAGE_LEFT], { layout: STAGE_LEFT.layout, rigId: 'stage-left' });
    const before = layoutOf(s());

    s().toggleSetup();
    s().closeSetup();

    expect(layoutOf(s())).toEqual(before);
  });

  it('is not part of a rig', () => {
    // A rig is what the STAGE looks like. Whether a config drawer happened to
    // be open when you quit is not, and reopening on it would put a panel
    // between the talent and their first take.
    s().toggleSetup();
    expect(Object.keys(layoutOf(s()))).not.toContain('setupOpen');
    expect(layoutOf(s())).toEqual(DEFAULT_LAYOUT);
  });

  it('raises no cue card', () => {
    s().toggleSetup();
    expect(s().cue).toBeNull();
  });
});

describe('which edge it enters from', () => {
  it('is always the one furthest from the lens', () => {
    // Same rule the transcript drawer follows. A panel between the talent and
    // the driven zone is the failure mode, whichever panel it is.
    s().setCamera('right');
    expect(setupEdge(s())).toBe('left');

    s().setCamera('left');
    expect(setupEdge(s())).toBe('right');
  });

  it('follows the camera even while it is open', () => {
    s().toggleSetup();
    s().setCamera('left');
    expect(setupEdge(s())).toBe('right');
    expect(s().setupOpen).toBe(true);
  });

  it('agrees with the transcript drawer, so they can never both crowd the lens', () => {
    for (const side of ['left', 'right'] as const) {
      s().setCamera(side);
      expect(setupEdge(s())).toBe(s().transcriptEdge);
    }
  });
});

describe('the strip’s script stepper', () => {
  it('walks to the neighbouring script', () => {
    s().selectScript('kybernesis-phase-1/05');
    s().goToPrevScript();
    expect(currentScript(s())?.n).toBe(4);
    s().goToNextScript();
    expect(currentScript(s())?.n).toBe(5);
  });

  it('stops at both ends rather than wrapping', () => {
    // Rolling from 12 back to 01 is the silent-advance bug the prior-art rule
    // exists to prevent, one level up from the beat.
    s().selectScript('kybernesis-phase-1/01');
    expect(prevScript(s())).toBeUndefined();
    s().goToPrevScript();
    expect(currentScript(s())?.n).toBe(1);

    s().selectScript('kybernesis-phase-1/12');
    expect(nextScript(s())).toBeUndefined();
    s().goToNextScript();
    expect(currentScript(s())?.n).toBe(12);
  });

  it('announces the change like every other script change', () => {
    // Every boundary crossing announces itself, whatever triggered it — and a
    // stepper press is a crossing where opening the panel is not.
    s().selectScript('kybernesis-phase-1/02');
    const before = s().cue?.token ?? 0;
    s().goToNextScript();
    expect(s().cue?.token).toBeGreaterThan(before);
    expect(s().cue?.label).toBe('03');
  });

  it('resets the beat, because a half-remembered position is worse than a known one', () => {
    s().stepNext();
    s().stepNext();
    expect(s().step).toBeGreaterThan(0);
    s().goToNextScript();
    expect(s().step).toBe(0);
  });
  it('shuts when the talent reclaims the top band, and does not reopen after', () => {
    // Reclaiming the band above the first word while a 23rem panel still holds
    // the driven lane sideways is half a move.
    s().toggleSetup();
    expect(s().setupOpen).toBe(true);

    s().toggleFocus();
    expect(s().focus).toBe(true);
    expect(s().setupOpen).toBe(false);

    // Leaving it does NOT bring the panel back. `setupOpen` is not remembered,
    // so there is nothing to restore it to — and a config drawer appearing by
    // itself is a panel between the talent and their next take.
    s().toggleFocus();
    expect(s().focus).toBe(false);
    expect(s().setupOpen).toBe(false);
  });

  it('leaves the arrangement alone when it opens and when it reclaims', () => {
    // The panel takes WIDTH and nothing else — including via focus, which now
    // restyles the lanes. Neither may touch the saved rig properties.
    const before = layoutOf(s());
    s().toggleSetup();
    s().toggleFocus();
    const after = layoutOf(s());
    expect(after.weights).toEqual(before.weights);
    expect(after.visible).toEqual(before.visible);
    expect(after.driven).toBe(before.driven);
    expect(after.camera).toBe(before.camera);
    expect(after.text).toBe(before.text);
    // `focus` IS a rig property and IS meant to change — that is the whole
    // point of reusing it rather than inventing a key nothing remembers.
    expect(after.focus).toBe(true);
  });
});

describe('the set on stage when the list changes underneath it (W6 fix F6)', () => {
  const summary = (id: string, project: string | null = null): SetSummary => ({
    id,
    title: id,
    description: '',
    project,
    scriptCount: 0,
  });

  it('is marked gone — not swapped — when the store no longer lists it', () => {
    s().setSets([summary('kybernesis-phase-1'), summary('other')]);
    expect(stageSetGone(s())).toBe(false);

    const onStage = s().set;
    s().setSets([summary('other')]);
    expect(stageSetGone(s())).toBe(true);
    // Nothing in the store moved the talent: the set, script and beat stand.
    expect(s().set).toBe(onStage);
  });

  it('an empty list (nothing fetched yet) is not "gone"', () => {
    s().setSets([]);
    expect(stageSetGone(s())).toBe(false);
  });
});

describe('the PROJECT row filter (W6 fix F5)', () => {
  const row = (id: string, project: string | null): SetSummary => ({
    id,
    title: id,
    description: '',
    project,
    scriptCount: 0,
  });
  const all = [row('a', 'd02-cutty'), row('b', 'a01-kyber'), row('c', null)];

  it('with no project open, shows every set', () => {
    expect(visibleSets(all, null, 'project')).toEqual({ sets: all, note: null });
  });

  it('with a project open, shows only its sets — and "all sets" is one chip away', () => {
    expect(visibleSets(all, 'd02-cutty', 'project').sets.map((e) => e.id)).toEqual(['a']);
    expect(visibleSets(all, 'd02-cutty', 'all').sets).toEqual(all);
  });

  it('a project with NO attached set falls back to every set with a note, never an empty list', () => {
    const shown = visibleSets(all, 'z99-empty-project', 'project');
    expect(shown.sets).toEqual(all);
    expect(shown.note).toContain('z99-empty-project');
  });

  it('defaults to this project when a context arrives, and keeps the talent’s choice on a refresh', () => {
    useProm.setState({ openProject: null, setFilter: 'all' });
    s().setOpenProject('d02-cutty');
    expect(s().setFilter).toBe('project');

    s().setSetFilter('all');
    s().setOpenProject('d02-cutty'); // a change event re-reads the same context
    expect(s().setFilter).toBe('all');

    s().setOpenProject(null);
    expect(s().setFilter).toBe('all');
  });
});

describe('a set whose live copy closes underneath it (W6 second pass S1)', () => {
  const row = (source: 'project' | 'store'): SetSummary => ({
    id: 'a',
    title: 'a',
    description: '',
    project: 'd02-cutty',
    scriptCount: 0,
    source,
    readOnly: source === 'store',
  });
  const closed = { reason: 'project-closed' as const, message: 'On stage: live copy from d02-cutty' };

  it('holds when the row goes project → store: the words on stage are not swapped for the frozen copy', () => {
    expect(holdsStage(null, row('project'), row('store'))).toBe(true);
  });

  it('keeps holding on later events while the project stays closed', () => {
    expect(holdsStage(closed, row('store'), row('store'))).toBe(true);
  });

  it('refreshes again once the project reopens (store → project)', () => {
    expect(holdsStage(closed, row('store'), row('project'))).toBe(false);
  });

  it('never holds an ordinary store set, or a project set that stays a project set', () => {
    expect(holdsStage(null, row('store'), row('store'))).toBe(false);
    expect(holdsStage(null, row('project'), row('project'))).toBe(false);
    expect(holdsStage(null, undefined, row('store'))).toBe(false);
  });

  it('holding moves nothing: the set on stage is untouched', () => {
    const onStage = s().set;
    const before = { scriptId: s().scriptId, step: s().step };
    s().setStageHold(closed);
    expect(s().set).toBe(onStage);
    expect({ scriptId: s().scriptId, step: s().step }).toEqual(before);
    s().setStageHold(null);
  });
});

describe('a project with no set attached opens EMPTY, not on the remembered set (2026-09-22)', () => {
  const row = (id: string, project: string | null): SetSummary => ({
    id,
    title: id,
    description: '',
    project,
    scriptCount: 0,
  });
  const store = [
    row('kybernesis-phase-1', 'a01-kybernesis-12-videos'),
    row('cutty-presenter-tracking', 'd03-cutty-presenter-tracking'),
  ];

  it('names the empty project, so launch shows "No script for <project> yet" instead of D03 under D01', () => {
    expect(emptyProjectOf(store, 'd01-flivideo-tour')).toBe('d01-flivideo-tour');
  });

  it('is not empty when any set belongs to the open project', () => {
    expect(emptyProjectOf(store, 'd03-cutty-presenter-tracking')).toBeNull();
  });

  it('with no context open there is no empty project — the remembered set still opens', () => {
    expect(emptyProjectOf(store, null)).toBeNull();
    expect(pickOpeningSet(store, store, 'cutty-presenter-tracking')).toBe('cutty-presenter-tracking');
  });

  it('never a dead end: the panel still lists every set, one click away', () => {
    const shown = visibleSets(store, 'd01-flivideo-tour', 'project');
    expect(shown.sets).toEqual(store);
    expect(shown.note).toContain('d01-flivideo-tour');
  });
});

describe('with a project open, only ITS sets may open — the remembered one included (B585)', () => {
  const row = (id: string, project: string | null): SetSummary => ({
    id,
    title: id,
    description: '',
    project,
    scriptCount: 1,
  });
  const store = [
    row('cutty-presenter-tracking', 'd03-cutty-presenter-tracking'),
    row('d02-scripts', 'd02-cutty-audio-cleanup'),
    row('cutty-audio-cleanup', 'd02-cutty-audio-cleanup'),
  ];

  it('never reopens another project’s remembered set: D02 open, D03 remembered → a D02 set', () => {
    expect(
      pickOpeningSet(store, store, 'cutty-presenter-tracking', 'd02-cutty-audio-cleanup'),
    ).toBe('d02-scripts');
  });

  it('keeps the remembered set when it belongs to the open project', () => {
    expect(pickOpeningSet(store, store, 'cutty-audio-cleanup', 'd02-cutty-audio-cleanup')).toBe(
      'cutty-audio-cleanup',
    );
  });

  it('with no context, the remembered set still wins wherever it belongs', () => {
    expect(pickOpeningSet(store, store, 'cutty-presenter-tracking', null)).toBe(
      'cutty-presenter-tracking',
    );
  });
});

describe('opening on a readable set when the project file is unreadable (W6 second pass S2)', () => {
  const row = (id: string, project: string | null, unreadable = false): SetSummary => ({
    id,
    title: id,
    description: '',
    project,
    scriptCount: 0,
    unreadable,
    readOnly: unreadable,
  });
  const sets = [row('p1', 'd02-cutty', true), row('p2', 'd02-cutty', true), row('free', null)];
  const shown = sets.filter((entry) => entry.project === 'd02-cutty');

  it('skips a remembered set the core will refuse, and every unreadable row in the shown list', () => {
    expect(pickOpeningSet(sets, shown, 'p1')).toBe('free');
  });

  it('still opens the remembered set when it is readable', () => {
    expect(pickOpeningSet(sets, shown, 'free')).toBe('free');
  });

  it('prefers the first readable row the panel shows', () => {
    const mixed = [row('p1', 'd02-cutty', true), row('p3', 'd02-cutty'), row('free', null)];
    expect(pickOpeningSet(mixed, mixed.slice(0, 2), null)).toBe('p3');
  });

  it('returns null — the shell, not a failure screen — when nothing is readable', () => {
    expect(pickOpeningSet(shown, shown, 'p1')).toBeNull();
  });

  it('the store carries the unreadable file so the panel can name it', () => {
    s().setUnreadableFile({ file: '/x/d02-cutty/fli.tubby.json', message: 'not valid JSON' });
    expect(s().unreadableFile?.file).toBe('/x/d02-cutty/fli.tubby.json');
    s().setUnreadableFile(null);
  });
});

describe('an agent’s stage request, applied by the window (d04 preflight)', () => {
  it('on the same set, switches only the script', () => {
    s().load(JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)));
    const target = KYBERNESIS_PHASE_1.scripts[2]!.id;
    s().applyStageRequest(KYBERNESIS_PHASE_1.id, target);
    expect(s().scriptId).toBe(target);
    expect(s().requestedSetId).toBeNull();
  });

  it('on another set, goes through the panel’s own path and carries the script', () => {
    s().load(JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)));
    s().applyStageRequest('d04-demo-scripts', 'intro');
    expect(s().requestedSetId).toBe('d04-demo-scripts');
    expect(s().requestedScriptId).toBe('intro');
    useProm.setState({ requestedSetId: null, requestedScriptId: null });
  });

  it('ignores a script the loaded set does not have — never a blank stage', () => {
    s().load(JSON.parse(JSON.stringify(KYBERNESIS_PHASE_1)));
    const before = s().scriptId;
    s().applyStageRequest(KYBERNESIS_PHASE_1.id, 'no-such-script');
    expect(s().scriptId).toBe(before);
  });
});

describe('the window after a project folder rename (code is identity)', () => {
  const row = (id: string, project: string | null): SetSummary => ({ id, title: id, description: '', project, scriptCount: 2 });
  const store = [row('d04-d04-autopilot-test-scripts', 'd04-d04-autopilot-test'), row('other', 'd03-cutty')];

  it('still sees the set as the open project’s — never "No script yet"', () => {
    expect(emptyProjectOf(store, 'd04-autopilot-test')).toBeNull();
    expect(pickOpeningSet(store, store, null, 'd04-autopilot-test')).toBe('d04-d04-autopilot-test-scripts');
  });
});
