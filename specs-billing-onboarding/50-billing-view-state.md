# Spec 50 — Derive billing display states and exact provider prices

**Status:** Done
**Depends on:** Spec 45
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `frontend/src/pages/Subscription/onboarding/billingViewState.test.tsx`, `frontend/src/pages/Subscription/onboarding/billingPrice.ts`, `frontend/src/pages/Subscription/onboarding/billingPrice.test.tsx`, `specs-billing-onboarding/inventory/50-billing-view-state.md`
**Reuses:** `frontend/src/pages/Subscription/types.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.ts`, `INVENTORY.md#capacities`, `DESIGN-SYSTEM.md#component-conventions`

## Goal

Give screens one pure source for safe display states and provider-price formatting without duplicating access policy.

## Scope

- Map matching validated lifecycle plus read freshness to checking/choose-plan/resume/pending/confirmed/existing/restricted/unavailable/uncertain display states.
- Confirmed requires explicit server workspaceAccessAllowed and matching owner/company. Unknown additive fields, foreign records, stale/error reads and browser-return flags cannot authorize it.
- Classify linked expired/canceled/past-due as existing billing/portal; do not offer a second subscription. Preserve over-limit records and true counts.
- Format amount/currency using actual currency minor-unit rules and exact validated decimal input; annual prices are full recurring annual amounts, not implied monthly charges.
- Use current PLAN_DEFINITIONS exposed as getSubscription.availablePlans through the existing API for capacities and display ADVANCED as Enterprise. Never copy sample prototype amounts or make popularity/discount claims.

## Explicit non-scope

- Fetching and polling → spec 51.
- Screen rendering → spec 54.
- Authoritative backend entitlement → spec 49.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Write a finite state table with fixtures for every contract/read-error combination before implementing the pure selectors.
2. Implement display derivation and price formatting independently of React/global time/auth state; pass required owner facts as inputs.
3. Distinguish missing price from zero, exact yearly price from a monthly equivalent, and recurring price from amount due today.
4. Export project-owned helpers with explicit names and document them in the inventory fragment.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/50-billing-view-state.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/billingViewState.test.tsx` passes: table fixtures cover new owner, saved draft, uncertain/pending, true server-ready, expired/unknown/foreign/suspended/stale/401/403 records and preserve actual usage. [unit]
- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/billingPrice.test.tsx` passes: USD1234→12.34, JPY1234→1234, three-decimal currency1234→1.234, zero, invalid/unsafe/negative amount, unsupported currency, annual full price and no invented discount/trial. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/billingViewState.ts src/pages/Subscription/onboarding/billingViewState.test.tsx src/pages/Subscription/onboarding/billingPrice.ts src/pages/Subscription/onboarding/billingPrice.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-07** — Started the next sequential unit using current guide/tracker and existing45 DTO/parser, approved design constraints and inventory49 readiness semantics. Added pure identity/freshness/display derivation and API-plan definition lookup, plus exact recurring-price formatting using runtime currency minor-unit rules, BigInt integer formatting and localized fraction parts. No React/global clock/auth storage/network dependency, backend permission rewrite, screen implementation or routing change. Existing code/price/provider metadata is consumed, never copied from illustrative prototype amounts. No external issue/PR bookkeeping performed by this request.

Focused combined tests passed72 (43 state cases +29 price cases). Cases cover unknown/legacy/server readiness, current owner/company correlation, stale/errors/401/403, exact saved draft and forbidden purchase overrides, linked/expired/pending/restricted states, actual over-limit counts and API capacities. Money cases cover USD/JPY/KWD minor units, zero, invalid/unsafe/negative values, unsupported currencies, full annual recurrence, huge exact amounts beyond safe Number and localized separators/digits. Initial focused/full attempt exposed a test assumption about JPY grouping (expected1234 inside formatted¥1,234); corrected the locale assertion, preserving the exact decimal assertion, then reran focused tests successfully. Final whole-suite/static/build evidence follows. No deployed/provider/SQL/browser acceptance is claimed by pure fixtures.

**2026-11-07** — Final focused command `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/billingViewState.test.tsx src/pages/Subscription/onboarding/billingPrice.test.tsx` exited0:72/72 tests across2 files. Final `npm test --prefix frontend` exited0:81 Node tests +586 Vitest tests across39 files, no failures/skips. Logs: /tmp/spec50-focused.log and /tmp/spec50-tests-final.log. In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/billingViewState.ts src/pages/Subscription/onboarding/billingViewState.test.tsx src/pages/Subscription/onboarding/billingPrice.ts src/pages/Subscription/onboarding/billingPrice.test.tsx` exited0 with no diagnostics/warnings. `git diff --check` passed. The existing frontend-mobile module-type warning is unchanged. Final build result follows when complete.

**2026-11-07** — Final `npm run build --prefix frontend` exited0 (TypeScript + production Vite build; non-failing plugin timing warning). All required local checks passed; marked50 Done and recorded inventory50. New helpers remain unmounted until their assigned consumers land; no application routing/signup/payment behavior, deployment, live account record, existing provider configuration or Git history changed. No external prerequisite blocks these pure local tests; real currency/provider/account acceptance is not inferred from them.
