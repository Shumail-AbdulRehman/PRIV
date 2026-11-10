# Spec 38 — Recovery screen

**Status:** Done
**Depends on:** Spec 03, Spec 04, Spec 12
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx`, `specs-saas-onboarding/inventory/38-recovery-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Subscription/api.ts` (spec 12), `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03)

## Goal

Explain any billing problem with its reason and one next action, and repair stuck checkouts automatically.

## Scope

- On arrival with `RECONCILE`, call reconcile once and show "Checking your previous checkout".
- Outcomes: `RESUMABLE` to payment, `CLEARED` to plan, `PAID` to activation, `IN_PROGRESS` waits and retries, `UNRESOLVED` shows Check again, `CONFLICT` shows the email message with support and sign up with another email.
- `BILLING_DISABLED` and `PRICE_NOT_READY` show payments unavailable with Try again.
- `RESTRICTED` shows the restriction and support.
- Never offers a reset, and never says "not charged" unless proven by the outcome.
- Focus moves to the heading on change.

## Explicit non-scope

- Server reconcile → spec 28.
- Route redirects → spec 40.

## Reuse first

- Support email comes from `getPublicSupport`.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Add the single reconcile call with a guard against repeats.
3. Test each outcome.
4. Record what you created in `specs-saas-onboarding/inventory/38-recovery-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx` passes and proves: each outcome navigates or explains; reconcile runs once under double mount; IN_PROGRESS retries with a limit; no reset button; conflict shows support. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/38-recovery-screen.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

### 2026-11-10

- Rebuilt the owner recovery screen with the approved narrow FlowShell, shared controls and existing Urdu copy. Reconciliation sends once per attempt under StrictMode replay; IN_PROGRESS retries after 2, 5 and 10 seconds, then offers an explicit Check again. Outcome navigation, restriction precedence, unavailable-price/billing retries, conflict signup and configured public support are implemented. No reset or unproven charge claim is shown.
- Reused the bounded reconcile transport and scoped lifecycle query. Owner changes and unmount ignore late results and clear retry timers. A fresh restriction overrides an earlier IN_PROGRESS result.
- Focused command: **26 tests passed**, 0 failures/skips. Covers all six outcomes, StrictMode, retry limit, manual retry, focus, support/fallback, unavailable states, restrictions, Urdu, owner changes, unmount and denied roles.
- Test-only exception: changed only the recovery-copy assertion in `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`, test `foreign/denied lifecycle exposes neither usage nor purchase`. Its old message was replaced by the new uncertainty explanation; the no-usage/no-purchase checks remain. The first whole-suite run found this intended-copy mismatch (1 failure, 2,158 Vitest passes); after correction, 88 Node and 2,159 Vitest tests passed. The additional fresh-restriction regression case was then added for final verification.
- Initial focused run found four test assertion issues involving language buttons and asynchronous support-link replacement; those assertions were corrected before the 26-case pass.
- Inventory: `inventory/38-recovery-screen.md` describes the component, request/retry behavior, shared dependencies and test seam.
- All test/check commands use the loopback port-1 DATABASE_URL and `/dev/null` dotenv configuration. API/support are mocked in focused tests. No real database/Paddle calls, migrations, deployment, branch commands, commits, issues or pull requests. Status and PROGRESS.md remain untouched per run instructions.
- Browser layout and real-provider behavior were not exercised; responsive/RTL/reduced-motion presentation reuses the existing shared shell. Existing Node module-type and Vite plugin-timing advisories are outside this spec's owned files.
- Final standalone TypeScript and lint checks passed with **0 errors, 0 warnings**. Final production build passed; Vite reported the existing PLUGIN_TIMINGS advisory (Babel/CSS timing), with no compile errors.
- An unrestricted-worker whole-suite rerun after the extra regression test had 88 Node passes and 2,157 Vitest passes with 3 unrelated timing failures (BillingPlanPage button readiness, launchPages dashboard heading and WorkspaceGate suspension heading). No unrelated tests or application files were changed for those failures; verification was repeated with `VITEST_MAX_WORKERS=2` to reduce contention.
- Final whole-suite command, with `VITEST_MAX_WORKERS=2`: `npm test --prefix frontend` passed with **88 Node tests + 2,160 Vitest tests across 59 files**, **0 failures, 0 skips**. This includes all 26 recovery tests. All Done-when commands passed; only the existing module-type/build-timing advisories remain.
