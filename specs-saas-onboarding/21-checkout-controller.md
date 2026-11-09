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

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/useCheckoutSession.test.tsx` passes and proves: one prepare under double mount; SDK failure never creates a draft; watchdog reaches frameFailed; decline keeps the same draft; timeout after send becomes unresolved with no second POST; status check works during a hung action; owner change discards late results. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/21-checkout-controller.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-10** — Implemented the additive `useCheckoutSession` controller and its focused tests. It verifies the current owner and fresh lifecycle before loading the SDK and preparing once; uses `checkoutMachine` transitions and independent action/status locks; registers one inline target; enforces the 20-second loaded watchdog; retains declined drafts; replaces through the existing prepare API; handles online/offline, normalized totals, transaction/session guards and teardown. A narrowly filtered raw `checkout.payment.initiated` subscription enters `paying` without retaining payment payloads; the existing confirmation deadline bounds a missing payment result. Browser completion only hands off to confirmation. Existing screens and `useBillingCheckout.ts` were left intact.
- **2026-11-10** — Required focused command `cd frontend && npx vitest run src/pages/Subscription/onboarding/useCheckoutSession.test.tsx` passed: **43 tests, 1 file, 0 failures/skips**. Coverage includes StrictMode replay with one prepare; zero drafts after SDK failure; the exact frame deadline; same-draft decline; timeout after send with no automatic second POST; independent status checks during a hung action; late owner/session/draft results; replacement; payment locks/deadline; cache/refetch/rerender stability; amounts; cleanup; server-directed recovery and confirmation. The earlier initial focused run passed 31 tests before these additional recovery cases were added.
- **2026-11-10** — Required `npm test --prefix frontend` passed: **88 Node tests plus 1,958 Vitest tests across 54 files**, **2,046 total**, **0 failures/skips**. The focused 43 cases are included in that Vitest total. Node emitted the existing mobile translation `MODULE_TYPELESS_PACKAGE_JSON` advisory; no out-of-scope file was changed to suppress it.
- **2026-11-10** — Required `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` both passed with **0 errors and 0 warnings**. Required `npm run build --prefix frontend` passed; Vite emitted the existing `PLUGIN_TIMINGS` performance advisory for Babel/CSS. The inventory fragment was written and inspected; `git diff --check` passed. No test-only exception edits were needed.
- **2026-11-10** — All test/type/build commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. Provider and API seams were mocked; no real Paddle, database, migration, deployment or application end-to-end run was used. Real payment/frame integration remains with the later probe/frame/payment specs. Per run instructions, no issue/PR, commit, merge, push, branch command, tracker edit or Status-line change was made.
