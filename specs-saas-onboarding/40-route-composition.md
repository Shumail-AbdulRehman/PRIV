# Spec 40 — Routes and workspace entry

**Status:** Not started
**Depends on:** Spec 23, Spec 29, Spec 30, Spec 33, Spec 35, Spec 37, Spec 38
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`, `frontend/src/pages/Subscription/onboarding/billingRoutes.tsx`, `frontend/src/pages/Subscription/onboarding/billingRoutes.test.tsx`, `frontend/src/components/onboarding/WorkspaceGate.tsx`, `frontend/src/components/onboarding/WorkspaceGate.test.tsx`, `frontend/src/pages/Onboarding/FlowEntry.tsx`, `frontend/src/pages/Onboarding/FlowEntry.test.tsx`, `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `frontend/src/pages/Subscription/onboarding/billingViewState.test.tsx`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.test.tsx`, `frontend/src/pages/Subscription/onboarding/useBillingCheckout.ts`, `frontend/src/pages/Subscription/onboarding/useBillingCheckout.test.tsx`, `frontend/src/pages/Subscription/queries.ts`, `frontend/src/pages/Subscription/queries.test.tsx`, `frontend/tests/onboarding.test.mjs`, `specs-saas-onboarding/inventory/40-route-composition.md`
**Reuses:** `frontend/src/pages/Onboarding/onboardingRoutes.ts` (spec 06), `ARCHITECTURE.md#lifecycle-dto-additions`

## Goal

Connect every screen so each user always lands on the correct step.

## Scope

- `/continue` reads the lifecycle and sends an owner to the route for `onboardingStep`, honouring a safe `from` when the step is `WORKSPACE`.
- An error or a `null` step there shows retry, never a wrong page and never access.
- Direct visits to any setup route redirect to the right step, without loops.
- Keep `/welcome` as an alias to activation for old links.
- Unpaid owners deep-linking to the dashboard go to their step. Managers, and owners with historical access, keep their current behaviour.
- Subscribed owners at `/subscription` keep the settings page.
- Keep the payment page mounted during background refetch.
- Remove the `setup` variant from `BillingSetupLayout`, keeping `settings`.
- Use `onboardingStep` throughout `billingViewState`, keeping what `BillingAccountPage` needs.
- Delete the old `useBillingCheckout.ts`, its tests, and the unused `poll` option in `queries.ts`, now that nothing uses them.

## Explicit non-scope

- Screens → spec 37.
- `GuestRoute` → spec 23.

## Reuse first

- Use the single route map. Do not add path decisions elsewhere.

## Steps

1. Add `FlowEntry`.
2. Simplify `SubscriptionPage`.
3. Update `WorkspaceGate`.
4. Remove the old variant, hook and poll.
5. Test the matrix of step by route, including back and reload.
6. Record what you created in `specs-saas-onboarding/inventory/40-route-composition.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Onboarding/FlowEntry.test.tsx src/components/onboarding/WorkspaceGate.test.tsx src/pages/Subscription/SubscriptionPage.test.tsx src/pages/Subscription/onboarding/billingRoutes.test.tsx` passes and proves: every step and route pair resolves without a loop; a session error shows retry; managers and past subscribers keep access; subscribers keep settings. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/40-route-composition.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]


## Log

### 2026-11-10

- Implemented `/continue` with a fresh, owner-scoped lifecycle read, the shared step-to-route map, and allowlisted `state.from` only after an authorized `WORKSPACE` step. Failed reads, null/missing steps, foreign identities and inconsistent payment/workspace facts show retry without granting access. Session restoration and GuestRoute remain unchanged.
- Replaced legacy route inference with server-step composition. Setup URLs resolve without loops; `/welcome` aliases activation. Allowlisted selections can advance to payment or change an unpaid plan. An in-app payment-to-activation transition can request server confirmation while lifecycle catches up; it never grants workspace access. Ready retains its explicit workspace action.
- Added a fresh lifecycle read on pathname changes so a successful reconciliation cannot be redirected back by an old cached step. Background refetches, query-string updates and language changes retain the payment target/controller. Established subscribers keep settings at `/subscription`, including restricted subscribers; unknown onboarding subscriptions continue confirmation. Managers/staff and historical subscriber reads retain their existing behavior; restrictions and failed checks never mount operational children.
- Removed BillingSetupLayout's setup variant, the obsolete overlay `useBillingCheckout.ts` and its tests, and the unused lifecycle/subscription polling options. Confirmation polling remains with `useCheckoutConfirmation`. Wrote and inspected `inventory/40-route-composition.md`.
- **Test-only scope exception:** updated `frontend/src/pages/Subscription/onboarding/BillingPlanPage.test.tsx`. Its shared new-owner fixture now supplies `CHOOSE_PLAN`. The tests “uses the saved draft before Starter, lets URL override it and announces replacement”, “loads the draft selection and permits changing both plan and interval”, and “falls back independently to the draft when one URL field is invalid” now supply `PAYMENT` with their saved draft. “preserves restriction and unresolved-payment gates” now supplies `RECONCILE`. These are the server steps replacing the removed legacy inference; all original assertions remain. No application file outside Owns changed.
- **Final verification**, with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`:
  - `cd frontend && npx vitest run src/pages/Onboarding/FlowEntry.test.tsx src/components/onboarding/WorkspaceGate.test.tsx src/pages/Subscription/SubscriptionPage.test.tsx src/pages/Subscription/onboarding/billingRoutes.test.tsx`: **199 passed**, 4 files, 0 failures/skips. Includes all 9 steps × 7 entry/setup URLs, reload/back, deep links, retry/session failure, safe return paths, owner isolation, historical access, subscriber settings, repaired recovery navigation, and real mocked-Paddle target continuity.
  - `npm test --prefix frontend`: **96 Node tests + 2,342 Vitest tests passed** (60 Vitest files), 0 failures/skips. Earlier runs exposed obsolete fixtures and a transient existing launch-route timeout; the final complete rerun passed without changing that launch-route test.
  - `cd frontend && npx tsc -b --noEmit`: passed, **0 errors/warnings**.
  - `npm run lint --prefix frontend`: passed, **0 errors/warnings**.
  - `npm run build --prefix frontend`: passed. The existing Rolldown `PLUGIN_TIMINGS` advisory remains; the Node suite also reports the existing mobile translation module-type advisory. Neither requires changing a file in this spec.
  - Inventory fragment inspected and `git diff --check` passed.
- Verification used synthetic API/Paddle mocks and in-memory query caches. No real Paddle, application database, browser end-to-end suite, migration, deployment, issue/PR, commit, merge, push or branch command ran. Backend/mobile verification and real browser/provider verification are outside this spec. Status and PROGRESS were left unchanged for the runner.
