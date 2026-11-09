# Spec 34 — Public pricing links and trial copy

**Status:** Done
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

- [x] `cd frontend && npx vitest run src/pages/Pricing/PaddlePricing.test.tsx` passes and proves: each plan links to signup with its plan and interval; a signed-in owner goes to /continue; a manager sees no purchase link; no trial wording renders. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `grep -ri "free trial\|any trial" frontend/src` finds nothing outside the status label. [static]
- [x] `specs-saas-onboarding/inventory/34-public-pricing.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

### 2026-11-10

- Continued the partial implementation already present in this worktree. Public Starter/Pro links use shared onboarding routes and carry only the allowlisted plan and selected monthly/yearly interval. Owners continue through `/continue`; managers, staff and disabled purchases get an explanation. The marketing workspace CTA also uses `/continue` for authenticated users.
- Enterprise self-service is offered only to an owner whose private catalog contains `ADVANCED` for the selected interval. Visitors never request that private catalog. Missing, loading or failed catalog reads retain the existing inquiry. Updated the public FAQ to describe this availability accurately.
- Removed the old public pricing notice and its unused trial translation; retained the historical `Trialing` status. The remaining `Provider trial` translation is still used by `Subscription/onboarding/BillingPlanPage.tsx` and `BillingPaymentPage.tsx`, outside this spec's ownership; their replacement belongs to their screen specs. No changes were made to those files.
- Frontend-wide case-insensitive `trial` audit: other application hits are historical status handling in `components/onboarding/WorkspaceGate.tsx` and `Subscription/onboarding/BillingAccountPage.tsx`; compatibility metadata/comments in `Subscription/types.ts` and `Subscription/onboarding/billingContract.ts`; and the `plan-trial` CSS class in `marketing.css` and `Pricing/EnterprisePlan.tsx` (no visible trial wording). Other test hits are in `WorkspaceGate.test.tsx`, `onboardingTranslations.test.tsx`, `SubscriptionPage.test.tsx`, `api.test.tsx`, and onboarding tests `billingPrice`, `BillingActivationPage`, `BillingPlanPage`, `billingViewState`, `BillingPaymentPage`, `billingContract`, and `BillingAccountPage`. Owned pricing tests also assert absent promotional wording and retained historical status.
- Expanded the owned test file to cover the full pricing page for visitors, owners, managers and staff. No test-only ownership exception was needed. Wrote the inventory fragment. No application files outside Owns were changed; Status and PROGRESS were left untouched. GitHub issue/PR steps were skipped per run instructions.
- All verification commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. No real database or Paddle calls, migrations, deployment, branch operations, commits or pushes were performed.
- Focused command `cd frontend && npx vitest run src/pages/Pricing/PaddlePricing.test.tsx`: **21 passed, 0 failed, 0 skipped** (the initial pre-expansion run passed 17). The required `grep -ri "free trial\|any trial" frontend/src` returned no matches (expected grep exit 1). Inventory inspected; `git diff --check` passed. Type check and lint both passed with **0 errors and 0 warnings**.
- The first whole-suite attempt passed **88 Node tests**, then reported one failure in the unrelated suspended-owner workspace-gate test under concurrent machine load. That Vitest run was interrupted (exit 130) and rerun with the supported `VITEST_MAX_WORKERS=2` environment setting; no unrelated tests were edited.
- Production build `npm run build --prefix frontend` passed. Vite emitted the existing `[PLUGIN_TIMINGS]` advisory (Babel/CSS plugin timing), with no build errors; no unrelated build configuration was changed. Node tests emit the existing mobile translation module-type advisory. Runtime browser/provider validation is not required by this spec and was not performed.
- Final whole-suite command `npm test --prefix frontend` with `VITEST_MAX_WORKERS=2` passed: **88 Node tests + 2,125 Vitest tests across 59 files = 2,213 tests passed, 0 failures, 0 skips**. This includes all **21 pricing tests** and the previously failing workspace-gate case. All Done when commands have now run and passed; only the pre-existing advisories described above remain.
