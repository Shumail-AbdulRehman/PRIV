# Spec 07 — Pure checkout state machine

**Status:** Not started
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/checkoutMachine.ts`, `frontend/src/pages/Subscription/onboarding/checkoutMachine.test.tsx`, `specs-saas-onboarding/inventory/07-checkout-machine.md`
**Reuses:** `ARCHITECTURE.md#checkout-states`, `frontend/src/pages/Subscription/types.ts` (spec 01)

## Goal

Define every checkout state, what moves between them and which actions each allows, with no React or network code.

## Scope

- States and actions exactly as in `ARCHITECTURE.md`.
- Events include: server facts read, prepare started, succeeded, failed, timed out after sending, script failed, frame loaded, frame timeout, `checkout.error`, payment attempted, payment failed, `checkout.payment.error`, completed, offline, online, replace started, replaced.
- A prepare timeout after sending goes to `unresolved`, never to a retry. A failure before sending goes to `frameFailed`.
- `checkout.payment.failed` goes to `declined` with the form still usable. `checkout.payment.error` such as no payment methods goes to `frameFailed`, not `declined`.
- An event for another transaction is ignored. A top-level error with no transaction only affects a frame still loading.

## Explicit non-scope

- Running effects → spec 21.
- Rendering states → spec 37.

## Reuse first

- Keep this free of imports from React, Paddle and the API layer.

## Steps

1. Define states, events and the action table.
2. Write the reducer.
3. Add a table test covering every state and event pair.
4. Assert no state, other than the listed bounded ones, has zero actions.
5. Record what you created in `specs-saas-onboarding/inventory/07-checkout-machine.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run frontend/src/pages/Subscription/onboarding/checkoutMachine.test.tsx` passes and proves: every transition; declined keeps the form; a timed-out prepare is never retried; foreign and stale events do nothing; no dead-end state exists. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/07-checkout-machine.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
