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

- [x] `cd backend && npx vitest run src/services/billingProvider.test.ts` passes and proves: each error shape classifies correctly; the existing-customer ID is parsed; a hung call ends at the limit as UNCERTAIN; logs contain no email or detail text. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/08-paddle-gateway.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Implemented the additive gateway for all 11 specified SDK operations, using the existing lazy `getPaddleClient` and an injected client/logger seam. Confirmed method signatures, `ApiError` fields and collection behaviour directly in installed SDK 3.10.0 declarations and implementation. Every request/page has a 15-second deadline; late results are discarded and late rejections consumed. Errors expose safe classification/code/customer-ID facts without provider detail or payloads. Failure logs encode the fixed operation in the allowlisted event and include only classification and safe provider code. No retries, customer adoption decisions or catalog cache were added.
- **2026-11-09** — Added exact-email/status customer listing and filtered transaction listing, each limited to five pages of 100 rows. List results expose `hasMore` so reaching the limit cannot masquerade as an exhaustive search. Failed pages throw instead of returning partial results as complete. Wrote and inspected `inventory/08-paddle-gateway.md` for the reusable API, error contract, limits and test seams.
- **2026-11-09** — All Done-when commands ran and passed in this session: focused `npx vitest run src/services/billingProvider.test.ts`: **78 passed, 0 failed, 0 skipped** (1 file); `npm test --prefix backend`: **1,720 passed, 7 skipped, 0 failed** (101 files passed, 1 skipped); `npx tsc --noEmit -p tsconfig.json`: **0 errors**; `npm run build --prefix backend`: **passed**, including Prisma client generation and TypeScript emission, with no warnings reported. `git diff --check` also passed. Backend has no lint script.
- **2026-11-09** — Used the dummy loopback-port-1 `DATABASE_URL` and `DOTENV_CONFIG_PATH=/dev/null`; disabled opt-in database test URLs for the whole suite and also set a dummy `DIRECT_URL` for the build. The seven SQL persistence tests were skipped because their isolated database was deliberately unavailable. All gateway calls used mocks and deadline checks used fake timers. No real Paddle or database verification was attempted, and none is needed by this spec's acceptance commands. No migration, deployment, commit, branch command, issue or PR was run. No existing tests required the guide's test-only exception. Only the owned gateway/test/inventory and this spec's checklist/Log changed; its Status line and `PROGRESS.md` were left unchanged.
