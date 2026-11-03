# Spec32 — real subscription lifecycle UI

- `frontend/src/pages/Subscription/SubscriptionPage.tsx`: actual owner-scoped provider lifecycle, active-resource capacity, restricted-account recovery, approved catalog and guarded checkout/portal handoff. Uses existing v5 components/tokens and API client. No local billing engine or paid-state setter.
- `frontend/src/pages/Subscription/queries.ts`: `useBillingLifecycle` and company/owner query keys; read-only pending/reconciliation polling, no automatic purchase retries. Existing operational summary hook retained for its callers.
- `frontend/src/pages/Subscription/api.ts`: actual15 lifecycle/catalog, plan/interval-only checkout and fresh managed portal; temporary URLs validated and navigated, never query/mutation-cached.
- `frontend/src/pages/Subscription/types.ts`: catalog/transaction DTOs added beside28 existing lifecycle contract; no duplicated lifecycle client.
- `frontend/src/pages/Pricing/PaddlePricing.tsx`, `ChoosePlanPage.tsx`, `WelcomePage.tsx`: retained public capacity presentation points to owner billing; legacy selection/checkout return route to canonical billing. No public price-only purchase or fixed trial claim. Return query parameter is guidance, never payment proof.
- `frontend/src/i18n/billingTranslations.ts` and `billing.css`: feature-specific EN/UR/RTL, semantic tokens, responsive facts/capacity layout and48px actions.
- `docs/implementation/BILLING.md`: browser contracts/uncertain purchase/reconciliation/provider activation limits; actual provider sandbox/legal qualification remains39/40.
