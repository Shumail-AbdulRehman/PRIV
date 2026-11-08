# Spec 55 — Render order summary and Paddle checkout handoff

**Status:** Done
**Depends on:** Spec 47, Spec 50, Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx`, `specs-billing-onboarding/inventory/55-payment-handoff-screen.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/payment.html`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/billingPrice.ts`, `frontend/src/pages/Subscription/onboarding/useBillingCheckout.ts`, `DESIGN-SYSTEM.md#component-conventions`

## Goal

Show the selected recurring plan and an honest sandbox card handoff before opening the real Paddle overlay.

## Scope

- Use exact selected/server-resumed catalog price, currency, interval and capacities. Label recurring price separately from amount due today; actual taxes/trial/final total remain Paddle facts.
- Render test-card guidance only when both browser/server are validated sandbox; do not show sandbox card values in production.
- Use the checkout controller for create/reopen, disabled/submitting and close/retry/uncertain states; preserve plan on close/reload.
- Change-plan returns to valid selection only before an unresolved transaction exists; after preparation explain the saved selection instead of silently preparing another price.
- No custom card/address inputs, mock confirmation button, decorated payment-icon tile, help/contact control or # policy stub.

## Explicit non-scope

- Pending/ready confirmation → spec 56.
- Status-first recovery screen → spec 58.
- Route registration → spec 59.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Rebuild the approved two-column summary/handoff and compact stacked phone layout using scoped shell tokens.
2. Consume controller state and exact provider-derived selection; require safe data before enabling continuation.
3. Wire actual Paddle overlay through the controller, not the prototype illustration. Put amount and test instructions before the phone action.
4. Cover error/closed/open/loading/uncertain and language states with component tests at the controller boundary.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/55-payment-handoff-screen.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx` passes: selected yearly/currency/capacity summary correct; due-today is not fabricated; sandbox guidance gated; action disabled for stale/missing/unknown data; close preserves draft; unresolved selection cannot change; zero editable card fields/help/contact. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingPaymentPage.tsx src/pages/Subscription/onboarding/BillingPaymentPage.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-08** — Resumed implementation and verification. Screen source/component tests exist from the previous work period; temporary logs/captures did not survive the environment refresh. Re-running required checks and recreating visual evidence before completion. No deployed/provider acceptance claimed.

**2026-11-08** — Required focused screen tests passed (18 tests; combined screen run63 tests across54–57). Complete `VITEST_MAX_WORKERS=4 npm test --prefix frontend` passed81 Node +748 Vitest tests/47 files; worker cap prevents machine oversubscription and changes no test inclusion. Frontend `npm exec -- tsc -b`, owned-file `npm exec -- eslint --max-warnings 0 ...` and `npm run build` exited0. Logs: /tmp/billing-screens-focused.log, /tmp/billing-full-final.log, /tmp/billing-build.log. Earlier failed recovery assertions were corrected before this final complete run.

Visual evidence recreated from actual app components with synthetic API boundary responses at1440/390/320 Urdu; no browser errors or horizontal overflow. Prior independent review resolved compact phone layout; approved outline offset4px retained. Detector empty; documenter verified ordinary scoped extension, no root design changes. No route/deployed/provider completion claimed by this unit.

**2026-11-08** — Spec62 keyboard integration prompted a scoped55 accessibility refinement: after an opened provider overlay closes, restore focus to the same prepared-draft reopen button once reads settle. No selection/provider/entitlement policy change. Focused55 tests now19 passed; final whole frontend/static/browser verification follows in62/63.
