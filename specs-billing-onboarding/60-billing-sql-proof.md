# Spec 60 — Prove reservation and entitlement persistence in PostgreSQL

**Status:** Done
**Depends on:** Spec 49
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `backend/tests/billingLifecycle.integration.ts`, `specs-billing-onboarding/inventory/60-billing-sql-proof.md`
**Reuses:** `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/paddleFulfillment.service.ts`, `backend/src/services/accountAccess.service.ts`, `backend/src/services/attendanceMediaTransition.service.ts`, `INVENTORY.md#sql-harness`

## Goal

Extend the existing isolated SQL service test to prove the new readiness/resume contract against real locking, correlation and persisted billing facts.

## Scope

- Keep the existing isolation guard and explicit BILLING_LIFECYCLE_TEST_DATABASE_URL; run only against an owned disposable localhost database, never app/live data.
- Reuse registerCompany, injected no-network provider and processPaddleEvent. Preserve existing duplicate/rollback/canonical/early-transaction tests.
- Add exact resume after fresh service call/reload, concurrent one-draft creation, lost-response later reconciliation and denial of another tenant or paid/unresolved draft.
- Assert workspaceAccessAllowed changes only after persisted qualified current subscription; cover future/expired/missing period and administrative suspension.
- No browser harness, live provider call, migration or new app endpoint/test bypass.

- Inject provider failure after CUSTOMER_CREATE_RESERVED and CHECKOUT_RESERVED and a persistence failure after provider response using the existing service seams. Assert actual unmatched audit records stay intact, fresh reads deny a second create and only correlated READY facts permit safe draft reuse.

## Explicit non-scope

- Browser actions and route layout → spec 62.
- Actual signed deployed Paddle delivery → spec 63.
- Server implementation repair → spec 49.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read the script and database guard before opening a connection; record the sanitized database name/isolated status only.
2. Add synthetic owners/customer/transactions with random IDs and compare provider create counts plus actual stored audit/mirror/Company rows.
3. Call the lifecycle service afresh after provider events to prove resume/permission survives a new read; do not assert only a mocked response.
4. Run the whole backend unit suite as well as the isolated script and record exact counts. If PostgreSQL is unavailable, leave this spec pending rather than claiming green.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/60-billing-sql-proof.md`; append a dated Log only when work starts.

## Done when

- [x] `npm exec --prefix backend -- tsx backend/tests/billingLifecycle.integration.ts` with the owned isolated database variable set passes: real company lock yields one provider draft; safe resume retains exact plan; uncertainty cannot duplicate; ordered provider persistence changes readiness only for valid tenant/catalog/period. [unit]
- [x] The isolated SQL script proves both failure boundaries retain audit history/tenant linkage and do not duplicate provider creates after a fresh service call; matched safe draft remains resumable. [unit]
- [x] `npm test --prefix backend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] `npm exec --prefix backend -- tsc -p backend/tsconfig.json --noEmit` passes; backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

**2026-11-08** — Extended existing isolated SQL script only. Owned localhost PostgreSQL16.15 instance on55471, database billing_onboarding_test; bootstrap downloaded/extracted server package without changing installed system services. Actual migrations applied with explicit local DATABASE_URL/DIRECT_URL and DOTENV_CONFIG_PATH=/dev/null. No app/live database used. Provider remains injected/no-network. Real SQL run passed; expanding retained-checkout/foreign-mirror assertions before final completion. Backend full1596 passed/7 existing launch-persistence skips, typecheck/build passed.

**2026-11-08** — Required checks passed. Final isolated SQL command (BILLING_LIFECYCLE_TEST_DATABASE_URL=postgresql://billing_test@127.0.0.1:55471/billing_onboarding_test, DOTENV_CONFIG_PATH=/dev/null) `npm exec --prefix backend -- tsx backend/tests/billingLifecycle.integration.ts` exited0. Proved both unmatched provider reservation boundaries deny a second create, READY persistence rollback retains audit, exact draft restore, foreign/paid mirror denial and current qualified period/suspension permission. Actual localhost database and locks; no-network provider. `DOTENV_CONFIG_PATH=/dev/null VITEST_MAX_WORKERS=4 npm test --prefix backend`1596 passed,7 incumbent SQL skips (LAUNCH_PERSISTENCE_TEST_DATABASE_URL absent); backend typecheck/build passed. Logs /tmp/spec60-sql-final.log, /tmp/spec60-backend-tests.log, /tmp/spec60-build.log. No backend lint script exists.

**2026-11-08** — Final correlated-fulfillment review reopened this owner boundary: a completed transaction attached to the same canonical tenant/customer subscription was still classified as a pending draft. Added a regression that failed (workspace permission true but reconciliationRequired true), then scoped inspection to stop the draft hold only for that exact canonical linkage. Foreign/unmatched/paid-without-linked-subscription cases remain held; linked company still cannot purchase. SQL60 now delivers transaction.completed after subscription persistence and checks readiness as well as permission. Running final focused/SQL/full/static verification; no operator data or general access policy changed.

**2026-11-08** — Fulfillment refinement verified: focused lifecycle121 passed after the new case first failed, clean full backend1604 passed/100 files with0 skips, real clean SQL script passed including transaction.completed canonical linkage then expired/future/missing/suspension denials, clean Prisma/TypeScript build passed. Logs /tmp/spec49-fulfilled-red.log, /tmp/spec49-fulfilled-green.log, /tmp/billing-clean-backend-final-tests.log, /tmp/billing-clean-final-sql.log and /tmp/billing-clean-backend-final-build.log. Old foreign/unmatched/paid-unlinked hold regressions remain passing; no second purchase enabled.
