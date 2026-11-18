import { hostname } from 'node:os';
import { describeApp, type CapabilityContract, type DescribeDocument, type UsageTelemetry } from '@flivideo/core';
import { TELETUBBY_CAPABILITIES } from '../core/agent-layer.js';

/**
 * `system_describe` / `GET /api/describe` (RPC Map): Teletubby describes itself with fli-core's `describeApp`. Teletubby has
 * no extensions, so there is ONE part. The commands come from the same contracts as the spec (`TELETUBBY_CAPABILITIES`,
 * keyed by family.verb), so a new verb appears here on its own. The facts below are written from the README and
 * docs/SYSTEM.md and can drift — nothing checks them.
 */

export const PURPOSE =
  'An open-source teleprompter you glance at, not read from: three columns (topic, triggers, transcript) keep a speaker on ' +
  'track while the words stay their own. Scripts, trigger sets, talents and rigs are stored here, a person drives the prompter ' +
  'window, and an agent can author and stage the same material through the same verbs.';

export interface DescribeIdentity {
  version: string;
  gitSha: string | null;
  startedAt: string | null;
}

export function teletubbyDescribe(identity: DescribeIdentity, usage?: UsageTelemetry): DescribeDocument {
  const snap = usage?.snapshot();
  return describeApp({
    app: {
      name: 'teletubby',
      version: identity.version,
      gitSha: identity.gitSha,
      machine: hostname().replace(/\.local$/, ''),
      purpose: PURPOSE,
      startedAt: identity.startedAt,
    },
    parts: [
      {
        kind: 'core',
        capabilities: TELETUBBY_CAPABILITIES as Record<string, CapabilityContract>,
        facts: {
          key: 'teletubby',
          name: 'Teletubby',
          purpose:
            'Holds sets of scripts with their trigger phrases and transcripts, the talents and rigs (window layouts), and the ' +
            'session\'s open brand and project. Shows a script on the prompter, follows the speaker\'s voice, stages what an agent ' +
            'asks for (never while the talent is mid-take), and logs button presses. Every change is audited, rate-limited and, for the ' +
            'risky ones, confirmed first.',
          version: identity.version,
          owner: 'flivideo',
          dataFiles: [
            { path: '<userData>/teletubby.json', access: 'read-write', purpose: 'The store: sets, scripts, trigger sets, transcripts, talents and rigs.' },
            { path: '<userData>/control.json', access: 'write', purpose: 'Port, bearer token and pid of this run (0600), so a caller can find the door.' },
            { path: '<userData>/usage.json', access: 'read-write', purpose: 'How many times each command has been called (counts only).' },
            { path: '<project>/teletubby/press-logs/ (else <userData>/press-logs/)', access: 'write', purpose: 'A log of the presses made while prompting, kept with the project when one is open.' },
            { path: 'fli.studio.json, brands.json (fli-core)', access: 'read', purpose: 'Which brand and project is open, shared with the other Fli apps.' },
          ],
          events: [
            { name: 'control changed', channel: 'Electron IPC (renderer)', purpose: 'A command that really changed data (not a query, a dry run or a refusal) is relayed to every open window so an agent\'s edit shows without a restart.' },
          ],
          settings: [
            { name: 'control port 7111', where: 'src/main/control-server.ts (fixed; loopback only)', purpose: 'Where the door listens; nothing is served off this machine.' },
            { name: 'TELETUBBY_URL / TELETUBBY_TOKEN / TELETUBBY_CONTROL_FILE', where: 'environment (the CLI reads them)', purpose: 'Tell bin/teletubby.mjs which running Teletubby to talk to.' },
            { name: 'TELETUBBY_AS', where: 'environment (the CLI reads it)', purpose: 'The caller name the CLI sends as x-fli-principal.' },
          ],
          docs: [
            { label: 'README', href: 'README.md' },
            { label: 'How it works', href: 'docs/SYSTEM.md' },
            { label: 'API reference', href: '/api/docs' },
            { label: 'Console', href: '/api/console' },
            { label: 'OpenRPC spec', href: '/api/openrpc.json' },
          ],
        },
      },
    ],
    ...(snap ? { usage: snap.verbs, usageSince: snap.since } : {}),
    docs: [
      { label: 'API reference', href: '/api/docs' },
      { label: 'OpenRPC spec', href: '/api/openrpc.json' },
    ],
  });
}
