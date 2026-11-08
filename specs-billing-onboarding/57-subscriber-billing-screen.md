# Spec 57 — Render existing subscription and self-service portal

**Status:** Done
**Depends on:** Spec 47, Spec 50, Spec 51
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingAccountPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingAccountPage.test.tsx`, `specs-billing-onboarding/inventory/57-subscriber-billing-screen.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/billing.html`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/billingPrice.ts`, `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/queries.ts`, `DESIGN-SYSTEM.md#component-conventions`

## Goal

Give existing subscribers the approved settings screen with true usage, current provider facts and safe Paddle portal access.

## Scope

- Use the settings rail with Plan & billing current, not unfinished onboarding progress. Show active/trialing/past-due/paused/canceled/unknown status honestly.
- Match subscription priceId/interval to actual catalog for recurring price; show unavailable/View in Paddle instead of a sample or inferred amount. Render next date only from real effective provider period/scheduled change.
- Preserve real counts including over-capacity; meter decoration may cap its fill but numeric usage must not be clamped to the plan limit.
- Freshly authorize portal action, validate its allowed HTTPS host and navigate once. Failed/stale/foreign response cannot open an old URL; do not cache/store bearer URLs.
- Existing records, read history and own-security remain available under current policy. No second-purchase button, invented invoices, help/contact or destructive cleanup action.

## Explicit non-scope

- Portal backend ownership/config → spec 49.
- Owner route composition → spec 59.
- Integrated portal/role proof → spec 62.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Rebuild the settings/usage screen from approved source using shared queries/state/price helpers.
2. Display missing metadata explicitly and preserve over-limit counts; translate labels and isolate ratios/dates in Urdu.
3. Wire only managed portal and functioning own-security actions; keep payment details provider-owned.
4. Test known/unknown statuses, scheduled cancellation, true over-limit usage, errors and approved/untrusted portal URLs.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/57-subscriber-billing-screen.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingAccountPage.test.tsx` passes: settings variant no onboarding; true counts survive over-limit; unavailable price/date not invented; linked canceled owner has portal not purchase; fresh portal once and failure preserves page; Urdu ratios and absent help/contact. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingAccountPage.tsx src/pages/Subscription/onboarding/BillingAccountPage.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-08** — Resumed implementation and verification. Screen source/component tests exist from the previous work period; temporary logs/captures did not survive the environment refresh. Re-running required checks and recreating visual evidence before completion. No deployed/provider acceptance claimed.

**2026-11-08** — Completed locally. Focused screen tests passed17; combined54–57 run passed63 and separate58 passed12. `VITEST_MAX_WORKERS=4 npm test --prefix frontend` passed81 Node +748 Vitest tests/47 files. Frontend `npm exec -- tsc -b`, scoped `npm exec -- eslint --max-warnings 0` over screens/tests54–58 and `npm run build` passed. Corrected activation ref assignment to an effect for React lint; corrected recovery text query before final full run. Logs /tmp/billing-screens-focused.log, /tmp/spec58-focus.log, /tmp/billing-full-final.log, /tmp/billing-build.log.

Actual component preview with synthetic API responses checked1440/390/320 Urdu; no overflow/browser errors. Detector empty. Independent finish reviewer scored both requested account fixes resolved (localized usage heading, blue token tracks); documenter confirmed incumbent system fit. Additive translated usage/portal-opening/recovery phrases are a lead-approved shared translation exception, no global design change. Provider cards/webhooks/SQL persistence not established by these screen tests.
