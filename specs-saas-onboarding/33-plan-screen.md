# Spec 33 — Choose plan screen

**Status:** Not started
**Depends on:** Spec 03, Spec 04, Spec 06
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPlanPage.test.tsx`, `specs-saas-onboarding/inventory/33-plan-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03), `frontend/src/pages/Subscription/onboarding/billingPrice.ts`, `DESIGN-SYSTEM.md#component-conventions`

## Goal

Rebuild plan selection as the approved ledger, using real prices and exact allowances.

## Scope

- Rows for Starter, Pro and Enterprise with locations, staff, managers and price. One labelled radio group.
- Monthly and Yearly switch. No invented discount.
- Preselect allowlisted URL values. Otherwise preselect the saved draft, then Starter.
- "What every plan includes" disclosure.
- Continue goes to payment with the selection.
- If a draft exists for another plan, show the notice that choosing a different plan replaces it and that nothing has been charged.
- States: skeleton, error with Try again, empty, one interval partly missing.
- No trial wording anywhere.
- Background refetch must not disable selection or move focus.
- Sticky decision bar on phones.

## Explicit non-scope

- Payment page → spec 37.
- Public pricing → spec 34.

## Reuse first

- Allowances come from the API. Prices come from the catalog. Hard-code neither.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Add states.
3. Replace the inline `<style>` block with `flow.css` classes.
4. Update tests.
5. Record what you created in `specs-saas-onboarding/inventory/33-plan-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` passes and proves: prices and allowances match the data; keyboard radios; tampered URL ignored; draft notice; loading, error and empty states; refetch does not disable choices. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/33-plan-screen.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
