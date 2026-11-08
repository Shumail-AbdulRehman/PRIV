# Billing onboarding reuse inventory

Updated from implementation and per-spec fragments on2026-11-08. Inspect this registry, inventory/ evidence and actual source before creating a parallel helper. Global historical specs/INVENTORY.md remains unchanged. Deployed provider acceptance is separately pending63.

## Components

### branding
`frontend/src/components/common/BrandLogo.tsx` exports the existing mark and wordmark. `frontend/src/components/common/LanguageChoice.tsx` uses the current language context.
Use instead of a copied logo, a new brand font or a second language-preference store. BillingSetupLayout reuses these assets/state in the standalone owner flow.

### primitives
`frontend/src/components/ui/button.tsx`, `frontend/src/components/ui/input.tsx` provide established controls. `frontend/src/components/common/PageHeader.tsx` provides operational heading conventions.
Use instead of a new button/input package. Do not force operational dashboard chrome onto the approved standalone setup shell.

### signup
`frontend/src/pages/Signup/SignUpPage.tsx` is the current React Hook Form owner registration screen; queries.ts and queries.test.tsx preserve durable-session semantics.
Use instead of a second signup endpoint or client-auth shortcut. The existing form now uses the billing shell while retaining fields, validation, pending guards and sessionEstablished handling.

### aliases-and-gate
`frontend/src/pages/Pricing/ChoosePlanPage.tsx`, `WelcomePage.tsx`, `frontend/src/components/onboarding/WorkspaceGate.tsx` are existing aliases/owner presentation gate.
Use instead of an independent auth router. ChoosePlanPage composes real owner selection; WelcomePage reads authoritative confirmation. WorkspaceGate also runs before dashboard layout, retains historical reads and keeps unpaid/unknown owners in standalone billing.

## Hooks and client transport

### billing-query
`frontend/src/pages/Subscription/queries.ts` exports useBillingLifecycle and billingLifecycleKey; private keys include company/owner. api.ts exports lifecycle/catalog/checkout/managed-portal transport and HTTPS portal URL validation.
It now owns validated API reads, independent catalog READ, scoped cancellation/cache removal, bounded recoverable polling and explicit refresh. retryOnMount:false prevents recovery remount loops. No component-owned Axios billing calls or private global-store cache.

### identity-and-language
`frontend/src/hooks/useAuth.ts`, `frontend/src/store/slices/authSlice.ts`, `frontend/src/i18n/context.ts`, `LanguageProvider.tsx` expose established identity/language state. `frontend/src/api/client.ts` already uses credentials and token-refresh serialization.
Use instead of storing auth tokens or form drafts in persistent browser storage. Shared server state remains TanStack Query.

### commercial-readiness
`frontend/src/pages/Help/serviceInformation.ts` exports headless serviceInformation/useServiceInformation/getPublicSupport checks used by existing production purchase guards.
Reuse the existing policy gate without rendering Help/Contact UI or importing its page component. Sandbox retains its incumbent bypass. Removing UI does not authorize live-policy bypass.

## Backend services and routes

### lifecycle-service
`backend/src/services/billingLifecycle.service.ts` exports getBillingLifecycle, getBillingCatalog, createBillingCheckout and createBillingPortal with injectable db/provider seams.
Use instead of new checkout/customer/portal services. Exact source paths and installed DTOs govern changes; there is no separate billingLifecycle controller file.

### access-policy
`backend/src/services/accountAccess.service.ts` exports readAccountState, evaluateAccountAccess, subscriptionWindow and assertAccountAction.
Use these for server-calculated readiness. READ_OPERATIONAL differs from ADD_CAPACITY/START_WORK; never use a frontend active-status shortcut.

### provider-fulfillment
`backend/src/services/paddleFulfillment.service.ts`, `backend/src/controllers/paddleWebhook.controller.ts`, `backend/src/routes/billingLifecycle.route.ts` own ordered/idempotent canonical billing and raw signed HTTP delivery.
Reuse without weakening signature/tenant checks or creating an alternative activation endpoint. Existing controller/service tests prove the boundary.

### provider-config
`backend/src/config/paddle.ts` exports activated environment/catalog/client checks; `backend/config/paddle-sandbox-catalog.json` records six existing sandbox price IDs.
Use instead of browser-supplied prices or fake enabled defaults. IDs are configuration; current amounts/trial/card policy must be fetched and verified.

## Utilities and constants

### paddle-sdk
`frontend/src/lib/paddle.ts` is the lazy SDK singleton. `frontend/src/lib/moduleLoadRecovery.ts` provides bounded stale-chunk recovery.
Exports retryable getPaddle, subscribePaddleEvents and official event types/constants. One singleton/fanout; each checkout subscriber scopes and cleans up its listener. SDK initialization never grants entitlement.

### capacities
`backend/src/services/subscription.service.ts` defines PLAN_DEFINITIONS; `frontend/src/pages/Subscription/types.ts` defines client plan shapes.
Starter is 1/3/1; Pro 5/25/3; ADVANCED displays Enterprise at 20/200/20. Count the owner as a manager. Do not duplicate these limits as a second authority.

### cookies-and-hosting
`backend/src/utils/cookies.ts` owns cookie settings; `frontend/public/_redirects` has an /api/* Heroku rewrite before asset404/SPA200 fallbacks; `backend/SANDBOX_BILLING.md` is the existing deployment runbook.
Reuse host settings. The browser API client supports relative /api. Netlify must rebuild with /api; actual deployed secure-cookie qualification remains63. Native/direct webhook bases remain unchanged.

## Types

### transport
`frontend/src/pages/Subscription/types.ts` contains BillingLifecycle, BillingCatalogEntry and BillingCheckout; `backend/src/types/billingLifecycle.ts` publishes additive service DTOs. `onboarding/billingContract.ts` validates client lifecycle/catalog/checkout facts, defaulting absent permission/readiness safely.
Do not import backend implementation or generated Prisma types into browser code.

## Tests and evidence

### unit-harness
`frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `backend/vitest.config.ts`, package manifests define existing Vitest/Testing Library and Node suites.
No test runner installation is needed. Existing SDK/config/query tests are extended, not replaced by snapshots.

### sql-harness
`backend/tests/billingLifecycle.integration.ts` already proves real locking/reservation/dedup/rollback/ownership using an injected no-network provider and the existing assertIsolatedMediaDatabase guard.
Spec60 adds fresh resume, retained provider/READY failures, foreign/paid denial and effective-period/suspension permission with real tables/locks. Explicit disposable localhost _test database only; never dotenv/app fallback.

### browser-harness
`frontend/e2e/run.mjs`, `guard.mjs`, `fixtures.ts`, `seed.mjs`, `frontend/playwright.config.ts` already start isolated real applications and databases. `frontend/e2e/fixtures.ts` exposes explicit mockBilling provider-facing lifecycle/checkout/portal/SDK boundaries; billing-onboarding, sandbox-onboarding and billing-v5 specs distinguish mocked UI from actual SQL/auth/API behavior.
Reuse the managed bootstrap. Its default PADDLE_BILLING_ENABLED is false; mocks do not prove server payment persistence. Keep this distinction in final evidence.

### approved-prototype
`design/billing-onboarding/revision-2/v3/` is approved as amended on 2026-11-06. account.html, index.html, payment.html, activation.html, billing.html and recovery.html are visual references, not production code.
Rebuild using existing app components; never paste demo scripts, sample prices or preview-only controls. Help/contact functionality is intentionally absent.

## Repair evidence (2026-11-07)

### signup-billing-routing
`frontend/src/pages/Signup/queries.ts` already navigates to /choose-plan. `onboarding/billingRoutes.tsx` now mounts /choose-plan, /welcome and subscription children beneath App restoration outside PublicLayout/DashboardLayout; main.tsx runs WorkspaceGate before operational chrome. Reuse existing signup/session semantics.

### billing-reservation-recovery
`backend/src/services/billingLifecycle.service.ts` already owns company locks, RESERVED/READY audit correlation and prepared-draft reuse. Spec49 extends that boundary;60 proves persisted behavior. Use instead of deleting audit rows, a second checkout service or a browser retry bypass. Sanitized evidence checklist: docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md. No live account outcome is verified by this inventory.

## Implemented feature boundaries (fragment fold)

| Boundary | Reusable path / purpose | Owner evidence |
| --- | --- | --- |
| Transport contracts | backend/src/types/billingLifecycle.ts; frontend subscription/types.ts and onboarding/billingContract.ts | inventory/45-billing-dto-contract.md |
| SDK singleton/events | frontend/src/lib/paddle.ts; retryable CDN initialization and cleanable official callback fanout | inventory/46-paddle-sdk-events.md |
| Standalone shell | onboarding/BillingSetupLayout.tsx, billing-setup.css; scoped tokens, setup/settings variants, EN/UR | inventory/47-billing-setup-shell.md |
| API proxy | frontend/public/_redirects and billing-proxy Node checks | inventory/48-netlify-api-transport.md |
| Server readiness | config/paddle.ts helpers and existing billingLifecycle service; exact reservation/customer/transaction resume, explicit workspace permission | inventory/49-server-lifecycle-readiness.md |
| Pure rendering facts | onboarding/billingViewState.ts and billingPrice.ts; actor/freshness/permission states and exact BigInt provider money | inventory/50-billing-view-state.md |
| Query/API boundary | subscription/api.ts and queries.ts; owner-scoped validated queries/portal navigation, cancellation, independent catalog, bounded refresh | inventory/51-billing-client-queries.md |
| Account creation | existing Signup/SignUpPage.tsx; real form and durable-account recovery | inventory/52-owner-signup-screen.md |
| Checkout controller | onboarding/useBillingCheckout.ts; one actor/session action, SDK-before-POST, exact draft reopen, correlated events/status-first uncertainty | inventory/53-checkout-controller.md |
| Plan choice | onboarding/BillingPlanPage.tsx; API capacities/catalog radios, interval/URL validation, honest catalog/hold states and retry focus | inventory/54-plan-selection-screen.md |
| Payment handoff | onboarding/BillingPaymentPage.tsx; exact recurring summary, sandbox guidance, controller create/reopen, overlay-close focus return | inventory/55-payment-handoff-screen.md |
| Confirmation | onboarding/BillingActivationPage.tsx; query-owned bounded polling, event refresh, explicit server-permission action only | inventory/56-activation-screen.md |
| Subscriber billing | onboarding/BillingAccountPage.tsx; true usage, real metadata, fresh one-shot managed portal, settings shell | inventory/57-subscriber-billing-screen.md |
| Recovery | onboarding/BillingRecoveryPage.tsx; known pre-submit retry, exact proven draft, status-first uncertainty, security/sign-in/focus | inventory/58-billing-recovery-screen.md |
| Routing | onboarding/billingRoutes.tsx, thin SubscriptionPage, existing aliases/App/gate/main/workspace route exports | inventory/59-owner-billing-routing.md |
| Real SQL proof | backend/tests/billingLifecycle.integration.ts with guarded no-network provider injection | inventory/60-billing-sql-proof.md |
| Release package | backend/SANDBOX_BILLING.md; docs/implementation/billing-deployment-checklist.md | inventory/61-sandbox-deployment-package.md |
| Managed browser proof | frontend/e2e billing suites/mockBilling and existing guarded runner | inventory/62-billing-e2e-suite.md |

All onboarding paths above are under `frontend/src/pages/Subscription/` unless a different root is named. Each source has colocated behavior tests; no new framework, state/auth store, card form, schema migration or duplicate entitlement engine. The final clean/deployed report is docs/implementation/billing-final-verification.md. Fragment evidence remains intact, including local test counts and external prerequisites; folding does not convert fixture proof into provider acceptance.
