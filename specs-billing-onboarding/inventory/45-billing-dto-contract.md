# Spec 45 — Billing transport contract

## Public DTOs

`backend/src/types/billingLifecycle.ts` defines JSON-only lifecycle/catalog/checkout DTOs, plan/interval/capacity and bounded checkout-readiness reasons. `frontend/src/pages/Subscription/types.ts` mirrors the additive transport fields while preserving legacy consumers. Type-only fixtures in the contract tests compile against both declarations; browser runtime does not import server implementation.

## Client boundary

`frontend/src/pages/Subscription/onboarding/billingContract.ts` exports parseBillingLifecycle, parseBillingCatalog and parseBillingCheckout, taking raw data after API-envelope unwrapping. Each reconstructs only allowed public fields and throws a generic error on malformed required values without exposing payloads.

Legacy absent workspaceAccessAllowed normalizes false, checkoutReadiness to UNKNOWN, checkoutResume to null. Resume requires a valid exact plan/interval/transaction ID; no value is reconstructed from URL/storage. Missing price interval/card-requirement metadata remains null/unknown. Current explicit server permission is retained without deriving permission from subscription status. Owner/tenant correlation remains a query/service concern for specs49/51.

Catalog amounts remain exact nonnegative integer strings in provider minor units. No Number conversion, guessed currency/trial or sample pricing. Empty/partial catalogs are valid; duplicate price or plan/interval pairs are not. SDK/server population, API wiring and view formatting remain with specs49/51/50.

## Verification

Focused contract tests:44 passed. Complete frontend unit suite:64 Node tests and475 Vitest tests across35 files passed. Owned-file ESLint passed with zero warnings. Build/typecheck evidence is recorded in the spec Log after completion.
