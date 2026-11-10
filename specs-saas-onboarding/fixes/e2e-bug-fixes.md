# Fixes — Bugs found by the end-to-end suite

**Depends on:** Spec 42
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPlanPage.test.tsx`, `backend/src/services/login.service.ts`, `backend/src/services/login.service.test.ts`, `backend/src/app.ts`, `frontend/e2e/billing-onboarding.spec.ts`, `frontend/e2e/saas-onboarding.spec.ts` 
**Reuses:** `frontend/src/pages/Subscription/onboarding/useCheckoutSession.ts` (spec 21), `specs-saas-onboarding/42-e2e-suite.md`

## Goal

Fix the three application bugs spec 42 recorded as FIX-1, FIX-2 and FIX-3, and turn their `fixme` tests back on.

## Scope

- **FIX-1, change plan before paying.** Choosing a different plan while an unpaid draft exists must cancel the old draft and show one new draft for the chosen plan. Today the payment page prefers the saved draft and never replaces it.
  - The plan page passes an explicit change request in router location state, never in the URL. A URL alone must stay ignored once a draft exists, so a tampered link changes nothing.
  - The payment page uses the existing `changePlan` action once, when the state machine allows it, and then clears the request so a reload or Back cannot replace the draft again.
  - The order summary and card form show the new plan. If the server reports the old draft was paid, the existing route to confirming still applies.
- **FIX-2, deactivated sign-in.** After a correct password on a deactivated account, the 403 carries the code `ACCOUNT_DEACTIVATED` that `LoginPage` already reads. Unknown email and wrong password stay generic and never reveal this.
- **FIX-3, rate-limit wait.** The API's CORS settings expose `Retry-After`, so the browser can show the real wait. Keep `X-Request-Id` exposed.

## Explicit non-scope

- Real Paddle payments → spec 42's open item.
- The checkout state machine and server replacement logic, which already work → no change.
- Any other screen or rule change → spec 43 records it.

## Reuse first

- Use `changePlan` from `useCheckoutSession`. Do not add a second replace path.
- Use the existing `ApiError` shape for the code.

## Steps

1. Fix FIX-3 and FIX-2, with unit tests.
2. Fix FIX-1, with unit tests for: the change request replaces once; a plain URL does not; reload does not replace again.
3. Remove the three `test.fixme` lines and the FIX labels. Do not weaken those tests.
4. Run the whole suite.
5. Add a dated Log to this document with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` passes and proves the three FIX-1 cases above. [unit]
- [ ] `cd backend && npx vitest run src/services/login.service.test.ts` passes and proves the code appears only after a correct password. [unit]
- [ ] `npm test --prefix backend` and `npm test --prefix frontend` pass with 0 failures; real counts in the Log. [unit]
- [ ] `HYGENE_E2E_DATABASE_URL=<isolated URL> npm run test:e2e --prefix frontend` passes with 0 failures and no `fixme` left in the two owned test files. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json`, `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]

## Log
