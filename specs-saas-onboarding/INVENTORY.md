# Inventory: what already exists

Built by reading the real code on 2026-11-09. **Check this and `inventory/` before creating anything.** If a near match exists, extend it. Specs record new things in their own fragment, `inventory/NN-<slug>.md`. The verification pass folds them in here.

## Components

### `brand-logo`
`frontend/src/components/common/BrandLogo.tsx` — logo mark and wordmark.
**Use instead of:** a new logo component.

### `language-choice`
`frontend/src/components/common/LanguageChoice.tsx` — English and Urdu switch.
**Use instead of:** another language control.

### `button`
`frontend/src/components/ui/button.tsx` — button primitive with variants.
**Use instead of:** styled anchors or raw buttons for actions.

### `input`
`frontend/src/components/ui/input.tsx` — text input primitive.
**Use instead of:** raw inputs.

### `auth-shell`
`frontend/src/components/common/AuthShell.tsx` — old auth page wrapper, still used by platform sign-in.
**Use instead of:** do not extend for this flow; use `FlowShell`.

### `billing-setup-layout`
`frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx` — settings layout for existing subscribers.
**Use instead of:** a new settings wrapper.

### `billing-account-page`
`frontend/src/pages/Subscription/onboarding/BillingAccountPage.tsx` — subscriber plan and usage page. Leave it working.
**Use instead of:** a new subscriber page.

### `workspace-audience`
`frontend/src/routes/launchPages.tsx` — sends staff to the web handoff.
**Use instead of:** a second staff guard.

## Hooks

### `use-auth`
`frontend/src/hooks/useAuth.ts` — Redux auth identity.
**Use instead of:** direct store access.

### `use-language`
`frontend/src/i18n/context.ts` — translation function and language.
**Use instead of:** local translation helpers.

### `use-billing-lifecycle`
`frontend/src/pages/Subscription/queries.ts` — lifecycle, catalog and subscription queries with owner-scoped keys.
**Use instead of:** direct billing fetches in pages.

### `use-create-manager`
`frontend/src/pages/Signup/queries.ts` — signup mutation with session handling.
**Use instead of:** calling signup directly.

### `use-logout`
`frontend/src/queries/auth.ts` — sign out.
**Use instead of:** clearing cookies by hand.

## API and services

### `client`
`frontend/src/api/client.ts` — Axios client with credential refresh.
**Use instead of:** another HTTP client.

### `paddle-config`
`backend/src/config/paddle.ts` — Paddle client, catalog, webhook secret, activation checks.
**Use instead of:** reading Paddle environment variables directly.

### `account-access`
`backend/src/services/accountAccess.service.ts` — access policy and subscription window.
**Use instead of:** new access checks.

### `audit-log`
`backend/src/services/auditLog.service.ts` — audit writes.
**Use instead of:** direct `auditLog.create`.

### `subscription-plans`
`backend/src/services/subscription.service.ts` — plan definitions and allowances.
**Use instead of:** hard-coded limits.

### `owner-identity`
`backend/src/services/ownerIdentity.service.ts` — owner email verification and recovery.
**Use instead of:** another recovery flow.

### `token-helpers`
`backend/src/utils/auth.ts` — password comparison and session tokens.
**Use instead of:** direct `bcrypt` or `jsonwebtoken` calls.

### `cookie-options`
`backend/src/utils/cookies.ts` — cookie settings.
**Use instead of:** inline cookie options.

## Utils

### `format-billing-price`
`frontend/src/pages/Subscription/onboarding/billingPrice.ts` — money formatting from provider amounts.
**Use instead of:** `Intl.NumberFormat` in pages.

### `service-information`
`frontend/src/pages/Help/serviceInformation.ts` — policy links and public support contact.
**Use instead of:** hard-coded support details.

## Constants

### `sandbox-catalog`
`backend/config/paddle-sandbox-catalog.json` — the six sandbox price IDs.
**Use instead of:** IDs in code.

## Types

### `billing-dto`
`backend/src/types/billingLifecycle.ts` and `frontend/src/pages/Subscription/types.ts` — billing data shapes.
**Use instead of:** local response types.

## Test helpers and fixtures

### `mock-billing`
`frontend/e2e/fixtures.ts` — end-to-end billing and Paddle fixture.
**Use instead of:** a second billing mock.

### `billing-integration`
`backend/tests/billingLifecycle.integration.ts` — real SQL billing checks on a guarded database.
**Use instead of:** new SQL harnesses.
