# Hygene Ops V5 runtime data audit — 2026-10-29

The shared runtime mismatch is repaired in the **local development environment**.
Implemented tenant pages were verified against a running current backend and real
PostgreSQL, including existing restored records. This is not full V5 acceptance,
provider qualification, production deployment or completion of unfinished specs.

## Runtime findings and root causes

1. **Wrong backend checkout and build.** The intended source was
   `implementation/v5-continuation-final`, `55061b8ed969adcffee2cbb2561a62d48828159a`,
   in `/home/shumail/bkacup-16-oct-bkpriv/bk-Priv/PRIV`. Specification 28's accepted
   source `e212e40` is an ancestor; its performance service, controller and route
   are present. The actual port 8080 listener was PID 142957, running
   `/home/shumail/bk-Priv/PRIV/backend/dist/app.js`, another dirty checkout on
   `main` at `21cc0ce28be68a2f17e393cfef4e43c2199c664a`. Its compiled manager
   router has overview/staff/tasks but no performance or trends routes; its
   composition lacks the V5 launch router. No frontend listener was running at
   the initial inspection.
2. **The prior repair was transient.** The installed/enabled
   `hygeneops-backend-development.service` still named the old checkout. The
   previously documented compatible replacement was a transient unit and no
   longer existed. The old service had restarted at 07:38:35 PKT today. A previous
   successful isolated test run could not correct that startup configuration.
3. **Shared frontend routing exposed the mismatch.** `frontend/.env` does not
   override the API address. `api/client.ts` defaults to `/api` and Vite proxies
   it to `127.0.0.1:8080`. Axios correctly includes cookies. The root `.env` is
   not Vite's env directory. Both backend checkout `.env` files contain remote
   database settings; launching either bare would select a different database
   from the intended restored local development copy.
4. **Misleading dashboard state.** The reporting-range label tested only whether
   data existed. It continued saying “Loading performance…” after a terminal
   query error, beside the correctly displayed error alert.
5. **Inactive locations were filtered out before reaching the directory.** The
   Locations UI offered Active/Inactive/All, but its shared GET always selected
   `isActive:true`. The prior component fixture included inactive records that
   the actual endpoint could never return. Operational selectors must continue
   to default to active sites.

An empty database was not responsible. The existing local database initially
contained 4 companies, 5 managers, 12 staff, 8 locations, 26 task instances and 27 attendance
records. All 18 repository migration names and SHA256 checksums match completed
migration rows, including launch credential/account columns. No migration was
required or applied to that database. These are aggregate counts, not identities.
The same eight table counts were rechecked after verification and were unchanged
(including zero credential tokens and zero attendance annotations).

## Failure evidence

Paths below include the shared `/api` prefix. All methods are GET.

| Affected surface | Endpoint | Actual before repair | Expected | Root cause and correction |
|---|---|---|---|---|
| Owner Company Performance / manager Location Overview | `/api/manager/operations/performance?period=7` |404 HTML, `Cannot GET /api/manager/operations/performance` |200 JSON envelope with scoped summary, sites, series, period and dates |Old compiled router; serve the matching backend. Actual authenticated200 and SQL/UI proof now pass. |
| Settings organization | `/api/company/settings` |404 HTML, `Cannot GET /api/company/settings` |200 envelope containing company id/name/accountVersion for owner;403 for manager |Old composition lacks launch settings router; corrected runtime. |
| Company Setup account rail; Plan & Billing | `/api/subscription/manage/lifecycle` |404 HTML, `Cannot GET /api/subscription/manage/lifecycle` |200 lifecycle/usage/provider-availability facts for owner;403 for manager |Old billing router; corrected runtime. |
| Help / Service Information; billing service information | `/api/support/contact` |404 HTML, `Cannot GET /api/support/contact` |200 availability DTO, including honest unconfigured state |Old composition; now200 with `available:false`, no fabricated contact channel. |
| Company Setup readiness | `/api/location/readiness` |401 JSON `AUTH_REQUIRED` without credentials; compiled-route inspection shows no static readiness route |Authenticated200 scoped readiness/counts/access/cursor DTO |Old `/:id` route catches this path before authentication.401 alone does **not** prove readiness exists. Authenticated old behavior was not measured; corrected runtime200 verified. |
| Locations Inactive/All | `/api/location/` |200 array constrained to active locations; source/UI contract mismatch |Directory can explicitly request retained inactive records, still scoped to tenant and assigned sites |Validated `includeInactive=true` opt-in; active-only default retained. UI now requests opt-in with separate cache key. Actual inactive/all and manager/tenant denials pass. |
| Dashboard terminal error | `/api/manager/operations/performance?locationId=<unassigned>` |403 JSON from a real scoped backend; range label continued saying Loading |Visible access error and terminated loading label; authorized navigation recovers |Frontend state condition corrected; actual403/error/recovery browser proof passes. |

A separate compatibility probe `/api/manager/operations/trends` returned404 HTML
on the old backend. It is not the current performance page's endpoint and is not
counted as a separately broken page. Some legacy endpoints existed on the old
server; no claim is made that every audited page previously returned404.

## Page-by-page verification

Each managed case uses actual password authentication, Express middleware,
services, Prisma and migrated disposable PostgreSQL. Positive responses are not
intercepted. API envelopes/statuses, persisted values and completed loading states
are checked. The 14 new cases contain additional steps, including six location tabs.

| Implemented page / surface | Backend reads audited | Verified behavior |
|---|---|---|
| Company Performance / Location Overview |`/manager/operations/performance` |SQL totals; rendered sites;7/30days; site scope; real manager 403; tenant separation; error label ends. |
| Today |`/manager/operations/{overview,tasks,staff}` |Actual selected site/date, task search, pageSize1/page2, saved task/staff values. |
| Photo Reviews / detail |`/verification-exceptions`, `/:id` |Persisted cases, queue, selected detail and site. Review data loads; external image/provider success is a separate gate. |
| Task-photo bookmark |`/task-instance/:id`, verification manifest |Actual version2 task routes into the persisted review workspace. |
| Locations |`/location/?includeInactive=true`, operations overview |Existing sites; Active/Inactive/All; active-only operational selector; company/assigned-site isolation. |
| Location detail |`/location/:id/stats`, `/:id/areas`, `/:id/schedule` |Overview, Staff, Cleaning schedule, Area templates, History and Weekly preview all retrieve real contracts and finish loading. |
| Team |`/staff/`, `/location/` |SQL-backed active people and real directory rendering. |
| Team member/history |`/staff/details/:id` |Saved person, date range, attendance summary and context access. |
| Attendance / context |`/attendance/`, `/:id/annotations`, site/staff selectors |Saved shifts; site/date filtering; actual context; genuinely empty future range. |
| Company Setup |`/location/readiness`, lifecycle |SQL-derived area/site counts, owner facts and actual site picker. |
| Managers |`/manager/`, `/location/` |SQL company manager list and assigned site. |
| Settings Organization / My account |`/company/settings`, `/owner-identity/status` |SQL-backed name/version/email-verification state; broader existing suite proves save/conflict/reload. |
| Plan & Billing |`/subscription/manage/lifecycle`, `/subscription`, support |Persisted linkage/status/usage. Disabled provider actions stay unavailable. |
| Help / Service Information |`/support/contact` |Real200 unconfigured DTO and finished loading. |
| Shared authentication/security |`/common/get-current-user`, refresh, logout; credential endpoints |Real UI login/reload/logout, refresh race, epoch revocation, suspended operational denial while owner security/billing remain accessible. |

Area-detail routes redirect to the existing location Area tab. Welcome and Choose
Plan redirect to billing. They are not separate completed product features.
Operator pages retain their separate identity boundary; unfinished specs33–35 and
positive external IdP/MFA journeys are not counted as tenant-page success.
Settings 30, Billing 32, Review 36 and Help 38 contain implemented read surfaces above;
this audit does not mark their broader incomplete specification scope Done.

## Fixes and files

Application changes:

- `backend/src/controllers/location.controller.ts`: explicit validated
  `includeInactive` read option, preserving company and manager location scope.
- `frontend/src/pages/Location/{api.ts,queries.ts,LocationsPage.tsx}`: opt-in only
  for the register, separate query key, normal request cancellation signal.
- `frontend/src/pages/Dashboard/DashboardPage.tsx`: pending-only loading label;
  terminal failure keeps the existing translated error/retry UI.

Focused proof:

- `backend/src/controllers/locationDirectory.controller.test.ts`
- `frontend/src/pages/Location/LocationQueries.test.tsx`
- `frontend/src/pages/Dashboard/DashboardPage.test.tsx`
- `frontend/e2e/runtime-data.spec.ts`

Runtime repair sources:

- `scripts/local-development.mjs`, `scripts/local-development.test.mjs`
- `scripts/systemd/hygeneops-local-postgresql.service.in`
- `scripts/systemd/hygeneops-frontend-development.service.in`
- `scripts/systemd/local-v5.conf.in`
- This report and [the current runtime runbook](V5_LOCAL_RUNTIME.md).

The persistent units use the existing protected local config and existing data
directory. PostgreSQL readiness and backend migration/build checks fail visibly;
startup never migrates/resets a database. Backend uses a private cwd and an
allowlisted environment so checkout/inherited remote credentials cannot load.
No endpoint was duplicated, authentication relaxed, mock data introduced, or UI
redesign performed. The original backend unit is retained behind a drop-in and
backed up privately. The separate old verification worker was left untouched.

## Checks and actual results

- Backend whole suite, `--maxWorkers=1`: **1,445 passed, 7 skipped**,95 passed files and
  one skipped SQL file. Explicit local test URL supplied; no remote test target.
  The skipped file was then run separately against a newly migrated UUID local
  scratch database: **7/7 SQL invariant tests passed**, with transactional rollback
  and child database cleanup. The whole-suite and focused SQL results are distinct runs.
- Frontend Node suite: **64 passed**.
- Frontend component suite, `--maxWorkers=1`: **329 passed / 28 files**.
- Local runtime guard Node suite: **9 passed**.
- Backend TypeScript, strict E2E TypeScript, frontend TypeScript and sanitized
  production web build: **pass**, through the existing managed runner.
- Frontend full ESLint: **pass**, no findings.
- Actual managed Chromium/API/SQL final group: **29/29 passed, one worker,48.3s**.
  Command: `HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56442/priv_e2e_test
  HYGENE_E2E_BROWSER_PATH=/usr/bin/google-chrome npm run test:e2e --prefix frontend
  -- runtime-data.spec.ts workspace.spec.ts lifecycle.spec.ts --grep-invert
  'manager UI deactivation'`. That existing manager-deactivation mutation was
  excluded because it would disable managerA before the read audit; it is not
  counted as verified by this run. Other lifecycle and authorization cases ran.
- First new strict E2E compilation found missing SQL row types, corrected before
  browser execution. First browser group27/29 passed; two new test selectors
  (generic CardTitle versus heading; wrapped select label lookup) were corrected
  without changing product behavior or weakening API/SQL assertions. The complete
  final 29-case group then passed fresh. Counts are not summed across reruns.
- Active 5173→8080→existing restored SQL smoke: **19 route/tab visits completed**,
  all primary reads200; actual 2 locations, 2 active staff, 6 attendance records and
  3 review cases in the selected owner scope; no JavaScript errors or records-load
  alerts. It used a short-lived signed local access cookie, not a password reset
  or a claim of existing-account password-login verification. Managed password
  login is separately proved with disposable users.
- Actual service migration/check command: 18 exact completed migrations; all three
  development units active/enabled, zero automatic restarts at inspection;
  `systemd-analyze --user verify` passed. No reboot was performed.

Private command logs and smoke JSON are retained in
`~/.local/share/hygene-ops/local-development/`. They must not be uploaded wholesale.
The existing-record smoke reads copied application data without test mutations;
mutating lifecycle tests use only UUID-generated disposable test databases.
Final cleanup found zero generated E2E/SQL child databases and zero other test
cluster clients. Only the owned test cluster on56442 was stopped; development
PostgreSQL56445, API8080 and frontend5173 remain active.

## Remaining limits and preservation

- Local existing data is the previously restored copy, **not latest remote data**.
  Remote configuration was inspected only for target metadata; no remote schema
  migration, reset, seed, credential change or production deployment occurred.
- Actual external photo assets/processing, qualified operator IdP/MFA, mail delivery,
  Paddle checkout/portal/catalog and qualified support/legal/distribution values
  remain separate environment/specification gates. Configured-off UI is verified;
  successful external provider operations are not claimed.
- Existing PostgreSQL driver concurrent-query deprecation warning appears in
  integrated runs; no associated failing request was established here.
- No full spec 40/device/provider matrix or final spec 41 release gate was run.
  Native code was untouched. Overall V5 completion is not claimed.
- All five pre-existing tracked dirty files were SHA256-checked unchanged:
  CI workflow, `.gitignore`, `DESIGN.md`, backend package and local handoff append.
  Other existing user inputs, old checkout and unrelated processes were retained.
  Repair work is on `fix/v5-runtime-data-loading`; no merge, push or deployment.

Sign in again at http://127.0.0.1:5173 after the switch to local signing keys.
