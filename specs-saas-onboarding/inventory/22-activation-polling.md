# Spec 22 — Activation polling

`frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts` exports `useCheckoutConfirmation()` for the activation screen in spec 35. It requires the existing QueryClient provider and `useAuth` owner identity; it does not mount the old lifecycle poll.

- Returns `status` (`waiting`, `slow`, `timedOut`, `active`, `denied`), `lifecycle` (the latest successful result in this run, initially `null`), and stable `retry()`.
- Exports `CheckoutConfirmationStatus` and `CHECKOUT_CONFIRMATION_TIMING`: first request after 2 seconds, then 3, 5, 8 and repeated 13-second gaps after settlement. Independent watchdogs report slow at 20 seconds and stop at 120 seconds from the start of the run, even if a call ignores cancellation. Requests never overlap within a run.
- Calls spec 12's `confirmBillingCheckout(signal, companyId)`. Every accepted response updates the existing `billingLifecycleKey(companyId, ownerId)` cache, including `PROCESSING`, `NOT_PAID` and `NO_CHECKOUT`. Transient errors keep polling within the same window; HTTP 401/403 stops as `denied`.
- Reports `active` only for a fresh server `ACTIVE` outcome with workspace access allowed and an active, unsuspended company. Cached facts and browser checkout events cannot trigger activation. The hook never modifies lifecycle access fields.
- Only an authenticated `ADMIN` with company and owner IDs can poll. Owner, company or role changes synchronously tear down the old run and hide its state. A new owner gets a fresh window; non-owners receive `denied` without a call. Same-owner object/language rerenders preserve the current window.
- `retry()` aborts the previous run, clears its timers, resets the visible result and restarts both deadlines and the gap sequence. Late results and failures from stopped runs cannot update state or cache. Unmount aborts work and makes a retained retry callback inert. StrictMode effect replay leaves one polling loop.

`useCheckoutConfirmation.test.tsx` uses fake timers, mocked auth/API seams, a real in-memory QueryClient, and the real request deadline helper for cancellation/timeout coverage. No provider account, network or application database is required. The existing `queries.ts` poll remains unchanged for spec 40.
