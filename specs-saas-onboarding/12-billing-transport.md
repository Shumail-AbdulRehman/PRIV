# Spec 12 — Time-limited billing requests

**Status:** Not started
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/api.test.tsx`, `frontend/src/pages/Subscription/onboarding/billingRequest.ts`, `frontend/src/pages/Subscription/onboarding/billingRequest.test.tsx`, `specs-saas-onboarding/inventory/12-billing-transport.md`
**Reuses:** `frontend/src/api/client.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.ts` (spec 01), `ARCHITECTURE.md#time-limits`

## Goal

Make every billing request end within a known time and report whether it failed before or after being sent.

## Scope

- A deadline helper that composes a caller abort with a timeout.
- Apply read, confirm, reconcile and prepare limits from `ARCHITECTURE.md`.
- Add `confirmBillingCheckout` and `reconcileBillingCheckout` transport functions.
- Classify a failure as `not_sent`, `timed_out_after_send`, `server` with status and code, or `offline`.
- POST requests are never retried automatically.

## Explicit non-scope

- Polling → spec 22.
- Global Axios defaults → spec 23.

## Reuse first

- Keep using the shared `client`. Do not set a global timeout.
- Parse with spec 01's contract.

## Steps

1. Build the helper.
2. Apply it to each billing function.
3. Add the two new calls.
4. Test hung requests, caller abort and classification.
5. Record what you created in `specs-saas-onboarding/inventory/12-billing-transport.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/billingRequest.test.tsx` passes. [unit]
- [ ] `cd frontend && npx vitest run src/pages/Subscription/api.test.tsx` passes and proves: a never-settling request ends at its limit; caller abort wins; a POST is sent once; new endpoints parse strictly. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/12-billing-transport.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
