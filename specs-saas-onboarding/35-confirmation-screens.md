# Spec 35 — Confirming and ready screens

**Status:** Not started
**Depends on:** Spec 03, Spec 04, Spec 22
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingActivationPage.test.tsx`, `specs-saas-onboarding/inventory/35-confirmation-screens.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts` (spec 22), `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03)

## Goal

Show honest progress while the server confirms the subscription, then a clear success with explicit entry to the workspace.

## Scope

- Three rows: Payment received, Activating your subscription, Preparing your workspace. Each tick reflects a real fact.
- At 20 seconds show the "taking a little longer" notice. At 120 seconds show "please don't pay again" and Check again.
- Ready shows the stamp, plan, interval, next payment date and "Open your workspace".
- Only server `WORKSPACE` shows Ready. Paddle's browser event never does.
- Reloading this page resumes correctly.
- Denied shows sign in again. Restricted shows the restriction.
- `NOT_PAID` returns to payment. `NO_CHECKOUT` returns to the plan page.
- Announce changes with `role=status`.

## Explicit non-scope

- Polling logic → spec 22.
- The dashboard → spec 40.

## Reuse first

- Use the confirmation hook.
- Do not derive anything from the URL.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Map hook states to the design.
3. Add the stamp with reduced-motion handling.
4. Test each state.
5. Record what you created in `specs-saas-onboarding/inventory/35-confirmation-screens.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingActivationPage.test.tsx` passes and proves: slow and timeout states; Ready only from server facts; reload resumes; NOT_PAID and NO_CHECKOUT redirect; reduced motion; restricted never shows Ready. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/35-confirmation-screens.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
