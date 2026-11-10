# Spec 36 — Assemble the lifecycle service

**Status:** Done
**Depends on:** Spec 10, Spec 26
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/billingLifecycle.service.test.ts`, `specs-saas-onboarding/inventory/36-lifecycle-assembly.md`
**Reuses:** `backend/src/services/billingOnboardingStep.ts` (spec 10), `backend/src/services/billingCatalog.service.ts` (spec 15), `backend/src/services/billingCheckout.service.ts` (spec 26), `backend/src/services/billingReservations.service.ts` (spec 09)

## Goal

Remove the moved code from the old service and make the lifecycle read return the next step.

## Scope

- Delete logic now in specs 09, 15, 17 and 26. Re-export public functions so existing imports keep working.
- Gather facts and call `billingOnboardingStep`.
- Keep all current fields, the portal function and sandbox email exception.
- The read stays local: no Paddle call, except the configuration check.
- A paid mirror transaction with no access yet maps to `CONFIRMING`.

## Explicit non-scope

- Route wiring → spec 39.
- Reconciliation → spec 28.

## Reuse first

- Do not reintroduce moved logic.

## Steps

1. Replace bodies with imports.
2. Add the step.
3. Port tests to the new modules where they moved, keeping coverage.
4. Confirm with a search that no duplicate logic remains.
5. Record what you created in `specs-saas-onboarding/inventory/36-lifecycle-assembly.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingLifecycle.service.test.ts` passes and proves: each server state returns the right step and reason; no provider call during a read; portal behaviour unchanged. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/36-lifecycle-assembly.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Replaced the lifecycle service's duplicate catalog, reservation, customer-create and checkout implementation with the shared spec 09/15/17/26 services. `getBillingCatalog` and `createBillingCheckout` are direct re-exports so existing production imports keep working. The local owner-scoped lifecycle read now gathers reservation, customer and subscription facts and returns `onboardingStep` and `recoveryReason` through the spec 10 decision function, keeping every prior DTO field and the sandbox email exception. An exact latest READY transaction mirrored as paid/billed/completed selects CONFIRMING without granting access. Open holds, missing canonical customer mirrors and recorded email conflicts select recovery; qualified current active/trialing subscriptions retain workspace access, linked subscribers without access select ACCOUNT, and administrative restrictions take precedence. Portal input, tenant scoping, subscription selection, sanitized errors and allowed hosted URLs remain covered; its default provider now uses the shared gateway.
- **2026-11-10** — Reworked the owned lifecycle suite around assembly and the shared reservation reader, preserving the configuration, entitlement, SDK signature and HTTP public/private boundary checks. Moved catalog/customer/checkout/reservation behavior is already covered in those services' dedicated suites; duplicate legacy expectations for selling trial prices and refusing unpaid-plan replacement were removed in favor of the shared implementations and an exact re-export identity check. No tests outside Owns were edited, and the guide's test-only exception was not needed. A first focused run stopped at transform with **0 tests run** because one new callback lacked `async`; corrected it before verification.
- **2026-11-10** — `cd backend && npx vitest run src/services/billingLifecycle.service.test.ts` passed: **125 passed, 0 failed, 0 skipped**, 1 test file passed. Tests cover every reachable server step and reason, precedence, exact paid mirrors awaiting access, current and expired subscription windows, tenant correlation, append-only reservation outcomes, sandbox/production email policy, portal behavior and unchanged DTO fields. Local assembly tests explicitly reject SDK initialization/network access and assert no provider or audit write calls during reads.
- **2026-11-10** — `npm test --prefix backend` passed: **2,464 passed, 7 skipped, 0 failed**, **110 test files passed and 1 skipped**. `cd backend && npx tsc --noEmit -p tsconfig.json` and `npm run build --prefix backend` both exited **0**, with no errors or warnings. The build ran the existing Prisma client generator and TypeScript compiler only; no migration or application database access. Every verification command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`.
- **2026-11-10** — Verified the inventory fragment exists and `git diff --check` passes. A source search found only the shared catalog/checkout re-exports and no remaining customer-create, price/product fetch, checkout-create/update, audit-write, legacy reservation or checkout-inspection implementation in the assembly module. Only the two owned code/test files, this spec's checklist/Log and its inventory fragment changed; Status and PROGRESS.md remain unchanged. No GitHub issue/PR, git branch/commit/merge/push, deployment or real Paddle/database operations were used.
- **2026-11-10** — Verification limits: the existing SQL suite remains skipped; real Paddle and database behavior were not exercised. The lifecycle read intentionally has no remote price/trial discovery: activation and checkout configuration are local capabilities, while the shared catalog reader and checkout preparation validate provider price/product/trial facts. No local price mirror/cache was introduced. All required checks for this spec ran and passed without those services.
