# Stack and reuse — read 2026-11-06

Existing stack retained: React/Vite/TanStack Query/Redux identity, Express/Prisma/PostgreSQL, Paddle Node SDK and Paddle.js. Manifest versions are in planning/repo-survey.md. No package replacement or new card-storage system is proposed.

## Verified reuse

| Path | Reuse |
| --- | --- |
| frontend/src/pages/Signup/queries.ts | Durable owner session and /choose-plan navigation |
| frontend/src/App.tsx | Guest/role/session restoration and forced own-security |
| frontend/src/pages/Pricing/ChoosePlanPage.tsx | Current /choose-plan alias; currently redirects to subscription |
| frontend/src/pages/Pricing/WelcomePage.tsx | Checkout return currently redirects to subscription pending state |
| frontend/src/components/onboarding/WorkspaceGate.tsx | Owners with no linked subscription route to billing |
| frontend/src/pages/Subscription/api.ts | Existing lifecycle, catalog, checkout and portal requests |
| frontend/src/pages/Subscription/queries.ts | Owner-scoped query keys and pending/unknown subscription polling |
| frontend/src/pages/Subscription/types.ts | Billing catalog/lifecycle transport shapes |
| frontend/src/lib/paddle.ts | Environment/token checks, lazy SDK singleton |
| frontend/src/lib/moduleLoadRecovery.ts | Bounded stale-chunk recovery |
| frontend/src/components/common/BrandLogo.tsx | Existing mark/wordmark |
| frontend/src/components/common/LanguageChoice.tsx | Existing EN/UR control |
| frontend/src/components/ui/button.tsx | Existing variants/focus behavior |
| frontend/src/workspace-refresh.css | Active blue/slate tokens and Inter typography |
| backend/src/services/billingLifecycle.service.ts | Owner checks, active catalog, provider reservations, canonical customer linkage, checkout reuse and portal |
| backend/src/services/paddleFulfillment.service.ts | Verified event ordering, deduplication, canonical ownership and access synchronization |
| backend/src/controllers/paddleWebhook.controller.ts | Signed raw-body webhook handling |
| backend/src/services/accountAccess.service.ts | Persisted period-aware entitlement; completion/start distinctions |
| backend/src/config/paddle.ts | Enabled flag, environment, private credentials, configured price catalog |
| backend/config/paddle-sandbox-catalog.json | Six existing sandbox plan/interval IDs; no prices or credentials inferred |
| backend/SANDBOX_BILLING.md | Existing Heroku/Netlify runbook; historical provider facts must be rechecked |
| frontend/e2e/run.mjs | Existing disposable application/database/browser harness |

Shared billing UI should move toward a small feature-local composition; preserve the incumbent route/auth/query contracts. Existing global Prisma construction and Redux auth are recorded incumbent exceptions, not scope for a rewrite. No data migration is currently justified by the observed source.

## Installed provider symbol checks

- `backend/node_modules/@paddle/paddle-node-sdk/dist/types/entities/shared/trial-period.d.ts`: TrialPeriod exposes `requiresPaymentMethod: boolean | undefined`; price entities expose `trialPeriod`. Confirm configured trial prices actually require a test payment method for this requested flow; do not alter the trial duration or silently adopt cardless trials.
- `frontend/node_modules/@paddle/paddle-js/types/checkout/checkout.d.ts`: initialization supports `eventCallback`, PaddleEventData and CheckoutOpenOptions with transactionId.
- `frontend/node_modules/@paddle/paddle-js/types/checkout/events.d.ts`: checkout.closed and checkout.completed exist. Treat these as UI refresh signals, not access grants.
