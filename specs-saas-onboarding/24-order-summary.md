# Spec 24 — Order summary

**Status:** Done
**Depends on:** Spec 03, Spec 04
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/OrderSummary.tsx`, `frontend/src/pages/Subscription/onboarding/OrderSummary.test.tsx`, `specs-saas-onboarding/inventory/24-order-summary.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `DESIGN-SYSTEM.md#component-conventions`, `frontend/src/pages/Subscription/onboarding/billingPrice.ts`, `docs/plan-project/saas-onboarding/research/paddle.md`

## Goal

Show the purchase details Paddle requires beside the card form, using real totals only.

## Scope

- Shows plan, interval, capacities, subtotal, tax, due today, renewal amount and interval, change plan link, and the security note.
- Amounts come from Paddle totals props. Until they arrive, show skeletons, not guesses.
- If totals never arrive, show the catalog recurring price and "Calculated by Paddle".
- No trial wording. Never show a zero that was not provided.
- Change plan can be hidden by a prop while replacing or paying.
- Compact below 1024px as specified.

## Explicit non-scope

- Fetching totals → spec 21.
- Payment page layout → spec 37.

## Reuse first

- Use `formatBillingPrice`. Do not write another formatter. Paddle totals are in the smallest currency unit, as strings.

## Steps

1. Build the component.
2. Add loading, full and fallback states.
3. Test each state and Urdu number direction.
4. Record what you created in `specs-saas-onboarding/inventory/24-order-summary.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/OrderSummary.test.tsx` passes and proves: skeletons until totals; real totals render; fallback never invents tax; change plan can be hidden; amounts stay left-to-right in Urdu. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/24-order-summary.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

### 2026-11-10

- Added the additive `OrderSummary` component and its props/types, with plan/interval/capacities, independent Paddle subtotal/tax/due/renewal amounts, skeletons, an explicit caller-controlled fallback, a hideable change-plan link, and the security note. Reused `formatBillingPrice`, language context/dictionary and closed design tokens. Capacities and security note hide below 1024px; sticky positioning starts at 1024px. Payment-page placement remains spec 37.
- All amounts are exact minor-unit strings. No inferred zero, guessed tax, catalog substitution for current totals, or trial copy. Explicit provider zero is supported. Catalog fallback applies only to renewal and requires a matching interval. Amounts and capacity numbers remain LTR in Urdu.
- Focused command passed: **20 tests, 0 failures, 0 skipped**. The initial run had 11 passes and 6 failures because test expectations assumed `$` while the reused formatter correctly emits `US$` for en-PK; corrected the expectations and added three edge cases before the passing run.
- Whole frontend command passed: **88 Node tests + 1,978 Vitest tests across 55 files = 2,066 tests passed, 0 failures, 0 skipped**. The whole suite includes the 20 focused cases. No existing tests outside Owns were changed.
- Frontend type check and lint passed with **0 errors, 0 warnings**. Production build passed. The build emits the pre-existing Rolldown `PLUGIN_TIMINGS` performance advisory; Node tests emit the known `MODULE_TYPELESS_PACKAGE_JSON` warning for mobile translations. Neither requires a change in this spec's owned files, and those unrelated files were left untouched. `git diff --check` passed.
- Wrote `inventory/24-order-summary.md` with the reusable API and integration boundary: specs 13/21 preserve numeric SDK amounts, while this component intentionally requires spec 24's minor-unit string props. No formatter or adapter guesses SDK units. Conversion/fetching and composing the payment page are outside Owns and remain for the consuming spec; no outside application files were edited.
- Tests use the invalid localhost database URL and `/dev/null` dotenv path. No real database, Paddle account, deployment, migration, issue, PR, commit or branch operation was used. Actual browser layout and payment integration were not run; JSDOM verifies responsive hooks and RTL isolation only. Status and PROGRESS.md remain unchanged per runner instructions.
