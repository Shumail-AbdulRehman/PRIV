# Architecture: account, plan and checkout flow

Derived from the real tree at commit `805dd40`, read 2026-11-09. Paths marked *new* do not exist until their spec runs.

## The flow

```
/signup or /login
      |
      v  server decides the next step (onboardingStep)
/choose-plan --> /subscription/payment --> /subscription/activation --> /dashboard
                        |                          |
                        v                          v
                 /subscription/recovery     Ready screen, explicit "Open your workspace"
```

Free trials are removed. A new company pays through Paddle's inline card form before it can use the workspace.

## Folder structure

```
backend/src/
  app.ts                                  trust proxy, webhook mount, error handler (spec 02)
  utils/operationalLog.ts                 new, safe structured logging
  routes/
    billingLifecycle.route.ts             /subscription/manage/* HTTP adapter
    common.route.ts                       adds /common/login
    manager.route.ts                      signup route gets the limiter
  controllers/
    companyRegistration.controller.ts     signup transport
    login.controller.ts                   new, unified login transport
  services/
    authRateLimit.ts                      new, in-process limiter
    login.service.ts                      new, unified credential check
    companyRegistration.service.ts        signup rules
    billingProvider.ts                    new, the only module that calls Paddle for this flow
    billingCatalog.service.ts             new, trial-free catalog with a short cache
    billingReservations.service.ts        new, append-only reservation facts
    billingCustomer.service.ts            new, ensure one Paddle customer
    billingCheckout.service.ts            new, prepare and replace checkout
    billingConfirm.service.ts             new, server check of a paid checkout
    billingReconcile.service.ts           new, repair stuck reservations
    billingOnboardingStep.ts              new, pure next-step decision
    billingLifecycle.service.ts           assembles the lifecycle read and the portal
    paddleFulfillment.service.ts          webhook and shared fulfilment
    paddleTrialRemoval.ts                 new, dry-run-first trial removal
  types/billingLifecycle.ts               owner-safe DTOs
backend/scripts/removePaddleTrials.ts     new, thin command wrapper

frontend/src/
  App.tsx                                 session restore, guards
  api/client.ts                           Axios client and refresh
  lib/paddle.ts                           Paddle.js singleton and normalized events
  i18n/onboardingTranslations.ts          new, all Urdu for this flow
  pages/Onboarding/                       new
    flow.css                              the only stylesheet with this flow's raw values
    FlowShell.tsx                         table, header, sheet, stacked edges, steps
    onboardingRoutes.ts                   pure step-to-route map
    FlowEntry.tsx                         post-login resolver at /continue
  pages/Login/LoginPage.tsx
  pages/Signup/SignUpPage.tsx
  pages/Account/AccountPages.tsx          public recovery screens adopt FlowShell
  pages/Subscription/
    api.ts, queries.ts, types.ts          transport and server cache
    SubscriptionPage.tsx                  route composer
    onboarding/
      billingRequest.ts                   new, deadlines
      checkoutMachine.ts                  new, pure state machine
      useCheckoutSession.ts               new, owner checkout controller
      useCheckoutConfirmation.ts          new, confirmation polling
      useBillingCheckout.ts               old overlay controller, deleted by spec 40
      PaddleCheckoutFrame.tsx             new, inline frame target
      OrderSummary.tsx                    new, totals required by Paddle
      BillingPlanPage, BillingPaymentPage, BillingActivationPage, BillingRecoveryPage
      BillingAccountPage, BillingSetupLayout  existing subscriber settings
```

## Layer boundaries

| Path | Owns | Must never |
|---|---|---|
| Routes and controllers | Auth, strict input, status codes, no-store | Contain business rules or call Paddle |
| `billingProvider.ts` | Every Paddle call in this flow, time limits, error classification | Log payloads, emails or tokens |
| `billingReservations.service.ts` | Reading and writing reservation facts | Call Paddle or delete an audit row |
| `billingCheckout`, `billingCustomer`, `billingConfirm`, `billingReconcile` | One flow each | Grant access directly |
| `paddleFulfillment.service.ts` | The only code that writes subscription access | Trust browser input |
| `billingOnboardingStep.ts` | Pure next-step decision | Do I/O |
| `checkoutMachine.ts` | Pure transitions and allowed actions | Touch React, DOM or network |
| `useCheckoutSession.ts` | One owner's checkout session | Store card data or grant access |
| `PaddleCheckoutFrame.tsx` | Stable DOM target, reports readiness | Read inside the cross-origin frame |
| Pages | Layout, copy, focus, motion | Decide access from a URL or Paddle event |

## Naming conventions

PascalCase component files, `useName.ts` hooks, camelCase pure modules, kebab-free CSS file names matching the existing tree. **Frontend tests must be named `*.test.tsx`, even for pure modules, because Vitest's include pattern is `src/**/*.test.tsx` and any other name silently never runs.** Backend tests are `*.test.ts` beside the code. Real SQL tests stay under `backend/tests/`.

## Protected files

Do not edit: generated Prisma client, `dist/`, existing migrations, `specs/`, `specs-billing-onboarding/`, `specs-billing-checkout-repair/`, `design/saas-onboarding/`, the native app source except the icon files in spec 05. No schema migration is needed or allowed.

## Data model

No new tables. `Company` holds `billingCustomerId`, `billingSubscriptionId`, `plan` and `operationalStatus`. `PaddleCustomer`, `PaddleSubscription` and `PaddleTransaction` mirror Paddle. `PaddleWebhookEvent` deduplicates webhooks.

Reservation facts live in `AuditLog` with `entityType BILLING_OPERATION` and `entityId` equal to the company ID:

| Action | `newValue` | Meaning |
|---|---|---|
| `CUSTOMER_CREATE_RESERVED` | none | About to create a Paddle customer |
| `CUSTOMER_CREATE_READY` | `reservationId, customerId, adopted?` | Customer linked |
| `CUSTOMER_CREATE_FAILED` | `reservationId, code` | Proven not created, or conflict recorded (new) |
| `CHECKOUT_RESERVED` | `plan, interval, priceId` | About to create a draft |
| `CHECKOUT_READY` | `reservationId, transactionId, customerId` | Draft exists |
| `CHECKOUT_FAILED` | `reservationId, code` | Proven not created (new) |
| `CHECKOUT_CANCELED` | `reservationId, transactionId` | Draft cancelled at Paddle for a plan change (new) |

A reservation with a `READY`, `FAILED` or `CANCELED` fact is closed. Rows are never edited or deleted.

## Lifecycle DTO additions

`GET /subscription/manage/lifecycle` keeps its current fields and adds:

- `onboardingStep`: `CHOOSE_PLAN`, `PAYMENT`, `CONFIRMING`, `WORKSPACE`, `ACCOUNT`, `RECONCILE`, `RESTRICTED`, `VERIFY_EMAIL`, `UNAVAILABLE`.
- `recoveryReason`: `null`, `EMAIL_CONFLICT`, `CUSTOMER_UNRESOLVED`, `BILLING_DISABLED`, `PRICE_NOT_READY`.

Both new fields are optional until spec 36 sends them. A missing step is `null`, which grants nothing and shows a retry.

`trialPeriod` becomes optional and deprecated on the catalog DTO. Nothing new sets or reads it. It remains only so screens awaiting their rebuild keep compiling.

| Step | Decided when (first match wins) | Route |
|---|---|---|
| `RESTRICTED` | Company inactive or suspended | `/subscription/recovery` |
| `WORKSPACE` | Workspace access allowed | `/dashboard` |
| `ACCOUNT` | A linked subscription exists but gives no access | `/subscription` |
| `UNAVAILABLE` | Billing disabled or catalog unusable | `/subscription/recovery` |
| `VERIFY_EMAIL` | Live mode and owner email unverified | `/account/security` |
| `CONFIRMING` | Latest draft known to be paid, or subscription status unknown | `/subscription/activation` |
| `RECONCILE` | An open reservation or a recorded conflict | `/subscription/recovery` |
| `PAYMENT` | A resumable draft exists | `/subscription/payment` |
| `CHOOSE_PLAN` | Otherwise | `/choose-plan` |

## New endpoints

All under `/subscription/manage`, owner only, strict bodies, `no-store`.

| Method and path | Body | Result |
|---|---|---|
| `POST /checkout` | `{plan, interval}` | `{transactionId, reused, replaced}`. A different plan replaces an unpaid draft |
| `POST /checkout/confirm` | `{}` | `{outcome, lifecycle}`, outcome `ACTIVE`, `PROCESSING`, `NOT_PAID`, `NO_CHECKOUT` |
| `POST /checkout/reconcile` | `{}` | `{outcome, lifecycle}`, outcome `RESUMABLE`, `CLEARED`, `IN_PROGRESS`, `PAID`, `UNRESOLVED`, `CONFLICT` |

`POST /common/login` takes `{email, password}` and returns the existing login response shape.

## Time limits

Central constants, adjustable. One Paddle call on the server 15s. Reservation in-flight grace 120s. Client reads 15s, confirm 20s, reconcile 30s, prepare 45s. Paddle script 15s. Frame `checkout.loaded` 20s. Confirmation polling 2, 3, 5, 8 then 13 seconds until 120s total. Catalog cache 60s, successful results only.

## Checkout states

`checkoutMachine.ts` owns these. Every state has a visible explanation and at least one action, or an explicit wait.

| State | Meaning | Allowed actions |
|---|---|---|
| `checking` | Reading server facts | none, bounded |
| `preparing` | Creating or reusing the draft | none, bounded |
| `frameLoading` | Waiting for `checkout.loaded` | change plan |
| `ready` | Card form usable | change plan |
| `paying` | Payment attempt in progress | none |
| `declined` | Card failed, same form usable | change plan |
| `frameFailed` | Script, open or load failed | try again, change plan |
| `offline` | Browser offline | try again |
| `replacing` | Cancelling the old draft for a new plan | none, bounded |
| `confirming` | Completed, go to activation | none |
| `unresolved` | Outcome unknown | check status |
| `restricted` | Not allowed | contact support |

## State ownership

TanStack Query owns server data with company and owner keys. Redux keeps auth identity only. The checkout machine is local reducer state. Language stays in context. Nothing about cards, drafts or billing goes in browser storage. Plan and interval may be in the URL before a draft exists. After that, the server's saved selection wins.

## Invariants

1. Only `paddleFulfillment.service.ts` writes subscription access, whether from a signed webhook or a server read of Paddle. The browser can never grant access.
2. Every private billing action is scoped to the current active owner. Body, URL and email never select a tenant.
3. Card numbers only ever enter Paddle's frame.
4. A second purchase needs a proven-closed reservation. A timeout is never proof.
5. Audit facts are append-only.
6. An email match adopts a Paddle customer only when it is an exact match, active, not linked to another company, and the environment is sandbox or the owner's email is verified.
7. No Paddle price with a trial can be sold. A price with a trial makes that catalog entry unavailable.
8. Provider errors are logged by code and status only. Logs never contain emails, names, tokens, card data or payloads.
9. `checkout.loaded` is the only signal that the card form is ready.
10. The frame target stays mounted through background refetches and language changes.
11. Every wait ends, or explains itself and offers an action.
12. Existing subscribers keep their billing page, portal and historical read access. `trialing` subscriptions that already exist keep access.
13. Payment never lifts an administrative suspension.
14. Raw colour values appear only in `flow.css` and `DESIGN-SYSTEM.md`.
15. Hot files have one owner: `translations.ts`, `app.ts`, `App.tsx`, `billingRoutes.tsx`, `queries.ts`.
16. Every spec leaves the build and whole unit suites green. A change that would break a screen awaiting its rebuild is made additively, and the old code is removed by the spec that owns the removal.

## Test seams

Backend services take injected `db`, `provider` and `now`, following the existing `Deps` pattern. Frontend tests mock at `api.ts` and `lib/paddle.ts`. The end-to-end harness in `frontend/e2e` uses an isolated database and a controlled Paddle script. Real Paddle runs are recorded separately and never replaced by mocks.
