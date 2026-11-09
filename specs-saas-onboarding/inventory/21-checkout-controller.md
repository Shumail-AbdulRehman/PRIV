# Spec 21 — Owner checkout controller

`frontend/src/pages/Subscription/onboarding/useCheckoutSession.ts` adds `useCheckoutSession(selection?)` for spec 37. It requires the existing QueryClient provider and auth identity. The legacy `useBillingCheckout.ts` remains in place for current screens.

- `CheckoutSelection`: allowlisted `plan` / `interval`. Arrival resumes the server's saved selection first; rerendering a URL selection or language never restarts the frame.
- `state`, `status`, `actions`: local session state from `checkoutMachine`. All transitions use its reducer; a new owner or server draft gets a new generation. Completion means `confirming`, never workspace access.
- `prepared`: the current transaction and saved selection. `totals` (`CheckoutTotals`) contains only normalized `totals`, `recurringTotals`, `currencyCode` from matching loaded/updated events, without amount conversion or raw payment data.
- `registerFrameTarget(className | null)`: stable callback for spec 25. Register the target's class name, release it on unmount, and keep the target DOM node mounted. Repeated registration, language changes and same-draft background refetches do not reopen Paddle.
- `actionBusy`, `statusBusy`: independent locks. `checkStatus()` can verify identity and fetch company-scoped facts during a pending action; status clicks coalesce. An unresolved mutation cannot retry or replace until server facts establish a resumable draft or a cleared reservation. A cleared reservation can prepare again only after fresh owner/lifecycle checks.
- `changePlan(selection)`: replaces through the existing prepare endpoint, holding the action lock and tearing down the old frame. It is disallowed during payment or an unknown outcome. `tryAgain()` retries script/frame setup; existing drafts keep their transaction ID.
- Mount work is deferred past StrictMode effect replay, verifies the fresh owner and lifecycle, loads the SDK before any prepare, then rechecks owner and facts. Lifecycle reads reuse the owner/company QueryClient key; subscription access is never changed locally.
- The frame watchdog waits 20 seconds for `checkout.loaded`. Raw Paddle subscription reads only the installed SDK's `checkout.payment.initiated` name and matching transaction ID to enter `paying`; no raw payload is retained. A missing payment result uses the existing 20-second confirmation deadline and becomes `unresolved`, offering a status read.
- Owner/unmount/draft teardown aborts private work, removes listeners/timers and closes the owned frame. Frame/session generation guards discard retained callbacks, late responses and other-transaction events. Online/offline events preserve a ready form and make interrupted mutations status-first.

`useCheckoutSession.test.tsx` exercises the controller with mocked API and Paddle seams, fake deadlines and a real in-memory QueryClient. It uses no application database, CDN or provider account.
