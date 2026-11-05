# Restore and test owner onboarding

Verified 2026-11-05. This is the existing Paddle Billing integration. No database migration is needed for these fixes.

## What broke

The deployed browser requested an old hashed SubscriptionPage JavaScript chunk. Netlify's catch-all returned index.html with HTTP 200, which the browser rejected as a JavaScript module. A clean browser could load the current module. The client now recovers one failed module load per minute and HTML is revalidated. Missing assets return a text 404, while real files and SPA routes remain available.

The earlier billing rewrite replaced the old plan picker with the canonical owner billing page. That page required verified email and production policy/support readiness, and the server requires an explicitly enabled price catalog. The sandbox had six active recurring prices, but the local backend environment lacked the catalog and activation flag. These are distinct from the stale-module crash; Heroku configuration must also be checked.

New owners now remain in onboarding until a subscription is linked, including after a Paddle customer/draft transaction exists. Sandbox owners skip email verification without marking their email verified. The policy/support purchase gate is skipped only when the server reports sandbox and the browser uses sandbox credentials. Live checkout retains its verification and policy requirements. Checkout returns wait for a qualified active/trialing provider subscription, then continue to the dashboard.

## Heroku: cleanops

Set these Config Vars (or run this command from the repository with an authenticated Heroku CLI):

```bash
heroku config:set --app cleanops \
  PADDLE_ENVIRONMENT=sandbox \
  PADDLE_BILLING_ENABLED=true \
  PADDLE_CHECKOUT_URL=https://cleanops-01.netlify.app/choose-plan \
  PADDLE_PRICE_CATALOG_JSON="$(cat backend/config/paddle-sandbox-catalog.json)"
```

The JSON file contains only the six existing sandbox price IDs, verified against their active products and recurring intervals. All six currently have a seven-day trial with requires_payment_method=true. It contains no credentials. Paste its JSON value directly if using the dashboard.

Retain the matching sandbox PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET as private Config Vars. FRONTEND_URL must be exactly `https://cleanops-01.netlify.app`, COOKIE_SECURE=true and COOKIE_SAME_SITE=none. DATABASE_URL must point at the current application schema. No data copy, reset or schema change is part of this fix.

The sandbox's active notification destination was verified as `https://cleanops-2f9dbc8f50cd.herokuapp.com/api/webhooks/paddle`, with transaction and subscription events subscribed. Its signing secret must match Heroku. Do not paste secrets into chat, source control or command output.

## Netlify: cleanops-01

Build main with VITE_PADDLE_ENVIRONMENT=sandbox, the matching test_ VITE_PADDLE_CLIENT_TOKEN, and VITE_API_BASE_URL=https://cleanops-2f9dbc8f50cd.herokuapp.com/api. The browser token is different from the server API key. Environment changes require a new frontend build. Retain frontend as the build base, its npm build command and dist publish directory.

Use the latest main deploy. Reload any tab opened before the new recovery handler was deployed once; that older JavaScript cannot recover itself. No account needs to be recreated.

In Paddle Sandbox > Checkout settings, retain a default payment link on this site's /choose-plan URL. Paddle hosts the card fields; the app never collects or stores card numbers. Server transactions, customer ownership, reservation locks and webhook activation remain authoritative.

## Test the flow

1. Create a new company owner. Account creation persists an account and session; it does not buy or activate a plan.
2. The visible Choose your plan page must show configured monthly/yearly prices and a sandbox notice, with no verification requirement.
3. Choose a plan. Continue to checkout opens the Paddle overlay for the server-created transaction. In sandbox use card 4242 4242 4242 4242, a future expiry and CVV 100. Provider-defined trials appear only if the actual price has one.
4. Complete checkout. /welcome returns to billing while webhook synchronization is pending, then takes the owner to the dashboard after a qualified active or trialing subscription is recorded. Do not buy a second subscription while activation is pending.
5. If synchronization stays pending, inspect Paddle delivery logs and Heroku logs for that transaction; confirm the signing secret and environment/catalog match. A completed browser checkout alone never grants access.

Sources checked 2026-11-05: [Vite load errors](https://vite.dev/guide/build#load-error-handling), [Paddle sandbox](https://developer.paddle.com/sdks/sandbox/), [Paddle overlay checkout](https://developer.paddle.com/build/checkout/build-overlay-checkout/), [subscription-created webhook](https://developer.paddle.com/webhooks/subscriptions/subscription-created/).

## Validation boundaries

The browser regression deliberately returns a missing billing module before exercising signup, the actual billing UI, plan selection, sandbox SDK initialization, pending activation and the dashboard handoff. Billing lifecycle/checkout and the Paddle browser boundary are fixtures in its payment portion; it does not submit a real card or call Paddle. The separate PostgreSQL integration uses actual application tables, locks and webhook fulfillment with a no-network provider seam. Read-only provider inspection verifies that the real sandbox prices and notification destination still exist. A successful deployed sandbox card payment must be verified after the remote configuration and both deploys are current.
