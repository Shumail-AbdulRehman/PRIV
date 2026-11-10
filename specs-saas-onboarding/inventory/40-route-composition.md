# Spec 40 — Routes and workspace entry

## Reuse

- `frontend/src/pages/Onboarding/FlowEntry.tsx`: `FlowEntry` resolves `/continue` from a fresh, owner-scoped lifecycle using `onboardingRouteForStep`. It honors `state.from` only for an authorized `WORKSPACE` step and only through `isSafeFromPath`. Non-owners continue to the existing dashboard/staff audience guard without reading billing.
- The same file exports `FlowEntryStatus`, the shared pending/retry presentation for entry, setup composition and the workspace gate. It reuses `FlowShell`, translated copy and `Button`; it never exposes raw errors or grants access.
- `frontend/src/pages/Subscription/onboarding/billingViewState.ts`: `deriveBillingViewState` now exposes `step`, derived from the validated server `onboardingStep` and current owner/read scope. Missing steps, failed/stale reads, mismatched identities and a PAYMENT without a saved draft cannot choose a destination. Subscription facts remain available for safe settings display; actions retain their server capability checks.
- `frontend/src/pages/Subscription/SubscriptionPage.tsx`: the route composer uses the single route map, refreshes lifecycle on pathname changes before redirecting, retains the real payment target across background reads and query-string/language changes, preserves explicit confirmation/Ready, and keeps subscriber billing settings (including restricted subscribers). Plan-selection and unpaid-plan-change navigation carry only allowlisted plan/interval values.
- `frontend/src/components/onboarding/WorkspaceGate.tsx`: unpaid owners follow the server step. Managers/staff retain the existing audience behavior, historical subscribers retain operational reads, and suspension/failed checks cannot mount operational children.
- `frontend/src/pages/Subscription/onboarding/billingRoutes.tsx`: registers `/continue`; `/welcome` aliases activation. All setup screens remain outside operational layouts and behind the existing session/role guards.
- `BillingSetupLayout` supports only `variant="settings"`. `useBillingLifecycle` and `useSubscription` no longer accept the legacy `poll` option; confirmation polling belongs to `useCheckoutConfirmation`. The obsolete `useBillingCheckout` overlay hook and its tests were deleted.

## Verification seams

The focused route suite covers all nine server steps across all seven setup/entry URLs, reload and back navigation, workspace deep links, safe return paths, stale/error/missing/foreign data, session outages, historical access, subscriber settings, recovery-cache refresh and stable payment-target identity. API and Paddle boundaries use synthetic mocks; no real provider or database is needed.

The guide's test-only exception updates `BillingPlanPage.test.tsx` fixtures to supply the explicit server steps instead of relying on the removed legacy inference. No checks are removed or weakened.
