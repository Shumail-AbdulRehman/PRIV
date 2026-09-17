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
