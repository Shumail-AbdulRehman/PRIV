# Spec 25 — Inline Paddle frame

**Status:** Not started
**Depends on:** Spec 03, Spec 13, Spec 14
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.tsx`, `frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.test.tsx`, `specs-saas-onboarding/inventory/25-paddle-frame.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/lib/paddle.ts` (spec 13), `docs/plan-project/saas-onboarding/research/sandbox-probe.md` (spec 14), `DESIGN-SYSTEM.md#layout-conventions`

## Goal

Provide the stable page element that Paddle's card form loads into, with a skeleton until it is ready.

## Scope

- A stable element with one constant class name, registered with the controller once.
- Skeleton and visible "Loading the secure card form" until `ready`, then a 240ms container fade.
- Reserves at least 450px height so the page does not jump.
- At least 312px wide, and full width at phone sizes. The Paddle footer stays fully visible; do not clip it.
- Always left-to-right, even in Urdu.
- Never inspects the cross-origin iframe.
- Keeps the same DOM node across re-renders and language change.

## Explicit non-scope

- Opening Paddle → spec 21.
- Error messages around the frame → spec 37.

## Reuse first

- Use the skeleton and fade classes in `flow.css`.

## Steps

1. Check the probe results for real frame behaviour.
2. Build the component.
3. Test node stability, loading and ready states.
4. Record what you created in `specs-saas-onboarding/inventory/25-paddle-frame.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/PaddleCheckoutFrame.test.tsx` passes and proves: the target node survives re-render and language change; skeleton shows until ready; the target is registered once and released on unmount. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/25-paddle-frame.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

### 2026-11-10

- Added `PaddleCheckoutFrame` and its props, reusing the existing controller's stable registration callback, shared skeleton/fade classes and existing English/Urdu loading translation. The constant `paddle-checkout-frame` target stays mounted through readiness and language changes; its provider-owned children are never inspected or replaced. Loading keeps the target measurable but invisible/inert; readiness fades the container. The slot is LTR, full width, at least 312px wide and 450px high, with natural height growth and visible overflow for the provider footer.
- Read the approved prototype, shared inventory/controller contract and sandbox probe report before implementation. The report establishes provider draft operations, but contains no observed browser frame/footer behaviour. Real Paddle rendering, footer visibility and physical browser sizing remain unverified; no provider request, application database, migration or deployment was used. Component/layout hooks are verified by DOM tests, not claimed as real Paddle evidence. Opening/error handling and page composition remain with their owning specs.
- Ran the focused Done command: **1 test file, 6 tests passed, 0 failed/skipped**. Tests cover one registration across rerenders/language/readiness, release on unmount, translated skeleton and ready fade, preserved provider-inserted iframe with guarded cross-origin getters, LTR/sizing/overflow hooks, and balanced StrictMode effect replay.
- Ran `npm test --prefix frontend`: **88 Node tests + 2,206 Vitest tests across 60 files passed; 0 failures/skips**. The 6 focused tests are included in the Vitest total. The existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning refers to the mobile translation module; no mobile files were changed.
- Ran `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend`: both exited 0, **0 errors and 0 warnings**. Ran `npm run build --prefix frontend`: exited 0; Vite emitted the existing `PLUGIN_TIMINGS` performance advisory for Babel/CSS. No source/build errors occurred.
- Wrote and inspected `inventory/25-paddle-frame.md`; `git diff --check` passed. No test-only scope exception was needed. Only the two owned source/test files, owned inventory fragment and this required spec Log/checklist were edited. Status/PROGRESS, issues/PRs and branch/commit operations were left untouched as instructed. All verification commands used the dummy localhost database URL and `DOTENV_CONFIG_PATH=/dev/null`.
