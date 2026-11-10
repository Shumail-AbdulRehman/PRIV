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

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` passes and proves the three FIX-1 cases above. [unit]
- [x] `cd backend && npx vitest run src/services/login.service.test.ts` passes and proves the code appears only after a correct password. [unit]
- [x] `npm test --prefix backend` and `npm test --prefix frontend` pass with 0 failures; real counts in the Log. [unit]
- [x] `HYGENE_E2E_DATABASE_URL=<isolated URL> npm run test:e2e --prefix frontend` passes with 0 failures and no `fixme` left in the two owned test files. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json`, `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]

## Log

### 2026-11-10 — Scoped end-to-end bug fixes

Implemented FIX-1 through the existing `useCheckoutSession.changePlan` action. Continue on the plan page carries a validated selection in router state only when it differs from the saved draft. The payment page waits until replacement is allowed and both controller locks are idle, consumes the history request once and replaces that entry with cleared state before invoking the action. Saved drafts still override plain URL selections; the prepared replacement supplies the summary and frame. Paid drafts retain the existing confirmation route. Unit coverage includes StrictMode, pending/locked states, URL tampering, reload/Back, changed interval, unchanged selection and confirmation.

Implemented FIX-2 with the existing `ApiError.errors` shape: `ACCOUNT_DEACTIVATED` appears only after a matching password, for owners, managers and staff. Unknown email and incorrect passwords remain generic; route tests also assert no cookies or session writes. FIX-3 exposes `Retry-After` alongside `X-Request-Id` through the existing CORS configuration.

Enabled all three browser regressions and removed their FIX labels. Strengthened S42-24 with the chosen plan/interval, reload and Back/Forward checks. The controlled 429 now copies the actual running API's exposed-header policy from a harmless support request: Playwright fulfillment otherwise bypasses CORS middleware. Its exact numeric wait assertion remains unchanged.

**Test-only exception:** `backend/src/routes/launch.route.test.ts`, “wires proxy validation before middleware and uses the guarded Express 5 listen callback”, updates only the expected exposed-header list to include `Retry-After`; the `X-Request-Id`, proxy-order and guarded-listen checks remain intact. No application code outside Owns was changed. No inventory, tracker, context, issue or PR changes were made under this run's file-scope restriction.

Final verification (all exit 0):

- `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx src/pages/Subscription/onboarding/BillingPlanPage.test.tsx`: **94 passed, 0 failed, 0 skipped**, 2 files.
- `cd backend && npx vitest run src/services/login.service.test.ts`: **45 passed, 0 failed, 0 skipped**, 1 file.
- `npm test --prefix backend`: **2,543 passed, 0 failed, 7 skipped**, 113 passed files and 1 skipped file. Existing launch-persistence SQL tests remain disabled because they require another database, which this run does not use.
- `npm test --prefix frontend`: Node **96 passed, 0 failed, 0 skipped**; Vitest **2,347 passed, 0 failed, 0 skipped**, 60 files.
- `cd backend && npx tsc --noEmit -p tsconfig.json`, `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend`: **0 errors, 0 warnings**. Lint also passed again after the final E2E fixture edit.
- `npm run build --prefix backend` and `npm run build --prefix frontend`: both passed. Existing nonfatal notices: Prisma's upgrade advisory, the frontend Node suite's mobile-translation module-type warning and Vite's plugin-timing advisory. No out-of-scope configuration was changed to suppress them.

The first focused frontend run had **92 passed, 1 failed** because the new data-router test reused an unchanged route element while changing its mock; correcting that new test's rerender harness produced the final 94-pass run. Initial full unit attempts running alongside compiler/lint processes were interrupted (exit 143) after frontend assertion timeouts under resource contention; no complete totals were claimed for those attempts. The final full unit commands passed with bounded CPU affinity (`taskset -c 0,1` for backend, `taskset -c 2,3` for frontend), without editing the affected existing UI tests.

Every non-E2E verification command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. Additional persistence/CI database variables were unset for full unit runs. A temporary Node preload outside the repository prevents private `.env` reads by Vite and propagates that protection and `/dev/null` dotenv settings into child processes. The E2E command alone uses the supplied approved `HYGENE_E2E_DATABASE_URL`; its managed runner creates, migrates and drops only disposable isolated child databases. No secret was printed, real Paddle called, application database used, unrelated migration run, deployment performed or git commit/merge/push/branch command run. Real Paddle payments remain outside this fix spec.

`HYGENE_E2E_DATABASE_URL=<supplied approved isolated bootstrap> npm run test:e2e --prefix frontend` (bounded to CPUs 4–7): **195 passed, 0 failed, 0 flaky, 1 skipped**, **196 discovered**, **15.4 minutes**, exit **0**, headless with retries **0**. The sole skip is the pre-existing “local platform email/password grants metadata access only and logout revokes it” case, whose optional local-platform mode is not enabled. All three restored regressions passed. The two owned E2E files contain no `fixme` or FIX labels. E2E compilation passed, and its build emitted the same Vite advisory; the running backend emitted the existing pg concurrent-query deprecation warning. Real Paddle/card runs were neither performed nor counted.

After the complete E2E command exited successfully and its runner cleaned up the disposable database, restored generated tracked screenshots/JSON evidence with `git checkout -- docs/implementation`. Final scope inspection and `git diff --check` passed. Only the nine owned application/test files, the single named test-only exception and this document's checklist/Log were changed. No other real application bug was found, and no scoped part remains blocked.
