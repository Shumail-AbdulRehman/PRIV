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

- [ ] `cd frontend && npx vitest run frontend/src/pages/Onboarding/FlowEntry.test.tsx src/components/onboarding/WorkspaceGate.test.tsx src/pages/Subscription/SubscriptionPage.test.tsx frontend/src/pages/Subscription/onboarding/billingRoutes.test.tsx` passes and proves: every step and route pair resolves without a loop; a session error shows retry; managers and past subscribers keep access; subscribers keep settings. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/40-route-composition.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
