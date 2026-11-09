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

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` passes and proves: prices and allowances match the data; keyboard radios; tampered URL ignored; draft notice; loading, error and empty states; refetch does not disable choices. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/33-plan-screen.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

### 2026-11-10

- Continued the partial implementation already present in this folder. Rebuilt the owner plan screen with the shared plan-sized FlowShell, approved ledger headings/rows, exact API allowances and catalog prices, Monthly/Yearly switch, included-features disclosure, replacement notice and sticky phone decision bar. Removed the old inline styles and trial rendering by reusing existing `flow.css` classes; no stylesheet edit was needed.
- URL selections use the shared allowlist parser, followed by the saved draft and Starter/month defaults. Missing or ambiguous prices remain unavailable. Native radios support wrapping arrows, Home/End, one enabled tab stop and mirrored horizontal navigation in Urdu. Background lifecycle, catalog and allowance requests preserve selection, focus and enabled controls.
- Focused command: **30 passed, 0 failed, 0 skipped** (the initial partial-work baseline also ran: **24 passed**). Coverage includes exact data, tampered/duplicate URL values, saved drafts, replacement notice, loading/error/retry/empty/partial data, invalid/duplicate prices, keyboard/Urdu and refetch continuity.
- Full `npm test --prefix frontend` rerun with `VITEST_MAX_WORKERS=2`: **88 Node + 2,121 Vitest tests passed** across 58 component test files, **0 failures, 0 skips**. The first unrestricted run passed 88 Node and 2,120 Vitest tests, with one unrelated `launchPages.test.tsx` failure waiting for the lazy dashboard fixture. The complete rerun passed without changing that test. The existing mobile translation module-type advisory appeared in the Node phase.
- `npx tsc -b --noEmit` and `npm run lint --prefix frontend`: passed with **0 errors and 0 warnings**. `npm run build --prefix frontend`: passed; existing nonblocking Rolldown plugin-timing advisory remains. Inventory fragment created and inspected; `git diff --check` passed.
- Test-only exception: retained the partial update to `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`, changing only the new-owner screen heading assertion from “Choose your plan” to the approved “Choose a plan”. No other composer assertions were changed.
- Every test/build command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. All screen requests were mocked. No real database or Paddle, migration, deployment, issue/PR, commit or branch command was used. Browser layout and real-provider behavior were not verified by this unit/static spec.
