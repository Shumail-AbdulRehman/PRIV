# Spec 23 — Immutable attendance annotations API

**Status:** Done
**Depends on:** Spec 10
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #43
**Owns:** `backend/src/services/attendanceAnnotation.service.ts`, `backend/src/services/attendanceAnnotation.service.test.ts`, `backend/src/routes/attendanceAnnotation.route.ts`, `specs/inventory/23-attendance-annotations-api.md`, `backend/tests/attendanceAnnotation.integration.ts`
**Reuses:** `backend/src/utils/scope.ts`, `backend/src/services/auditLog.service.ts`

## Goal

Immutable attendance annotations API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Append reason/note, authenticated actor/time and acknowledgement to scoped attendance. Staff sees own context; operational review uses historical site/company. Preserve original captured facts, no edit/delete of annotation or corrected-hours engine.

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

- [x] `npm test --prefix backend -- src/services/attendanceAnnotation.service.test.ts` passes: Cross-site/tenant annotation denied; duplicate retry idempotent; original attendance time/photo/status unchanged. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue43 and branched from verified spec22/PR42. Dependency10 schema/trigger and current Git/PR chain confirmed. Added isolated persistence-proof ownership before implementation; no applied migration changes. Staff own historical notes; ADMIN/assigned historical-site MANAGER notes and parent-bound acknowledgements. No original fact changes; route mounting26/UI29 remain separate.

- **2026-10-20** — Completed55 focused tests; full backend1170 tests/86 files/zero skips using explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL. Backend tsc --noEmit/build and standalone integration tsc pass. Guarded isolated PostgreSQL proof passes: exact concurrent retry one row/audit, cross-record request conflict, transferred staff own historical notes, manager historical site/current assignment and revocation denial, tenant/parent/cursor denial, actual chronological paging, audit rollback, SQL update/delete denial, unchanged original times/photos/status. Initial integration fixture status corrected to existing CHECKED_IN enum before successful proof; no application/schema correction needed. Logs `/tmp/hygene-spec23-tests.log`, `/tmp/hygene-spec23-build.log`, `/tmp/hygene-spec23-integration.log`. No migration/UI/dependency changes; route26/UI29/E2E40 remain separate. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/43; draft PR publication recorded after creation. Next selected25 (dependency19 Done);29 newly eligible.

- **2026-10-20** — Committed207dad5 and pushed; stacked draft PR https://github.com/Shumail-AbdulRehman/PRIV/pull/44 (base22/PR42). Issue43 remains open for human review/merge. Final focused55 pass, validator zero errors/two documented warnings. Git status matches original preserved dirty/untracked list. Next25 unstarted.
