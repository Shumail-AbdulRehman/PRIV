# Spec 03 — P0 fail-closed production runtime

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #3
**Owns:** `backend/src/config/runtimeSecurity.ts`, `backend/src/config/runtimeSecurity.test.ts`, `backend/src/config/initializeRuntime.ts`, `backend/src/app.ts`, `docker-compose.yml`, `specs/inventory/03-production-runtime.md`
**Reuses:** `backend/src/utils/cookies.ts`, `backend/src/utils/ApiError.ts`

## Goal

P0 fail-closed production runtime in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Validate production JWT keys, positive explicit token durations, HTTPS exact frontend origins and secure cookie contract before cron imports, provider/DB startup or listener. Reject missing/placeholder/short/equal secrets without echoing values. Remove Compose JWT/HTTP cookie defaults. Retain development configuration. Mount launch router only when spec 26 supplies it; coordinate this future registration explicitly in handoff rather than fabricate imports.

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

- [x] `npm test --prefix backend -- src/config/runtimeSecurity.test.ts` passes: Invalid production values fail before startup side effects; valid explicit HTTPS configuration passes; error text excludes key values; Compose has no replace_me JWT fallback. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/3; retain development behavior and validate production before cron imports.
- **2026-10-20** — app.ts first ESM dependency loads dotenv and validates before cron/provider/DB imports. Compose requires unique keys and exact HTTPS origins; secure cookie default true. 29 regression tests; full backend 628/628 (68 files); build passed. Actual invalid-config app-import subprocess fails before listener/cron logs. Full-suite subprocess exceeded Vitest default 5s under contention; bounded test budget raised to 15s (child remains 10s), full suite then passed. No valid-production boot/provider calls/deployment attempted.
