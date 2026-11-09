# Spec 13 — Paddle.js loading and normalized events

**Status:** Done
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/lib/paddle.ts`, `frontend/src/lib/paddle.test.tsx`, `specs-saas-onboarding/inventory/13-paddle-sdk-inline.md`
**Reuses:** `docs/plan-project/saas-onboarding/research/paddle.md`, `ARCHITECTURE.md#time-limits`

## Goal

Load Paddle.js reliably, open the inline form with the right settings and give the app one normalized event stream.

## Scope

- Add a 15 second script watchdog. A failed attempt removes its tag and can be retried.
- Keep one initialized instance. Never re-initialize on render.
- `openInlineCheckout` uses `displayMode` inline, `variant` one-page, the given `frameTarget`, `frameInitialHeight` 450, `frameStyle` with full width and minimum width 312px, `transactionId`, `allowLogout` false, `showAddDiscounts` false, and `theme` light. `locale` is English, because Urdu is unsupported.
- Normalize events to: `loaded`, `updated` (with totals), `paymentFailed`, `paymentError`, `openError`, `completed`, `closed`. Carry `transactionId` when present.
- Do not set `successUrl`; the app handles completion itself.
- Additive only: keep `getPaddle`, `subscribePaddleEvents` and `CheckoutEventNames` working, because the current payment page still uses them until spec 40.

## Explicit non-scope

- Using the events → spec 21.
- Rendering the frame target → spec 25.

## Reuse first

- Keep the existing `subscribePaddleEvents` fan-out.
- Confirm event names and settings in the installed `@paddle/paddle-js` types.

## Steps

1. Add the watchdog.
2. Add `openInlineCheckout`.
3. Add the normalizer, including flat `checkout.error` and `checkout.payment.error` events that have no `data`.
4. Test retry, single initialization and each event shape.
5. Record what you created in `specs-saas-onboarding/inventory/13-paddle-sdk-inline.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/lib/paddle.test.tsx` passes and proves: script timeout then successful retry; one initialization; correct inline settings; flat error events normalize; a failing listener cannot block others. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/13-paddle-sdk-inline.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Extended the existing Paddle singleton and listener fan-out. Added the 15-second script watchdog with tag/handler/timer cleanup and explicit retry, `openInlineCheckout` with the specified settings and no success URL, and the additive normalized event subscription. Loaded/updated events expose totals, recurring totals and currency; flat checkout/payment errors need no `data`. Normalized events carry only the event's transaction ID and allowed amounts, excluding customer/payment details and provider error text. Existing raw subscriptions and enum exports remain compatible. Confirmed names, settings and SDK behaviour against installed `@paddle/paddle-js` **1.6.5** types and loader source. Added the inventory fragment; no application files or tests outside `Owns` changed and the test-only exception was not needed.
- **2026-11-09** — Final focused command `cd frontend && npx vitest run src/lib/paddle.test.tsx`: **42 passed**, 0 failed/skipped. Covers the exact timeout boundary and successful retry, existing-tag cleanup, late events, one shared initialization, exact inline options, normal/flat event shapes, amount copying, legacy compatibility and listener isolation. The installed wrapper was exercised only against a fake browser global, never a downloaded script. An initial focused run had **41 passed / 1 failed** because two fixtures independently invoked the wrapper's cached loader; consolidated the real-wrapper retry checks into one fixture. Initial type/build checks caught an incomplete test double, corrected by supplying the required Checkout methods.
- **2026-11-09** — Final `npm test --prefix frontend`, with `VITEST_MAX_WORKERS=2`: **88 Node tests + 1,876 Vitest tests passed** across 52 component test files, **0 failures/skips**; the 42 focused cases are included. The first default-worker run had **88 Node passed, 1,874 Vitest passed / 2 failed** in existing heading waits (`launchPages.test.tsx`, `WorkspaceGate.test.tsx`). Both passed unchanged on the worker-limited whole-suite rerun. The existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning for the mobile translation module remains outside this spec's scope.
- **2026-11-09** — `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. `npm run build --prefix frontend` passed; the existing Rolldown `PLUGIN_TIMINGS` advisory remains (Babel/CSS plugin time). Inventory existence/content and `git diff --check` passed. Every test/check ran with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. No real Paddle or database access, migrations, deployments, commits, branch commands, issues or PRs. Live inline rendering, real cards and provider behaviour were not verified and remain with the later probe/frame/controller specs. Status and progress tracker left unchanged per run instructions.
- **2026-11-09 — continuation verification** — Reviewed the existing partial implementation, tests and inventory against this spec and the installed SDK types/loader; no further application or test edits were needed. Reran every Done when check in this session: focused Paddle tests **42 passed**; `npm test --prefix frontend` with `VITEST_MAX_WORKERS=2` **88 Node + 1,876 Vitest passed** across 52 Vitest files, **0 failures/skips**. Types and lint passed with **0 errors/warnings**; production build passed. The existing Node module-type warning and build plugin-timing advisory remain. Verified the inventory fragment and whitespace check. All commands used the dummy database URL and disabled dotenv configuration. No real Paddle/database access or live rendering was needed or verified. Updated only this Log and the owned inventory fragment during this continuation; preserved the existing implementation and left Status/PROGRESS unchanged.
