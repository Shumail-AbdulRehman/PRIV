# Spec 21 — Owner checkout controller

**Status:** Not started
**Depends on:** Spec 07, Spec 12, Spec 13
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/useCheckoutSession.ts`, `frontend/src/pages/Subscription/onboarding/useCheckoutSession.test.tsx`, `specs-saas-onboarding/inventory/21-checkout-controller.md`
**Reuses:** `frontend/src/pages/Subscription/onboarding/checkoutMachine.ts` (spec 07), `frontend/src/lib/paddle.ts` (spec 13), `frontend/src/pages/Subscription/api.ts` (spec 12)

## Goal

Run one owner's checkout from page arrival to completion, using the state machine and never starting two purchases.

## Scope

- On mount: verify owner, read facts, load the SDK first, then prepare the draft once.
- Mount the inline form once a frame target is registered and a draft exists.
- Start a 20 second watchdog for `checkout.loaded`.
- Expose separate locks for the action and for "check status", so one cannot block the other.
- Support `changePlan`, which runs the replace path.
- Ignore events for another transaction or an older session. A completed event moves to `confirming`.
- Listen to browser online and offline.
- Do not close and reopen the form on background refetches or language change.
- Tear down on unmount, owner change or draft change.
- Expose latest totals from `loaded` and `updated` events.

## Explicit non-scope

- The frame element → spec 25.
- Payment page layout → spec 37.
- Polling → spec 22.
- Deleting the old hook → spec 40.

## Reuse first

- All transitions go through `checkoutMachine`.
- Never store card data or grant access from an event.

## Steps

1. Create the new hook around the reducer, leaving `useBillingCheckout.ts` untouched because the current screens still use it.
2. Add the session generation guard.
3. Add the watchdog and status lock.
4. Add replace.
5. Write its tests.
6. Record what you created in `specs-saas-onboarding/inventory/21-checkout-controller.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/useCheckoutSession.test.tsx` passes and proves: one prepare under double mount; SDK failure never creates a draft; watchdog reaches frameFailed; decline keeps the same draft; timeout after send becomes unresolved with no second POST; status check works during a hung action; owner change discards late results. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/21-checkout-controller.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
