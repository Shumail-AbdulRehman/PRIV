# Spec 08 — Paddle gateway with time limits

## Gateway

- `backend/src/services/billingProvider.ts` exports the lazy shared `billingProvider`, `createBillingProvider({ client?, log? })`, the `BillingProvider` type and the narrow `BillingProviderClient` injection seam. The default reuses `getPaddleClient`; constructing a gateway does not read credentials or make a request.
- The SDK-shaped surface wraps `customers.create/list`, `prices.get/update`, `products.get`, `transactions.create/get/list/update`, `subscriptions.get` and `customerPortalSessions.create`. Non-list arguments and result entity types retain the installed SDK signatures, including optional query parameters.
- `BILLING_PROVIDER_TIMEOUT_MS` is 15,000. Each request, including each list page, gets its own deadline. The installed SDK has no abort-signal seam, so timeout discards late results and consumes late rejections. It does not prove a remote write failed and never retries a call.

## Failure contract

- Every failed call throws `BillingProviderError` with `operation`, `classification`, `providerCode` and `customerId`. It copies no raw provider error, detail, payload or cause. `classifyBillingProviderError(unknown)` exposes the same safe failure facts for reuse.
- Only installed SDK `ApiError` instances can establish a provider rejection. `too_many_requests` maps to `RATE_LIMITED`; `customer_already_exists` maps to `CUSTOMER_EXISTS`; remaining `request_error` failures map to `REJECTED`. Timeout, network, `api_error`, lookalike objects and unknown errors are `UNCERTAIN`.
- Customer conflicts parse one distinct valid `ctm_` ID from detail. Missing, malformed or ambiguous IDs produce `customerId: null`; parsing grants no permission to adopt a customer. Provider codes are bounded identifiers or `null`.
- Failures go through the existing operational logger. Its allowlist has no operation field, so the fixed operation is encoded in `event`, for example `BILLING_PROVIDER_CUSTOMERS_CREATE_FAILED`. The only other fields are `errorClass` (the failure classification) and safe `providerCode` when present. No provider detail, customer ID, email, token or request data is logged.

## Bounded searches

- `customers.list({ email, status })` sends the SDK's exact `email: [email]` filter and explicit status array, never the broad `search` filter. Adoption and company-link checks belong to spec 17.
- `transactions.list(query)` preserves SDK transaction filters and cursors. Both list helpers enforce `BILLING_PROVIDER_PAGE_SIZE = 100` and `BILLING_PROVIDER_MAX_PAGES = 5` using explicit `collection.next()` calls.
- Lists return `BillingProviderList<T> = { data, hasMore }`. Callers must inspect `hasMore` before interpreting a result as exhaustive. A failed or timed-out page throws instead of returning partial data as a completed search.

## Verification seam

- `backend/src/services/billingProvider.test.ts` uses an injected client, the shared logger with a captured sink, and fake timers. It covers all 11 wrapped operations, classifications, customer-ID parsing, safe errors/logs, hung and late calls, SDK argument/receiver preservation and bounded pagination with per-page deadlines. No provider or database is used.
- This spec is additive. Replacement of legacy lifecycle provider calls remains with the later service specs that own those files.
