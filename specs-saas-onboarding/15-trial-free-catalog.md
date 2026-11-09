# Spec 15 — Trial-free plan catalog

**Status:** Done
**Depends on:** Spec 08
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/billingCatalog.service.ts`, `backend/src/services/billingCatalog.service.test.ts`, `specs-saas-onboarding/inventory/15-trial-free-catalog.md`
**Reuses:** `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/billingProvider.ts` (spec 08), `backend/src/config/paddle.ts`

## Goal

Serve the plan catalog from Paddle with free trials refused and a short cache, so the plan page is fast.

## Scope

- Move `getBillingCatalog` here.
- A price with any `trialPeriod` is unusable. The read fails with code `PRICE_HAS_TRIAL`, which is logged and maps to `PRICE_NOT_READY`.
- Keep every existing check: active status, matching interval, frequency 1, valid amount and currency.
- Cache successful results for 60 seconds per configured catalog. Failures are never cached.
- The DTO carries no trial field.
- Concurrent reads share one in-flight request.

## Explicit non-scope

- Editing prices at Paddle → spec 16.
- Removing the old copy → spec 36.

## Reuse first

- Use `getPaddleCatalog` for the configured list.

## Steps

1. Move the logic.
2. Add the trial rejection.
3. Add the cache with an injected clock.
4. Test cache hit, expiry, failure and config change.
5. Record what you created in `specs-saas-onboarding/inventory/15-trial-free-catalog.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingCatalog.service.test.ts` passes and proves: a price with a trial is refused; cache hits within 60 seconds; failures are not cached; concurrent reads make one set of calls. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/15-trial-free-catalog.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Added the trial-free catalog reader, injected reader factory, safe validation errors/logging, owner/activation checks on every read, and a bounded environment/configuration-keyed cache. Successful reads last 60 seconds from completion; concurrent reads share provider work, failures are retried, and callers cannot mutate cached entries. The DTO omits trial metadata. The old lifecycle reader remains for spec 36 as required. Added the reusable inventory fragment; no existing tests outside Owns were changed.
- **2026-11-09** — Focused command passed twice: **45 tests passed**, 0 failures/skips per run. Whole backend command passed: **2,057 tests passed, 7 skipped**, 0 failures; **105 files passed, 1 skipped**. The skipped SQL persistence tests require an isolated database and were not run. All commands used the unreachable local DATABASE_URL and DOTENV_CONFIG_PATH=/dev/null; database/provider work in the new tests uses injected mocks. No real Paddle/database calls, migrations, deployment, GitHub operations or git commit/merge/push/branch commands ran.
- **2026-11-09** — Initial type check and build found the test seam unnecessarily required the gateway's unused prices.update method. Narrowed the injected provider type to prices.get and products.get; the focused tests passed again. Final type/build reruns are recorded below after completion.
- **2026-11-09** — Final `cd backend && npx tsc --noEmit -p tsconfig.json` passed with 0 errors and no warnings.
- **2026-11-09** — Final `npm run build --prefix backend` passed (exit 0), including Prisma client generation and TypeScript compilation. Prisma printed its available-version advisory (7.5.0 to 8.0.0-rc.33); no dependency changes were made. Backend has no lint script. Inventory existence/content and `git diff --check` passed. All Done when checks are complete; real provider and database behavior was not verified or required.
