# Spec 09 — Reservation facts

**Status:** Not started
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingReservations.service.ts`, `backend/src/services/billingReservations.service.test.ts`, `specs-saas-onboarding/inventory/09-reservation-facts.md`
**Reuses:** `backend/src/services/auditLog.service.ts`, `backend/src/services/billingLifecycle.service.ts`, `ARCHITECTURE.md#data-model`

## Goal

Own all reading and writing of billing reservation facts, including the new failed and cancelled facts that stop a reservation staying open forever.

## Scope

- Move the existing reserve, inspect and pending logic here, preserving company locking.
- Add `CUSTOMER_CREATE_FAILED`, `CHECKOUT_FAILED` and `CHECKOUT_CANCELED`.
- A reservation is closed by any matching `READY`, `FAILED` or `CANCELED` fact.
- An open reservation younger than the 120 second grace is reported as in progress. Older is reported as needing reconciliation.
- A new reservation is refused while one is open, and allowed once the latest is closed.

## Explicit non-scope

- Calling Paddle → spec 17.
- Deleting the old copy from `billingLifecycle.service.ts` → spec 36.

## Reuse first

- Use `writeAuditLog` and the existing `SELECT ... FOR UPDATE` on `Company`.
- Facts are append-only. Never update or delete an audit row.

## Steps

1. Read the current logic in `billingLifecycle.service.ts`.
2. Create the module with an injected `db` and `now`.
3. Add the closure rule and grace period.
4. Port the existing resume logic with the new closed states.
5. Test all combinations.
6. Record what you created in `specs-saas-onboarding/inventory/09-reservation-facts.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingReservations.service.test.ts` passes and proves: each fact closes its own reservation only; grace boundaries; a foreign or mismatched READY stays open; a failed reservation allows a new one; concurrent reserve respects the lock. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/09-reservation-facts.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Implemented the additive reservation-facts service with injected database/clock and optional caller transaction. Ported the existing owner checks, Company `SELECT ... FOR UPDATE`, pending-customer checks and checkout resume safeguards. Added correlated READY/FAILED/CANCELED closure, the exact 120-second grace boundary, safe provider failure codes, retry after proven failure/cancellation, append-only/idempotent fact recording and cancellation after READY. A malformed READY can be repaired by appending a valid fact without editing history. The legacy lifecycle copy remains unchanged for spec 36.
- **2026-11-09** — Final focused command: **145 tests passed, 0 failures, 0 skipped** (1 file). Coverage includes every closing action and operation, foreign/mismatched/stale/malformed facts, exact grace boundaries, paid and foreign checkout mirrors, legacy resume compatibility, concurrent initial reserves/retries, append-only writes and transaction composition. The initial focused run had 133 passes and 6 failures because the customer-grace fixture already had a linked customer; corrected it to model an unlinked customer. It then passed 139 tests; final review added 6 cases for gateway-compatible lowercase codes and appending valid facts after invalid/stale ones, producing the final 145 passes.
- **2026-11-09** — Final `npm test --prefix backend`: **1,865 passed, 7 skipped, 0 failures** across 102 passing files and 1 skipped file. The total includes the 145 focused cases. The earlier whole-suite run passed 1,859 tests with the same 7 skips before the last 6 cases were added. Final `npx tsc --noEmit -p tsconfig.json` passed with **0 errors**. Final `npm run build --prefix backend` passed; Prisma generated its client and printed a version-upgrade advisory, with no TypeScript errors. Backend has no lint script. Inventory fragment existence/content and owned-file whitespace were checked.
- **2026-11-09** — All tests ran with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`; the whole suite explicitly cleared `LAUNCH_PERSISTENCE_TEST_DATABASE_URL`, leaving the 7 SQL cases skipped. Build also used the dummy URL for `DIRECT_URL`. Locking/concurrency was verified with a shared stateful fake that serializes only when `FOR UPDATE` executes; real PostgreSQL locking and real Paddle behavior were not exercised. No external test files needed edits. No real database/provider calls, migrations, deployments, issues/PRs, commits or branch operations were performed. Status and PROGRESS.md were left unchanged per the run instructions.
