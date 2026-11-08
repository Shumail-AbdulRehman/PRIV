# Spec 58 — Render known-failure and uncertain-payment recovery

**Status:** Done
**Depends on:** Spec 47, Spec 50, Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx`, `specs-billing-onboarding/inventory/58-billing-recovery-screen.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/recovery.html`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `frontend/src/pages/Subscription/onboarding/useBillingCheckout.ts`, `frontend/src/pages/Subscription/queries.ts`, `DESIGN-SYSTEM.md#component-conventions`

## Goal

Offer a concrete self-service recovery path without repeating signup, guessing payment success or sending users to nonexistent support.

## Scope

- Distinguish pre-submit SDK/open failure from submitted/unknown/409 reconciliation state. The former can retry preparation; a known prepared draft may reopen that same ID only after a fresh safe server check, never create a replacement.
- Uncertain state shows Check subscription status as primary; no prepare-new-payment action, timeout-based cancellation or promise that no charge occurred.
- Preserve actual saved plan/interval; expose owner security and sign-in recovery where appropriate. Do not claim a durable account on pre-signup validation failure.
- Unavailable/denied/restricted states use neutral next steps: refresh status, sign in again or own-account security as applicable. No Help/Contact us/support channel wording or fake destination.
- Keep status, alert and focus behavior correct in EN/UR and on reload.

- Do not claim a provider charge, unmatched reservation or permanent backend failure from local uncertain state alone. Use validated lifecycle facts for those claims; keep the selected plan and explain checking status when the actual outcome is unknown.

## Explicit non-scope

- Actual checkout mutation policy → spec 53.
- Server reconciliation/resume facts → spec 49.
- Route integration → spec 59.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Build a small explicit view-state renderer, using controller/query state rather than broad catch-all error text.
2. Connect retry only when controller says pre-submit or server-proven reopenable; connect uncertain recovery to lifecycle refresh/confirmation.
3. Preserve safe account/security actions and focus the changed status heading after a recovery transition.
4. Write component tests proving forbidden actions are absent, not merely disabled behind a misleading label.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/58-billing-recovery-screen.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx` passes: known pre-submit failure can retry; uncertain/409/lost-response cannot prepare new checkout; saved plan retained; wrong/suspended owner is not told paid/ready; self-service refresh/security work; no Help/Contact/mailto wording. [unit]
- [x] Focused recovery tests distinguish local response loss with no proven server hold, server reconciliation hold and server-proven resumable draft; each has an explicit status/reopen path without new checkout or invented diagnosis. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingRecoveryPage.tsx src/pages/Subscription/onboarding/BillingRecoveryPage.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-08** — Completed locally. Focused screen tests passed12; combined54–57 run passed63 and separate58 passed12. `VITEST_MAX_WORKERS=4 npm test --prefix frontend` passed81 Node +748 Vitest tests/47 files. Frontend `npm exec -- tsc -b`, scoped `npm exec -- eslint --max-warnings 0` over screens/tests54–58 and `npm run build` passed. Corrected activation ref assignment to an effect for React lint; corrected recovery text query before final full run. Logs /tmp/billing-screens-focused.log, /tmp/spec58-focus.log, /tmp/billing-full-final.log, /tmp/billing-build.log.

Actual component preview with synthetic API responses checked1440/390/320 Urdu; no overflow/browser errors. Detector empty. Independent finish reviewer scored both requested account fixes resolved (localized usage heading, blue token tracks); documenter confirmed incumbent system fit. Additive translated usage/portal-opening/recovery phrases are a lead-approved shared translation exception, no global design change. Provider cards/webhooks/SQL persistence not established by these screen tests.
