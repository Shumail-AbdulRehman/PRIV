# Spec 34 — Public pricing links and trial copy

**Status:** Not started
**Depends on:** Spec 06
**Model:** Light — `claude-haiku-5-5` · `gpt-6.1-sol` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend/src/pages/Pricing/PaddlePricing.tsx`, `frontend/src/pages/Pricing/PaddlePricing.test.tsx`, `frontend/src/pages/Pricing/PricingPage.tsx`, `frontend/src/i18n/billingTranslations.ts`, `frontend/src/components/marketing/MarketingCTA.tsx`, `specs-saas-onboarding/inventory/34-public-pricing.md`
**Reuses:** `frontend/src/pages/Onboarding/onboardingRoutes.ts` (spec 06), `frontend/src/pages/Pricing/tiers.ts`

## Goal

Send visitors from the pricing page into signup with their plan already chosen, and remove all trial wording.

## Scope

- Plan buttons link to `/signup` with allowlisted plan and interval.
- An authenticated user's call to action goes to `/continue`.
- Remove "any trial" text and the unused trial strings.
- Keep `Trialing` as a status label, because existing subscriptions may have it.
- Enterprise stays self-serve through checkout only if the catalog has it; keep the page accurate to what can actually be bought.

## Explicit non-scope

- Signup handling of the query → spec 30.
- Plan page → spec 33.

## Reuse first

- Use the route constants from spec 06.

## Steps

1. Update links.
2. Search for "trial" in the frontend and remove user-facing wording in owned files, listing any other hits in the Log.
3. Update or add tests.
4. Record what you created in `specs-saas-onboarding/inventory/34-public-pricing.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Pricing/PaddlePricing.test.tsx` passes and proves: each plan links to signup with its plan and interval; a signed-in owner goes to /continue; a manager sees no purchase link; no trial wording renders. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `grep -ri "free trial\|any trial" frontend/src` finds nothing outside the status label. [static]
- [ ] `specs-saas-onboarding/inventory/34-public-pricing.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
