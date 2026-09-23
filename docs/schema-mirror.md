# Schema mirror

> Generated from the code, not written about it. Do not hand-edit — every line below is anchored to a `file:line` and is re-derived on every run.

- **stack** `typescript` · **extractor** `extract_typescript.py`
- **commit** `806729c89bd7` · **generated** 2026-09-23T03:55:27+00:00
- **scope** include `*.ts`, `*.tsx` · exclude `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `*.stories.tsx`, `*.config.ts`, `*/test/*`, `*/tests/*`, `*/__tests__/*`, `*/e2e/*`, `*/__mocks__/*`, `*/fixtures/*`

| shapes | declared sets | derived sets | gaps | findings |
|---|---|---|---|---|
| 73 | 24 | 4 | 0 | 4 |

> **Read the gaps before trusting the shape.** Derived sets have no declaring symbol and will drift silently the next time one changes. Gaps are things this mirror could not reach — they are not absences in the code.

## Closed sets — declared

One symbol states each set. Adding a member changes that symbol, so these cannot drift.

### `src/core/cadence.CadenceRule.key` — `src/core/cadence.ts:46-54`

*literal union type of `key` - a single declaring symbol*

| value | declared at |
|---|---|
| `length` | `src/core/cadence.ts:47` |
| `breath-group` | `src/core/cadence.ts:48` |
| `break-density` | `src/core/cadence.ts:49` |
| `sentence-variation` | `src/core/cadence.ts:50` |
| `em-dash` | `src/core/cadence.ts:51` |
| `mandatory-terms` | `src/core/cadence.ts:52` |
| `anti-voice` | `src/core/cadence.ts:53` |
| `bookends` | `src/core/cadence.ts:54` |

### `src/core/open-context.OPEN_REFUSAL_CODES` — `src/core/open-context.ts:35-42`

*`as const` array `OPEN_REFUSAL_CODES`, typed from by `typeof OPEN_REFUSAL_CODES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `missing` | `src/core/open-context.ts:36` |
| `unknown-brand` | `src/core/open-context.ts:37` |
| `no-brand-root` | `src/core/open-context.ts:38` |
| `registry-unreadable` | `src/core/open-context.ts:39` |
| `project-not-found` | `src/core/open-context.ts:40` |
| `project-ambiguous` | `src/core/open-context.ts:41` |

### `src/core/open-context.OpenContext.membership` — `src/core/open-context.ts:62`

*literal union type of `membership` - a single declaring symbol*

| value | declared at |
|---|---|
| `project` | `src/core/open-context.ts:62` |
| `folder` | `src/core/open-context.ts:62` |

### `src/core/open-context.OpenResolution.kind` — `src/core/open-context.ts:65-67`

*the `kind` discriminator of union type `OpenResolution` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `resolved` | `src/core/open-context.ts:66` |
| `refused` | `src/core/open-context.ts:67` |

### `src/main/process-supervisor.ProcessStatus` — `src/main/process-supervisor.ts:11`

*literal union type alias `ProcessStatus` - a single declaring symbol*

| value | declared at |
|---|---|
| `running` | `src/main/process-supervisor.ts:11` |
| `exited` | `src/main/process-supervisor.ts:11` |
| `error` | `src/main/process-supervisor.ts:11` |

### `src/main/process-supervisor.LogChunk.stream` — `src/main/process-supervisor.ts:13`

*literal union type of `stream` - a single declaring symbol*

| value | declared at |
|---|---|
| `stdout` | `src/main/process-supervisor.ts:13` |
| `stderr` | `src/main/process-supervisor.ts:13` |

### `src/main/updater.UpdateStatus` — `src/main/updater.ts:4-5`

*literal union type alias `UpdateStatus` - a single declaring symbol*

| value | declared at |
|---|---|
| `idle` | `src/main/updater.ts:5` |
| `checking` | `src/main/updater.ts:5` |
| `available` | `src/main/updater.ts:5` |
| `not-available` | `src/main/updater.ts:5` |
| `downloading` | `src/main/updater.ts:5` |
| `downloaded` | `src/main/updater.ts:5` |
| `error` | `src/main/updater.ts:5` |

### `src/renderer/src/store.ZONES` — `src/renderer/src/store.ts:70`

*`as const` array `ZONES`, typed from by `typeof ZONES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/renderer/src/store.ts:70` |
| `minor` | `src/renderer/src/store.ts:70` |
| `triggers` | `src/renderer/src/store.ts:70` |
| `paragraph` | `src/renderer/src/store.ts:70` |
| `transcript` | `src/renderer/src/store.ts:70` |

### `src/renderer/src/store.SetSummary.source` — `src/renderer/src/store.ts:267`

*literal union type of `source` - a single declaring symbol*

| value | declared at |
|---|---|
| `project` | `src/renderer/src/store.ts:267` |
| `store` | `src/renderer/src/store.ts:267` |

### `src/renderer/src/store.SetFilter` — `src/renderer/src/store.ts:326`

*literal union type alias `SetFilter` - a single declaring symbol*

| value | declared at |
|---|---|
| `project` | `src/renderer/src/store.ts:326` |
| `all` | `src/renderer/src/store.ts:326` |

### `src/renderer/src/store.StageHold.reason` — `src/renderer/src/store.ts:334`

*literal union type of `reason` - a single declaring symbol*

| value | declared at |
|---|---|
| `project-closed` | `src/renderer/src/store.ts:334` |
| `unreadable` | `src/renderer/src/store.ts:334` |

### `src/renderer/src/store.Rank` — `src/renderer/src/store.ts:1179`

*literal union type alias `Rank` - a single declaring symbol*

| value | declared at |
|---|---|
| `driven` | `src/renderer/src/store.ts:1179` |
| `follower` | `src/renderer/src/store.ts:1179` |

### `src/shared/capabilities.PRINCIPALS` — `src/shared/capabilities.ts:36`

*`as const` array `PRINCIPALS`, typed from by `typeof PRINCIPALS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `ui` | `src/shared/capabilities.ts:36` |
| `agent` | `src/shared/capabilities.ts:36` |

### `src/shared/capabilities.SIDE_EFFECTS` — `src/shared/capabilities.ts:43-48`

*`as const` array `SIDE_EFFECTS`, typed from by `typeof SIDE_EFFECTS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `read-only` | `src/shared/capabilities.ts:44` |
| `reversible-write` | `src/shared/capabilities.ts:45` |
| `destructive` | `src/shared/capabilities.ts:46` |
| `external-side-effect` | `src/shared/capabilities.ts:47` |

### `src/shared/capabilities.CapabilityKind` — `src/shared/capabilities.ts:51`

*literal union type alias `CapabilityKind` - a single declaring symbol*

| value | declared at |
|---|---|
| `query` | `src/shared/capabilities.ts:51` |
| `command` | `src/shared/capabilities.ts:51` |

### `src/shared/capabilities.ERROR_CODES` — `src/shared/capabilities.ts:59-70`

*`as const` array `ERROR_CODES`, typed from by `typeof ERROR_CODES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `not_found` | `src/shared/capabilities.ts:60` |
| `invalid_input` | `src/shared/capabilities.ts:61` |
| `domain_invalid` | `src/shared/capabilities.ts:62` |
| `conflict` | `src/shared/capabilities.ts:63` |
| `permission_denied` | `src/shared/capabilities.ts:64` |
| `confirmation_required` | `src/shared/capabilities.ts:65` |
| `confirmation_invalid` | `src/shared/capabilities.ts:66` |
| `rate_limited` | `src/shared/capabilities.ts:67` |
| `unavailable` | `src/shared/capabilities.ts:68` |
| `internal` | `src/shared/capabilities.ts:69` |

### `src/shared/capabilities.InvokeResult.ok` — `src/shared/capabilities.ts:369-370`

*the `ok` discriminator of union type `InvokeResult` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `true` | `src/shared/capabilities.ts:370` |
| `false` | `src/shared/capabilities.ts:370` |

### `src/shared/domain.TRANSCRIPT_KINDS` — `src/shared/domain.ts:65`

*`as const` array `TRANSCRIPT_KINDS`, typed from by `typeof TRANSCRIPT_KINDS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `provenance` | `src/shared/domain.ts:65` |
| `cadence` | `src/shared/domain.ts:65` |

### `src/shared/domain.TRIGGER_STYLES` — `src/shared/domain.ts:80`

*`as const` array `TRIGGER_STYLES`, typed from by `typeof TRIGGER_STYLES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `near-verbatim` | `src/shared/domain.ts:80` |
| `compressed-concept` | `src/shared/domain.ts:80` |
| `loose-keywords` | `src/shared/domain.ts:80` |

### `src/shared/domain.AUTHORSHIPS` — `src/shared/domain.ts:91`

*`as const` array `AUTHORSHIPS`, typed from by `typeof AUTHORSHIPS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `hand` | `src/shared/domain.ts:91` |
| `agent` | `src/shared/domain.ts:91` |

### `src/shared/ipc.ControlChanged.principal` — `src/shared/ipc.ts:57`

*literal union type of `principal` - a single declaring symbol*

| value | declared at |
|---|---|
| `ui` | `src/shared/ipc.ts:57` |
| `agent` | `src/shared/ipc.ts:57` |

### `src/shared/rig.RECORDING_SET` — `src/shared/rig.ts:47`

*`as const` array `RECORDING_SET`, typed from by `typeof RECORDING_SET[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/shared/rig.ts:47` |
| `minor` | `src/shared/rig.ts:47` |
| `triggers` | `src/shared/rig.ts:47` |
| `paragraph` | `src/shared/rig.ts:47` |

### `src/shared/rig.CAMERA_SIDES` — `src/shared/rig.ts:51`

*`as const` array `CAMERA_SIDES`, typed from by `typeof CAMERA_SIDES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `left` | `src/shared/rig.ts:51` |
| `right` | `src/shared/rig.ts:51` |

### `src/shared/rig.TEXT_PRESETS` — `src/shared/rig.ts:55`

*`as const` array `TEXT_PRESETS`, typed from by `typeof TEXT_PRESETS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `standard` | `src/shared/rig.ts:55` |
| `large` | `src/shared/rig.ts:55` |
| `stage` | `src/shared/rig.ts:55` |

## Closed sets — derived (no declaring symbol)

Each set below was read out of the real authority — control flow, membership tests, dispatch tables — because nothing declares it. **Correct as of this commit and fragile after it.** Each carries the refactor that would make it declared.

### `src/core/input-shapes.def.typeName (switch)` — `src/core/input-shapes.ts:341`

*`switch` on `def.typeName` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `ZodOptional` | `src/core/input-shapes.ts:342` |
| `ZodNullable` | `src/core/input-shapes.ts:343` |
| `ZodDefault` | `src/core/input-shapes.ts:344` |
| `ZodEffects` | `src/core/input-shapes.ts:346` |
| `ZodString` | `src/core/input-shapes.ts:348` |
| `ZodNumber` | `src/core/input-shapes.ts:350` |
| `ZodBoolean` | `src/core/input-shapes.ts:352` |
| `ZodEnum` | `src/core/input-shapes.ts:354` |
| `ZodArray` | `src/core/input-shapes.ts:356` |
| `ZodObject` | `src/core/input-shapes.ts:358` |

> **REFACTOR: `def.typeName` is a closed set enforced only by control flow at src/core/input-shapes.ts:341. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/main/control-server.result.error.code (switch)` — `src/main/control-server.ts:255`

*`switch` on `result.error.code` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `not_found` | `src/main/control-server.ts:256` |
| `invalid_input` | `src/main/control-server.ts:258` |
| `domain_invalid` | `src/main/control-server.ts:259` |
| `permission_denied` | `src/main/control-server.ts:261` |
| `confirmation_required` | `src/main/control-server.ts:262` |
| `confirmation_invalid` | `src/main/control-server.ts:263` |
| `conflict` | `src/main/control-server.ts:265` |
| `rate_limited` | `src/main/control-server.ts:267` |
| `unavailable` | `src/main/control-server.ts:269` |

> **REFACTOR: `result.error.code` is a closed set enforced only by control flow at src/main/control-server.ts:255. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/renderer/src/App.e.key (switch)` — `src/renderer/src/App.tsx:665`

*`switch` on `e.key` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `ArrowDown` | `src/renderer/src/App.tsx:666` |
| ` ` | `src/renderer/src/App.tsx:667` |
| `ArrowUp` | `src/renderer/src/App.tsx:671` |
| `t` | `src/renderer/src/App.tsx:675` |
| `T` | `src/renderer/src/App.tsx:676` |
| `s` | `src/renderer/src/App.tsx:683` |
| `S` | `src/renderer/src/App.tsx:684` |
| `Escape` | `src/renderer/src/App.tsx:687` |
| `d` | `src/renderer/src/App.tsx:690` |
| `D` | `src/renderer/src/App.tsx:691` |
| `m` | `src/renderer/src/App.tsx:694` |
| `M` | `src/renderer/src/App.tsx:695` |
| `f` | `src/renderer/src/App.tsx:698` |
| `F` | `src/renderer/src/App.tsx:699` |

> **REFACTOR: `e.key` is a closed set enforced only by control flow at src/renderer/src/App.tsx:665. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/renderer/src/App.zone (switch)` — `src/renderer/src/App.tsx:737`

*`switch` on `zone` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `major` | `src/renderer/src/App.tsx:738` |
| `minor` | `src/renderer/src/App.tsx:748` |
| `triggers` | `src/renderer/src/App.tsx:758` |
| `paragraph` | `src/renderer/src/App.tsx:762` |

> **REFACTOR: `zone` is a closed set enforced only by control flow at src/renderer/src/App.tsx:737. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

## Shapes

### `src/core/active-context.ActiveSelection` — interface — `src/core/active-context.ts:29-36`

| field | type | default | at |
|---|---|---|---|
| `setId` | `SetId | null → SetId (@shared/domain)` | — | `src/core/active-context.ts:30` |
| `scriptId` | `ScriptId | null → ScriptId (@shared/domain)` | — | `src/core/active-context.ts:31` |
| `transcriptId` | `TranscriptId | null → TranscriptId (@shared/domain)` | — | `src/core/active-context.ts:32` |
| `style` | `TriggerStyle | null → TriggerStyle (@shared/domain)` | — | `src/core/active-context.ts:33` |
| `step` | `number | null` | — | `src/core/active-context.ts:35` |

### `src/core/cadence.CadenceMeasurements` — interface — `src/core/cadence.ts:29-42`

| field | type | default | at |
|---|---|---|---|
| `words` | `number` | — | `src/core/cadence.ts:30` |
| `sentences` | `number` | — | `src/core/cadence.ts:31` |
| `sentenceMean` | `number` | — | `src/core/cadence.ts:32` |
| `sentenceSd` | `number` | — | `src/core/cadence.ts:34` |
| `breathGroupMean` | `number` | — | `src/core/cadence.ts:36` |
| `breaksPer100` | `number` | — | `src/core/cadence.ts:37` |
| `emDash` | `number` | — | `src/core/cadence.ts:38` |
| `antiVoice` | `string[]` | — | `src/core/cadence.ts:39` |
| `bookends` | `string[]` | — | `src/core/cadence.ts:40` |
| `missingTerms` | `string[]` | — | `src/core/cadence.ts:41` |

### `src/core/cadence.CadenceRule` — interface — `src/core/cadence.ts:44-60`

| field | type | default | at |
|---|---|---|---|
| `key` | `| 'length' | 'breath-group' | 'break-density' | 'sentence-variation' | 'em-dash' | 'mandatory-terms' | 'anti-voice' | 'bookends'` | — | `src/core/cadence.ts:46` |
| `label` | `string` | — | `src/core/cadence.ts:55` |
| `pass` | `boolean` | — | `src/core/cadence.ts:56` |
| `actual` | `string` | — | `src/core/cadence.ts:58` |
| `target` | `string` | — | `src/core/cadence.ts:59` |

### `src/core/cadence.CadenceScore` — interface — `src/core/cadence.ts:62-68`

| field | type | default | at |
|---|---|---|---|
| `pass` | `boolean` | — | `src/core/cadence.ts:63` |
| `measurements` | `CadenceMeasurements → src/core/cadence.CadenceMeasurements` | — | `src/core/cadence.ts:64` |
| `rules` | `CadenceRule[] → src/core/cadence.CadenceRule` | — | `src/core/cadence.ts:65` |
| `envelopeSource` | `string` | — | `src/core/cadence.ts:67` |

### `src/core/handlers.HandlerContext` — interface — `src/core/handlers.ts:77-90`

| field | type | default | at |
|---|---|---|---|
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/handlers.ts:78` |
| `active` | `ActiveContextHolder` | — | `src/core/handlers.ts:79` |
| `openContext` | `OpenContextHolder` | — | `src/core/handlers.ts:81` |
| `confirmations` | `ConfirmationLedger` | — | `src/core/handlers.ts:82` |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/handlers.ts:83` |
| `capability` | `CapabilityMeta → CapabilityMeta (@shared/capabilities)` | — | `src/core/handlers.ts:84` |
| `dryRun` | `boolean` | — | `src/core/handlers.ts:86` |
| `confirmationId` | `?: string` | — | `src/core/handlers.ts:87` |
| `recordPrior` | `(prior: unknown) => void` | — | `src/core/handlers.ts:89` |

### `src/core/handlers.Resolved` — interface — `src/core/handlers.ts:131-136`

| field | type | default | at |
|---|---|---|---|
| `document` | `RepositoryDocument → src/core/repository.RepositoryDocument` | — | `src/core/handlers.ts:132` |
| `set` | `ScriptSet → ScriptSet (@shared/domain)` | — | `src/core/handlers.ts:133` |
| `script` | `Script → Script (@shared/domain)` | — | `src/core/handlers.ts:134` |
| `transcript` | `Transcript → Transcript (@shared/domain)` | — | `src/core/handlers.ts:135` |

### `src/core/handlers.MaybeUnreadable` — type — `src/core/handlers.ts:315`

*extends* `ScriptSet`

*No annotated fields found — this shape declares its fields elsewhere.*

### `src/core/index.CoreOptions` — interface — `src/core/index.ts:40-46`

| field | type | default | at |
|---|---|---|---|
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/index.ts:41` |
| `clock` | `?: Clock → src/core/safety.Clock` | — | `src/core/index.ts:43` |
| `auditSink` | `?: (entry: AuditEntry) => void → src/core/safety.AuditEntry` | — | `src/core/index.ts:45` |

### `src/core/index.InvokeOptions` — interface — `src/core/index.ts:48-51`

| field | type | default | at |
|---|---|---|---|
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/index.ts:49` |
| `idempotencyKey` | `?: string` | — | `src/core/index.ts:50` |

### `src/core/index.ChangeEvent` — interface — `src/core/index.ts:63-67`

Emitted after a command actually changes the DATA — not on a query, not on a

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/core/index.ts:64` |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/index.ts:65` |
| `at` | `number` | — | `src/core/index.ts:66` |

### `src/core/index.Core` — interface — `src/core/index.ts:69-79`

| field | type | default | at |
|---|---|---|---|
| `invoke` | `(name: string, input: unknown, options: InvokeOptions): Promise<InvokeResult>` | — | `src/core/index.ts:70` |
| `onChange` | `(listener: (event: ChangeEvent) => void): () => void` | — | `src/core/index.ts:72` |
| `active` | `ActiveContextHolder` | — | `src/core/index.ts:74` |
| `openContext` | `OpenContextHolder` | — | `src/core/index.ts:76` |
| `audit` | `AuditLog` | — | `src/core/index.ts:77` |
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/index.ts:78` |

### `src/core/input-shapes.InputField` — interface — `src/core/input-shapes.ts:317-330`

| field | type | default | at |
|---|---|---|---|
| `name` | `string` | — | `src/core/input-shapes.ts:318` |
| `type` | `string` | — | `src/core/input-shapes.ts:319` |
| `required` | `boolean` | — | `src/core/input-shapes.ts:320` |
| `default` | `?: unknown` | — | `src/core/input-shapes.ts:328` |
| `note` | `?: string` | — | `src/core/input-shapes.ts:329` |

### `src/core/open-context.OpenRefusal` — interface — `src/core/open-context.ts:45-52`

| field | type | default | at |
|---|---|---|---|
| `code` | `OpenRefusalCode → src/core/open-context.OpenRefusalCode` | — | `src/core/open-context.ts:46` |
| `message` | `string` | — | `src/core/open-context.ts:47` |
| `missing` | `?: string[]` | — | `src/core/open-context.ts:49` |
| `candidates` | `?: string[]` | — | `src/core/open-context.ts:51` |

### `src/core/open-context.OpenContext` — interface — `src/core/open-context.ts:54-63`

| field | type | default | at |
|---|---|---|---|
| `brand` | `string` | — | `src/core/open-context.ts:56` |
| `brandRoot` | `string` | — | `src/core/open-context.ts:58` |
| `project` | `string` | — | `src/core/open-context.ts:60` |
| `membership` | `'project' | 'folder'` | — | `src/core/open-context.ts:62` |

### `src/core/open-context.OpenResolution` — type-union on `kind` — `src/core/open-context.ts:65-67`

| field | type | default | at |
|---|---|---|---|
| `resolved` | `{ kind: 'resolved'; context: OpenContext }` | — | `src/core/open-context.ts:66` |
| `refused` | `{ kind: 'refused'; refusal: OpenRefusal }` | — | `src/core/open-context.ts:67` |

### `src/core/open-context.OpenResolution[kind=resolved]` — type — `src/core/open-context.ts:66`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'resolved'` | — | `src/core/open-context.ts:66` |
| `context` | `OpenContext → src/core/open-context.OpenContext` | — | `src/core/open-context.ts:66` |

### `src/core/open-context.OpenResolution[kind=refused]` — type — `src/core/open-context.ts:67`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'refused'` | — | `src/core/open-context.ts:67` |
| `refusal` | `OpenRefusal → src/core/open-context.OpenRefusal` | — | `src/core/open-context.ts:67` |

### `src/core/open-context.ResolveOpenArgsOptions` — interface — `src/core/open-context.ts:69-72`

| field | type | default | at |
|---|---|---|---|
| `home` | `?: string` | — | `src/core/open-context.ts:71` |

### `src/core/open-context.ContextReport` — interface — `src/core/open-context.ts:239-242`

| field | type | default | at |
|---|---|---|---|
| `context` | `OpenContext | null → src/core/open-context.OpenContext` | — | `src/core/open-context.ts:240` |
| `refused` | `?: OpenRefusal → src/core/open-context.OpenRefusal` | — | `src/core/open-context.ts:241` |

### `src/core/project-store.UnreadableProjectFile` — interface — `src/core/project-store.ts:98-101`

| field | type | default | at |
|---|---|---|---|
| `file` | `string` | — | `src/core/project-store.ts:99` |
| `message` | `string` | — | `src/core/project-store.ts:100` |

### `src/core/repository.RepositoryDocument` — interface — `src/core/repository.ts:24-33`

| field | type | default | at |
|---|---|---|---|
| `version` | `2` | — | `src/core/repository.ts:26` |
| `sets` | `ScriptSet[] → ScriptSet (@shared/domain)` | — | `src/core/repository.ts:27` |
| `talents` | `Talent[] → Talent (@shared/domain)` | — | `src/core/repository.ts:28` |
| `rigs` | `Rig[] → Rig (@shared/rig)` | — | `src/core/repository.ts:30` |
| `workspace` | `Workspace → Workspace (@shared/rig)` | — | `src/core/repository.ts:32` |

### `src/core/repository.Repository` — interface — `src/core/repository.ts:66-75`

| field | type | default | at |
|---|---|---|---|
| `read` | `(): Promise<RepositoryDocument>` | — | `src/core/repository.ts:67` |
| `update` | `<T>(fn: (document: RepositoryDocument) => { document: RepositoryDocument; result: T; }): Promise<T>` | — | `src/core/repository.ts:69` |

### `src/core/safety.PendingAction` — interface — `src/core/safety.ts:107-120`

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/core/safety.ts:108` |
| `capability` | `string` | — | `src/core/safety.ts:109` |
| `requestedBy` | `Principal → Principal (@shared/capabilities)` | — | `src/core/safety.ts:111` |
| `preview` | `unknown` | — | `src/core/safety.ts:113` |
| `inputFingerprint` | `string` | — | `src/core/safety.ts:115` |
| `createdAt` | `number` | — | `src/core/safety.ts:116` |
| `expiresAt` | `number` | — | `src/core/safety.ts:117` |
| `approved` | `boolean` | — | `src/core/safety.ts:118` |
| `approvedAt` | `number | null` | — | `src/core/safety.ts:119` |

### `src/core/safety.AuditEntry` — interface — `src/core/safety.ts:288-303`

| field | type | default | at |
|---|---|---|---|
| `at` | `number` | — | `src/core/safety.ts:289` |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/safety.ts:291` |
| `capability` | `string` | — | `src/core/safety.ts:292` |
| `input` | `unknown` | — | `src/core/safety.ts:293` |
| `ok` | `boolean` | — | `src/core/safety.ts:294` |
| `errorCode` | `?: ErrorCode → ErrorCode (@shared/capabilities)` | — | `src/core/safety.ts:295` |
| `prior` | `?: unknown` | — | `src/core/safety.ts:300` |
| `dryRun` | `?: boolean` | — | `src/core/safety.ts:301` |
| `replayed` | `?: boolean` | — | `src/core/safety.ts:302` |

### `src/core/text-script.TextScriptInput` — interface — `src/core/text-script.ts:21-33`

| field | type | default | at |
|---|---|---|---|
| `id` | `?: string` | — | `src/core/text-script.ts:23` |
| `name` | `string` | — | `src/core/text-script.ts:24` |
| `text` | `string` | — | `src/core/text-script.ts:25` |
| `video` | `?: string | null` | — | `src/core/text-script.ts:26` |
| `takeaway` | `?: string` | — | `src/core/text-script.ts:27` |
| `source` | `?: string` | — | `src/core/text-script.ts:28` |
| `triggers` | `?: { style: TriggerStyle; items: { text: string; paragraph: number }[]; } → TriggerStyle (@shared/domain)` | — | `src/core/text-script.ts:29` |

### `src/core/text-script.TextScriptInput.triggers` — type — `src/core/text-script.ts:29-32`

| field | type | default | at |
|---|---|---|---|
| `style` | `TriggerStyle → TriggerStyle (@shared/domain)` | — | `src/core/text-script.ts:30` |
| `items` | `{ text: string; paragraph: number }[]` | — | `src/core/text-script.ts:31` |

### `src/main/control-server.ControlServerOptions` — interface — `src/main/control-server.ts:35-42`

| field | type | default | at |
|---|---|---|---|
| `core` | `Core → src/core/index.Core` | — | `src/main/control-server.ts:36` |
| `userDataPath` | `string` | — | `src/main/control-server.ts:38` |
| `port` | `?: number` | — | `src/main/control-server.ts:39` |
| `appVersion` | `string` | — | `src/main/control-server.ts:40` |
| `log` | `?: (message: string, detail?: unknown) => void` | — | `src/main/control-server.ts:41` |

### `src/main/control-server.ControlServerHandle` — interface — `src/main/control-server.ts:44-51`

| field | type | default | at |
|---|---|---|---|
| `port` | `number` | — | `src/main/control-server.ts:45` |
| `address` | `string` | — | `src/main/control-server.ts:47` |
| `token` | `string` | — | `src/main/control-server.ts:48` |
| `discoveryPath` | `string` | — | `src/main/control-server.ts:49` |
| `close` | `(): Promise<void>` | — | `src/main/control-server.ts:50` |

### `src/main/create-console.ConsoleContext` — interface — `src/main/create-console.ts:7-12`

| field | type | default | at |
|---|---|---|---|
| `logger` | `Logger → Logger (@appydave/core)` | — | `src/main/create-console.ts:8` |
| `windows` | `WindowManager` | — | `src/main/create-console.ts:9` |
| `ipc` | `IpcRouter` | — | `src/main/create-console.ts:10` |
| `processes` | `ProcessSupervisor` | — | `src/main/create-console.ts:11` |

### `src/main/create-console.Console` — interface — `src/main/create-console.ts:14-17`

*extends* `ConsoleContext`

| field | type | default | at |
|---|---|---|---|
| `lifecycle` | `Lifecycle → Lifecycle (@appydave/core)` | — | `src/main/create-console.ts:15` |
| `start` | `(): Promise<void>` | — | `src/main/create-console.ts:16` |

### `src/main/create-console.CreateConsoleOptions` — interface — `src/main/create-console.ts:19-26`

| field | type | default | at |
|---|---|---|---|
| `name` | `string` | — | `src/main/create-console.ts:21` |
| `registerIpc` | `?: (ctx: ConsoleContext) => void → src/main/create-console.ConsoleContext` | — | `src/main/create-console.ts:23` |
| `onReady` | `(ctx: ConsoleContext) => void → src/main/create-console.ConsoleContext` | — | `src/main/create-console.ts:25` |

### `src/main/file-author.FileAuthorOptions` — interface — `src/main/file-author.ts:9-14`

| field | type | default | at |
|---|---|---|---|
| `root` | `string` | — | `src/main/file-author.ts:11` |
| `git` | `?: boolean` | — | `src/main/file-author.ts:13` |

### `src/main/file-author.AuthorResult` — interface — `src/main/file-author.ts:16-22`

| field | type | default | at |
|---|---|---|---|
| `path` | `string` | — | `src/main/file-author.ts:18` |
| `committed` | `boolean` | — | `src/main/file-author.ts:19` |
| `commit` | `?: string` | — | `src/main/file-author.ts:21` |

### `src/main/ipc-router.HandlerDef` — interface — `src/main/ipc-router.ts:4-10`

| field | type | default | at |
|---|---|---|---|
| `channel` | `string` | — | `src/main/ipc-router.ts:6` |
| `input` | `?: z.ZodType<In> → "/Users/davidcruwys/dev/ad/flivideo/teletubby/node_modules/zod/v3/external" (@appydave/core), ZodType (node_modules/zod/v3/types.d.cts)` | — | `src/main/ipc-router.ts:8` |
| `handle` | `(input: In) => Promise<Out> | Out → Promise (node_modules/typescript/lib/lib.es2015.promise.d.ts)` | — | `src/main/ipc-router.ts:9` |

### `src/main/process-supervisor.SpawnOptions` — interface — `src/main/process-supervisor.ts:4-9`

| field | type | default | at |
|---|---|---|---|
| `command` | `string` | — | `src/main/process-supervisor.ts:5` |
| `args` | `?: string[]` | — | `src/main/process-supervisor.ts:6` |
| `cwd` | `?: string` | — | `src/main/process-supervisor.ts:7` |
| `env` | `?: NodeJS.ProcessEnv → NodeJS (node_modules/@types/node/compatibility/iterators.d.ts), ProcessEnv (node_modules/@types/node/process.d.ts)` | — | `src/main/process-supervisor.ts:8` |

### `src/main/process-supervisor.LogChunk` — interface — `src/main/process-supervisor.ts:12-15`

| field | type | default | at |
|---|---|---|---|
| `stream` | `'stdout' | 'stderr'` | — | `src/main/process-supervisor.ts:13` |
| `data` | `string` | — | `src/main/process-supervisor.ts:14` |

### `src/main/process-supervisor.ManagedProcess` — interface — `src/main/process-supervisor.ts:17-24`

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/main/process-supervisor.ts:18` |
| `pid` | `number | undefined` | — | `src/main/process-supervisor.ts:19` |
| `status` | `ProcessStatus → src/main/process-supervisor.ProcessStatus` | — | `src/main/process-supervisor.ts:20` |
| `onLog` | `(cb: (chunk: LogChunk) => void): () => void` | — | `src/main/process-supervisor.ts:21` |
| `onExit` | `(cb: (code: number | null) => void): () => void` | — | `src/main/process-supervisor.ts:22` |
| `stop` | `(signal?: NodeJS.Signals): void` | — | `src/main/process-supervisor.ts:23` |

### `src/main/updater.UpdateState` — interface — `src/main/updater.ts:7-12`

| field | type | default | at |
|---|---|---|---|
| `status` | `UpdateStatus → src/main/updater.UpdateStatus` | — | `src/main/updater.ts:8` |
| `version` | `?: string` | — | `src/main/updater.ts:9` |
| `percent` | `?: number` | — | `src/main/updater.ts:10` |
| `error` | `?: string` | — | `src/main/updater.ts:11` |

### `src/main/updater.UpdaterOptions` — interface — `src/main/updater.ts:14-18`

| field | type | default | at |
|---|---|---|---|
| `logger` | `?: Logger → Logger (@appydave/core)` | — | `src/main/updater.ts:15` |
| `autoDownload` | `?: boolean` | — | `src/main/updater.ts:17` |

### `src/main/window-manager.WindowOptions` — interface — `src/main/window-manager.ts:4-13`

| field | type | default | at |
|---|---|---|---|
| `width` | `?: number` | — | `src/main/window-manager.ts:5` |
| `height` | `?: number` | — | `src/main/window-manager.ts:6` |
| `x` | `?: number` | — | `src/main/window-manager.ts:8` |
| `y` | `?: number` | — | `src/main/window-manager.ts:9` |
| `minWidth` | `?: number` | — | `src/main/window-manager.ts:10` |
| `minHeight` | `?: number` | — | `src/main/window-manager.ts:11` |
| `title` | `?: string` | — | `src/main/window-manager.ts:12` |

### `src/renderer/src/components/CadencePanel.Rule` — interface — `src/renderer/src/components/CadencePanel.tsx:23-29`

WHAT "CADENCE" ACTUALLY MEANS, shown in the app.

| field | type | default | at |
|---|---|---|---|
| `key` | `string` | — | `src/renderer/src/components/CadencePanel.tsx:24` |
| `label` | `string` | — | `src/renderer/src/components/CadencePanel.tsx:25` |
| `pass` | `boolean` | — | `src/renderer/src/components/CadencePanel.tsx:26` |
| `actual` | `string` | — | `src/renderer/src/components/CadencePanel.tsx:27` |
| `target` | `string` | — | `src/renderer/src/components/CadencePanel.tsx:28` |

### `src/renderer/src/components/CadencePanel.Score` — interface — `src/renderer/src/components/CadencePanel.tsx:31-35`

| field | type | default | at |
|---|---|---|---|
| `pass` | `boolean` | — | `src/renderer/src/components/CadencePanel.tsx:32` |
| `rules` | `Rule[] → src/renderer/src/components/CadencePanel.Rule` | — | `src/renderer/src/components/CadencePanel.tsx:33` |
| `envelopeSource` | `string` | — | `src/renderer/src/components/CadencePanel.tsx:34` |

### `src/renderer/src/store.CueCard` — interface — `src/renderer/src/store.ts:96-101`

| field | type | default | at |
|---|---|---|---|
| `label` | `string` | — | `src/renderer/src/store.ts:97` |
| `title` | `string` | — | `src/renderer/src/store.ts:98` |
| `token` | `number` | — | `src/renderer/src/store.ts:100` |

### `src/renderer/src/store.PrompterState` — interface — `src/renderer/src/store.ts:103-245`

| field | type | default | at |
|---|---|---|---|
| `set` | `ScriptSet | null → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:105` |
| `scriptId` | `string | null` | — | `src/renderer/src/store.ts:106` |
| `transcriptId` | `string | null` | — | `src/renderer/src/store.ts:107` |
| `style` | `TriggerStyle | null → TriggerStyle (@shared/domain)` | — | `src/renderer/src/store.ts:108` |
| `step` | `number` | — | `src/renderer/src/store.ts:111` |
| `visible` | `RecordingZone[] → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:113` |
| `driven` | `RecordingZone → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:114` |
| `weights` | `Record<RecordingZone, number> → Record (node_modules/typescript/lib/lib.es5.d.ts), RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:120` |
| `camera` | `CameraSide → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:121` |
| `transcriptOpen` | `boolean` | — | `src/renderer/src/store.ts:123` |
| `transcriptEdge` | `CameraSide → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:124` |
| `setupOpen` | `boolean` | — | `src/renderer/src/store.ts:141` |
| `mirror` | `boolean` | — | `src/renderer/src/store.ts:143` |
| `focus` | `boolean` | — | `src/renderer/src/store.ts:144` |
| `text` | `TextPreset → TextPreset (@shared/rig)` | — | `src/renderer/src/store.ts:145` |
| `rigs` | `Rig[] → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:155` |
| `rigId` | `string | null` | — | `src/renderer/src/store.ts:156` |
| `rigsLoaded` | `boolean` | — | `src/renderer/src/store.ts:165` |
| `restoredLayout` | `boolean` | — | `src/renderer/src/store.ts:172` |
| `pendingPosition` | `WorkspacePosition | null → WorkspacePosition (@shared/rig)` | — | `src/renderer/src/store.ts:180` |
| `freshTranscripts` | `Record<string, string[]> → Record (node_modules/typescript/lib/lib.es5.d.ts)` | — | `src/renderer/src/store.ts:191` |
| `cue` | `CueCard | null → src/renderer/src/store.CueCard` | — | `src/renderer/src/store.ts:193` |
| `nudge` | `number` | — | `src/renderer/src/store.ts:195` |
| `load` | `(set: ScriptSet) => void → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:197` |
| `refresh` | `(set: ScriptSet) => void → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:198` |
| `stepNext` | `() => void` | — | `src/renderer/src/store.ts:199` |
| `stepPrev` | `() => void` | — | `src/renderer/src/store.ts:200` |
| `selectScript` | `(scriptId: string) => void` | — | `src/renderer/src/store.ts:201` |
| `goToNextScript` | `() => void` | — | `src/renderer/src/store.ts:202` |
| `goToPrevScript` | `() => void` | — | `src/renderer/src/store.ts:203` |
| `selectTranscript` | `(transcriptId: string) => void` | — | `src/renderer/src/store.ts:204` |
| `selectStyle` | `(style: TriggerStyle) => void → TriggerStyle (@shared/domain)` | — | `src/renderer/src/store.ts:205` |
| `toggleZone` | `(zone: RecordingZone) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:206` |
| `setDriven` | `(zone: RecordingZone) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:207` |
| `setCamera` | `(side: CameraSide) => void → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:208` |
| `resizeZones` | `(left: RecordingZone, right: RecordingZone, deltaPx: number) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:209` |
| `toggleTranscript` | `() => void` | — | `src/renderer/src/store.ts:210` |
| `toggleSetup` | `() => void` | — | `src/renderer/src/store.ts:211` |
| `closeSetup` | `() => void` | — | `src/renderer/src/store.ts:212` |
| `toggleMirror` | `() => void` | — | `src/renderer/src/store.ts:213` |
| `toggleFocus` | `() => void` | — | `src/renderer/src/store.ts:214` |
| `setText` | `(preset: TextPreset) => void → TextPreset (@shared/rig)` | — | `src/renderer/src/store.ts:215` |
| `loadRigs` | `(rigs: Rig[], workspace: Workspace) => void → Rig (@shared/rig), Workspace (@shared/rig)` | — | `src/renderer/src/store.ts:216` |
| `setRigs` | `(rigs: Rig[]) => void → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:217` |
| `sets` | `SetSummary[] → src/renderer/src/store.SetSummary` | — | `src/renderer/src/store.ts:224` |
| `setSets` | `(sets: SetSummary[]) => void → src/renderer/src/store.SetSummary` | — | `src/renderer/src/store.ts:225` |
| `openProject` | `string | null` | — | `src/renderer/src/store.ts:227` |
| `setOpenProject` | `(project: string | null) => void` | — | `src/renderer/src/store.ts:229` |
| `setFilter` | `SetFilter → src/renderer/src/store.SetFilter` | — | `src/renderer/src/store.ts:230` |
| `setSetFilter` | `(filter: SetFilter) => void → src/renderer/src/store.SetFilter` | — | `src/renderer/src/store.ts:231` |
| `stageHold` | `StageHold | null → src/renderer/src/store.StageHold` | — | `src/renderer/src/store.ts:233` |
| `setStageHold` | `(hold: StageHold | null) => void → src/renderer/src/store.StageHold` | — | `src/renderer/src/store.ts:234` |
| `unreadableFile` | `UnreadableFile | null → src/renderer/src/store.UnreadableFile` | — | `src/renderer/src/store.ts:236` |
| `setUnreadableFile` | `(file: UnreadableFile | null) => void → src/renderer/src/store.UnreadableFile` | — | `src/renderer/src/store.ts:237` |
| `requestedSetId` | `string | null` | — | `src/renderer/src/store.ts:238` |
| `requestSet` | `(setId: string) => void` | — | `src/renderer/src/store.ts:239` |
| `clearRequestedSet` | `() => void` | — | `src/renderer/src/store.ts:240` |
| `applyRig` | `(rigId: string) => void` | — | `src/renderer/src/store.ts:241` |
| `adoptRig` | `(rig: Rig) => void → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:242` |
| `forgetRig` | `(rigId: string) => void` | — | `src/renderer/src/store.ts:243` |
| `dismissCue` | `() => void` | — | `src/renderer/src/store.ts:244` |

### `src/renderer/src/store.SetSummary` — interface — `src/renderer/src/store.ts:252-270`

What `list_sets` answers with — a project row for the setup panel.

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/renderer/src/store.ts:253` |
| `title` | `string` | — | `src/renderer/src/store.ts:254` |
| `description` | `string` | — | `src/renderer/src/store.ts:255` |
| `project` | `string | null` | — | `src/renderer/src/store.ts:257` |
| `scriptCount` | `number` | — | `src/renderer/src/store.ts:258` |
| `exportedTo` | `?: string | null` | — | `src/renderer/src/store.ts:260` |
| `readOnly` | `?: boolean` | — | `src/renderer/src/store.ts:262` |
| `livesIn` | `?: string | null` | — | `src/renderer/src/store.ts:263` |
| `onDemand` | `?: boolean` | — | `src/renderer/src/store.ts:265` |
| `source` | `?: 'project' | 'store'` | — | `src/renderer/src/store.ts:267` |
| `unreadable` | `?: boolean` | — | `src/renderer/src/store.ts:269` |

### `src/renderer/src/store.UnreadableFile` — interface — `src/renderer/src/store.ts:273-276`

`list_sets.filter.unreadable` — the project file that could not be read, named.

| field | type | default | at |
|---|---|---|---|
| `file` | `string` | — | `src/renderer/src/store.ts:274` |
| `message` | `string` | — | `src/renderer/src/store.ts:275` |

### `src/renderer/src/store.StageHold` — interface — `src/renderer/src/store.ts:333-336`

Why the set on stage is being HELD rather than refreshed — shown by the

| field | type | default | at |
|---|---|---|---|
| `reason` | `'project-closed' | 'unreadable'` | — | `src/renderer/src/store.ts:334` |
| `message` | `string` | — | `src/renderer/src/store.ts:335` |

### `src/shared/capabilities.CapabilityMeta` — interface — `src/shared/capabilities.ts:73-101`

| field | type | default | at |
|---|---|---|---|
| `name` | `string` | — | `src/shared/capabilities.ts:74` |
| `summary` | `string` | — | `src/shared/capabilities.ts:76` |
| `kind` | `CapabilityKind → src/shared/capabilities.CapabilityKind` | — | `src/shared/capabilities.ts:77` |
| `sideEffects` | `SideEffect → src/shared/capabilities.SideEffect` | — | `src/shared/capabilities.ts:78` |
| `principals` | `readonly Principal[] → src/shared/capabilities.Principal` | — | `src/shared/capabilities.ts:80` |
| `idempotent` | `boolean` | — | `src/shared/capabilities.ts:82` |
| `confirmationRequired` | `boolean` | — | `src/shared/capabilities.ts:84` |
| `supportsDryRun` | `boolean` | — | `src/shared/capabilities.ts:86` |
| `announces` | `boolean` | — | `src/shared/capabilities.ts:97` |
| `supportsIdempotencyKey` | `boolean` | — | `src/shared/capabilities.ts:99` |
| `failureModes` | `readonly ErrorCode[] → src/shared/capabilities.ErrorCode` | — | `src/shared/capabilities.ts:100` |

### `src/shared/capabilities.InvokeRequest` — interface — `src/shared/capabilities.ts:355-360`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/capabilities.ts:356` |
| `input` | `?: unknown` | — | `src/shared/capabilities.ts:357` |
| `idempotencyKey` | `?: string` | — | `src/shared/capabilities.ts:359` |

### `src/shared/capabilities.CapabilityError` — interface — `src/shared/capabilities.ts:362-367`

| field | type | default | at |
|---|---|---|---|
| `code` | `ErrorCode → src/shared/capabilities.ErrorCode` | — | `src/shared/capabilities.ts:363` |
| `message` | `string` | — | `src/shared/capabilities.ts:364` |
| `details` | `?: unknown` | — | `src/shared/capabilities.ts:366` |

### `src/shared/capabilities.InvokeResult` — type-union on `ok` — `src/shared/capabilities.ts:369-370`

| field | type | default | at |
|---|---|---|---|
| `true` | `{ ok: true; data: T; replayed?: boolean }` | — | `src/shared/capabilities.ts:370` |
| `false` | `{ ok: false; error: CapabilityError }` | — | `src/shared/capabilities.ts:370` |

### `src/shared/capabilities.InvokeResult[ok=false]` — type — `src/shared/capabilities.ts:370`

| field | type | default | at |
|---|---|---|---|
| `ok` | `false` | — | `src/shared/capabilities.ts:370` |
| `error` | `CapabilityError → src/shared/capabilities.CapabilityError` | — | `src/shared/capabilities.ts:370` |

### `src/shared/capabilities.InvokeResult[ok=true]` — type — `src/shared/capabilities.ts:370`

| field | type | default | at |
|---|---|---|---|
| `ok` | `true` | — | `src/shared/capabilities.ts:370` |
| `data` | `T` | — | `src/shared/capabilities.ts:370` |
| `replayed` | `?: boolean` | — | `src/shared/capabilities.ts:370` |

### `src/shared/domain.Paragraph` — interface — `src/shared/domain.ts:98-102`

| field | type | default | at |
|---|---|---|---|
| `id` | `ParagraphId → src/shared/domain.ParagraphId` | — | `src/shared/domain.ts:99` |
| `text` | `string` | — | `src/shared/domain.ts:101` |

### `src/shared/domain.MinorTopic` — interface — `src/shared/domain.ts:105-109`

Zone 2 in requirements §1 — the sub-point under the heading.

| field | type | default | at |
|---|---|---|---|
| `id` | `TopicId → src/shared/domain.TopicId` | — | `src/shared/domain.ts:106` |
| `heading` | `string` | — | `src/shared/domain.ts:107` |
| `paragraphs` | `Paragraph[] → src/shared/domain.Paragraph` | — | `src/shared/domain.ts:108` |

### `src/shared/domain.MajorTopic` — interface — `src/shared/domain.ts:112-116`

Zone 1 in requirements §1 — where you are in the script.

| field | type | default | at |
|---|---|---|---|
| `id` | `TopicId → src/shared/domain.TopicId` | — | `src/shared/domain.ts:113` |
| `heading` | `string` | — | `src/shared/domain.ts:114` |
| `minors` | `MinorTopic[] → src/shared/domain.MinorTopic` | — | `src/shared/domain.ts:115` |

### `src/shared/domain.Trigger` — interface — `src/shared/domain.ts:127-131`

One trigger — a single step in column 2, bound to the paragraph it belongs to.

| field | type | default | at |
|---|---|---|---|
| `id` | `TriggerId → src/shared/domain.TriggerId` | — | `src/shared/domain.ts:128` |
| `text` | `string` | — | `src/shared/domain.ts:129` |
| `paragraphId` | `ParagraphId → src/shared/domain.ParagraphId` | — | `src/shared/domain.ts:130` |

### `src/shared/domain.TriggerSet` — interface — `src/shared/domain.ts:133-139`

| field | type | default | at |
|---|---|---|---|
| `style` | `TriggerStyle → src/shared/domain.TriggerStyle` | — | `src/shared/domain.ts:134` |
| `authoredBy` | `Authorship → src/shared/domain.Authorship` | — | `src/shared/domain.ts:135` |
| `note` | `?: string` | — | `src/shared/domain.ts:137` |
| `triggers` | `Trigger[] → src/shared/domain.Trigger` | — | `src/shared/domain.ts:138` |

### `src/shared/domain.Transcript` — interface — `src/shared/domain.ts:141-157`

| field | type | default | at |
|---|---|---|---|
| `id` | `TranscriptId → src/shared/domain.TranscriptId` | — | `src/shared/domain.ts:142` |
| `kind` | `TranscriptKind → src/shared/domain.TranscriptKind` | — | `src/shared/domain.ts:143` |
| `corpus` | `string` | — | `src/shared/domain.ts:150` |
| `talentId` | `TalentId | null → src/shared/domain.TalentId` | — | `src/shared/domain.ts:152` |
| `source` | `string` | — | `src/shared/domain.ts:154` |
| `topics` | `MajorTopic[] → src/shared/domain.MajorTopic` | — | `src/shared/domain.ts:155` |
| `triggerSets` | `TriggerSet[] → src/shared/domain.TriggerSet` | — | `src/shared/domain.ts:156` |

### `src/shared/domain.Script` — interface — `src/shared/domain.ts:159-176`

| field | type | default | at |
|---|---|---|---|
| `id` | `ScriptId → src/shared/domain.ScriptId` | — | `src/shared/domain.ts:160` |
| `n` | `number` | — | `src/shared/domain.ts:162` |
| `title` | `string` | — | `src/shared/domain.ts:163` |
| `takeaway` | `string` | — | `src/shared/domain.ts:165` |
| `summary` | `string` | — | `src/shared/domain.ts:167` |
| `transcripts` | `Transcript[] → src/shared/domain.Transcript` | — | `src/shared/domain.ts:168` |
| `video` | `?: string | null` | — | `src/shared/domain.ts:175` |

### `src/shared/domain.ScriptSet` — interface — `src/shared/domain.ts:193-236`

| field | type | default | at |
|---|---|---|---|
| `id` | `SetId → src/shared/domain.SetId` | — | `src/shared/domain.ts:194` |
| `title` | `string` | — | `src/shared/domain.ts:195` |
| `description` | `string` | — | `src/shared/domain.ts:196` |
| `project` | `?: string | null` | — | `src/shared/domain.ts:213` |
| `exportedTo` | `?: string | null` | — | `src/shared/domain.ts:222` |
| `exportedBrand` | `?: string | null` | — | `src/shared/domain.ts:228` |
| `onDemand` | `?: boolean` | — | `src/shared/domain.ts:234` |
| `scripts` | `Script[] → src/shared/domain.Script` | — | `src/shared/domain.ts:235` |

### `src/shared/domain.CadenceEnvelope` — interface — `src/shared/domain.ts:251-268`

The eight deterministic threshold rules from

| field | type | default | at |
|---|---|---|---|
| `wordsMin` | `number` | — | `src/shared/domain.ts:252` |
| `wordsMax` | `number` | — | `src/shared/domain.ts:253` |
| `breathGroupMeanMin` | `number` | — | `src/shared/domain.ts:255` |
| `breaksPer100Max` | `number` | — | `src/shared/domain.ts:257` |
| `sentenceSdMin` | `number` | — | `src/shared/domain.ts:259` |
| `emDashMax` | `number` | — | `src/shared/domain.ts:261` |
| `antiVoice` | `string[]` | — | `src/shared/domain.ts:263` |
| `bookends` | `string[]` | — | `src/shared/domain.ts:265` |
| `source` | `string` | — | `src/shared/domain.ts:267` |

### `src/shared/domain.Talent` — interface — `src/shared/domain.ts:270-274`

| field | type | default | at |
|---|---|---|---|
| `id` | `TalentId → src/shared/domain.TalentId` | — | `src/shared/domain.ts:271` |
| `name` | `string` | — | `src/shared/domain.ts:272` |
| `envelope` | `CadenceEnvelope → src/shared/domain.CadenceEnvelope` | — | `src/shared/domain.ts:273` |

### `src/shared/domain.DomainViolation` — interface — `src/shared/domain.ts:281-284`

A validation problem, phrased so an agent can act on it.

| field | type | default | at |
|---|---|---|---|
| `path` | `string` | — | `src/shared/domain.ts:282` |
| `message` | `string` | — | `src/shared/domain.ts:283` |

### `src/shared/ipc.AppInfo` — interface — `src/shared/ipc.ts:35-42`

| field | type | default | at |
|---|---|---|---|
| `name` | `string` | — | `src/shared/ipc.ts:36` |
| `version` | `string` | — | `src/shared/ipc.ts:37` |
| `electron` | `string` | — | `src/shared/ipc.ts:38` |
| `chrome` | `string` | — | `src/shared/ipc.ts:39` |
| `node` | `string` | — | `src/shared/ipc.ts:40` |
| `platform` | `NodeJS.Platform → NodeJS (node_modules/@types/node/compatibility/iterators.d.ts), Platform (node_modules/@types/node/process.d.ts)` | — | `src/shared/ipc.ts:41` |

### `src/shared/ipc.ControlStatus` — interface — `src/shared/ipc.ts:44-53`

| field | type | default | at |
|---|---|---|---|
| `running` | `boolean` | — | `src/shared/ipc.ts:45` |
| `port` | `number | null` | — | `src/shared/ipc.ts:46` |
| `discoveryPath` | `string | null` | — | `src/shared/ipc.ts:52` |

### `src/shared/ipc.ControlChanged` — interface — `src/shared/ipc.ts:55-59`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/ipc.ts:56` |
| `principal` | `'ui' | 'agent'` | — | `src/shared/ipc.ts:57` |
| `at` | `number` | — | `src/shared/ipc.ts:58` |

### `src/shared/ipc.InvokePayload` — interface — `src/shared/ipc.ts:61-65`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/ipc.ts:62` |
| `input` | `?: unknown` | — | `src/shared/ipc.ts:63` |
| `idempotencyKey` | `?: string` | — | `src/shared/ipc.ts:64` |

### `src/shared/ipc.AppytronApi` — interface — `src/shared/ipc.ts:68-74`

The API exposed to the renderer on `window.appytron`.

| field | type | default | at |
|---|---|---|---|
| `getAppInfo` | `(): Promise<AppInfo>` | — | `src/shared/ipc.ts:69` |
| `invoke` | `<T = unknown>(payload: InvokePayload): Promise<InvokeResult<T>>` | — | `src/shared/ipc.ts:70` |
| `getControlStatus` | `(): Promise<ControlStatus>` | — | `src/shared/ipc.ts:71` |
| `onControlChanged` | `(listener: (event: ControlChanged) => void): () => void` | — | `src/shared/ipc.ts:73` |

### `src/shared/rig.RigLayout` — interface — `src/shared/rig.ts:69-81`

| field | type | default | at |
|---|---|---|---|
| `visible` | `RecordingZone[] → src/shared/rig.RecordingZone` | — | `src/shared/rig.ts:71` |
| `driven` | `RecordingZone → src/shared/rig.RecordingZone` | — | `src/shared/rig.ts:73` |
| `weights` | `Record<RecordingZone, number> → Record (node_modules/typescript/lib/lib.es5.d.ts), src/shared/rig.RecordingZone` | — | `src/shared/rig.ts:75` |
| `camera` | `CameraSide → src/shared/rig.CameraSide` | — | `src/shared/rig.ts:76` |
| `text` | `TextPreset → src/shared/rig.TextPreset` | — | `src/shared/rig.ts:77` |
| `mirror` | `boolean` | — | `src/shared/rig.ts:79` |
| `focus` | `boolean` | — | `src/shared/rig.ts:80` |

### `src/shared/rig.Rig` — interface — `src/shared/rig.ts:83-92`

| field | type | default | at |
|---|---|---|---|
| `id` | `RigId → src/shared/rig.RigId` | — | `src/shared/rig.ts:84` |
| `label` | `string` | — | `src/shared/rig.ts:90` |
| `layout` | `RigLayout → src/shared/rig.RigLayout` | — | `src/shared/rig.ts:91` |

### `src/shared/rig.WorkspacePosition` — interface — `src/shared/rig.ts:118-124`

Where the talent WAS — script, corpus, style, and the paragraph in front of

| field | type | default | at |
|---|---|---|---|
| `setId` | `string | null` | — | `src/shared/rig.ts:119` |
| `scriptId` | `string | null` | — | `src/shared/rig.ts:120` |
| `transcriptId` | `string | null` | — | `src/shared/rig.ts:121` |
| `style` | `TriggerStyle | null → src/shared/domain.TriggerStyle` | — | `src/shared/rig.ts:122` |
| `paragraphId` | `string | null` | — | `src/shared/rig.ts:123` |

### `src/shared/rig.Workspace` — interface — `src/shared/rig.ts:126-131`

| field | type | default | at |
|---|---|---|---|
| `layout` | `RigLayout | null → src/shared/rig.RigLayout` | — | `src/shared/rig.ts:127` |
| `rigId` | `RigId | null → src/shared/rig.RigId` | — | `src/shared/rig.ts:128` |
| `position` | `?: WorkspacePosition | null → src/shared/rig.WorkspacePosition` | — | `src/shared/rig.ts:130` |

## Cannot be mirrored

**Hand-corrected 2026-09-23. The generator says "Nothing", and that is wrong.**

| Not mirrored | Why | Read instead |
|---|---|---|
| Every zod schema (the domain validators and each verb's input shape) | `z` is imported from `@appydave/core`, and the extractor only recognises `from 'zod'` (`extract_typescript.mjs:204`), a known extractor defect | `src/shared/domain-schema.ts`, `src/core/input-shapes.ts`, `src/core/project-store.ts` (project-file shape) |

The TypeScript shapes those validators enforce are mirrored above. Regenerating this page
overwrites this correction until the extractor is fixed, so re-apply it.

## Findings — changes needed in the target application

These are refactors of the **application**, not of this mirror. Each one converts a derived section into a declared one.

1. `src/core/input-shapes.ts:341` — REFACTOR: `def.typeName` is a closed set enforced only by control flow at src/core/input-shapes.ts:341. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
2. `src/main/control-server.ts:255` — REFACTOR: `result.error.code` is a closed set enforced only by control flow at src/main/control-server.ts:255. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
3. `src/renderer/src/App.tsx:665` — REFACTOR: `e.key` is a closed set enforced only by control flow at src/renderer/src/App.tsx:665. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
4. `src/renderer/src/App.tsx:737` — REFACTOR: `zone` is a closed set enforced only by control flow at src/renderer/src/App.tsx:737. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.

---

Regenerate: `schema-mirror` skill → `extract_typescript.py` + `render_mirror.py`. Check for drift: `verify_mirror.py`.
