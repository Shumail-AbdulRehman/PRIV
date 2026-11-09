# Spec 24 — Order summary

**Status:** Not started
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

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/OrderSummary.test.tsx` passes and proves: skeletons until totals; real totals render; fallback never invents tax; change plan can be hidden; amounts stay left-to-right in Urdu. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/24-order-summary.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
