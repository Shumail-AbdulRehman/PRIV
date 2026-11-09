# Spec 07 — Pure checkout state machine

`frontend/src/pages/Subscription/onboarding/checkoutMachine.ts` is the pure reducer for spec 21's controller and spec 37's payment UI. It has only a type import from the shared billing DTOs; no React, Paddle, API, DOM, network, storage or clock dependencies.

- `checkoutStatuses`, `CheckoutStatus`: the architecture's twelve checkout states.
- `checkoutActions`, `CheckoutAction`: the exact per-state visible actions (`changePlan`, `tryAgain`, `checkStatus`, `contactSupport`). `checkoutWaits` documents the five explicit waits without actions. The controller owns deadlines and the activation handoff.
- `createCheckoutState(sessionId)`, `CheckoutState`, `CheckoutEvent`, `checkoutReducer`: local session state and transitions. Pass a new generation on owner/session changes and discard old callbacks; all events carry `sessionId`. Frame/payment events additionally carry the transaction ID; only a transactionless top-level `checkout.error` can affect `frameLoading`.
- `serverFactsRead` consumes the validated lifecycle's `onboardingStep` and `checkoutResume`. A fresh resumable draft loads the frame; cleared facts permit prepare; unknown facts require a status check. Background reads preserve active frames; administrative restriction always takes priority. `confirming` only hands off to server confirmation and never grants workspace access.
- `prepareFailed` means proven failure before sending; `prepareTimedOut` means an unknown outcome after sending (also used for an unknown replacement outcome). An unresolved outcome accepts no retry or replacement: fresh server facts must establish the next step. Use `prepareSucceeded` for prepare and `replaced` for replacement, carrying the new draft ID.
- `tryAgain` retries frame/script setup and restores offline state; it cannot start another unknown purchase. Offline during prepare, replacement or payment recovers to `unresolved`.
- `checkoutFormUsable(state)` remains true for `ready` and `declined`. A decline preserves the draft; payment setup/provider errors fail the frame. Keep its DOM target mounted in the controller/view.

`checkoutMachine.test.tsx` includes an independent transition table across all twelve states and eighteen event types, stale-session and foreign/transactionless-event matrices, exact action/wait assertions, and focused retry, decline, replacement, offline and server-fact cases. No provider or database fixture is needed.
