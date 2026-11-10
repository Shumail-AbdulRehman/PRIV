# Inventory: what already exists

Updated 2026-11-10 by spec 43 from the clean-installed tree. **Check this inventory before creating anything.** Extend the existing implementation when a near match exists. The implementation fragments 01–43 are consolidated below; their source files have been removed after verifying the fold.

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


## Current integration map

This map describes the assembled code after specs 00–42 and `fixes/e2e-bug-fixes.md`. The full source records below preserve API details and historical implementation evidence. Their phrases such as “additive until spec 36”, “legacy caller remains”, old test totals, and early unverified sandbox notes describe their original implementation stage, not the current tree. Spec 43's Log holds the final verification counts and findings.

| Area | Reuse | Current contract |
|---|---|---|
| Presentation | `FlowShell.tsx`, `flow.css`, shared Button/Input/BrandLogo/LanguageChoice | New account/onboarding screens use the closed 27-token flow palette. Existing subscriber settings retain `BillingSetupLayout` with only `variant="settings"` and its legacy palette. |
| Copy and routes | `onboardingTranslations.ts`, `onboardingRoutes.ts`, `FlowEntry.tsx` | One English/Urdu lookup and one allowlisted selection/step/return-path map. Server lifecycle emits step/reason; client still safely accepts missing legacy fields as null. |
| Checkout | `checkoutMachine.ts`, `useCheckoutSession.ts`, `PaddleCheckoutFrame.tsx`, `OrderSummary.tsx` | One inline controller and stable target. The overlay hook has been deleted. SDK totals are converted at the composing payment page; summary inputs remain exact minor-unit strings. Explicit plan replacement uses consumed router state, never URL-only intent. |
| Activation/recovery | `useCheckoutConfirmation.ts`, `BillingActivationPage.tsx`, `BillingRecoveryPage.tsx` | Bounded company-scoped reads, explicit workspace entry, and status-first recovery. Browser events grant no entitlement. |
| Backend billing | `billingProvider.ts`, catalog/customer/checkout/confirm/reconcile/reservation services | One lazy provider gateway, append-only correlated facts under Company locks, trial-free purchase catalog, strict owner-only HTTP routes. Lifecycle delegates to these services and performs local reads. |
| Entitlement | `paddleFulfillment.service.ts`, `accountAccess.service.ts` | Signed webhook and verified exact provider read share fulfilment; administrative suspension and historical subscriber rules remain enforced. |
| Authentication | `login.service.ts`, `authRateLimit.ts`, web `api/client.ts`, `App.tsx` | Unified credentials, bounded per-process limiter, correct-password-only deactivation code, browser refresh/outage recovery. Mobile lost-refresh recovery remains a separate finding. |
| Configuration/evidence | `scripts/billing-flow-preflight.mjs`, current runbook, sandbox probe/trial-removal helpers | Preflight is local and value-free. Actual provider state is historical evidence, not implied by unit tests. No real payment has run. |
| Verification | Managed E2E runner/fixtures, guarded standalone billing SQL test | Browser fixture events are controlled; injected-provider SQL uses an explicitly disposable database. The external fixes' three browser regressions are enabled. |

## Consolidated implementation records

All 43 fragment bodies are preserved below. Source filenames are provenance, not links to files that still exist. The historical phase notes above explain superseded integration statements.

### Source `01-lifecycle-contract.md`

### Spec 01 — Billing lifecycle and outcome contract

#### Shared data shapes

- `backend/src/types/billingLifecycle.ts` and `frontend/src/pages/Subscription/types.ts` now expose `BillingOnboardingStep`, `BillingRecoveryReason`, `BillingConfirmOutcome` and `BillingReconcileOutcome` with the architecture's exact values.
- Server result types: `BillingConfirmDto`, `BillingReconcileDto`. Client result types: `BillingConfirmResult`, `BillingReconcileResult`. Each carries the operation's outcome and a lifecycle; an outcome never grants access.
- Lifecycle wire fields `onboardingStep` and `recoveryReason` are optional until spec 36 sends them. `ValidatedBillingLifecycle` always contains both, defaulting to `null`.
- `BillingCheckoutDto` and `BillingCheckout` include optional `replaced` until spec 26 emits it. `ValidatedBillingCheckout` always contains a boolean replacement fact; an older response defaults to `false`.
- Catalog `trialPeriod` is optional and deprecated on both sides, solely for existing screens awaiting replacement.

#### Existing parser, extended

`frontend/src/pages/Subscription/onboarding/billingContract.ts` remains the one wire parser. Reuse its existing strict helpers instead of adding a parser elsewhere.

- `parseBillingLifecycle(value, expectedCompanyId?)` validates steps and recovery reasons, rejects unknown values, preserves explicit server capabilities and accepts missing steps as `null`. Supply the current owner's company ID to reject foreign-company payloads.
- `parseBillingConfirm(value, expectedCompanyId?)` and `parseBillingReconcile(value, expectedCompanyId?)` validate operation-specific outcomes and parse the nested lifecycle with the same company scope. They strip extra fields at both levels and return normalized lifecycle fields.
- `parseBillingCheckout(value)` validates `replaced` without coercion and accepts an omitted flag from the existing server.
- `parseBillingCatalog(value)` ignores all legacy trial metadata and returns `trialPeriod: null`, preserving the current screens while suppressing trial display. Provider-side trial rejection belongs to spec 15.

#### Verification fixtures

`frontend/src/pages/Subscription/onboarding/billingContract.test.tsx` compiles fixtures against the server and client DTOs and covers every step, recovery reason and operation outcome, foreign-company rejection, malformed data, missing-field defaults, permission preservation, payload stripping and ignored legacy trials. It reuses `deriveBillingViewState` to check that a missing step invents no workspace permission.

### Source `02-operational-logging.md`

### Spec 02 — Safe error logging and trusted proxy

#### Safe structured logging

- `backend/src/utils/operationalLog.ts` exports `operationalLog`, the shared logger, and `createOperationalLogger(sink)` for an injected sink. Reuse this for provider logging in spec 08; never send raw errors or payloads to console.
- The explicit field allowlist is `event`, `route`, `method`, `status`, `errorClass`, `providerCode`, `providerType`, `companyId` and `reservationId`. Values must be bounded identifiers, HTTP facts or positive safe integer IDs. Company and reservation IDs match the existing integer Prisma keys. Unknown fields and nested objects are dropped before serialization.
- Logger context accepts `level` (`error` by default, or `warn`) and a server-generated UUID `requestId` as correlation metadata. The request ID is separate from event fields; incoming request IDs are never trusted. A sink receives the serialized safe record and level.
- `operationalErrorFields(error)` extracts only the error constructor class, `code` and `type`; the logger validates these. It never copies messages, stack traces, provider details or Prisma metadata.

#### Existing transport and startup seams

- `launchErrorHandler` remains the sole global handler. Expected schema, transport, conflict and API errors retain their responses. Unexpected errors get the existing generic 500 plus a fresh `X-Request-Id`, shared with the safe log. It logs the matched route template rather than a raw URL, query, parameter or request body. CORS exposes the response header.
- `configureTrustProxy(app, value?)` in `backend/src/routes/launch.route.ts` reads `TRUST_PROXY_HOPS` by default. An unset value means 0. A canonical nonnegative safe integer sets that hop count; invalid values reset it to 0 and log a warning without the environment value. `app.ts` calls this before middleware/routes and preserves the first runtime-security initialization import.
- `createListenCallback(onListening, exit?)` in the same module wraps Express 5's callback. A bind error logs only its classification and invokes `exit(1)` (`process.exit` by default), without reporting a successful bind or running startup work. Success awaits the existing startup callback.

#### Verification seams

- `operationalLog.test.ts` uses injected sinks to check filtering before serialization, invalid values, severity and error classification.
- `launch.route.test.ts` covers safe 500s and correlation IDs over local HTTP, known-error preservation, actual forwarded-IP resolution for hop counts 0 and 2, invalid-config warnings, and an occupied local port with an injected exit function. A static wiring check covers `app.ts` without importing its cron or database dependencies.

### Source `03-flow-shell.md`

### Spec 03 — Flow shell, tokens and motion

#### Shared frame

`frontend/src/pages/Onboarding/FlowShell.tsx` exports the default `FlowShell`, `FlowShellProps` and `FlowStep`. Reuse this for the new public/account/checkout screens; leave the existing subscriber settings wrapper alone.

- `size`: `narrow` (default, 520px), `split` (980px), `plan` (880px), `wide` (1040px).
- `step`: `none` (default, no progress), `account`, `plan`, `payment`, `workspace`, `done`. Earlier steps are completed; a current item has `aria-current="step"`. `done` completes all four ticks with no current item. As in the approved prototype, the fourth/current sheet retains at most three prior sheet edges.
- `testMode`: false by default. Only an explicit true shows the tag. Callers must validate browser/server sandbox state; the shell makes no billing decisions.
- `children`: screen content, including the screen's own `h1`. The shell focuses that heading on entry and step changes, falling back to the main sheet while a heading is absent. Same-step rerenders and language changes retain focus and child identity. No child is keyed by language or step.
- `aside`: optional screen-owned worksheet content, rendered only for `size="split"`. The panel shows at 861px and wider; below that it hides and the progress row shows. The shell supplies no example operational rows or screen copy.

The header reuses `BrandLogo` and `LanguageChoice`, with local styles. The unique skip link targets the focusable main sheet. Language comes from the existing context and sets `dir`/`lang` locally. The fixed aurora table and decorative tick mirror correctly in Urdu. The logo asset is unchanged until spec 05.

#### Scoped CSS vocabulary

`frontend/src/pages/Onboarding/flow.css` defines the closed design-system palette on `.flow-shell`. No global tokens or workspace rules change. Importing `FlowShell` loads it.

- Type: `.flow-lede`, `.flow-fine`, `.flow-section-title`, `.flow-price`; `.flow-ltr` isolates amounts and similar content in Urdu. Email/password inputs already stay LTR.
- Forms: `.flow-form`, `.flow-field`, `.flow-input`, `.flow-password`, `.flow-password-toggle`, `.flow-field-error`. Existing `Input` (`data-slot="input"`) receives the scoped field style automatically. Screens still supply visible labels, error associations and `aria-invalid`.
- Actions: use existing `Button` with `.flow-button`, optionally `.flow-button-secondary` or `.flow-button-full`. Form actions fill the form width. `aria-busy="true"` supplies a spinner; the caller supplies the action-specific busy label and disables repeated submissions.
- Notices: `.flow-notice`, with `-ok`, `-warn` or `-bad` suffix; screens supply `role="status"` or `role="alert"` and meaningful copy. Chips: `.flow-chip` and corresponding tone suffixes.
- Loading/state motion: `.flow-skeleton`, `.flow-spinner`, `.flow-frame-ready`, `.flow-price-enter`, `.flow-confirming-ring`, `.flow-ready-stamp` (SVG path must use `pathLength="1"`), `.flow-disclosure` on `details`.
- Selection: `.flow-interval` with two buttons and an aria-hidden `.flow-interval-thumb` as the first child; buttons expose `aria-pressed`. Thumb movement mirrors in Urdu. `.flow-plan-row` responds to a checked descendant radio. Screens own layout, labels and numbers.
- Split worksheet: `.flow-panel-headline`, `.flow-worksheet`; rows may reuse `.flow-step-box` with an SVG path using `pathLength="1"`, and `data-complete="true"` on the containing row. Completed worksheet paths draw once, 190ms apart after 420ms. No worksheet copy is created here.

CSS supplies all specified motion. Sheet/content entrances replay when the step changes without remounting children. Reduced motion removes movement and loops, hides confirming rings and permits only the specified 120ms notice/error/frame opacity fades. The language control, focus rings, background and compared numbers never animate. The interval uses a fixed half-width thumb and transform only, following the design system's allowed-property rule.

At 380px and below the sheet reaches the viewport edges. A wide sheet has 4px side padding, leaving 312px for the future card frame at a 320px viewport. Screens must retain that width when composing their contents.

#### Verification seam

`frontend/src/pages/Onboarding/FlowShell.test.tsx` covers progress and ready/none states, edge continuity, all sizes, explicit Test mode, shared primitives and skip destinations, responsive/RTL hooks, heading focus and preserved child/input identity. JSDOM checks hooks, not layout. A temporary isolated Vite/Chromium preview under `/tmp/hygene-spec03-review/` checked actual widths, LTR/RTL, reduced motion and keyboard focus; no route or end-to-end test harness was added to the application.

### Source `04-urdu-dictionary.md`

### Spec 04 — English and Urdu copy for the flow

#### Registered onboarding dictionary

`frontend/src/i18n/onboardingTranslations.ts` exports `onboardingUrdu: Record<string, string>`, with 147 entries from the approved `design/saas-onboarding/v3/locale.js` and the additional payment, recovery and error states required by the screen specs.

- Use the existing `useLanguage().t(englishKey, values)` or `translate(englishKey, language, values)`. `translations.ts` checks this dictionary first. Screens do not need to import it or edit shared translation files.
- Nine existing billing keys are reused through the lookup chain: Skip to content, Choose a plan, Billing interval, Monthly, Yearly, Try again, Order summary, Change plan and Contact support.
- `Enterprise` intentionally overrides the old billing transliteration so Starter, Pro and Enterprise retain their approved names. Paddle and Hygene Ops also stay exact.
- Extra keys cover retry waits (`Too many attempts. Try again in {count} seconds.`), checkout preparation, plan replacement, the English Paddle form notice, unresolved/in-progress reconciliation, and recovery messages that make no assertion about charges when the outcome is unknown.
- Existing account, billing and staff-handoff translations remain available through the same lookup. Placeholders retain their exact names; values and missing placeholders keep the existing interpolation behaviour. No trial copy is added.

#### Coverage manifest

`frontend/src/i18n/onboardingTranslations.test.tsx` lists 194 required English keys covering the prototype, additional screen states and reused account/billing/staff copy. Its 204 cases check registered Urdu coverage, English identity, placeholder parity and interpolation (including zero), exact plan/brand names, billing-key reuse, lookup precedence, missing-key fallback and absence of trial wording.

### Source `05-logo-rollout.md`

### Spec 05 — New Hygene Ops logo

#### Shared identity assets

- `frontend/public/brand/hygene-ops-mark.svg` and `frontend/public/favicon.svg` are byte-for-byte copies of the approved `design/saas-onboarding/assets/hygene-ops-mark.svg`. Keep the full 48×48 viewBox: the coloured tick extends beyond the rounded checkbox box.
- Existing `frontend/src/components/common/BrandLogo.tsx` continues to supply the shared web identity. Its image sizing and `brand.css` already preserve the full mark; reuse them without additional logo markup.
- `frontend-mobile/assets/hygene-ops-icon.png` remains 1024×1024, `hygene-ops-mark.png` 192×192 and `hygene-ops-favicon.png` 48×48. Each renders the approved SVG directly at its output size, with transparency preserved.
- `frontend-mobile/assets/hygene-ops-adaptive.png` remains a transparent 1024×1024 layer. The approved SVG renders at 480×480 and is centred at (272, 272), retaining at least the original 232px edge padding and keeping every visible pixel, including the tip, inside Android's central 66dp circular safe zone on the 108dp layer.
- The PNGs were generated with the backend's already-installed `sharp`, without adding a dependency. Rasterize the SVG with density `72 * outputSize / 48`; the adaptive foreground uses density 720 before compositing. Preserve transparency and the approved artwork when regenerating.
- The single-colour `hygene-ops-notification.*` assets are separate notification artwork and remain unchanged.

#### Documentation and regression checks

- `DESIGN.md` Overview records the approved mark gradients and scoped Fresh aurora table / Mint sky panel as sanctioned exceptions to workspace rules. Onboarding colours remain defined by the existing closed design-system tokens in `flow.css`.
- `frontend/tests/brand-assets.test.mjs` provides seven Node tests for exact SVG copies, removal of the legacy mark colour, original PNG dimensions, visible box/tick/tip pixels, transparency and the adaptive safe zone. It reuses the backend's installed Sharp to decode PNGs; it runs in both the focused command and the existing frontend unit suite.

### Source `06-onboarding-routes.md`

### Spec 06 — Next-step route map

#### Pure routing helpers

`frontend/src/pages/Onboarding/onboardingRoutes.ts` is additive. Pages and guards adopt it in their assigned later specs.

- `ONBOARDING_ROUTES` exports `continue`, `login`, `signup`, `choosePlan`, `payment`, `activation`, `recovery`, `workspace`, `account` and `security` destinations. `OnboardingRoute` is their literal value union.
- `onboardingRouteForStep(step)` imports `BillingOnboardingStep` from the existing billing DTO. Its exhaustive switch maps all nine steps to the architecture table. Missing (`null`/`undefined`) or invalid runtime steps return `null`, so callers must show retry rather than infer a destination. Extending the DTO step union causes a type error until this map is updated. A mapped workspace route does not itself grant access.
- `parseOnboardingQuery(search)` accepts a query string or `URLSearchParams`, returning a typed `OnboardingSelection` with only optional `plan` (`STARTER`, `PRO`, `ADVANCED`) and `interval` (`month`, `year`). Values are exact and case sensitive. Invalid values, duplicate keys and unrelated fields are dropped independently; the original params remain unchanged. This carries an initial selection only; a saved server draft still takes precedence.
- `isSafeFromPath(value)` is a string type guard for root-relative workspace deep links. It checks origin against a fixed, non-network URL base, rejects protocol-relative/absolute URLs, backslashes, control characters, malformed/ambiguous encodings and auth/setup destinations, and normalizes dot segments and encoded route names before matching. It excludes the entire subscription subtree, `/continue`, `/welcome`, public recovery links, account security and the separate platform area. Safe workspace query strings and fragments remain part of the original string. Callers must enforce role, tenant and workspace access separately, and only honor `from` after server authorization.

#### Verification seam

`frontend/src/pages/Onboarding/onboardingRoutes.test.tsx` contains 142 tests covering all steps, absent/invalid steps, every valid selection, invalid and duplicate query values, caller immutability, safe workspace links, external URLs, protocol-relative/backslash/control-character attacks and auth/setup bypasses.

The owned `.test.tsx` file matches Vitest's `src/**/*.test.tsx` discovery pattern and runs in the normal frontend suite. Run it directly with `cd frontend && npx vitest run src/pages/Onboarding/onboardingRoutes.test.tsx`; no include or transform override is needed. Verified on 2026-11-09: 142 focused tests passed, with no failures or skips.

### Source `07-checkout-machine.md`

### Spec 07 — Pure checkout state machine

`frontend/src/pages/Subscription/onboarding/checkoutMachine.ts` is the pure reducer for spec 21's controller and spec 37's payment UI. It has only a type import from the shared billing DTOs; no React, Paddle, API, DOM, network, storage or clock dependencies.

- `checkoutStatuses`, `CheckoutStatus`: the architecture's twelve checkout states.
- `checkoutActions`, `CheckoutAction`: the exact per-state visible actions (`changePlan`, `tryAgain`, `checkStatus`, `contactSupport`). `checkoutWaits` documents the five explicit waits without actions. The controller owns deadlines and the activation handoff.
- `createCheckoutState(sessionId)`, `CheckoutState`, `CheckoutEvent`, `checkoutReducer`: local session state and transitions. Pass a new generation on owner/session changes and discard old callbacks; all events carry `sessionId`. Frame/payment events additionally carry the transaction ID; only a transactionless top-level `checkout.error` can affect `frameLoading`.
- `serverFactsRead` consumes the validated lifecycle's `onboardingStep` and `checkoutResume`. A fresh resumable draft loads the frame; cleared facts permit prepare; unknown facts require a status check. Background reads preserve active frames; administrative restriction always takes priority. `confirming` only hands off to server confirmation and never grants workspace access.
- `prepareFailed` means proven failure before sending; `prepareTimedOut` means an unknown outcome after sending (also used for an unknown replacement outcome). An unresolved outcome accepts no retry or replacement: fresh server facts must establish the next step. Use `prepareSucceeded` for prepare and `replaced` for replacement, carrying the new draft ID.
- `tryAgain` retries frame/script setup and restores offline state; it cannot start another unknown purchase. Offline during prepare, replacement or payment recovers to `unresolved`.
- `checkoutFormUsable(state)` remains true for `ready` and `declined`. A decline preserves the draft; payment setup/provider errors fail the frame. Keep its DOM target mounted in the controller/view.

`checkoutMachine.test.tsx` includes an independent transition table across all twelve states and eighteen event types, stale-session and foreign/transactionless-event matrices, exact action/wait assertions, and focused retry, decline, replacement, offline and server-fact cases. No provider or database fixture is needed.

### Source `08-paddle-gateway.md`

### Spec 08 — Paddle gateway with time limits

#### Gateway

- `backend/src/services/billingProvider.ts` exports the lazy shared `billingProvider`, `createBillingProvider({ client?, log? })`, the `BillingProvider` type and the narrow `BillingProviderClient` injection seam. The default reuses `getPaddleClient`; constructing a gateway does not read credentials or make a request.
- The SDK-shaped surface wraps `customers.create/list`, `prices.get/update`, `products.get`, `transactions.create/get/list/update`, `subscriptions.get` and `customerPortalSessions.create`. Non-list arguments and result entity types retain the installed SDK signatures, including optional query parameters.
- `BILLING_PROVIDER_TIMEOUT_MS` is 15,000. Each request, including each list page, gets its own deadline. The installed SDK has no abort-signal seam, so timeout discards late results and consumes late rejections. It does not prove a remote write failed and never retries a call.

#### Failure contract

- Every failed call throws `BillingProviderError` with `operation`, `classification`, `providerCode` and `customerId`. It copies no raw provider error, detail, payload or cause. `classifyBillingProviderError(unknown)` exposes the same safe failure facts for reuse.
- Only installed SDK `ApiError` instances can establish a provider rejection. `too_many_requests` maps to `RATE_LIMITED`; `customer_already_exists` maps to `CUSTOMER_EXISTS`; remaining `request_error` failures map to `REJECTED`. Timeout, network, `api_error`, lookalike objects and unknown errors are `UNCERTAIN`.
- Customer conflicts parse one distinct valid `ctm_` ID from detail. Missing, malformed or ambiguous IDs produce `customerId: null`; parsing grants no permission to adopt a customer. Provider codes are bounded identifiers or `null`.
- Failures go through the existing operational logger. Its allowlist has no operation field, so the fixed operation is encoded in `event`, for example `BILLING_PROVIDER_CUSTOMERS_CREATE_FAILED`. The only other fields are `errorClass` (the failure classification) and safe `providerCode` when present. No provider detail, customer ID, email, token or request data is logged.

#### Bounded searches

- `customers.list({ email, status })` sends the SDK's exact `email: [email]` filter and explicit status array, never the broad `search` filter. Adoption and company-link checks belong to spec 17.
- `transactions.list(query)` preserves SDK transaction filters and cursors. Both list helpers enforce `BILLING_PROVIDER_PAGE_SIZE = 100` and `BILLING_PROVIDER_MAX_PAGES = 5` using explicit `collection.next()` calls.
- Lists return `BillingProviderList<T> = { data, hasMore }`. Callers must inspect `hasMore` before interpreting a result as exhaustive. A failed or timed-out page throws instead of returning partial data as a completed search.

#### Verification seam

- `backend/src/services/billingProvider.test.ts` uses an injected client, the shared logger with a captured sink, and fake timers. It covers all 11 wrapped operations, classifications, customer-ID parsing, safe errors/logs, hung and late calls, SDK argument/receiver preservation and bounded pagination with per-page deadlines. No provider or database is used.
- This spec is additive. Replacement of legacy lifecycle provider calls remains with the later service specs that own those files.

### Source `09-reservation-facts.md`

### Spec 09 — Reservation facts

#### Shared reservation service

`backend/src/services/billingReservations.service.ts` is additive. The legacy lifecycle implementation remains until spec 36 adopts these helpers.

- `BILLING_RESERVATION_GRACE_MS` is 120,000. `readBillingReservation(company, operation, deps?)` reads the latest company-scoped `CUSTOMER_CREATE` or `CHECKOUT` reservation and returns `none`, `inProgress`, `reconcile`, or `closed` with its reservation and closing fact. Elapsed time never closes a hold. At exactly 120 seconds an open reservation needs reconciliation.
- Closing actions are `CUSTOMER_CREATE_READY`, `CUSTOMER_CREATE_FAILED`, `CHECKOUT_READY`, `CHECKOUT_FAILED` and `CHECKOUT_CANCELED`. Facts must match the company, entity, operation and numeric reservation ID and follow the reservation in audit order. READY additionally preserves the canonical customer, catalog and tenant-mirror checks. CANCELED cannot refer to a different saved draft. The newest valid closing fact wins, allowing CANCELED after READY.
- `customerReconciliationPending(company, deps?)` reports any open customer hold, including one inside grace. A matching FAILED clears it; malformed/foreign facts do not.
- `inspectBillingCheckout(company, deps?)` returns `resume` with the existing `BillingCheckoutResume`, `none`, `canceled`, `pending`, `inProgress`, or `reconcile`. It preserves legacy unmirrored READY compatibility, exact customer/tenant correlation, canonical subscription handling and the refusal to resume paid/billed/completed/unknown transactions. FAILED returns `none`; CANCELED returns `canceled`.
- `reserveBillingOperation(actor, operation, details, deps?)` rechecks the active owner, company status, live email verification and linked-subscription guards under the existing parameterized Company `FOR UPDATE` lock. It returns `{ reservationId }`, `{ existingCustomerId }`, or `{ ready }`. An open hold throws 409 with `IN_PROGRESS` or `RECONCILIATION_REQUIRED`; a failed/canceled hold permits a fresh reservation. A valid draft is reused. Pass the catalog `{ plan, interval, priceId }` for CHECKOUT and `{}` for CUSTOMER_CREATE.
- `recordBillingReservationFact(actor, fact, deps?)` accepts the discriminated `BillingReservationFact` union, validates correlation under the company lock and appends through `writeAuditLog`. Repeating the same fact is idempotent. Contradictory terminal facts are refused; a prepared draft can subsequently be canceled. Malformed/stale facts do not prevent appending a valid fact. Safe failure codes include `REJECTED`, `EMAIL_CONFLICT` and the gateway's lowercase provider codes. Callers establish provider proof; this module never calls Paddle or turns a timeout into a failure fact.

#### Injection and atomic composition

All helpers accept injected `db` and `now`. `deps.tx` accepts a `BillingReservationClient` to compose facts with customer/transaction mirror and company-link writes in one caller-owned transaction; mutations still acquire the Company lock and avoid a nested transaction. READY requires the canonical linkage (and a mirror for `confirmedByProvider`) to exist in that transaction before recording it.

Exported support types: `BillingReservationOperation`, `BillingReservationCompany`, `BillingReservationClient`, `BillingReservationState`, `BillingCheckoutInspection`, `BillingReservationFact` and `BillingReservationResult`.

#### Verification seam

`billingReservations.service.test.ts` uses an injected clock and shared stateful database fake. Its transaction fake serializes only when the service executes `FOR UPDATE`, covering concurrent first attempts and retries after failure. It tests every closing action, tenant/reservation/action mismatches, malformed and stale facts, grace boundaries, legacy resume behavior, paid holds, append-only/idempotent recording and caller-transaction composition. No SQL or provider call is used.

### Source `10-onboarding-step.md`

### Spec 10 — Server next-step decision

`backend/src/services/billingOnboardingStep.ts` exports:

- `BillingOnboardingFacts`: required plain facts computed by the lifecycle reader. Supply the company's active/suspension flags, workspace entitlement, subscription linkage, billing/catalog readiness, trial-price detection, live-mode/email verification, paid/unknown status, open reservation, recorded conflict and resumable draft. No dates, provider rows or database handles are needed.
- `BillingOnboardingDecision`: required `onboardingStep` and `recoveryReason`, using the shared spec 01 DTO unions.
- `decideBillingOnboardingStep(facts)`: pure first-match selection in architecture order: restriction, workspace, linked account, unavailable billing/catalog, email verification, confirmation, reconciliation, payment, plan selection. Returns a fresh object without changing input. Selecting a step never grants access.

Unavailable billing returns `BILLING_DISABLED`; unusable catalog or a trial-bearing price returns `PRICE_NOT_READY`. If billing and catalog are both unavailable, disabled billing takes precedence. Reconciliation preserves a recorded `EMAIL_CONFLICT` or `CUSTOMER_UNRESOLVED`; an open reservation alone returns `CUSTOMER_UNRESOLVED`. All other steps return a null recovery reason.

Spec 36 should assemble these facts and spread the returned decision into the lifecycle DTO. Subscription linkage is independent of mirror/status availability: a linked subscriber without access goes to ACCOUNT before later checks, including unknown subscription status. Existing entitlement, including an entitled historical trialing subscription, takes precedence over catalog purchase readiness.

`backend/src/services/billingOnboardingStep.test.ts` contains 120 tests covering every table row and alternative trigger, all earlier/later row pairs, simultaneous restrictions, expired subscribers, sandbox/live verification, recovery reasons and input immutability. No provider, database or clock dependency is imported.

### Source `11-auth-rate-limit.md`

### Spec 11 — Authentication rate limiter

- `backend/src/services/authRateLimit.ts` exports the shared `authRateLimit` singleton. Mount `authRateLimit.login` before login handling (spec 20) and `authRateLimit.signup` before signup handling (spec 19). Both are Express request handlers; allowed requests call `next()` and blocked requests end the response.
- Login admits 10 attempts per normalized email plus IP and 50 attempts per IP in a fixed 15-minute window. Signup admits 10 attempts per IP in a fixed hour. Login and signup have independent buckets. Attempts rejected by the login email bucket still count against its IP bucket. Email normalization trims whitespace and lowercases; malformed or absent emails share an empty-email bucket for that IP.
- Keys are SHA-256 hashes of structured tuples, including email and IP, so neither raw value is retained in the map. IP comes only from Express `req.ip`, using spec 02's trusted-proxy configuration; missing IPs share an `unknown` bucket. Forwarded headers are never read directly.
- A rejection returns HTTP 429, JSON `{ success: false, code: 'AUTH_RATE_LIMITED', message: 'Too many attempts. Try again later.' }` and `Retry-After` as positive whole seconds, rounded up. When both login buckets reject, the header covers the longer remaining wait. The shared operational logger records only event `AUTH_RATE_LIMITED`, status 429 and warning severity, with no identity or request payload.
- State is per process, documented for today's single dyno. The default cap is 10,000 keys. Expired requested buckets reset at expiry; expired unrelated buckets are pruned when admission needs space. Live buckets are never evicted. Capacity exhaustion fails closed and reports the earliest expiry for retry; multi-key admission is atomic. Counts saturate after the threshold.
- `createAuthRateLimit({ now?, maxKeys?, log? })` creates isolated state for tests. `now` returns milliseconds; `maxKeys` is a safe integer of at least 2; `log` has the shared operational logger signature. The read-only `keyCount` getter exposes aggregate occupancy without exposing keys.
- `backend/src/services/authRateLimit.test.ts` tests thresholds, reset boundaries, email/IP isolation and normalization, malformed bodies, route-area separation, bounded capacity, atomic allocation, pruning, safe logs and configuration. It uses injected time and sinks with mocked Express request/response objects; no database, provider or route wiring is involved.

### Source `12-billing-transport.md`

### Spec 12 — Time-limited billing transport

- `frontend/src/pages/Subscription/onboarding/billingRequest.ts` exports `BILLING_REQUEST_LIMITS`: read 15s, confirm 20s, reconcile 30s, prepare 45s. Legacy and managed portal creation use the prepare limit.
- `billingRequest(request, limit, callerSignal?)` supplies a composed abort signal, races the adapter against the deadline/caller abort, discards late completion, consumes late rejection, and removes timers/listeners after settlement. It still terminates if an adapter ignores abort.
- `BillingRequestError` exposes `kind` (`not_sent`, `timed_out_after_send`, `server`, `offline`), `sent`, nullable `status`, and nullable server `code`. Its sanitized `response.status` preserves existing access-denial handling. Raw errors/payloads are not retained.
- `sent` means handed to the shared client, a conservative boundary rather than proof of receipt. A pre-aborted caller is `not_sent`; a browser known offline skips dispatch with `offline`/`sent:false`. Cancellation or timeout after dispatch is `timed_out_after_send`; a lost connection is `offline`/`sent:true`. Neither proves a mutation failed at the server. Check server state before another purchase.
- `frontend/src/pages/Subscription/api.ts` bounds every existing billing request without changing shared client defaults. Every POST sets the shared interceptor's `_retry:true` guard to prevent automatic replay, including after expired-token 401 responses.
- New `confirmBillingCheckout(signal?, companyId?)` and `reconcileBillingCheckout(signal?, companyId?)` POST empty bodies to `/subscription/manage/checkout/confirm` and `/subscription/manage/checkout/reconcile`. Both reuse spec 01 parsers, optionally reject another company's lifecycle, and return the validated outcome/lifecycle. Existing transport signatures remain compatible.
- `billingRequest.test.tsx` provides fake-clock timeout, abort, cleanup, late-result and classification coverage. `api.test.tsx` covers each endpoint's limit, strict results, single-send mutation configuration and the actual shared refresh interceptor with an injected adapter (no network).

### Source `13-paddle-sdk-inline.md`

### Spec 13 — Paddle.js loading and normalized events

All exports live in `frontend/src/lib/paddle.ts` and use the existing singleton and event fan-out. No component or payment controller is added.

- `getPaddle()` retains one successful initialization and shares pending calls. Its official-script loader now has a 15-second watchdog. Error, missing-global and timeout failures remove the tag, detach handlers and clear the timer; the next explicit call can retry. Loading precedes the installed wrapper so its cached CDN promise is never poisoned by a failed download.
- `openInlineCheckout({ transactionId, frameTarget })`, `InlineCheckoutOptions`: await the shared SDK and open the server's saved transaction in the given container class. Settings are inline, one-page, 450px initial height, full width with 312px minimum width, light theme, English locale, logout/discount entry disabled and no success URL. The returned promise reports setup/open failures; resolving it does not mean the frame loaded or payment succeeded.
- `normalizePaddleEvent(event)`, `NormalizedPaddleEvent`: pure mapping with a `type` discriminant (`loaded`, `updated`, `paymentFailed`, `paymentError`, `openError`, `completed`, `closed`) and optional `transactionId` taken only from `data.transaction_id`. `checkout.items.updated` also maps to `updated`; legacy `checkout.failed` maps to `openError`. Unsupported/missing names return `null`. Flat `checkout.error` and `checkout.payment.error` require no `data` and never inherit a previous transaction.
- `loaded` and `updated` carry optional `totals`, `recurringTotals` and `currencyCode`, copied from SDK fields without amount conversion or invented zeroes. Amount fields retain the installed SDK's numeric values. Consumer components remain responsible for their display adapter. No customer details, payment details, card data or provider error text enter normalized events.
- `subscribeNormalizedPaddleEvents(listener)` wraps `subscribePaddleEvents`, returns independent idempotent cleanup, isolates listener exceptions and does not load or initialize Paddle. Raw `subscribePaddleEvents`, `PaddleEventData` and `CheckoutEventNames` remain compatible with the current overlay callers. Only a `loaded` event establishes frame readiness; browser events never grant access.

`frontend/src/lib/paddle.test.tsx` has 42 passing cases (reverified 2026-11-09) covering fake-timer script deadlines/retry/cleanup, a real installed-wrapper initialization against a fake global (no CDN request), shared initialization, exact inline settings, normal and flat error shapes, totals isolation, raw compatibility and listener cleanup/failure isolation.

### Source `14-sandbox-probe.md`

### Spec 14 — Sandbox probe

- `backend/src/services/paddleSandboxProbe.ts`: `sandboxProbeGuard(environment, confirm)` and `runPaddleSandboxProbe({ environment, confirm, priceIds, provider })`. Injected provider uses the existing billing gateway surface; no database dependency. Requires six unique catalog IDs. Reports six price reads, disposable customer creation and duplicate handling, draft creation/read/customer-filtered list, cancellation and canceled readback. Cleanup runs after draft verification failures, with no write retries.
- `SandboxProbeCheck` and `SandboxProbeReport`: explicit allowlisted report fields, validated IDs and fixed status/error codes. Arbitrary provider errors, messages, email addresses, payloads and secrets are excluded. Reports an incomplete search and uncertain creation without inventing outcomes.
- `backend/scripts/paddleSandboxProbe.ts`: thin manual `tsx` entry point, sandbox and `--confirm` guarded before catalog reads/provider I/O; reads the existing sandbox catalog and prints JSON with a failure exit code for failed checks. Does not import Prisma or start the application.
- `backend/src/services/paddleSandboxProbe.test.ts`: mocked provider fixtures testing guards, report/redaction behavior, exact gateway arguments and cleanup/failure handling. No real provider or database.
- `docs/plan-project/saas-onboarding/research/sandbox-probe.md`: dated evidence boundary and coordinator command. Real trial state, cancellation behavior, raw duplicate error shape and stuck-company reservation inspection remain unverified under the run override.

### Source `15-trial-free-catalog.md`

### Spec 15 — Trial-free plan catalog

- `backend/src/services/billingCatalog.service.ts` exports the shared `getBillingCatalog(actor)` reader and `createBillingCatalog({ db?, provider?, now?, log? })` factory. Create an injected reader once and reuse it; its `now` returns a `Date`. The default provider is spec 08's timeout/logging gateway, and configuration comes from `getPaddleCatalog` and `requireBillingActivation`.
- Every read checks the active company owner and activation before using cached provider facts. Price/product identity and active status, configured interval, frequency 1, integer amount string and currency checks are preserved.
- Any non-null/undefined trial metadata throws `BillingCatalogError` with `code: PRICE_HAS_TRIAL`, HTTP 503 and `recoveryReason: PRICE_NOT_READY`. Other invalid price/product facts use `code: PRICE_NOT_READY`. Validation logging contains only the fixed event/class/code; provider failures retain the gateway's safe error/log contract.
- `TrialFreeBillingCatalogEntry` reuses the shared DTO while omitting the compatibility `trialPeriod` property. Returned objects contain no trial field and cannot mutate cached objects.
- `BILLING_CATALOG_CACHE_MS` is 60,000 ms from successful completion. One bounded cache slot is keyed by environment plus the configured entries. Concurrent reads share one in-flight set of price/product requests; failures are not cached. Changed configuration cannot receive an old in-flight result as its cache value.
- `billingCatalog.service.test.ts` provides 45 isolated unit cases using injected database/provider/clock/log fixtures. No real database or Paddle calls are needed.
- This module is additive. The old catalog reader and HTTP wiring remain in `billingLifecycle.service.ts` until spec 36 assembles the lifecycle services.

### Source `16-trial-removal-script.md`

### Spec 16 — Sandbox trial removal

- `backend/src/services/paddleTrialRemoval.ts` exports `getTrialRemovalCatalog()` and `removePaddleTrials({ apply? }, { provider?, env? })`. It uses only the six repository sandbox catalog IDs, rejects other environments before provider calls, defaults to previews, preserves each billing cycle and sends `trialPeriod: null` through the shared billing gateway. Each attempted update gets a fresh verification read, including uncertain writes. Per-price failures do not stop the remaining prices; reruns skip prices already clear.
- Results include plan, interval, price ID, status (`WOULD_REMOVE`, `ALREADY_CLEAR`, `REMOVED`, `FAILED`) and a fixed failure code. Raw exceptions and credentials are never included.
- `backend/scripts/removePaddleTrials.ts` is the thin command. From `backend`, use `npx tsx scripts/removePaddleTrials.ts` to preview; only `--apply` enables writes. Unsupported arguments, configuration errors and per-price failures return exit code 1. Direct invocation loads dotenv; importing the exported `main` does not execute the command or load dotenv.
- `backend/src/services/paddleTrialRemoval.test.ts` supplies 23 isolated service/command cases with injected provider/runner functions. No database or real Paddle calls are needed. Real execution and verification remain the coordinator's responsibility.

### Source `17-ensure-customer.md`

### Spec 17 — One Paddle customer per company

#### Customer service

- `backend/src/services/billingCustomer.service.ts` exports `ensureBillingCustomer(actor, deps?) -> Promise<string>`, returning the company-scoped Paddle customer ID. Dependencies accept `db`, `provider` (the gateway's customer surface), and `now`; the default gateway is lazy.
- Reuses `reserveBillingOperation` and `recordBillingReservationFact` for every audit write. A linked customer is reused only with its matching tenant mirror. Reservations and final mirror/link/READY writes use the Company row lock; the latter commit atomically in one transaction.
- Creation sends SDK `customData: { companyId, customerReservationId }` (Paddle wire `custom_data`). `REJECTED` and proven `RATE_LIMITED` responses append FAILED and permit retry. Unknown errors, timeouts, invalid success responses, incomplete lists and uncertain reads leave the hold open for spec 28.
- `CUSTOMER_EXISTS` triggers an exact-email list with `status: ['active', 'archived']`. Adoption needs an exhaustive single active match, case-insensitive exact email, sandbox or verified owner, and no foreign mirror or canonical company linkage. Provider error-detail IDs never authorize adoption. Archived/ambiguous/mismatched/foreign matches append FAILED with `EMAIL_CONFLICT`; success appends READY with `adopted: true`.
- Rechecks identity, email, verification, company status and linkage under the final lock. An existing mirror keeps newer webhook fields. Database failures roll back mirror/link/READY together and retain the original hold.
- Legacy `billingLifecycle.service.ts` remains outside this spec's ownership. Specs 26 and 36 consume this additive service and replace the legacy caller.

#### Verification seam

- `backend/src/services/billingCustomer.service.test.ts` has 48 focused cases using the real facts service, injected customer provider, clock, and a stateful database fake with row-lock serialization and rollback. Covers retry, adoption guards, concurrency, atomic persistence, authorization and a real gateway deadline with a late success. No real database or Paddle calls.

### Source `18-fulfillment-seam.md`

### Spec 18 — Shared subscription fulfilment

- `backend/src/services/paddleFulfillment.service.ts` exports `applyPaddleSubscription(subscription, { companyId, customerId }, db?)`. Pass an installed SDK `Subscription` obtained by a trusted server read, the expected company and its already established Paddle customer, and optionally an injected database with `$transaction`. Payment/transaction verification and deciding when to call this function belong to spec 27.
- The entry point refuses foreign customer IDs, invalid company IDs, invalid provider version timestamps, missing/foreign canonical company links and conflicting customer/subscription mirror ownership. It takes the company row lock followed by the existing customer advisory lock, then rechecks canonical ownership inside the transaction.
- A narrow internal SDK adapter passes provider identity, status, price/product, billing period, scheduled change and cancellation/pause facts to the existing `handleSubscription`. Both entry paths use that handler and `syncCompanyAccess`; existing account-access window, configured-price and administrative restriction policies remain in force. Legacy/new `trialing` subscriptions remain accepted; rejecting trial prices for new checkout belongs to spec 15.
- Both subscription paths compare provider `updatedAt` first, then event time for equal versions. Server reads use provider `updatedAt` as their version timestamp, never local read time. Older subscription facts cannot overwrite newer ones; a newer webhook remains applicable after repeated reads. Customer and transaction event version handling is unchanged.
- Server reads never read or write `PaddleWebhookEvent`. The real webhook can subsequently apply and deduplicate normally. Transaction events still create only unknown subscription placeholders and can arrive before or after subscription fulfilment.
- `backend/src/services/paddleFulfillment.service.test.ts` contains 64 tests, including the existing status checks. Real SDK entities, transactional in-memory fixtures and the real account-access reader/evaluator cover entry-path parity, legacy trials, locks, ownership, effective periods, restrictions, rollback, ordering and all eight accepted transaction event types in both arrival orders. No provider client or real database is used.

### Source `19-signup-rules.md`

### Spec 19 — Signup rules

- `backend/src/validations/manager.validation.ts`: `managerSignupSchema` trims and lowercases signup email before email validation and requires passwords of at least 8 characters and at most 72 UTF-8 bytes. Passwords remain unmodified; manager login, manager creation and manager update schemas retain their existing rules.
- `backend/src/services/companyRegistration.service.ts`: `companyRegistrationSchema` keeps strict public fields, trimmed name/company bounds, the 254-character email bound and per-field validation messages. `registerCompany(input, db?)` checks Manager and Staff email case-insensitively inside the existing transaction before writes. Existing accounts and Prisma `P2002` races return HTTP 409 through `ApiError`, with `errors[0].code = EMAIL_EXISTS`, `field = email` and a safe field message. The existing error middleware exposes that code at the response's top level.
- Registration still creates company, first ADMIN and `OWNER_EMAIL_ENROLLMENT_ALLOWED` audit atomically. The Prisma `manager.create` extension remains the only password hasher. The existing signup controller still reports HTTP 201 with `sessionEstablished: false` and `Account created. Sign in to continue.` when session issuance fails after account creation.
- `backend/src/routes/manager.route.ts`: the existing `authRateLimit.signup` singleton runs before the public `/api/manager/manager-signup` handler. It admits 10 attempts per IP per hour and then returns HTTP 429 with `AUTH_RATE_LIMITED` and `Retry-After`.
- `backend/src/services/companyRegistration.service.test.ts`: mocked transaction/identity lookups cover normalization, both identity tables, password byte boundaries, unique-index failures, per-field messages, atomic audit behaviour and session outcomes. A local HTTP test mounts the production manager router and proves rejected requests stop before database/session work. No provider or database is used.

### Source `20-unified-login.md`

### Spec 20 — Email and password login

- `backend/src/services/login.service.ts` exports `login(input, db?)`. The optional database implements manager/staff `findUnique`, `findMany` and `update`; production defaults to the existing Prisma client. Input accepts only the existing email/password login fields. It never accepts role, account type or tenant claims.
- Lookup checks the manager table (owners and managers) before staff. Each table uses exact email first, then a bounded, case-insensitive lookup. Multiple fallback matches fail generically; exact matches retain precedence over legacy case variants. A matching manager password wins over staff, including when the manager is deactivated. A wrong manager password permits trying staff credentials.
- Missing accounts, ambiguous fallback matches and wrong passwords use the same `401 Invalid email or password`. Missing/ambiguous accounts receive a real cost-10 dummy bcrypt comparison when no candidate was compared. Every valid credential attempt performs at least one comparison; checking two same-email candidates can require two. Deactivation is disclosed only after a successful password comparison.
- Successful login reuses `generateAccessToken`, `generateRefreshToken` and existing refresh-token persistence. It returns `{ user, accessToken, refreshToken }`. `user` preserves the existing manager or staff login response fields, including staff location and tokens. Passwords and internal account state are omitted from the public response.
- `backend/src/controllers/login.controller.ts` exports the thin `loginUser` Express adapter. It sets `private, no-store`, uses `getCookieOptions()` for both cookies, and returns the existing `ApiResponse` success envelope only after persistence succeeds.
- `backend/src/routes/common.route.ts` mounts `POST /common/login` behind the shared `authRateLimit.login` middleware. Existing manager/staff login routes remain in place. The common credential-handoff router already provides no-store headers before the limiter.
- `backend/src/services/login.service.test.ts` covers credential precedence, exact and mixed-case lookup, ambiguity, real bcrypt work, strict validation, deactivation, token claims, persistence and local HTTP route/cookie/rate-limit behavior. Prisma is mocked and injected database implementations stay in memory; no provider or database is used.

### Source `21-checkout-controller.md`

### Spec 21 — Owner checkout controller

`frontend/src/pages/Subscription/onboarding/useCheckoutSession.ts` adds `useCheckoutSession(selection?)` for spec 37. It requires the existing QueryClient provider and auth identity. The legacy `useBillingCheckout.ts` remains in place for current screens.

- `CheckoutSelection`: allowlisted `plan` / `interval`. Arrival resumes the server's saved selection first; rerendering a URL selection or language never restarts the frame.
- `state`, `status`, `actions`: local session state from `checkoutMachine`. All transitions use its reducer; a new owner or server draft gets a new generation. Completion means `confirming`, never workspace access.
- `prepared`: the current transaction and saved selection. `totals` (`CheckoutTotals`) contains only normalized `totals`, `recurringTotals`, `currencyCode` from matching loaded/updated events, without amount conversion or raw payment data.
- `registerFrameTarget(className | null)`: stable callback for spec 25. Register the target's class name, release it on unmount, and keep the target DOM node mounted. Repeated registration, language changes and same-draft background refetches do not reopen Paddle.
- `actionBusy`, `statusBusy`: independent locks. `checkStatus()` can verify identity and fetch company-scoped facts during a pending action; status clicks coalesce. An unresolved mutation cannot retry or replace until server facts establish a resumable draft or a cleared reservation. A cleared reservation can prepare again only after fresh owner/lifecycle checks.
- `changePlan(selection)`: replaces through the existing prepare endpoint, holding the action lock and tearing down the old frame. It is disallowed during payment or an unknown outcome. `tryAgain()` retries script/frame setup; existing drafts keep their transaction ID.
- Mount work is deferred past StrictMode effect replay, verifies the fresh owner and lifecycle, loads the SDK before any prepare, then rechecks owner and facts. Lifecycle reads reuse the owner/company QueryClient key; subscription access is never changed locally.
- The frame watchdog waits 20 seconds for `checkout.loaded`. Raw Paddle subscription reads only the installed SDK's `checkout.payment.initiated` name and matching transaction ID to enter `paying`; no raw payload is retained. A missing payment result uses the existing 20-second confirmation deadline and becomes `unresolved`, offering a status read.
- Owner/unmount/draft teardown aborts private work, removes listeners/timers and closes the owned frame. Frame/session generation guards discard retained callbacks, late responses and other-transaction events. Online/offline events preserve a ready form and make interrupted mutations status-first.

`useCheckoutSession.test.tsx` exercises the controller with mocked API and Paddle seams, fake deadlines and a real in-memory QueryClient. It uses no application database, CDN or provider account.

### Source `22-activation-polling.md`

### Spec 22 — Activation polling

`frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts` exports `useCheckoutConfirmation()` for the activation screen in spec 35. It requires the existing QueryClient provider and `useAuth` owner identity; it does not mount the old lifecycle poll.

- Returns `status` (`waiting`, `slow`, `timedOut`, `active`, `denied`), `lifecycle` (the latest successful result in this run, initially `null`), and stable `retry()`.
- Exports `CheckoutConfirmationStatus` and `CHECKOUT_CONFIRMATION_TIMING`: first request after 2 seconds, then 3, 5, 8 and repeated 13-second gaps after settlement. Independent watchdogs report slow at 20 seconds and stop at 120 seconds from the start of the run, even if a call ignores cancellation. Requests never overlap within a run.
- Calls spec 12's `confirmBillingCheckout(signal, companyId)`. Every accepted response updates the existing `billingLifecycleKey(companyId, ownerId)` cache, including `PROCESSING`, `NOT_PAID` and `NO_CHECKOUT`. Transient errors keep polling within the same window; HTTP 401/403 stops as `denied`.
- Reports `active` only for a fresh server `ACTIVE` outcome with workspace access allowed and an active, unsuspended company. Cached facts and browser checkout events cannot trigger activation. The hook never modifies lifecycle access fields.
- Only an authenticated `ADMIN` with company and owner IDs can poll. Owner, company or role changes synchronously tear down the old run and hide its state. A new owner gets a fresh window; non-owners receive `denied` without a call. Same-owner object/language rerenders preserve the current window.
- `retry()` aborts the previous run, clears its timers, resets the visible result and restarts both deadlines and the gap sequence. Late results and failures from stopped runs cannot update state or cache. Unmount aborts work and makes a retained retry callback inert. StrictMode effect replay leaves one polling loop.

`useCheckoutConfirmation.test.tsx` uses fake timers, mocked auth/API seams, a real in-memory QueryClient, and the real request deadline helper for cancellation/timeout coverage. No provider account, network or application database is required. The existing `queries.ts` poll remains unchanged for spec 40.

### Source `23-session-resilience.md`

### Spec 23 — Session resilience

#### Shared session error classification

`frontend/src/api/client.ts` exports `isSessionInvalid(error: unknown)`. It returns true for a 401, or a 403 with the existing `Account is deactivated` message or structured `SESSION_REVOKED` error. Network errors, 5xx, generic permission denials, `ACCOUNT_SUSPENDED` and `PASSWORD_CHANGE_REQUIRED` do not establish a lost session. The session query, application restore and refresh recovery share this classifier.

#### Session read and guards

`useGetCurrentUser` in `frontend/src/queries/auth.ts` retries an unconfirmed failure once after 500 ms. Confirmed session rejection and forced password replacement are not retried. `networkMode: 'always'` lets an offline session read fail into the retry screen instead of remaining paused indefinitely.

`frontend/src/App.tsx` keeps the Redux identity during an outage, blocks child routes until restoration is known and synchronized, and shows the existing `FlowShell` with translated outage copy, heading focus and a retry action. Confirmed rejection clears auth before child routes mount. The existing forced password screen remains available.

`GuestRoute` sends an authenticated ADMIN to `/continue` and MANAGER/STAFF to `/dashboard`, forwarding only a `state.from` accepted by spec 06's `isSafeFromPath`. `/continue` resolution remains owned by spec 40.

#### Refresh recovery

The shared Axios client allows one refresh per concurrent group of expired requests. If refresh fails, it re-reads `/common/get-current-user` once with refresh disabled for that probe. A successful probe recovers the original session read directly or allows each other original request one replay. Only a confirmed probe rejection clears auth; temporary probe failures are forwarded for retry. The shared promise is released after either result. No session credentials or provider data are logged.

#### Test seams

- `frontend/src/App.test.tsx`: real QueryClient, Redux and router with a mocked auth API; covers retries, offline startup, outage recovery, sign-out, stale-data rejection, forced password replacement, Urdu, safe return paths and role destinations.
- `frontend/src/api/client.test.tsx`: real Axios interceptors with a synthetic adapter and Redux; covers a lost refresh response, concurrent recovery, confirmed versus unconfirmed rejection, bounded replay, later recovery and existing multipart credentials.

All tests use synthetic data. No real database, Paddle, migration, deployment or application end-to-end run is needed for this spec.

### Source `24-order-summary.md`

### Spec 24 — Order summary

`frontend/src/pages/Subscription/onboarding/OrderSummary.tsx` exports default `OrderSummary`, `OrderSummaryProps`, and `OrderSummaryTotals`.

- Render inside `FlowShell` and a router. Uses the existing language context, approved dictionary, `flow.css` helpers and closed colour tokens. No stylesheet or shared dictionary changes.
- Pass `plan: { name, limits }` using the catalog plan definition and the saved `interval: 'month' | 'year'`. Capacities are never hard-coded. Caller owns placement above the card form below 1024px; this component hides capacities and the security note there and becomes sticky at 1024px.
- `totals` accepts `{ currencyCode, totals?: { subtotal?, tax?, total? }, recurringTotals?: { total? } }`. Every amount is a string in the smallest currency unit, formatted only by `formatBillingPrice`. Current-purchase and renewal totals remain independent. Missing/invalid amounts show skeletons; explicit provider zero remains zero.
- `fallback` defaults to false. The caller ends its bounded wait by setting it true. Missing totals become “Calculated by Paddle”; only the renewal line may use `catalogPrice: { amount, currencyCode, interval }`, and only when its interval matches. Received provider totals still win. No catalog price is substituted for tax, subtotal or due today.
- `hideChangePlan` removes the link while paying/replacing. `changePlanHref` defaults to `/choose-plan`. Link navigation uses React Router without a document reload.
- All amounts and capacity numbers use `bdi dir="ltr"`, including fallback prices in Urdu. The component performs no network calls, provider initialization, timers, card handling or access decisions.

Integration boundary for spec 37: `useCheckoutSession.CheckoutTotals` currently preserves numeric SDK amounts, as recorded by specs 13 and 21. Do not pass those directly or guess their units. The summary contract follows spec 24's exact minor-unit strings; the composing caller must supply amounts whose units have been established. Fetching/conversion and payment-page wiring are outside this component's ownership.

`OrderSummary.test.tsx` contains 20 component tests for loading, exact totals, safe fallback, missing/invalid amounts, explicit zero tax, annual and zero-decimal pricing, change-plan visibility/destination, Urdu isolation, and compact responsive hooks. Responsive hooks are checked in JSDOM, not a browser layout engine.

### Source `25-paddle-frame.md`

### Spec 25 — Inline Paddle frame

`frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.tsx` exports the default `PaddleCheckoutFrame` and `PaddleCheckoutFrameProps`.

- Pass `registerFrameTarget` directly from `useCheckoutSession`. The component registers the constant class name `paddle-checkout-frame` in a layout effect and releases it with `null` on unmount. Keep the callback stable and mount only one checkout frame on a page. React StrictMode deliberately replays registration/cleanup during development.
- Pass `ready` only after the controller has observed `checkout.loaded`; keep it true while the loaded form remains usable (including payment/decline states). The component opens no checkout and makes no provider or network calls.
- The target remains the same empty React-owned element across rerenders, readiness and language changes. Paddle owns its inserted children; the component never reads inside an iframe.
- Loading shows the shared `.flow-skeleton` blocks and the existing English/Urdu loading label. The target remains measurable but invisible, inert and hidden from accessibility until ready. Readiness applies `.flow-frame-ready` to its container, reusing the 240ms fade and 120ms reduced-motion rule from `flow.css`.
- The slot and target reserve 450px minimum height and 312px minimum width, fill available width, remain LTR and allow content to grow without clipping the Paddle footer. Compose inside `FlowShell` and retain at least 312px usable width on phones; it supplies the shared flow styles and tokens.

`PaddleCheckoutFrame.test.tsx` covers registration/cleanup, StrictMode, loading/ready states, English/Urdu continuity, provider-owned child preservation, no cross-origin reads and sizing/overflow hooks. These are DOM tests, not real Paddle layout evidence.

### Source `26-prepare-checkout.md`

### Spec 26 — Prepare and replace checkout

#### Checkout service

- `backend/src/services/billingCheckout.service.ts` exports `createBillingCheckout(actor, raw, deps?) -> Promise<BillingCheckoutDto>` for specs 36/39 to adopt. The legacy lifecycle service and HTTP wiring remain unchanged within their owners' scope.
- Input is strictly `{ plan, interval }`. Every request checks the active company owner, suspension, live email verification, billing activation, checkout URL, trial-free catalog and linked-subscription guards. Linked subscribers receive 409 directing them to the billing portal.
- Dependencies accept `db`, `now`, and the gateway's customer, product, price-read and transaction create/get/update surfaces. The defaults use the shared lazy gateway and catalog reader. Customer provisioning delegates to `ensureBillingCustomer`; all reservation reads/writes use the shared facts service.
- New drafts send `customData: { checkoutReservationId }`, one configured price at quantity 1, automatic collection and the configured checkout URL. The reservation commits before the provider create. READY is appended under the company lock after fresh authorization and customer-link checks. No subscription access or transaction mirror is written here.
- Results always include `{ transactionId, reused, replaced }`. A matching open draft is verified by an exact provider read and reused. Paid/billed/completed provider or mirrored transactions return 409 with `CHECKOUT_PAID`.
- Replacement holds the company row lock through the exact provider read, `transactions.update(id, { status: 'canceled' })`, CANCELED fact and new reservation. Its transaction timeout is 40 seconds to accommodate two 15-second gateway deadlines. Provider creation runs after that transaction commits. This serializes competing replacements across API processes without an in-memory mutex.
- Reads and cancellation acknowledgements must match the saved transaction, canonical customer and reservation custom data when present. A cancellation must prove `canceled` with no subscription before a new reservation can be made. Uncertain reads/cancels append nothing and return 503. A later exact read may establish that a lost cancellation actually succeeded.
- Proven create `REJECTED`/`RATE_LIMITED` responses append `CHECKOUT_FAILED` and permit retry. Uncertain errors, deadlines, invalid success responses and lost READY persistence retain the open reservation. Recovery of open reservations remains with spec 28.

#### Verification seam

- `backend/src/services/billingCheckout.service.test.ts` exercises the real customer, catalog and facts helpers with one shared stateful database/provider fixture. The fake serializes on `FOR UPDATE`, rolls back local writes and preserves remote effects independently.
- Covers concurrent prepares/replacements, reuse, plan/interval replacement order, paid/cancel races, lost cancel responses, rejection retry, create/cancel gateway deadlines, late success, authorization, tenant/customer/reservation correlation, trial rejection and persistence rollback. No real Paddle or database access is required.

### Source `27-confirm-checkout.md`

### Spec 27 — Server confirmation of a paid checkout

- `backend/src/services/billingConfirm.service.ts` exports `confirmBillingCheckout(actor, deps?)`, returning the shared `BillingConfirmDto` (`{ outcome, lifecycle }`). It accepts the authenticated `VerificationActor` and optional `db`, `provider`, `now` and safe `log` dependencies. The caller supplies no transaction, customer, company or subscription selection from a request body. Spec 39 owns HTTP wiring and strict empty bodies.
- Reuses `readBillingReservation` for the current company's latest checkout reservation, correlated terminal fact, configured selection and transaction-mirror ownership checks. An open newer hold never falls back to an older READY. No reservation/failed checkout returns `NO_CHECKOUT`; canceled checkout returns `NOT_PAID`; unresolved/mismatched facts return `PROCESSING`.
- Reads only the saved READY transaction through `billingProvider.transactions.get`. Checks exact transaction/customer/reservation IDs, matching company metadata when present, exactly one item, quantity one and the exact reserved configured price. `draft`, `ready` and `canceled` return `NOT_PAID`; `paid`, `billed` and `completed` without a subscription return `PROCESSING`; other statuses grant nothing.
- Reads the transaction's exact subscription through `billingProvider.subscriptions.get`. Checks identity, customer and one recurring item of quantity one at the same configured price. A failed provider read throws a sanitized `ApiError(503)` and never proves nonpayment or clears a reservation.
- Rechecks owner, canonical linkage and latest READY under the Company lock after provider reads, then calls `applyPaddleSubscription` in that transaction using its callback database seam. Only shared fulfilment writes subscription/access facts. It retains provider version ordering, idempotence and administrative restrictions, without synthesizing webhook markers or reservation facts.
- Every successful service response uses a fresh `getBillingLifecycle` read. Only successful fulfilment followed by `workspaceAccessAllowed === true` returns `ACTIVE`; inactive, suspended or ineffective subscriptions remain `PROCESSING`.
- Mismatches emit `BILLING_CONFIRM_MISMATCH` with fixed `providerCode`, company ID and reservation ID only. Provider payloads, customer/transaction IDs, emails and card fields never enter those logs.
- `backend/src/services/billingConfirm.service.test.ts` uses real SDK entities and injected, transactional in-memory tables to exercise the real reservation reader, shared fulfilment and lifecycle/access policy together. No provider client or SQL database is used.

### Source `28-reconcile-reservations.md`

### Spec 28 — Repair stuck reservations

#### Reconciliation service

- `backend/src/services/billingReconcile.service.ts` exports `reconcileBillingReservations(actor, deps?) -> Promise<BillingReconcileOutcome>`. Dependencies accept `db`, a read-only customer/transaction `provider` surface, and `now`. The route can compose the outcome with a fresh lifecycle read; route wiring stays with spec 39.
- Uses spec 09's `readBillingReservation` and `recordBillingReservationFact` for every hold read and fact write. An open reservation inside the shared 120-second grace returns `IN_PROGRESS` without provider reads or mutations. Existing closing facts give stable outcomes without repeating provider searches.
- Customer recovery requests the exact owner email with both active and archived statuses. Exhaustive, unique reservation metadata recovers READY; legacy adoption requires an exact case-insensitive email, active customer, safe tenant linkage, and sandbox or verified owner. Conflicts append `CUSTOMER_CREATE_FAILED` with `EMAIL_CONFLICT`; exhaustive absence appends `NOT_FOUND`. Duplicates, incomplete results and failed reads remain `UNRESOLVED`.
- Follows spec 17's customer linkage and mirror preservation rules. Its create-capable `ensureBillingCustomer` is deliberately not called: reconciliation performs provider reads only and must recover the existing hold. Customer mirror/link/READY commit together under the Company lock.
- `BILLING_RECONCILE_MAX_PAGES = 10`. Transaction searches reuse the shared gateway's five-page batches, continuing from the final transaction ID with `after` and `orderBy: 'id[ASC]'`. The service exhausts the listing before accepting one `checkoutReservationId` match. Cap exhaustion, duplicate matches/rows, uncertain reads and unsafe correlation stay unresolved.
- Draft/ready matches atomically mirror the transaction and append `CHECKOUT_READY` with `confirmedByProvider: true`, returning `RESUMABLE`. Paid/billed/completed use the same evidence and return `PAID`. Canceled matches append `CHECKOUT_CANCELED`; exhaustive absence appends `CHECKOUT_FAILED` with `NOT_FOUND`; both return `CLEARED`. Newer webhook mirror versions are preserved.
- Active owner and company scope are checked under the Company row lock before reads and again before writes. Provider reads run outside database transactions. A changed reservation, email or canonical customer cannot be finalized using stale evidence. Mirror/link/fact writes roll back together on failure.
- No Paddle create, update or cancel calls, subscription linkage, subscription access writes, migrations or schema changes.

#### Verification seam

- `backend/src/services/billingReconcile.service.test.ts` uses the real reservation helpers, injected provider and clock, and a stateful database fake with lock serialization and rollback. Covers grace, all recovery outcomes, legacy adoption, unsafe/foreign matches, pagination, duplicate detection, stable repeats, concurrent requests, newer webhook evidence, changed owner state and atomic persistence failures.
- Includes a real gateway with a fake SDK collection to verify exactly ten pages at the cap. Every focused test checks that provider create/update spies remain unused and no subscription is linked. No real database or Paddle calls are required.

### Source `29-login-screen.md`

### Spec 29 — Sign-in screen

- `frontend/src/pages/Login/LoginPage.tsx` composes the existing `FlowShell`, `Input`, `Button`, React Hook Form and `useLogin` mutation. Its email/password form has visible Show/Hide controls, recovery/signup/platform links, a security-completion notice, translated errors and an immediate duplicate-submit lock. It keeps the email after failures and clears only the password on HTTP 401. Error keys and interpolation values stay local so language changes update the visible message without losing the draft.
- The desktop worksheet reuses `.flow-worksheet`, `.flow-step-box`, completion attributes and the shared one-time/reduced-motion animation. Its example rows are `aria-hidden` and visibly labelled “Example day”; they represent no tenant data. `login.css` adds only screen-scoped layout using existing flow tokens.
- `frontend/src/pages/Login/types.ts` exports the role-free `LoginForm`. `api.ts` posts an explicit `{ email, password }` payload to `/common/login` through the existing client, preserving the existing auth response and cookie handling. `queries.ts` remains unchanged and retains cache clearing and Redux identity handling.
- Error handling supports incorrect details (400/401), `ACCOUNT_DEACTIVATED` in a top-level code or nested errors on 403, safe generic other 403, a numeric `Retry-After` wait on 429 (safe fallback if missing/invalid), and connection/service failures. No raw server diagnostic is rendered.
- `LoginPage.test.tsx` retains existing signup/session regression cases and covers unified owner/staff login, validation, error categories, password clearing, duplicate submission and retry, keyboard control order/focus, Urdu direction and live language changes, notices and hidden worksheet examples. No additional shared primitive or routing policy was introduced.

Integration note: the current spec 20 backend sends deactivation as an uncoded 403. This screen deliberately requires `ACCOUNT_DEACTIVATED` to show the specific deactivation text; uncoded responses receive the generic account-unavailable message. Backend changes are outside spec 29 ownership.

### Source `30-signup-screen.md`

### Spec 30 — Create account screen

#### Signup screen

`frontend/src/pages/Signup/SignUpPage.tsx` rebuilds the owner signup form with the shared `FlowShell` (`size="split"`, `step="account"`), existing Button/Input primitives, scoped flow styles and registered English/Urdu copy. The desktop worksheet explains account, plan, card and workspace; the shell supplies mobile progress and RTL/reduced-motion behavior.

The form keeps its draft and input identity through errors and language changes. It validates required/whitespace fields, email and the eight-character password minimum, includes a Show/Hide password control, associates validation errors with inputs, and guards duplicate submissions. `EMAIL_EXISTS` offers sign-in, HTTP 400 field errors stay beside their fields, and 429 displays the server's numeric Retry-After countdown (or a safe generic wait). A durable account without a session replaces the form with a sign-in receipt, preventing another signup.

#### Signup transport and session handling

- `signupFailure` in `frontend/src/pages/Signup/api.ts` decodes the public error contract into duplicate-account, retry wait and allowlisted field errors. Duplicate detection uses `EMAIL_EXISTS` in the top-level code or errors list, never message text. Only HTTP 400 validation messages are shown; unexpected error messages remain private.
- `useCreateManager` in `frontend/src/pages/Signup/queries.ts` keeps existing auth/cache/session handling and uses `parseOnboardingQuery` to carry only valid, unambiguous `plan` and `interval` values to `/choose-plan`. Sign-in links preserve the same allowlisted selection, including when session delivery fails. No plan choice is sent as a registration/access grant.

#### Verification seams

`SignUpPage.test.tsx` exercises the real signup hook/API with a mocked HTTP client, including validation, draft continuity, duplicate codes, field errors, double submission, session failure, Urdu/focus continuity, password reveal and rate-limit waits. `queries.test.tsx` independently verifies session/cache behavior and query allowlisting. No database or Paddle is involved.

### Source `31-account-recovery-screens.md`

### Spec 31 — Account recovery screens

`frontend/src/pages/Account/AccountPages.tsx` retains `SecurityShell` as the single local wrapper. Its explicit `publicPage` option renders the existing `FlowShell` at `size="narrow"`, without setup progress. Public owner recovery, email verification and password reset opt in, even when an identity is signed in. Own-password security (including forced replacement) continues to use the existing `AuthShell`; company settings retain their existing settings layout.

Public screens reuse the shared flow field, button, notice, typography and spacing styles, existing Button/Input primitives, language context and English/Urdu dictionaries. Recovery uses the approved neutral receipt and keeps the manager/staff direction to ask the company owner. Missing or rejected links provide recovery/settings actions. The shell retains heading focus, language controls, sign-in navigation and public document titles.

No new API, token helper, exported wrapper or design token was created. `ownerLinkToken`, explicit completion requests, password validation, credential clearing and private-query clearing remain in their existing paths. Reuse these screens rather than adding another recovery flow.

`AccountPages.test.tsx` covers public versus signed-in presentation, neutral recovery, invalid-link actions, Urdu/LTR email, explicit token completion, session/cache clearing and existing company-settings behavior.

### Source `32-staff-web-handoff.md`

### Spec 32 — Staff web handoff

`frontend/src/routes/launchPages.tsx` retains `StaffWebHandoff` as the local staff destination used by the existing `WorkspaceAudience` guard. It now uses `FlowShell` at `size="narrow"`, with no onboarding progress, and the approved English/Urdu message directing attendance and cleaning tasks to the company-provided Android app.

Reuse this destination through `WorkspaceAudience`; no second staff guard, shell, download helper, translation dictionary or logout hook was created. The screen reuses `serviceInformation()` for the approved Android link, `useLogout()` for sign out, and the shared flow typography, spacing, buttons and notices. It retains signed-in identity isolation, the Android information link, company guidance when distribution is unavailable, pending sign-out feedback and retryable sign-out errors.

`frontend/src/routes/launchPages.test.tsx` covers the narrow staff shell, English/Urdu instructions, configured/unavailable distribution, sign out and its pending/error states, alongside existing owner/manager routing and route-error coverage.

Verified 2026-11-10: 30 focused route tests and the whole frontend suite (88 Node + 2,108 Vitest tests) passed; frontend types, lint and build passed. No additional reusable component or helper was needed beyond the shared dependencies listed above.

### Source `33-plan-screen.md`

### Spec 33 — Choose plan screen

`frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx` rebuilds owner plan selection inside `FlowShell` (`size="plan"`, `step="plan"`). Reuse this page for `/choose-plan`; subscriber settings and payment remain separate screens.

- Starter, Pro and Enterprise ledger rows use `useSubscription().availablePlans` for descriptions and allowances, `useBillingCatalog()` for prices, `billingPlanDefinition` for the Enterprise label, and `formatBillingPrice` for exact amounts. Missing, invalid or duplicate prices cannot be selected for payment.
- `parseOnboardingQuery` allowlists initial plan and interval independently. Selection falls back to the saved server draft, then Starter/month. A changed draft selection displays the replacement notice; Continue carries only plan and interval to payment and makes no billing mutation.
- A labelled native radio fieldset supports arrows, wrapping, Home/End, disabled-option skipping, one enabled tab stop and mirrored horizontal arrows in Urdu. Amounts and capacities stay LTR. Desktop column headings become per-row capacity labels on phones.
- Monthly/Yearly uses the shared interval control. Included features use a disclosure. Initial loading has three row skeletons; errors and empty intervals offer retry; partial intervals retain unavailable rows. Background requests preserve radio identity, selection, enabled controls and focus. The decision bar is sticky on phones.
- Existing `flow.css` classes supply all flow colours and motion; layout utilities compose the ledger without inline styles or stylesheet changes. This spec introduces no new shared helper or design token.

`BillingPlanPage.test.tsx` provides synthetic API fixtures and 30 focused cases, including keyboard/RTL, URL tampering, drafts, incomplete data, loading/error/retry and background refetch behavior. No provider or database is used.

### Source `34-public-pricing.md`

### Spec 34 — Public pricing links and trial copy

- `frontend/src/pages/Pricing/PaddlePricing.tsx` reuses `TIERS`, `ONBOARDING_ROUTES`, and `useBillingCatalog`. Native Monthly/Yearly radios carry only the allowlisted `STARTER`/`PRO` plan and `month`/`year` interval into signup. Owner links use `/continue`; managers, staff, and parent-disabled purchases get an explanation instead of a purchase link.
- The internal `OwnerEnterprisePlan` reads the existing owner-scoped catalog only for eligible owners. It offers `/continue` only when `ADVANCED` exists for the selected interval; missing, pending, or failed catalog reads retain the existing `EnterprisePlan` inquiry. Visitors do not request the private catalog. No provider price IDs or guessed prices are used.
- `WorkspaceLink` in `frontend/src/components/marketing/MarketingCTA.tsx` now uses shared onboarding route constants and sends signed-in visitors through `/continue`.
- `frontend/src/i18n/billingTranslations.ts` supplies Urdu for the updated pricing notice, plan CTA, and Enterprise availability. Historical `Trialing` remains translated.
- `frontend/src/pages/Pricing/PaddlePricing.test.tsx` adds 21 isolated component cases for plan/interval URLs, role restrictions, Enterprise catalog availability, trial-free English/Urdu pricing copy, historical status translation, marketing CTA destinations, and the complete pricing page for visitors, owners, managers, and staff. The catalog hook is mocked; no provider or database is needed.

Verified 2026-11-10: 21 focused pricing tests and the full frontend suite (88 Node + 2,125 Vitest tests) passed; type check, lint, and production build passed.

### Source `35-confirmation-screens.md`

### Spec 35 — Confirmation screens

#### Activation page

`frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx` exports the default `BillingActivationPage` for the activation route. It requires the existing router, language and QueryClient providers. It consumes `useCheckoutConfirmation()` directly; it adds no polling loop, provider call or lifecycle query.

- Reuses `FlowShell`, `Button`, the onboarding dictionary, `.flow-step-box`, `.flow-confirming-ring`, `.flow-ready-stamp` and the shared reduced-motion rules. No new CSS, colour tokens, translations or storage are introduced.
- Presents Payment received, Activating your subscription and Preparing your workspace. A qualified active server subscription completes the first two rows together. An unknown subscription or `CONFIRMING` step alone never claims payment receipt. Workspace completion appears only on Ready.
- The hook supplies the 20-second slow notice and 120-second timeout. Check again invokes its `retry()`. A terminal active result without an explicit `WORKSPACE` step also offers retry, preventing an indefinite inactive wait.
- Ready requires a fresh hook `active` result, explicit server `WORKSPACE`, allowed workspace access and an active, unsuspended company. It shows the stamp, server plan and interval, renewal date in UTC and an explicit `/dashboard` link. Missing renewal information and scheduled changes show Not available.
- Denied offers `/login`. Restricted shows the restriction and `/help`; neither exposes workspace entry. Status text uses `role=status`. The shell focuses the heading on entry and step changes, and mirrors the page in Urdu.
- Routes only from the current confirmation outcome. `NO_CHECKOUT` immediately replaces the route with `/choose-plan`. Two consecutive `NOT_PAID` reads replace it with `/subscription/payment`, or `/choose-plan` when the latest server step is `CHOOSE_PLAN`. A single unpaid read, `PROCESSING`, failed reads and timeout remain on confirmation; denial and restriction take precedence. Return URL parameters never select the destination. Nothing is derived from cached access or browser checkout events.

#### Additive confirmation-hook fields

`frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts` extends the existing hook with:

- `outcome`: latest accepted, company-scoped `BillingConfirmOutcome`, initially `null`.
- `consecutiveNotPaid`: consecutive accepted `NOT_PAID` count in the current run, initially `0`. Any other accepted outcome resets it. Failed reads and foreign-company responses also break the streak without replacing the latest accepted outcome.
- Both fields clear on retry and synchronously hide on owner/company/role changes. Late responses from a prior run cannot populate them. Cached lifecycle facts do not initialize either field.
- The existing statuses, request gaps, 20/120-second watchdogs, cache keys and stable `retry()` remain unchanged. Routing stays in the page; the hook continues polling for unpaid outcomes when used on its own.

#### Test seam

`BillingActivationPage.test.tsx` uses the real confirmation hook and an in-memory QueryClient, fake timers, mocked auth/API boundaries and a mocked Paddle SDK for the completion-event regression. Coverage includes slow/timeout/retry, ready guards, outcome redirects, single unpaid reads, streak reset by processing/failure, reload, owner isolation, denial, restrictions, Urdu and shared reduced-motion CSS. JSDOM checks the motion hooks and stylesheet override; it does not verify browser layout or computed animation.

`useCheckoutConfirmation.test.tsx` verifies the additive fields, counter reset, retry/identity isolation and ignored foreign/late responses alongside the original timing, cancellation and cache regressions. Neither test file calls real Paddle or a database.

The existing composer tests in `SubscriptionPage.test.tsx` were updated under the guide's test-only exception for the new heading/action labels and fresh confirmation requirement. No application code outside Owns was changed.

### Source `36-lifecycle-assembly.md`

### Spec 36 — Lifecycle assembly

- `backend/src/services/billingLifecycle.service.ts` keeps `getBillingLifecycle(actor, { db?, now?, provider? })` as the owner-scoped local status reader. It now always returns `onboardingStep` and `recoveryReason` from `decideBillingOnboardingStep`, alongside every existing DTO field. Access still comes from `evaluateAccountAccess` applied to the exact correlated subscription returned in the DTO; choosing a step never grants access.
- Reservation and checkout inspection delegate to `readBillingReservation` and `inspectBillingCheckout`. Open holds (including the in-flight grace period), missing canonical customer mirrors and the latest customer `EMAIL_CONFLICT` fact drive recovery. Proven ordinary failures/cancellations permit plan selection; newer customer reservations supersede historical conflicts.
- A paid/billed/completed mirror for the exact latest validated READY transaction selects `CONFIRMING` while access is pending. Foreign or unrelated mirrors cannot select confirmation or grant access. Linked subscriptions without access select `ACCOUNT`; qualified current active/trialing windows select `WORKSPACE`; administrative restrictions win.
- Lifecycle reads use local configuration checks, mirrors and audit facts only. They do not initialize Paddle, fetch its catalog or write facts. Configuration readiness is the only catalog capability available locally: provider prices/products/trial metadata are validated by the shared catalog reader and checkout preparation, with no additional local price cache or mirror introduced.
- `getBillingCatalog` and `createBillingCheckout` are direct re-exports of the spec 15 and spec 26 implementations, preserving route import paths. Their injected dependencies follow those modules' contracts. No customer, catalog, checkout or reservation-write implementation remains in the assembly module.
- `createBillingPortal` retains strict input, owner/customer scoping, subscription selection, sanitized failures, HTTPS Paddle-host validation and transient URL behavior. Its default provider uses the existing shared billing gateway; the injected provider factory remains available for portal tests. Sandbox onboarding still allows unverified owner email without changing verification state.
- `backend/src/services/billingLifecycle.service.test.ts` covers assembly, ordered decisions, local-read safety, tenant correlation, entitlement windows, configuration, portal behavior and the existing SDK signature/router-boundary checks. The moved operations retain their dedicated catalog/customer/checkout/reservation suites; assembly tests assert that the public re-exports are those exact shared functions.

### Source `37-payment-screen.md`

### Spec 37 — Payment screen

`frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx` composes the owner payment screen using `FlowShell` (`wide`, payment step), `useCheckoutSession`, `PaddleCheckoutFrame`, and `OrderSummary`.

- Resolves the scoped server draft before the existing `parseOnboardingQuery` allowlist. Missing, invalid, or ambiguous URL selections without a draft return to `/choose-plan`. Owner changes remount the scoped session; catalog/lifecycle/subscription background reads and language switches retain the frame target.
- Retains the screen's configuration guard: missing or mismatched browser/server environment or token prevents session initialization and offers a retry. Test-mode tag, test-card box, Copy action, and extra-card disclosure require matched sandbox settings. The test numbers are public fixtures; no application card inputs or app-owned payment action exist.
- Maps every controller state into an announced notice or bounded loading state, including declined, offline, resumed, processing, replacing, failed form, unresolved outcome, and restriction. Frame retry uses the action lock; status checks use the independent status lock. Allowed change-plan links preserve plan and interval. Confirmation navigates to `/subscription/activation`, never directly to workspace access.
- Displays the shared summary above the form below 1024px and beside it at larger sizes. Uses existing closed design tokens and translations, including the Urdu explanation that Paddle's form is English. Removes the old inline stylesheet and shared busy flag.
- Adapts SDK major-unit numeric totals into the summary's exact minor-unit strings using `formatBillingPrice` for currency precision. Missing, negative, nonfinite, overprecise, unsupported-currency, or unsafe amounts remain unavailable; conversion never rounds or fabricates tax. See [Paddle's inline-checkout guide](https://developer.paddle.com/build/checkout/build-branded-inline-checkout/) and [checkout.loaded schema](https://developer.paddle.com/paddle-js/events/checkout-loaded/). REST catalog amounts remain minor-unit strings. Loading uses summary skeletons, then the shared explicit catalog-renewal fallback.

The screen's helpers remain private to avoid creating another checkout or summary API. `BillingPaymentPage.test.tsx` covers state composition with the real frame and summary; the existing `SubscriptionPage.test.tsx` payment cases exercise the real controller with mocked API/Paddle seams under the guide's test-only exception. No real provider, CDN, database, or payment is needed for these tests.

### Source `38-recovery-screen.md`

### Spec 38 — Recovery screen

`frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx` is the owner-scoped recovery screen using the existing narrow `FlowShell` at the Card step. It reuses the scoped lifecycle query, time-limited `reconcileBillingCheckout` transport, shared Button, Urdu dictionary and `getPublicSupport`.

- On `RECONCILE`, sends one request per attempt, retaining the promise through React StrictMode effect replay and ordinary rerenders.
- `RESUMABLE`, `CLEARED` and `PAID` navigate with replacement to payment, plan selection and activation respectively. Restricted response facts prevent navigation; a fresh lifecycle restriction overrides an earlier in-progress response and stops retries.
- `IN_PROGRESS` retries after 2, 5 and 10 seconds, then stops with Check again. An explicit check permits one more attempt after this limit. Transport deadlines bound each request. Unmount clears retry timers; owner changes remount the screen and ignore old responses.
- `UNRESOLVED` and request failures offer Check again without revealing private errors. Missing, foreign or failed lifecycle reads require a lifecycle retry before any reconciliation.
- Disabled billing and unavailable prices offer Try again to refetch lifecycle. Restrictions offer support. Conflicts offer support and signup with another email. Support uses the public configured email, with `/help` as the unavailable-contact fallback.
- Uses approved copy without unproven charge claims or reset controls. Headings receive focus on recovery state changes; the shared shell supplies responsive, RTL and reduced-motion styling.

`BillingRecoveryPage.test.tsx` contains 26 isolated cases covering outcomes, retry bounds, StrictMode, focus, restrictions, unavailable states, support, Urdu, owner changes, unmount and denied roles. API and support calls are mocked; it requires no Paddle, database or app server.

### Source `39-billing-routes.md`

### Spec 39 — Billing HTTP routes

- `backend/src/routes/billingLifecycle.route.ts` retains the existing owner-only router under `/subscription/manage`. All router responses, including authentication and service failures, carry `Cache-Control: private, no-store`.
- `POST /checkout` calls the spec 26 `createBillingCheckout` service directly, preserving its 201 response and `{ transactionId, reused, replaced }` data.
- `POST /checkout/confirm` accepts exactly `{}` and returns the spec 27 `{ outcome, lifecycle }` result in the existing 200 `ApiResponse` envelope.
- `POST /checkout/reconcile` accepts exactly `{}`, calls spec 28 `reconcileBillingReservations`, then reads `getBillingLifecycle` for the same authenticated owner and returns `{ outcome, lifecycle }` in a 200 `ApiResponse` envelope.
- Strict input uses Zod; service errors propagate to the existing shared error handler so stable codes remain available to clients. No request field selects a company or transaction. Lifecycle, catalog and managed portal adapters remain available; the webhook mount is unchanged.
- `backend/src/routes/billingLifecycle.route.test.ts` exercises local HTTP with real JWT verification, authorization and shared error handling, plus mocked Prisma and billing services. Covers owner session checks, manager/staff denial, strict empty bodies, all confirm/reconcile outcomes, fresh lifecycle composition, stable errors and no-store headers. Primitive JSON is rejected by the upstream JSON parser before the router runs.

### Source `40-route-composition.md`

### Spec 40 — Routes and workspace entry

#### Reuse

- `frontend/src/pages/Onboarding/FlowEntry.tsx`: `FlowEntry` resolves `/continue` from a fresh, owner-scoped lifecycle using `onboardingRouteForStep`. It honors `state.from` only for an authorized `WORKSPACE` step and only through `isSafeFromPath`. Non-owners continue to the existing dashboard/staff audience guard without reading billing.
- The same file exports `FlowEntryStatus`, the shared pending/retry presentation for entry, setup composition and the workspace gate. It reuses `FlowShell`, translated copy and `Button`; it never exposes raw errors or grants access.
- `frontend/src/pages/Subscription/onboarding/billingViewState.ts`: `deriveBillingViewState` now exposes `step`, derived from the validated server `onboardingStep` and current owner/read scope. Missing steps, failed/stale reads, mismatched identities and a PAYMENT without a saved draft cannot choose a destination. Subscription facts remain available for safe settings display; actions retain their server capability checks.
- `frontend/src/pages/Subscription/SubscriptionPage.tsx`: the route composer uses the single route map, refreshes lifecycle on pathname changes before redirecting, retains the real payment target across background reads and query-string/language changes, preserves explicit confirmation/Ready, and keeps subscriber billing settings (including restricted subscribers). Plan-selection and unpaid-plan-change navigation carry only allowlisted plan/interval values.
- `frontend/src/components/onboarding/WorkspaceGate.tsx`: unpaid owners follow the server step. Managers/staff retain the existing audience behavior, historical subscribers retain operational reads, and suspension/failed checks cannot mount operational children.
- `frontend/src/pages/Subscription/onboarding/billingRoutes.tsx`: registers `/continue`; `/welcome` aliases activation. All setup screens remain outside operational layouts and behind the existing session/role guards.
- `BillingSetupLayout` supports only `variant="settings"`. `useBillingLifecycle` and `useSubscription` no longer accept the legacy `poll` option; confirmation polling belongs to `useCheckoutConfirmation`. The obsolete `useBillingCheckout` overlay hook and its tests were deleted.

#### Verification seams

The focused route suite covers all nine server steps across all seven setup/entry URLs, reload and back navigation, workspace deep links, safe return paths, stale/error/missing/foreign data, session outages, historical access, subscriber settings, recovery-cache refresh and stable payment-target identity. API and Paddle boundaries use synthetic mocks; no real provider or database is needed.

The guide's test-only exception updates `BillingPlanPage.test.tsx` fixtures to supply the explicit server steps instead of relying on the removed legacy inference. No checks are removed or weakened.

### Source `41-configuration-runbook.md`

### Spec 41 — Configuration preflight and runbook

- `scripts/billing-flow-preflight.mjs` exports `checkBillingFlow(env?)` (fixed `{ name, status }` records) and `main(env?, output?)` (exit code 0/1), plus a guarded CLI. Run with Node's `--experimental-strip-types`; backend dependencies must be installed. Reuses `getPaddleCatalog` without initializing Paddle. Reads only supplied environment; no implicit dotenv, network or database access. Checks sandbox build/runtime environments, client token family, billing enablement, server credentials, catalog syntax, HTTPS default payment link and explicit proxy-hop syntax. Results/output contain no values; no provider state or deployed topology is proven.
- `frontend/tests/billing-flow-preflight.test.mjs` supplies synthetic-environment Node tests and CLI subprocesses. Included by the existing frontend test glob. Covers missing/mixed/valid setups, catalog/credential/URL/hop errors, name-only output and exit codes.
- `docs/implementation/saas-onboarding-runbook.md` is the current procedure for preflight, Netlify/Heroku variables, safe proxy trust, sandbox dashboard/trial preview/apply/read-back, localhost server confirmation despite Heroku webhooks, backend-first publication, rollback, APK rebuild and unused Compose limitations. No provider/deployment pass is asserted.
- `backend/SANDBOX_BILLING.md` points to the current runbook and replaces obsolete trial/overlay instructions with the trial-free inline flow and server fulfilment rules.

### Source `42-e2e-suite.md`

### Spec 42 inventory — end-to-end suite

Updated 2026-11-10.

- `frontend/e2e/fixtures.ts`: unified real `/common/login` helper; reusable synthetic sessions in the managed private runtime directory, removed with the child database; role/email validation before reuse; child-only SQL guard. Use `enter` for authenticated browser setup.
- `mockBilling(page)`: controlled inline Paddle script, a frame in the actual Paddle target, real event shapes, flat provider errors, declines, 3DS challenge, loaded watchdog, totals, reload-stable draft history, confirm/reconcile controls. No Paddle network or card processing. Pure controlled lifecycle facts are UI evidence only.
- `mockBilling(page, { persisted: true, customerMode? })`: runs the compiled application's actual checkout, lifecycle and confirmation services against the managed child with an injected provider. No dotenv checkout reads. Supports new customer, exact-email adoption, foreign ownership and a definite rejection followed by retry. Dispose this seam after un-routing the page. Account/draft/access assertions use PostgreSQL; the complete purchase test removes interception before its final dashboard reload.
- `frontend/e2e/seed.mjs`: independent unpaid, mixed-case legacy, deactivated, adoption, rejection and conflict owners, plus separate active owners for real unsafe-return sign-ins under the production rate limit. Existing operational and subscriber fixtures remain available.
- `frontend/e2e/saas-onboarding.spec.ts`: flow-contract cases with `S42` IDs, real signup/login, recovery/session/navigation assertions, EN/UR reflow, keyboard/zoom/reduced motion, shared-cookie refresh and owner access boundaries.
- `billing-onboarding.spec.ts`, `customer-auth-v5.spec.ts`, `sandbox-onboarding.spec.ts`, `billing-v5.spec.ts`: current inline-flow, unified auth, persisted controlled purchase and existing subscriber regressions. “Sandbox” in the filename does not mean real Paddle evidence.
- `backend/tests/billingLifecycle.integration.ts`: standalone Node test runner with real PostgreSQL and injected provider, guarded exclusively by `BILLING_LIFECYCLE_TEST_DATABASE_URL`; locks, append-only facts, replace, reconcile, canonical ownership, confirmation, event dedup/ordering, atomic rollback, historical trialing and restrictions. No default provider transport is permitted.

The spec Log maps all 57 flow rows to named checks and records counts, `FIX-n` application defects and the separate unrun real-card cases. Real Paddle needs a public webhook destination and remains open. No new application helper, runner, dependency, migration or fix spec was added.


Verification on 2026-11-10: managed headless suite **192 passed, 0 failed, 3 documented fixmes + 1 existing optional skip**; PostgreSQL integration **27 passed, 0 failed, 0 skipped**; frontend Node **96 passed**, frontend Vitest **2,342 passed**, backend Vitest **2,540 passed + 7 existing SQL skips**. Types, lint and frontend build passed. See the spec Log for advisories and the 57-row mapping.

### Source `43-verification-pass.md`

### Spec 43 — Verification pass

Updated 2026-11-10. This spec adds no application component, service, test, dependency or schema change.

- The canonical inventory is `specs-saas-onboarding/INVENTORY.md`. All numbered fragments 01–43, including this fragment, are folded there with source names and their full contents before removal. Historical staged-integration notes are superseded by the current integration map at the top.
- `specs-saas-onboarding/43-verification-pass.md` contains the clean-install command results, whole-suite counts, per-spec acceptance ledger, sixteen-invariant review, visual comparison and Findings. Its Findings entries are the authorized follow-ups; no new numbered specs are created.
- Reuse the existing guarded `frontend/e2e/run.mjs`, `fixtures.ts` and `backend/tests/billingLifecycle.integration.ts`. No second application E2E runner or replacement provider mock was introduced. Temporary verification launchers and screenshot probes outside the repository are audit aids, not supported application APIs or tests.
- The outside-numbered-set regression record is `specs-saas-onboarding/fixes/e2e-bug-fixes.md`: selected-plan intent travels once in router state, deactivation codes require a correct password, and CORS exposes Retry-After alongside X-Request-Id. Reuse the checkout controller's existing changePlan action.
- Real sandbox probe/trial-clear evidence remains historical in `docs/plan-project/saas-onboarding/research/sandbox-probe.md`. No real payment has run; controlled browser and injected-provider SQL checks never substitute for real Paddle acceptance.
