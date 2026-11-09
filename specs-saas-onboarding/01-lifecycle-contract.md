# Spec 01 — Billing lifecycle and outcome contract

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/types/billingLifecycle.ts`, `frontend/src/pages/Subscription/types.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.test.tsx`, `specs-saas-onboarding/inventory/01-lifecycle-contract.md`
**Reuses:** `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `ARCHITECTURE.md#lifecycle-dto-additions`

## Goal

Define the owner-safe data shapes every later billing spec builds against, on both server and client, with free-trial fields removed.

## Scope

- Add `onboardingStep` and `recoveryReason` to the lifecycle DTO with exactly the values in `ARCHITECTURE.md`.
- Add the confirm result (`ACTIVE`, `PROCESSING`, `NOT_PAID`, `NO_CHECKOUT`) and reconcile result (`RESUMABLE`, `CLEARED`, `IN_PROGRESS`, `PAID`, `UNRESOLVED`, `CONFLICT`), each carrying a fresh lifecycle.
- Add `replaced` to the checkout result.
- Mark `trialPeriod` optional and deprecated on the catalog DTO on both sides. New code never sets or reads it. It stays optional because screens not yet rebuilt still reference it and every spec must keep the build green. Spec 43 confirms it has no readers.
- Extend the strict client parser. An unknown step or outcome is rejected, and a missing `onboardingStep` is treated as a failed read, not as permission.

## Explicit non-scope

- Deriving the step on the server → spec 10.
- Mapping steps to routes → spec 06.
- HTTP wiring of confirm and reconcile → spec 39.

## Reuse first

- Extend `billingContract.ts`. Do not add a second parser.
- No DTO may carry a raw Paddle error, email or another tenant identifier.

## Steps

1. Read the existing DTOs, parser and their tests.
2. Add the new fields and outcome types on the backend.
3. Mirror them in `types.ts` and the parser, using its existing strict helpers.
4. Make `trialPeriod` optional and deprecated. The parser ignores it and always returns no trial, so a rolling deploy cannot break the page.
5. Update parser tests.
6. Record what you created in `specs-saas-onboarding/inventory/01-lifecycle-contract.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run frontend/src/pages/Subscription/onboarding/billingContract.test.tsx` passes and proves: every step and outcome parses; unknown values, wrong company and a missing step are rejected; a leftover `trialPeriod` is ignored. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/01-lifecycle-contract.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json`, `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]
