# Spec 15 — Trial-free plan catalog

**Status:** Not started
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

- [ ] `cd backend && npx vitest run src/services/billingCatalog.service.test.ts` passes and proves: a price with a trial is refused; cache hits within 60 seconds; failures are not cached; concurrent reads make one set of calls. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/15-trial-free-catalog.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
