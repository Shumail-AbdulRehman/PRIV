# Spec 26 — Prepare and replace checkout

## Checkout service

- `backend/src/services/billingCheckout.service.ts` exports `createBillingCheckout(actor, raw, deps?) -> Promise<BillingCheckoutDto>` for specs 36/39 to adopt. The legacy lifecycle service and HTTP wiring remain unchanged within their owners' scope.
- Input is strictly `{ plan, interval }`. Every request checks the active company owner, suspension, live email verification, billing activation, checkout URL, trial-free catalog and linked-subscription guards. Linked subscribers receive 409 directing them to the billing portal.
- Dependencies accept `db`, `now`, and the gateway's customer, product, price-read and transaction create/get/update surfaces. The defaults use the shared lazy gateway and catalog reader. Customer provisioning delegates to `ensureBillingCustomer`; all reservation reads/writes use the shared facts service.
- New drafts send `customData: { checkoutReservationId }`, one configured price at quantity 1, automatic collection and the configured checkout URL. The reservation commits before the provider create. READY is appended under the company lock after fresh authorization and customer-link checks. No subscription access or transaction mirror is written here.
- Results always include `{ transactionId, reused, replaced }`. A matching open draft is verified by an exact provider read and reused. Paid/billed/completed provider or mirrored transactions return 409 with `CHECKOUT_PAID`.
- Replacement holds the company row lock through the exact provider read, `transactions.update(id, { status: 'canceled' })`, CANCELED fact and new reservation. Its transaction timeout is 40 seconds to accommodate two 15-second gateway deadlines. Provider creation runs after that transaction commits. This serializes competing replacements across API processes without an in-memory mutex.
- Reads and cancellation acknowledgements must match the saved transaction, canonical customer and reservation custom data when present. A cancellation must prove `canceled` with no subscription before a new reservation can be made. Uncertain reads/cancels append nothing and return 503. A later exact read may establish that a lost cancellation actually succeeded.
- Proven create `REJECTED`/`RATE_LIMITED` responses append `CHECKOUT_FAILED` and permit retry. Uncertain errors, deadlines, invalid success responses and lost READY persistence retain the open reservation. Recovery of open reservations remains with spec 28.

## Verification seam

- `backend/src/services/billingCheckout.service.test.ts` exercises the real customer, catalog and facts helpers with one shared stateful database/provider fixture. The fake serializes on `FOR UPDATE`, rolls back local writes and preserves remote effects independently.
- Covers concurrent prepares/replacements, reuse, plan/interval replacement order, paid/cancel races, lost cancel responses, rejection retry, create/cancel gateway deadlines, late success, authorization, tenant/customer/reservation correlation, trial rejection and persistence rollback. No real Paddle or database access is required.
