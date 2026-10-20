# Spec 26 — Wire launch backend routes and policies

**Status:** Not started
**Depends on:** Spec 07, Spec 11, Spec 12, Spec 16, Spec 18, Spec 20, Spec 21, Spec 22, Spec 23, Spec 24, Spec 25
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/routes/launch.route.ts`, `backend/src/routes/launch.route.test.ts`, `backend/src/routes/manager.route.ts`, `specs/inventory/26-launch-api-composition.md`
**Reuses:** `backend/src/controllers/subscription.controller.ts`, `backend/src/routes/subscription.route.ts`, `backend/src/services/paddleFulfillment.service.ts`, `backend/src/controllers/assignment.controller.ts`, `backend/src/services/verification-v2/retention.service.ts`, `backend/src/app.ts`, `backend/src/routes/staff.route.ts`, `backend/src/routes/attendance.route.ts`

## Goal

Wire launch backend routes and policies in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

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

- [ ] `npm test --prefix backend -- src/routes/launch.route.test.ts` passes: Route denial matrix proves anonymous/tenant/operator isolation and all new APIs reachable; legacy insecure routes removed. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
