# Spec 38 — Recovery screen

`frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx` is the owner-scoped recovery screen using the existing narrow `FlowShell` at the Card step. It reuses the scoped lifecycle query, time-limited `reconcileBillingCheckout` transport, shared Button, Urdu dictionary and `getPublicSupport`.

- On `RECONCILE`, sends one request per attempt, retaining the promise through React StrictMode effect replay and ordinary rerenders.
- `RESUMABLE`, `CLEARED` and `PAID` navigate with replacement to payment, plan selection and activation respectively. Restricted response facts prevent navigation; a fresh lifecycle restriction overrides an earlier in-progress response and stops retries.
- `IN_PROGRESS` retries after 2, 5 and 10 seconds, then stops with Check again. An explicit check permits one more attempt after this limit. Transport deadlines bound each request. Unmount clears retry timers; owner changes remount the screen and ignore old responses.
- `UNRESOLVED` and request failures offer Check again without revealing private errors. Missing, foreign or failed lifecycle reads require a lifecycle retry before any reconciliation.
- Disabled billing and unavailable prices offer Try again to refetch lifecycle. Restrictions offer support. Conflicts offer support and signup with another email. Support uses the public configured email, with `/help` as the unavailable-contact fallback.
- Uses approved copy without unproven charge claims or reset controls. Headings receive focus on recovery state changes; the shared shell supplies responsive, RTL and reduced-motion styling.

`BillingRecoveryPage.test.tsx` contains 26 isolated cases covering outcomes, retry bounds, StrictMode, focus, restrictions, unavailable states, support, Urdu, owner changes, unmount and denied roles. API and support calls are mocked; it requires no Paddle, database or app server.
