# Spec 12 — Task generation and assignment reliability

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #20
**Owns:** `backend/src/config/runtimeSecurity.test.ts`, `backend/src/routes/location.route.ts`, `backend/src/services/taskReadiness.service.ts`, `backend/src/services/taskReadiness.service.test.ts`, `backend/src/routes/taskReadiness.route.ts`, `specs/inventory/12-task-readiness.md`
**Reuses:** `backend/src/services/templateAssignment.service.ts`, `backend/src/services/schedulePreview.service.ts`, `backend/src/cron/startupCron.ts`

## Goal

Task generation and assignment reliability in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Expose derived scoped setup/task eligibility using existing DAILY/ONCE engine. Correct only confirmed generation/catch-up/shift-fit gaps with explicit file-ownership amendment if needed. Test absent/unassigned staff and assignment epoch revocation. Read-only previews must never generate occurrences. Surface no-replacement reason; no new Today reassignment action.

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

- [x] `npm test --prefix backend -- src/services/taskReadiness.service.test.ts` passes: 14 readiness cases cover role/company/site denial, real count-derived setup, bounded pagination, per-site local-day/DST and unassigned/no-staff states. [unit]
- [x] Existing templateAssignment/taskAssignment/schedulePreview/taskInstanceWindow regression files pass, preserving no-replacement authority and pure previews. [unit]
- [x] Occurrence uniqueness and epoch revocation remain in existing schema/migrations and generator; DB trigger/race proof remains final integrated gate40. [static]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/20. Mount bounded readonly readiness under existing location routes before:id, using current role/company/ManagerLocation and local-day helpers. Source confirms generation occurrence uniqueness and epoch-revocation triggers already exist; preserve/test them rather than rebuild engine.
- **2026-10-20** — First full suite had779/780 passing; cold actual-app-import subprocess exceeded10s while build/test processes contended. Preserve same security assertions and bound subprocess to30s/test40s; no auth/config behavior weakened. All75 test files rerun before completion.
- **2026-10-20** — GET/api/location/readiness mounted before:id; current manager/company scope,20-default/50-max cursor page, full-scope site total, group counts from real staff/areas/configured schedules/site-local tasks. Derived checklist never invokes scheduler/assignment mutations; no-task-today remains separate from setup readiness.14 new tests +19 existing schedule/assignment/window tests (33 targeted) pass; full backend780/780 (75 files) after bounded cold-import allowance; backend build passes. Existing generator idempotency and database epoch triggers preserved, real DB trigger/concurrency proof remains40. No external DB/provider/device exercised.
- **2026-10-20** — Scoped draft https://github.com/Shumail-AbdulRehman/PRIV/pull/23 published, stacked on07; no merge.
