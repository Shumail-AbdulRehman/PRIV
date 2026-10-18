# Mobile query optimization — 2026-10-18

The staff task feed previously fetched today's tasks and every page of outstanding verification work before rendering. These lists overlapped, and the current-day endpoint returned full task columns, including photo links and policy metadata. The notification provider also downloaded inbox rows merely to display an unread badge.

## Changes

- Added staff-only `GET /api/staff/mobile/tasks`: one paginated union of current-day work and previously unfinished inventory tasks, scoped to the staff member's current active location and company. It returns at most 50 cards, a cursor, and accurate counts over the entire eligible feed.
- The feed prioritizes work in progress and actionable tasks before submitted work. Cursors contain priority, shift start, task ID, and the location's local-day anchor. Tied times paginate deterministically; a cursor from a previous local day requires refresh. Duplicate cards are removed if a row moves between pages during concurrent changes.
- The database first reads eligible IDs and aggregate counts, then fetches only card fields for the requested page. No photo URLs, inventory, assignment history, or policy/AI metadata are included in card payloads. The existing staff/task and task-assignment indexes cover these filters; no new indexes or migration were added.
- Added `GET /api/staff/mobile/attendance`, returning the recent 30 attendance summaries without selfie URLs or unrelated fields. It preserves the records used to choose current attendance and outstanding checkout.
- Added `GET /api/staff-notifications/unread-count`. The badge polls this small response; full inbox pages load when the inbox is opened.
- Home and Tasks share the task cache. More task pages load only when requested. Totals and badge counts use server aggregates rather than the number of cards loaded so far. Queries refresh when stale on focus and cancel HTTP requests when cancelled; offline detection pauses network work. Hidden task tabs do not poll.
- Task start uses the staff `view=mobile` detail response, reusing authorization's task read rather than fetching photo/reference/history relationships. A confirmed start updates both paginated cards and counts immediately while the feed refreshes in the background. The existing detail endpoint's default response and manager behavior are preserved.

## Measured comparison

An isolated PostgreSQL database was seeded with 70 current-day tasks and 120 older unfinished tasks, including 40 submitted tasks. Current-day fixture rows intentionally include 5 KB of photo-link text and 5 KB of policy metadata to exercise the overfetching path. The benchmark uses the original mobile request pattern in parallel, followed by its sequential verification-work pages, and compares it with the new initial page. Figures are medians of five local HTTP runs after a warmup.

| Initial task load | Previous | Optimized |
| --- | ---: | ---: |
| HTTP requests | 4 | 1 |
| Response bytes | 833,487 | 20,955 |
| Median local duration | 62.56 ms | 14.16 ms |

The fixture's initial payload shrank by 97%. The optimized response contains the first 50 cards plus whole-feed counts; remaining cards remain available through pagination. These are local synthetic measurements, not a guarantee of real phone latency or savings for smaller datasets.

## Validation

- Backend build and 539 unit tests passed.
- Mobile type check and 66 tests passed, including cache sharing, on-demand pagination, cancellation, and immediate start updates.
- Isolated PostgreSQL/HTTP integration passed: all 190 eligible tasks remain reachable without duplicates, accurate aggregate counts, local-day rollover, minimal payloads, attendance summaries, task detail, count-only badges, tenant isolation, staff-only access, and inactive-account rejection.
- Expo web export passed. Browser checks at 390px and 1440px passed for a single initial task request, no inbox-row fetch for the badge, no duplicate request when switching tabs, on-demand pages, correct totals, and no horizontal overflow.
- Notification PostgreSQL/HTTP integration passed for atomic/bulk task events, rollback, reassignment/cancellation, reminder deduplication, delivery retries, receipts, invalid tokens, concurrent worker claims, session refresh, logout, and account switching. Inbox browser tests passed for all five event types, opening updates, unread counts, and mark-all-read.

No APK was built and no real push was sent. A read-only check of the configured application database found zero enabled, unexpired device registrations; `STAFF_PUSH_ENABLED` remains false. Real OS-level delivery therefore still requires an updated app on a phone, registration/permission, enabling the worker, and a device smoke test. All mutation/integration fixtures used disposable local databases.

## Reproduce

```sh
cd backend
npm run build
npm test
VERIFICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/priv_verification_test npm run test:mobile:integration
VERIFICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/priv_verification_test npm run test:staff-notifications:integration
```

Both integration scripts refuse non-local or non-test database URLs and create fresh disposable databases.

```sh
cd frontend-mobile
npm run typecheck
npm test
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api npx expo export --platform web --output-dir /tmp/staff-mobile-web
```

Serve the export on port 5191. With Playwright installed (or `PLAYWRIGHT_MODULE` set to its module path), run `node tests/mobileQueriesBrowser.mjs` and `node tests/notificationsBrowser.mjs`. Both mock API responses. Origin and browser executable can be overridden using the environment variables in each script.

Deploy/restart the updated backend before using the updated mobile bundle because the app now calls the new summary endpoints. OTP login was left aside and no OTP code or provider setup was added.
