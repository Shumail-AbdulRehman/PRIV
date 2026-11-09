# Spec 38 — Recovery screen

**Status:** Not started
**Depends on:** Spec 03, Spec 04, Spec 12
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx`, `specs-saas-onboarding/inventory/38-recovery-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Subscription/api.ts` (spec 12), `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03)

## Goal

Explain any billing problem with its reason and one next action, and repair stuck checkouts automatically.

## Scope

- On arrival with `RECONCILE`, call reconcile once and show "Checking your previous checkout".
- Outcomes: `RESUMABLE` to payment, `CLEARED` to plan, `PAID` to activation, `IN_PROGRESS` waits and retries, `UNRESOLVED` shows Check again, `CONFLICT` shows the email message with support and sign up with another email.
- `BILLING_DISABLED` and `PRICE_NOT_READY` show payments unavailable with Try again.
- `RESTRICTED` shows the restriction and support.
- Never offers a reset, and never says "not charged" unless proven by the outcome.
- Focus moves to the heading on change.

## Explicit non-scope

- Server reconcile → spec 28.
- Route redirects → spec 40.

## Reuse first

- Support email comes from `getPublicSupport`.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Add the single reconcile call with a guard against repeats.
3. Test each outcome.
4. Record what you created in `specs-saas-onboarding/inventory/38-recovery-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx` passes and proves: each outcome navigates or explains; reconcile runs once under double mount; IN_PROGRESS retries with a limit; no reset button; conflict shows support. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/38-recovery-screen.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
