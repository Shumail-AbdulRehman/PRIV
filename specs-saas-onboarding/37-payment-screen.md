# Spec 37 — Payment screen

**Status:** Done
**Depends on:** Spec 21, Spec 24, Spec 25
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx`, `specs-saas-onboarding/inventory/37-payment-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Subscription/onboarding/useCheckoutSession.ts` (spec 21), `frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.tsx` (spec 25), `frontend/src/pages/Subscription/onboarding/OrderSummary.tsx` (spec 24)

## Goal

Rebuild the payment page with Paddle's real card form on the page beside the order summary.

## Scope

- Compose heading, test card box, frame, notices and summary at wide size.
- Test card box only when browser and server are both sandbox, with Copy and the extra cards.
- Notices: declined, offline, resumed, processing, replacing.
- Frame failure replaces the frame with "The card form didn't load" and Try again.
- Change plan is available unless paying or replacing.
- Selection comes from the saved draft first, then allowlisted URL values. Missing or invalid sends the owner to the plan page.
- Urdu shell explains the card form is in English.
- No app-owned Pay button.
- Completed moves to activation.
- Remove the inline `<style>` block and the shared busy flag.

## Explicit non-scope

- Controller logic → spec 21.
- Recovery screen → spec 38.

## Reuse first

- Use the components named. Do not rebuild the summary.
- `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Rebuild the page.
2. Map each machine state to the design.
3. Test each state.
4. Record what you created in `specs-saas-onboarding/inventory/37-payment-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx` passes and proves: frame present and no app card fields; test card only in matched sandbox; each notice; failure offers retry; change plan hidden while paying; a catalog refetch does not remount the frame. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/37-payment-screen.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-10** — Rebuilt the owner payment screen with the approved wide `FlowShell`, existing `useCheckoutSession`, `PaddleCheckoutFrame`, and `OrderSummary`. The summary moves above the form below 1024px. Added matched-sandbox test guidance with Copy and extra-card disclosure; mapped checking, preparing, loading, declined, offline, resumed, processing, replacing, failure, unresolved and restricted states to visible announcements and controller actions. Retry/status use independent locks. Change plan follows machine capabilities, including hiding during payment/replacement. Completion goes to activation. Removed the overlay action, inline stylesheet, duplicated summary and shared busy flag. Reused existing translations, tokens, scoped lifecycle validation, API plan definitions and URL allowlist parser. Saved drafts precede URL selection; invalid or ambiguous selections without a draft return to the plan page. Background reads and Urdu changes preserve the frame; Urdu explains the provider form is English.
- **2026-11-10** — Resolved the recorded specs 13/21/24 integration boundary inside the owned payment page: SDK totals are numeric major-unit values, while `OrderSummary` requires minor-unit strings. Verified installed SDK declarations and public [Paddle inline-checkout documentation](https://developer.paddle.com/build/checkout/build-branded-inline-checkout/) plus the [loaded-event schema](https://developer.paddle.com/paddle-js/events/checkout-loaded/). Adapted using the shared formatter's currency precision, without rounding or binary multiplication. Tests cover USD, zero-decimal JPY, three-decimal KWD, missing/unsupported currency, explicit zero and rejected unsafe/invalid precision. No shared component/controller edits were needed.
- **2026-11-10** — Test-only exception: updated only the payment cases and supporting mocks/fixtures in `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`. Edited `browser/server environment %s cannot initialize SDK or create` (two cases) and `missing browser SDK configuration creates zero reservations` to assert the inline configuration failure without an overlay-opening click; retained zero-provider/zero-purchase checks. Changed `prepares only plan/interval once; overlay receives returned exact transaction` to assert one automatic prepare and the exact inline target/transaction, with no overlay or app payment action. Changed `fresh linkage denies stale purchase selection` to inject linkage during SDK loading and retain zero purchase/open assertions. Changed `lost checkout response preserves controller uncertainty across query refetch and cannot POST again` to exercise the actual scoped refetch, new unresolved notice/status action, and retained one-POST/no-private-error checks. Changed `account switching prevents former owner overlay` to assert neither inline nor overlay opens after an owner switch. Changed `saved draft reload retains exact year selection and never POSTs automatically` to assert automatic inline resumption of the exact saved draft/year with zero additional POSTs. Other screen assertions remain unchanged; the mock lifecycle now includes the server onboarding step required by the new controller.
- **2026-11-10** — Final required focused command `cd frontend && npx vitest run src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx`: **59 passed, 1 file, 0 failures/skips**. The payment/composer pair also passed **83 tests** (59 payment + 24 composer). Covers the real target/summary composition, every machine state, sandbox gating/Copy/disclosure, failure retry, independent action/status locks, saved-selection precedence and invalid redirects, owner restriction, provider totals, activation handoff, and target identity/registration through background reads and Urdu.
- **2026-11-10** — Required `npm test --prefix frontend` passed with `VITEST_MAX_WORKERS=2`: **96 Node tests + 2,246 Vitest tests across 60 files, 0 failures/skips**. All test/check commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. The initial full run had **2,227 Vitest passes and 9 failures**: eight old overlay assertions were updated under the exception above, and an unrelated workspace lazy-route lookup timed out under the default worker load. It passed on the final reduced-worker whole-suite run without editing that test. An intermediate currency test assertion normalized nonbreaking whitespace incorrectly; corrected the assertion. Type checking caught the SDK/summary contract mismatch and an unused test import, both fixed before final checks.
- **2026-11-10** — Required `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend`: **passed, 0 errors and 0 warnings**. Required `npm run build --prefix frontend`: **passed**. The build retains the existing Vite/Rolldown `PLUGIN_TIMINGS` advisory; Node tests retain the existing mobile translation module-type advisory. These are outside this spec's owned files. `git diff --check` passed. Wrote and verified `inventory/37-payment-screen.md`.
- **2026-11-10** — Verification used JSDOM and mocked API/Paddle seams. Real Paddle, downloaded provider scripts, database access, real payments, and browser/end-to-end layout checks were not run. No deployment, migration, issue, PR, commit, branch command, or changes to PROGRESS/the Status line. Only owned code/tests/inventory, this requested spec Log/checklist, and the explicitly permitted composer test were changed.
