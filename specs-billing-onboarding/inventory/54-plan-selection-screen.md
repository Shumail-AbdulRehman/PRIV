# Spec 54 inventory

- `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx` and colocated component tests.
- Reuses BillingSetupLayout, owner billing queries, billingPlanDefinition, formatBillingPrice, Button and language context.
- API capacities/provider catalog only; native plan radios, safe plan/interval navigation, honest unavailable/held state, successful-retry radio focus.
- Phone styles remain scoped beneath `.billing-onboarding`; no global design/token or dashboard changes.
- Verified focused tests, full81 Node +748 Vitest suite, typecheck, scoped lint, build and synthetic responsive rendering. Not deployed-provider evidence.
