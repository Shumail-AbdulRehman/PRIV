# Owner billing sandbox release

Prepared 2026-11-08 from the repository. This runbook is a release procedure, not evidence of a current deployed/provider pass. See [deployment checklist](../docs/implementation/billing-deployment-checklist.md) and final evidence destination `docs/implementation/billing-final-verification.md`.

The repair keeps signup/session semantics and moves authenticated owner plan/payment/confirmation outside dashboard and marketing layouts. API plan definitions supply capacities; Paddle supplies recurring amounts, currency and trial facts. No migration, custom card fields, account recreation, audit deletion or production activation belongs to this release.

## Candidate and order

1. Record reviewed frontend/backend commit SHAs and previous Netlify deploy/Heroku release identifiers. Include contracts45, SDK46, shell47, proxy48, service49, helpers50, queries51, signup52, controller53, screens54–58 and routes59. Main containing only46 is not this repair.
2. Pass local units, isolated SQL60 and managed browser62 before publishing. Keep previous additive DTO compatibility while rolling forward.
3. Operator publishes additive backend first, then the matching Netlify frontend build. Keep both previous deploy revisions/configuration available.
4. Complete real deployed acceptance below and record timestamps, revisions and redacted correlations in the final verification report63. Until then deployed acceptance remains pending.

## Netlify build settings

For the sandbox candidate: frontend build base, `npm run build`, `dist` publish directory; `VITE_API_BASE_URL=/api`, `VITE_PADDLE_ENVIRONMENT=sandbox`, matching sandbox `test_` public `VITE_PADDLE_CLIENT_TOKEN`. The public token is not the server API key. Changing build variables requires rebuilding; changing Heroku variables does not rebuild Netlify.

`frontend/public/_redirects` must ship in dist with `/api/*` forwarded to `https://cleanops-2f9dbc8f50cd.herokuapp.com/api/:splat` ahead of missing-asset404 and SPA200 fallbacks. Keep native clients' direct backend base and the direct signed webhook endpoint unchanged. Qualify actual secure cookies through this proxy; a correct rewrite alone does not prove browser session delivery.

## Heroku runtime settings

Operator checks presence/validity without printing values: `PADDLE_ENVIRONMENT=sandbox`, `PADDLE_BILLING_ENABLED=true` only for the authorized candidate, matching sandbox `PADDLE_API_KEY`, matching destination `PADDLE_WEBHOOK_SECRET`, and `PADDLE_PRICE_CATALOG_JSON` from `backend/config/paddle-sandbox-catalog.json`. API key and webhook secret must satisfy runtime non-placeholder/length validation; network failure alone does not prove a bad key.

`PADDLE_CHECKOUT_URL=https://cleanops-01.netlify.app/choose-plan` must be an approved HTTPS default checkout link with no query/hash/credentials. `FRONTEND_URL` includes exactly the approved frontend origin. `COOKIE_SECURE=true`; retain/qualify the current `COOKIE_SAME_SITE=none` setting over the deployed proxy. Preserve existing database/session secrets and schema. Do not print Config Vars or secrets into release logs.

## Provider settings and catalog

Retain sandbox checkout/default payment link for the approved site. Confirm the direct notification destination `https://cleanops-2f9dbc8f50cd.herokuapp.com/api/webhooks/paddle` with transaction/customer/subscription event delivery and its matching signing secret. Only signature-verified fulfillment can persist entitlement.

| Plan | Monthly sandbox price | Yearly sandbox price |
| --- | --- | --- |
| STARTER | pri_01m26dxq2nvjb2ak7jt4gym22g | pri_01m26dxqw2hx8kk0tc70wg5t29 |
| PRO | pri_01m26dxtv0k73yk444nc0vvqjj | pri_01m26dxvj8cmtdtr7a660mqa2h |
| ADVANCED (Enterprise) | pri_01m26dxxw7h9ma5xxcmsc0axgp | pri_01m26dxyqpqr2cmr8cwez9am00 |

These IDs are configuration, not current provider availability evidence. Read all six current prices/products: active status, frequency1 and matching month/year pair, currency/amount, product identity, trial interval/frequency and `requires_payment_method=true` for any sandbox trial in this requested card flow. Do not copy historical trial duration or prices into code or silently change provider terms. Missing/invalid entries stay unavailable.

No Help/Contact/FAQ is rendered in the new owner flow. Production owner verification, policy approval and configured-contact purchase guards remain in the checkout controller; removing UI controls does not authorize bypassing live prerequisites.

## Read-only failure diagnosis

Use the detailed repair evidence checklist at `docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md`. Capture only route chain, build/release SHAs, HTTP status, cookie presence, SDK category, lifecycle booleans and redacted request/event correlation.

| Symptom | Check / next step |
| --- | --- |
| Disabled catalog/flag | Runtime enabled/environment/catalog presence; current active price/product and trial policy; no guessed prices |
| Browser/server mismatch | Built sandbox/test_ family and server environment agree; rebuild stale Netlify candidate |
| Session lost or auth403 | Same-origin response/set-cookie presence, secure attributes, credentialed reload and current actor; do not log cookies |
| SDK fails before POST | Explicit CDN retry after configuration recovery; zero reservation expected |
| Prepared READY draft | Correlate same reservation/customer/tenant/price/transaction and reopen only that ID |
| Local response loss | Outcome unknown; status refresh first. It does not prove a charge or server hold |
| Server RESERVED without matching READY | Preserve records and hold. Operator establishes provider outcome before a separate reviewed recovery repair |
| Paid/unknown/unmatched draft | No second purchase. Correlate signed delivery and canonical customer/subscription; never relink by email |
| Pending confirmation | Verify actual signed delivery, ordered events, qualified price/current period and fresh `workspaceAccessAllowed`; browser return/event is insufficient |

A screenshot does not identify a provider error. No authorized affected-account session, current operator configuration/release inspection or provider-delivery evidence was available in this local unit. Exact failing live stage and safe stuck-account recovery remain open; do not present the routing fix as proof of those causes.

## Actual deployed acceptance

Use an authorized synthetic new sandbox owner: create once → standalone real plans → exact recurring summary → Paddle test card → pending confirmation → signed persisted current subscription → fresh workspace permission → explicit Open workspace. Test card guidance belongs only to sandbox. Verify reload/new sign-in and blocked third-party-cookie session; linked existing/canceled/past-due owners use the portal, unfinished draft reopens once, managers retain operations, forced password change and owner security remain reachable. Count provider subscriptions to rule out duplicate creation. Also complete affected-account diagnosis separately.

## Rollback

Operator rolls back frontend deploy/API-base/redirect and backend/config revisions to the recorded prior pair, or uses additive revert commits. Never reset/rebase/force-push Git history, delete customers/subscriptions/reservations/audits, clear uncertain state to buy again or run schema resets. Rollback does not reverse a provider charge: provider/account recovery needs its own proven, reviewed action.

## Local proof commands

`VITEST_MAX_WORKERS=4 npm test --prefix frontend`; `VITEST_MAX_WORKERS=4 npm test --prefix backend`; package typechecks/builds; owned-file ESLint; `BILLING_LIFECYCLE_TEST_DATABASE_URL=<owned localhost _test database> npm exec --prefix backend -- tsx backend/tests/billingLifecycle.integration.ts`; `HYGENE_E2E_DATABASE_URL=<owned localhost priv_e2e_test bootstrap> npm run test:e2e --prefix frontend`.

Use explicit isolated database variables and prevent private dotenv fallback in local SQL tooling. SQL proves locks/persistence with an injected no-network provider. Managed browser fixtures prove frontend behavior against isolated real auth/server where stated. Neither proves real Paddle card processing, signed deployed delivery or Netlify cookies.
