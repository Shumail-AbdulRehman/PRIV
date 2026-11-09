# Spec 36 — Assemble the lifecycle service

**Status:** Not started
**Depends on:** Spec 10, Spec 26
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/billingLifecycle.service.test.ts`, `specs-saas-onboarding/inventory/36-lifecycle-assembly.md`
**Reuses:** `backend/src/services/billingOnboardingStep.ts` (spec 10), `backend/src/services/billingCatalog.service.ts` (spec 15), `backend/src/services/billingCheckout.service.ts` (spec 26), `backend/src/services/billingReservations.service.ts` (spec 09)

## Goal

Remove the moved code from the old service and make the lifecycle read return the next step.

## Scope

- Delete logic now in specs 09, 15, 17 and 26. Re-export public functions so existing imports keep working.
- Gather facts and call `billingOnboardingStep`.
- Keep all current fields, the portal function and sandbox email exception.
- The read stays local: no Paddle call, except the configuration check.
- A paid mirror transaction with no access yet maps to `CONFIRMING`.

## Explicit non-scope

- Route wiring → spec 39.
- Reconciliation → spec 28.

## Reuse first

- Do not reintroduce moved logic.

## Steps

1. Replace bodies with imports.
2. Add the step.
3. Port tests to the new modules where they moved, keeping coverage.
4. Confirm with a search that no duplicate logic remains.
5. Record what you created in `specs-saas-onboarding/inventory/36-lifecycle-assembly.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/billingLifecycle.service.test.ts` passes and proves: each server state returns the right step and reason; no provider call during a read; portal behaviour unchanged. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/36-lifecycle-assembly.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
