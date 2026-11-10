# Spec 35 — Confirming and ready screens

**Status:** Not started
**Depends on:** Spec 03, Spec 04, Spec 22
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingActivationPage.test.tsx`, `frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts`, `frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.test.tsx`, `specs-saas-onboarding/inventory/35-confirmation-screens.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts` (spec 22), `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03)

## Goal

Show honest progress while the server confirms the subscription, then a clear success with explicit entry to the workspace.

## Scope

- Three rows: Payment received, Activating your subscription, Preparing your workspace. Each tick reflects a real fact.
- At 20 seconds show the "taking a little longer" notice. At 120 seconds show "please don't pay again" and Check again.
- Ready shows the stamp, plan, interval, next payment date and "Open your workspace".
- Only server `WORKSPACE` shows Ready. Paddle's browser event never does.
- Reloading this page resumes correctly.
- Denied shows sign in again. Restricted shows the restriction.
- Extend the confirmation hook, additively, to return the latest confirm `outcome` and a count of consecutive `NOT_PAID` responses for the current run and owner. Both start empty and clear on retry or owner change. Polling, timing and the existing statuses do not change.
- Route on that outcome, never on `onboardingStep` alone. `NO_CHECKOUT` goes to the plan page at once. `NOT_PAID` goes to payment, or to the plan page when the server step is `CHOOSE_PLAN`, and only after two `NOT_PAID` responses in a row in one run, because a checkout that has just finished may not read as paid yet.
- `PROCESSING`, a failed read and a timeout stay on this screen. Denied and restricted are checked first and never redirect.
- Tests also prove a single `NOT_PAID` does not redirect, and that `NOT_PAID` then `PROCESSING` resets the count.
- Announce changes with `role=status`.

## Explicit non-scope

- Polling logic → spec 22.
- The dashboard → spec 40.

## Reuse first

- Use the confirmation hook.
- Do not derive anything from the URL.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Map hook states to the design.
3. Add the stamp with reduced-motion handling.
4. Test each state.
5. Record what you created in `specs-saas-onboarding/inventory/35-confirmation-screens.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingActivationPage.test.tsx` passes and proves: slow and timeout states; Ready only from server facts; reload resumes; NOT_PAID and NO_CHECKOUT redirect; reduced motion; restricted never shows Ready. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/35-confirmation-screens.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-10 — Continued after scope revision:** The current Owns and Scope explicitly allow the additive confirmation-hook fields, resolving the earlier scope blocker recorded below. Added latest scoped `outcome` (initially `null`) and `consecutiveNotPaid` (initially `0`), cleared on retry and owner/company/role changes. Non-unpaid outcomes reset the count; failed reads and foreign-company responses break the streak without replacing the latest accepted outcome. Polling gaps, deadlines, existing statuses and cache keys are unchanged. The page now routes from outcomes only: `NO_CHECKOUT` immediately chooses a plan; two consecutive `NOT_PAID` results return to payment, or choose a plan for `CHOOSE_PLAN`. Denial/restriction take precedence, while processing, failed reads and timeout remain on confirmation. Updated the inventory fragment to document the completed contract and remove its obsolete blocker.
- **2026-11-10 — Current focused verification:** The exact acceptance command `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingActivationPage.test.tsx` passed: **46 tests, 1 file, 0 failures/skips**. The combined page/hook/composer run also passed: **110 tests, 3 files, 0 failures/skips**. New regressions prove one unpaid read does not redirect, processing/failure reset the streak, outcome routing works without a lifecycle step, reload starts a fresh streak, and denied/restricted outcomes stay put. Existing server-only Ready, browser-event/cache/URL safety, slow/timeout/retry, renewal facts, Urdu and shared reduced-motion checks remain. No additional edits to the pre-existing composer test changes were needed in this continuation.
- **2026-11-10 — Current final acceptance:** `npm test --prefix frontend` passed: **88 Node + 2,186 Vitest tests (59 files) = 2,274 passed, 0 failures/skips**, including the **46 page, 40 hook and 24 composer** cases. `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors/warnings**. `npm run build --prefix frontend` passed. The existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning and Vite `PLUGIN_TIMINGS` advisory remain outside Owns. Inspected the completed inventory fragment and ran `git diff --check` successfully. Every Done when command ran and passed in this continuation; all acceptance boxes are now checked. Tests/build used the guide's dummy loopback database URL and `DOTENV_CONFIG_PATH=/dev/null`, with `VITEST_MAX_WORKERS=2` for Vitest. JSDOM checks motion hooks and CSS, not browser rendering; no runtime/end-to-end application run or real provider/database check was performed. Changed only owned implementation/tests/inventory, this spec's checkboxes/Log, and the existing permitted composer-test edits. Status and PROGRESS.md remain unchanged. No real Paddle, database, secrets, migration, deploy, GitHub issue/PR, commit, merge, push or branch command was used.
- **2026-11-10 — Scope blocker:** `useCheckoutConfirmation.ts` (spec 22, outside Owns) discards the confirm response's `outcome` and exposes only `status`, `lifecycle` and `retry`. `NOT_PAID` and `NO_CHECKOUT` can yield identical visible hook state, so this screen cannot guarantee their distinct required redirects. A canceled checkout can also return `NOT_PAID` with lifecycle step `CHOOSE_PLAN`, which requires a different route under this spec. Implemented redirects only for explicit server `PAYMENT` and `CHOOSE_PLAN` steps; ambiguous results remain safe on confirmation. Completing the requirement needs the spec 22 owner to expose the latest scoped outcome, reset on retry/identity changes, followed by the outcome mapping here. Stopped that part without changing the hook or other application files. The first acceptance item remains unchecked despite its command passing, because the full outcome-specific requirement cannot be proved. Status and PROGRESS.md were left unchanged per the run instructions.
- **2026-11-10** — Rebuilt `BillingActivationPage` with the approved `FlowShell`, existing controls, dictionary and motion classes. Three factual progress rows never tick on an unknown subscription or browser event; a qualified active server subscription completes payment and activation together. The real hook drives the 20-second slow notice, 120-second timeout and manual retry. Unknown payment outcomes use the existing neutral warning to check again before another payment, avoiding the prototype's unsupported payment-safety guarantee. Ready requires fresh hook activation plus server `WORKSPACE` and allowed access for an active, unsuspended company. It shows the stamp, actual plan/interval, UTC next-payment date (or Not available), and explicit workspace entry. Denied and restricted have sign-in/support actions. Status announcements, heading focus, Urdu direction and shared reduced-motion handling are preserved. A terminal active result missing `WORKSPACE` offers retry instead of waiting indefinitely.
- **2026-11-10** — `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingActivationPage.test.tsx` passed: **33 tests, 1 file, 0 failures/skips**. Tests use the real hook with fake timers, mocked API/auth/SDK seams and an in-memory QueryClient. Coverage includes timing/retry, server-only readiness, browser completion/URL/cache safety, reload, owner isolation, denied/restricted states, explicit-step redirects, safe ambiguous outcomes, renewal facts, Urdu and the reduced-motion stylesheet override. JSDOM verifies CSS hooks and rules, not browser layout or computed animation; no runtime or end-to-end application run was performed.
- **2026-11-10** — Under the guide's test-only exception, changed only activation-screen assertions in `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`: `return alone never readies ... server state` (4 cases) and `an early linked unknown record resumes confirmation instead of subscriber billing` now expect the approved heading/action labels; `server permission alone enables workspace through explicit action` became `fresh server confirmation enables workspace through explicit action`, requiring an actual mocked confirm response with `WORKSPACE` and asserting its safe transport call. Existing guards remain checked. The composer file's **24 tests passed** during the combined run; that run had one focused-test fixture failure subsequently corrected and verified by the 33-test focused run.
- **2026-11-10** — `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. Created and inspected the inventory fragment. All test/type/lint/build commands use `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`; Vitest commands also use `VITEST_MAX_WORKERS=2`. No real Paddle, application database, migration, deploy, GitHub issue/PR, commit, merge, push or branch command was used.
- **2026-11-10** — `npm test --prefix frontend` passed: **88 Node + 2,164 Vitest tests (59 files) = 2,252 passed, 0 failures/skips**, including the 33 focused and 24 composer cases. The existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning for the mobile translation file remains outside Owns. The first build attempt caught the test's static `node:fs` import lacking app ambient Node types; changed only that test to load the filesystem helper through typed `vi.importActual`, then reran the exact focused command (**33 passed**) and frontend type check (**0 errors/warnings**), both successfully. The reduced-motion assertion still reads and checks the actual shared CSS.
- **2026-11-10** — Final `npm run lint --prefix frontend` passed with **0 errors/warnings**. Final `npm run build --prefix frontend` passed, including its TypeScript build; the existing Vite `PLUGIN_TIMINGS` advisory remains outside Owns. `git diff --check` passed. Only the owned page/test/inventory, this spec's checkboxes/Log, and the permitted composer test assertions changed. All required Done when commands ran; only the outcome-specific acceptance item remains unchecked for the documented cross-spec blocker.
