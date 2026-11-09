# Spec 17 — One Paddle customer per company

## Customer service

- `backend/src/services/billingCustomer.service.ts` exports `ensureBillingCustomer(actor, deps?) -> Promise<string>`, returning the company-scoped Paddle customer ID. Dependencies accept `db`, `provider` (the gateway's customer surface), and `now`; the default gateway is lazy.
- Reuses `reserveBillingOperation` and `recordBillingReservationFact` for every audit write. A linked customer is reused only with its matching tenant mirror. Reservations and final mirror/link/READY writes use the Company row lock; the latter commit atomically in one transaction.
- Creation sends SDK `customData: { companyId, customerReservationId }` (Paddle wire `custom_data`). `REJECTED` and proven `RATE_LIMITED` responses append FAILED and permit retry. Unknown errors, timeouts, invalid success responses, incomplete lists and uncertain reads leave the hold open for spec 28.
- `CUSTOMER_EXISTS` triggers an exact-email list with `status: ['active', 'archived']`. Adoption needs an exhaustive single active match, case-insensitive exact email, sandbox or verified owner, and no foreign mirror or canonical company linkage. Provider error-detail IDs never authorize adoption. Archived/ambiguous/mismatched/foreign matches append FAILED with `EMAIL_CONFLICT`; success appends READY with `adopted: true`.
- Rechecks identity, email, verification, company status and linkage under the final lock. An existing mirror keeps newer webhook fields. Database failures roll back mirror/link/READY together and retain the original hold.
- Legacy `billingLifecycle.service.ts` remains outside this spec's ownership. Specs 26 and 36 consume this additive service and replace the legacy caller.

## Verification seam

- `backend/src/services/billingCustomer.service.test.ts` has 48 focused cases using the real facts service, injected customer provider, clock, and a stateful database fake with row-lock serialization and rollback. Covers retry, adoption guards, concurrency, atomic persistence, authorization and a real gateway deadline with a late success. No real database or Paddle calls.
