# Billing onboarding architecture

Derived from actual source on 2026-11-06. Proposed additions are identified below. Existing React/Vite, Express/Prisma/PostgreSQL and Paddle integrations stay in place; this feature does not migrate the repository into a new workspace or framework.

## Folder structure

| Path | Status and responsibility |
| --- | --- |
| backend/src/config/paddle.ts | Existing environment/client/catalog validation; sole runtime Paddle config module |
| backend/src/routes/billingLifecycle.route.ts | Existing owner-authenticated /subscription/manage HTTP endpoints |
| backend/src/services/billingLifecycle.service.ts | Existing catalog, lifecycle, checkout reservation/reuse and portal orchestration |
| backend/src/services/accountAccess.service.ts | Existing effective-period/catalog/tenant access policy; reuse without replacing |
| backend/src/services/paddleFulfillment.service.ts | Existing canonical customer correlation, signed-event persistence and entitlement synchronization |
| backend/src/controllers/paddleWebhook.controller.ts | Existing raw-body signature boundary |
| backend/src/types/billingLifecycle.ts | Proposed DTO contract, owner spec 45 |
| frontend/src/pages/Subscription/types.ts | Existing client billing types, extended by spec 45 |
| frontend/src/pages/Subscription/api.ts and queries.ts | Existing client transport/query layer, sole editor spec 51 |
| frontend/src/pages/Subscription/onboarding/ | Proposed feature-local contract, state/format helpers, shell and screen modules; explicit file owners in specs |
| frontend/src/pages/Subscription/onboarding/billingRoutes.tsx | Proposed importable route module, owner59; test real route definitions without importing main/createRoot side effects |
| frontend/src/lib/paddle.ts | Existing singleton, event subscription added by spec 46 |
| frontend/src/pages/Signup/ | Existing owner signup, restyled by spec 52 |
| frontend/src/pages/Pricing/ | Existing choose-plan/welcome aliases, integrated by spec 59 |
| frontend/src/components/onboarding/WorkspaceGate.tsx | Existing owner operational gate, integrated by spec 59 |
| frontend/src/main.tsx, App.tsx, routes/workspaceRoutes.tsx | Existing composition/auth route owners, sole editor spec 59 |
| frontend/src/i18n/billingTranslations.ts | Existing translated billing vocabulary, sole editor spec 47 |
| frontend/public/_redirects | Existing Netlify redirects, API rewrite owned by spec 48 |
| backend/tests/billingLifecycle.integration.ts | Existing real-SQL service checks; extended by spec 60 |
| frontend/e2e/ | Existing managed disposable browser harness; billing-test updates owned by spec 62 |

## Layer boundaries

| Layer | Owns | Must never do |
| --- | --- | --- |
| HTTP route | Authentication, owner role, request envelope and private/no-store headers | Derive tenant from request company/customer IDs or collect cards |
| Billing service | Validated configuration, provider read, reservations, safe resume metadata and owner portal | Grant access from browser completion, guess trial duration or create a new purchase after uncertainty |
| Access/fulfillment services | Canonical tenant/customer/subscription, effective windows, ordered persisted events | Trust email/customData as tenant ownership or rewrite started-work exceptions |
| Client API/query | Owner-keyed cache, request cancellation, bounded polling/refresh | Store payment/auth secrets or treat cached success as fresh purchase authorization |
| Pure display contract | Validate transport facts, derive view state, exact provider-price formatting | Reimplement authorization or invent prices/tax/discounts |
| SDK hook | Config/event lifecycle and transaction-correlated checkout open/reopen | Initialize another SDK instance per screen or grant entitlement |
| Screens/shell | Approved themed controls, EN/UR, loading/recovery/accessibility | Persist card data, fabricate invoice/next-renewal values or render Help/Contact controls |
| Route composition | Alias compatibility, guest/owner/manager/security routing | Let onboarding route mount inside operational dashboard chrome or weaken server permissions |

## Naming and test conventions

Preserve existing package conventions. New screen/layout components use PascalCase.tsx; hooks use useName.ts; pure helpers use camelCase.ts. Component/helper tests use .test.tsx because the installed frontend Vitest include only matches that extension. Backend unit tests use .test.ts. SQL integration scripts remain under backend/tests/. No broad barrel is introduced; explicit feature imports avoid a new hot file.

## Data model

No schema or migration change is justified. Company owns unique billingCustomerId/billingSubscriptionId and administrative isActive/operationalStatus. PaddleCustomer, PaddleSubscription and PaddleTransaction mirror provider facts; PaddleWebhookEvent stores deduplication. AuditLog BILLING_OPERATION reservations are the existing transaction-safety mechanism. Manager role ADMIN is the owner, and counts as one manager seat.

Add only transport facts: workspaceAccessAllowed (server-calculated permission to begin work/add capacity), a sanitized checkoutReadiness reason, a nullable server-proven checkoutResume containing plan/interval/transactionId, subscription priceId/interval for matching current provider catalog, and trial requiresPaymentMethod when known. Freeze exact nullable/backward-compatible shapes in spec 45 before consumers start. Missing/legacy transport facts must never imply ready. No raw credentials, signed portal URL history or card data enter this contract.

## State ownership

Plan definitions/capacities come from the existing getSubscription/useSubscription availablePlans response; the catalog supplies provider money/intervals. Server lifecycle/catalog stay in TanStack Query with company and owner in every private key. Redux remains identity, not billing state. The SDK singleton owns one callback fanout; each checkout subscriber is scoped to owner and transaction and cleans up on unmount. Local component/reducer state holds selection, in-flight action and safe UI errors. Plan/interval can travel in validated URL search parameters; passwords, tokens, provider URLs and personal data cannot. Persisted audit/mirror facts, not persistent browser storage, restore prepared checkout after reload. A server-proven checkoutResume ID can live briefly in the owner-scoped lifecycle memory cache; remove it on identity change and never persist/log it. Update the old blanket no-transaction-ID-in-query assertion for this explicit authenticated resume contract rather than weakening tenant isolation.

Route/view states: checking, choose-plan, payment/reopenable draft, awaiting confirmation, confirmed, existing subscriber billing, restricted, unavailable and uncertain outcome. A linked canceled/past-due subscription uses billing/portal, not a new purchase. READ_OPERATIONAL policy for historic subscribers remains the current backend policy; do not confuse it with permission to start work. Administrative suspension always denies operations regardless of payment.

## Invariants

1. Every billing request uses authenticated actor company/owner. Query/body tenant IDs cannot select another tenant.
2. Only the existing signed raw-body webhook and persisted fulfillment path establishes provider billing facts. Checkout events/return URLs are refresh signals.
3. Workspace-ready uses current server workspaceAccessAllowed AND matching owner/company; active status alone is insufficient. Period, catalog and administrative restrictions remain authoritative.
4. Sandbox skips the incumbent live-only email/commercial prerequisites only where the existing policy permits. Production verification/policy guards are preserved; production activation is out of scope.
5. Initialize/validate the browser SDK before submitting a new checkout request. After any submitted/unknown request, reconcile server state before another mutation.
6. Reuse a server-proven prepared transaction after close/reload; prohibit plan changes/second purchase while it is unresolved. Replacement requires provider-confirmed cancellation, never a local timeout.
7. No real card/address fields, test transaction bypass, local trial clock, hardcoded amount or preview control reaches application code.
8. Render no Help, Contact us, Contact support, support dialog, FAQ/help panel or support-dependent recovery instruction in the new signup/billing/owner-access flow. Preserve self-service retry/status/security. Do not delete unrelated global help routes or backend support authorization.
9. Shared hot files have one owner. Spec 47 owns layout/styles/translation additions, 51 owns API/query files, 59 owns routing/old subscription composition/gate, and 62 owns browser tests/harness adaptations.
10. New styles are scoped beneath the billing layout; do not recolor operational dashboards or overwrite root DESIGN.md/PRODUCT.md.
11. Real server/catalog reads may show billing data for linked owners even when purchase is disabled. Availability to READ catalog never grants permission to CREATE checkout.
12. Unavailable/stale/401/403/mismatched data cannot offer a fresh purchase or report ready. Abort old-tenant callbacks and invalidate only current owner caches.
13. Netlify browser requests use the qualified same-origin /api rewrite; native API URLs and direct Heroku Paddle webhook stay unchanged. Preserve httpOnly secure cookies; no token storage workaround.
14. A static, component, SQL or mocked-provider browser pass is not a deployed Paddle sandbox pass. Record those evidence classes separately.

15. Safe catalog READ is separate from permission to purchase; reconciliation/uncertainty must render an explained recovery state rather than suppressing all content.
16. New-owner setup routes mount outside DashboardLayout; direct operational deep links resume setup until current server permission permits entry. Existing subscriber READ_OPERATIONAL policy is preserved.
17. Unknown provider outcomes retain audit reservations and prevent a second create. Affected-account repair requires same-tenant provider correlation; timeouts/local flags cannot clear holds.

## Test seams and fixtures

Reuse injected db/provider seams in billingLifecycle and real signed-event tests in paddleFulfillment. Service unit tests use provider mocks and controlled time; spec 60 proves locking/deduplication/persistence with actual isolated PostgreSQL. Browser tests reuse the existing managed harness and its synthetic-owner/SQL helpers. Signup/session is real in the isolated app. Mock Paddle.js/provider checkout at the boundary; do not claim intercepted lifecycle/checkout responses prove backend persistence. SQL tests supply that proof independently, followed by actual deployed sandbox acceptance in spec 63.

The existing browser runner intentionally builds with billing disabled and fixture public test tokens. Preserve that default and existing isolation guard; add explicit per-flow browser fixtures for enabled sandbox states. Do not add a deployable test switch, alternate unauthenticated webhook or production provider bypass. Update old tests only for intentional route/copy/selector changes; keep security expectations and failure assertions.

## Protected files and release boundary

Do not edit generated Prisma client, historical migrations, package lockfiles without an actual dependency change, native app, original specs/ or earlier design stages. The approved design is read-only after this amendment. No new library is required. Spec 61 prepares deployment configuration/runbook; actual sandbox publishing/configuration is an operator action after local browser tests. Final verification records the deployed revisions and provider evidence or remains explicitly incomplete.
