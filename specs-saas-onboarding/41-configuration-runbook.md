# Spec 41 — Configuration check and runbook

**Status:** Done
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

- [x] `cd frontend && node --experimental-strip-types --test tests/billing-flow-preflight.test.mjs` passes and proves: missing, mixed and valid setups are reported, and no value is printed. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/41-configuration-runbook.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-10** — Implemented the offline, name/status-only preflight with injected environments/output and a guarded CLI. Reuses the actual backend `getPaddleCatalog` validator without initializing Paddle. Checks sandbox on both sides, `test_` client token, billing enablement, API key/webhook secret validation, catalog syntax, default payment link and explicit proxy-hop syntax. Added synthetic-environment and subprocess tests proving missing/mixed/valid results, validation failures, exit codes and value-free stdout/empty stderr.
- **2026-11-10** — Wrote the source-derived release runbook covering Netlify builds/redirects, Heroku settings and different direct/proxied hop counts, sandbox payment-link/webhook settings, separately authorized trial preview/apply/read-back, localhost confirmation through the exact saved transaction and shared fulfilment, backend-first publication, rollback, new APK requirement and unused Compose limitations. Replaced outdated trial/overlay instructions in `backend/SANDBOX_BILLING.md` with the current trial-free procedure and link. Added the inventory fragment and inspected it as nonempty. The new runbook is ignored by the blanket Markdown rule; used `git add --intent-to-add --force` for that owned file so the runner can see it, without modifying `.gitignore`.
- **2026-11-10** — All Done-when commands ran and passed in this session with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`: focused Node test **8 passed, 0 failed, 0 skipped**; `npm test --prefix frontend` **96 Node tests passed** (includes those 8) and **2,200 Vitest tests passed across 59 files**, 0 failures/skips. Whole-suite run used `VITEST_MAX_WORKERS=2`. Frontend `npx tsc -b --noEmit` and `npm run lint --prefix frontend` exited 0 with **0 errors and 0 warnings**; `npm run build --prefix frontend` exited 0. Existing Node mobile-translation module-type warning and Vite `PLUGIN_TIMINGS` advisory appeared in suite/build output; no out-of-scope changes were made to suppress them. `node --check scripts/billing-flow-preflight.mjs` and `git diff --check` also passed.
- **2026-11-10** — No real Paddle, database, migration, deployment, GitHub issue/PR, commit, branch operation, merge or push was performed. Live configuration, forwarding-header topology, credentials/provider terms, real checkout, signed delivery, deployed cookies and APK installation remain unverified; the runbook distinguishes syntax checks from that later authorized evidence. No test-only scope exception was needed. Status and progress remain unchanged per this run's instructions.
