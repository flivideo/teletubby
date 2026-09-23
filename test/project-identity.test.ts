import { describe, expect, it } from 'vitest';
import { parseProjectFolder } from '@flivideo/core';
import { projectCodeOf, sameProject } from '@shared/domain';

/**
 * PROJECT IDENTITY IS THE CODE (d04 run, 2026-09-23). The folder is renamed;
 * the code is not. `projectCodeOf` mirrors fli-core's rule (the renderer
 * cannot import fli-core), so it is pinned against fli-core's own parser.
 */
describe('project identity', () => {
  const names = ['d04-d04-autopilot-test', 'd04-autopilot-test', 'a01-kybernesis-12-videos', 'plain-folder', 'x1-short', 'D04-upper'];

  it('reads the same code fli-core does', () => {
    for (const name of names) expect(projectCodeOf(name), name).toBe(parseProjectFolder(name)?.code ?? null);
  });

  it('treats a renamed folder as the same project', () => {
    expect(sameProject('d04-d04-autopilot-test', 'd04-autopilot-test')).toBe(true);
    expect(sameProject('d04-autopilot-test', 'd05-autopilot-test')).toBe(false);
  });

  it('matches a folder with no code only exactly — never by accident', () => {
    expect(sameProject('plain-folder', 'plain-folder')).toBe(true);
    expect(sameProject('plain-folder', 'plain-other')).toBe(false);
    expect(sameProject(null, 'd04-x')).toBe(false);
  });
});
