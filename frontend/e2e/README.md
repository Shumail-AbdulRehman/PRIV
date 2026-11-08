# Spec40 persisted browser suite

Install exact dependencies in backend/frontend, generate the backend Prisma client, then install Chromium with `npm exec --prefix frontend -- playwright install chromium`. Node24 was used for the recorded run.

Create a dedicated local PostgreSQL16 bootstrap named `priv_e2e_test` with a role allowed to create disposable child databases. Never point this suite at an application database. Run from the repository root, substituting the explicitly owned test port/user:

```sh
HYGENE_E2E_DATABASE_URL=postgresql://fixture@127.0.0.1:56442/priv_e2e_test npm run test:e2e --prefix frontend
```

The guard rejects absent, non-local, non-exact-name, production-mode and query-overridden targets before connecting. The runner creates a UUID-named child, applies all actual migrations, seeds synthetic company/site/role/history/review fixtures, compiles backend, browser tests and React, then starts real loopback API and built Vite servers on selected available ports. No route interception, existing server reuse, production environment inheritance or provider activation. Vite builds with envDir:false; the backend and unsafe-startup probe run from the fresh private directory, so checkout .env files are not loaded. Provider mirrors are synthetic SQL fixtures for local entitlement only. Each whole run uses a fresh database; cases run serially against it. API setup login is real authentication; tests explicitly marked UI login/registration use React forms. Some authorization/refresh/QR checks use the actual API directly and are not claimed as UI actions.

The runner drops only its generated child and removes its private manifest/temp directory on completion/failure. An OS crash may require an operator to identify an abandoned generated child before cleanup; never reset an unknown database. Browser output under `.artifacts/` is ignored and private to the invoking user. Credential-bearing cases disable trace/video/screenshots; Playwright error-context snapshots may still include synthetic personal/account data. Do not upload raw artifacts, cookies or temporary manifests. Publish redacted results only.

See `docs/implementation/E2E_RESULTS.md` for the flow-table mapping and `followups/E2E_DEFECTS.md` for the intentionally failing registration regression. A nonzero exit is expected while this real application defect remains unresolved; there are no expected-failure annotations, retries or skipped tests masking it. Missing device/provider success coverage is explicitly pending, not counted as passed.

## Billing onboarding coverage (spec62)

Billing screens now live outside the operational layout. `sandbox-onboarding.spec.ts` uses real signup/session plus an explicitly intercepted provider boundary. `billing-onboarding.spec.ts` covers plan/payment/confirmation/recovery, isolated SDK events, portal URLs, role changes and responsive EN/UR states. `billing-v5.spec.ts` retains real API/SQL lifecycle, counts, status/window absence, suspension and owner security checks; its obsolete monolithic markup/reference comparisons were replaced by behavioral assertions. `customer-auth-v5.spec.ts` recognizes the standalone signup shell; unrelated auth remains on its incumbent design.

`mockBilling` in fixtures.ts intercepts only named billing endpoints and the official SDK script, with valid synthetic DTO IDs and an initialized callback-capable overlay fixture. It is not card processing or signed provider delivery. Real stored reservation/entitlement behavior is separately proved by SQL60. No production flag/token/env values are inherited; the managed app still defaults to PADDLE_BILLING_ENABLED=false. Browser fixture output cannot satisfy deployed acceptance63.

The33 flow mapping and final command counts belong to specs-billing-onboarding/inventory/62-billing-e2e-suite.md. The operator-run Netlify same-origin cookie and real Paddle acceptance remain separately pending in the final verification report.
