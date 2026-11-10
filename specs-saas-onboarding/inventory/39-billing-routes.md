# Spec 39 — Billing HTTP routes

- `backend/src/routes/billingLifecycle.route.ts` retains the existing owner-only router under `/subscription/manage`. All router responses, including authentication and service failures, carry `Cache-Control: private, no-store`.
- `POST /checkout` calls the spec 26 `createBillingCheckout` service directly, preserving its 201 response and `{ transactionId, reused, replaced }` data.
- `POST /checkout/confirm` accepts exactly `{}` and returns the spec 27 `{ outcome, lifecycle }` result in the existing 200 `ApiResponse` envelope.
- `POST /checkout/reconcile` accepts exactly `{}`, calls spec 28 `reconcileBillingReservations`, then reads `getBillingLifecycle` for the same authenticated owner and returns `{ outcome, lifecycle }` in a 200 `ApiResponse` envelope.
- Strict input uses Zod; service errors propagate to the existing shared error handler so stable codes remain available to clients. No request field selects a company or transaction. Lifecycle, catalog and managed portal adapters remain available; the webhook mount is unchanged.
- `backend/src/routes/billingLifecycle.route.test.ts` exercises local HTTP with real JWT verification, authorization and shared error handling, plus mocked Prisma and billing services. Covers owner session checks, manager/staff denial, strict empty bodies, all confirm/reconcile outcomes, fresh lifecycle composition, stable errors and no-store headers. Primitive JSON is rejected by the upstream JSON parser before the router runs.
