# Spec 35 — Confirmation screens

## Activation page

`frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx` exports the default `BillingActivationPage` for the activation route. It requires the existing router, language and QueryClient providers. It consumes `useCheckoutConfirmation()` directly; it adds no polling loop, provider call or lifecycle query.

- Reuses `FlowShell`, `Button`, the onboarding dictionary, `.flow-step-box`, `.flow-confirming-ring`, `.flow-ready-stamp` and the shared reduced-motion rules. No new CSS, colour tokens, translations or storage are introduced.
- Presents Payment received, Activating your subscription and Preparing your workspace. A qualified active server subscription completes the first two rows together. An unknown subscription or `CONFIRMING` step alone never claims payment receipt. Workspace completion appears only on Ready.
- The hook supplies the 20-second slow notice and 120-second timeout. Check again invokes its `retry()`. A terminal active result without an explicit `WORKSPACE` step also offers retry, preventing an indefinite inactive wait.
- Ready requires a fresh hook `active` result, explicit server `WORKSPACE`, allowed workspace access and an active, unsuspended company. It shows the stamp, server plan and interval, renewal date in UTC and an explicit `/dashboard` link. Missing renewal information and scheduled changes show Not available.
- Denied offers `/login`. Restricted shows the restriction and `/help`; neither exposes workspace entry. Status text uses `role=status`. The shell focuses the heading on entry and step changes, and mirrors the page in Urdu.
- Routes only from the current confirmation outcome. `NO_CHECKOUT` immediately replaces the route with `/choose-plan`. Two consecutive `NOT_PAID` reads replace it with `/subscription/payment`, or `/choose-plan` when the latest server step is `CHOOSE_PLAN`. A single unpaid read, `PROCESSING`, failed reads and timeout remain on confirmation; denial and restriction take precedence. Return URL parameters never select the destination. Nothing is derived from cached access or browser checkout events.

## Additive confirmation-hook fields

`frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts` extends the existing hook with:

- `outcome`: latest accepted, company-scoped `BillingConfirmOutcome`, initially `null`.
- `consecutiveNotPaid`: consecutive accepted `NOT_PAID` count in the current run, initially `0`. Any other accepted outcome resets it. Failed reads and foreign-company responses also break the streak without replacing the latest accepted outcome.
- Both fields clear on retry and synchronously hide on owner/company/role changes. Late responses from a prior run cannot populate them. Cached lifecycle facts do not initialize either field.
- The existing statuses, request gaps, 20/120-second watchdogs, cache keys and stable `retry()` remain unchanged. Routing stays in the page; the hook continues polling for unpaid outcomes when used on its own.

## Test seam

`BillingActivationPage.test.tsx` uses the real confirmation hook and an in-memory QueryClient, fake timers, mocked auth/API boundaries and a mocked Paddle SDK for the completion-event regression. Coverage includes slow/timeout/retry, ready guards, outcome redirects, single unpaid reads, streak reset by processing/failure, reload, owner isolation, denial, restrictions, Urdu and shared reduced-motion CSS. JSDOM checks the motion hooks and stylesheet override; it does not verify browser layout or computed animation.

`useCheckoutConfirmation.test.tsx` verifies the additive fields, counter reset, retry/identity isolation and ignored foreign/late responses alongside the original timing, cancellation and cache regressions. Neither test file calls real Paddle or a database.

The existing composer tests in `SubscriptionPage.test.tsx` were updated under the guide's test-only exception for the new heading/action labels and fresh confirmation requirement. No application code outside Owns was changed.
