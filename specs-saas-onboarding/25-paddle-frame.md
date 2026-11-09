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

- [ ] `cd frontend && npx vitest run frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.test.tsx` passes and proves: the target node survives re-render and language change; skeleton shows until ready; the target is registered once and released on unmount. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/25-paddle-frame.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
