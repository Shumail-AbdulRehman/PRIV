# Spec 08 — Paddle gateway with time limits

**Status:** Not started
**Depends on:** Spec 01, Spec 02
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingProvider.ts`, `backend/src/services/billingProvider.test.ts`, `specs-saas-onboarding/inventory/08-paddle-gateway.md`
**Reuses:** `backend/src/config/paddle.ts`, `backend/src/utils/operationalLog.ts` (spec 02), `docs/plan-project/saas-onboarding/research/paddle.md`

## Goal

Create the single module this flow uses to call Paddle, with a time limit on each call and a precise failure classification.

## Scope

- Wrap: `customers.create`, `customers.list` by exact email and status, `prices.get`, `products.get`, `prices.update`, `transactions.create`, `transactions.get`, `transactions.list`, `transactions.update`, `subscriptions.get`, `customerPortalSessions.create`.
- 15 second limit per call. A late result is discarded.
- Classify failures: `REJECTED` (SDK `ApiError` with type `request_error`), `RATE_LIMITED` (code `too_many_requests`), `CUSTOMER_EXISTS` (code `customer_already_exists`, with the `ctm_` ID parsed from `detail`), `UNCERTAIN` (timeout, network, `api_error`, anything unknown).
- Log every failure through the operational logger with operation, class and provider code only.
- Accept an injected client so tests make no network calls.

## Explicit non-scope

- Deciding what to do about a failure → spec 17.
- Catalog caching → spec 15.

## Reuse first

- Use `getPaddleClient`. Do not construct a second SDK client.
- Confirm each method and `ApiError` field in the installed SDK under `node_modules/@paddle/paddle-node-sdk/dist/types` before use.

## Steps

1. Confirm SDK signatures, and that iterating a collection needs a page limit.
2. Build the time-limit wrapper.
3. Build the classifier.
4. Expose list helpers with a bounded page count.
5. Test each class, a hung call and log contents.
6. Record what you created in `specs-saas-onboarding/inventory/08-paddle-gateway.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/billingProvider.test.ts` passes and proves: each error shape classifies correctly; the existing-customer ID is parsed; a hung call ends at the limit as UNCERTAIN; logs contain no email or detail text. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/08-paddle-gateway.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
