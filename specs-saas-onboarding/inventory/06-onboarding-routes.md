# Spec 06 — Next-step route map

## Pure routing helpers

`frontend/src/pages/Onboarding/onboardingRoutes.ts` is additive. Pages and guards adopt it in their assigned later specs.

- `ONBOARDING_ROUTES` exports `continue`, `login`, `signup`, `choosePlan`, `payment`, `activation`, `recovery`, `workspace`, `account` and `security` destinations. `OnboardingRoute` is their literal value union.
- `onboardingRouteForStep(step)` imports `BillingOnboardingStep` from the existing billing DTO. Its exhaustive switch maps all nine steps to the architecture table. Missing (`null`/`undefined`) or invalid runtime steps return `null`, so callers must show retry rather than infer a destination. Extending the DTO step union causes a type error until this map is updated. A mapped workspace route does not itself grant access.
- `parseOnboardingQuery(search)` accepts a query string or `URLSearchParams`, returning a typed `OnboardingSelection` with only optional `plan` (`STARTER`, `PRO`, `ADVANCED`) and `interval` (`month`, `year`). Values are exact and case sensitive. Invalid values, duplicate keys and unrelated fields are dropped independently; the original params remain unchanged. This carries an initial selection only; a saved server draft still takes precedence.
- `isSafeFromPath(value)` is a string type guard for root-relative workspace deep links. It checks origin against a fixed, non-network URL base, rejects protocol-relative/absolute URLs, backslashes, control characters, malformed/ambiguous encodings and auth/setup destinations, and normalizes dot segments and encoded route names before matching. It excludes the entire subscription subtree, `/continue`, `/welcome`, public recovery links, account security and the separate platform area. Safe workspace query strings and fragments remain part of the original string. Callers must enforce role, tenant and workspace access separately, and only honor `from` after server authorization.

## Verification seam

`frontend/src/pages/Onboarding/onboardingRoutes.test.tsx` contains 142 tests covering all steps, absent/invalid steps, every valid selection, invalid and duplicate query values, caller immutability, safe workspace links, external URLs, protocol-relative/backslash/control-character attacks and auth/setup bypasses.

The owned `.test.tsx` file matches Vitest's `src/**/*.test.tsx` discovery pattern and runs in the normal frontend suite. Run it directly with `cd frontend && npx vitest run src/pages/Onboarding/onboardingRoutes.test.tsx`; no include or transform override is needed. Verified on 2026-11-09: 142 focused tests passed, with no failures or skips.
