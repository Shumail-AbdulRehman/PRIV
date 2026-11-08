# Implementation grounding — 2026-11-06

HEAD at planning baseline remains35c80b6; git diff over tracked source is empty. New planning/design artifacts are untracked and preserved. No private deployed environment was read, provider account mutated or application code changed.

## Read from the actual tree

- backend/src/services/billingLifecycle.service.ts: getBillingLifecycle line34, getBillingCatalog line81, reservation locks line97, createBillingCheckout line121. Existing resume correlates AuditLog RESERVED/READY; lifecycle does not yet publish that resume payload.
- backend/src/config/paddle.ts: environment/catalog/activation checks are explicit; no always-enabled default. Backend routes call services directly; there is no billingLifecycle.controller.ts file.
- backend/src/services/accountAccess.service.ts: subscriptionWindow and evaluateAccountAccess use canonical IDs/effective dates. readAccountState rejects a subscription whose configured price does not match company plan. READ_OPERATIONAL is different from starting/capacity permission.
- frontend/src/pages/Subscription/SubscriptionPage.tsx: sandbox environment/token-family guard and fresh pre-action checks exist. Current line102 auto-navigation and line115 workspace action inspect active/trialing/catalog/company flags but do not include effective-period permission; the plan fixes this via authoritative additive DTO.
- frontend/src/pages/Subscription/queries.ts: owner-keyed lifecycle polling stops on first error. Plan51 adds bounded recoverable retry without any mutation retry.
- frontend/src/lib/paddle.ts: one promise and strict test_/live_ prefix checks, but no callback fanout and a rejected asynchronous singleton can remain stuck. Installed SDK initializePaddle supports eventCallback; project subscribe helper does not exist yet.
- frontend/src/pages/Signup/SignUpPage.tsx is the exact existing form path (not SignupPage.tsx/index.tsx). queries.ts already clears cache and navigates /choose-plan when sessionEstablished is not false; preserve it.
- frontend/src/i18n/context.ts is the exact existing context path (not context.tsx); billingTranslations.ts is merged by translations.ts. Keep one translation owner.
- frontend/src/main.tsx nests choose-plan/welcome in PublicLayout and subscription in operational workspaceRoutes. App owns current-user/role/security restoration; route59 moves billing composition without replacing auth.
- frontend/public/_redirects currently does not proxy API; API client already supports relative /api with credentials. backend/src/utils/cookies.ts supports secure/SameSite config. Cross-site cookie loss remains a hypothesis requiring deployed evidence.
- frontend/e2e/run.mjs creates a disposable local child DB and builds from isolated env; default billing is false, fixture browser token is synthetic. sandbox-onboarding.spec.ts already intercepts SDK/lifecycle/catalog/checkout for browser behavior; do not claim these are provider persistence tests.
- backend/tests/billingLifecycle.integration.ts already proves real lock/dedup/rollback/canonical/lost-response behavior using a no-network provider. Extend it for the new DTO, do not duplicate the whole harness.

## Commands/manifests verified

Backend: npm test=vitest run, build=prisma generate + tsc; no lint script. Backend Vitest includes src/**/*.test.ts. Frontend: test combines Node tests/*.test.mjs/e2e/*.test.mjs and Vitest; Vitest only includes src/**/*.test.tsx. Build=tsc -b + Vite; ESLint config is in frontend/ and lint commands must use that package cwd. Existing package declarations contain React19, Vite8, TanStack Query5, Paddle.js1.6, Paddle Node3.10, Vitest4 and Playwright1.58.2; exact lockfile resolutions remain implementation-time checks.

Installed declarations checked: backend SDK TrialPeriod.requiresPaymentMethod; frontend SDK checkout initialization eventCallback/PaddleEventData, CheckoutOpenOptions.transactionId, checkout.closed/checkout.completed event names. Paddle Node options do not expose an arbitrary baseURL test option; the plan does not invent one or add a deployable provider bypass.

Local codex --help confirms interactive -m and -c configuration overrides. No orchestro or spec-run executable was found. Do not run their commands here or default into historical specs/.

## Intentional changes to old assertions

New transport fields remain optional on raw client declarations for old fixtures, while normalized new-screen permission fails closed. Runtime lifecycle responses will include an authenticated, current-owner resume transaction ID. It can live briefly in the private memory cache and is removed on owner change, never persisted/logged. The old blanket query-cache-no-transaction-ID assertion must be adapted to this explicit safe resume contract; do not discard its cross-tenant/late-action protections.

Current prototype prices/dates/usage are synthetic and excluded from implementation. Current source entitlements/capacities, provider configuration and actual effective records remain the product truth.

## Handoff tracking

The repository globally ignores Markdown. Added narrow .gitignore exceptions for specs-billing-onboarding, this feature's planning docs and billing design notes so the handoff can be tracked/shared. This is the only tracked-file change; application source remains unchanged. No commit/push was made.
