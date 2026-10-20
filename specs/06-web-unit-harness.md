# Spec 06 — Web component test harness

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #6
**Owns:** `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `frontend/src/test/harness.test.tsx`, `frontend/package.json`, `frontend/package-lock.json`, `specs/inventory/06-web-unit-harness.md`
**Reuses:** `frontend/src/components/ui/button.tsx`

## Goal

Web component test harness in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Add only Vitest/jsdom/Testing Library needed to prove React behavior while preserving existing node pure-function suite. Provide test:components command and both-suite test command; real Button role/disabled interaction smoke proof. Do not install browser end-to-end harness yet.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Shared visual/navigation composition → spec 27.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [x] `npm run test:components --prefix frontend -- src/test/harness.test.tsx` passes: Existing node tests and new component harness both run; accessible button behavior passes. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/6. Existing node tests preserved; install only required component runner/DOM/assertion packages.
- **2026-10-20** — Added Vitest/jsdom/Testing Library + jest-dom only; retained node runner under test:unit, full test runs both. 57 existing pure tests + 2 real Button role/focus/disabled component tests pass; TypeScript/Vite build and touched-file ESLint (zero warnings) pass. Initial checks ran before dependency install finished and reported missing packages; rerun after completed install passed. npm audit reports 33 advisories including existing direct axios/router/vite/shadcn; saved bounded evidence for release security remediation, no force upgrade used.
- **2026-10-20** — Scoped draft https://github.com/Shumail-AbdulRehman/PRIV/pull/13 published, stacked on spec05; no merge.
