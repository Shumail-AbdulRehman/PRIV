# Spec 28 — Repair stuck reservations

## Reconciliation service

- `backend/src/services/billingReconcile.service.ts` exports `reconcileBillingReservations(actor, deps?) -> Promise<BillingReconcileOutcome>`. Dependencies accept `db`, a read-only customer/transaction `provider` surface, and `now`. The route can compose the outcome with a fresh lifecycle read; route wiring stays with spec 39.
- Uses spec 09's `readBillingReservation` and `recordBillingReservationFact` for every hold read and fact write. An open reservation inside the shared 120-second grace returns `IN_PROGRESS` without provider reads or mutations. Existing closing facts give stable outcomes without repeating provider searches.
- Customer recovery requests the exact owner email with both active and archived statuses. Exhaustive, unique reservation metadata recovers READY; legacy adoption requires an exact case-insensitive email, active customer, safe tenant linkage, and sandbox or verified owner. Conflicts append `CUSTOMER_CREATE_FAILED` with `EMAIL_CONFLICT`; exhaustive absence appends `NOT_FOUND`. Duplicates, incomplete results and failed reads remain `UNRESOLVED`.
- Follows spec 17's customer linkage and mirror preservation rules. Its create-capable `ensureBillingCustomer` is deliberately not called: reconciliation performs provider reads only and must recover the existing hold. Customer mirror/link/READY commit together under the Company lock.
- `BILLING_RECONCILE_MAX_PAGES = 10`. Transaction searches reuse the shared gateway's five-page batches, continuing from the final transaction ID with `after` and `orderBy: 'id[ASC]'`. The service exhausts the listing before accepting one `checkoutReservationId` match. Cap exhaustion, duplicate matches/rows, uncertain reads and unsafe correlation stay unresolved.
- Draft/ready matches atomically mirror the transaction and append `CHECKOUT_READY` with `confirmedByProvider: true`, returning `RESUMABLE`. Paid/billed/completed use the same evidence and return `PAID`. Canceled matches append `CHECKOUT_CANCELED`; exhaustive absence appends `CHECKOUT_FAILED` with `NOT_FOUND`; both return `CLEARED`. Newer webhook mirror versions are preserved.
- Active owner and company scope are checked under the Company row lock before reads and again before writes. Provider reads run outside database transactions. A changed reservation, email or canonical customer cannot be finalized using stale evidence. Mirror/link/fact writes roll back together on failure.
- No Paddle create, update or cancel calls, subscription linkage, subscription access writes, migrations or schema changes.

## Verification seam

- `backend/src/services/billingReconcile.service.test.ts` uses the real reservation helpers, injected provider and clock, and a stateful database fake with lock serialization and rollback. Covers grace, all recovery outcomes, legacy adoption, unsafe/foreign matches, pagination, duplicate detection, stable repeats, concurrent requests, newer webhook evidence, changed owner state and atomic persistence failures.
- Includes a real gateway with a fake SDK collection to verify exactly ten pages at the cap. Every focused test checks that provider create/update spies remain unused and no subscription is linked. No real database or Paddle calls are required.
