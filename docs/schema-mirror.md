# Schema mirror

> Generated from the code, not written about it. Do not hand-edit — every line below is anchored to a `file:line` and is re-derived on every run. `verify_mirror.py` fails when this page no longer matches its JSON. To record a gap the extractor cannot find, use `docs/schema-mirror.known-gaps.json`.

- **stack** `typescript` · **extractor** `extract_typescript.py`
- **commit** `6547ecae5f55` · **generated** 2026-09-23T08:05:24+00:00
- **scope** include `*.ts`, `*.tsx` · exclude `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `*.stories.tsx`, `*.config.ts`, `*/test/*`, `*/tests/*`, `*/__tests__/*`, `*/e2e/*`, `*/__mocks__/*`, `*/fixtures/*`, `*.d.ts`, `*/dist/*`, `*/build/*`, `*/out/*`
- **zod bound** in 0 file(s) by a direct import, 5 through a re-export, 0 by call shape only

| shapes | declared sets | derived sets | gaps | declared but not read | findings |
|---|---|---|---|---|---|
| 97 | 32 | 2 | 6 | 39 | 2 |

> **Read the gaps, the census and the never-read list before trusting the shape.** Derived sets have no declaring symbol and will drift silently. Gaps are things this mirror could not reach — they are not absences in the code.

## Index

Top-level entries by file, with the line each is declared on. Search the page for the name.

- `src/core/active-context.ts` — `ActiveSelection` :29
- `src/core/cadence.ts` — `CadenceMeasurements` :29 · `CadenceRule` :44 · `CadenceScore` :62
- `src/core/handlers.ts` — `HandlerContext` :77 · `Resolved` :131 · `MaybeUnreadable` :315
- `src/core/index.ts` — `CoreOptions` :40 · `InvokeOptions` :48 · `ChangeEvent` :63 · `Core` :69
- `src/core/input-shapes.ts` — `slug` :25 · `projectName` :28 · `paragraphInput` :34 · `minorInput` :39 · `majorInput` :45 · `layoutInput` :56 · `triggerInput` :71 · `InputField` :317
- `src/core/open-context.ts` — `OPEN_REFUSAL_CODES` (set) :35 · `OpenRefusal` :45 · `OpenContext` :54 · `OpenResolution` :65 · `ResolveOpenArgsOptions` :69 · `ContextReport` :239
- `src/core/project-store.ts` — `projectFileSchema` :33 · `UnreadableProjectFile` :98
- `src/core/repository.ts` — `RepositoryDocument` :24 · `Repository` :66
- `src/core/safety.ts` — `PendingAction` :107 · `AuditEntry` :288
- `src/core/text-script.ts` — `TextScriptInput` :21
- `src/main/control-server.ts` — `ControlServerOptions` :35 · `ControlServerHandle` :44
- `src/main/create-console.ts` — `ConsoleContext` :7 · `Console` :14 · `CreateConsoleOptions` :19
- `src/main/file-author.ts` — `FileAuthorOptions` :9 · `AuthorResult` :16
- `src/main/ipc-router.ts` — `HandlerDef` :4
- `src/main/process-supervisor.ts` — `SpawnOptions` :4 · `ProcessStatus` (set) :11 · `LogChunk` :12 · `ManagedProcess` :17
- `src/main/updater.ts` — `UpdateStatus` (set) :4 · `UpdateState` :7 · `UpdaterOptions` :14
- `src/main/window-manager.ts` — `WindowOptions` :4
- `src/renderer/src/App.tsx` — `zone (switch)` (set) :737
- `src/renderer/src/components/CadencePanel.tsx` — `Rule` :23 · `Score` :31
- `src/renderer/src/store.ts` — `ZONES` (set) :70 · `CueCard` :96 · `PrompterState` :103 · `SetSummary` :252 · `UnreadableFile` :273 · `SetFilter` (set) :326 · `StageHold` :333 · `Rank` (set) :1179
- `src/shared/capabilities.ts` — `PRINCIPALS` (set) :36 · `SIDE_EFFECTS` (set) :43 · `CapabilityKind` (set) :51 · `ERROR_CODES` (set) :59 · `CapabilityMeta` :73 · `InvokeRequest` :355 · `CapabilityError` :362 · `InvokeResult` :369
- `src/shared/domain-schema.ts` — `paragraphSchema` :47 · `minorTopicSchema` :52 · `majorTopicSchema` :58 · `triggerSchema` :64 · `triggerSetSchema` :70 · `transcriptSchema` :77 · `scriptSchema` :87 · `scriptSetSchema` :102 · `cadenceEnvelopeSchema` :127 · `talentSchema` :139 · `rigLayoutSchema` :149 · `rigSchema` :164 · `workspaceSchema` :170
- `src/shared/domain.ts` — `TRANSCRIPT_KINDS` (set) :65 · `TRIGGER_STYLES` (set) :80 · `AUTHORSHIPS` (set) :91 · `Paragraph` :98 · `MinorTopic` :105 · `MajorTopic` :112 · `Trigger` :127 · `TriggerSet` :133 · `Transcript` :141 · `Script` :159 · `ScriptSet` :193 · `CadenceEnvelope` :251 · `Talent` :270 · `DomainViolation` :281
- `src/shared/ipc.ts` — `AppInfo` :35 · `ControlStatus` :44 · `ControlChanged` :55 · `InvokePayload` :61 · `AppytronApi` :68
- `src/shared/rig.ts` — `RECORDING_SET` (set) :47 · `CAMERA_SIDES` (set) :51 · `TEXT_PRESETS` (set) :55 · `RigLayout` :69 · `Rig` :83 · `WorkspacePosition` :118 · `Workspace` :126

## Never read by this extractor

These constructs are outside what this extractor reads **on every run, in every repo**. A page with no gaps is still partial by exactly this list.

- classes - a class's fields are never mirrored (the census lists each one)
- generic, mapped and conditional type aliases
- template-literal types, and unions that contain one
- aliases of another type or value (`X = Y`), and utility-type aliases (`Pick<>`, `Omit<>`, `Record<>`)
- `keyof typeof X` / indexed-access types, unless X itself is read as a closed set
- results of `.pick` / `.omit` / `.partial` / `.required` (listed as gaps where met)
- zod schemas built inside function bodies, other than a function that returns one zod expression
- the parameterised result of a schema helper or factory call (listed as gaps where met)
- constants that are not exported (the census does not count them)
- `*.d.ts` files and build output (`dist/`, `build/`, `out/`) - excluded by default
- regex-encoded sets, JSON Schema files, and the data actually on disk

## Coverage census

**148** top-level declarations counted = **108** mirrored + **1** listed as gaps + **39** declared but not read.

Counted: every top-level interface, enum, class and type alias (exported or not) and every exported constant, in the files in scope.
Not counted, as not schema-bearing: 29 functions, 2 function types, 4 literal constants.

| file | declared | mirrored | gaps | not read |
|---|---|---|---|---|
| `src/core/active-context.ts` | 4 | 1 | 0 | **3** |
| `src/core/input-shapes.ts` | 2 | 1 | 0 | **1** |
| `src/core/open-context.ts` | 8 | 7 | 0 | **1** |
| `src/core/repository.ts` | 5 | 2 | 0 | **3** |
| `src/core/safety.ts` | 8 | 2 | 0 | **6** |
| `src/main/file-author.ts` | 3 | 2 | 0 | **1** |
| `src/main/ipc-router.ts` | 2 | 1 | 0 | **1** |
| `src/main/process-supervisor.ts` | 6 | 4 | 0 | **2** |
| `src/main/updater.ts` | 4 | 3 | 0 | **1** |
| `src/main/window-manager.ts` | 2 | 1 | 0 | **1** |
| `src/renderer/src/store.ts` | 11 | 9 | 0 | **2** |
| `src/shared/capabilities.ts` | 14 | 11 | 0 | **3** |
| `src/shared/domain.ts` | 25 | 17 | 0 | **8** |
| `src/shared/ipc.ts` | 6 | 5 | 0 | **1** |
| `src/shared/rig.ts` | 13 | 10 | 0 | **3** |
| `src/shared/script-set.ts` | 2 | 0 | 0 | **2** |

## Closed sets — declared

One symbol states each set. Adding a member changes that symbol, so these cannot drift.

### `src/core/cadence.CadenceRule.key` — `src/core/cadence.ts:46-54`

Stable key, so a UI can flag one rule without matching on prose.

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

`'project'` when the folder holds a valid `fli.studio.json`; `'folder'` otherwise (see file header).

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

Where this row's data was read from: the open project's fli.tubby.json, or the app store.

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

### `src/shared/domain-schema.triggerSetSchema.style` — `src/shared/domain-schema.ts:71`

*`z.enum` `style` - members read through `TRIGGER_STYLES` (src/shared/domain.TRIGGER_STYLES) - a single declaring symbol*

| value | declared at |
|---|---|
| `near-verbatim` | `src/shared/domain.ts:80` |
| `compressed-concept` | `src/shared/domain.ts:80` |
| `loose-keywords` | `src/shared/domain.ts:80` |

### `src/shared/domain-schema.triggerSetSchema.authoredBy` — `src/shared/domain-schema.ts:72`

*`z.enum` `authoredBy` - members read through `AUTHORSHIPS` (src/shared/domain.AUTHORSHIPS) - a single declaring symbol*

| value | declared at |
|---|---|
| `hand` | `src/shared/domain.ts:91` |
| `agent` | `src/shared/domain.ts:91` |

### `src/shared/domain-schema.transcriptSchema.kind` — `src/shared/domain-schema.ts:79`

*`z.enum` `kind` - members read through `TRANSCRIPT_KINDS` (src/shared/domain.TRANSCRIPT_KINDS) - a single declaring symbol*

| value | declared at |
|---|---|
| `provenance` | `src/shared/domain.ts:65` |
| `cadence` | `src/shared/domain.ts:65` |

### `src/shared/domain-schema.rigLayoutSchema.visible[]` — `src/shared/domain-schema.ts:150`

*`z.enum` `visible[]` - members read through `RECORDING_SET` (src/shared/rig.RECORDING_SET) - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/shared/rig.ts:47` |
| `minor` | `src/shared/rig.ts:47` |
| `triggers` | `src/shared/rig.ts:47` |
| `paragraph` | `src/shared/rig.ts:47` |

### `src/shared/domain-schema.rigLayoutSchema.driven` — `src/shared/domain-schema.ts:151`

*`z.enum` `driven` - members read through `RECORDING_SET` (src/shared/rig.RECORDING_SET) - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/shared/rig.ts:47` |
| `minor` | `src/shared/rig.ts:47` |
| `triggers` | `src/shared/rig.ts:47` |
| `paragraph` | `src/shared/rig.ts:47` |

### `src/shared/domain-schema.rigLayoutSchema.camera` — `src/shared/domain-schema.ts:158`

*`z.enum` `camera` - members read through `CAMERA_SIDES` (src/shared/rig.CAMERA_SIDES) - a single declaring symbol*

| value | declared at |
|---|---|
| `left` | `src/shared/rig.ts:51` |
| `right` | `src/shared/rig.ts:51` |

### `src/shared/domain-schema.rigLayoutSchema.text` — `src/shared/domain-schema.ts:159`

*`z.enum` `text` - members read through `TEXT_PRESETS` (src/shared/rig.TEXT_PRESETS) - a single declaring symbol*

| value | declared at |
|---|---|
| `standard` | `src/shared/rig.ts:55` |
| `large` | `src/shared/rig.ts:55` |
| `stage` | `src/shared/rig.ts:55` |

### `src/shared/domain-schema.workspaceSchema.position.style` — `src/shared/domain-schema.ts:179`

*`z.enum` `style` - members read through `TRIGGER_STYLES` (src/shared/domain.TRIGGER_STYLES) - a single declaring symbol*

| value | declared at |
|---|---|
| `near-verbatim` | `src/shared/domain.ts:80` |
| `compressed-concept` | `src/shared/domain.ts:80` |
| `loose-keywords` | `src/shared/domain.ts:80` |

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

### `src/renderer/src/App.zone (switch)` — `src/renderer/src/App.tsx:737`

*`switch` on `zone` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `major` | `src/renderer/src/App.tsx:738` |
| `minor` | `src/renderer/src/App.tsx:748` |
| `triggers` | `src/renderer/src/App.tsx:758` |
| `paragraph` | `src/renderer/src/App.tsx:762` |

> **REFACTOR: `zone` is a closed set enforced only by control flow at src/renderer/src/App.tsx:737. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

> 2 comparison(s) against vocabularies this app does not own (DOM key names, HTTP headers, library internals) were **not** treated as closed sets and carry no refactor advice: `src/core/input-shapes.def.typeName (switch)` (every value is a zod internal type name), `src/renderer/src/App.e.key (switch)` (the subject is a property declared by TypeScript's lib or a package).

## Shapes

### `src/core/active-context.ActiveSelection` — interface — `src/core/active-context.ts:29-36`

| field | type | default | at | note |
|---|---|---|---|---|
| `setId` | `SetId \| null → SetId (@shared/domain)` | — | `src/core/active-context.ts:30` |  |
| `scriptId` | `ScriptId \| null → ScriptId (@shared/domain)` | — | `src/core/active-context.ts:31` |  |
| `transcriptId` | `TranscriptId \| null → TranscriptId (@shared/domain)` | — | `src/core/active-context.ts:32` |  |
| `style` | `TriggerStyle \| null → TriggerStyle (@shared/domain)` | — | `src/core/active-context.ts:33` |  |
| `step` | `number \| null` | — | `src/core/active-context.ts:35` | Index into the active trigger set. The talent's position in the take. |

### `src/core/cadence.CadenceMeasurements` — interface — `src/core/cadence.ts:29-42`

| field | type | default | at | note |
|---|---|---|---|---|
| `words` | `number` | — | `src/core/cadence.ts:30` |  |
| `sentences` | `number` | — | `src/core/cadence.ts:31` |  |
| `sentenceMean` | `number` | — | `src/core/cadence.ts:32` |  |
| `sentenceSd` | `number` | — | `src/core/cadence.ts:34` | Population standard deviation, matching score.py's `st.pstdev`. |
| `breathGroupMean` | `number` | — | `src/core/cadence.ts:36` | Mean words per breath group — the headline number. David ≈ 11.5. |
| `breaksPer100` | `number` | — | `src/core/cadence.ts:37` |  |
| `emDash` | `number` | — | `src/core/cadence.ts:38` |  |
| `antiVoice` | `string[]` | — | `src/core/cadence.ts:39` |  |
| `bookends` | `string[]` | — | `src/core/cadence.ts:40` |  |
| `missingTerms` | `string[]` | — | `src/core/cadence.ts:41` |  |

### `src/core/cadence.CadenceRule` — interface — `src/core/cadence.ts:44-60`

| field | type | default | at | note |
|---|---|---|---|---|
| `key` | `\| 'length' \| 'breath-group' \| 'break-density' \| 'sentence-variation' \| 'em-dash' \| 'mandatory-terms' \| 'anti-voice' \| 'bookends'` | — | `src/core/cadence.ts:46` | Stable key, so a UI can flag one rule without matching on prose. |
| `label` | `string` | — | `src/core/cadence.ts:55` |  |
| `pass` | `boolean` | — | `src/core/cadence.ts:56` |  |
| `actual` | `string` | — | `src/core/cadence.ts:58` | What was measured, and what was required — both, always. |
| `target` | `string` | — | `src/core/cadence.ts:59` |  |

### `src/core/cadence.CadenceScore` — interface — `src/core/cadence.ts:62-68`

| field | type | default | at | note |
|---|---|---|---|---|
| `pass` | `boolean` | — | `src/core/cadence.ts:63` |  |
| `measurements` | `CadenceMeasurements → src/core/cadence.CadenceMeasurements` | — | `src/core/cadence.ts:64` |  |
| `rules` | `CadenceRule[] → src/core/cadence.CadenceRule` | — | `src/core/cadence.ts:65` |  |
| `envelopeSource` | `string` | — | `src/core/cadence.ts:67` | Which envelope this was judged against. Never anonymous. |

### `src/core/handlers.HandlerContext` — interface — `src/core/handlers.ts:77-90`

| field | type | default | at | note |
|---|---|---|---|---|
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/handlers.ts:78` |  |
| `active` | `ActiveContextHolder` | — | `src/core/handlers.ts:79` |  |
| `openContext` | `OpenContextHolder` | — | `src/core/handlers.ts:81` | The session's brand/project context (W6, door 2 + door 3). Never persisted. |
| `confirmations` | `ConfirmationLedger` | — | `src/core/handlers.ts:82` |  |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/handlers.ts:83` |  |
| `capability` | `CapabilityMeta → CapabilityMeta (@shared/capabilities)` | — | `src/core/handlers.ts:84` |  |
| `dryRun` | `boolean` | — | `src/core/handlers.ts:86` | True when the caller asked for a preview rather than an act. |
| `confirmationId` | `?: string` | — | `src/core/handlers.ts:87` |  |
| `recordPrior` | `(prior: unknown) => void` | — | `src/core/handlers.ts:89` | Hand the prior state to the audit log. Call it before you overwrite. |

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

| field | type | default | at | note |
|---|---|---|---|---|
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/index.ts:41` |  |
| `clock` | `?: Clock → src/core/safety.Clock` | — | `src/core/index.ts:43` | Injectable so every time-dependent control is testable without sleeping. |
| `auditSink` | `?: (entry: AuditEntry) => void → src/core/safety.AuditEntry` | — | `src/core/index.ts:45` | Where audit entries go beyond the in-memory ring — a logger, usually. |

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

| field | type | default | at | note |
|---|---|---|---|---|
| `invoke` | `(name: string, input: unknown, options: InvokeOptions): Promise<InvokeResult>` | — | `src/core/index.ts:70` |  |
| `onChange` | `(listener: (event: ChangeEvent) => void): () => void` | — | `src/core/index.ts:72` | Subscribe to state changes. Returns an unsubscribe function. |
| `active` | `ActiveContextHolder` | — | `src/core/index.ts:74` | The renderer's own selection state, so the UI can drive it directly. |
| `openContext` | `OpenContextHolder` | — | `src/core/index.ts:76` | The session's brand/project context (W6) — set by door 2 or `context_select`, never persisted. |
| `audit` | `AuditLog` | — | `src/core/index.ts:77` |  |
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/index.ts:78` |  |

### `src/core/input-shapes.slug` — zod-scalar — `src/core/input-shapes.ts:25`

`z.string().min(1)`

### `src/core/input-shapes.projectName` — zod-scalar — `src/core/input-shapes.ts:28-32`

A FliHub folder name, verbatim — FliHub's own kebab rule, mirrored not reinvented.

`z.string().trim().regex(PROJECT_NAME_PATTERN, 'not a FliHub folder name (kebab-case, e.g. d01-kybernesis-12-videos)').max(PROJECT_NAME_MAX,…`

### `src/core/input-shapes.paragraphInput` — zod-object — `src/core/input-shapes.ts:34-37`

| field | type | default | at |
|---|---|---|---|
| `id` | `z.string().optional()` | — | `src/core/input-shapes.ts:35` |
| `text` | `z.string().min(1)` | — | `src/core/input-shapes.ts:36` |

### `src/core/input-shapes.minorInput` — zod-object — `src/core/input-shapes.ts:39-43`

| field | type | default | at |
|---|---|---|---|
| `id` | `z.string().optional()` | — | `src/core/input-shapes.ts:40` |
| `heading` | `z.string().min(1)` | — | `src/core/input-shapes.ts:41` |
| `paragraphs` | `z.array(paragraphInput).min(1) → src/core/input-shapes.paragraphInput` | — | `src/core/input-shapes.ts:42` |

### `src/core/input-shapes.majorInput` — zod-object — `src/core/input-shapes.ts:45-49`

| field | type | default | at |
|---|---|---|---|
| `id` | `z.string().optional()` | — | `src/core/input-shapes.ts:46` |
| `heading` | `z.string().min(1)` | — | `src/core/input-shapes.ts:47` |
| `minors` | `z.array(minorInput).min(1) → src/core/input-shapes.minorInput` | — | `src/core/input-shapes.ts:48` |

### `src/core/input-shapes.layoutInput` — zod-object — `src/core/input-shapes.ts:56-69`

A layout as a caller supplies it. `visible` is canonicalised on the way in

| field | type | default | at |
|---|---|---|---|
| `visible` | `z.array(z.enum(RECORDING_SET)).min(1) → RECORDING_SET (@shared/rig)` | — | `src/core/input-shapes.ts:57` |
| `driven` | `z.enum(RECORDING_SET) → RECORDING_SET (@shared/rig)` | — | `src/core/input-shapes.ts:58` |
| `weights` | `z.object({ major: z.number().finite(), minor: z.number().finite(), triggers: z.number().finite(), paragraph: z.number().finite() })` | — | `src/core/input-shapes.ts:59` |
| `camera` | `z.enum(CAMERA_SIDES) → CAMERA_SIDES (@shared/rig)` | — | `src/core/input-shapes.ts:65` |
| `text` | `z.enum(TEXT_PRESETS) → TEXT_PRESETS (@shared/rig)` | — | `src/core/input-shapes.ts:66` |
| `mirror` | `z.boolean()` | — | `src/core/input-shapes.ts:67` |
| `focus` | `z.boolean()` | — | `src/core/input-shapes.ts:68` |

### `src/core/input-shapes.layoutInput.weights` — zod-object — `src/core/input-shapes.ts:59`

| field | type | default | at |
|---|---|---|---|
| `major` | `z.number().finite()` | — | `src/core/input-shapes.ts:60` |
| `minor` | `z.number().finite()` | — | `src/core/input-shapes.ts:61` |
| `triggers` | `z.number().finite()` | — | `src/core/input-shapes.ts:62` |
| `paragraph` | `z.number().finite()` | — | `src/core/input-shapes.ts:63` |

### `src/core/input-shapes.triggerInput` — zod-object — `src/core/input-shapes.ts:71-75`

| field | type | default | at |
|---|---|---|---|
| `id` | `z.string().optional()` | — | `src/core/input-shapes.ts:72` |
| `text` | `z.string().min(1)` | — | `src/core/input-shapes.ts:73` |
| `paragraphId` | `slug → src/core/input-shapes.slug` | — | `src/core/input-shapes.ts:74` |

### `src/core/input-shapes.InputField` — interface — `src/core/input-shapes.ts:317-330`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/core/input-shapes.ts:318` |  |
| `type` | `string` | — | `src/core/input-shapes.ts:319` |  |
| `required` | `boolean` | — | `src/core/input-shapes.ts:320` |  |
| `default` | `?: unknown` | — | `src/core/input-shapes.ts:328` | Present when omitting the field APPLIES A VALUE rather than leaving it |
| `note` | `?: string` | — | `src/core/input-shapes.ts:329` |  |

### `src/core/open-context.OpenRefusal` — interface — `src/core/open-context.ts:45-52`

| field | type | default | at | note |
|---|---|---|---|---|
| `code` | `OpenRefusalCode → src/core/open-context.OpenRefusalCode` | — | `src/core/open-context.ts:46` |  |
| `message` | `string` | — | `src/core/open-context.ts:47` |  |
| `missing` | `?: string[]` | — | `src/core/open-context.ts:49` | Present only when `code === 'missing'`. |
| `candidates` | `?: string[]` | — | `src/core/open-context.ts:51` | Present only when `code === 'project-ambiguous'`: every folder that matched. |

### `src/core/open-context.OpenContext` — interface — `src/core/open-context.ts:54-63`

| field | type | default | at | note |
|---|---|---|---|---|
| `brand` | `string` | — | `src/core/open-context.ts:56` | `brands.json` key. |
| `brandRoot` | `string` | — | `src/core/open-context.ts:58` | This machine's absolute root for that brand (A5). |
| `project` | `string` | — | `src/core/open-context.ts:60` | The FliHub folder name, verbatim — the same identity `ScriptSet.project` already uses. |
| `membership` | `'project' \| 'folder'` | — | `src/core/open-context.ts:62` | `'project'` when the folder holds a valid `fli.studio.json`; `'folder'` otherwise (see file header). |

### `src/core/open-context.OpenResolution` — type-union on `kind` — `src/core/open-context.ts:65-67`

| variant | shape | default | at |
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

| field | type | default | at | note |
|---|---|---|---|---|
| `home` | `?: string` | — | `src/core/open-context.ts:71` | Home directory; default `os.homedir()`. Tests inject a fixture home so nothing real is ever touched. |

### `src/core/open-context.ContextReport` — interface — `src/core/open-context.ts:239-242`

| field | type | default | at |
|---|---|---|---|
| `context` | `OpenContext \| null → src/core/open-context.OpenContext` | — | `src/core/open-context.ts:240` |
| `refused` | `?: OpenRefusal → src/core/open-context.OpenRefusal` | — | `src/core/open-context.ts:241` |

### `src/core/project-store.projectFileSchema` — zod-object — `src/core/project-store.ts:33-37`

| field | type | default | at |
|---|---|---|---|
| `schema` | `z.literal(1)` | — | `src/core/project-store.ts:34` |
| `project` | `z.string().min(1)` | — | `src/core/project-store.ts:35` |
| `sets` | `z.array(scriptSetSchema) → scriptSetSchema (@shared/domain-schema)` | — | `src/core/project-store.ts:36` |

### `src/core/project-store.UnreadableProjectFile` — interface — `src/core/project-store.ts:98-101`

| field | type | default | at |
|---|---|---|---|
| `file` | `string` | — | `src/core/project-store.ts:99` |
| `message` | `string` | — | `src/core/project-store.ts:100` |

### `src/core/repository.RepositoryDocument` — interface — `src/core/repository.ts:24-33`

| field | type | default | at | note |
|---|---|---|---|---|
| `version` | `2` | — | `src/core/repository.ts:26` | Bumped when the on-disk shape changes; read before trusting the contents. |
| `sets` | `ScriptSet[] → ScriptSet (@shared/domain)` | — | `src/core/repository.ts:27` |  |
| `talents` | `Talent[] → Talent (@shared/domain)` | — | `src/core/repository.ts:28` |  |
| `rigs` | `Rig[] → Rig (@shared/rig)` | — | `src/core/repository.ts:30` | Named arrangements — see `src/shared/rig.ts`. |
| `workspace` | `Workspace → Workspace (@shared/rig)` | — | `src/core/repository.ts:32` | The layout the talent last had on screen, restored on the next launch. |

### `src/core/repository.Repository` — interface — `src/core/repository.ts:66-75`

| field | type | default | at | note |
|---|---|---|---|---|
| `read` | `(): Promise<RepositoryDocument>` | — | `src/core/repository.ts:67` |  |
| `update` | `<T>(fn: (document: RepositoryDocument) => { document: RepositoryDocument; result: T; }): Promise<T>` | — | `src/core/repository.ts:69` | Read → mutate → write, serialised end-to-end. The only way to change data. |

### `src/core/safety.PendingAction` — interface — `src/core/safety.ts:107-120`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `string` | — | `src/core/safety.ts:108` |  |
| `capability` | `string` | — | `src/core/safety.ts:109` |  |
| `requestedBy` | `Principal → Principal (@shared/capabilities)` | — | `src/core/safety.ts:111` | Who asked for it. An approval must be able to say what it is approving. |
| `preview` | `unknown` | — | `src/core/safety.ts:113` | Human-readable consequences — what would be removed, not what was intended. |
| `inputFingerprint` | `string` | — | `src/core/safety.ts:115` | The exact input the approval is good for. A different input is a different act. |
| `createdAt` | `number` | — | `src/core/safety.ts:116` |  |
| `expiresAt` | `number` | — | `src/core/safety.ts:117` |  |
| `approved` | `boolean` | — | `src/core/safety.ts:118` |  |
| `approvedAt` | `number \| null` | — | `src/core/safety.ts:119` |  |

### `src/core/safety.AuditEntry` — interface — `src/core/safety.ts:288-303`

| field | type | default | at | note |
|---|---|---|---|---|
| `at` | `number` | — | `src/core/safety.ts:289` |  |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/safety.ts:291` | Human or agent — distinguishably. You must be able to answer "who did this". |
| `capability` | `string` | — | `src/core/safety.ts:292` |  |
| `input` | `unknown` | — | `src/core/safety.ts:293` |  |
| `ok` | `boolean` | — | `src/core/safety.ts:294` |  |
| `errorCode` | `?: ErrorCode → ErrorCode (@shared/capabilities)` | — | `src/core/safety.ts:295` |  |
| `prior` | `?: unknown` | — | `src/core/safety.ts:300` | What it changed. Cheap to add now, expensive to retrofit, and the only |
| `dryRun` | `?: boolean` | — | `src/core/safety.ts:301` |  |
| `replayed` | `?: boolean` | — | `src/core/safety.ts:302` |  |

### `src/core/text-script.TextScriptInput` — interface — `src/core/text-script.ts:21-33`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `?: string` | — | `src/core/text-script.ts:23` | Script id; defaults to the slug of `name`. |
| `name` | `string` | — | `src/core/text-script.ts:24` |  |
| `text` | `string` | — | `src/core/text-script.ts:25` |  |
| `video` | `?: string \| null` | — | `src/core/text-script.ts:26` |  |
| `takeaway` | `?: string` | — | `src/core/text-script.ts:27` |  |
| `source` | `?: string` | — | `src/core/text-script.ts:28` |  |
| `triggers` | `?: { style: TriggerStyle; items: { text: string; paragraph: number }[]; } → TriggerStyle (@shared/domain)` | — | `src/core/text-script.ts:29` |  |

### `src/core/text-script.TextScriptInput.triggers` — type — `src/core/text-script.ts:29-32`

| field | type | default | at |
|---|---|---|---|
| `style` | `TriggerStyle → TriggerStyle (@shared/domain)` | — | `src/core/text-script.ts:30` |
| `items` | `{ text: string; paragraph: number }[]` | — | `src/core/text-script.ts:31` |

### `src/main/control-server.ControlServerOptions` — interface — `src/main/control-server.ts:35-42`

| field | type | default | at | note |
|---|---|---|---|---|
| `core` | `Core → src/core/index.Core` | — | `src/main/control-server.ts:36` |  |
| `userDataPath` | `string` | — | `src/main/control-server.ts:38` | Where the discovery file goes — `app.getPath('userData')` in production. |
| `port` | `?: number` | — | `src/main/control-server.ts:39` |  |
| `appVersion` | `string` | — | `src/main/control-server.ts:40` |  |
| `log` | `?: (message: string, detail?: unknown) => void` | — | `src/main/control-server.ts:41` |  |

### `src/main/control-server.ControlServerHandle` — interface — `src/main/control-server.ts:44-51`

| field | type | default | at | note |
|---|---|---|---|---|
| `port` | `number` | — | `src/main/control-server.ts:45` |  |
| `address` | `string` | — | `src/main/control-server.ts:47` | The interface actually bound. Always 127.0.0.1; asserted by a test. |
| `token` | `string` | — | `src/main/control-server.ts:48` |  |
| `discoveryPath` | `string` | — | `src/main/control-server.ts:49` |  |
| `close` | `(): Promise<void>` | — | `src/main/control-server.ts:50` |  |

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

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/main/create-console.ts:21` | App name — used as the logger binding. |
| `registerIpc` | `?: (ctx: ConsoleContext) => void → src/main/create-console.ConsoleContext` | — | `src/main/create-console.ts:23` | Register IPC handlers before the first window opens. |
| `onReady` | `(ctx: ConsoleContext) => void → src/main/create-console.ConsoleContext` | — | `src/main/create-console.ts:25` | Called once the app is ready — open your window(s) here. |

### `src/main/file-author.FileAuthorOptions` — interface — `src/main/file-author.ts:9-14`

| field | type | default | at | note |
|---|---|---|---|---|
| `root` | `string` | — | `src/main/file-author.ts:11` | The scoped root. Every write/delete MUST resolve inside this directory. |
| `git` | `?: boolean` | — | `src/main/file-author.ts:13` | Git-commit each change (a revert point per write). Default true. |

### `src/main/file-author.AuthorResult` — interface — `src/main/file-author.ts:16-22`

| field | type | default | at | note |
|---|---|---|---|---|
| `path` | `string` | — | `src/main/file-author.ts:18` | Path relative to root. |
| `committed` | `boolean` | — | `src/main/file-author.ts:19` |  |
| `commit` | `?: string` | — | `src/main/file-author.ts:21` | Commit SHA when committed. |

### `src/main/ipc-router.HandlerDef` — interface — `src/main/ipc-router.ts:4-10`

| field | type | default | at | note |
|---|---|---|---|---|
| `channel` | `string` | — | `src/main/ipc-router.ts:6` | Channel name (from `@shared/ipc`'s `IPC` map). |
| `input` | `?: z.ZodType<In> → ZodType (zod)` | — | `src/main/ipc-router.ts:8` | Optional Zod schema — the payload is validated before `handle` runs. |
| `handle` | `(input: In) => Promise<Out> \| Out` | — | `src/main/ipc-router.ts:9` |  |

### `src/main/process-supervisor.SpawnOptions` — interface — `src/main/process-supervisor.ts:4-9`

| field | type | default | at |
|---|---|---|---|
| `command` | `string` | — | `src/main/process-supervisor.ts:5` |
| `args` | `?: string[]` | — | `src/main/process-supervisor.ts:6` |
| `cwd` | `?: string` | — | `src/main/process-supervisor.ts:7` |
| `env` | `?: NodeJS.ProcessEnv → NodeJS (@types/node), ProcessEnv (@types/node)` | — | `src/main/process-supervisor.ts:8` |

### `src/main/process-supervisor.LogChunk` — interface — `src/main/process-supervisor.ts:12-15`

| field | type | default | at |
|---|---|---|---|
| `stream` | `'stdout' \| 'stderr'` | — | `src/main/process-supervisor.ts:13` |
| `data` | `string` | — | `src/main/process-supervisor.ts:14` |

### `src/main/process-supervisor.ManagedProcess` — interface — `src/main/process-supervisor.ts:17-24`

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/main/process-supervisor.ts:18` |
| `pid` | `number \| undefined` | — | `src/main/process-supervisor.ts:19` |
| `status` | `ProcessStatus → src/main/process-supervisor.ProcessStatus` | — | `src/main/process-supervisor.ts:20` |
| `onLog` | `(cb: (chunk: LogChunk) => void): () => void` | — | `src/main/process-supervisor.ts:21` |
| `onExit` | `(cb: (code: number \| null) => void): () => void` | — | `src/main/process-supervisor.ts:22` |
| `stop` | `(signal?: NodeJS.Signals): void` | — | `src/main/process-supervisor.ts:23` |

### `src/main/updater.UpdateState` — interface — `src/main/updater.ts:7-12`

| field | type | default | at |
|---|---|---|---|
| `status` | `UpdateStatus → src/main/updater.UpdateStatus` | — | `src/main/updater.ts:8` |
| `version` | `?: string` | — | `src/main/updater.ts:9` |
| `percent` | `?: number` | — | `src/main/updater.ts:10` |
| `error` | `?: string` | — | `src/main/updater.ts:11` |

### `src/main/updater.UpdaterOptions` — interface — `src/main/updater.ts:14-18`

| field | type | default | at | note |
|---|---|---|---|---|
| `logger` | `?: Logger → Logger (@appydave/core)` | — | `src/main/updater.ts:15` |  |
| `autoDownload` | `?: boolean` | — | `src/main/updater.ts:17` | Auto-download once an update is found. Default false (user-initiated). |

### `src/main/window-manager.WindowOptions` — interface — `src/main/window-manager.ts:4-13`

| field | type | default | at | note |
|---|---|---|---|---|
| `width` | `?: number` | — | `src/main/window-manager.ts:5` |  |
| `height` | `?: number` | — | `src/main/window-manager.ts:6` |  |
| `x` | `?: number` | — | `src/main/window-manager.ts:8` | Omitted → Electron centres the window. Pass both to restore a saved spot. |
| `y` | `?: number` | — | `src/main/window-manager.ts:9` |  |
| `minWidth` | `?: number` | — | `src/main/window-manager.ts:10` |  |
| `minHeight` | `?: number` | — | `src/main/window-manager.ts:11` |  |
| `title` | `?: string` | — | `src/main/window-manager.ts:12` |  |

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

| field | type | default | at | note |
|---|---|---|---|---|
| `label` | `string` | — | `src/renderer/src/store.ts:97` |  |
| `title` | `string` | — | `src/renderer/src/store.ts:98` |  |
| `token` | `number` | — | `src/renderer/src/store.ts:100` | Changes on every cue so the component can restart its dismiss timer. |

### `src/renderer/src/store.PrompterState` — interface — `src/renderer/src/store.ts:103-245`

| field | type | default | at | note |
|---|---|---|---|---|
| `set` | `ScriptSet \| null → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:105` | Null until the control API answers. The UI shows a waiting state, not an error. |
| `scriptId` | `string \| null` | — | `src/renderer/src/store.ts:106` |  |
| `transcriptId` | `string \| null` | — | `src/renderer/src/store.ts:107` |  |
| `style` | `TriggerStyle \| null → TriggerStyle (@shared/domain)` | — | `src/renderer/src/store.ts:108` |  |
| `step` | `number` | — | `src/renderer/src/store.ts:111` | Index into the ACTIVE trigger set. THE position — everything derives from it. |
| `visible` | `RecordingZone[] → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:113` |  |
| `driven` | `RecordingZone → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:114` |  |
| `weights` | `Record<RecordingZone, number> → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:120` | Flex weight per zone, adjusted by dragging a divider. Relative, not pixels, |
| `camera` | `CameraSide → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:121` |  |
| `transcriptOpen` | `boolean` | — | `src/renderer/src/store.ts:123` | The full-transcript skim surface. Overlays; never displaces (see below). |
| `transcriptEdge` | `CameraSide → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:124` |  |
| `setupOpen` | `boolean` | — | `src/renderer/src/store.ts:141` | The setup panel — everything that BUILDS an arrangement, in one slide-out. |
| `mirror` | `boolean` | — | `src/renderer/src/store.ts:143` |  |
| `focus` | `boolean` | — | `src/renderer/src/store.ts:144` |  |
| `text` | `TextPreset → TextPreset (@shared/rig)` | — | `src/renderer/src/store.ts:145` |  |
| `rigs` | `Rig[] → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:155` | Named arrangements, and the one currently applied. |
| `rigId` | `string \| null` | — | `src/renderer/src/store.ts:156` |  |
| `rigsLoaded` | `boolean` | — | `src/renderer/src/store.ts:165` | Whether the stored workspace has actually been read. |
| `restoredLayout` | `boolean` | — | `src/renderer/src/store.ts:172` | Whether a stored arrangement was actually applied — as opposed to the app |
| `pendingPosition` | `WorkspacePosition \| null → WorkspacePosition (@shared/rig)` | — | `src/renderer/src/store.ts:180` | The saved position, held between `loadRigs` (which recalls it) and `load` |
| `freshTranscripts` | `Record<string, string[]>` | — | `src/renderer/src/store.ts:191` | Transcripts that arrived or changed since the talent last looked at them — |
| `cue` | `CueCard \| null → src/renderer/src/store.CueCard` | — | `src/renderer/src/store.ts:193` |  |
| `nudge` | `number` | — | `src/renderer/src/store.ts:195` | Increments each time a step was refused at the boundary, to replay the nudge. |
| `load` | `(set: ScriptSet) => void → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:197` |  |
| `refresh` | `(set: ScriptSet) => void → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:198` |  |
| `stepNext` | `() => void` | — | `src/renderer/src/store.ts:199` |  |
| `stepPrev` | `() => void` | — | `src/renderer/src/store.ts:200` |  |
| `selectScript` | `(scriptId: string) => void` | — | `src/renderer/src/store.ts:201` |  |
| `goToNextScript` | `() => void` | — | `src/renderer/src/store.ts:202` |  |
| `goToPrevScript` | `() => void` | — | `src/renderer/src/store.ts:203` |  |
| `selectTranscript` | `(transcriptId: string) => void` | — | `src/renderer/src/store.ts:204` |  |
| `selectStyle` | `(style: TriggerStyle) => void → TriggerStyle (@shared/domain)` | — | `src/renderer/src/store.ts:205` |  |
| `toggleZone` | `(zone: RecordingZone) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:206` |  |
| `setDriven` | `(zone: RecordingZone) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:207` |  |
| `setCamera` | `(side: CameraSide) => void → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:208` |  |
| `resizeZones` | `(left: RecordingZone, right: RecordingZone, deltaPx: number) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:209` |  |
| `toggleTranscript` | `() => void` | — | `src/renderer/src/store.ts:210` |  |
| `toggleSetup` | `() => void` | — | `src/renderer/src/store.ts:211` |  |
| `closeSetup` | `() => void` | — | `src/renderer/src/store.ts:212` |  |
| `toggleMirror` | `() => void` | — | `src/renderer/src/store.ts:213` |  |
| `toggleFocus` | `() => void` | — | `src/renderer/src/store.ts:214` |  |
| `setText` | `(preset: TextPreset) => void → TextPreset (@shared/rig)` | — | `src/renderer/src/store.ts:215` |  |
| `loadRigs` | `(rigs: Rig[], workspace: Workspace) => void → Rig (@shared/rig), Workspace (@shared/rig)` | — | `src/renderer/src/store.ts:216` |  |
| `setRigs` | `(rigs: Rig[]) => void → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:217` |  |
| `sets` | `SetSummary[] → src/renderer/src/store.SetSummary` | — | `src/renderer/src/store.ts:224` | Every set (project) in the store, as summaries — for the setup panel's |
| `setSets` | `(sets: SetSummary[]) => void → src/renderer/src/store.SetSummary` | — | `src/renderer/src/store.ts:225` |  |
| `openProject` | `string \| null` | — | `src/renderer/src/store.ts:227` | The session's open project (W6 `context_get`), or null. Never persisted, like the context itself. |
| `setOpenProject` | `(project: string \| null) => void` | — | `src/renderer/src/store.ts:229` | Records the open project; a CHANGE of project resets the filter to it. |
| `setFilter` | `SetFilter → src/renderer/src/store.SetFilter` | — | `src/renderer/src/store.ts:230` |  |
| `setSetFilter` | `(filter: SetFilter) => void → src/renderer/src/store.SetFilter` | — | `src/renderer/src/store.ts:231` |  |
| `stageHold` | `StageHold \| null → src/renderer/src/store.StageHold` | — | `src/renderer/src/store.ts:233` | Non-null while a change event is holding the on-stage data (W6 S1/S2). |
| `setStageHold` | `(hold: StageHold \| null) => void → src/renderer/src/store.StageHold` | — | `src/renderer/src/store.ts:234` |  |
| `unreadableFile` | `UnreadableFile \| null → src/renderer/src/store.UnreadableFile` | — | `src/renderer/src/store.ts:236` | The open project's fli.tubby.json when it cannot be read, else null. |
| `setUnreadableFile` | `(file: UnreadableFile \| null) => void → src/renderer/src/store.UnreadableFile` | — | `src/renderer/src/store.ts:237` |  |
| `requestedSetId` | `string \| null` | — | `src/renderer/src/store.ts:238` |  |
| `requestSet` | `(setId: string) => void` | — | `src/renderer/src/store.ts:239` |  |
| `clearRequestedSet` | `() => void` | — | `src/renderer/src/store.ts:240` |  |
| `applyRig` | `(rigId: string) => void` | — | `src/renderer/src/store.ts:241` |  |
| `adoptRig` | `(rig: Rig) => void → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:242` |  |
| `forgetRig` | `(rigId: string) => void` | — | `src/renderer/src/store.ts:243` |  |
| `dismissCue` | `() => void` | — | `src/renderer/src/store.ts:244` |  |

### `src/renderer/src/store.SetSummary` — interface — `src/renderer/src/store.ts:252-270`

What `list_sets` answers with — a project row for the setup panel.

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `string` | — | `src/renderer/src/store.ts:253` |  |
| `title` | `string` | — | `src/renderer/src/store.ts:254` |  |
| `description` | `string` | — | `src/renderer/src/store.ts:255` |  |
| `project` | `string \| null` | — | `src/renderer/src/store.ts:257` | The FliHub folder name, verbatim, or null for an unattached set. |
| `scriptCount` | `number` | — | `src/renderer/src/store.ts:258` |  |
| `exportedTo` | `?: string \| null` | — | `src/renderer/src/store.ts:260` | Set on an exported app-store copy (W6): the folder whose fli.tubby.json holds the live copy. |
| `readOnly` | `?: boolean` | — | `src/renderer/src/store.ts:262` | An exported store copy seen without its project open — listed, never editable. |
| `livesIn` | `?: string \| null` | — | `src/renderer/src/store.ts:263` |  |
| `onDemand` | `?: boolean` | — | `src/renderer/src/store.ts:265` | A project's on-demand named scripts (`write_script`) — listed by name, newest first. |
| `source` | `?: 'project' \| 'store'` | — | `src/renderer/src/store.ts:267` | Where this row's data was read from: the open project's fli.tubby.json, or the app store. |
| `unreadable` | `?: boolean` | — | `src/renderer/src/store.ts:269` | The open project's fli.tubby.json cannot be read, and this set may live there — get_set refuses it. |

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
| `reason` | `'project-closed' \| 'unreadable'` | — | `src/renderer/src/store.ts:334` |
| `message` | `string` | — | `src/renderer/src/store.ts:335` |

### `src/shared/capabilities.CapabilityMeta` — interface — `src/shared/capabilities.ts:73-101`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/shared/capabilities.ts:74` |  |
| `summary` | `string` | — | `src/shared/capabilities.ts:76` | One line, written for a caller that has never seen this app. |
| `kind` | `CapabilityKind → src/shared/capabilities.CapabilityKind` | — | `src/shared/capabilities.ts:77` |  |
| `sideEffects` | `SideEffect → src/shared/capabilities.SideEffect` | — | `src/shared/capabilities.ts:78` |  |
| `principals` | `readonly Principal[] → src/shared/capabilities.Principal` | — | `src/shared/capabilities.ts:80` | Which surfaces may invoke it. A verb absent from `agent` is UI-only. |
| `idempotent` | `boolean` | — | `src/shared/capabilities.ts:82` | Same input, same effect, however many times. |
| `confirmationRequired` | `boolean` | — | `src/shared/capabilities.ts:84` | Refuses to execute without an approved confirmation. |
| `supportsDryRun` | `boolean` | — | `src/shared/capabilities.ts:86` | Accepts `dryRun: true` and returns a preview instead of acting. |
| `announces` | `boolean` | — | `src/shared/capabilities.ts:97` | Whether a real change here wakes every other client. |
| `supportsIdempotencyKey` | `boolean` | — | `src/shared/capabilities.ts:99` | Honours `idempotencyKey` and replays the original result on retry. |
| `failureModes` | `readonly ErrorCode[] → src/shared/capabilities.ErrorCode` | — | `src/shared/capabilities.ts:100` |  |

### `src/shared/capabilities.InvokeRequest` — interface — `src/shared/capabilities.ts:355-360`

| field | type | default | at | note |
|---|---|---|---|---|
| `capability` | `string` | — | `src/shared/capabilities.ts:356` |  |
| `input` | `?: unknown` | — | `src/shared/capabilities.ts:357` |  |
| `idempotencyKey` | `?: string` | — | `src/shared/capabilities.ts:359` | Retry-safe key. On repeat the ORIGINAL result comes back, not a new one. |

### `src/shared/capabilities.CapabilityError` — interface — `src/shared/capabilities.ts:362-367`

| field | type | default | at | note |
|---|---|---|---|---|
| `code` | `ErrorCode → src/shared/capabilities.ErrorCode` | — | `src/shared/capabilities.ts:363` |  |
| `message` | `string` | — | `src/shared/capabilities.ts:364` |  |
| `details` | `?: unknown` | — | `src/shared/capabilities.ts:366` | Structural detail an agent can act on — which field, which id. |

### `src/shared/capabilities.InvokeResult` — type-union on `ok` — `src/shared/capabilities.ts:369-370`

| variant | shape | default | at |
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

### `src/shared/domain-schema.paragraphSchema` — zod-object — `src/shared/domain-schema.ts:47-50`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('paragraph id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:48` |
| `text` | `z.string().trim().min(1, 'paragraph text must not be empty')` | — | `src/shared/domain-schema.ts:49` |

### `src/shared/domain-schema.minorTopicSchema` — zod-object — `src/shared/domain-schema.ts:52-56`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('minor topic id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:53` |
| `heading` | `z.string().trim().min(1, 'minor topic heading must not be empty')` | — | `src/shared/domain-schema.ts:54` |
| `paragraphs` | `z.array(paragraphSchema).min(1, 'a minor topic needs at least one paragraph') → src/shared/domain-schema.paragraphSchema` | — | `src/shared/domain-schema.ts:55` |

### `src/shared/domain-schema.majorTopicSchema` — zod-object — `src/shared/domain-schema.ts:58-62`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('major topic id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:59` |
| `heading` | `z.string().trim().min(1, 'major topic heading must not be empty')` | — | `src/shared/domain-schema.ts:60` |
| `minors` | `z.array(minorTopicSchema).min(1, 'a major topic needs at least one minor topic') → src/shared/domain-schema.minorTopicSchema` | — | `src/shared/domain-schema.ts:61` |

### `src/shared/domain-schema.triggerSchema` — zod-object — `src/shared/domain-schema.ts:64-68`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('trigger id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:65` |
| `text` | `z.string().trim().min(1, 'trigger text must not be empty')` | — | `src/shared/domain-schema.ts:66` |
| `paragraphId` | `id('paragraph id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:67` |

### `src/shared/domain-schema.triggerSetSchema` — zod-object — `src/shared/domain-schema.ts:70-75`

| field | type | default | at |
|---|---|---|---|
| `style` | `z.enum(TRIGGER_STYLES) → src/shared/domain.TRIGGER_STYLES` | — | `src/shared/domain-schema.ts:71` |
| `authoredBy` | `z.enum(AUTHORSHIPS) → src/shared/domain.AUTHORSHIPS` | — | `src/shared/domain-schema.ts:72` |
| `note` | `z.string().optional()` | — | `src/shared/domain-schema.ts:73` |
| `triggers` | `z.array(triggerSchema).min(2, 'a trigger set needs at least two steps') → src/shared/domain-schema.triggerSchema` | — | `src/shared/domain-schema.ts:74` |

### `src/shared/domain-schema.transcriptSchema` — zod-object — `src/shared/domain-schema.ts:77-85`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('transcript id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:78` |
| `kind` | `z.enum(TRANSCRIPT_KINDS) → src/shared/domain.TRANSCRIPT_KINDS` | — | `src/shared/domain-schema.ts:79` |
| `corpus` | `id('corpus') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:80` |
| `talentId` | `id('talent id').nullable() → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:81` |
| `source` | `z.string().trim().min(1, 'transcript source must not be empty')` | — | `src/shared/domain-schema.ts:82` |
| `topics` | `z.array(majorTopicSchema).min(1, 'a transcript needs at least one major topic') → src/shared/domain-schema.majorTopicSchema` | — | `src/shared/domain-schema.ts:83` |
| `triggerSets` | `z.array(triggerSetSchema) → src/shared/domain-schema.triggerSetSchema` | — | `src/shared/domain-schema.ts:84` |

### `src/shared/domain-schema.scriptSchema` — zod-object — `src/shared/domain-schema.ts:87-100`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('script id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:88` |
| `n` | `z.number().int().positive()` | — | `src/shared/domain-schema.ts:89` |
| `title` | `z.string().trim().min(1, 'script title must not be empty')` | — | `src/shared/domain-schema.ts:90` |
| `takeaway` | `z.string().trim().min(1, 'script takeaway must not be empty')` | — | `src/shared/domain-schema.ts:91` |
| `summary` | `z.string().trim().min(1, 'script summary must not be empty')` | — | `src/shared/domain-schema.ts:92` |
| `transcripts` | `z.array(transcriptSchema) → src/shared/domain-schema.transcriptSchema` | — | `src/shared/domain-schema.ts:93` |
| `video` | `z.string().regex(PROJECT_NAME_PATTERN, 'video must be a video folder name (kebab-case)').max(PROJECT_NAME_MAX, `video must be at most ${PRO… → src/shared/domain.PROJECT_NAME_PATTERN, src/shared/domain.PROJECT_NAME_MAX` | — | `src/shared/domain-schema.ts:95` |

### `src/shared/domain-schema.scriptSetSchema` — zod-object — `src/shared/domain-schema.ts:102-125`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('set id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:103` |
| `title` | `z.string().trim().min(1, 'set title must not be empty')` | — | `src/shared/domain-schema.ts:104` |
| `description` | `z.string().trim()` | — | `src/shared/domain-schema.ts:105` |
| `project` | `z.string().regex(PROJECT_NAME_PATTERN, 'project must be a FliHub folder name (kebab-case)').max(PROJECT_NAME_MAX, `project must be at most … → src/shared/domain.PROJECT_NAME_PATTERN, src/shared/domain.PROJECT_NAME_MAX` | — | `src/shared/domain-schema.ts:108` |
| `exportedTo` | `z.string().regex(PROJECT_NAME_PATTERN, 'exportedTo must be a FliHub folder name (kebab-case)').max(PROJECT_NAME_MAX, `exportedTo must be at… → src/shared/domain.PROJECT_NAME_PATTERN, src/shared/domain.PROJECT_NAME_MAX` | — | `src/shared/domain-schema.ts:115` |
| `exportedBrand` | `z.string().trim().min(1, 'exportedBrand must not be empty').nullish()` | — | `src/shared/domain-schema.ts:122` |
| `onDemand` | `z.boolean().optional()` | — | `src/shared/domain-schema.ts:123` |
| `scripts` | `z.array(scriptSchema) → src/shared/domain-schema.scriptSchema` | — | `src/shared/domain-schema.ts:124` |

### `src/shared/domain-schema.cadenceEnvelopeSchema` — zod-object — `src/shared/domain-schema.ts:127-137`

| field | type | default | at |
|---|---|---|---|
| `wordsMin` | `z.number().int().nonnegative()` | — | `src/shared/domain-schema.ts:128` |
| `wordsMax` | `z.number().int().positive()` | — | `src/shared/domain-schema.ts:129` |
| `breathGroupMeanMin` | `z.number().nonnegative()` | — | `src/shared/domain-schema.ts:130` |
| `breaksPer100Max` | `z.number().nonnegative()` | — | `src/shared/domain-schema.ts:131` |
| `sentenceSdMin` | `z.number().nonnegative()` | — | `src/shared/domain-schema.ts:132` |
| `emDashMax` | `z.number().int().nonnegative()` | — | `src/shared/domain-schema.ts:133` |
| `antiVoice` | `z.array(z.string().min(1))` | — | `src/shared/domain-schema.ts:134` |
| `bookends` | `z.array(z.string().min(1))` | — | `src/shared/domain-schema.ts:135` |
| `source` | `z.string().trim().min(1, 'an envelope must record where it was measured')` | — | `src/shared/domain-schema.ts:136` |

### `src/shared/domain-schema.talentSchema` — zod-object — `src/shared/domain-schema.ts:139-143`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('talent id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:140` |
| `name` | `z.string().trim().min(1, 'talent name must not be empty')` | — | `src/shared/domain-schema.ts:141` |
| `envelope` | `cadenceEnvelopeSchema → src/shared/domain-schema.cadenceEnvelopeSchema` | — | `src/shared/domain-schema.ts:142` |

### `src/shared/domain-schema.rigLayoutSchema` — zod-object — `src/shared/domain-schema.ts:149-162`

| field | type | default | at |
|---|---|---|---|
| `visible` | `z.array(z.enum(RECORDING_SET)).min(1, 'a rig must show at least one zone') → src/shared/rig.RECORDING_SET` | — | `src/shared/domain-schema.ts:150` |
| `driven` | `z.enum(RECORDING_SET) → src/shared/rig.RECORDING_SET` | — | `src/shared/domain-schema.ts:151` |
| `weights` | `z.object({ major: z.number().finite(), minor: z.number().finite(), triggers: z.number().finite(), paragraph: z.number().finite() })` | — | `src/shared/domain-schema.ts:152` |
| `camera` | `z.enum(CAMERA_SIDES) → src/shared/rig.CAMERA_SIDES` | — | `src/shared/domain-schema.ts:158` |
| `text` | `z.enum(TEXT_PRESETS) → src/shared/rig.TEXT_PRESETS` | — | `src/shared/domain-schema.ts:159` |
| `mirror` | `z.boolean()` | — | `src/shared/domain-schema.ts:160` |
| `focus` | `z.boolean()` | — | `src/shared/domain-schema.ts:161` |

### `src/shared/domain-schema.rigLayoutSchema.weights` — zod-object — `src/shared/domain-schema.ts:152`

| field | type | default | at |
|---|---|---|---|
| `major` | `z.number().finite()` | — | `src/shared/domain-schema.ts:153` |
| `minor` | `z.number().finite()` | — | `src/shared/domain-schema.ts:154` |
| `triggers` | `z.number().finite()` | — | `src/shared/domain-schema.ts:155` |
| `paragraph` | `z.number().finite()` | — | `src/shared/domain-schema.ts:156` |

### `src/shared/domain-schema.rigSchema` — zod-object — `src/shared/domain-schema.ts:164-168`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('rig id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:165` |
| `label` | `z.string().trim().min(1, 'a rig needs a name to be pickable')` | — | `src/shared/domain-schema.ts:166` |
| `layout` | `rigLayoutSchema → src/shared/domain-schema.rigLayoutSchema` | — | `src/shared/domain-schema.ts:167` |

### `src/shared/domain-schema.workspaceSchema` — zod-object — `src/shared/domain-schema.ts:170-183`

| field | type | default | at |
|---|---|---|---|
| `layout` | `rigLayoutSchema.nullable() → src/shared/domain-schema.rigLayoutSchema` | — | `src/shared/domain-schema.ts:171` |
| `rigId` | `id('rig id').nullable() → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:172` |
| `position` | `z.object({ setId: z.string().nullable(), scriptId: z.string().nullable(), transcriptId: z.string().nullable(), style: z.enum(TRIGGER_STYLES… → src/shared/domain.TRIGGER_STYLES` | — | `src/shared/domain-schema.ts:174` |

### `src/shared/domain-schema.workspaceSchema.position` — zod-object — `src/shared/domain-schema.ts:174`

| field | type | default | at |
|---|---|---|---|
| `setId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:176` |
| `scriptId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:177` |
| `transcriptId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:178` |
| `style` | `z.enum(TRIGGER_STYLES).nullable() → src/shared/domain.TRIGGER_STYLES` | — | `src/shared/domain-schema.ts:179` |
| `paragraphId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:180` |

### `src/shared/domain.Paragraph` — interface — `src/shared/domain.ts:98-102`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `ParagraphId → src/shared/domain.ParagraphId` | — | `src/shared/domain.ts:99` |  |
| `text` | `string` | — | `src/shared/domain.ts:101` | Verbatim. For a provenance transcript this is never rewritten. |

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

| field | type | default | at | note |
|---|---|---|---|---|
| `style` | `TriggerStyle → src/shared/domain.TriggerStyle` | — | `src/shared/domain.ts:134` |  |
| `authoredBy` | `Authorship → src/shared/domain.Authorship` | — | `src/shared/domain.ts:135` |  |
| `note` | `?: string` | — | `src/shared/domain.ts:137` | Free text — where these came from, so a bad set can be traced and dropped. |
| `triggers` | `Trigger[] → src/shared/domain.Trigger` | — | `src/shared/domain.ts:138` |  |

### `src/shared/domain.Transcript` — interface — `src/shared/domain.ts:141-157`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `TranscriptId → src/shared/domain.TranscriptId` | — | `src/shared/domain.ts:142` |  |
| `kind` | `TranscriptKind → src/shared/domain.TranscriptKind` | — | `src/shared/domain.ts:143` |  |
| `corpus` | `string` | — | `src/shared/domain.ts:150` | Which body of text this is a member of — `tom-original`, `v0N-rewrite`. |
| `talentId` | `TalentId \| null → src/shared/domain.TalentId` | — | `src/shared/domain.ts:152` | Required on `cadence`, forbidden on `provenance`. Enforced below. |
| `source` | `string` | — | `src/shared/domain.ts:154` | Where the text physically came from, for provenance auditing. |
| `topics` | `MajorTopic[] → src/shared/domain.MajorTopic` | — | `src/shared/domain.ts:155` |  |
| `triggerSets` | `TriggerSet[] → src/shared/domain.TriggerSet` | — | `src/shared/domain.ts:156` |  |

### `src/shared/domain.Script` — interface — `src/shared/domain.ts:159-176`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `ScriptId → src/shared/domain.ScriptId` | — | `src/shared/domain.ts:160` |  |
| `n` | `number` | — | `src/shared/domain.ts:162` | Position in the set, 1-based. Display only — `id` is the identity. |
| `title` | `string` | — | `src/shared/domain.ts:163` |  |
| `takeaway` | `string` | — | `src/shared/domain.ts:165` | The originator's approved takeaway. The landing line is held to this. |
| `summary` | `string` | — | `src/shared/domain.ts:167` | Requirements §6 — a set of twelve has to be scannable in one sitting. |
| `transcripts` | `Transcript[] → src/shared/domain.Transcript` | — | `src/shared/domain.ts:168` |  |
| `video` | `?: string \| null` | — | `src/shared/domain.ts:175` | The D15 video this script is for — `videos/<name>/` in the project, |

### `src/shared/domain.ScriptSet` — interface — `src/shared/domain.ts:193-236`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `SetId → src/shared/domain.SetId` | — | `src/shared/domain.ts:194` |  |
| `title` | `string` | — | `src/shared/domain.ts:195` |  |
| `description` | `string` | — | `src/shared/domain.ts:196` |  |
| `project` | `?: string \| null` | — | `src/shared/domain.ts:213` | THE FLIHUB PROJECT this set's scripts record into — the folder name |
| `exportedTo` | `?: string \| null` | — | `src/shared/domain.ts:222` | Set by `set_export_to_project` (W6, open-contract §4): the FliHub folder |
| `exportedBrand` | `?: string \| null` | — | `src/shared/domain.ts:228` | The `brands.json` key the export was made under — recorded beside |
| `onDemand` | `?: boolean` | — | `src/shared/domain.ts:234` | A project's on-demand scripts (`write_script`, B585): many small NAMED |
| `scripts` | `Script[] → src/shared/domain.Script` | — | `src/shared/domain.ts:235` |  |

### `src/shared/domain.CadenceEnvelope` — interface — `src/shared/domain.ts:251-268`

The eight deterministic threshold rules from

| field | type | default | at | note |
|---|---|---|---|---|
| `wordsMin` | `number` | — | `src/shared/domain.ts:252` |  |
| `wordsMax` | `number` | — | `src/shared/domain.ts:253` |  |
| `breathGroupMeanMin` | `number` | — | `src/shared/domain.ts:255` | Mean words per breath group. David ≈ 11.5; Tom writes ≈ 7. |
| `breaksPer100Max` | `number` | — | `src/shared/domain.ts:257` | Internal punctuation breaks per 100 words. |
| `sentenceSdMin` | `number` | — | `src/shared/domain.ts:259` | Sentence-length standard deviation — flat rhythm reads as written. |
| `emDashMax` | `number` | — | `src/shared/domain.ts:261` | Em-dash appositives. Zero, for this talent. |
| `antiVoice` | `string[]` | — | `src/shared/domain.ts:263` | Words that do not belong in this talent's voice, as regex-safe literals. |
| `bookends` | `string[]` | — | `src/shared/domain.ts:265` | Channel bookends that must not appear inside a script body. |
| `source` | `string` | — | `src/shared/domain.ts:267` | Where these numbers were measured. Never guess this field. |

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
| `platform` | `NodeJS.Platform → NodeJS (@types/node), Platform (@types/node)` | — | `src/shared/ipc.ts:41` |

### `src/shared/ipc.ControlStatus` — interface — `src/shared/ipc.ts:44-53`

| field | type | default | at | note |
|---|---|---|---|---|
| `running` | `boolean` | — | `src/shared/ipc.ts:45` |  |
| `port` | `number \| null` | — | `src/shared/ipc.ts:46` |  |
| `discoveryPath` | `string \| null` | — | `src/shared/ipc.ts:52` | The path an agent reads the token from. The TOKEN ITSELF never crosses this |

### `src/shared/ipc.ControlChanged` — interface — `src/shared/ipc.ts:55-59`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/ipc.ts:56` |
| `principal` | `'ui' \| 'agent'` | — | `src/shared/ipc.ts:57` |
| `at` | `number` | — | `src/shared/ipc.ts:58` |

### `src/shared/ipc.InvokePayload` — interface — `src/shared/ipc.ts:61-65`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/ipc.ts:62` |
| `input` | `?: unknown` | — | `src/shared/ipc.ts:63` |
| `idempotencyKey` | `?: string` | — | `src/shared/ipc.ts:64` |

### `src/shared/ipc.AppytronApi` — interface — `src/shared/ipc.ts:68-74`

The API exposed to the renderer on `window.appytron`.

| field | type | default | at | note |
|---|---|---|---|---|
| `getAppInfo` | `(): Promise<AppInfo>` | — | `src/shared/ipc.ts:69` |  |
| `invoke` | `<T = unknown>(payload: InvokePayload): Promise<InvokeResult<T>>` | — | `src/shared/ipc.ts:70` |  |
| `getControlStatus` | `(): Promise<ControlStatus>` | — | `src/shared/ipc.ts:71` |  |
| `onControlChanged` | `(listener: (event: ControlChanged) => void): () => void` | — | `src/shared/ipc.ts:73` | Subscribe to store changes. Returns an unsubscribe function. |

### `src/shared/rig.RigLayout` — interface — `src/shared/rig.ts:69-81`

| field | type | default | at | note |
|---|---|---|---|---|
| `visible` | `RecordingZone[] → src/shared/rig.RecordingZone` | — | `src/shared/rig.ts:71` | Which zones are on screen, in canonical order. Never empty. |
| `driven` | `RecordingZone → src/shared/rig.RecordingZone` | — | `src/shared/rig.ts:73` | Which one the arrow keys move, and which one carries the strong marker. |
| `weights` | `Record<RecordingZone, number> → src/shared/rig.RecordingZone` | — | `src/shared/rig.ts:75` | Relative flex weight per zone — proportions, so they survive a resize. |
| `camera` | `CameraSide → src/shared/rig.CameraSide` | — | `src/shared/rig.ts:76` |  |
| `text` | `TextPreset → src/shared/rig.TextPreset` | — | `src/shared/rig.ts:77` |  |
| `mirror` | `boolean` | — | `src/shared/rig.ts:79` | Prompter glass. A property of the physical rig, which is why it is here. |
| `focus` | `boolean` | — | `src/shared/rig.ts:80` |  |

### `src/shared/rig.Rig` — interface — `src/shared/rig.ts:83-92`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `RigId → src/shared/rig.RigId` | — | `src/shared/rig.ts:84` |  |
| `label` | `string` | — | `src/shared/rig.ts:90` | The human name, and the ONE field that changes on its own. David: "whatever |
| `layout` | `RigLayout → src/shared/rig.RigLayout` | — | `src/shared/rig.ts:91` |  |

### `src/shared/rig.WorkspacePosition` — interface — `src/shared/rig.ts:118-124`

Where the talent WAS — script, corpus, style, and the paragraph in front of

| field | type | default | at |
|---|---|---|---|
| `setId` | `string \| null` | — | `src/shared/rig.ts:119` |
| `scriptId` | `string \| null` | — | `src/shared/rig.ts:120` |
| `transcriptId` | `string \| null` | — | `src/shared/rig.ts:121` |
| `style` | `TriggerStyle \| null → src/shared/domain.TriggerStyle` | — | `src/shared/rig.ts:122` |
| `paragraphId` | `string \| null` | — | `src/shared/rig.ts:123` |

### `src/shared/rig.Workspace` — interface — `src/shared/rig.ts:126-131`

| field | type | default | at | note |
|---|---|---|---|---|
| `layout` | `RigLayout \| null → src/shared/rig.RigLayout` | — | `src/shared/rig.ts:127` |  |
| `rigId` | `RigId \| null → src/shared/rig.RigId` | — | `src/shared/rig.ts:128` |  |
| `position` | `?: WorkspacePosition \| null → src/shared/rig.WorkspacePosition` | — | `src/shared/rig.ts:130` | Absent in stores written before 2026-08-31; treat as null. |

## Cannot be mirrored

These were looked at and could not be resolved to an authority. **Nothing is guessed for them.** Each is a real gap in this page.

| subject | why | looked at |
|---|---|---|
| schemas built by `appFileName(...)` (1 use) | built by calling `appFileName(...)` imported from `@flivideo/core`; package helpers are not expanded - see that package's own mirror | `appFileName({ app: 'tubby' }) (src/core/project-store.ts:27)` |
| schemas built by `id(...)` (13 uses) | built by calling `id(...)`, which does not return a single zod expression this reader can follow | `id('paragraph id') (src/shared/domain-schema.ts:48)`<br>`id('minor topic id') (src/shared/domain-schema.ts:53)`<br>`id('major topic id') (src/shared/domain-schema.ts:59)`<br>`id('trigger id') (src/shared/domain-schema.ts:65)`<br>`id('paragraph id') (src/shared/domain-schema.ts:67)`<br>`id('transcript id') (src/shared/domain-schema.ts:78)`<br>`id('corpus') (src/shared/domain-schema.ts:80)`<br>`id('talent id').nullable() (src/shared/domain-schema.ts:81)`<br>`id('script id') (src/shared/domain-schema.ts:88)`<br>`id('set id') (src/shared/domain-schema.ts:103)` |
| src/core/input-shapes.layoutInput.camera | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(CAMERA_SIDES)` |
| src/core/input-shapes.layoutInput.driven | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(RECORDING_SET)` |
| src/core/input-shapes.layoutInput.text | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(TEXT_PRESETS)` |
| src/core/input-shapes.layoutInput.visible[] | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(RECORDING_SET)` |

### Declared but not read

The census found these top-level declarations and the extractor did not mirror them. Nothing else about them is on this page.

| family | count | declarations |
|---|---|---|
| class | 15 | `src/core/active-context.ActiveContextHolder` `src/core/active-context.ts:48`<br>`src/core/open-context.OpenContextHolder` `src/core/open-context.ts:250`<br>`src/core/repository.FileRepository` `src/core/repository.ts:109`<br>`src/core/repository.MemoryRepository` `src/core/repository.ts:80`<br>`src/core/safety.AuditLog` `src/core/safety.ts:305`<br>`src/core/safety.CapabilityFailure` `src/core/safety.ts:40`<br>`src/core/safety.ConfirmationLedger` `src/core/safety.ts:125`<br>`src/core/safety.IdempotencyLedger` `src/core/safety.ts:220`<br>`src/core/safety.RateLimiter` `src/core/safety.ts:259`<br>`src/main/file-author.FileAuthor` `src/main/file-author.ts:32`<br>`src/main/ipc-router.IpcRouter` `src/main/ipc-router.ts:19`<br>`src/main/process-supervisor.Managed` `src/main/process-supervisor.ts:54`<br>`src/main/process-supervisor.ProcessSupervisor` `src/main/process-supervisor.ts:31`<br>`src/main/updater.Updater` `src/main/updater.ts:25`<br>`src/main/window-manager.WindowManager` `src/main/window-manager.ts:20` |
| alias of a primitive | 8 | `src/shared/domain.ParagraphId` `src/shared/domain.ts:47`<br>`src/shared/domain.ScriptId` `src/shared/domain.ts:44`<br>`src/shared/domain.SetId` `src/shared/domain.ts:43`<br>`src/shared/domain.TalentId` `src/shared/domain.ts:49`<br>`src/shared/domain.TopicId` `src/shared/domain.ts:46`<br>`src/shared/domain.TranscriptId` `src/shared/domain.ts:45`<br>`src/shared/domain.TriggerId` `src/shared/domain.ts:48`<br>`src/shared/rig.RigId` `src/shared/rig.ts:32` |
| object constant | 8 | `src/core/input-shapes.INPUT` `src/core/input-shapes.ts:78`<br>`src/core/repository.EMPTY_DOCUMENT` `src/core/repository.ts:35`<br>`src/renderer/src/store.ZONE_LABEL` `src/renderer/src/store.ts:88`<br>`src/shared/domain.TRIGGER_STYLE_LETTER` `src/shared/domain.ts:84`<br>`src/shared/ipc.IPC` `src/shared/ipc.ts:21`<br>`src/shared/rig.DEFAULT_LAYOUT` `src/shared/rig.ts:142`<br>`src/shared/rig.EMPTY_WORKSPACE` `src/shared/rig.ts:133`<br>`src/shared/script-set.KYBERNESIS_PHASE_1` `src/shared/script-set.ts:17` |
| array constant | 2 | `src/shared/capabilities.CAPABILITIES` `src/shared/capabilities.ts:166`<br>`src/shared/script-set.TALENTS` `src/shared/script-set.ts:2110` |
| constant (other form) | 2 | `src/core/active-context.ACTIVE_CONTEXT_TTL_MS` `src/core/active-context.ts:27`<br>`src/core/safety.CONFIRMATION_TTL_MS` `src/core/safety.ts:123` |
| const built by a call (helper or non-zod call) | 1 | `src/renderer/src/store.useProm` `src/renderer/src/store.ts:408` |
| derived type (`keyof typeof`, indexed access, `typeof`) | 1 | `src/shared/capabilities.CapabilityName` `src/shared/capabilities.ts:338` |
| instance constant (`new ...`) | 1 | `src/shared/capabilities.CAPABILITY_BY_NAME` `src/shared/capabilities.ts:340` |
| union of named or mixed types | 1 | `src/core/active-context.ActiveContext` `src/core/active-context.ts:38` |

## Findings — changes needed in the target application

These are refactors of the **application**, not of this mirror. Each one converts a derived section into a declared one.

1. `src/main/control-server.ts:255` — REFACTOR: `result.error.code` is a closed set enforced only by control flow at src/main/control-server.ts:255. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
2. `src/renderer/src/App.tsx:737` — REFACTOR: `zone` is a closed set enforced only by control flow at src/renderer/src/App.tsx:737. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.

---

Regenerate: `schema-mirror` skill → `extract_typescript.py` + `render_mirror.py`. Check for drift: `verify_mirror.py`.
