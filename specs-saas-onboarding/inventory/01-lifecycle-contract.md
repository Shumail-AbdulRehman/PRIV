# Spec 01 — Billing lifecycle and outcome contract

## Shared data shapes

- `backend/src/types/billingLifecycle.ts` and `frontend/src/pages/Subscription/types.ts` now expose `BillingOnboardingStep`, `BillingRecoveryReason`, `BillingConfirmOutcome` and `BillingReconcileOutcome` with the architecture's exact values.
- Server result types: `BillingConfirmDto`, `BillingReconcileDto`. Client result types: `BillingConfirmResult`, `BillingReconcileResult`. Each carries the operation's outcome and a lifecycle; an outcome never grants access.
- Lifecycle wire fields `onboardingStep` and `recoveryReason` are optional until spec 36 sends them. `ValidatedBillingLifecycle` always contains both, defaulting to `null`.
- `BillingCheckoutDto` and `BillingCheckout` include optional `replaced` until spec 26 emits it. `ValidatedBillingCheckout` always contains a boolean replacement fact; an older response defaults to `false`.
- Catalog `trialPeriod` is optional and deprecated on both sides, solely for existing screens awaiting replacement.

## Existing parser, extended

`frontend/src/pages/Subscription/onboarding/billingContract.ts` remains the one wire parser. Reuse its existing strict helpers instead of adding a parser elsewhere.

- `parseBillingLifecycle(value, expectedCompanyId?)` validates steps and recovery reasons, rejects unknown values, preserves explicit server capabilities and accepts missing steps as `null`. Supply the current owner's company ID to reject foreign-company payloads.
- `parseBillingConfirm(value, expectedCompanyId?)` and `parseBillingReconcile(value, expectedCompanyId?)` validate operation-specific outcomes and parse the nested lifecycle with the same company scope. They strip extra fields at both levels and return normalized lifecycle fields.
- `parseBillingCheckout(value)` validates `replaced` without coercion and accepts an omitted flag from the existing server.
- `parseBillingCatalog(value)` ignores all legacy trial metadata and returns `trialPeriod: null`, preserving the current screens while suppressing trial display. Provider-side trial rejection belongs to spec 15.

## Verification fixtures

`frontend/src/pages/Subscription/onboarding/billingContract.test.tsx` compiles fixtures against the server and client DTOs and covers every step, recovery reason and operation outcome, foreign-company rejection, malformed data, missing-field defaults, permission preservation, payload stripping and ignored legacy trials. It reuses `deriveBillingViewState` to check that a missing step invents no workspace permission.
