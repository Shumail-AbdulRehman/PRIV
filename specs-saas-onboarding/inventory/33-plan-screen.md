# Spec 33 — Choose plan screen

`frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx` rebuilds owner plan selection inside `FlowShell` (`size="plan"`, `step="plan"`). Reuse this page for `/choose-plan`; subscriber settings and payment remain separate screens.

- Starter, Pro and Enterprise ledger rows use `useSubscription().availablePlans` for descriptions and allowances, `useBillingCatalog()` for prices, `billingPlanDefinition` for the Enterprise label, and `formatBillingPrice` for exact amounts. Missing, invalid or duplicate prices cannot be selected for payment.
- `parseOnboardingQuery` allowlists initial plan and interval independently. Selection falls back to the saved server draft, then Starter/month. A changed draft selection displays the replacement notice; Continue carries only plan and interval to payment and makes no billing mutation.
- A labelled native radio fieldset supports arrows, wrapping, Home/End, disabled-option skipping, one enabled tab stop and mirrored horizontal arrows in Urdu. Amounts and capacities stay LTR. Desktop column headings become per-row capacity labels on phones.
- Monthly/Yearly uses the shared interval control. Included features use a disclosure. Initial loading has three row skeletons; errors and empty intervals offer retry; partial intervals retain unavailable rows. Background requests preserve radio identity, selection, enabled controls and focus. The decision bar is sticky on phones.
- Existing `flow.css` classes supply all flow colours and motion; layout utilities compose the ledger without inline styles or stylesheet changes. This spec introduces no new shared helper or design token.

`BillingPlanPage.test.tsx` provides synthetic API fixtures and 30 focused cases, including keyboard/RTL, URL tampering, drafts, incomplete data, loading/error/retry and background refetch behavior. No provider or database is used.
