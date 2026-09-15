---
adr: 002
title: Typecheck is the static check; a lint config is David's call
status: accepted
date: 2026-09-16
---

# ADR-002 — Typecheck is the static check; a lint config is David's call

## Context

The W6 build and review briefs both required `npm run lint` to stay green. The repo has no `lint`
script and no lint config (`npm error Missing script: "lint"`), and no coverage threshold. So
"thresholds not lowered" held trivially. Review finding M4 asked Swagger to rule.

## Decision

Ruled by Swagger (`flistudio-orch`) in the W6 fix brief: **`npm run typecheck` (`tsc --noEmit`
over both the node and web tsconfigs) is W6's static check.** Adding a lint config is David's
decision, the same ruling as FliCast. The W6 fix round made no change.

## Consequences

- A brief that says "lint green" is satisfied by typecheck in this repo until David rules
  otherwise. A future brief should say *typecheck* rather than name a script that does not exist.
- Unused-variable and implicit-any errors are still caught (`tsc` strict settings). Style and
  import-order rules are not.
- No coverage gate exists, so "not lowered" means nothing here. Test count is the only number
  tracked.
