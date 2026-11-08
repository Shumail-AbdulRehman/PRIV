# Spec 54 — Render real catalog plans and interval selection

**Status:** Done
**Depends on:** Spec 47, Spec 50, Spec 51
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPlanPage.test.tsx`, `specs-billing-onboarding/inventory/54-plan-selection-screen.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/index.html`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `frontend/src/pages/Subscription/onboarding/billingPrice.ts`, `frontend/src/pages/Subscription/queries.ts`, `DESIGN-SYSTEM.md#layout-conventions`

## Goal

Give a new owner the approved three-plan choice with real provider prices and a single validated continuation.

## Scope

- Use existing useSubscription.availablePlans for API-supplied plan definitions/capacities, together with current catalog amounts/currency; display only available plan/interval combinations. No sample29/79/199, default currency or fake discount.
- Render native labeled radios with plan/capacity units/price interval/owner inclusion, monthly/yearly pressed controls and a selected summary/continue action.
- Validate optional URL plan/interval values and write only those safe choices to navigation. Preserve selection through language change and retry; do not store tokens/provider transaction IDs.
- Loading/unavailable/empty/missing combination offers honest state and refresh, never a guessed amount or purchase. Saved draft routes to its server-proven payment selection rather than a new plan.
- No help/contact/FAQ panel. Keep manager-owner explanation, real trial details and final-tax/amount disclosure.

- Cover the screenshot regression explicitly: checkout-denied/reconciliation plus unavailable catalog renders a reason and status recovery, never a heading with an unexplained empty body. Safe display of prices is independent of permission to buy.

## Explicit non-scope

- Checkout request/provider overlay → spec 53.
- Page alias/owner routing → spec 59.
- Browser layout/zoom proof → spec 62.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Render the approved screen from existing primitives and sole-owner shell/styles, consuming shared read hooks and formatting helpers.
2. Implement state-specific availability and radio/interval selection; use the real selected catalog entry as continuation data.
3. Transfer focus to selected radio after a successful unavailable-state retry and announce availability.
4. Test both languages and differing provider catalogs; do not assert only screenshots or all-six-prices fixtures.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/54-plan-selection-screen.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` passes: all three capacities and owner seat exposed; monthly/year selection carries correctly; zero/partial/missing prices never invented; keyboard selection/focus survives language and retry; saved draft cannot be overwritten; no help/contact. [unit]
- [x] Focused plan tests cover catalog loading/error/empty and checkout-denied/reconciliation combinations: each renders an explanation/status action; none renders a blank options region or enables a forbidden purchase. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingPlanPage.tsx src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-08** — Resumed implementation and verification. Screen source/component tests exist from the previous work period; temporary logs/captures did not survive the environment refresh. Re-running required checks and recreating visual evidence before completion. No deployed/provider acceptance claimed.

**2026-11-08** — Required focused screen tests passed (13 tests; combined screen run63 tests across54–57). Complete `VITEST_MAX_WORKERS=4 npm test --prefix frontend` passed81 Node +748 Vitest tests/47 files; worker cap prevents machine oversubscription and changes no test inclusion. Frontend `npm exec -- tsc -b`, owned-file `npm exec -- eslint --max-warnings 0 ...` and `npm run build` exited0. Logs: /tmp/billing-screens-focused.log, /tmp/billing-full-final.log, /tmp/billing-build.log. Earlier failed recovery assertions were corrected before this final complete run.

Visual evidence recreated from actual app components with synthetic API boundary responses at1440/390/320 Urdu; no browser errors or horizontal overflow. Prior independent review resolved compact phone layout; approved outline offset4px retained. Detector empty; documenter verified ordinary scoped extension, no root design changes. No route/deployed/provider completion claimed by this unit.
