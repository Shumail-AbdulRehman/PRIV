# Spec 13 — Paddle.js loading and normalized events

**Status:** Not started
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/lib/paddle.ts`, `frontend/src/lib/paddle.test.tsx`, `specs-saas-onboarding/inventory/13-paddle-sdk-inline.md`
**Reuses:** `docs/plan-project/saas-onboarding/research/paddle.md`, `ARCHITECTURE.md#time-limits`

## Goal

Load Paddle.js reliably, open the inline form with the right settings and give the app one normalized event stream.

## Scope

- Add a 15 second script watchdog. A failed attempt removes its tag and can be retried.
- Keep one initialized instance. Never re-initialize on render.
- `openInlineCheckout` uses `displayMode` inline, `variant` one-page, the given `frameTarget`, `frameInitialHeight` 450, `frameStyle` with full width and minimum width 312px, `transactionId`, `allowLogout` false, `showAddDiscounts` false, and `theme` light. `locale` is English, because Urdu is unsupported.
- Normalize events to: `loaded`, `updated` (with totals), `paymentFailed`, `paymentError`, `openError`, `completed`, `closed`. Carry `transactionId` when present.
- Do not set `successUrl`; the app handles completion itself.
- Additive only: keep `getPaddle`, `subscribePaddleEvents` and `CheckoutEventNames` working, because the current payment page still uses them until spec 40.

## Explicit non-scope

- Using the events → spec 21.
- Rendering the frame target → spec 25.

## Reuse first

- Keep the existing `subscribePaddleEvents` fan-out.
- Confirm event names and settings in the installed `@paddle/paddle-js` types.

## Steps

1. Add the watchdog.
2. Add `openInlineCheckout`.
3. Add the normalizer, including flat `checkout.error` and `checkout.payment.error` events that have no `data`.
4. Test retry, single initialization and each event shape.
5. Record what you created in `specs-saas-onboarding/inventory/13-paddle-sdk-inline.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/lib/paddle.test.tsx` passes and proves: script timeout then successful retry; one initialization; correct inline settings; flat error events normalize; a failing listener cannot block others. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/13-paddle-sdk-inline.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
