# Spec 41 — Configuration check and runbook

**Status:** Not started
**Depends on:** Spec 16, Spec 39
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `scripts/billing-flow-preflight.mjs`, `frontend/tests/billing-flow-preflight.test.mjs`, `docs/implementation/saas-onboarding-runbook.md`, `backend/SANDBOX_BILLING.md`, `specs-saas-onboarding/inventory/41-configuration-runbook.md`
**Reuses:** `backend/src/config/paddle.ts`, `frontend/src/lib/paddle.ts` (spec 13), `frontend/public/_redirects`

## Goal

Let the user check that everything Paddle needs is configured, and give a clear release procedure.

## Scope

- A preflight reporting presence and validity by name only: sandbox mode on both sides, `test_` client token, catalog, webhook secret, default payment link, `TRUST_PROXY_HOPS`.
- Runbook: Netlify build settings, Heroku variables including the right hop count, Paddle default payment link, webhook destination, removing trials, and the deploy order.
- Runbook: how to test on localhost, where sandbox checkout works but webhooks go to Heroku, and why confirmation still works.
- State that the new mobile icons need a new APK build.
- Note that Docker Compose still lacks Paddle settings, which is not used for this release.

## Explicit non-scope

- Deploying → spec 42.
- Docker Compose changes → spec 43.

## Reuse first

- Never print a secret value.

## Steps

1. Build the preflight.
2. Test it with fake environments.
3. Write the runbook from the real code.
4. Replace outdated trial text in `SANDBOX_BILLING.md`.
5. Record what you created in `specs-saas-onboarding/inventory/41-configuration-runbook.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && node --experimental-strip-types --test tests/billing-flow-preflight.test.mjs` passes and proves: missing, mixed and valid setups are reported, and no value is printed. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/41-configuration-runbook.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
