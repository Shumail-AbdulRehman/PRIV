# Spec 39 — Billing HTTP routes

**Status:** Not started
**Depends on:** Spec 27, Spec 28, Spec 36
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/routes/billingLifecycle.route.ts`, `backend/src/routes/billingLifecycle.route.test.ts`, `specs-saas-onboarding/inventory/39-billing-routes.md`
**Reuses:** `backend/src/services/billingCheckout.service.ts` (spec 26), `backend/src/services/billingConfirm.service.ts` (spec 27), `backend/src/services/billingReconcile.service.ts` (spec 28)

## Goal

Expose confirm and reconcile, and point checkout at the new service.

## Scope

- Add `POST /checkout/confirm` and `POST /checkout/reconcile`, with strict empty bodies.
- Keep owner auth, `no-store` and current routes.
- Stable error codes reach the client.
- The webhook mount is unchanged.

## Explicit non-scope

- Business logic → spec 26.
- Rate limiting these routes → spec 43.

## Reuse first

- Keep the router-level `verifyOwnerBillingJwt` and `authorize`.

## Steps

1. Add routes.
2. Test auth, body strictness and shape.
3. Record what you created in `specs-saas-onboarding/inventory/39-billing-routes.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/routes/billingLifecycle.route.test.ts` passes and proves: manager and staff are refused; extra body fields are rejected; results carry a lifecycle; responses are no-store. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/39-billing-routes.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]


## Log

- **2026-11-10** — Added strict-empty-body owner-only confirm and reconcile HTTP adapters. Confirm forwards the shared service DTO; reconcile composes its outcome with a subsequent fresh lifecycle read for the authenticated owner. Checkout imports the shared spec 26 service directly. Existing lifecycle/catalog/portal routes and shared stable error handling remain intact; no-store now also covers router authentication failures. Webhook mounting and business logic were not changed.
- **2026-11-10** — Focused command `cd backend && npx vitest run src/routes/billingLifecycle.route.test.ts`: **29 passed, 0 failed, 0 skipped**. Whole command `npm test --prefix backend`: **2,493 passed, 7 skipped, 0 failed** across 111 passed test files and one skipped file. Focused coverage includes real JWT/owner authorization against mocked persistence, manager/staff refusal, stale/inactive/forced-password owners, strict empty bodies, every confirm/reconcile outcome, fresh lifecycle composition, preserved routes, stable error codes and no-store. Primitive JSON is rejected by the existing upstream parser before router middleware.
- **2026-11-10** — Used the guide's test-only exception for `backend/src/routes/launch.route.test.ts`: added one mock for the new direct checkout-service import after its existing checkout mount assertion failed (400 instead of 201). The assertion is unchanged. Initial focused failures exposed test harness assumptions about upstream parser headers and a missing JWT expiry; corrected those fixtures. Initial type checking found a duplicate-property spread in a test fixture; replaced it with `Object.assign`. The subsequent required type-check command passed with **0 errors and 0 warnings**. Inventory fragment written and inspected; `git diff --check` passed.
- **2026-11-10** — All checks used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. The seven existing SQL tests remain skipped because no isolated persistence-test database was supplied. No real database or Paddle access, migrations, deployment, GitHub issues/PRs, commits or branch operations were performed. Status and tracker were left unchanged as instructed.
- **2026-11-10** — Final `npm run build --prefix backend` passed (Prisma client generation and TypeScript emit, **0 compiler errors/warnings**). The first build had read the test fixture before the duplicate-property correction and failed on that same type error; the final rerun is green. Prisma printed its existing upgrade advisory (7.5.0 to 8.0.0-rc.33); no dependency changes were made. All five Done when items have now run or been inspected and passed.
