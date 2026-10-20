# Spec 11 — Workforce transfer and offboarding API

**Status:** Not started
**Depends on:** Spec 10
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/workforceLifecycle.service.ts`, `backend/src/services/workforceLifecycle.service.test.ts`, `backend/src/routes/workforceLifecycle.route.ts`, `specs/inventory/11-workforce-lifecycle-api.md`
**Reuses:** `backend/src/services/verification-v2/retention.service.ts`, `backend/src/services/taskAssignment.service.ts`

## Goal

Workforce transfer and offboarding API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

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

- [ ] `npm test --prefix backend -- src/services/workforceLifecycle.service.test.ts` passes: Cross-site/tenant rejected; open-shift transfer conflicts; offboarded staff cannot refresh, receive eligible work or submit stale captures. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
