# Spec 18 — Shared subscription fulfilment

**Status:** Done
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/paddleFulfillment.service.ts`, `backend/src/services/paddleFulfillment.service.test.ts`, `specs-saas-onboarding/inventory/18-fulfillment-seam.md`
**Reuses:** `backend/src/services/accountAccess.service.ts`

## Goal

Let a server read of Paddle apply a subscription through the exact same code path as a signed webhook.

## Scope

- Export a function that applies provider subscription data for a known customer, under the same company and customer locks and the same version check.
- It writes no `PaddleWebhookEvent` row, so a later real webhook still processes.
- An older webhook arriving afterwards cannot regress newer data.
- Webhook behaviour is otherwise unchanged. Transaction webhooks stay accepted in any order.
- New `trialing` subscriptions are accepted without crashing, so an untouched old price cannot break a paying user, but a new checkout cannot select a trial price (spec 15).

## Explicit non-scope

- Deciding when to call it → spec 27.
- Webhook endpoint changes → spec 39.

## Reuse first

- Reuse `handleSubscription` and `syncCompanyAccess`. Do not write access anywhere else.

## Steps

1. Extract the shared function.
2. Add the adapter from the SDK `Subscription` entity to the shape the handler needs, checking the installed types.
3. Test both entry paths give identical company state.
4. Test ordering.
5. Record what you created in `specs-saas-onboarding/inventory/18-fulfillment-seam.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/paddleFulfillment.service.test.ts` passes and proves: webhook and server-read paths produce identical access; a later webhook still applies; an older one does not regress data; a mismatched customer is refused. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/18-fulfillment-seam.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Added `applyPaddleSubscription` for trusted SDK subscription reads scoped to a known company/customer, with transactional company/customer locks and canonical ownership revalidation. Added a narrow adapter checked against the installed SDK declarations, reusing `handleSubscription`, `syncCompanyAccess` and the existing account-access policy. Subscription ordering now compares provider version first, then event time for equal versions; reads use the provider version rather than local read time. Customer/transaction ordering and webhook deduplication remain unchanged. Server reads create no webhook marker. Legacy/new trialing subscriptions are accepted without adding any checkout/catalog behavior.
- **2026-11-09** — Focused tests cover equivalent company/access state from both entry paths, later and older webhooks, repeated reads, tenant/customer/subscription mismatches, lock order, provider mapping, effective windows, administrative restrictions, rollback and all eight accepted transaction event types arriving before or after subscription fulfilment. The initial run had **63 passed, 1 failed** because the test fixture bypassed the real account reader's configured-price qualification; corrected the fixture to call `readAccountState` before `evaluateAccountAccess`. The next focused run passed **64 tests**, 0 failures/skips. Initial type checking found SDK notification discount fixture incompatibilities and an overly narrow test-state property access; both test typing issues were corrected. No tests outside Owns were changed.
- **2026-11-09** — `npm test --prefix backend` passed: **2,114 tests passed, 7 skipped**, 0 failures; **105 test files passed, 1 skipped**. The skipped SQL persistence tests require an isolated database and were not run. Final `cd backend && npx tsc --noEmit -p tsconfig.json` passed with 0 errors and no warnings. Backend has no lint script. All test/type/build commands used the unreachable local DATABASE_URL and DOTENV_CONFIG_PATH=/dev/null; the SQL test database and DIRECT_URL variables were absent. No real Paddle/database calls, migrations, deployment, GitHub operations or git commit/merge/push/branch commands ran. Only the owned service/tests, this spec's Log/checklist and its inventory fragment were changed; PROGRESS.md and this spec's Status line were left unchanged.
- **2026-11-09** — Final focused rerun passed **64 tests**, 0 failures/skips. `npm run build --prefix backend` passed with exit 0, including Prisma client generation and TypeScript compilation, with no warnings. Verified the inventory fragment exists and documents the reusable seam, and `git diff --check` passed. All Done when commands/checks passed in this session. Real provider behavior and PostgreSQL locking/rollback were not verified; unit tests use SDK fixtures and an injected transactional memory database.
