# Spec 06 — Next-step route map

**Status:** Not started
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Onboarding/onboardingRoutes.ts`, `frontend/src/pages/Onboarding/onboardingRoutes.test.tsx`, `specs-saas-onboarding/inventory/06-onboarding-routes.md`
**Reuses:** `ARCHITECTURE.md#lifecycle-dto-additions`, `frontend/src/pages/Subscription/types.ts` (spec 01)

## Goal

Give the app one pure function that turns the server's `onboardingStep` into a route.

## Scope

- Export the route constants, including `/continue`.
- Map every step to the table in `ARCHITECTURE.md`.
- Allowlist `plan` and `interval` query values, dropping anything else.
- Give an internal-path checker for a `from` deep link: it must be same-origin, start with one slash and not point at an auth or billing setup page.

## Explicit non-scope

- Calling this from pages → spec 40.
- Guard behaviour in `App.tsx` → spec 23.

## Reuse first

- Use the step type from spec 01. Do not re-declare it.

## Steps

1. Write the map as an exhaustive switch, so a new step fails type checking.
2. Write the query allowlist.
3. Write the deep-link checker.
4. Test each step, each bad query value and hostile paths such as `//evil.example` and `/\evil`.
5. Record what you created in `specs-saas-onboarding/inventory/06-onboarding-routes.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run frontend/src/pages/Onboarding/onboardingRoutes.test.tsx` passes and proves: all nine steps map correctly; tampered plan and interval values are dropped; external and protocol-relative `from` paths are rejected. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/06-onboarding-routes.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
