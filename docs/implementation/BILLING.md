# Paddle lifecycle boundary

Spec15 retains Paddle, its SDK and existing provider mirror tables. It does not create a billing engine, local trial, price, refund rule or proration policy. The new APIs are mounted under `/api/subscription/manage`: owner-only GET lifecycle/catalog and POST checkout/managed-portal. The incumbent owner POST portal-session delegates to the same guarded service. Pricing-context and enterprise inquiry remain outside the protected manage namespace.

## Configuration and external activation gate

No live provider requests, financial operations or production changes were performed during development. The default commercial state is unavailable. Before enabling, the business owner must qualify the merchant account/eligibility, real environment catalog, terms and sandbox flows in release39/e2e40. No environment files or real credentials were supplied/overwritten.

- `PADDLE_ENVIRONMENT`: explicit sandbox or production, never inferred.
- `PADDLE_API_KEY`: actual corresponding provider key; no default.
- `PADDLE_WEBHOOK_SECRET`: actual matching endpoint verification secret, at least32 characters; placeholder/weak values rejected. Native SDK verifies untouched raw bytes/signature.
- `PADDLE_PRICE_CATALOG_JSON`: JSON array of objects with exactly `plan` (existing STARTER/PRO/ADVANCED), `interval` (month/year) and actual environment `priceId`. At most6 unique plan/intervals and provider price IDs; no built-in catalog IDs or amounts. Do not copy fixture IDs from tests.
- `PADDLE_CHECKOUT_URL`: real approved HTTPS payment page, with no credentials/query/fragment. The React checkout integration in32 must consume the server-created transaction ID. It must not open a second price-only purchase on refresh or failed response.
- `PADDLE_BILLING_ENABLED=true`: explicit activation only after the preceding external business/provider facts are qualified. Otherwise checkout/catalog/portal return unavailable; stored subscription metadata can still be read by its owner.

The catalog API reads actual active prices/products, billing cycle, amount/currency and optional trial facts from Paddle. It does not convert a status string or local clock into a free trial. Existing plan capacity limits are retained. Unknown catalog items or mismatched customer/subscription/plan cannot grant new operational work/capacity through the shared14 policy.

## Trust and persistence

Company.billingCustomerId is the canonical server-established provider relationship. Customer email and checkout customData are never ownership proof. New customer provisioning requires a current owner with verified email; owner verification is16. Legacy owner/customer linkage must be checked against actual provider identity before cutover; do not auto-link or repair records by email. No existing provider/customer/company records are deleted or reset.

Webhook entity changes and event_id marker commit together. Company→provider locking shares14 quota ordering; provider-customer and event advisory locks serialize duplicates/unlinked mirrors. Compare occurred_at and provider version before replacing stored state. A transaction's unknown subscription placeholder has epoch version, allowing earlier subscription.created to supply authoritative facts. All supported customer, subscription state and transaction lifecycle notifications are mirrored; unknown event types are acknowledged without granting access. Transaction payment alone does not fabricate an active subscription or period.

A provider-created customer is linked only from its authenticated server response. The portal uses only the actor's canonical customer/mirrored subscriptions, generates a fresh provider-hosted temporary URL and sends private/no-store. No portal URL/token is saved or logged. SDK/provider failures expose a generic unavailable message, not private payloads.

## Checkout uncertainty and recovery

Paddle does not promise arbitrary client idempotency keys. A company-locked AuditLog reservation is committed before requesting one automatically-collected **draft**, with a ready record for the returned transaction ID. Draft creation is not a charge. Repeating a resolved request reuses its transaction ID; a linked subscription uses the provider portal. A provider-confirmed canceled draft may be replaced; paid/completed transactions await synchronization. No local expiry, assumed charge failure, automatic new purchase or destructive cleanup is introduced.

If a request fails after a provider operation may have happened, retain its reservation and stop duplicate purchase attempts. A signed transaction event can resolve a checkout only after matching the canonical company/customer, existing reservation, exact price and quantity; it never establishes customer ownership. Conflicting provider IDs require review. Lifecycle metadata marks unresolved requests as requiring reconciliation. Qualified support must inspect the actual provider customer/transactions and reservation reference before recording any resolution. Absence in one eventually-consistent API listing is not proof that an earlier operation failed. No production repair command or automatic reservation reset is supplied. This is a deliberate rare failure boundary; operator recovery qualification remains release39. Do not delete markers or ask a customer to pay twice.

## Browser integration and required live proof

Spec32 replaces the legacy browser price-only checkout with owner-scoped lifecycle/catalog and server-created transaction handoff. Existing linked subscriptions use the managed portal; public pricing never starts a payment or promises a fixed trial. The old choose-plan route redirects to owner billing; the checkout return redirects with a pending hint, never payment proof. Spec26 already composes owner billing/security access for restricted companies separately from operations. Spec39 must qualify actual provider/merchant/terms before release. Do not report full billing availability from mocked calls or synthetic provider IDs.

Required sandbox proof: verified owner/customer setup, one initial checkout, trial facts only if genuinely configured, raw signed event duplicates/reordering, paid/active/past-due/pause/cancel/resume, scheduled changes at actual effective dates, lost response/reservation reconciliation, canceled draft retry, repeated checkout rejection, correct owner portal and cross-tenant denial. Verify the real sandbox/production portal host and that client-supplied customer IDs/customData cannot attach an unauthorized purchase. Check legacy canonical links and catalog fit with an approved migration/rollback plan before any production cutover. No legal terms or merchant eligibility are assumed.

## Evidence and sources checked 2026-10-20

Local fixtures use a guarded dedicated loopback test database only. The installed SDK verifies real HMAC signatures and tamper rejection in unit tests. Local PostgreSQL proves atomic dedup/rollback, canonical ownership, early placeholder convergence, catalog denial and concurrent one-draft request safety. Provider clients in those checks are injected no-network fixtures; they do not prove a real merchant, portal or payment.

- [Paddle webhook delivery/order](https://developer.paddle.com/webhooks/about/how-webhooks-work/): event identifiers and occurred_at ordering; native signature verification remains the SDK seam.
- [Provider access and state guidance](https://developer.paddle.com/build/subscriptions/provision-access-webhooks/): retain mirrors and consume provider status/period/item facts. D01 uses the approved restricted unpaid-access policy rather than inventing commercial grace.
- [Trials and provider periods](https://developer.paddle.com/build/trials/extend-activate-change-date-trials/): trial timing is provider-owned; paused/canceled periods can be null, never guessed locally.
- [Create transactions](https://developer.paddle.com/api-reference/transactions/create-transaction/): server-created draft and checkout transaction handoff.
- [Portal sessions](https://developer.paddle.com/api-reference/customer-portals/create-customer-portal-session/): temporary authenticated hosted links, not cached; provider manages subscription changes/cancellations.
- [Paddle SDK behavior](https://developer.paddle.com/sdks/libraries/): no arbitrary client idempotency guarantee. Installed3.10.0 declarations inspected for customers, prices, transactions, notifications and portal sessions.

## Spec32 browser safety and evidence

The actual React owner page reads `/subscription/manage/lifecycle` and configured `/catalog`, identifies query caches by company and owner, and rechecks the current principal and lifecycle before any explicit action. Initial checkout posts only `{plan,interval}` to `/checkout`; Paddle.js opens the returned server transaction ID, never client-owned price/customer/customData. A resolved draft can be reopened locally without a new POST. Uncertain requests block new attempts until explicit status reconciliation; no automatic purchase retries. Portal URLs are requested directly from `/managed-portal`, validated, navigated immediately and never retained in query/mutation/browser storage.

Provider periods, status, scheduled change and last-event timestamps remain separate from workspace permissions; null dates stay unavailable. Counts use actual active resource data and show over-limit records without offering deletion. Catalog amounts use the currency's actual minor-unit precision; trial copy appears only from an actual provider trialPeriod. Existing activation configuration is the commercial qualification gate; this unit does not enable it or invent terms.

Relevant local verification commands/counts and visual evidence are recorded in spec32 Log and inventory32. Network-mocked component/presentation checks do not qualify live Paddle checkout, payment, portal, webhooks or merchant/legal readiness; those gates remain39/40.

## V5 web acceptance — 2026-10-29

Spec32 now implements the approved billing main stack/help rail and actual owner inactive/suspended recovery composition. Lifecycle company DTO additively exposes existing isActive; no schema or access policy changes. Provider state remains separate from workspace permissions; active unpaid reads remain permitted by existing API. Matching actual React/private API/disposableSQL EN/UR desktop/phone evidence and executed checks are in [V5_BILLING.md](V5_BILLING.md). Configured-positive checkout/portal still require real external merchant/catalog/terms/sandbox qualification. No payment, live subscription, provider activation or production operation occurred.
