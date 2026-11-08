# Spec 49 — Return authoritative readiness and safe checkout resume

**Status:** Done
**Depends on:** Spec 45
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/billingLifecycle.service.test.ts`, `backend/src/config/paddle.ts`, `backend/src/config/paddle.test.ts`, `specs-billing-onboarding/inventory/49-server-lifecycle-readiness.md`
**Reuses:** `backend/src/types/billingLifecycle.ts`, `backend/src/services/accountAccess.service.ts`, `backend/src/services/paddleFulfillment.service.ts`, `backend/src/routes/billingLifecycle.route.ts`, `INVENTORY.md#lifecycle-service`, `INVENTORY.md#access-policy`

## Goal

Populate the additive lifecycle/catalog contract using actual owner, provider configuration, persisted reservation and effective access facts.

## Scope

- Keep current owner auth, private/no-store response, strict checkout input and existing db/provider injection. No route/controller rewrite or data migration.
- Calculate workspaceAccessAllowed by reusing qualified readAccountState/evaluateAccountAccess for starting work/capacity, including effective dates and administrative restriction; do not equate READ_OPERATIONAL or status=active with ready.
- Resolve checkoutResume only from the same company/customer and matching RESERVED/READY audit correlation/catalog. Return the exact saved plan/interval/transaction; no browser reconstruction.
- Omit resumable action for paid/completed/billed/past_due/unknown or unresolved outcomes. Preserve canceled-draft replacement only when provider facts permit it.
- Return sanitized readiness reasons without revealing missing secret values. Preserve sandbox email bypass, production verification and server reservation locking.
- Add subscription priceId/interval for exact catalog matching and provider trial requiresPaymentMethod; invalid/inactive/wrong-cycle prices stay unavailable. No local pricing/trial defaults.

- Reproduce the reported failure at customer-create, draft-create and persistence boundaries before repair. Preserve unmatched reservations on unknown outcomes; do not silently retry, delete audit rows or claim a screenshot proves a server hold. Use the diagnosis matrix in docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md; keep external account recovery pending until provider evidence establishes its outcome.

## Explicit non-scope

- Client polling/retry/cache → spec 51.
- Payment event orchestration → spec 53.
- Real PostgreSQL concurrency/persistence proof → spec 60.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read existing lifecycle/config tests and accountAccess policy first; extend compatible fixtures rather than replacing negative security cases.
2. Type the service response with spec45 DTO; reuse access policy with an injected/controlled clock in tests and propagate unexpected database failures safely.
3. Derive resume details from the existing audit transaction boundary and known PaddleTransaction state, including absent mirror versus known paid state.
4. Validate provider trial/card requirements for the requested sandbox card path; surface unsupported catalog configuration rather than change business terms.
5. Keep all existing createBillingCheckout/createBillingPortal idempotency, tenant linkage, raw-error suppression and production denial tests.
6. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/49-server-lifecycle-readiness.md`; append a dated Log only when work starts.

## Done when

- [x] Focused lifecycle tests inject customer-create/draft-create rejection and response/persistence loss after reservation; fresh lifecycle is truthful, matched READY draft is reusable and unknown/unmatched outcome never issues a second create. Existing production, tenant and portal denial cases remain. [unit]
- [x] `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts` passes: active/trialing inside qualified period allows workspace; missing/future/expired/cancel-effective/foreign/unqualified periods and suspension do not; safe draft resumes exact saved plan; paid/uncertain cannot repurchase; sandbox unverified allowed and production unverified denied. [unit]
- [x] `npm test --prefix backend -- src/config/paddle.test.ts` passes: disabled/missing/malformed environment/catalog/key is never ready and diagnostics do not reveal credentials; active catalog maps plan/interval exactly. [unit]
- [x] `npm test --prefix backend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] `npm exec --prefix backend -- tsc -p backend/tsconfig.json --noEmit` passes; backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

**2026-11-07** — Started the next sequential unit after guide/tracker, steering/inventory, contract45 Log and repair-plan review. Read actual lifecycle/config/access/fulfillment/routes/tests and installed SDK TrialPeriod/Transaction declarations. The proposed config test file did not exist; created it in assigned ownership. Kept the current db/provider seams, signed fulfillment path, HTTP owner/no-store boundary and production verification. No external issue/PR bookkeeping or authenticated live account/provider access is performed by this request.

**2026-11-07** — Added typed JSON lifecycle/catalog/checkout responses, explicit current workspace permission using existing policy, bounded sanitized checkout-readiness and exact correlated draft resume. Reads/mutations share checkout/customer audit inspection; foreign rows, unknown outcomes and unmatched operations cannot yield new purchases. New READY records retain customerId; legacy READY without that proof can reopen only with a same-tenant draft/ready mirror. Existing provider-confirmed cancellation replacement is preserved. Added exact catalog entry mapping and generic validated checkout URL helper, provider requiresPaymentMethod metadata and validation of real recurring money/trial facts. Unsupported/unknown sandbox trial card requirements reject before reservation rather than change the provider price/trial; production counterpart remains governed by its existing verification/policy.

Focused verification: `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts` exited0 with120 tests; `npm test --prefix backend -- src/config/paddle.test.ts` exited0 with25 tests. Combined focused rerun also passed145 tests. Added fixtures cover qualified active/trialing periods, missing/future/expired/effective-cancel/paused/foreign/unqualified/suspended cases, a subscription changing between reads, exact monthly/yearly resume, unknown/paid/cross-tenant outcomes, malformed correlation, sandbox/production verification and explicit trial card facts. Stateful provider/customer/draft/persist failure and lost-success-response fixtures prove safe fresh-read/retry decisions without claiming SQL transaction guarantees. All owned tests run with synthetic config and injected no-network provider/DB boundaries; the incumbent signature verifier/router tests use only local SDK/ephemeral listener behavior.

`npm test --prefix backend` final rerun exited0:1596 passed,7 skipped tests,99 passed files/1 skipped file. The skipped file is existing src/services/launchPersistence.test.ts, gated by absent explicit LAUNCH_PERSISTENCE_TEST_DATABASE_URL (owned disposable local PostgreSQL prerequisite). No app DATABASE_URL fallback was used, no skips were added and no required billing test was skipped. Earlier full run before the final read-consistency regression also passed1595 tests with the same7 skips. Real billing SQL tests remain spec60 and were not run here.

Inventory49 records new config exports, DTO/readiness semantics, legacy resume restrictions, added READY customer proof and the required full SDK draft-status fixture for60. No operator access/evidence was available for actual affected-account reservation/provider outcome diagnosis, so no live root cause or account recovery is claimed. UI/controller/query/route composition and actual deployed sandbox acceptance remain with their assigned specs.

**2026-11-07** — Typecheck initially found an it.each fixture-table typing error in the new config tests: nested catalog arrays were being interpreted as argument tuples. Replaced those rows with named entries objects so each complete duplicate/unsupported catalog is actually tested, then reran config25/25 and the full backend suite1596 passed/7 baseline SQL skips successfully. Final `npm exec --prefix backend -- tsc -p backend/tsconfig.json --noEmit` exited0 after that correction. Backend has no lint script; no linter/dependency was installed. `git diff --check` passed. Final build is recorded below after completion.

**2026-11-07** — Final `npm run build --prefix backend` exited0 (Prisma Client generation to node_modules, then TypeScript build). All required local checks passed; marked49 Done. No schema/migration/lockfile change, live data/provider/configuration mutation, frontend implementation, deployment or Git publication was performed. Actual PostgreSQL lock/persistence proof and operator sandbox acceptance remain60/63; missing live evidence was not treated as a successful recovery.

**2026-11-08** — Final correlated-fulfillment review reopened this owner boundary: a completed transaction attached to the same canonical tenant/customer subscription was still classified as a pending draft. Added a regression that failed (workspace permission true but reconciliationRequired true), then scoped inspection to stop the draft hold only for that exact canonical linkage. Foreign/unmatched/paid-without-linked-subscription cases remain held; linked company still cannot purchase. SQL60 now delivers transaction.completed after subscription persistence and checks readiness as well as permission. Running final focused/SQL/full/static verification; no operator data or general access policy changed.

**2026-11-08** — Fulfillment refinement verified: focused lifecycle121 passed after the new case first failed, clean full backend1604 passed/100 files with0 skips, real clean SQL script passed including transaction.completed canonical linkage then expired/future/missing/suspension denials, clean Prisma/TypeScript build passed. Logs /tmp/spec49-fulfilled-red.log, /tmp/spec49-fulfilled-green.log, /tmp/billing-clean-backend-final-tests.log, /tmp/billing-clean-final-sql.log and /tmp/billing-clean-backend-final-build.log. Old foreign/unmatched/paid-unlinked hold regressions remain passing; no second purchase enabled.
