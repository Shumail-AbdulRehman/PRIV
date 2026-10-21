# Spec 26 — Wire launch backend routes and policies

**Status:** Done
**Depends on:** Spec 07, Spec 11, Spec 12, Spec 14, Spec 15, Spec 16, Spec 17, Spec 18, Spec 20, Spec 21, Spec 22, Spec 23, Spec 24, Spec 25
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #53
**Owns:** `backend/src/routes/verification.route.ts`, `backend/tests/launchPhoto.integration.ts`, `backend/src/controllers/taskInstance.guided.test.ts`, `backend/src/services/verification-v2/authorization.service.test.ts`, `backend/src/services/verification-v2/staffSubmission.service.test.ts`, `backend/src/utils/syncAttendanceWindow.test.ts`, `backend/src/services/taskAssignment.service.test.ts`, `backend/src/services/verification-v2/jobQueue.failure.test.ts`, `backend/src/services/verification-v2/pipeline.persistence.test.ts`, `backend/src/services/verification-v2/sequentialPipeline.test.ts`, `backend/src/services/verification-v2/spatialPipeline.test.ts`, `backend/src/services/workforceLifecycle.service.test.ts`, `backend/src/services/accountAccess.service.ts`, `backend/src/services/accountAccess.service.test.ts`, `backend/src/routes/companySettings.route.ts`, `backend/src/routes/attendanceAnnotation.route.ts`, `backend/src/utils/syncAttendanceWindow.ts`, `backend/src/services/staff-notifications/worker.service.ts`, `backend/src/services/staff-notifications/reminders.service.ts`, `backend/src/services/verification-v2/completion.service.ts`, `backend/src/services/verification-v2/pipeline.service.ts`, `backend/src/routes/common.route.ts`, `backend/src/services/verification-v2/staffSubmission.service.ts`, `backend/src/routes/launch.route.ts`, `backend/src/routes/launch.route.test.ts`, `specs/inventory/26-launch-api-composition.md`, `backend/src/app.ts`, `backend/src/middlewares/auth.middleware.ts`, `backend/src/middlewares/auth.middleware.test.ts`, `backend/src/controllers/common.controller.ts`, `backend/src/controllers/common.session.test.ts`, `backend/src/routes/ownerIdentity.route.ts`, `backend/src/routes/billingLifecycle.route.ts`, `backend/src/routes/subscription.route.ts`, `backend/src/routes/credentialHandoff.route.ts`, `backend/src/services/credentialHandoff.service.ts`, `backend/src/services/credentialHandoff.service.test.ts`, `backend/src/controllers/manager.controller.ts`, `backend/src/controllers/staff.controller.ts`, `backend/src/controllers/location.controller.ts`, `backend/src/controllers/taskInstance.controller.ts`, `backend/src/services/attendanceWrites.service.ts`, `backend/src/services/attendanceWrites.service.test.ts`, `backend/src/routes/staff.route.ts`, `backend/src/routes/location.route.ts`, `backend/src/routes/taskTemplate.route.ts`, `backend/src/routes/assignment.route.ts`, `backend/src/routes/area.route.ts`, `backend/src/routes/attendance.route.ts`, `backend/src/routes/workforceLifecycle.route.ts`, `backend/src/services/verification-v2/authorization.service.ts`, `backend/src/services/verification-v2/inventorySnapshot.service.ts`, `backend/src/services/verification-v2/jobQueue.service.ts`, `backend/src/cron/startupCron.ts`, `backend/src/cron/attendanceCron.ts`, `backend/src/cron/attendanceStatusCron.ts`, `backend/src/cron/taskStatusCron.ts`, `backend/src/services/taskAssignment.service.ts`, `backend/src/services/verification-v2/deadline.service.ts`, `backend/src/services/launchJobs.service.ts`, `backend/src/services/launchJobs.service.test.ts`, `backend/tests/launchComposition.integration.ts`, `docs/implementation/API_COMPOSITION.md`
**Reuses:** `backend/src/controllers/subscription.controller.ts`, `backend/src/routes/subscription.route.ts`, `backend/src/services/paddleFulfillment.service.ts`, `backend/src/controllers/assignment.controller.ts`, `backend/src/services/verification-v2/retention.service.ts`, `backend/src/app.ts`, `backend/src/routes/staff.route.ts`, `backend/src/routes/attendance.route.ts`

## Goal

Wire launch backend routes and policies in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Preserve21 `launchQualification` guards in direct and buffered PHOTO paths: active adapter lacks privacy/identity qualification, so new processing is unavailable before provider/storage; completed result reconciliation remains available. Do not bypass with deployment flags, synthetic data or historical release records. Real representative consented privacy qualification remains an external release gate.


Preserve20 policy wiring in `backend/src/services/verification-v2/staffSubmission.service.ts`, `backend/src/services/verification-v2/captureSession.service.ts` and `backend/src/services/verification-v2/sequentialCapture.service.ts` when integrating capture/account authorization; no receipt, waiver or failed-view generation bypass.


Mount `backend/src/routes/ownerIdentity.route.ts` at `/api/owner-identity`; public POST capability/request endpoints remain outside operational entitlement gates. Replace ordinary owner status/email-request auth with explicit own-security adapter permitting active owners of inactive/suspended companies; preserve epoch/forced-password checks and operator denial. No GET token consumption; unknown credential errors stay sanitized.


Mount `backend/src/routes/platformSupport.route.ts` default router at `/api/platform/service` outside tenant auth; mount its named customerSupportRouter at `/api/support` for public configuration-only contact availability. Never expose inquiry/audit/diagnostics through the public contact router.


Mount `backend/src/routes/attendanceAnnotation.route.ts` under `/api/attendance` for GET/POST `/:attendanceId/annotations`; preserve its tenant authentication, historical scope, no-store and immutable request-id contract.


Mount `backend/src/routes/companySettings.route.ts` at `/api/company/settings` under its tenant-owner authentication, with no operator promotion or company ID input.


Mount `backend/src/routes/platformCompany.route.ts` at `/api/platform/companies` outside tenant JWT composition; it applies its own separate operator verification and no-store headers. Preserve metadata-only DTOs and versioned operational status mutations.


Consume14 read/manage/start/completion policy at concrete handlers and jobs. Capacity creates must use the provided transaction. Record work entitlement in the same staff/task-locked transaction that wins a start/check-in; completion uses persisted exact-work grant, never request timestamps. Existing legacy starts without a grant stay unproven when unentitled.

Mount every new launch route behind correct audience/policy and replace superseded legacy handlers. Explicitly amend ownership for earlier route/app files at this serialized wiring boundary before edits. No dynamic route discovery. Ensure login/recovery/billing/support remain reachable under D01 and operational jobs consume same account policy. Normalize known upload/schema/conflict errors without stack leakage.

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

- [x] `npm test --prefix backend -- src/routes/launch.route.test.ts` passes: Route denial matrix proves anonymous/tenant/operator isolation and all new APIs reachable; legacy insecure routes removed. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-21** — Claimed issue53, implementation/spec-26-api-composition base21/PR52 atf265636. All dependencies Done. Amended14/15/17 direct edges for actual policy/billing/credential route consumption. Serialized existing-file ownership transferred from prior owners before editing; existing unowned controllers/jobs explicitly claimed. User dirty manager.route.ts is deliberately not edited/staged. Actual mounts use explicit audiences; no dynamic discovery or method-derived account-action policy.

- **2026-10-21** — Complete: explicit owner/operator/support/settings/annotation/common/billing mounts; tenant role/epoch/forced-password preserved, ordinary operations suspended. Active people retain own security/atomic refresh while billing exception is owner-only (active manager legacy summary retained). Manager PATCH cannot replace another account password. Concrete management/annotation gates and transactional capacity callbacks wired; staff site scope rechecked inside capacity transaction. Winning task start/check-in persists one exact grant atomically; grant failure rolls back clock. Capture/submission/finalization require exact own-work grant after expiry, including internal submitted-job completion. Existing20 immutable receipt/replacement proof passes under synthetic qualified billing;21 remains safe-disabled before AI/storage and capabilities/manifests disable new capture actions. Generation/attendance preparation/assignment/deadline/notification/verification jobs consume account policy; startup's unguarded attendance bulk creation removed. Runtime initialization remains first import and raw webhook order preserved. Unknown errors sanitized without credential logging.
- **2026-10-21** — Verification:215 focused tests across9 files; whole backend1413 tests/92 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build pass. Isolated launchComposition SQL proof passes actual controller start/check-in/capacity races, one winning grant, failed-audit rollback, expired pre-storage/preparation denial, proven vs legacy completion and suspended own-password epoch. Isolated launchPhoto regression passes all20 immutable-generation/waiver/receipt assertions. Strict integration tsc recorded separately. Initial synthetic task fixture needed existing v2 snapshot/policy fields; failure-injection fixture switched from unsupported Prisma transaction spread to a read proxy, preserving production code. Earlier missing policy fixture mocks updated explicitly; active policy and SQL boundary tests use real guards. Validator42 specs/zero errors/four documented warnings; actual direct14/15/17/24 consumptions retained. Logs /tmp/hygene-spec26-{focused,tests,type,build,integration,integration-type,photo-regression}.log. Existing non-failing pg concurrent-query deprecation remains in20 regression, not a new dependency upgrade. No schema, deployment, production or live-provider mutation. Existing user dirty CI/package/manager-performance/dashboard/design files preserved and excluded. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/53; draft PR follows publication. Next28 eligible; continue without routine stop.

- Published26 implementation7368750 in stacked draft PR54: https://github.com/Shumail-AbdulRehman/PRIV/pull/54 (base21/PR52); all checks including strict standalone integration TypeScript pass, issue53 remains open for human review. Continue28.

- **2026-10-21** — Detail-read ownership of verificationException.route.ts transferred to36 for qualified replacement explanation. Existing write mounts/auth/policy unchanged;36 tests authorized read/denial and preserved replacement guards.
