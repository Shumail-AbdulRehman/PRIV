# Spec 37 — Payment screen

**Status:** Not started
**Depends on:** Spec 21, Spec 24, Spec 25
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx`, `specs-saas-onboarding/inventory/37-payment-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Subscription/onboarding/useCheckoutSession.ts` (spec 21), `frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.tsx` (spec 25), `frontend/src/pages/Subscription/onboarding/OrderSummary.tsx` (spec 24)

## Goal

Rebuild the payment page with Paddle's real card form on the page beside the order summary.

## Scope

- Compose heading, test card box, frame, notices and summary at wide size.
- Test card box only when browser and server are both sandbox, with Copy and the extra cards.
- Notices: declined, offline, resumed, processing, replacing.
- Frame failure replaces the frame with "The card form didn't load" and Try again.
- Change plan is available unless paying or replacing.
- Selection comes from the saved draft first, then allowlisted URL values. Missing or invalid sends the owner to the plan page.
- Urdu shell explains the card form is in English.
- No app-owned Pay button.
- Completed moves to activation.
- Remove the inline `<style>` block and the shared busy flag.

## Explicit non-scope

- Controller logic → spec 21.
- Recovery screen → spec 38.

## Reuse first

- Use the components named. Do not rebuild the summary.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Map each machine state to the design.
3. Test each state.
4. Record what you created in `specs-saas-onboarding/inventory/37-payment-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx` passes and proves: frame present and no app card fields; test card only in matched sandbox; each notice; failure offers retry; change plan hidden while paying; a catalog refetch does not remount the frame. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/37-payment-screen.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
