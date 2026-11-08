# Schema mirror

> Generated from the code, not written about it. Do not hand-edit — every line below is anchored to a `file:line` and is re-derived on every run. `verify_mirror.py` fails when this page no longer matches its JSON. To record a gap the extractor cannot find, use `docs/schema-mirror.known-gaps.json`.

- **stack** `typescript` · **extractor** `extract_typescript.py`
- **commit** `b33e6dbd39b0` · **generated** 2026-11-08T10:58:58+00:00
- **scope** include `*.ts`, `*.tsx` · exclude `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `*.stories.tsx`, `*.config.ts`, `*/test/*`, `*/tests/*`, `*/__tests__/*`, `*/e2e/*`, `*/__mocks__/*`, `*/fixtures/*`, `*.d.ts`, `*/dist/*`, `*/build/*`, `*/out/*`
- **zod bound** in 0 file(s) by a direct import, 6 through a re-export, 0 by call shape only

| shapes | declared sets | derived sets | gaps | declared but not read | findings |
|---|---|---|---|---|---|
| 168 | 47 | 6 | 9 | 54 | 6 |

> **Read the gaps, the census and the never-read list before trusting the shape.** Derived sets have no declaring symbol and will drift silently. Gaps are things this mirror could not reach — they are not absences in the code.

## Index

Top-level entries by file, with the line each is declared on. Search the page for the name.

- `src/core/active-context.ts` — `ActiveSelection` :29
- `src/core/cadence.ts` — `CadenceMeasurements` :29 · `CadenceRule` :44 · `CadenceScore` :62
- `src/core/handlers.ts` — `HandlerContext` :81 · `Resolved` :143 · `MaybeUnreadable` :342
- `src/core/index.ts` — `CoreOptions` :50 · `WindowShown` :65 · `LifecycleHooks` :74 · `InvokeOptions` :93 · `ChangeEvent` :115 · `Core` :121
- `src/core/input-shapes.ts` — `slug` :25 · `projectName` :28 · `paragraphInput` :34 · `minorInput` :39 · `majorInput` :45 · `layoutInput` :56 · `triggerInput` :71 · `InputField` :372 · `Def` :392
- `src/core/open-context.ts` — `OPEN_REFUSAL_CODES` (set) :35 · `OpenRefusal` :45 · `OpenContext` :54 · `OpenResolution` :65 · `ResolveOpenArgsOptions` :69 · `ContextReport` :239
- `src/core/press-log.ts` — `PressEvent` :18 · `PressLogOptions` :25 · `KINDS` (set) :34
- `src/core/project-store.ts` — `projectFileSchema` :33 · `UnreadableProjectFile` :98
- `src/core/reanchor.ts` — `Para` :11
- `src/core/recognizer.ts` — `RecognizerEvent` :11 · `Recognizer` :17 · `LiveRecognizer` :28
- `src/core/repository.ts` — `RepositoryDocument` :24 · `Repository` :66
- `src/core/safety.ts` — `PendingAction` :107 · `AuditEntry` :288
- `src/core/stage.ts` — `StagePosition` :29 · `StageRequest` :38
- `src/core/text-script.ts` — `TextScriptInput` :28 · `VariantMerge` :216
- `src/core/voice-driver.ts` — `DriverParagraph` :15 · `VoiceCursor` :21 · `DriverResult` :27 · `VoiceDriver` :36
- `src/core/voice-follow-replay.ts` — `TimedWord` :16 · `ParagraphResult` :21 · `ReplaySummary` :29 · `PressLogOptions` :133
- `src/core/voice-follow.ts` — `FollowOptions` :12 · `FollowReason` (set) :45 · `FollowResult` :52 · `FollowState` :59 · `Follower` :67 · `ScriptWord` :73 · `Chain` :186
- `src/core/voice-highlight.ts` — `WordState` (set) :17 · `HighlightToken` :19
- `src/core/voice-selftest.ts` — `CheckName` (set) :21 · `SelftestCheck` :23 · `SelftestReport` :32 · `SelftestDeps` :39
- `src/main/control-server.ts` — `ControlServerOptions` :60 · `ControlServerHandle` :69
- `src/main/create-console.ts` — `ConsoleContext` :9 · `Console` :16 · `CreateConsoleOptions` :21
- `src/main/file-author.ts` — `FileAuthorOptions` :9 · `AuthorResult` :16
- `src/main/ipc-router.ts` — `HandlerDef` :4
- `src/main/process-supervisor.ts` — `SpawnOptions` :4 · `ProcessStatus` (set) :11 · `LogChunk` :12 · `ManagedProcess` :17
- `src/main/show-window.ts` — `ShowableWindow` :4 · `ShowDeps` :16
- `src/main/updater.ts` — `UpdateStatus` (set) :4 · `UpdateState` :7 · `UpdaterOptions` :14
- `src/main/voice/apple-bundle.ts` — `status (switch)` (set) :17 · `HelperLine` :31 · `AppleHelper` :100
- `src/main/voice/apple-partials.ts` — `PartialVerdict` :21 · `PartialFilter` :25
- `src/main/voice/groq-live.ts` — `GroqLiveOptions` :60
- `src/main/voice/voice-control.ts` — `MicGate` :4 · `VoiceControlDeps` :9 · `VoiceControlResult` :16
- `src/main/voice/voice-session.ts` — `VoiceSessionOptions` :4
- `src/main/window-manager.ts` — `WindowOptions` :4
- `src/renderer/src/App.tsx` — `zone (switch)` (set) :798
- `src/renderer/src/components/CadencePanel.tsx` — `Rule` :23 · `Score` :31
- `src/renderer/src/components/Zones.tsx` — `ParagraphVoice` :272
- `src/renderer/src/store.ts` — `ZONES` (set) :73 · `CueCard` :99 · `PrompterState` :106 · `SetSummary` :277 · `UnreadableFile` :298 · `StageHold` :354 · `Rank` (set) :1291
- `src/renderer/src/voice-live.ts` — `VoiceState` (set) :13 · `VoiceStore` :15
- `src/shared/capabilities.ts` — `PRINCIPALS` (set) :36 · `SIDE_EFFECTS` (set) :43 · `CapabilityKind` (set) :51 · `ERROR_CODES` (set) :59 · `CapabilityMeta` :75 · `InvokeRequest` :428 · `CapabilityError` :435 · `InvokeResult` :444
- `src/shared/domain-schema.ts` — `paragraphSchema` :47 · `minorTopicSchema` :52 · `majorTopicSchema` :58 · `triggerSchema` :64 · `triggerSetSchema` :70 · `transcriptSchema` :77 · `scriptSchema` :93 · `scriptSetSchema` :108 · `cadenceEnvelopeSchema` :133 · `talentSchema` :145 · `rigLayoutSchema` :155 · `rigSchema` :170 · `workspaceSchema` :176
- `src/shared/domain.ts` — `TRANSCRIPT_KINDS` (set) :68 · `TRIGGER_STYLES` (set) :83 · `AUTHORSHIPS` (set) :94 · `Paragraph` :101 · `MinorTopic` :108 · `MajorTopic` :115 · `Trigger` :130 · `TriggerSet` :136 · `Transcript` :144 · `TranscriptVariant` :168 · `Script` :175 · `ScriptSet` :232 · `CadenceEnvelope` :290 · `Talent` :309 · `DomainViolation` :320
- `src/shared/ipc.ts` — `AppInfo` :45 · `ControlStatus` :54 · `ControlChanged` :65 · `InvokePayload` :71 · `AppytronApi` :78
- `src/shared/press.ts` — `PressKind` (set) :3 · `PressInput` :6
- `src/shared/rig.ts` — `RECORDING_SET` (set) :47 · `CAMERA_SIDES` (set) :51 · `TEXT_PRESETS` (set) :55 · `RigLayout` :69 · `Rig` :83 · `WorkspacePosition` :118 · `Workspace` :126
- `src/shared/voice.ts` — `VoiceEngine` (set) :2 · `VoiceEvent` :4 · `VoiceControl` :13

## Never read by this extractor

These constructs are outside what this extractor reads **on every run, in every repo**. A page with no gaps is still partial by exactly this list.

- classes - a class's fields are never mirrored (the census lists each one)
- generic, mapped and conditional type aliases
- template-literal types, and unions that contain one
- unions of object types where a variant has no discriminator, type name or property of its own (listed as gaps where met)
- aliases of another type or value (`X = Y`), and utility-type aliases (`Pick<>`, `Omit<>`, `Record<>`)
- `keyof typeof X` / indexed-access types, unless X itself is read as a closed set
- results of `.pick` / `.omit` / `.partial` / `.required` (listed as gaps where met)
- zod schemas built inside function bodies, other than a function that returns one zod expression
- the parameterised result of a schema helper or factory call (listed as gaps where met)
- constants that are not exported (the census does not count them)
- `*.d.ts` files and build output (`dist/`, `build/`, `out/`) - excluded by default
- regex-encoded sets, JSON Schema files, and the data actually on disk

## Coverage census

**217** top-level declarations counted = **160** mirrored + **3** listed as gaps + **54** declared but not read.

Counted: every top-level interface, enum, class and type alias (exported or not) and every exported constant, in the files in scope.
Not counted, as not schema-bearing: 35 functions, 3 function types, 19 literal constants.

| file | declared | mirrored | gaps | not read |
|---|---|---|---|---|
| `src/core/active-context.ts` | 4 | 1 | 0 | **3** |
| `src/core/agent-layer.ts` | 4 | 0 | 2 | **2** |
| `src/core/input-shapes.ts` | 4 | 2 | 0 | **2** |
| `src/core/open-context.ts` | 8 | 7 | 0 | **1** |
| `src/core/press-log.ts` | 3 | 2 | 0 | **1** |
| `src/core/repository.ts` | 5 | 2 | 0 | **3** |
| `src/core/safety.ts` | 8 | 2 | 0 | **6** |
| `src/core/stage.ts` | 5 | 2 | 0 | **3** |
| `src/core/voice-follow.ts` | 8 | 7 | 0 | **1** |
| `src/core/voice-selftest.ts` | 5 | 4 | 0 | **1** |
| `src/main/file-author.ts` | 3 | 2 | 0 | **1** |
| `src/main/ipc-router.ts` | 2 | 1 | 0 | **1** |
| `src/main/process-supervisor.ts` | 6 | 4 | 0 | **2** |
| `src/main/updater.ts` | 4 | 3 | 0 | **1** |
| `src/main/voice/apple-live.ts` | 1 | 0 | 0 | **1** |
| `src/main/voice/groq-live.ts` | 3 | 1 | 0 | **2** |
| `src/main/voice/voice-session.ts` | 2 | 1 | 0 | **1** |
| `src/main/window-manager.ts` | 2 | 1 | 0 | **1** |
| `src/renderer/src/press-log.ts` | 1 | 0 | 0 | **1** |
| `src/renderer/src/store.ts` | 10 | 8 | 0 | **2** |
| `src/renderer/src/voice-live.ts` | 3 | 2 | 0 | **1** |
| `src/shared/capabilities.ts` | 14 | 11 | 0 | **3** |
| `src/shared/domain.ts` | 26 | 18 | 0 | **8** |
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

### `src/core/text-script.VariantMerge.kind` — `src/core/text-script.ts:216-219`

*the `kind` discriminator of union type `VariantMerge` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `write` | `src/core/text-script.ts:217` |
| `unchanged` | `src/core/text-script.ts:218` |
| `stale` | `src/core/text-script.ts:219` |

### `src/core/voice-follow.FollowReason` — `src/core/voice-follow.ts:45-50`

*literal union type alias `FollowReason` - a single declaring symbol*

| value | declared at |
|---|---|
| `advanced` | `src/core/voice-follow.ts:46` |
| `held-no-agreement` | `src/core/voice-follow.ts:47` |
| `held-unconfirmed` | `src/core/voice-follow.ts:48` |
| `no-match` | `src/core/voice-follow.ts:49` |
| `end` | `src/core/voice-follow.ts:50` |

### `src/core/voice-highlight.WordState` — `src/core/voice-highlight.ts:17`

*literal union type alias `WordState` - a single declaring symbol*

| value | declared at |
|---|---|
| `said` | `src/core/voice-highlight.ts:17` |
| `current` | `src/core/voice-highlight.ts:17` |
| `unsaid` | `src/core/voice-highlight.ts:17` |

### `src/core/voice-highlight.HighlightToken.kind` — `src/core/voice-highlight.ts:19-31`

*the `kind` discriminator of union type `HighlightToken` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `word` | `src/core/voice-highlight.ts:21` |
| `cue` | `src/core/voice-highlight.ts:30` |
| `gap` | `src/core/voice-highlight.ts:31` |

### `src/core/voice-selftest.CheckName` — `src/core/voice-selftest.ts:21`

*literal union type alias `CheckName` - a single declaring symbol*

| value | declared at |
|---|---|
| `groq-key` | `src/core/voice-selftest.ts:21` |
| `mic-permission` | `src/core/voice-selftest.ts:21` |
| `groq-roundtrip` | `src/core/voice-selftest.ts:21` |
| `apple-helper` | `src/core/voice-selftest.ts:21` |
| `aligner` | `src/core/voice-selftest.ts:21` |

### `src/core/voice-selftest.SelftestReport.where` — `src/core/voice-selftest.ts:35`

Where the test ran: inside the app (real mic status) or standalone.

*literal union type of `where` - a single declaring symbol*

| value | declared at |
|---|---|
| `app` | `src/core/voice-selftest.ts:35` |
| `standalone` | `src/core/voice-selftest.ts:35` |

### `src/core/voice-selftest.SelftestDeps.where` — `src/core/voice-selftest.ts:40`

*literal union type of `where` - a single declaring symbol*

| value | declared at |
|---|---|
| `app` | `src/core/voice-selftest.ts:40` |
| `standalone` | `src/core/voice-selftest.ts:40` |

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

### `src/main/voice/apple-bundle.HelperLine.kind` — `src/main/voice/apple-bundle.ts:31-40`

*the `kind` discriminator of union type `HelperLine` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `partial` | `src/main/voice/apple-bundle.ts:33` |
| `task` | `src/main/voice/apple-bundle.ts:35` |
| `retry` | `src/main/voice/apple-bundle.ts:37` |
| `error` | `src/main/voice/apple-bundle.ts:39` |
| `info` | `src/main/voice/apple-bundle.ts:40` |

### `src/main/voice/apple-partials.PartialVerdict.kind` — `src/main/voice/apple-partials.ts:21-23`

*the `kind` discriminator of union type `PartialVerdict` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `text` | `src/main/voice/apple-partials.ts:22` |
| `drop` | `src/main/voice/apple-partials.ts:23` |

### `src/main/voice/apple-partials.PartialVerdict[kind=drop].reason` — `src/main/voice/apple-partials.ts:23`

*literal union type of `reason` - a single declaring symbol*

| value | declared at |
|---|---|
| `stale-task` | `src/main/voice/apple-partials.ts:23` |
| `after-reset` | `src/main/voice/apple-partials.ts:23` |

### `src/renderer/src/store.ZONES` — `src/renderer/src/store.ts:73`

*`as const` array `ZONES`, typed from by `typeof ZONES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/renderer/src/store.ts:73` |
| `minor` | `src/renderer/src/store.ts:73` |
| `triggers` | `src/renderer/src/store.ts:73` |
| `paragraph` | `src/renderer/src/store.ts:73` |
| `transcript` | `src/renderer/src/store.ts:73` |

### `src/renderer/src/store.SetSummary.source` — `src/renderer/src/store.ts:292`

Where this row's data was read from: the open project's fli.tubby.json, or the app store.

*literal union type of `source` - a single declaring symbol*

| value | declared at |
|---|---|
| `project` | `src/renderer/src/store.ts:292` |
| `store` | `src/renderer/src/store.ts:292` |

### `src/renderer/src/store.StageHold.reason` — `src/renderer/src/store.ts:355`

*literal union type of `reason` - a single declaring symbol*

| value | declared at |
|---|---|
| `project-closed` | `src/renderer/src/store.ts:355` |
| `unreadable` | `src/renderer/src/store.ts:355` |

### `src/renderer/src/store.Rank` — `src/renderer/src/store.ts:1291`

*literal union type alias `Rank` - a single declaring symbol*

| value | declared at |
|---|---|
| `driven` | `src/renderer/src/store.ts:1291` |
| `follower` | `src/renderer/src/store.ts:1291` |

### `src/renderer/src/voice-live.VoiceState` — `src/renderer/src/voice-live.ts:13`

*literal union type alias `VoiceState` - a single declaring symbol*

| value | declared at |
|---|---|
| `off` | `src/renderer/src/voice-live.ts:13` |
| `starting` | `src/renderer/src/voice-live.ts:13` |
| `following` | `src/renderer/src/voice-live.ts:13` |
| `waiting` | `src/renderer/src/voice-live.ts:13` |
| `error` | `src/renderer/src/voice-live.ts:13` |

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

### `src/shared/capabilities.ERROR_CODES` — `src/shared/capabilities.ts:59-72`

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
| `app_busy` | `src/shared/capabilities.ts:71` |

### `src/shared/capabilities.InvokeResult.ok` — `src/shared/capabilities.ts:444-445`

*the `ok` discriminator of union type `InvokeResult` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `true` | `src/shared/capabilities.ts:445` |
| `false` | `src/shared/capabilities.ts:445` |

### `src/shared/domain-schema.triggerSetSchema.style` — `src/shared/domain-schema.ts:71`

*`z.enum` `style` - members read through `TRIGGER_STYLES` (src/shared/domain.TRIGGER_STYLES) - a single declaring symbol*

| value | declared at |
|---|---|
| `near-verbatim` | `src/shared/domain.ts:83` |
| `compressed-concept` | `src/shared/domain.ts:83` |
| `loose-keywords` | `src/shared/domain.ts:83` |

### `src/shared/domain-schema.triggerSetSchema.authoredBy` — `src/shared/domain-schema.ts:72`

*`z.enum` `authoredBy` - members read through `AUTHORSHIPS` (src/shared/domain.AUTHORSHIPS) - a single declaring symbol*

| value | declared at |
|---|---|
| `hand` | `src/shared/domain.ts:94` |
| `agent` | `src/shared/domain.ts:94` |

### `src/shared/domain-schema.transcriptSchema.kind` — `src/shared/domain-schema.ts:79`

*`z.enum` `kind` - members read through `TRANSCRIPT_KINDS` (src/shared/domain.TRANSCRIPT_KINDS) - a single declaring symbol*

| value | declared at |
|---|---|
| `provenance` | `src/shared/domain.ts:68` |
| `cadence` | `src/shared/domain.ts:68` |
| `variant` | `src/shared/domain.ts:68` |

### `src/shared/domain-schema.rigLayoutSchema.visible[]` — `src/shared/domain-schema.ts:156`

*`z.enum` `visible[]` - members read through `RECORDING_SET` (src/shared/rig.RECORDING_SET) - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/shared/rig.ts:47` |
| `minor` | `src/shared/rig.ts:47` |
| `triggers` | `src/shared/rig.ts:47` |
| `paragraph` | `src/shared/rig.ts:47` |

### `src/shared/domain-schema.rigLayoutSchema.driven` — `src/shared/domain-schema.ts:157`

*`z.enum` `driven` - members read through `RECORDING_SET` (src/shared/rig.RECORDING_SET) - a single declaring symbol*

| value | declared at |
|---|---|
| `major` | `src/shared/rig.ts:47` |
| `minor` | `src/shared/rig.ts:47` |
| `triggers` | `src/shared/rig.ts:47` |
| `paragraph` | `src/shared/rig.ts:47` |

### `src/shared/domain-schema.rigLayoutSchema.camera` — `src/shared/domain-schema.ts:164`

*`z.enum` `camera` - members read through `CAMERA_SIDES` (src/shared/rig.CAMERA_SIDES) - a single declaring symbol*

| value | declared at |
|---|---|
| `left` | `src/shared/rig.ts:51` |
| `right` | `src/shared/rig.ts:51` |

### `src/shared/domain-schema.rigLayoutSchema.text` — `src/shared/domain-schema.ts:165`

*`z.enum` `text` - members read through `TEXT_PRESETS` (src/shared/rig.TEXT_PRESETS) - a single declaring symbol*

| value | declared at |
|---|---|
| `standard` | `src/shared/rig.ts:55` |
| `large` | `src/shared/rig.ts:55` |
| `stage` | `src/shared/rig.ts:55` |

### `src/shared/domain-schema.workspaceSchema.position.style` — `src/shared/domain-schema.ts:185`

*`z.enum` `style` - members read through `TRIGGER_STYLES` (src/shared/domain.TRIGGER_STYLES) - a single declaring symbol*

| value | declared at |
|---|---|
| `near-verbatim` | `src/shared/domain.ts:83` |
| `compressed-concept` | `src/shared/domain.ts:83` |
| `loose-keywords` | `src/shared/domain.ts:83` |

### `src/shared/domain.TRANSCRIPT_KINDS` — `src/shared/domain.ts:68`

*`as const` array `TRANSCRIPT_KINDS`, typed from by `typeof TRANSCRIPT_KINDS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `provenance` | `src/shared/domain.ts:68` |
| `cadence` | `src/shared/domain.ts:68` |
| `variant` | `src/shared/domain.ts:68` |

### `src/shared/domain.TRIGGER_STYLES` — `src/shared/domain.ts:83`

*`as const` array `TRIGGER_STYLES`, typed from by `typeof TRIGGER_STYLES[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `near-verbatim` | `src/shared/domain.ts:83` |
| `compressed-concept` | `src/shared/domain.ts:83` |
| `loose-keywords` | `src/shared/domain.ts:83` |

### `src/shared/domain.AUTHORSHIPS` — `src/shared/domain.ts:94`

*`as const` array `AUTHORSHIPS`, typed from by `typeof AUTHORSHIPS[number]` - a single declaring symbol*

| value | declared at |
|---|---|
| `hand` | `src/shared/domain.ts:94` |
| `agent` | `src/shared/domain.ts:94` |

### `src/shared/ipc.ControlChanged.principal` — `src/shared/ipc.ts:67`

*literal union type of `principal` - a single declaring symbol*

| value | declared at |
|---|---|
| `ui` | `src/shared/ipc.ts:67` |
| `agent` | `src/shared/ipc.ts:67` |

### `src/shared/press.PressKind` — `src/shared/press.ts:3`

`voice` = the aligner moved the position (not David) — keeps live reads from polluting press truth.

*literal union type alias `PressKind` - a single declaring symbol*

| value | declared at |
|---|---|
| `step` | `src/shared/press.ts:3` |
| `back` | `src/shared/press.ts:3` |
| `jump` | `src/shared/press.ts:3` |
| `start` | `src/shared/press.ts:3` |
| `stop` | `src/shared/press.ts:3` |
| `voice` | `src/shared/press.ts:3` |

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

### `src/shared/voice.VoiceEngine` — `src/shared/voice.ts:2`

Voice-follow IPC shapes, shared by renderer, preload and main.

*literal union type alias `VoiceEngine` - a single declaring symbol*

| value | declared at |
|---|---|
| `groq` | `src/shared/voice.ts:2` |
| `apple` | `src/shared/voice.ts:2` |

### `src/shared/voice.VoiceEvent.type` — `src/shared/voice.ts:4-11`

*the `type` discriminator of union type `VoiceEvent` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `text` | `src/shared/voice.ts:5` |
| `status` | `src/shared/voice.ts:7` |

### `src/shared/voice.VoiceEvent[type=status].state` — `src/shared/voice.ts:8`

*literal union type of `state` - a single declaring symbol*

| value | declared at |
|---|---|
| `listening` | `src/shared/voice.ts:8` |
| `fallback` | `src/shared/voice.ts:8` |
| `error` | `src/shared/voice.ts:8` |
| `off` | `src/shared/voice.ts:8` |

### `src/shared/voice.VoiceControl.action` — `src/shared/voice.ts:13-18`

*the `action` discriminator of union type `VoiceControl` - each value declared by a literal type in one variant*

| value | declared at |
|---|---|
| `start` | `src/shared/voice.ts:14` |
| `stop` | `src/shared/voice.ts:15` |
| `reset` | `src/shared/voice.ts:16` |
| `hints` | `src/shared/voice.ts:18` |

## Closed sets — derived (no declaring symbol)

Each set below was read out of the real authority — control flow, membership tests, dispatch tables — because nothing declares it. **Correct as of this commit and fragile after it.** Each carries the refactor that would make it declared.

### `src/core/input-shapes.def.type (switch)` — `src/core/input-shapes.ts:413`

*`switch` on `def.type` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `optional` | `src/core/input-shapes.ts:414` |
| `nullable` | `src/core/input-shapes.ts:415` |
| `default` | `src/core/input-shapes.ts:416` |
| `pipe` | `src/core/input-shapes.ts:417` |
| `string` | `src/core/input-shapes.ts:419` |
| `number` | `src/core/input-shapes.ts:421` |
| `boolean` | `src/core/input-shapes.ts:423` |
| `enum` | `src/core/input-shapes.ts:425` |
| `array` | `src/core/input-shapes.ts:427` |
| `object` | `src/core/input-shapes.ts:429` |

> **REFACTOR: `def.type` is a closed set enforced only by control flow at src/core/input-shapes.ts:413. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/core/press-log.KINDS` — `src/core/press-log.ts:34`

*module constant `KINDS` used in a `.has()` test - one place to change, but no z.enum or literal union, so nothing checks a value against it*

| value | read from |
|---|---|
| `step` | `src/core/press-log.ts:34` |
| `back` | `src/core/press-log.ts:34` |
| `jump` | `src/core/press-log.ts:34` |
| `start` | `src/core/press-log.ts:34` |
| `stop` | `src/core/press-log.ts:34` |
| `voice` | `src/core/press-log.ts:34` |

> **REFACTOR (minor): `KINDS` at src/core/press-log.ts:34 names the set but does not type it. A z.enum or `as const` + `typeof KINDS[number]` would make a wrong value a static error rather than a runtime miss.**

### `src/main/control-server.result.error.code (switch)` — `src/main/control-server.ts:385`

*`switch` on `result.error.code` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `not_found` | `src/main/control-server.ts:386` |
| `invalid_input` | `src/main/control-server.ts:388` |
| `domain_invalid` | `src/main/control-server.ts:389` |
| `permission_denied` | `src/main/control-server.ts:391` |
| `confirmation_required` | `src/main/control-server.ts:392` |
| `confirmation_invalid` | `src/main/control-server.ts:393` |
| `conflict` | `src/main/control-server.ts:395` |
| `app_busy` | `src/main/control-server.ts:396` |
| `rate_limited` | `src/main/control-server.ts:398` |
| `unavailable` | `src/main/control-server.ts:400` |

> **REFACTOR: `result.error.code` is a closed set enforced only by control flow at src/main/control-server.ts:385. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/main/voice/apple-bundle.status (switch)` — `src/main/voice/apple-bundle.ts:17`

*`switch` on `status` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `3` | `src/main/voice/apple-bundle.ts:18` |
| `1` | `src/main/voice/apple-bundle.ts:20` |
| `2` | `src/main/voice/apple-bundle.ts:22` |
| `0` | `src/main/voice/apple-bundle.ts:24` |

> **REFACTOR: `status` is a closed set enforced only by control flow at src/main/voice/apple-bundle.ts:17. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/renderer/src/App.zone (switch)` — `src/renderer/src/App.tsx:798`

*`switch` on `zone` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `major` | `src/renderer/src/App.tsx:799` |
| `minor` | `src/renderer/src/App.tsx:809` |
| `triggers` | `src/renderer/src/App.tsx:819` |
| `paragraph` | `src/renderer/src/App.tsx:823` |

> **REFACTOR: `zone` is a closed set enforced only by control flow at src/renderer/src/App.tsx:798. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

### `src/renderer/src/voice-live.event.state (branching)` — `src/renderer/src/voice-live.ts:167`

*if/else-if chain on `event.state` - its type is not a literal union, no enum, no z.enum*

| value | read from |
|---|---|
| `listening` | `src/renderer/src/voice-live.ts:167` |
| `fallback` | `src/renderer/src/voice-live.ts:168` |
| `error` | `src/renderer/src/voice-live.ts:170` |

> **REFACTOR: `event.state` is a closed set enforced only by control flow at src/renderer/src/voice-live.ts:167. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.**

> 1 comparison(s) against vocabularies this app does not own (DOM key names, HTTP headers, library internals) were **not** treated as closed sets and carry no refactor advice: `src/renderer/src/App.e.key (switch)` (the subject is a property declared by TypeScript's lib or a package).

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

### `src/core/handlers.HandlerContext` — interface — `src/core/handlers.ts:81-102`

| field | type | default | at | note |
|---|---|---|---|---|
| `lifecycle` | `?: LifecycleHooks → src/core/index.LifecycleHooks` | — | `src/core/handlers.ts:83` | The host process, for the lifecycle verbs. Absent headless. |
| `stage` | `StageRequests` | — | `src/core/handlers.ts:85` | The latest agent request for what is on stage (d04 preflight). |
| `activity` | `TalentActivity` | — | `src/core/handlers.ts:87` | When the talent last moved — what "busy" means. |
| `principalName` | `string` | — | `src/core/handlers.ts:89` | Who is calling, by name (`human:prompter`, `agent:claude`, `cli`). |
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/handlers.ts:90` |  |
| `active` | `ActiveContextHolder` | — | `src/core/handlers.ts:91` |  |
| `openContext` | `OpenContextHolder` | — | `src/core/handlers.ts:93` | The session's brand/project context (W6, door 2 + door 3). Never persisted. |
| `confirmations` | `ConfirmationLedger` | — | `src/core/handlers.ts:94` |  |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/handlers.ts:95` |  |
| `capability` | `CapabilityMeta → CapabilityMeta (@shared/capabilities)` | — | `src/core/handlers.ts:96` |  |
| `dryRun` | `boolean` | — | `src/core/handlers.ts:98` | True when the caller asked for a preview rather than an act. |
| `confirmationId` | `?: string` | — | `src/core/handlers.ts:99` |  |
| `recordPrior` | `(prior: unknown) => void` | — | `src/core/handlers.ts:101` | Hand the prior state to the audit log. Call it before you overwrite. |

### `src/core/handlers.Resolved` — interface — `src/core/handlers.ts:143-148`

| field | type | default | at |
|---|---|---|---|
| `document` | `RepositoryDocument → src/core/repository.RepositoryDocument` | — | `src/core/handlers.ts:144` |
| `set` | `ScriptSet → ScriptSet (@shared/domain)` | — | `src/core/handlers.ts:145` |
| `script` | `Script → Script (@shared/domain)` | — | `src/core/handlers.ts:146` |
| `transcript` | `Transcript → Transcript (@shared/domain)` | — | `src/core/handlers.ts:147` |

### `src/core/handlers.MaybeUnreadable` — type — `src/core/handlers.ts:342`

*extends* `ScriptSet`

*No annotated fields found — this shape declares its fields elsewhere.*

### `src/core/index.CoreOptions` — interface — `src/core/index.ts:50-62`

| field | type | default | at | note |
|---|---|---|---|---|
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/index.ts:51` |  |
| `clock` | `?: Clock → src/core/safety.Clock` | — | `src/core/index.ts:53` | Injectable so every time-dependent control is testable without sleeping. |
| `auditSink` | `?: (entry: AuditEntry) => void → src/core/safety.AuditEntry` | — | `src/core/index.ts:55` | Where audit entries go beyond the in-memory ring — a logger, usually. |
| `lifecycle` | `?: LifecycleHooks → src/core/index.LifecycleHooks` | — | `src/core/index.ts:61` | The process around the core, for `system_status` / `system_quit` / |

### `src/core/index.WindowShown` — interface — `src/core/index.ts:65-71`

Read back from the window after a raise — never what was asked for.

| field | type | default | at | note |
|---|---|---|---|---|
| `visible` | `boolean` | — | `src/core/index.ts:66` |  |
| `focused` | `boolean` | — | `src/core/index.ts:67` |  |
| `minimized` | `boolean` | — | `src/core/index.ts:68` |  |
| `created` | `boolean` | — | `src/core/index.ts:70` | No window existed, so one was created. |

### `src/core/index.LifecycleHooks` — interface — `src/core/index.ts:74-91`

What only the host process can do. The core decides WHETHER; the host does it.

| field | type | default | at | note |
|---|---|---|---|---|
| `app` | `string` | — | `src/core/index.ts:75` |  |
| `version` | `string` | — | `src/core/index.ts:76` |  |
| `pid` | `number` | — | `src/core/index.ts:77` |  |
| `startedAt` | `string` | — | `src/core/index.ts:78` |  |
| `show` | `(): Promise<WindowShown>` | — | `src/core/index.ts:84` | Bring the prompter in front — create, restore, show, raise, focus — and |
| `voiceSelftest` | `(): Promise<SelftestReport>` | — | `src/core/index.ts:86` | Run the voice self-test in the host process (real mic status). Absent → `unavailable`. |
| `quit` | `(): void` | — | `src/core/index.ts:88` | Called after the reply is sent. |
| `restart` | `(open: { brand: string; project: string } \| null): void` | — | `src/core/index.ts:90` | Called after the reply is sent, with the context to reopen on. |

### `src/core/index.InvokeOptions` — interface — `src/core/index.ts:93-103`

| field | type | default | at | note |
|---|---|---|---|---|
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/index.ts:94` |  |
| `as` | `?: string` | — | `src/core/index.ts:101` | Who is calling, by name (fli-core): `human:<surface>`, `agent:<name>` or |
| `idempotencyKey` | `?: string` | — | `src/core/index.ts:102` |  |

### `src/core/index.ChangeEvent` — interface — `src/core/index.ts:115-119`

Emitted after a command actually changes the DATA — not on a query, not on a

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/core/index.ts:116` |
| `principal` | `Principal → Principal (@shared/capabilities)` | — | `src/core/index.ts:117` |
| `at` | `number` | — | `src/core/index.ts:118` |

### `src/core/index.Core` — interface — `src/core/index.ts:121-131`

| field | type | default | at | note |
|---|---|---|---|---|
| `invoke` | `(name: string, input: unknown, options: InvokeOptions): Promise<InvokeResult>` | — | `src/core/index.ts:122` |  |
| `onChange` | `(listener: (event: ChangeEvent) => void): () => void` | — | `src/core/index.ts:124` | Subscribe to state changes. Returns an unsubscribe function. |
| `active` | `ActiveContextHolder` | — | `src/core/index.ts:126` | The renderer's own selection state, so the UI can drive it directly. |
| `openContext` | `OpenContextHolder` | — | `src/core/index.ts:128` | The session's brand/project context (W6) — set by door 2 or `context_select`, never persisted. |
| `audit` | `AuditLog` | — | `src/core/index.ts:129` |  |
| `repository` | `Repository → src/core/repository.Repository` | — | `src/core/index.ts:130` |  |

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

### `src/core/input-shapes.InputField` — interface — `src/core/input-shapes.ts:372-385`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/core/input-shapes.ts:373` |  |
| `type` | `string` | — | `src/core/input-shapes.ts:374` |  |
| `required` | `boolean` | — | `src/core/input-shapes.ts:375` |  |
| `default` | `?: unknown` | — | `src/core/input-shapes.ts:383` | Present when omitting the field APPLIES A VALUE rather than leaving it |
| `note` | `?: string` | — | `src/core/input-shapes.ts:384` |  |

### `src/core/input-shapes.Def` — interface — `src/core/input-shapes.ts:392-401`

The zod 4 def fields the walkers below read. `.transform()` is a `pipe` whose

| field | type | default | at |
|---|---|---|---|
| `type` | `string` | — | `src/core/input-shapes.ts:393` |
| `innerType` | `?: z.ZodType → ZodType (zod)` | — | `src/core/input-shapes.ts:394` |
| `in` | `?: z.ZodType → ZodType (zod)` | — | `src/core/input-shapes.ts:395` |
| `out` | `?: z.ZodType → ZodType (zod)` | — | `src/core/input-shapes.ts:396` |
| `element` | `?: z.ZodType → ZodType (zod)` | — | `src/core/input-shapes.ts:397` |
| `entries` | `?: Record<string, string \| number>` | — | `src/core/input-shapes.ts:398` |
| `shape` | `?: Record<string, z.ZodType> → ZodType (zod)` | — | `src/core/input-shapes.ts:399` |
| `defaultValue` | `?: unknown` | — | `src/core/input-shapes.ts:400` |

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

### `src/core/press-log.PressEvent` — interface — `src/core/press-log.ts:18-23`

*extends* `PressInput`

| field | type | default | at | note |
|---|---|---|---|---|
| `t` | `string` | — | `src/core/press-log.ts:20` | ISO wall clock with ms — lines a take up with its recording. |
| `mono` | `number` | — | `src/core/press-log.ts:22` | Monotonic ms since the logger was created. |

### `src/core/press-log.PressLogOptions` — interface — `src/core/press-log.ts:25-32`

| field | type | default | at | note |
|---|---|---|---|---|
| `dir` | `() => string \| null` | — | `src/core/press-log.ts:27` | Directory for press logs, or null when there is nowhere to write. Called per session start. |
| `onError` | `?: (error: unknown) => void` | — | `src/core/press-log.ts:28` |  |
| `now` | `?: () => Date` | — | `src/core/press-log.ts:29` |  |
| `clock` | `?: () => number` | — | `src/core/press-log.ts:31` | Monotonic ms clock. |

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

### `src/core/reanchor.Para` — interface — `src/core/reanchor.ts:11-14`

Where is the talent, after the words changed underneath them?

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/core/reanchor.ts:12` |
| `text` | `string` | — | `src/core/reanchor.ts:13` |

### `src/core/recognizer.RecognizerEvent` — interface — `src/core/recognizer.ts:11-15`

One interface for "audio in, words out", so Apple (on-device) and Groq (cloud) can be swapped

| field | type | default | at |
|---|---|---|---|
| `atMs` | `number` | — | `src/core/recognizer.ts:12` |
| `windowStartMs` | `number` | — | `src/core/recognizer.ts:13` |
| `text` | `string` | — | `src/core/recognizer.ts:14` |

### `src/core/recognizer.Recognizer` — interface — `src/core/recognizer.ts:17-21`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/core/recognizer.ts:18` |  |
| `run` | `(wavPath: string): Promise<RecognizerEvent[]>` | — | `src/core/recognizer.ts:20` | Real-time simulation over a mono 16 kHz WAV: events in arrival order. |

### `src/core/recognizer.LiveRecognizer` — interface — `src/core/recognizer.ts:28-36`

Live (streaming) shape used by the app. Audio is mono 16 kHz signed 16-bit PCM pushed as it is

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/core/recognizer.ts:29` |  |
| `start` | `(onEvent: (e: RecognizerEvent) => void, onFail: (reason: string) => void): void` | — | `src/core/recognizer.ts:30` |  |
| `push` | `(pcm: Uint8Array): void` | — | `src/core/recognizer.ts:31` |  |
| `reset` | `(): void` | — | `src/core/recognizer.ts:32` |  |
| `stop` | `(): void` | — | `src/core/recognizer.ts:33` |  |
| `hint` | `(words: string[]): void` | — | `src/core/recognizer.ts:35` | Optional vocabulary hint (nearest upcoming script words). Engines without one ignore it. |

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

### `src/core/stage.StagePosition` — interface — `src/core/stage.ts:29-36`

| field | type | default | at | note |
|---|---|---|---|---|
| `setId` | `string \| null` | — | `src/core/stage.ts:30` |  |
| `scriptId` | `string \| null` | — | `src/core/stage.ts:31` |  |
| `transcriptId` | `?: string \| null` | — | `src/core/stage.ts:33` | The transcript on stage: for a published story, its variant id. |
| `paragraphId` | `?: string \| null` | — | `src/core/stage.ts:35` | The beat, by paragraph id — stepping inside one script changes only this. |

### `src/core/stage.StageRequest` — interface — `src/core/stage.ts:38-48`

| field | type | default | at | note |
|---|---|---|---|---|
| `seq` | `number` | — | `src/core/stage.ts:40` | Increases per request, so the window applies each one exactly once. |
| `setId` | `string` | — | `src/core/stage.ts:41` |  |
| `scriptId` | `string \| null` | — | `src/core/stage.ts:42` |  |
| `variantId` | `string \| null` | — | `src/core/stage.ts:44` | The variant asked for, or null for whichever the script shows. |
| `requestedBy` | `string` | — | `src/core/stage.ts:46` | The principal name that asked (`agent:claude`, `cli`). |
| `at` | `string` | — | `src/core/stage.ts:47` |  |

### `src/core/text-script.TextScriptInput` — interface — `src/core/text-script.ts:28-48`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `?: string` | — | `src/core/text-script.ts:30` | Script id; defaults to the slug of `name`. |
| `name` | `string` | — | `src/core/text-script.ts:31` |  |
| `text` | `string` | — | `src/core/text-script.ts:32` |  |
| `video` | `?: string \| null` | — | `src/core/text-script.ts:33` |  |
| `takeaway` | `?: string` | — | `src/core/text-script.ts:34` |  |
| `source` | `?: string` | — | `src/core/text-script.ts:35` |  |
| `triggers` | `?: { style: TriggerStyle; items: { text: string; paragraph: number }[]; } → TriggerStyle (@shared/domain)` | — | `src/core/text-script.ts:36` |  |
| `chapters` | `?: { name: string; paragraph: number }[]` | — | `src/core/text-script.ts:45` | Optional column-1 headings: each chapter starts at a 1-based paragraph and |
| `variant` | `?: { id: string; label: string; version: number }` | — | `src/core/text-script.ts:47` | A published story variant: the transcript carries its id, label and version. |

### `src/core/text-script.TextScriptInput.triggers` — type — `src/core/text-script.ts:36-39`

| field | type | default | at |
|---|---|---|---|
| `style` | `TriggerStyle → TriggerStyle (@shared/domain)` | — | `src/core/text-script.ts:37` |
| `items` | `{ text: string; paragraph: number }[]` | — | `src/core/text-script.ts:38` |

### `src/core/text-script.TextScriptInput.variant` — type — `src/core/text-script.ts:47`

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/core/text-script.ts:47` |
| `label` | `string` | — | `src/core/text-script.ts:47` |
| `version` | `number` | — | `src/core/text-script.ts:47` |

### `src/core/text-script.VariantMerge` — type-union on `kind` — `src/core/text-script.ts:216-219`

| variant | shape | default | at |
|---|---|---|---|
| `write` | `{ kind: 'write'; script: Script; previousVersion: number \| null; created: boolean }` | — | `src/core/text-script.ts:217` |
| `unchanged` | `{ kind: 'unchanged'; version: number }` | — | `src/core/text-script.ts:218` |
| `stale` | `{ kind: 'stale'; held: number; sent: number }` | — | `src/core/text-script.ts:219` |

### `src/core/text-script.VariantMerge[kind=write]` — type — `src/core/text-script.ts:217`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'write'` | — | `src/core/text-script.ts:217` |
| `script` | `Script → Script (@shared/domain)` | — | `src/core/text-script.ts:217` |
| `previousVersion` | `number \| null` | — | `src/core/text-script.ts:217` |
| `created` | `boolean` | — | `src/core/text-script.ts:217` |

### `src/core/text-script.VariantMerge[kind=unchanged]` — type — `src/core/text-script.ts:218`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'unchanged'` | — | `src/core/text-script.ts:218` |
| `version` | `number` | — | `src/core/text-script.ts:218` |

### `src/core/text-script.VariantMerge[kind=stale]` — type — `src/core/text-script.ts:219`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'stale'` | — | `src/core/text-script.ts:219` |
| `held` | `number` | — | `src/core/text-script.ts:219` |
| `sent` | `number` | — | `src/core/text-script.ts:219` |

### `src/core/voice-driver.DriverParagraph` — interface — `src/core/voice-driver.ts:15-18`

| field | type | default | at |
|---|---|---|---|
| `id` | `string` | — | `src/core/voice-driver.ts:16` |
| `text` | `string` | — | `src/core/voice-driver.ts:17` |

### `src/core/voice-driver.VoiceCursor` — interface — `src/core/voice-driver.ts:21-25`

Where the talent is: the paragraph and the index of its next unsaid spoken word.

| field | type | default | at | note |
|---|---|---|---|---|
| `paragraphId` | `string` | — | `src/core/voice-driver.ts:22` |  |
| `wordInParagraph` | `number` | — | `src/core/voice-driver.ts:24` | 0 = nothing said yet; === the paragraph's word count = all of it said. |

### `src/core/voice-driver.DriverResult` — interface — `src/core/voice-driver.ts:27-34`

| field | type | default | at | note |
|---|---|---|---|---|
| `paragraphId` | `string \| null` | — | `src/core/voice-driver.ts:29` | Paragraph the talent has reached, or null before anything is confirmed. |
| `advanced` | `boolean` | — | `src/core/voice-driver.ts:31` | True only when `paragraphId` is later than where the driver last stood. |
| `reason` | `FollowReason → src/core/voice-follow.FollowReason` | — | `src/core/voice-driver.ts:32` |  |
| `cursor` | `VoiceCursor \| null → src/core/voice-driver.VoiceCursor` | — | `src/core/voice-driver.ts:33` |  |

### `src/core/voice-driver.VoiceDriver` — interface — `src/core/voice-driver.ts:36-47`

| field | type | default | at | note |
|---|---|---|---|---|
| `hear` | `(text: string): DriverResult` | — | `src/core/voice-driver.ts:37` |  |
| `anchor` | `(paragraphId: string): void` | — | `src/core/voice-driver.ts:39` | Put the talent at the START of this paragraph; drops pending evidence. |
| `paragraphId` | `string \| null` | — | `src/core/voice-driver.ts:40` |  |
| `cursor` | `VoiceCursor \| null → src/core/voice-driver.VoiceCursor` | — | `src/core/voice-driver.ts:41` |  |
| `hints` | `(max?: number, minLetters?: number): string[]` | — | `src/core/voice-driver.ts:46` | Recogniser vocabulary hint: the NEAREST upcoming distinct words of `minLetters`+ letters from |

### `src/core/voice-follow-replay.TimedWord` — interface — `src/core/voice-follow-replay.ts:16-19`

| field | type | default | at |
|---|---|---|---|
| `word` | `string` | — | `src/core/voice-follow-replay.ts:17` |
| `start` | `number` | — | `src/core/voice-follow-replay.ts:18` |

### `src/core/voice-follow-replay.ParagraphResult` — interface — `src/core/voice-follow-replay.ts:21-27`

| field | type | default | at | note |
|---|---|---|---|---|
| `index` | `number` | — | `src/core/voice-follow-replay.ts:22` |  |
| `speechStart` | `number \| null` | — | `src/core/voice-follow-replay.ts:23` |  |
| `stepAt` | `number \| null` | — | `src/core/voice-follow-replay.ts:24` |  |
| `offset` | `number \| null` | — | `src/core/voice-follow-replay.ts:26` | stepAt − speechStart, seconds. null when either side is missing. |

### `src/core/voice-follow-replay.ReplaySummary` — interface — `src/core/voice-follow-replay.ts:29-42`

| field | type | default | at | note |
|---|---|---|---|---|
| `paragraphs` | `number` | — | `src/core/voice-follow-replay.ts:30` |  |
| `steps` | `number` | — | `src/core/voice-follow-replay.ts:31` |  |
| `located` | `number` | — | `src/core/voice-follow-replay.ts:32` |  |
| `within1s` | `number` | — | `src/core/voice-follow-replay.ts:33` |  |
| `within2s` | `number` | — | `src/core/voice-follow-replay.ts:34` |  |
| `medianOffset` | `number \| null` | — | `src/core/voice-follow-replay.ts:35` |  |
| `worstOffset` | `number \| null` | — | `src/core/voice-follow-replay.ts:36` |  |
| `early` | `number` | — | `src/core/voice-follow-replay.ts:38` | Stepped before the paragraph was spoken (offset < −1 s), or stepped where no speech start was found. |
| `misses` | `number` | — | `src/core/voice-follow-replay.ts:40` | Speech start located but the aligner never stepped. |
| `matchRate` | `number \| null` | — | `src/core/voice-follow-replay.ts:41` |  |

### `src/core/voice-follow-replay.PressLogOptions` — interface — `src/core/voice-follow-replay.ts:133-140`

| field | type | default | at | note |
|---|---|---|---|---|
| `paragraphIds` | `?: string[]` | — | `src/core/voice-follow-replay.ts:135` | Paragraph ids in script order. Absent: ids are numbered by order of first appearance in the log. |
| `takeStart` | `?: string` | — | `src/core/voice-follow-replay.ts:137` | Wall-clock ISO of the recording's t=0. Absent: the log's first `start` event is t=0. |
| `shift` | `?: number` | — | `src/core/voice-follow-replay.ts:139` | Seconds added to every press time, to nudge a known sync error. |

### `src/core/voice-follow.FollowOptions` — interface — `src/core/voice-follow.ts:12-31`

Voice-follow aligner: from the script and the talent's live (cumulative) recognised speech,

| field | type | default | at | note |
|---|---|---|---|---|
| `window` | `number` | — | `src/core/voice-follow.ts:14` | Script words looked at ahead of the cursor. |
| `maxScriptSkip` | `number` | — | `src/core/voice-follow.ts:16` | Script words that may be skipped between two consecutive matches (talent dropped a word). |
| `maxHeardSkip` | `number` | — | `src/core/voice-follow.ts:18` | Heard words that may be skipped between two consecutive matches (stray insert / noise). |
| `runNeeded` | `number` | — | `src/core/voice-follow.ts:20` | Guard: matched pairs required ... |
| `runOf` | `number` | — | `src/core/voice-follow.ts:22` | ... within the last this-many heard words of the chain. |
| `longRun` | `number` | — | `src/core/voice-follow.ts:24` | A chain this long commits without waiting for a second agreeing partial. |
| `farRun` | `number` | — | `src/core/voice-follow.ts:26` | Far jump (beyond the window): consecutive, unskipped matched pairs required. |
| `lookback` | `number` | — | `src/core/voice-follow.ts:28` | Script words before the cursor still used as matching context (never as progress). |
| `heardCap` | `number` | — | `src/core/voice-follow.ts:30` | Only the last this-many heard words are considered (cost cap). |

### `src/core/voice-follow.FollowResult` — interface — `src/core/voice-follow.ts:52-57`

| field | type | default | at |
|---|---|---|---|
| `cursorChar` | `number` | — | `src/core/voice-follow.ts:53` |
| `cursorWord` | `number` | — | `src/core/voice-follow.ts:54` |
| `advanced` | `boolean` | — | `src/core/voice-follow.ts:55` |
| `reason` | `FollowReason → src/core/voice-follow.FollowReason` | — | `src/core/voice-follow.ts:56` |

### `src/core/voice-follow.FollowState` — interface — `src/core/voice-follow.ts:59-65`

| field | type | default | at | note |
|---|---|---|---|---|
| `cursorChar` | `number` | — | `src/core/voice-follow.ts:60` |  |
| `cursorWord` | `number` | — | `src/core/voice-follow.ts:61` |  |
| `wordCount` | `number` | — | `src/core/voice-follow.ts:62` |  |
| `cursorParagraph` | `number` | — | `src/core/voice-follow.ts:64` | Paragraph (blank-line separated) of the next unread word; last paragraph at the end. |

### `src/core/voice-follow.Follower` — interface — `src/core/voice-follow.ts:67-71`

| field | type | default | at |
|---|---|---|---|
| `hear` | `(cumulativeText: string): FollowResult` | — | `src/core/voice-follow.ts:68` |
| `anchor` | `(offset: number): FollowState` | — | `src/core/voice-follow.ts:69` |
| `state` | `(): FollowState` | — | `src/core/voice-follow.ts:70` |

### `src/core/voice-follow.ScriptWord` — interface — `src/core/voice-follow.ts:73-79`

| field | type | default | at | note |
|---|---|---|---|---|
| `word` | `string` | — | `src/core/voice-follow.ts:75` | Lower-cased letters and digits only. |
| `start` | `number` | — | `src/core/voice-follow.ts:76` |  |
| `end` | `number` | — | `src/core/voice-follow.ts:77` |  |
| `paragraph` | `number` | — | `src/core/voice-follow.ts:78` |  |

### `src/core/voice-follow.Chain` — interface — `src/core/voice-follow.ts:186-194`

| field | type | default | at | note |
|---|---|---|---|---|
| `candidate` | `number` | — | `src/core/voice-follow.ts:188` | Script index one past the last matched pair. |
| `length` | `number` | — | `src/core/voice-follow.ts:189` |  |
| `tail` | `number` | — | `src/core/voice-follow.ts:190` |  |
| `firstHeard` | `number` | — | `src/core/voice-follow.ts:191` |  |
| `firstScript` | `number` | — | `src/core/voice-follow.ts:192` |  |
| `lastHeard` | `number` | — | `src/core/voice-follow.ts:193` |  |

### `src/core/voice-highlight.HighlightToken` — type-union on `kind` — `src/core/voice-highlight.ts:19-31`

| variant | shape | default | at |
|---|---|---|---|
| `word` | `{ kind: 'word' /** Index into `scriptWords(text)`. */ index: number /** Punctuation glued before / after the word: same state, never underl…` | — | `src/core/voice-highlight.ts:21` |
| `cue` | `{ kind: 'cue'; text: string }` | — | `src/core/voice-highlight.ts:30` |
| `gap` | `{ kind: 'gap'; text: string }` | — | `src/core/voice-highlight.ts:31` |

### `src/core/voice-highlight.HighlightToken[kind=word]` — type — `src/core/voice-highlight.ts:20-29`

| field | type | default | at | note |
|---|---|---|---|---|
| `kind` | `'word'` | — | `src/core/voice-highlight.ts:21` |  |
| `index` | `number` | — | `src/core/voice-highlight.ts:23` | Index into `scriptWords(text)`. |
| `lead` | `string` | — | `src/core/voice-highlight.ts:25` | Punctuation glued before / after the word: same state, never underlined. |
| `core` | `string` | — | `src/core/voice-highlight.ts:26` |  |
| `trail` | `string` | — | `src/core/voice-highlight.ts:27` |  |
| `state` | `WordState → src/core/voice-highlight.WordState` | — | `src/core/voice-highlight.ts:28` |  |

### `src/core/voice-highlight.HighlightToken[kind=cue]` — type — `src/core/voice-highlight.ts:30`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'cue'` | — | `src/core/voice-highlight.ts:30` |
| `text` | `string` | — | `src/core/voice-highlight.ts:30` |

### `src/core/voice-highlight.HighlightToken[kind=gap]` — type — `src/core/voice-highlight.ts:31`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'gap'` | — | `src/core/voice-highlight.ts:31` |
| `text` | `string` | — | `src/core/voice-highlight.ts:31` |

### `src/core/voice-selftest.SelftestCheck` — interface — `src/core/voice-selftest.ts:23-30`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `CheckName → src/core/voice-selftest.CheckName` | — | `src/core/voice-selftest.ts:24` |  |
| `pass` | `boolean \| null` | — | `src/core/voice-selftest.ts:26` | null = not applicable / could not be determined here (shown as SKIP, never as PASS). |
| `detail` | `string` | — | `src/core/voice-selftest.ts:27` |  |
| `fix` | `?: string` | — | `src/core/voice-selftest.ts:29` | Plain-English next step, present on every FAIL. |

### `src/core/voice-selftest.SelftestReport` — interface — `src/core/voice-selftest.ts:32-37`

| field | type | default | at | note |
|---|---|---|---|---|
| `ok` | `boolean` | — | `src/core/voice-selftest.ts:33` |  |
| `where` | `'app' \| 'standalone'` | — | `src/core/voice-selftest.ts:35` | Where the test ran: inside the app (real mic status) or standalone. |
| `checks` | `SelftestCheck[] → src/core/voice-selftest.SelftestCheck` | — | `src/core/voice-selftest.ts:36` |  |

### `src/core/voice-selftest.SelftestDeps` — interface — `src/core/voice-selftest.ts:39-56`

| field | type | default | at | note |
|---|---|---|---|---|
| `where` | `'app' \| 'standalone'` | — | `src/core/voice-selftest.ts:40` |  |
| `groqKey` | `() => string \| null` | — | `src/core/voice-selftest.ts:41` |  |
| `micStatus` | `() => string \| null` | — | `src/core/voice-selftest.ts:43` | The OS microphone status, or null when it cannot be read from here (app not running). |
| `sampleWav` | `Uint8Array` | — | `src/core/voice-selftest.ts:45` | The sample as a WAV file. |
| `groqTranscribe` | `(key: string, wav: Uint8Array) => Promise<{ status: number; text: string; body?: string }>` | — | `src/core/voice-selftest.ts:47` | One Groq transcription of a WAV; never logs the key. |
| `apple` | `{ path: string exists: () => boolean /** Run the helper on the sample: text heard, or an error code from the helper. */ probe: () => Promis…` | — | `src/core/voice-selftest.ts:48` |  |
| `now` | `?: () => number` | — | `src/core/voice-selftest.ts:54` |  |
| `sleep` | `?: (ms: number) => Promise<void>` | — | `src/core/voice-selftest.ts:55` |  |

### `src/core/voice-selftest.SelftestDeps.apple` — type — `src/core/voice-selftest.ts:48-53`

| field | type | default | at | note |
|---|---|---|---|---|
| `path` | `string` | — | `src/core/voice-selftest.ts:49` |  |
| `exists` | `() => boolean` | — | `src/core/voice-selftest.ts:50` |  |
| `probe` | `() => Promise<{ text?: string; error?: string }>` | — | `src/core/voice-selftest.ts:52` | Run the helper on the sample: text heard, or an error code from the helper. |

### `src/main/control-server.ControlServerOptions` — interface — `src/main/control-server.ts:60-67`

| field | type | default | at | note |
|---|---|---|---|---|
| `core` | `Core → src/core/index.Core` | — | `src/main/control-server.ts:61` |  |
| `userDataPath` | `string` | — | `src/main/control-server.ts:63` | Where the discovery file goes — `app.getPath('userData')` in production. |
| `port` | `?: number` | — | `src/main/control-server.ts:64` |  |
| `appVersion` | `string` | — | `src/main/control-server.ts:65` |  |
| `log` | `?: (message: string, detail?: unknown) => void` | — | `src/main/control-server.ts:66` |  |

### `src/main/control-server.ControlServerHandle` — interface — `src/main/control-server.ts:69-76`

| field | type | default | at | note |
|---|---|---|---|---|
| `port` | `number` | — | `src/main/control-server.ts:70` |  |
| `address` | `string` | — | `src/main/control-server.ts:72` | The interface actually bound. Always 127.0.0.1; asserted by a test. |
| `token` | `string` | — | `src/main/control-server.ts:73` |  |
| `discoveryPath` | `string` | — | `src/main/control-server.ts:74` |  |
| `close` | `(): Promise<void>` | — | `src/main/control-server.ts:75` |  |

### `src/main/create-console.ConsoleContext` — interface — `src/main/create-console.ts:9-14`

| field | type | default | at |
|---|---|---|---|
| `logger` | `Logger → Logger (@appydave/core)` | — | `src/main/create-console.ts:10` |
| `windows` | `WindowManager` | — | `src/main/create-console.ts:11` |
| `ipc` | `IpcRouter` | — | `src/main/create-console.ts:12` |
| `processes` | `ProcessSupervisor` | — | `src/main/create-console.ts:13` |

### `src/main/create-console.Console` — interface — `src/main/create-console.ts:16-19`

*extends* `ConsoleContext`

| field | type | default | at |
|---|---|---|---|
| `lifecycle` | `Lifecycle → Lifecycle (@appydave/core)` | — | `src/main/create-console.ts:17` |
| `start` | `(): Promise<void>` | — | `src/main/create-console.ts:18` |

### `src/main/create-console.CreateConsoleOptions` — interface — `src/main/create-console.ts:21-28`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/main/create-console.ts:23` | App name — used as the logger binding. |
| `registerIpc` | `?: (ctx: ConsoleContext) => void → src/main/create-console.ConsoleContext` | — | `src/main/create-console.ts:25` | Register IPC handlers before the first window opens. |
| `onReady` | `(ctx: ConsoleContext) => void → src/main/create-console.ConsoleContext` | — | `src/main/create-console.ts:27` | Called once the app is ready — open your window(s) here. |

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

### `src/main/show-window.ShowableWindow` — interface — `src/main/show-window.ts:4-14`

The slice of a BrowserWindow a raise touches — a fake in tests, so no window ever pops.

| field | type | default | at |
|---|---|---|---|
| `isDestroyed` | `(): boolean` | — | `src/main/show-window.ts:5` |
| `isMinimized` | `(): boolean` | — | `src/main/show-window.ts:6` |
| `isVisible` | `(): boolean` | — | `src/main/show-window.ts:7` |
| `isFocused` | `(): boolean` | — | `src/main/show-window.ts:8` |
| `restore` | `(): void` | — | `src/main/show-window.ts:9` |
| `show` | `(): void` | — | `src/main/show-window.ts:10` |
| `moveTop` | `(): void` | — | `src/main/show-window.ts:11` |
| `focus` | `(): void` | — | `src/main/show-window.ts:12` |
| `once` | `(event: 'ready-to-show', listener: () => void): void` | — | `src/main/show-window.ts:13` |

### `src/main/show-window.ShowDeps` — interface — `src/main/show-window.ts:16-27`

| field | type | default | at | note |
|---|---|---|---|---|
| `windows` | `(): W[]` | — | `src/main/show-window.ts:18` | The prompter windows that exist now. |
| `open` | `(): W` | — | `src/main/show-window.ts:20` | Build the prompter (it is created hidden and shows on ready-to-show). |
| `activateApp` | `(): void` | — | `src/main/show-window.ts:22` | `app.show()` on macOS (un-hides the app) + `app.focus({ steal: true })`. |
| `settleMs` | `?: number` | — | `src/main/show-window.ts:24` | Focus is applied by the window server asynchronously; wait this long before reading it back. |
| `readyTimeoutMs` | `?: number` | — | `src/main/show-window.ts:26` | A fresh window that never paints still gets an honest answer after this. |

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

### `src/main/voice/apple-bundle.HelperLine` — type-union on `kind` — `src/main/voice/apple-bundle.ts:31-40`

| variant | shape | default | at |
|---|---|---|---|
| `partial` | `{ kind: 'partial'; text: string; atMs: number; task: number }` | — | `src/main/voice/apple-bundle.ts:33` |
| `task` | `{ kind: 'task'; task: number; startMs: number; hints: number; reason: string }` | — | `src/main/voice/apple-bundle.ts:35` |
| `retry` | `{ kind: 'retry'; message: string; task: number; attempt: number; delayMs: number; expected: boolean }` | — | `src/main/voice/apple-bundle.ts:37` |
| `error` | `{ kind: 'error'; message: string }` | — | `src/main/voice/apple-bundle.ts:39` |
| `info` | `{ kind: 'info' }` | — | `src/main/voice/apple-bundle.ts:40` |

### `src/main/voice/apple-bundle.HelperLine[kind=partial]` — type — `src/main/voice/apple-bundle.ts:33`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'partial'` | — | `src/main/voice/apple-bundle.ts:33` |
| `text` | `string` | — | `src/main/voice/apple-bundle.ts:33` |
| `atMs` | `number` | — | `src/main/voice/apple-bundle.ts:33` |
| `task` | `number` | — | `src/main/voice/apple-bundle.ts:33` |

### `src/main/voice/apple-bundle.HelperLine[kind=task]` — type — `src/main/voice/apple-bundle.ts:35`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'task'` | — | `src/main/voice/apple-bundle.ts:35` |
| `task` | `number` | — | `src/main/voice/apple-bundle.ts:35` |
| `startMs` | `number` | — | `src/main/voice/apple-bundle.ts:35` |
| `hints` | `number` | — | `src/main/voice/apple-bundle.ts:35` |
| `reason` | `string` | — | `src/main/voice/apple-bundle.ts:35` |

### `src/main/voice/apple-bundle.HelperLine[kind=retry]` — type — `src/main/voice/apple-bundle.ts:37`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'retry'` | — | `src/main/voice/apple-bundle.ts:37` |
| `message` | `string` | — | `src/main/voice/apple-bundle.ts:37` |
| `task` | `number` | — | `src/main/voice/apple-bundle.ts:37` |
| `attempt` | `number` | — | `src/main/voice/apple-bundle.ts:37` |
| `delayMs` | `number` | — | `src/main/voice/apple-bundle.ts:37` |
| `expected` | `boolean` | — | `src/main/voice/apple-bundle.ts:37` |

### `src/main/voice/apple-bundle.HelperLine[kind=error]` — type — `src/main/voice/apple-bundle.ts:39`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'error'` | — | `src/main/voice/apple-bundle.ts:39` |
| `message` | `string` | — | `src/main/voice/apple-bundle.ts:39` |

### `src/main/voice/apple-bundle.HelperLine[kind=info]` — type — `src/main/voice/apple-bundle.ts:40`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'info'` | — | `src/main/voice/apple-bundle.ts:40` |

### `src/main/voice/apple-bundle.AppleHelper` — interface — `src/main/voice/apple-bundle.ts:100-109`

| field | type | default | at | note |
|---|---|---|---|---|
| `setHints` | `(words: string[]): void` | — | `src/main/voice/apple-bundle.ts:102` | Replace the vocabulary hint (JSON array of words); read by the helper at its next task start. |
| `write` | `(pcm: Uint8Array): void` | — | `src/main/voice/apple-bundle.ts:104` | write raw mono 16k s16le PCM (live mode only) |
| `stop` | `(): void` | — | `src/main/voice/apple-bundle.ts:106` | end audio and let the app finish |
| `kill` | `(): void` | — | `src/main/voice/apple-bundle.ts:108` | tear down now (reset) |

### `src/main/voice/apple-partials.PartialVerdict` — type-union on `kind` — `src/main/voice/apple-partials.ts:21-23`

| variant | shape | default | at |
|---|---|---|---|
| `text` | `{ kind: 'text'; text: string; task: number; swapped: boolean }` | — | `src/main/voice/apple-partials.ts:22` |
| `drop` | `{ kind: 'drop'; reason: 'stale-task' \| 'after-reset'; task: number }` | — | `src/main/voice/apple-partials.ts:23` |

### `src/main/voice/apple-partials.PartialVerdict[kind=text]` — type — `src/main/voice/apple-partials.ts:22`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'text'` | — | `src/main/voice/apple-partials.ts:22` |
| `text` | `string` | — | `src/main/voice/apple-partials.ts:22` |
| `task` | `number` | — | `src/main/voice/apple-partials.ts:22` |
| `swapped` | `boolean` | — | `src/main/voice/apple-partials.ts:22` |

### `src/main/voice/apple-partials.PartialVerdict[kind=drop]` — type — `src/main/voice/apple-partials.ts:23`

| field | type | default | at |
|---|---|---|---|
| `kind` | `'drop'` | — | `src/main/voice/apple-partials.ts:23` |
| `reason` | `'stale-task' \| 'after-reset'` | — | `src/main/voice/apple-partials.ts:23` |
| `task` | `number` | — | `src/main/voice/apple-partials.ts:23` |

### `src/main/voice/apple-partials.PartialFilter` — interface — `src/main/voice/apple-partials.ts:25-31`

| field | type | default | at | note |
|---|---|---|---|---|
| `task` | `(task: number): boolean` | — | `src/main/voice/apple-partials.ts:27` | The helper says task `task` started (also implied by the first partial of a newer task). |
| `partial` | `(task: number, text: string, nowMs: number): PartialVerdict` | — | `src/main/voice/apple-partials.ts:28` |  |
| `reset` | `(nowMs: number): void` | — | `src/main/voice/apple-partials.ts:29` |  |
| `state` | `{ task: number; prefix: string; ignoreUntil: number }` | — | `src/main/voice/apple-partials.ts:30` |  |

### `src/main/voice/apple-partials.PartialFilter.state` — type — `src/main/voice/apple-partials.ts:30`

| field | type | default | at |
|---|---|---|---|
| `task` | `number` | — | `src/main/voice/apple-partials.ts:30` |
| `prefix` | `string` | — | `src/main/voice/apple-partials.ts:30` |
| `ignoreUntil` | `number` | — | `src/main/voice/apple-partials.ts:30` |

### `src/main/voice/groq-live.GroqLiveOptions` — interface — `src/main/voice/groq-live.ts:60-74`

| field | type | default | at | note |
|---|---|---|---|---|
| `key` | `string` | — | `src/main/voice/groq-live.ts:61` |  |
| `fetchImpl` | `?: typeof fetch` | — | `src/main/voice/groq-live.ts:62` |  |
| `tickMs` | `?: number` | — | `src/main/voice/groq-live.ts:63` |  |
| `maxFailures` | `?: number` | — | `src/main/voice/groq-live.ts:65` | Consecutive failures before the recogniser reports itself failed. |
| `max429` | `?: number` | — | `src/main/voice/groq-live.ts:67` | Consecutive 429s before the recogniser reports itself failed (so the session falls over). |
| `hourlyAudioSeconds` | `?: number` | — | `src/main/voice/groq-live.ts:69` | Audio-seconds per rolling hour (default 7,200 — the Developer plan cap). |
| `now` | `?: () => number` | — | `src/main/voice/groq-live.ts:71` | Clock for the budget (tests). |
| `log` | `?: VoiceLog → src/shared/voice.VoiceLog` | — | `src/main/voice/groq-live.ts:73` | One line per request: status, ms, audio sent, text length. NEVER the key. |

### `src/main/voice/voice-control.MicGate` — interface — `src/main/voice/voice-control.ts:4-7`

The OS microphone gate, injectable so the error paths are testable without Electron.

| field | type | default | at |
|---|---|---|---|
| `status` | `(): string` | — | `src/main/voice/voice-control.ts:5` |
| `ask` | `(): Promise<boolean>` | — | `src/main/voice/voice-control.ts:6` |

### `src/main/voice/voice-control.VoiceControlDeps` — interface — `src/main/voice/voice-control.ts:9-14`

| field | type | default | at | note |
|---|---|---|---|---|
| `session` | `{ start(): void; stop(): void; reset(): void; hints?(words: string[]): void }` | — | `src/main/voice/voice-control.ts:10` |  |
| `mic` | `MicGate \| null → src/main/voice/voice-control.MicGate` | — | `src/main/voice/voice-control.ts:12` | null off macOS: there is no TCC gate to ask. |
| `log` | `VoiceLog → src/shared/voice.VoiceLog` | — | `src/main/voice/voice-control.ts:13` |  |

### `src/main/voice/voice-control.VoiceControlDeps.session` — type — `src/main/voice/voice-control.ts:10`

| field | type | default | at |
|---|---|---|---|
| `start` | `(): void` | — | `src/main/voice/voice-control.ts:10` |
| `stop` | `(): void` | — | `src/main/voice/voice-control.ts:10` |
| `reset` | `(): void` | — | `src/main/voice/voice-control.ts:10` |
| `hints` | `(words: string[]): void` | — | `src/main/voice/voice-control.ts:10` |

### `src/main/voice/voice-control.VoiceControlResult` — type — `src/main/voice/voice-control.ts:16`

| field | type | default | at |
|---|---|---|---|
| `ok` | `boolean` | — | `src/main/voice/voice-control.ts:16` |
| `error` | `?: string` | — | `src/main/voice/voice-control.ts:16` |

### `src/main/voice/voice-session.VoiceSessionOptions` — interface — `src/main/voice/voice-session.ts:4-10`

| field | type | default | at | note |
|---|---|---|---|---|
| `engines` | `Array<() => LiveRecognizer \| null> → src/core/recognizer.LiveRecognizer` | — | `src/main/voice/voice-session.ts:6` | Engines in preference order; the first that starts is primary, the rest are fallbacks. |
| `emit` | `(e: VoiceEvent) => void → src/shared/voice.VoiceEvent` | — | `src/main/voice/voice-session.ts:7` |  |
| `log` | `?: VoiceLog → src/shared/voice.VoiceLog` | — | `src/main/voice/voice-session.ts:9` | One line per decision (engine chosen / skipped / failed / none left). Never sees a key. |

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

### `src/renderer/src/components/Zones.ParagraphVoice` — interface — `src/renderer/src/components/Zones.tsx:272-276`

Voice-follow's view of the paragraph on screen. `null` = voice off: the zone renders exactly

| field | type | default | at | note |
|---|---|---|---|---|
| `word` | `number \| null` | — | `src/renderer/src/components/Zones.tsx:273` |  |
| `anchorSeq` | `number` | — | `src/renderer/src/components/Zones.tsx:275` | Bumps on a manual re-anchor: the in-beat scroll may then go back. |

### `src/renderer/src/store.CueCard` — interface — `src/renderer/src/store.ts:99-104`

| field | type | default | at | note |
|---|---|---|---|---|
| `label` | `string` | — | `src/renderer/src/store.ts:100` |  |
| `title` | `string` | — | `src/renderer/src/store.ts:101` |  |
| `token` | `number` | — | `src/renderer/src/store.ts:103` | Changes on every cue so the component can restart its dismiss timer. |

### `src/renderer/src/store.PrompterState` — interface — `src/renderer/src/store.ts:106-270`

| field | type | default | at | note |
|---|---|---|---|---|
| `set` | `ScriptSet \| null → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:108` | Null until the control API answers. The UI shows a waiting state, not an error. |
| `scriptId` | `string \| null` | — | `src/renderer/src/store.ts:109` |  |
| `transcriptId` | `string \| null` | — | `src/renderer/src/store.ts:110` |  |
| `style` | `TriggerStyle \| null → TriggerStyle (@shared/domain)` | — | `src/renderer/src/store.ts:111` |  |
| `step` | `number` | — | `src/renderer/src/store.ts:114` | Index into the ACTIVE trigger set. THE position — everything derives from it. |
| `visible` | `RecordingZone[] → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:116` |  |
| `driven` | `RecordingZone → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:117` |  |
| `weights` | `Record<RecordingZone, number> → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:123` | Flex weight per zone, adjusted by dragging a divider. Relative, not pixels, |
| `camera` | `CameraSide → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:124` |  |
| `transcriptOpen` | `boolean` | — | `src/renderer/src/store.ts:126` | The full-transcript skim surface. Overlays; never displaces (see below). |
| `transcriptEdge` | `CameraSide → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:127` |  |
| `setupOpen` | `boolean` | — | `src/renderer/src/store.ts:144` | The setup panel — everything that BUILDS an arrangement, in one slide-out. |
| `mirror` | `boolean` | — | `src/renderer/src/store.ts:146` |  |
| `focus` | `boolean` | — | `src/renderer/src/store.ts:147` |  |
| `text` | `TextPreset → TextPreset (@shared/rig)` | — | `src/renderer/src/store.ts:148` |  |
| `rigs` | `Rig[] → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:158` | Named arrangements, and the one currently applied. |
| `rigId` | `string \| null` | — | `src/renderer/src/store.ts:159` |  |
| `rigsLoaded` | `boolean` | — | `src/renderer/src/store.ts:168` | Whether the stored workspace has actually been read. |
| `restoredLayout` | `boolean` | — | `src/renderer/src/store.ts:175` | Whether a stored arrangement was actually applied — as opposed to the app |
| `pendingPosition` | `WorkspacePosition \| null → WorkspacePosition (@shared/rig)` | — | `src/renderer/src/store.ts:183` | The saved position, held between `loadRigs` (which recalls it) and `load` |
| `freshTranscripts` | `Record<string, string[]>` | — | `src/renderer/src/store.ts:194` | Transcripts that arrived or changed since the talent last looked at them — |
| `cue` | `CueCard \| null → src/renderer/src/store.CueCard` | — | `src/renderer/src/store.ts:196` |  |
| `nudge` | `number` | — | `src/renderer/src/store.ts:198` | Increments each time a step was refused at the boundary, to replay the nudge. |
| `load` | `(set: ScriptSet) => void → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:200` |  |
| `refresh` | `(set: ScriptSet) => void → ScriptSet (@shared/domain)` | — | `src/renderer/src/store.ts:201` |  |
| `stepNext` | `() => void` | — | `src/renderer/src/store.ts:202` |  |
| `stepPrev` | `() => void` | — | `src/renderer/src/store.ts:203` |  |
| `voiceAdvance` | `(paragraphId: string) => boolean` | — | `src/renderer/src/store.ts:205` | Voice-follow: move forward to a paragraph. Returns whether the prompter moved. |
| `selectScript` | `(scriptId: string) => void` | — | `src/renderer/src/store.ts:206` |  |
| `goToNextScript` | `() => void` | — | `src/renderer/src/store.ts:207` |  |
| `goToPrevScript` | `() => void` | — | `src/renderer/src/store.ts:208` |  |
| `selectTranscript` | `(transcriptId: string) => void` | — | `src/renderer/src/store.ts:209` |  |
| `selectStyle` | `(style: TriggerStyle) => void → TriggerStyle (@shared/domain)` | — | `src/renderer/src/store.ts:210` |  |
| `toggleZone` | `(zone: RecordingZone) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:211` |  |
| `setDriven` | `(zone: RecordingZone) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:212` |  |
| `setCamera` | `(side: CameraSide) => void → CameraSide (@shared/rig)` | — | `src/renderer/src/store.ts:213` |  |
| `resizeZones` | `(left: RecordingZone, right: RecordingZone, deltaPx: number) => void → RecordingZone (@shared/rig)` | — | `src/renderer/src/store.ts:214` |  |
| `toggleTranscript` | `() => void` | — | `src/renderer/src/store.ts:215` |  |
| `toggleSetup` | `() => void` | — | `src/renderer/src/store.ts:216` |  |
| `closeSetup` | `() => void` | — | `src/renderer/src/store.ts:217` |  |
| `toggleMirror` | `() => void` | — | `src/renderer/src/store.ts:218` |  |
| `toggleFocus` | `() => void` | — | `src/renderer/src/store.ts:219` |  |
| `setText` | `(preset: TextPreset) => void → TextPreset (@shared/rig)` | — | `src/renderer/src/store.ts:220` |  |
| `loadRigs` | `(rigs: Rig[], workspace: Workspace) => void → Rig (@shared/rig), Workspace (@shared/rig)` | — | `src/renderer/src/store.ts:221` |  |
| `setRigs` | `(rigs: Rig[]) => void → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:222` |  |
| `sets` | `SetSummary[] → src/renderer/src/store.SetSummary` | — | `src/renderer/src/store.ts:229` | Every set (project) in the store, as summaries — for the setup panel's |
| `setSets` | `(sets: SetSummary[]) => void → src/renderer/src/store.SetSummary` | — | `src/renderer/src/store.ts:230` |  |
| `openProject` | `string \| null` | — | `src/renderer/src/store.ts:232` | The session's open project (W6 `context_get`), or null. Never persisted, like the context itself. |
| `setOpenProject` | `(project: string \| null) => void` | — | `src/renderer/src/store.ts:234` | Records the open project. |
| `stageHold` | `StageHold \| null → src/renderer/src/store.StageHold` | — | `src/renderer/src/store.ts:236` | Non-null while a change event is holding the on-stage data (W6 S1/S2). |
| `setStageHold` | `(hold: StageHold \| null) => void → src/renderer/src/store.StageHold` | — | `src/renderer/src/store.ts:237` |  |
| `unreadableFile` | `UnreadableFile \| null → src/renderer/src/store.UnreadableFile` | — | `src/renderer/src/store.ts:239` | The open project's fli.tubby.json when it cannot be read, else null. |
| `setUnreadableFile` | `(file: UnreadableFile \| null) => void → src/renderer/src/store.UnreadableFile` | — | `src/renderer/src/store.ts:240` |  |
| `requestedSetId` | `string \| null` | — | `src/renderer/src/store.ts:241` |  |
| `requestSet` | `(setId: string) => void` | — | `src/renderer/src/store.ts:242` |  |
| `clearRequestedSet` | `() => void` | — | `src/renderer/src/store.ts:243` |  |
| `requestedScriptId` | `string \| null` | — | `src/renderer/src/store.ts:249` | The script to land on once `requestedSetId` has loaded — set only by an |
| `applyStageRequest` | `(setId: string, scriptId: string \| null, variantId?: string \| null) => void` | — | `src/renderer/src/store.ts:255` | Apply an agent's stage request. Same set → just the script; another set |
| `requestedVariant` | `{ scriptId: string; variantId: string; step: number } \| null` | — | `src/renderer/src/store.ts:261` | A variant an agent asked for that has not arrived in this window yet. It |
| `variantPlaces` | `Record<string, string>` | — | `src/renderer/src/store.ts:263` | The paragraph the talent left each variant on, this session only. |
| `contentSeq` | `number` | — | `src/renderer/src/store.ts:265` | Bumped when the words on stage change under the talent, so the lane re-seats the live row. |
| `applyRig` | `(rigId: string) => void` | — | `src/renderer/src/store.ts:266` |  |
| `adoptRig` | `(rig: Rig) => void → Rig (@shared/rig)` | — | `src/renderer/src/store.ts:267` |  |
| `forgetRig` | `(rigId: string) => void` | — | `src/renderer/src/store.ts:268` |  |
| `dismissCue` | `() => void` | — | `src/renderer/src/store.ts:269` |  |

### `src/renderer/src/store.SetSummary` — interface — `src/renderer/src/store.ts:277-295`

What `list_sets` answers with — a project row for the setup panel.

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `string` | — | `src/renderer/src/store.ts:278` |  |
| `title` | `string` | — | `src/renderer/src/store.ts:279` |  |
| `description` | `string` | — | `src/renderer/src/store.ts:280` |  |
| `project` | `string \| null` | — | `src/renderer/src/store.ts:282` | The FliHub folder name, verbatim, or null for an unattached set. |
| `scriptCount` | `number` | — | `src/renderer/src/store.ts:283` |  |
| `exportedTo` | `?: string \| null` | — | `src/renderer/src/store.ts:285` | Set on an exported app-store copy (W6): the folder whose fli.tubby.json holds the live copy. |
| `readOnly` | `?: boolean` | — | `src/renderer/src/store.ts:287` | An exported store copy seen without its project open — listed, never editable. |
| `livesIn` | `?: string \| null` | — | `src/renderer/src/store.ts:288` |  |
| `onDemand` | `?: boolean` | — | `src/renderer/src/store.ts:290` | A project's on-demand named scripts (`write_script`) — listed by name, newest first. |
| `source` | `?: 'project' \| 'store'` | — | `src/renderer/src/store.ts:292` | Where this row's data was read from: the open project's fli.tubby.json, or the app store. |
| `unreadable` | `?: boolean` | — | `src/renderer/src/store.ts:294` | The open project's fli.tubby.json cannot be read, and this set may live there — get_set refuses it. |

### `src/renderer/src/store.UnreadableFile` — interface — `src/renderer/src/store.ts:298-301`

`list_sets.filter.unreadable` — the project file that could not be read, named.

| field | type | default | at |
|---|---|---|---|
| `file` | `string` | — | `src/renderer/src/store.ts:299` |
| `message` | `string` | — | `src/renderer/src/store.ts:300` |

### `src/renderer/src/store.StageHold` — interface — `src/renderer/src/store.ts:354-357`

Why the set on stage is being HELD rather than refreshed — shown by the

| field | type | default | at |
|---|---|---|---|
| `reason` | `'project-closed' \| 'unreadable'` | — | `src/renderer/src/store.ts:355` |
| `message` | `string` | — | `src/renderer/src/store.ts:356` |

### `src/renderer/src/voice-live.VoiceStore` — interface — `src/renderer/src/voice-live.ts:15-29`

| field | type | default | at | note |
|---|---|---|---|---|
| `on` | `boolean` | — | `src/renderer/src/voice-live.ts:16` |  |
| `state` | `VoiceState → src/renderer/src/voice-live.VoiceState` | — | `src/renderer/src/voice-live.ts:17` |  |
| `engine` | `VoiceEngine \| null → VoiceEngine (@shared/voice)` | — | `src/renderer/src/voice-live.ts:18` |  |
| `note` | `string \| null` | — | `src/renderer/src/voice-live.ts:19` |  |
| `cursor` | `VoiceCursor \| null → src/core/voice-driver.VoiceCursor` | — | `src/renderer/src/voice-live.ts:24` | The aligner's word cursor (paragraph + index of the next unsaid spoken word), or null when |
| `anchorSeq` | `number` | — | `src/renderer/src/voice-live.ts:26` | Bumps on every re-anchor (a manual press): the in-beat scroll may then go back. |
| `toggle` | `(source?: 'key' \| 'chip') => void` | — | `src/renderer/src/voice-live.ts:28` | `source` is only for the log: which hand flipped it (the V key or the chip). |

### `src/shared/capabilities.CapabilityMeta` — interface — `src/shared/capabilities.ts:75-103`

| field | type | default | at | note |
|---|---|---|---|---|
| `name` | `string` | — | `src/shared/capabilities.ts:76` |  |
| `summary` | `string` | — | `src/shared/capabilities.ts:78` | One line, written for a caller that has never seen this app. |
| `kind` | `CapabilityKind → src/shared/capabilities.CapabilityKind` | — | `src/shared/capabilities.ts:79` |  |
| `sideEffects` | `SideEffect → src/shared/capabilities.SideEffect` | — | `src/shared/capabilities.ts:80` |  |
| `principals` | `readonly Principal[] → src/shared/capabilities.Principal` | — | `src/shared/capabilities.ts:82` | Which surfaces may invoke it. A verb absent from `agent` is UI-only. |
| `idempotent` | `boolean` | — | `src/shared/capabilities.ts:84` | Same input, same effect, however many times. |
| `confirmationRequired` | `boolean` | — | `src/shared/capabilities.ts:86` | Refuses to execute without an approved confirmation. |
| `supportsDryRun` | `boolean` | — | `src/shared/capabilities.ts:88` | Accepts `dryRun: true` and returns a preview instead of acting. |
| `announces` | `boolean` | — | `src/shared/capabilities.ts:99` | Whether a real change here wakes every other client. |
| `supportsIdempotencyKey` | `boolean` | — | `src/shared/capabilities.ts:101` | Honours `idempotencyKey` and replays the original result on retry. |
| `failureModes` | `readonly ErrorCode[] → src/shared/capabilities.ErrorCode` | — | `src/shared/capabilities.ts:102` |  |

### `src/shared/capabilities.InvokeRequest` — interface — `src/shared/capabilities.ts:428-433`

| field | type | default | at | note |
|---|---|---|---|---|
| `capability` | `string` | — | `src/shared/capabilities.ts:429` |  |
| `input` | `?: unknown` | — | `src/shared/capabilities.ts:430` |  |
| `idempotencyKey` | `?: string` | — | `src/shared/capabilities.ts:432` | Retry-safe key. On repeat the ORIGINAL result comes back, not a new one. |

### `src/shared/capabilities.CapabilityError` — interface — `src/shared/capabilities.ts:435-442`

| field | type | default | at | note |
|---|---|---|---|---|
| `code` | `ErrorCode → src/shared/capabilities.ErrorCode` | — | `src/shared/capabilities.ts:436` |  |
| `failureMode` | `?: string` | — | `src/shared/capabilities.ts:438` | The suite's kebab name for this refusal (fli-core), with a frozen JSON-RPC number. |
| `message` | `string` | — | `src/shared/capabilities.ts:439` |  |
| `details` | `?: unknown` | — | `src/shared/capabilities.ts:441` | Structural detail an agent can act on — which field, which id. |

### `src/shared/capabilities.InvokeResult` — type-union on `ok` — `src/shared/capabilities.ts:444-445`

| variant | shape | default | at |
|---|---|---|---|
| `true` | `{ ok: true; data: T; replayed?: boolean }` | — | `src/shared/capabilities.ts:445` |
| `false` | `{ ok: false; error: CapabilityError }` | — | `src/shared/capabilities.ts:445` |

### `src/shared/capabilities.InvokeResult[ok=false]` — type — `src/shared/capabilities.ts:445`

| field | type | default | at |
|---|---|---|---|
| `ok` | `false` | — | `src/shared/capabilities.ts:445` |
| `error` | `CapabilityError → src/shared/capabilities.CapabilityError` | — | `src/shared/capabilities.ts:445` |

### `src/shared/capabilities.InvokeResult[ok=true]` — type — `src/shared/capabilities.ts:445`

| field | type | default | at |
|---|---|---|---|
| `ok` | `true` | — | `src/shared/capabilities.ts:445` |
| `data` | `T` | — | `src/shared/capabilities.ts:445` |
| `replayed` | `?: boolean` | — | `src/shared/capabilities.ts:445` |

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

### `src/shared/domain-schema.transcriptSchema` — zod-object — `src/shared/domain-schema.ts:77-91`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('transcript id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:78` |
| `kind` | `z.enum(TRANSCRIPT_KINDS) → src/shared/domain.TRANSCRIPT_KINDS` | — | `src/shared/domain-schema.ts:79` |
| `corpus` | `id('corpus') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:80` |
| `talentId` | `id('talent id').nullable() → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:81` |
| `source` | `z.string().trim().min(1, 'transcript source must not be empty')` | — | `src/shared/domain-schema.ts:82` |
| `topics` | `z.array(majorTopicSchema).min(1, 'a transcript needs at least one major topic') → src/shared/domain-schema.majorTopicSchema` | — | `src/shared/domain-schema.ts:83` |
| `triggerSets` | `z.array(triggerSetSchema) → src/shared/domain-schema.triggerSetSchema` | — | `src/shared/domain-schema.ts:84` |
| `variant` | `z.object({ label: z.string().trim().min(1, 'variant label must not be empty').max(80), version: z.number().int().positive() }).optional()` | — | `src/shared/domain-schema.ts:85` |

### `src/shared/domain-schema.transcriptSchema.variant` — zod-object — `src/shared/domain-schema.ts:85`

| field | type | default | at |
|---|---|---|---|
| `label` | `z.string().trim().min(1, 'variant label must not be empty').max(80)` | — | `src/shared/domain-schema.ts:87` |
| `version` | `z.number().int().positive()` | — | `src/shared/domain-schema.ts:88` |

### `src/shared/domain-schema.scriptSchema` — zod-object — `src/shared/domain-schema.ts:93-106`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('script id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:94` |
| `n` | `z.number().int().positive()` | — | `src/shared/domain-schema.ts:95` |
| `title` | `z.string().trim().min(1, 'script title must not be empty')` | — | `src/shared/domain-schema.ts:96` |
| `takeaway` | `z.string().trim().min(1, 'script takeaway must not be empty')` | — | `src/shared/domain-schema.ts:97` |
| `summary` | `z.string().trim().min(1, 'script summary must not be empty')` | — | `src/shared/domain-schema.ts:98` |
| `transcripts` | `z.array(transcriptSchema) → src/shared/domain-schema.transcriptSchema` | — | `src/shared/domain-schema.ts:99` |
| `video` | `z.string().regex(PROJECT_NAME_PATTERN, 'video must be a video folder name (kebab-case)').max(PROJECT_NAME_MAX, `video must be at most ${PRO… → src/shared/domain.PROJECT_NAME_PATTERN, src/shared/domain.PROJECT_NAME_MAX` | — | `src/shared/domain-schema.ts:101` |

### `src/shared/domain-schema.scriptSetSchema` — zod-object — `src/shared/domain-schema.ts:108-131`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('set id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:109` |
| `title` | `z.string().trim().min(1, 'set title must not be empty')` | — | `src/shared/domain-schema.ts:110` |
| `description` | `z.string().trim()` | — | `src/shared/domain-schema.ts:111` |
| `project` | `z.string().regex(PROJECT_NAME_PATTERN, 'project must be a FliHub folder name (kebab-case)').max(PROJECT_NAME_MAX, `project must be at most … → src/shared/domain.PROJECT_NAME_PATTERN, src/shared/domain.PROJECT_NAME_MAX` | — | `src/shared/domain-schema.ts:114` |
| `exportedTo` | `z.string().regex(PROJECT_NAME_PATTERN, 'exportedTo must be a FliHub folder name (kebab-case)').max(PROJECT_NAME_MAX, `exportedTo must be at… → src/shared/domain.PROJECT_NAME_PATTERN, src/shared/domain.PROJECT_NAME_MAX` | — | `src/shared/domain-schema.ts:121` |
| `exportedBrand` | `z.string().trim().min(1, 'exportedBrand must not be empty').nullish()` | — | `src/shared/domain-schema.ts:128` |
| `onDemand` | `z.boolean().optional()` | — | `src/shared/domain-schema.ts:129` |
| `scripts` | `z.array(scriptSchema) → src/shared/domain-schema.scriptSchema` | — | `src/shared/domain-schema.ts:130` |

### `src/shared/domain-schema.cadenceEnvelopeSchema` — zod-object — `src/shared/domain-schema.ts:133-143`

| field | type | default | at |
|---|---|---|---|
| `wordsMin` | `z.number().int().nonnegative()` | — | `src/shared/domain-schema.ts:134` |
| `wordsMax` | `z.number().int().positive()` | — | `src/shared/domain-schema.ts:135` |
| `breathGroupMeanMin` | `z.number().nonnegative()` | — | `src/shared/domain-schema.ts:136` |
| `breaksPer100Max` | `z.number().nonnegative()` | — | `src/shared/domain-schema.ts:137` |
| `sentenceSdMin` | `z.number().nonnegative()` | — | `src/shared/domain-schema.ts:138` |
| `emDashMax` | `z.number().int().nonnegative()` | — | `src/shared/domain-schema.ts:139` |
| `antiVoice` | `z.array(z.string().min(1))` | — | `src/shared/domain-schema.ts:140` |
| `bookends` | `z.array(z.string().min(1))` | — | `src/shared/domain-schema.ts:141` |
| `source` | `z.string().trim().min(1, 'an envelope must record where it was measured')` | — | `src/shared/domain-schema.ts:142` |

### `src/shared/domain-schema.talentSchema` — zod-object — `src/shared/domain-schema.ts:145-149`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('talent id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:146` |
| `name` | `z.string().trim().min(1, 'talent name must not be empty')` | — | `src/shared/domain-schema.ts:147` |
| `envelope` | `cadenceEnvelopeSchema → src/shared/domain-schema.cadenceEnvelopeSchema` | — | `src/shared/domain-schema.ts:148` |

### `src/shared/domain-schema.rigLayoutSchema` — zod-object — `src/shared/domain-schema.ts:155-168`

| field | type | default | at |
|---|---|---|---|
| `visible` | `z.array(z.enum(RECORDING_SET)).min(1, 'a rig must show at least one zone') → src/shared/rig.RECORDING_SET` | — | `src/shared/domain-schema.ts:156` |
| `driven` | `z.enum(RECORDING_SET) → src/shared/rig.RECORDING_SET` | — | `src/shared/domain-schema.ts:157` |
| `weights` | `z.object({ major: z.number().finite(), minor: z.number().finite(), triggers: z.number().finite(), paragraph: z.number().finite() })` | — | `src/shared/domain-schema.ts:158` |
| `camera` | `z.enum(CAMERA_SIDES) → src/shared/rig.CAMERA_SIDES` | — | `src/shared/domain-schema.ts:164` |
| `text` | `z.enum(TEXT_PRESETS) → src/shared/rig.TEXT_PRESETS` | — | `src/shared/domain-schema.ts:165` |
| `mirror` | `z.boolean()` | — | `src/shared/domain-schema.ts:166` |
| `focus` | `z.boolean()` | — | `src/shared/domain-schema.ts:167` |

### `src/shared/domain-schema.rigLayoutSchema.weights` — zod-object — `src/shared/domain-schema.ts:158`

| field | type | default | at |
|---|---|---|---|
| `major` | `z.number().finite()` | — | `src/shared/domain-schema.ts:159` |
| `minor` | `z.number().finite()` | — | `src/shared/domain-schema.ts:160` |
| `triggers` | `z.number().finite()` | — | `src/shared/domain-schema.ts:161` |
| `paragraph` | `z.number().finite()` | — | `src/shared/domain-schema.ts:162` |

### `src/shared/domain-schema.rigSchema` — zod-object — `src/shared/domain-schema.ts:170-174`

| field | type | default | at |
|---|---|---|---|
| `id` | `id('rig id') → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:171` |
| `label` | `z.string().trim().min(1, 'a rig needs a name to be pickable')` | — | `src/shared/domain-schema.ts:172` |
| `layout` | `rigLayoutSchema → src/shared/domain-schema.rigLayoutSchema` | — | `src/shared/domain-schema.ts:173` |

### `src/shared/domain-schema.workspaceSchema` — zod-object — `src/shared/domain-schema.ts:176-189`

| field | type | default | at |
|---|---|---|---|
| `layout` | `rigLayoutSchema.nullable() → src/shared/domain-schema.rigLayoutSchema` | — | `src/shared/domain-schema.ts:177` |
| `rigId` | `id('rig id').nullable() → src/shared/domain-schema.id` | — | `src/shared/domain-schema.ts:178` |
| `position` | `z.object({ setId: z.string().nullable(), scriptId: z.string().nullable(), transcriptId: z.string().nullable(), style: z.enum(TRIGGER_STYLES… → src/shared/domain.TRIGGER_STYLES` | — | `src/shared/domain-schema.ts:180` |

### `src/shared/domain-schema.workspaceSchema.position` — zod-object — `src/shared/domain-schema.ts:180`

| field | type | default | at |
|---|---|---|---|
| `setId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:182` |
| `scriptId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:183` |
| `transcriptId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:184` |
| `style` | `z.enum(TRIGGER_STYLES).nullable() → src/shared/domain.TRIGGER_STYLES` | — | `src/shared/domain-schema.ts:185` |
| `paragraphId` | `z.string().nullable()` | — | `src/shared/domain-schema.ts:186` |

### `src/shared/domain.Paragraph` — interface — `src/shared/domain.ts:101-105`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `ParagraphId → src/shared/domain.ParagraphId` | — | `src/shared/domain.ts:102` |  |
| `text` | `string` | — | `src/shared/domain.ts:104` | Verbatim. For a provenance transcript this is never rewritten. |

### `src/shared/domain.MinorTopic` — interface — `src/shared/domain.ts:108-112`

Zone 2 in requirements §1 — the sub-point under the heading.

| field | type | default | at |
|---|---|---|---|
| `id` | `TopicId → src/shared/domain.TopicId` | — | `src/shared/domain.ts:109` |
| `heading` | `string` | — | `src/shared/domain.ts:110` |
| `paragraphs` | `Paragraph[] → src/shared/domain.Paragraph` | — | `src/shared/domain.ts:111` |

### `src/shared/domain.MajorTopic` — interface — `src/shared/domain.ts:115-119`

Zone 1 in requirements §1 — where you are in the script.

| field | type | default | at |
|---|---|---|---|
| `id` | `TopicId → src/shared/domain.TopicId` | — | `src/shared/domain.ts:116` |
| `heading` | `string` | — | `src/shared/domain.ts:117` |
| `minors` | `MinorTopic[] → src/shared/domain.MinorTopic` | — | `src/shared/domain.ts:118` |

### `src/shared/domain.Trigger` — interface — `src/shared/domain.ts:130-134`

One trigger — a single step in column 2, bound to the paragraph it belongs to.

| field | type | default | at |
|---|---|---|---|
| `id` | `TriggerId → src/shared/domain.TriggerId` | — | `src/shared/domain.ts:131` |
| `text` | `string` | — | `src/shared/domain.ts:132` |
| `paragraphId` | `ParagraphId → src/shared/domain.ParagraphId` | — | `src/shared/domain.ts:133` |

### `src/shared/domain.TriggerSet` — interface — `src/shared/domain.ts:136-142`

| field | type | default | at | note |
|---|---|---|---|---|
| `style` | `TriggerStyle → src/shared/domain.TriggerStyle` | — | `src/shared/domain.ts:137` |  |
| `authoredBy` | `Authorship → src/shared/domain.Authorship` | — | `src/shared/domain.ts:138` |  |
| `note` | `?: string` | — | `src/shared/domain.ts:140` | Free text — where these came from, so a bad set can be traced and dropped. |
| `triggers` | `Trigger[] → src/shared/domain.Trigger` | — | `src/shared/domain.ts:141` |  |

### `src/shared/domain.Transcript` — interface — `src/shared/domain.ts:144-166`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `TranscriptId → src/shared/domain.TranscriptId` | — | `src/shared/domain.ts:145` |  |
| `kind` | `TranscriptKind → src/shared/domain.TranscriptKind` | — | `src/shared/domain.ts:146` |  |
| `corpus` | `string` | — | `src/shared/domain.ts:153` | Which body of text this is a member of — `tom-original`, `v0N-rewrite`. |
| `talentId` | `TalentId \| null → src/shared/domain.TalentId` | — | `src/shared/domain.ts:155` | Required on `cadence`, forbidden on `provenance`. Enforced below. |
| `source` | `string` | — | `src/shared/domain.ts:157` | Where the text physically came from, for provenance auditing. |
| `topics` | `MajorTopic[] → src/shared/domain.MajorTopic` | — | `src/shared/domain.ts:158` |  |
| `triggerSets` | `TriggerSet[] → src/shared/domain.TriggerSet` | — | `src/shared/domain.ts:159` |  |
| `variant` | `?: TranscriptVariant → src/shared/domain.TranscriptVariant` | — | `src/shared/domain.ts:165` | Set when this transcript is a published story variant. The transcript's |

### `src/shared/domain.TranscriptVariant` — interface — `src/shared/domain.ts:168-173`

| field | type | default | at | note |
|---|---|---|---|---|
| `label` | `string` | — | `src/shared/domain.ts:170` | Free text. Never a fixed long/short choice. |
| `version` | `number` | — | `src/shared/domain.ts:172` | Story Pilot's own version number for these words. |

### `src/shared/domain.Script` — interface — `src/shared/domain.ts:175-192`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `ScriptId → src/shared/domain.ScriptId` | — | `src/shared/domain.ts:176` |  |
| `n` | `number` | — | `src/shared/domain.ts:178` | Position in the set, 1-based. Display only — `id` is the identity. |
| `title` | `string` | — | `src/shared/domain.ts:179` |  |
| `takeaway` | `string` | — | `src/shared/domain.ts:181` | The originator's approved takeaway. The landing line is held to this. |
| `summary` | `string` | — | `src/shared/domain.ts:183` | Requirements §6 — a set of twelve has to be scannable in one sitting. |
| `transcripts` | `Transcript[] → src/shared/domain.Transcript` | — | `src/shared/domain.ts:184` |  |
| `video` | `?: string \| null` | — | `src/shared/domain.ts:191` | The D15 video this script is for — `videos/<name>/` in the project, |

### `src/shared/domain.ScriptSet` — interface — `src/shared/domain.ts:232-275`

| field | type | default | at | note |
|---|---|---|---|---|
| `id` | `SetId → src/shared/domain.SetId` | — | `src/shared/domain.ts:233` |  |
| `title` | `string` | — | `src/shared/domain.ts:234` |  |
| `description` | `string` | — | `src/shared/domain.ts:235` |  |
| `project` | `?: string \| null` | — | `src/shared/domain.ts:252` | THE FLIHUB PROJECT this set's scripts record into — the folder name |
| `exportedTo` | `?: string \| null` | — | `src/shared/domain.ts:261` | Set by `set_export_to_project` (W6, open-contract §4): the FliHub folder |
| `exportedBrand` | `?: string \| null` | — | `src/shared/domain.ts:267` | The `brands.json` key the export was made under — recorded beside |
| `onDemand` | `?: boolean` | — | `src/shared/domain.ts:273` | A project's on-demand scripts (`write_script`, B585): many small NAMED |
| `scripts` | `Script[] → src/shared/domain.Script` | — | `src/shared/domain.ts:274` |  |

### `src/shared/domain.CadenceEnvelope` — interface — `src/shared/domain.ts:290-307`

The eight deterministic threshold rules from

| field | type | default | at | note |
|---|---|---|---|---|
| `wordsMin` | `number` | — | `src/shared/domain.ts:291` |  |
| `wordsMax` | `number` | — | `src/shared/domain.ts:292` |  |
| `breathGroupMeanMin` | `number` | — | `src/shared/domain.ts:294` | Mean words per breath group. David ≈ 11.5; Tom writes ≈ 7. |
| `breaksPer100Max` | `number` | — | `src/shared/domain.ts:296` | Internal punctuation breaks per 100 words. |
| `sentenceSdMin` | `number` | — | `src/shared/domain.ts:298` | Sentence-length standard deviation — flat rhythm reads as written. |
| `emDashMax` | `number` | — | `src/shared/domain.ts:300` | Em-dash appositives. Zero, for this talent. |
| `antiVoice` | `string[]` | — | `src/shared/domain.ts:302` | Words that do not belong in this talent's voice, as regex-safe literals. |
| `bookends` | `string[]` | — | `src/shared/domain.ts:304` | Channel bookends that must not appear inside a script body. |
| `source` | `string` | — | `src/shared/domain.ts:306` | Where these numbers were measured. Never guess this field. |

### `src/shared/domain.Talent` — interface — `src/shared/domain.ts:309-313`

| field | type | default | at |
|---|---|---|---|
| `id` | `TalentId → src/shared/domain.TalentId` | — | `src/shared/domain.ts:310` |
| `name` | `string` | — | `src/shared/domain.ts:311` |
| `envelope` | `CadenceEnvelope → src/shared/domain.CadenceEnvelope` | — | `src/shared/domain.ts:312` |

### `src/shared/domain.DomainViolation` — interface — `src/shared/domain.ts:320-323`

A validation problem, phrased so an agent can act on it.

| field | type | default | at |
|---|---|---|---|
| `path` | `string` | — | `src/shared/domain.ts:321` |
| `message` | `string` | — | `src/shared/domain.ts:322` |

### `src/shared/ipc.AppInfo` — interface — `src/shared/ipc.ts:45-52`

| field | type | default | at |
|---|---|---|---|
| `name` | `string` | — | `src/shared/ipc.ts:46` |
| `version` | `string` | — | `src/shared/ipc.ts:47` |
| `electron` | `string` | — | `src/shared/ipc.ts:48` |
| `chrome` | `string` | — | `src/shared/ipc.ts:49` |
| `node` | `string` | — | `src/shared/ipc.ts:50` |
| `platform` | `NodeJS.Platform → NodeJS (@types/node), Platform (@types/node)` | — | `src/shared/ipc.ts:51` |

### `src/shared/ipc.ControlStatus` — interface — `src/shared/ipc.ts:54-63`

| field | type | default | at | note |
|---|---|---|---|---|
| `running` | `boolean` | — | `src/shared/ipc.ts:55` |  |
| `port` | `number \| null` | — | `src/shared/ipc.ts:56` |  |
| `discoveryPath` | `string \| null` | — | `src/shared/ipc.ts:62` | The path an agent reads the token from. The TOKEN ITSELF never crosses this |

### `src/shared/ipc.ControlChanged` — interface — `src/shared/ipc.ts:65-69`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/ipc.ts:66` |
| `principal` | `'ui' \| 'agent'` | — | `src/shared/ipc.ts:67` |
| `at` | `number` | — | `src/shared/ipc.ts:68` |

### `src/shared/ipc.InvokePayload` — interface — `src/shared/ipc.ts:71-75`

| field | type | default | at |
|---|---|---|---|
| `capability` | `string` | — | `src/shared/ipc.ts:72` |
| `input` | `?: unknown` | — | `src/shared/ipc.ts:73` |
| `idempotencyKey` | `?: string` | — | `src/shared/ipc.ts:74` |

### `src/shared/ipc.AppytronApi` — interface — `src/shared/ipc.ts:78-93`

The API exposed to the renderer on `window.appytron`.

| field | type | default | at | note |
|---|---|---|---|---|
| `getAppInfo` | `(): Promise<AppInfo>` | — | `src/shared/ipc.ts:79` |  |
| `invoke` | `<T = unknown>(payload: InvokePayload): Promise<InvokeResult<T>>` | — | `src/shared/ipc.ts:80` |  |
| `getControlStatus` | `(): Promise<ControlStatus>` | — | `src/shared/ipc.ts:81` |  |
| `logPress` | `(input: PressInput): void` | — | `src/shared/ipc.ts:83` | Append to the press log. Never rejects, never blocks. |
| `voiceControl` | `(command: VoiceControl): Promise<{ ok: boolean; error?: string }>` | — | `src/shared/ipc.ts:85` | Voice-follow (off by default). |
| `sendVoicePcm` | `(pcm: ArrayBuffer): void` | — | `src/shared/ipc.ts:87` | Mono 16 kHz s16le PCM from the mic. Fire-and-forget. |
| `onVoiceEvent` | `(listener: (event: VoiceEvent) => void): () => void` | — | `src/shared/ipc.ts:88` |  |
| `logVoice` | `(event: string, detail?: Record<string, unknown>): void` | — | `src/shared/ipc.ts:90` | One voice-path log line into main's `.logs/app.log`. Never rejects, never blocks. |
| `onControlChanged` | `(listener: (event: ControlChanged) => void): () => void` | — | `src/shared/ipc.ts:92` | Subscribe to store changes. Returns an unsubscribe function. |

### `src/shared/press.PressInput` — interface — `src/shared/press.ts:6-14`

What the renderer reports.

| field | type | default | at | note |
|---|---|---|---|---|
| `kind` | `PressKind → src/shared/press.PressKind` | — | `src/shared/press.ts:7` |  |
| `scriptId` | `string` | — | `src/shared/press.ts:8` |  |
| `scriptVersion` | `?: string` | — | `src/shared/press.ts:10` | Hash of the active transcript's paragraph text, to tell script versions apart. |
| `from` | `?: number \| null` | — | `src/shared/press.ts:11` |  |
| `to` | `?: number \| null` | — | `src/shared/press.ts:12` |  |
| `paragraphId` | `?: string \| null` | — | `src/shared/press.ts:13` |  |

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

### `src/shared/voice.VoiceEvent` — type-union on `type` — `src/shared/voice.ts:4-11`

| variant | shape | default | at |
|---|---|---|---|
| `text` | `{ type: 'text'; engine: VoiceEngine; text: string; atMs: number }` | — | `src/shared/voice.ts:5` |
| `status` | `{ type: 'status' state: 'listening' \| 'fallback' \| 'error' \| 'off' engine: VoiceEngine \| null error?: string }` | — | `src/shared/voice.ts:7` |

### `src/shared/voice.VoiceEvent[type=text]` — type — `src/shared/voice.ts:5`

| field | type | default | at |
|---|---|---|---|
| `type` | `'text'` | — | `src/shared/voice.ts:5` |
| `engine` | `VoiceEngine → src/shared/voice.VoiceEngine` | — | `src/shared/voice.ts:5` |
| `text` | `string` | — | `src/shared/voice.ts:5` |
| `atMs` | `number` | — | `src/shared/voice.ts:5` |

### `src/shared/voice.VoiceEvent[type=status]` — type — `src/shared/voice.ts:6-11`

| field | type | default | at |
|---|---|---|---|
| `type` | `'status'` | — | `src/shared/voice.ts:7` |
| `state` | `'listening' \| 'fallback' \| 'error' \| 'off'` | — | `src/shared/voice.ts:8` |
| `engine` | `VoiceEngine \| null → src/shared/voice.VoiceEngine` | — | `src/shared/voice.ts:9` |
| `error` | `?: string` | — | `src/shared/voice.ts:10` |

### `src/shared/voice.VoiceControl` — type-union on `action` — `src/shared/voice.ts:13-18`

| variant | shape | default | at |
|---|---|---|---|
| `start` | `{ action: 'start' }` | — | `src/shared/voice.ts:14` |
| `stop` | `{ action: 'stop' }` | — | `src/shared/voice.ts:15` |
| `reset` | `{ action: 'reset' }` | — | `src/shared/voice.ts:16` |
| `hints` | `{ action: 'hints'; words: string[] }` | — | `src/shared/voice.ts:18` |

### `src/shared/voice.VoiceControl[action=start]` — type — `src/shared/voice.ts:14`

| field | type | default | at |
|---|---|---|---|
| `action` | `'start'` | — | `src/shared/voice.ts:14` |

### `src/shared/voice.VoiceControl[action=stop]` — type — `src/shared/voice.ts:15`

| field | type | default | at |
|---|---|---|---|
| `action` | `'stop'` | — | `src/shared/voice.ts:15` |

### `src/shared/voice.VoiceControl[action=reset]` — type — `src/shared/voice.ts:16`

| field | type | default | at |
|---|---|---|---|
| `action` | `'reset'` | — | `src/shared/voice.ts:16` |

### `src/shared/voice.VoiceControl[action=hints]` — type — `src/shared/voice.ts:18`

| field | type | default | at |
|---|---|---|---|
| `action` | `'hints'` | — | `src/shared/voice.ts:18` |
| `words` | `string[]` | — | `src/shared/voice.ts:18` |

## Cannot be mirrored

These were looked at and could not be resolved to an authority. **Nothing is guessed for them.** Each is a real gap in this page.

| subject | why | looked at |
|---|---|---|
| 1 hand-written declaration file(s) excluded by default | `*.d.ts` is excluded so build output cannot shadow its source; these have no sibling source, so their declarations are NOT on this page. Re-run with --no-default-excludes (and your own --exclude list) to include them. | `src/renderer/src/images.d.ts` |
| schemas built by `appFileName(...)` (1 use) | built by calling `appFileName(...)` imported from `@flivideo/core`; package helpers are not expanded - see that package's own mirror | `appFileName({ app: 'tubby' }) (src/core/project-store.ts:27)` |
| schemas built by `defineCapabilities(...)` (1 use) | built by calling `defineCapabilities(...)` imported from `@flivideo/core`; package helpers are not expanded - see that package's own mirror | `defineCapabilities(Object.fromEntries(CAPABILITIES.map((meta) => [DOTTED_NAME[meta.name]!, contractFor(meta)]))) (src/core/agent-layer.ts:190)` |
| schemas built by `defineFailureCodes(...)` (1 use) | built by calling `defineFailureCodes(...)` imported from `@flivideo/core`; package helpers are not expanded - see that package's own mirror | `defineFailureCodes({ 'invalid-input': JSONRPC_CODES.invalidParams, 'unknown-capability': JSONRPC_CODES.methodNotFound, internal: JSONRPC_CO… (src/core/agent-layer.ts:111)` |
| schemas built by `id(...)` (13 uses) | built by calling `id(...)`, which does not return a single zod expression this reader can follow | `id('paragraph id') (src/shared/domain-schema.ts:48)`<br>`id('minor topic id') (src/shared/domain-schema.ts:53)`<br>`id('major topic id') (src/shared/domain-schema.ts:59)`<br>`id('trigger id') (src/shared/domain-schema.ts:65)`<br>`id('paragraph id') (src/shared/domain-schema.ts:67)`<br>`id('transcript id') (src/shared/domain-schema.ts:78)`<br>`id('corpus') (src/shared/domain-schema.ts:80)`<br>`id('talent id').nullable() (src/shared/domain-schema.ts:81)`<br>`id('script id') (src/shared/domain-schema.ts:94)`<br>`id('set id') (src/shared/domain-schema.ts:109)` |
| src/core/input-shapes.layoutInput.camera | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(CAMERA_SIDES)` |
| src/core/input-shapes.layoutInput.driven | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(RECORDING_SET)` |
| src/core/input-shapes.layoutInput.text | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(TEXT_PRESETS)` |
| src/core/input-shapes.layoutInput.visible[] | a z.enum whose members are computed or imported - this reader could not reach a literal list | `z.enum(RECORDING_SET)` |

### Declared but not read

The census found these top-level declarations and the extractor did not mirror them. Nothing else about them is on this page.

| family | count | declarations |
|---|---|---|
| class | 22 | `src/core/active-context.ActiveContextHolder` `src/core/active-context.ts:48`<br>`src/core/open-context.OpenContextHolder` `src/core/open-context.ts:250`<br>`src/core/press-log.PressLog` `src/core/press-log.ts:40`<br>`src/core/repository.FileRepository` `src/core/repository.ts:109`<br>`src/core/repository.MemoryRepository` `src/core/repository.ts:80`<br>`src/core/safety.AuditLog` `src/core/safety.ts:305`<br>`src/core/safety.CapabilityFailure` `src/core/safety.ts:40`<br>`src/core/safety.ConfirmationLedger` `src/core/safety.ts:125`<br>`src/core/safety.IdempotencyLedger` `src/core/safety.ts:220`<br>`src/core/safety.RateLimiter` `src/core/safety.ts:259`<br>`src/core/stage.StageRequests` `src/core/stage.ts:50`<br>`src/core/stage.TalentActivity` `src/core/stage.ts:76`<br>`src/main/file-author.FileAuthor` `src/main/file-author.ts:32`<br>`src/main/ipc-router.IpcRouter` `src/main/ipc-router.ts:19`<br>`src/main/process-supervisor.Managed` `src/main/process-supervisor.ts:54`<br>`src/main/process-supervisor.ProcessSupervisor` `src/main/process-supervisor.ts:31`<br>`src/main/updater.Updater` `src/main/updater.ts:25`<br>`src/main/voice/apple-live.AppleLive` `src/main/voice/apple-live.ts:11`<br>`src/main/voice/groq-live.AudioBudget` `src/main/voice/groq-live.ts:21`<br>`src/main/voice/groq-live.GroqLive` `src/main/voice/groq-live.ts:77`<br>`src/main/voice/voice-session.VoiceSession` `src/main/voice/voice-session.ts:16`<br>`src/main/window-manager.WindowManager` `src/main/window-manager.ts:20` |
| object constant | 10 | `src/core/agent-layer.DOTTED_NAME` `src/core/agent-layer.ts:52`<br>`src/core/input-shapes.INPUT` `src/core/input-shapes.ts:78`<br>`src/core/repository.EMPTY_DOCUMENT` `src/core/repository.ts:35`<br>`src/core/voice-follow.DEFAULT_OPTIONS` `src/core/voice-follow.ts:33`<br>`src/renderer/src/store.ZONE_LABEL` `src/renderer/src/store.ts:91`<br>`src/shared/domain.TRIGGER_STYLE_LETTER` `src/shared/domain.ts:87`<br>`src/shared/ipc.IPC` `src/shared/ipc.ts:23`<br>`src/shared/rig.DEFAULT_LAYOUT` `src/shared/rig.ts:142`<br>`src/shared/rig.EMPTY_WORKSPACE` `src/shared/rig.ts:133`<br>`src/shared/script-set.KYBERNESIS_PHASE_1` `src/shared/script-set.ts:17` |
| alias of a primitive | 8 | `src/shared/domain.ParagraphId` `src/shared/domain.ts:47`<br>`src/shared/domain.ScriptId` `src/shared/domain.ts:44`<br>`src/shared/domain.SetId` `src/shared/domain.ts:43`<br>`src/shared/domain.TalentId` `src/shared/domain.ts:49`<br>`src/shared/domain.TopicId` `src/shared/domain.ts:46`<br>`src/shared/domain.TranscriptId` `src/shared/domain.ts:45`<br>`src/shared/domain.TriggerId` `src/shared/domain.ts:48`<br>`src/shared/rig.RigId` `src/shared/rig.ts:32` |
| array constant | 3 | `src/core/voice-selftest.SELFTEST_SCRIPT` `src/core/voice-selftest.ts:16`<br>`src/shared/capabilities.CAPABILITIES` `src/shared/capabilities.ts:168`<br>`src/shared/script-set.TALENTS` `src/shared/script-set.ts:2110` |
| const built by a call (helper or non-zod call) | 3 | `src/core/agent-layer.SNAKE_NAME` `src/core/agent-layer.ts:93`<br>`src/renderer/src/store.useProm` `src/renderer/src/store.ts:432`<br>`src/renderer/src/voice-live.useVoice` `src/renderer/src/voice-live.ts:34` |
| constant (other form) | 3 | `src/core/active-context.ACTIVE_CONTEXT_TTL_MS` `src/core/active-context.ts:27`<br>`src/core/safety.CONFIRMATION_TTL_MS` `src/core/safety.ts:123`<br>`src/core/stage.TALENT_BUSY_WINDOW_MS` `src/core/stage.ts:27` |
| alias of another value (`X = Y`) | 1 | `src/core/input-shapes.INPUT_BY_NAME` `src/core/input-shapes.ts:370` |
| derived type (`keyof typeof`, indexed access, `typeof`) | 1 | `src/shared/capabilities.CapabilityName` `src/shared/capabilities.ts:411` |
| instance constant (`new ...`) | 1 | `src/shared/capabilities.CAPABILITY_BY_NAME` `src/shared/capabilities.ts:413` |
| union of named or mixed types | 1 | `src/core/active-context.ActiveContext` `src/core/active-context.ts:38` |
| utility-type alias (`Pick` / `Omit` / `Record` / generic instance) | 1 | `src/renderer/src/press-log.State` `src/renderer/src/press-log.ts:31` |

## Findings — changes needed in the target application

These are refactors of the **application**, not of this mirror. Each one converts a derived section into a declared one.

1. `src/core/input-shapes.ts:413` — REFACTOR: `def.type` is a closed set enforced only by control flow at src/core/input-shapes.ts:413. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
2. `src/core/press-log.ts:34` — REFACTOR (minor): `KINDS` at src/core/press-log.ts:34 names the set but does not type it. A z.enum or `as const` + `typeof KINDS[number]` would make a wrong value a static error rather than a runtime miss.
3. `src/main/control-server.ts:385` — REFACTOR: `result.error.code` is a closed set enforced only by control flow at src/main/control-server.ts:385. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
4. `src/main/voice/apple-bundle.ts:17` — REFACTOR: `status` is a closed set enforced only by control flow at src/main/voice/apple-bundle.ts:17. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
5. `src/renderer/src/App.tsx:798` — REFACTOR: `zone` is a closed set enforced only by control flow at src/renderer/src/App.tsx:798. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.
6. `src/renderer/src/voice-live.ts:167` — REFACTOR: `event.state` is a closed set enforced only by control flow at src/renderer/src/voice-live.ts:167. Declare it once (a z.enum or a literal union type) and type the subject with it; until then this section is DERIVED and will drift silently.

---

Regenerate: `schema-mirror` skill → `extract_typescript.py` + `render_mirror.py`. Check for drift: `verify_mirror.py`.
