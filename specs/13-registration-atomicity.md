# Spec 13 — Atomic company registration

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/companyRegistration.service.ts`, `backend/src/services/companyRegistration.service.test.ts`, `backend/src/controllers/companyRegistration.controller.ts`, `specs/inventory/13-registration-atomicity.md`
**Reuses:** `backend/src/controllers/manager.controller.ts`, `backend/src/validations/manager.validation.ts`

## Goal

Atomic company registration in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Transact Company and first ADMIN owner using existing bcrypt and signup validation. Reject role/plan/operator claims. Map duplicate concurrent registrations safely. Keep successful persistence separate from post-creation session delivery. Route signup to new handler in spec 26.

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

- [ ] `npm test --prefix backend -- src/services/companyRegistration.service.test.ts` passes: Failure creates neither orphan company nor owner; duplicate race has one owner; client cannot select role/company entitlement. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
