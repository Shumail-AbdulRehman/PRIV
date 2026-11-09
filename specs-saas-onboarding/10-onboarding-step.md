# Spec 10 — Server next-step decision

**Status:** Not started
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/billingOnboardingStep.ts`, `backend/src/services/billingOnboardingStep.test.ts`, `specs-saas-onboarding/inventory/10-onboarding-step.md`
**Reuses:** `ARCHITECTURE.md#lifecycle-dto-additions`, `backend/src/types/billingLifecycle.ts` (spec 01)

## Goal

Write the pure function that decides the owner's next step from server facts, so every screen and redirect agrees.

## Scope

- Inputs are plain facts already computed by the lifecycle read. No I/O and no clock.
- Follow the first-match order in `ARCHITECTURE.md` exactly.
- Set `recoveryReason` for `UNAVAILABLE` and `RECONCILE`.
- A price with a trial yields `UNAVAILABLE` with `PRICE_NOT_READY`.

## Explicit non-scope

- Gathering the facts → spec 36.
- Client routing → spec 06.

## Reuse first

- Use the DTO types from spec 01.

## Steps

1. Define the input type.
2. Implement the ordered decision.
3. Table-test every row and each priority conflict, such as suspended and paid at once.
4. Record what you created in `specs-saas-onboarding/inventory/10-onboarding-step.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/billingOnboardingStep.test.ts` passes and proves: every row of the table, and suspension beats payment, paid-pending beats a resumable draft, and an expired subscriber goes to ACCOUNT. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/10-onboarding-step.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
