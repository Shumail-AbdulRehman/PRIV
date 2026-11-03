# Spec 11 — Workforce transfer and offboarding API

**Status:** Done
**Depends on:** Spec 09, Spec 10
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #31
**Owns:** `backend/src/controllers/assignment.controller.ts`, `backend/src/services/verification-v2/retention.service.ts`, `backend/src/services/workforceLifecycle.service.ts`, `specs/inventory/11-workforce-lifecycle-api.md`
**Reuses:** `backend/src/services/verification-v2/retention.service.ts`, `backend/src/services/taskAssignment.service.ts`

## Goal

Workforce transfer and offboarding API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Consume09 attendance write CAS; serialize its final write with the workforce staff lock so a concurrent check-in cannot bypass open-shift transfer denial. Connect existing transfer/archive/delete entry points to reasoned non-destructive lifecycle behavior.

Expose scoped deliberate deactivate/archive and transfer/handover with reason and impact. Reject open checked-in-shift transfer; require manager-created staff site assigned to manager. Revoke credentials/push, cancel future eligibility and preserve original history using existing assignment transactions/epochs. No general restore/public owner mutation.

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

- [x] `npm test --prefix backend -- src/services/workforceLifecycle.service.test.ts` passes: Cross-site/tenant rejected; open-shift transfer conflicts; offboarded staff cannot refresh, receive eligible work or submit stale captures. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue31. Explicit ownership transfer from03/05/09/13 for existing live entry points; no pre-existing user dirty files claimed. Preserve original attendance/evidence and completed/submitted tasks. No production database action.
- **2026-10-20** — Complete:39 new lifecycle/rescheduling tests,76 targeted/927 whole backend tests (81 files, isolated PG enabled, no skips), build/typechecks pass. Actual isolated PG proves upload/transfer race, checked-in denial, original recorded attendance and completed/submitted work preservation, private capture/epoch+session/push revocation, legacy delete/archive adapters, manager edit credential revocation and idempotent deactivation/site handover. No production records touched.
- **2026-10-20** — API: transfer requires `{reason,expectedLocationId}`; deactivation requires `{reason}`. New workforce routes and old transfer/delete/archive use same service. Current unrecorded/unelapsed ABSENT window may follow a transfer; recorded/evidence-bearing/elapsed attendance stays original. Return READY/RECORDED_SHIFT/NO_SHIFT honestly. Legacy frontend reason inputs remain31; old permanent workforce deletion is no longer exposed.

- **2026-10-21** — Serialized composition ownership transferred to26: `backend/src/app.ts`, `backend/src/controllers/staff.controller.ts`, `backend/src/controllers/manager.controller.ts`, `backend/src/services/attendanceWrites.service.ts`, `backend/src/services/attendanceWrites.service.test.ts`, `backend/src/routes/workforceLifecycle.route.ts`. Prior completed behavior retained;26 consumes rather than reimplements this contract.

- **2026-10-21** — Serialized job/attendance preparation ownership transferred to26; active policy integration only.

- **2026-10-21** — Serialized affected unit-fixture ownership transferred to26 to preserve lower-level contracts under new explicit account-policy seams.
