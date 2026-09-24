# Product improvement progress

## Scope and preservation

This run covers P0 and P1 only. The working tree already contained extensive uncommitted changes across backend, frontend, and docs; none were reset. Today remains observational. Task reassignment, photo approval/rejection, broad security/monitoring, notifications, scheduler changes, billing changes, and changes to permanent deletion are excluded.

## P0 baseline (2026-09-17)

- `frontend: npm run build && npm run lint && npm test` passed. Production output: main JS chunk approximately 1,099 KB minified; CSS approximately 121 KB. Vite reported its existing chunk-size warning. Four frontend tests passed.
- `backend: npm run build && npx vitest run src` passed. Five files, 33 tests passed.
- Existing mock-data screenshots at 1440 and 390 pixels: `docs/phase-p0/` (Today, dashboard, locations, location details, Team, Attendance). The browser harness uses only synthetic data. Creation-dialog and activated-empty-workspace screenshots at 1440/390 and the Today 768-pixel check were captured during final browser verification. These latter images show the P1 frontend, but those surfaces were not changed by P1.
- `GET /manager/today-status` is ADMIN/MANAGER-scoped by company and accessible location. Query: optional `locationId`. Response envelope: `{ statusCode, data, message, success }`; `data` includes `date`, `locations`, `summary`, and `staffStatus`. Staff entries include attendance, attendanceDisplayStatus, tasks, taskCounts, attentionCount, and flags. Today query key is `["manager", "today-status", filters ?? null]`. Dashboard locations key is `["dashboard-locations"]`.
- The endpoint's top-level `date` is one location's UTC day anchor. Staff location selection omits timezone even though the frontend type expects it. A multi-time-zone staff link therefore needs an additive per-row local date and selected timezone.
- `frontend-mobile` consumes current-user, own attendance, and staff task endpoints; it does not consume `/manager/today-status`. The P1 endpoint additions must keep the existing response fields and status semantics intact.
- P1 file boundary: `backend/src/controllers/manager.controller.ts`, `frontend/src/pages/Manager/{TodayStatusPage.tsx,types.ts,todayPresentation.ts}`, `frontend/src/pages/Dashboard/DashboardPage.tsx`, focused tests, and this progress record. No scheduler, assignment, checkout, deletion, or broader dashboard workflow edits.

## P1 complete (2026-09-17)

- Added `asOf`, `staff.location.timezone`, and per-staff `localDate` to the Today endpoint. These are additive fields; existing keys, scopes, task statuses, scheduling, and assignment logic are unchanged. Unassigned staff use UTC for their local date.
- Today has one summary row, counted All staff / Needs attention controls, labeled filters, Clear filters, and one staff table. Search trims surrounding spaces and ignores case. Refresh retains local filters. Empty, no-match, and error states remain distinct.
- Today and Overview now share attention inclusion, deterministic ordering, exception descriptions, and site-local detail links. Missing check-in, no record, future shift, late check-in, missing check-out, late start, overdue open work, completed late work, missed work, and cancelled work have distinct handling. Counts describe people or existing review items rather than pretending overlapping task categories are unique tasks.
- Changed files for this phase: `backend/src/controllers/manager.controller.ts`, `frontend/src/pages/Manager/{TodayStatusPage.tsx,types.ts,todayPresentation.ts}`, `frontend/src/pages/Dashboard/DashboardPage.tsx`, `frontend/tests/todayPresentation.test.mjs`, this record, and `docs/phase-p0/` screenshots. The large pre-existing diffs in these tracked files were preserved.

### Verification

- Frontend `npm run build && npm run lint && npm test`: passed; 8 tests, including 4 new focused tests. Final main JS 1,102.05 KB minified, CSS 121.51 KB. Existing Vite chunk-size warning remains; optimizing that is outside P1.
- Backend `npm run build && npx vitest run src`: passed; 5 files, 33 tests.
- Mocked Playwright browser checks passed for admin and manager routes at 1440 and 390 pixels, no page-level horizontal overflow, Today attention/search, navigation drawer, and auth pages. Today also passed at 768 pixels without page-level overflow.
- Focused mocked browser checks passed for trimmed search, filters retained on refresh, Clear filters, two distinct staff local dates in Today and Overview links, activated empty workspace, location creation dialog, Today empty/no-match/error/retry states, and no zero totals on error. Browser data was synthetic; no live database or production data was used.
- `git diff --check` passed.

### Remaining limitation and next phase

The endpoint's site-local date additions were type-checked and exercised through mocked browser responses, but this run did not perform a live multi-time-zone database integration test. The existing production bundle warning remains. Stop here for user review; the next authorized unit would be P2 extraction only.

## Remaining-work planning update (2026-09-17)

Prepared `docs/REMAINING_PHASES_IMPLEMENTATION_PLAN.md` for P2–P6 and `docs/REMAINING_PHASES_START_HERE.md` with one-unit-at-a-time implementation prompts. No remaining phase was implemented by this documentation update. The next unit is P2-A extraction, followed by P2-B wizard and safe partial-success handling.

Re-inspection confirmed staff creation now uses a single POST that saves optional location/shift fields in the staff create. Corrected the original handoff's stale multi-request description. The new plan also preserves the subsequently completed login/signup image layout (`AuthShell.tsx`, `auth-cleaning-team.webp`).

## P2-A active — extraction plan

Starting state: the previous auth artwork and planning documents are uncommitted; `git status --short` and `git diff --stat` were recorded before editing. No AGENTS.md was found. Existing P0/P1 behavior remains the baseline.

Scope: extract `TemplatesTab` and its own types/helpers from `frontend/src/pages/Location/LocationDetailPage.tsx` into `frontend/src/pages/Location/components/LocationTemplatesTab.tsx` plus a shared feature types module and pure form helper module. Keep Task/Assignment API requests, creation payload, edit/QR/delete actions, and query keys unchanged for this extraction checkpoint. No backend/API change. Verify frontend build, lint, tests, create/edit/QR/delete browser behavior, and synthetic multipart fields. The known destructive create rollback remains a P2-B fix and will not be called complete under P2-A.

P2-A completed: extracted the templates tab into `LocationTemplatesTab.tsx`, shared location types into `Location/types.ts`, and pure create-form/date helpers into `Task/taskScheduleForm.ts`. Existing create/edit/QR/delete behavior was retained for the extraction. Frontend build, lint, and 8 tests passed. A mocked browser check opened the templates tab, rendered QR, opened edit, submitted one multipart POST with aligned `referenceImages` and `referenceNames`, and checked 390px page overflow. The delete action's confirmation was preserved in code but the browser check did not execute deletion. The destructive rollback remains present and is the first required P2-B correction.

## P2-B active — wizard and safe creation plan

Allowed edits: the extracted templates tab, new `Task/components/TaskScheduleWizard.tsx`, `Task/taskScheduleForm.ts`, and focused tests/progress. No backend, scheduler, assignment, billing, verification, or deletion implementation changes. Replace the old create dialog with four steps, keep the existing POST + optional PATCH payload contracts, remove destructive rollback, and retain a known created ID across assignment retry. Verify create/assignment failure and retry write counts with mocked API, plus frontend build/lint/tests and responsive browser checks.

P2-B completed: `TaskScheduleWizard.tsx` now provides Task → Team → Schedule → Review. It keeps File objects while moving between steps, validates named reference areas, uses site wall-time conversion, supports DAILY/ONCE and optional recurrence end, and defaults to automatic assignment. Successful POST stores the returned ID and invalidates the workspace. Failed manual assignment keeps the schedule and offers PATCH-only retry or finishing with the saved schedule. Unknown create outcomes prohibit automatic POST retries. Existing edit, QR, and permanent deletion actions remain in the extracted tab.

Verification: frontend build/lint and 11 tests passed; mocked browser scenarios proved a failed PATCH followed by retry used one POST/two PATCHes/no DELETE, unknown POST outcome blocked retry, Back preserved dates, automatic path issued no PATCH, and the wizard caused no 390px page overflow. Synthetic screenshots are under `docs/implementation-evidence/p2-b/`. Backend was not changed. Remaining P2 limitation: transport `MAX_REFERENCE_IMAGES` is server configuration and is not exposed to the client; the per-plan allowance is displayed, and the backend's upload rejection remains actionable.

## P3-A active — schedule read API plan

Allowed files: backend location route/controller and a new pure projection service with focused tests. Add `GET /api/location/:id/schedule?week=YYYY-MM-DD` with company/manager scope, seven site-local days, persisted actual items, future planned projections, deduplication by template/date, and no writes. Preserve existing scheduler modules. Verify build, existing backend tests, pure date/DST/overnight tests, scoped endpoint behavior with isolated/mocked fixtures, and query bounds. No frontend change in this unit.


P3-A implemented: scoped read endpoint and pure weekly projection are present. Previous session verification passed backend build and 40 tests, including DST, overnight continuation, actual/planned deduplication and mocked access checks. Live database verification remains outstanding.

## P3-B active — weekly schedule view

Scope: Location tab URL state, schedule DTO/API/query, and a read-only weekly agenda. Preserve existing defaults and unrelated URL parameters. Fetch only while mounted, use the server site-local week, and avoid previous-week placeholder data. Add planned/default-staff labels, overnight continuation, read-only details, loading/error/empty states and responsive layout. Verify build/lint/tests and mocked browser navigation and mobile overflow. No scheduler or assignment writes.

## Hygene Ops branding — 2026-09-24

User prioritized the rename and logo ahead of remaining implementation phases. Applied the exact spelling **Hygene Ops**. Created an original SVG H monogram with a rising crossbar, blue/navy wordmark, shared BrandLogo component and independent branding styles. Updated public navigation/footer, product previews, auth copy/titles, dashboard sidebar/mobile menu/titles, favicon, touch icon and metadata. Staff app display name, login identity, launch/adaptive/splash icons and permission copy use the same identity. Existing app slug, deep-link scheme, auth-storage key and demo login identifiers stay compatible. No billing or scheduling behavior changed; prior work remains intact.

Verification: 13 frontend tests and mobile TypeScript check passed. Mocked browser checks passed Home, Features, Pricing, Login and Signup at 1440/390px, including document titles, loaded logo assets and no horizontal overflow; also checked dashboard desktop sidebar and mobile navigation branding. Representative screenshots: `docs/implementation-evidence/branding/`. Frontend standard build/lint remain blocked by pre-existing user edits in `ActionButton.tsx` (unused `name`, boxed `String` type); that file was preserved. Native device/app-store verification was not run.

## Enterprise contact-sales plan — 2026-09-24

Replaced the public Advanced checkout card with Enterprise: “Let’s talk”, Contact sales, and a responsive inquiry dialog. Starter and Pro remain the only Paddle preview/checkout tiers. Updated comparison table, feature copy, plan selection guidance, and backend display name. Internal ADVANCED identifiers, webhook mappings, and existing subscriber limits remain compatible; this task does not implement negotiated per-company entitlements or automatically activate Enterprise accounts.

Inquiries use POST `/api/subscription/enterprise-inquiries`, strict server validation, and the new `EnterpriseInquiry` table. The browser retains the request ID/payload on uncertain outcomes; the server performs an immutable ID-based upsert. No contact data is returned by this public endpoint. There is no email delivery configured. The operator can review saved inquiries in their database console or run `npx prisma studio` from `backend` and open EnterpriseInquiry; they are intentionally not exposed to customer administrators.

Verification: backend build and 50 tests passed; 13 frontend tests passed; Vite production bundle passed with the existing size warning. Mocked browser checks passed contact flow with Paddle unavailable, failed submission/retry using the same payload/ID, success confirmation, and 1440/390px form layout. Screenshots: `docs/implementation-evidence/enterprise/`. Full frontend build/lint still encounter the preserved pre-existing ActionButton.tsx errors. No real email, purchase, or inquiry was submitted in browser checks.

Enterprise persistence deployment: created only EnterpriseInquiry and its date index on the configured database and registered migration `20260924000100_enterprise_inquiries` as applied. The unrelated pending permanent-deletion migration was not applied. No customer records or subscriptions were changed.

## Login/signup panel refresh — 2026-09-24

Replaced the generated cleaning photograph and its promotional card with a shared, code-rendered AuthWorkspacePreview. It uses the existing blue/navy palette, restrained typography, and a clearly labelled sample shift agenda. Login and signup both use the new panel; mobile keeps the form-focused layout. Authentication inputs and submission logic are unchanged. The old image asset is preserved but no longer imported or shipped in the Vite asset output.

Verification: Vite bundling and focused ESLint for AuthShell/AuthWorkspacePreview passed. Mocked browser checks passed login/signup at 1440px and 390px, including branded titles and no horizontal overflow; desktop screenshot visually reviewed. Evidence: `docs/implementation-evidence/auth-refresh/`. The existing bundle-size warning and unrelated ActionButton.tsx full-build/lint errors remain as previously recorded.

## Feature photography refresh — 2026-09-24

Replaced AttendanceVisual's cartoon map and ProofVisual's CSS room illustration with locally hosted Pexels photography: Mike van Schoonderwalt's office reception (5511103) and Matilda Wormwood's surface-cleaning photograph (4099467). Shared ProofVisual also updates Home. Simplified to full-size photographs with quiet caption/credit strips; removed simulated submission badges from these visuals. Added 640/1200px WebP variants, intrinsic dimensions, lazy loading, meaningful alt text, and photo source/license records in frontend/public/photos/credits.json. No generated imagery was used for this replacement.

Verification: focused ProductVisuals ESLint and Vite production bundle passed (existing bundle-size warning). Browser checks passed both Features sections at 1440/768/390px with decoded images and no horizontal overflow, plus the shared Home image. Desktop and mobile screenshots visually reviewed; evidence is under docs/implementation-evidence/feature-photos. Existing unrelated full-build ActionButton errors remain unchanged.
