# Spec 09 — Reservation facts

## Shared reservation service

`backend/src/services/billingReservations.service.ts` is additive. The legacy lifecycle implementation remains until spec 36 adopts these helpers.

- `BILLING_RESERVATION_GRACE_MS` is 120,000. `readBillingReservation(company, operation, deps?)` reads the latest company-scoped `CUSTOMER_CREATE` or `CHECKOUT` reservation and returns `none`, `inProgress`, `reconcile`, or `closed` with its reservation and closing fact. Elapsed time never closes a hold. At exactly 120 seconds an open reservation needs reconciliation.
- Closing actions are `CUSTOMER_CREATE_READY`, `CUSTOMER_CREATE_FAILED`, `CHECKOUT_READY`, `CHECKOUT_FAILED` and `CHECKOUT_CANCELED`. Facts must match the company, entity, operation and numeric reservation ID and follow the reservation in audit order. READY additionally preserves the canonical customer, catalog and tenant-mirror checks. CANCELED cannot refer to a different saved draft. The newest valid closing fact wins, allowing CANCELED after READY.
- `customerReconciliationPending(company, deps?)` reports any open customer hold, including one inside grace. A matching FAILED clears it; malformed/foreign facts do not.
- `inspectBillingCheckout(company, deps?)` returns `resume` with the existing `BillingCheckoutResume`, `none`, `canceled`, `pending`, `inProgress`, or `reconcile`. It preserves legacy unmirrored READY compatibility, exact customer/tenant correlation, canonical subscription handling and the refusal to resume paid/billed/completed/unknown transactions. FAILED returns `none`; CANCELED returns `canceled`.
- `reserveBillingOperation(actor, operation, details, deps?)` rechecks the active owner, company status, live email verification and linked-subscription guards under the existing parameterized Company `FOR UPDATE` lock. It returns `{ reservationId }`, `{ existingCustomerId }`, or `{ ready }`. An open hold throws 409 with `IN_PROGRESS` or `RECONCILIATION_REQUIRED`; a failed/canceled hold permits a fresh reservation. A valid draft is reused. Pass the catalog `{ plan, interval, priceId }` for CHECKOUT and `{}` for CUSTOMER_CREATE.
- `recordBillingReservationFact(actor, fact, deps?)` accepts the discriminated `BillingReservationFact` union, validates correlation under the company lock and appends through `writeAuditLog`. Repeating the same fact is idempotent. Contradictory terminal facts are refused; a prepared draft can subsequently be canceled. Malformed/stale facts do not prevent appending a valid fact. Safe failure codes include `REJECTED`, `EMAIL_CONFLICT` and the gateway's lowercase provider codes. Callers establish provider proof; this module never calls Paddle or turns a timeout into a failure fact.

## Injection and atomic composition

All helpers accept injected `db` and `now`. `deps.tx` accepts a `BillingReservationClient` to compose facts with customer/transaction mirror and company-link writes in one caller-owned transaction; mutations still acquire the Company lock and avoid a nested transaction. READY requires the canonical linkage (and a mirror for `confirmedByProvider`) to exist in that transaction before recording it.

Exported support types: `BillingReservationOperation`, `BillingReservationCompany`, `BillingReservationClient`, `BillingReservationState`, `BillingCheckoutInspection`, `BillingReservationFact` and `BillingReservationResult`.

## Verification seam

`billingReservations.service.test.ts` uses an injected clock and shared stateful database fake. Its transaction fake serializes only when the service executes `FOR UPDATE`, covering concurrent first attempts and retries after failure. It tests every closing action, tenant/reservation/action mismatches, malformed and stale facts, grace boundaries, legacy resume behavior, paid holds, append-only/idempotent recording and caller-transaction composition. No SQL or provider call is used.
