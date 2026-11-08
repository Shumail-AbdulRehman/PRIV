# Spec 56 — Confirm server entitlement and recover polling

**Status:** Done
**Depends on:** Spec 46, Spec 47, Spec 50, Spec 51
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingActivationPage.test.tsx`, `specs-billing-onboarding/inventory/56-activation-screen.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/activation.html`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `frontend/src/pages/Subscription/queries.ts`, `frontend/src/lib/paddle.ts`, `DESIGN-SYSTEM.md#states-and-motion`

## Goal

Keep owners in an explicit confirmation state until current server permission allows the workspace, including recoverable delayed/failed refreshes.

## Scope

- Treat return URL and Paddle events only as triggers to read lifecycle; never local success or a browser trial clock.
- Pending/unknown/reconciliation shows confirmation, retained plan and refresh; no fresh purchase or workspace CTA. Bound automatic retry according to query contract.
- Confirmed requires server workspaceAccessAllowed with current tenant/owner; render the approved ready state and Open workspace action to /dashboard.
- Expired/future/missing/unqualified/restricted server state cannot become ready even if a mirrored status says active/trialing.
- Accessible progress labels distinguish confirming from ready; preserve EN/UR and explicit manual refresh after timeout/network recovery. No help/contact.

## Explicit non-scope

- Server permission evaluation → spec 49.
- Checkout request/event correlation → spec 53.
- Welcome alias/route security → spec 59.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Compose the shell and confirmation states with the shared display/query contracts; use current owner-keyed lifecycle.
2. Subscribe to refresh signals with cleanup and let current server response determine the final action.
3. Keep pending/failed reads honest; show refresh and own-security recovery where appropriate without asking for another card.
4. Test progression with controlled query responses/clock rather than waiting real seconds.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/56-activation-screen.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingActivationPage.test.tsx` passes: return/event alone never grants access; unknown/expired/future/mismatched/restricted false permission stays blocked; true server permission shows workspace action; transient retry/manual refresh recovers; no second payment/help. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingActivationPage.tsx src/pages/Subscription/onboarding/BillingActivationPage.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-08** — Resumed implementation and verification. Screen source/component tests exist from the previous work period; temporary logs/captures did not survive the environment refresh. Re-running required checks and recreating visual evidence before completion. No deployed/provider acceptance claimed.

**2026-11-08** — Completed locally. Focused screen tests passed15; combined54–57 run passed63 and separate58 passed12. `VITEST_MAX_WORKERS=4 npm test --prefix frontend` passed81 Node +748 Vitest tests/47 files. Frontend `npm exec -- tsc -b`, scoped `npm exec -- eslint --max-warnings 0` over screens/tests54–58 and `npm run build` passed. Corrected activation ref assignment to an effect for React lint; corrected recovery text query before final full run. Logs /tmp/billing-screens-focused.log, /tmp/spec58-focus.log, /tmp/billing-full-final.log, /tmp/billing-build.log.

Actual component preview with synthetic API responses checked1440/390/320 Urdu; no overflow/browser errors. Detector empty. Independent finish reviewer scored both requested account fixes resolved (localized usage heading, blue token tracks); documenter confirmed incumbent system fit. Additive translated usage/portal-opening/recovery phrases are a lead-approved shared translation exception, no global design change. Provider cards/webhooks/SQL persistence not established by these screen tests.
