# Spec 55 inventory

- `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx` and colocated component tests.
- Reuses BillingSetupLayout, owner billing queries, billingPlanDefinition, formatBillingPrice, Button and language context.
- Exact recurring summary; server/controller saved selection overrides URL; one checkout controller owns create/reopen; sandbox guidance requires matching validated browser/server configuration; pending moves to activation.
- Phone styles remain scoped beneath `.billing-onboarding`; no global design/token or dashboard changes.
- Verified focused tests, full81 Node +748 Vitest suite, typecheck, scoped lint, build and synthetic responsive rendering. Not deployed-provider evidence.

Spec62 accessibility refinement: after an opened overlay closes, restore focus once to the same prepared-draft reopen button after lifecycle reads settle. Focused tests now19. Independent visual/documentation rechecks passed; no tokens/styles changed.
