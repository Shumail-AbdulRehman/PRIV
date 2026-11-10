# SaaS onboarding sandbox release runbook

Prepared 2026-11-10 from the current source. This is an operator procedure, not evidence of deployed configuration, payment or webhook delivery. Spec 41 performs no deployment, migration, database access or Paddle request.

## Offline preflight

From the repository root, with backend dependencies installed:

```bash
node --experimental-strip-types scripts/billing-flow-preflight.mjs
```

Supply both backend runtime and frontend build variables through a trusted environment. The script reads only the supplied process environment. It does not implicitly load dotenv, contact services or open a database. Node can load private local files explicitly without displaying them:

```bash
node --env-file=backend/.env --env-file=frontend/.env --experimental-strip-types scripts/billing-flow-preflight.mjs
```

Shell variables override env-file values; remove stale overrides before checking a candidate. Never paste env files or print Config Vars into evidence. Output contains fixed variable names and `MISSING`, `INVALID` or `VALID` only. Exit 0 means all syntax checks passed; exit 1 means at least one failed. The script imports the shared backend catalog validator without creating a Paddle client.

Checks require sandbox on both sides, a nonempty `test_` client token, enabled billing, non-placeholder API key and webhook secret of at least 32 characters, a catalog accepted by `getPaddleCatalog`, an HTTPS payment link without credentials/query/fragment, and explicit canonical nonnegative safe integer `TRUST_PROXY_HOPS`. Missing hops fails preflight even though runtime defaults to zero. A syntactically valid catalog may contain a subset; the release should configure all six entries from `backend/config/paddle-sandbox-catalog.json`.

`VALID` does not prove matching sandbox credentials, authorization, webhook delivery, price availability, absence of provider trials, payment-link approval or correct proxy topology. Verify those separately in an authorized sandbox session. This sandbox checker cannot approve production billing.

## Netlify

Use base directory `frontend`, build command `npm run build`, publish directory `dist`.

| Build variable | Requirement |
| --- | --- |
| `VITE_API_BASE_URL` | `/api` for same-origin deployed requests |
| `VITE_PADDLE_ENVIRONMENT` | `sandbox` |
| `VITE_PADDLE_CLIENT_TOKEN` | Client token from the matching sandbox, beginning with `test_` |

Never put the API key or webhook secret in `VITE_` variables. Vite embeds these variables: changing them requires a rebuild. Heroku configuration changes do not update a published bundle.

`frontend/public/_redirects` must ship in `dist`: `/api/*` forwards to `https://cleanops-2f9dbc8f50cd.herokuapp.com/api/:splat` before the missing-assets 404 and SPA 200 fallback. Qualify login, reload and refresh cookies through this proxy. Preserve direct native API access and the webhook endpoint.

## Heroku runtime and proxy hops

| Variable | Requirement |
| --- | --- |
| `PADDLE_ENVIRONMENT` | `sandbox` |
| `PADDLE_BILLING_ENABLED` | `true` for the authorized sandbox candidate |
| `PADDLE_API_KEY` | Matching sandbox server key; runtime length/placeholder validation passes |
| `PADDLE_WEBHOOK_SECRET` | Matching notification-destination signing secret; runtime validation passes |
| `PADDLE_PRICE_CATALOG_JSON` | Array from `backend/config/paddle-sandbox-catalog.json`; no duplicate prices/plan-interval pairs or extra fields |
| `PADDLE_CHECKOUT_URL` | Approved HTTPS default payment-link page, currently `https://cleanops-01.netlify.app/choose-plan`; no credentials/query/fragment |
| `TRUST_PROXY_HOPS` | Explicit integer qualified against the actual request paths below |
| `FRONTEND_URL` | Exact approved HTTPS origins, comma separated, without wildcard/path/trailing slash |
| `COOKIE_SECURE` | `true` in production |
| `COOKIE_SAME_SITE` | Qualify the existing `none` setting with secure cookies through deployed browser paths |

Preserve database/session secrets, explicit token expiries and the schema. Production startup validates these independently. Owner verification/password recovery also need `OWNER_IDENTITY_MAIL_ENABLED=true`, `OWNER_IDENTITY_MAIL_PROVIDER=resend`, `OWNER_IDENTITY_SENDER_VERIFIED=true`, verified `OWNER_IDENTITY_SENDER_EMAIL`, private `OWNER_IDENTITY_RESEND_API_KEY`, and HTTPS origin-only `OWNER_IDENTITY_WEB_ORIGIN`. Provider acceptance is not proof of email delivery. Sandbox payment never waives account restrictions.

The expected browser chain is client → Netlify → Heroku router → Express: two proxy hops. Direct native/webhook/API requests through Heroku have one; local direct requests have zero and Vite → local API has one. These are topology expectations, not measurements of deployed headers. Runtime accepts canonical nonnegative safe integers; invalid input falls back to zero with a name-only warning.

Do not blindly set `TRUST_PROXY_HOPS=2` on public Heroku ingress: a shorter direct path can let client-supplied forwarded addresses affect `req.ip`, weakening rate limits. Use 2 only when ingress enforces both trusted hops on every relevant request and sanitizes forwarding headers. With documented direct paths retained, use the conservative one-hop Heroku setting after verifying its router appends the actual peer address; Netlify traffic may then share a proxy IP for rate limiting. Before release, qualify both paths with synthetic requests including spoofed `X-Forwarded-For`, without logging raw addresses or credentials. Per-path trust or ingress changes need separately scoped implementation. Preflight validates only integer syntax.

## Paddle settings and trial removal

In the sandbox dashboard verify the approved default payment link matches `PADDLE_CHECKOUT_URL`. Keep that hosted HTTPS link while testing localhost. The local card frame does not require a localhost webhook destination.

Verify notification destination `https://cleanops-2f9dbc8f50cd.herokuapp.com/api/webhooks/paddle`, the transaction/customer/subscription events handled by `paddleFulfillment.service.ts`, and matching Heroku signing secret. The raw-body route precedes JSON parsing. Record delivery status and redacted correlations, never payloads or signatures.

The current handler covers `customer.created`, `customer.updated`; `subscription.created`, `subscription.updated`, `subscription.canceled`, `subscription.activated`, `subscription.past_due`, `subscription.paused`, `subscription.resumed`, `subscription.trialing`; and `transaction.created`, `transaction.updated`, `transaction.canceled`, `transaction.paid`, `transaction.ready`, `transaction.billed`, `transaction.past_due`, `transaction.completed`. Retain historical subscription notifications even though new purchases have no trials.

New purchases have no free trial. In a separately authorized sandbox session, preview all six repository prices first, from `backend`:

```bash
npx tsx scripts/removePaddleTrials.ts
```

Default dry run still reads real Paddle. Inspect `WOULD_REMOVE`, `ALREADY_CLEAR` or `FAILED` before separately authorizing writes:

```bash
npx tsx scripts/removePaddleTrials.ts --apply
```

The script rejects non-sandbox configuration, updates only the fixed six price IDs with `trialPeriod: null`, preserves each billing cycle, and reads back each attempted update. Require `REMOVED` or `ALREADY_CLEAR` for all six; any `FAILED` stops release approval. Rerun preview to confirm all six clear. Independently verify active price/product, month/year cycle at frequency 1, currency and amount. Runtime makes prices with trials unavailable; preflight cannot inspect provider terms. Existing historical `trialing` subscriptions retain access policy. Do not alter production terms or delete old audit facts.

## Localhost checkout and confirmation

Use an explicitly provisioned isolated local test database and synthetic owners. Never start the API against an application database: startup imports background jobs. This procedure does not provision a database or run migrations. Keep backend credentials private, use the same sandbox as the browser, and retain the approved hosted default payment link.

Run `npm run dev --prefix frontend`: Vite binds `127.0.0.1:5173` and proxies `/api` to `127.0.0.1:8080`. Local frontend configuration needs `VITE_API_BASE_URL=/api`, sandbox environment and `test_` token. An independently started local development API needs its isolated test database, development origin policy and HTTP cookies (`COOKIE_SECURE=false`, `COOKIE_SAME_SITE=lax`). Use a measured local hop count (one through Vite, zero direct). Never copy local cookie/origin settings into production.

In a separately authorized real sandbox test, create a synthetic local owner, choose a trial-free plan, wait for `checkout.loaded`, then use Paddle sandbox test-card guidance. Webhooks still go to Heroku; they do not write the isolated local database. Heroku may reject unmatched local-company events. Never relink companies or change the shared destination to make a local test pass.

Confirmation still works: the local activation screen calls `POST /api/subscription/manage/checkout/confirm` with `{}`. The local server reads the exact saved READY transaction, verifies customer/reservation/price/subscription, and invokes shared `applyPaddleSubscription` under the company lock. A fresh lifecycle must grant workspace access before explicit workspace entry. Browser events grant nothing and arbitrary transaction IDs are never accepted. A pending subscription or outage can keep processing; polling ends at 120 seconds and offers retry. Timeout never proves nonpayment or allows a second purchase.

## Release order and rollback

1. Record reviewed frontend/backend revisions and previous Heroku release/Netlify deploy identifiers. Require completed implementation dependencies and isolated tests. Run offline preflight against intended build/runtime configuration.
2. An authorized operator verifies sandbox dashboard settings and previews trial removal. Apply only with separate authorization; verify all six prices clear before sales.
3. Publish additive backend and sandbox configuration first. Verify owner-only lifecycle/checkout/confirm/reconcile routes and signed webhook mount; preserve existing subscriber portal and historical reads.
4. Build and publish the matching Netlify frontend, redirects and sandbox client token. Verify same-origin auth and matching sandbox environments.
5. In a separately authorized sandbox session verify synthetic signup → plan → inline card → paid confirmation → explicit workspace entry, reload/login continuity, unpaid draft replacement and reservation recovery. Check no duplicate purchase or suspension bypass. Record real results and sanitized request IDs; this procedure is not completed evidence.
6. Mobile logo/icon changes require a **new APK build and installation**. Web deployment cannot update installed Android launcher icons.

Docker Compose still lacks Paddle runtime/frontend build settings and is not used for this release. Spec 41 makes no Compose changes.

On failed release verification, restore the recorded compatible frontend/backend/configuration pair. Preserve reservations and append-only audits; rollback does not reverse a charge. For uncertain creation/payment, use owner-scoped server status/reconcile actions and retain holds until provider outcome is proven. Never clear holds manually, recreate accounts or grant access from browser state.

## Safe local proof

From repository root with installed dependencies:

```bash
export DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null
(cd frontend && node --experimental-strip-types --test tests/billing-flow-preflight.test.mjs)
npm test --prefix frontend
(cd frontend && npx tsc -b --noEmit)
npm run lint --prefix frontend
npm run build --prefix frontend
```

These use fake environments and mocks. Real Paddle, deployed cookies and webhook delivery remain separate authorized verification work.
