# Spec 42 inventory — end-to-end suite

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
