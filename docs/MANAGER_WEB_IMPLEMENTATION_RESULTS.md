# Manager web implementation — 12 October 2026

The focused manager/admin experience is implemented in the existing React/Express applications. The existing dirty working tree was preserved. No mobile redesign, deployed release, application-database migration or historical-data repair was performed.

## Delivered behavior

- Overview and Today are distinct routes and navigation entries. Overview contains linked daily summaries, a concrete attention queue, a labelled task-status chart, task previews and authorized location comparison. Submitted work and verification remain separate.
- Today has server-paginated worker/task tabs, visible date/location/search/status filters, overnight carry-over labels, actual unassigned tasks and a deep-linkable task panel. Opening a task focuses/scrolls to its details. Staff history links use the selected day, including overlapping overnight records.
- Reviews has actionable queue tabs, explicit today/earlier/all/date periods, server search and pagination. Priority controls and numeric badges are removed. Each row identifies its reason, room/task, worker, location and scheduled time.
- The review workspace brings protected evidence, required fixture/view instructions, all snapshotted requirements, room context, screened examples, action forms and decision history together. Managers can inspect missing requirements individually. Larger images support accessible enlargement and zoom.
- Existing audited actions retain version/idempotency checks and resolution policy. “Resolve” appears only when the satisfaction helper permits it. Replacement-photo actions are suppressed when no valid capture window exists; service failure does not become a dirty finding. Completed concerns use a scoped eligible-follow-up selector.
- Successful saves refresh related reads and show persistent feedback. Notes survive conflicts/offline conditions. Resolving one issue preserves the others. Queue pagination clamps when the final page disappears; Back preserves filters/page and restores list position/focus.
- English/Urdu support is retained, with a separate manager vocabulary. Scoped shared styling provides readable typography, comfortable controls, semantic status color and responsive evidence/action layouts.

## APIs and correctness

Added `/api/manager/operations/overview`, `/staff`, `/tasks`, with bounded paging and common per-location daily scopes. Review listing has an additive page/search/period/queue contract, retaining legacy cursor mode. Detail reads add complete requirements and eligibility; next-case and completed-follow-up reads remain scoped. No schema migration is required.

Daily time ranges use IANA zones and local calendar boundaries; tasks/attendance overlapping midnight are explicitly labelled rather than silently treated as old backlog. Task counts come from actual instances, independently of staff existence. Pagination totals are server aggregates over the full filter, not a sliced fetch. Query keys include actor scope. Protected media requires the existing independent content authorization; uncertain privacy does not fetch routine image bytes.

## Verification

- Backend regression suite: **414 tests across 47 files passed**.
- Web regression suite: **38 tests passed**.
- Backend TypeScript/build, web lint and production build: passed. Vite retains a warning about the large application bundle; the app still builds successfully.
- New isolated PostgreSQL integration: local-day and overnight cohorts, submission totals, unassigned/no-staff work, tenant/location denial, 47-case paging/search/next/page clamping, resolution eligibility, actual workspace/action routes, audit decision persistence and idempotent retry passed.
- Existing isolated lifecycle integration: completion races, privacy/presence, epochs, maintenance, waiver, extension, deadlines/jobs, revocation and follow-up protections passed. Its stale held-media descriptor expectation was updated to reflect the existing authorized audited manager review variant; acceptance/privacy protections remain tested separately.
- Stateful browser workflow script: desktop 1440px and phone 390px, all four metric destinations, actual task/case identifiers, complete requirement workspace, search/paging/clamping, return filters, conflict note retention, stable retry UUID, partial action results, restricted/pending photo behavior, offline save gating, failure/retry, Urdu/RTL and 200% text.
- Local web returns 200 on **http://localhost:5173**; old port 5179 was stopped. API is on 8080 and rejects unauthenticated operations reads with 401. Existing worker heartbeat check passed.

Browser data/evidence are fabricated test fixtures. Real Cloudinary/provider behavior, real-user usability, and live role-specific datasets were not certified by these checks. No physical-device validation applies to this web-only change.

## Repeatable checks

```bash
npm --prefix backend test
npm --prefix backend run build
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build

# Requires an explicitly isolated local database URL; never use customer DATABASE_URL.
VERIFICATION_TEST_DATABASE_URL=postgresql://verification@127.0.0.1:54329/priv_verification_test_manager \
  npm --prefix backend run test:manager:integration

PLAYWRIGHT_MODULE=/tmp/priv-redesign-tools/node_modules/playwright-core/index.mjs \
  node frontend/scripts/check-manager-workflows.mjs
```

The integration script creates its own fresh database, applies migrations only there, and preserves it for diagnosis. The browser script uses the actual Vite frontend on 5173 with intercepted APIs. Change `UI_BASE_URL`, `PLAYWRIGHT_MODULE`, `CHROME_PATH`, or `UI_SCREENSHOTS` if needed.

Screenshots are under `docs/manager-web-design/implemented/`, clearly test-fixture evidence. The earlier preview/baseline files remain alongside them for comparison. The proposed short manager/owner usability sessions in the plan still need real participants and a native Urdu wording review.

## Overview performance follow-up


The previous Overview ran repeated counts, comparisons and relation reads inside an interactive transaction. `Promise.all` did not make those queries execute concurrently on its single connection; remote database round trips dominated this small dataset.

`operationsOverviewAggregate.ts` now builds one parameterized SQL statement for all Overview counts, per-location comparisons and bounded task/attendance/review previews. It reuses scoped task and attendance cohorts and returns only the fields displayed. Actor/location authorization remains uncached, and the repeatable-read transaction, local-day/overnight predicates, review ordering and submitted/verified distinctions remain intact. No database migration or application-data modification was required.

Read-only service benchmarks against the same development administrator scope: before **12,899 / 12,185 ms**, after **1,817 / 1,799 / 1,844 ms**. These measure `managerOperations` with a warmed connection, not browser rendering or the full authenticated HTTP journey. The scope had one location and one daily task, so large-tenant performance remains unmeasured.

TanStack Query was already installed. Overview now has a **30-second freshness window**, **two-minute inactive retention**, and **60-second foreground polling**. Cached results remain visible during a stale background refresh. Keys isolate actor, location and date; login/logout clear the cache. Today retains its faster 15-second freshness/30-second polling and now discards inactive page results after one minute. Cache is memory-only and contains API summaries/bounded page responses; no new evidence/media persistence or cache was added. Review processing keeps its existing refresh policy. Staff/shift/template/assignment mutations now also invalidate operational queries; existing review/deletion invalidation remains in place.

Verification: 414 backend tests, 38 web tests, lint and both TypeScript checks passed. Isolated PostgreSQL checks also compare consolidated totals with Today predicates across two timezones, test verified/manual outcomes and inactive/cancelled exclusions, empty authorized scopes, preview ordering, review reasons and UTC timestamp conversion. Desktop/phone browser workflows passed; clock-controlled cache checks verify fresh return without a request, stale background refresh without a loading skeleton, date isolation and removal after two minutes of inactivity. No production load test was performed.

## Task-photo route follow-up

The `/verification/:taskId` route still rendered the older unstyled requirements/history screen. That missed entry point is now fixed: the authorized task's actual case ID (or its manifest case summary) redirects to the complete review workspace, preserving safe return paths. Staff and location photo links carry their current filters into that return path. Resolved cases can still be inspected; history was not deleted.

Tasks without a case now show a compact fixture/view selector beside the authorized evidence viewer, required-photo receipt totals distinct from verification, instructions with the existing optional Listen control, and lazy expandable paginated upload history. Queries include actor scope. Existing protected evidence behavior is retained. Task-photo breadcrumb navigation now leads to the task list instead of the nonexistent `/verification` index.

Browser checks at 1440px and 390px verified legacy task-to-case routing with the correct case identifier and return filters, no-case view selection, missing evidence feedback, upload history fetched only when expanded, and horizontal overflow. Screenshots: `implemented/task-photos-1440.png` and `implemented/task-photos-390.png`. Physical users and browser speech voices were not tested.

