# Spec32 — real subscription lifecycle UI

- `frontend/src/pages/Subscription/SubscriptionPage.tsx`: actual owner-scoped provider lifecycle, active-resource capacity, restricted-account recovery, approved catalog and guarded checkout/portal handoff. Uses existing v5 components/tokens and API client. No local billing engine or paid-state setter.
- `frontend/src/pages/Subscription/queries.ts`: `useBillingLifecycle` and company/owner query keys; read-only pending/reconciliation polling, no automatic purchase retries. Existing operational summary hook retained for its callers.
- `frontend/src/pages/Subscription/api.ts`: actual15 lifecycle/catalog, plan/interval-only checkout and fresh managed portal; temporary URLs validated and navigated, never query/mutation-cached.
- `frontend/src/pages/Subscription/types.ts`: catalog/transaction DTOs added beside28 existing lifecycle contract; no duplicated lifecycle client.
- `frontend/src/pages/Pricing/PaddlePricing.tsx`, `ChoosePlanPage.tsx`, `WelcomePage.tsx`: retained public capacity presentation points to owner billing; legacy selection/checkout return route to canonical billing. No public price-only purchase or fixed trial claim. Return query parameter is guidance, never payment proof.
- `frontend/src/i18n/billingTranslations.ts` and `billing.css`: feature-specific EN/UR/RTL, semantic tokens, responsive facts/capacity layout and48px actions.
- `docs/implementation/BILLING.md`: browser contracts/uncertain purchase/reconciliation/provider activation limits; actual provider sandbox/legal qualification remains39/40.

## V5 correction, 2026-10-29

- `SubscriptionPage.tsx`/`billing.css`: approved main stack and help rail, provider fact rows/status, actual capacity and bounded last-event activity. No prototype data/payment documents or simulated lifecycle controls. Stale catalog failures remove checkout actions; mismatched company data cannot fetch catalog, even during explicit refresh.
- `WorkspaceGate.tsx`/`workspace-access.css`: actual owner-only suspended/inactive presentation around operational `DashboardLayout` content. Billing/settings exemptions and independent top-level help/security retained. Active unpaid reads remain allowed. Unknown/error states have real retry and safe links; explicit401/403 supersedes cached active data. No frontend entitlement engine.
- `billingLifecycle.service.ts` and `types.ts`: add existing `company.isActive` to the lifecycle DTO so legacy inactive/ACTIVE states use real server facts. No schema/migration/policy change.
- Existing component tests cover transaction/portal uncertainty/principal rules plus new composition, company mismatch/catalog refresh and recovery states. `WorkspaceGate.test.tsx` verifies actual network-boundary semantics; `launchPages.test.tsx` supplies the actual lifecycle DTO while retaining all navigation/focus/role assertions.
- The existing Spec40 harness adds `frontend/e2e/billing-v5.spec.ts` for matched React/privateAPI/disposableSQL screenshots and persisted status/capacity/restriction/role/tenant proofs. Durable provenance: `V5_BILLING.md` and `v5-billing-evidence/`; screenshots never qualify a live Paddle merchant/provider.
