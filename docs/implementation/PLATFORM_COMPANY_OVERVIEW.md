# Platform company overview — 31 October 2026

The user requested manager, staff and location totals for each company, a cleaner
platform dashboard, and temporarily hiding Inquiries, Service diagnostics and
Administrative audit. This is a focused, single-session refinement under the
plan-project exception, extending the existing Spec24/33 company workspace and
Spec35 navigation. No new numbered specification or design prototype is needed.

## Behavior and scope

- The company register and each company account display active managers, staff
  and locations, using real PostgreSQL relationships. Managers have role MANAGER;
  ADMIN company owners are excluded. Inactive records are excluded and the UI
  explains both rules. Zero is displayed honestly.
- Prisma selects filtered relation counts in the existing bounded company query.
  Explicit DTOs expose only aggregate numbers, never employee identities,
  credentials, photos or arbitrary relations. The existing operator authorization,
  no-store responses, pagination and company status concurrency checks remain.
- Company rows replace the technical account-version column with resource counts.
  Account details retain version metadata and add a three-part overview. Both
  layouts reuse approved blue/white tokens, responsive cards and English/Urdu.
- The three hidden screens are removed from company navigation and account
  shortcuts. Their previous URLs redirect to Companies, discarding old filters.
  Underlying authenticated APIs and original components remain available for a
  future explicit restoration. Platform security/sign-out remains accessible.
- No migrations, account provisioning, attendance, staff import, subscription
  entitlement, payment, identity-provider or tenant workspace changes.

## Implementation

Backend: `backend/src/services/platformCompany.service.ts`, existing summary DTO.
Frontend: `companyApi.ts`, `CompaniesPage.tsx`, `companies.css`,
`platformRoutes.tsx` and `platformCompanyTranslations.ts`.
Reusable count rendering is local `CompanyResources`, shared between register,
mobile records and account overview; no second fetch or state store.

## Verification

Targeted checks: 55 platform backend tests and 72 platform frontend tests passed,
including active-count query scope, separate company totals, zero counts,
English/Urdu labels, hidden navigation and old-URL redirects.

Full suites passed: backend1491 with7 existing skips; frontend64 Node and405 React
tests. The initial frontend npm wrapper consumed the worker option, so it was
stopped and the component suite was run directly with explicit maxWorkers1.
Completed heavy checks use nice15 and one test worker, sequentially.

Commands (backend/frontend directory as appropriate):

- `nice -n 15 npm test -- --maxWorkers=1` (backend).
- Frontend Node tests: the `npm test` first phase;64 passed. Components:
  `nice -n 15 node node_modules/vitest/vitest.mjs run --maxWorkers=1`;405 passed.
- `HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56443/priv_e2e_test HYGENE_E2E_LOCAL_PLATFORM=true nice -n 15 node frontend/e2e/run.mjs local-platform-login.spec.ts`.
  One real PostgreSQL/API/Chromium case passed, including independently queried
  per-company totals, active/inactive rows, owner exclusion, old-route redirects,
  account overview, login/logout and tenant/operator isolation. Strict browser
  TypeScript, backend TypeScript and isolated frontend build passed in the runner.
- Touched frontend modules passed ESLint. There is no backend lint script.

The disposable child database was removed (zero children remain) and its owned
test cluster was stopped. A bundled psql inspection failed due to a local libpq
symbol mismatch; the independent cleanup query succeeded through installed pg.
Both ordinary build commands also passed: backend `nice -n 15 npm run build`;
frontend `VITE_LOCAL_PLATFORM_LOGIN=true nice -n 15 npm run build`.

Local services were rebuilt/restarted and the actual owner login was exercised
in separate browser contexts. The running Companies/account pages were captured
at1366x900 and390x900, English/Urdu: eight screenshots/observations, zero overflow,
zero browser errors. The visible numbers were checked against each authenticated
API response. Twelve old-route visits redirected successfully; mobile navigation
collapsed/expanded correctly and retained only Companies and Platform security.
Private actual-account screenshots and `review.json` remain outside Git under
`~/.local/share/hygene-ops/local-development/platform-company-overview-20261031/`.
Only the two regenerated, synthetic disposable-db company screenshots are tracked.
Inspected against approved `design/v5/previews/platform-1366-en.png` and existing
V5 desktop/phone styling: preserved blue/white palette, sidebar, type, spacing,
tables/cards and RTL; new user-authorized counts replace technical list metadata.
No visual defects remain in these checked states. Original V5 external release
gates are not accepted by these checks.

## Local review

Worktree: `/home/shumail/.local/share/hygene-ops/v5-import-20261031`.
Branch: `feat/platform-company-overview`, based on UI polish `f89c8e2` (draft112).
Verified source commit: `5321d7d`. OPEN/DRAFT review:
[PR113](https://github.com/Shumail-AbdulRehman/PRIV/pull/113), stacked on draft112.
Local URL: http://localhost:5173/platform/companies; existing separately provisioned
platform-owner login. No new credentials. No merge or deployment authorized.
Original six unresolved V5 specifications retain their existing statuses.
