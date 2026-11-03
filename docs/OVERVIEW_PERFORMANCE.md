# Overview performance dashboard

Overview now reports company and location performance rather than repeating
Today's operational lists. Today, attendance, task and review mutations are
unchanged. No database schema change or migration is required.

Features:

- 7 or 30 days ending on the selected date, with location filtering.
- Weighted attendance and submission rates, plus percentage-point changes against
  the adjacent previous period. These are ratios of total records, not averages
  of location percentages.
- Daily attendance/submission chart, work-status donut and per-location rate bars.
- All accessible locations, searchable/sortable, with exact counts and selected-day
  status. There is no four-location limit.
- English/Urdu, responsive layouts, an accessible daily-data table, explicit
  empty states, refresh and error/retry handling.

`GET /api/manager/operations/performance?period=7&date=today&locationId=ID`
requires an active ADMIN or MANAGER. Company and manager-location restrictions
are inherited from the operations scope. One parameterized aggregate SQL
statement reads both periods without loading individual photos/tasks or staff
personal details. The frontend query uses the operations cache family and its
existing invalidation, a 30-second freshness window and foreground-only polling.

Definitions:

- Attendance = shifts with a check-in / recorded scheduled shifts. Late and
  checked-out shifts count as attended. Today's upcoming shifts are included in
  the denominator, and the page explains this.
- Submission = submitted or completed task occurrences / active, non-cancelled
  scheduled task occurrences. Verification is reported separately.
- Periods and daily buckets use each location's timezone and date anchor.
  Overnight shifts/tasks belong to their recorded local scheduled day once.
  They are not duplicated across overlapping days. This differs intentionally
  from Today's carry-over operational view.
- Zero recorded shifts/tasks yields a null rate. Zero attended out of positive
  scheduled shifts yields a measured 0%.
- Current-day attention = missing check-ins after expected start, overdue work
  or an open review. Period counts and selected-day status have separate labels.
- Historical attendance stays attributed to its recorded location even if a
  staff member subsequently moves. Team size is the current active roster.
- Charts represent recorded occurrences; no future scheduled occurrences or
  historical missing attendance records are invented.

Checks: backend unit and PostgreSQL integration tests cover weighted rates,
previous periods, no-data values, all locations, overnight counting, DST windows,
cancelled/inactive exclusions, and tenant/manager/role denial. The browser harness
uses fabricated API responses and tests rendered charts, filters/search, Urdu,
empty periods and desktop/phone widths. It does not validate deployed data.

```sh
npm --prefix backend test
npm --prefix backend run test:performance:integration
npm --prefix frontend run build
npm --prefix frontend run lint
PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \
PERFORMANCE_ORIGIN=http://127.0.0.1:5197 \
node frontend/tests/performanceBrowser.mjs
```

The integration command needs an explicit local `VERIFICATION_TEST_DATABASE_URL`
starting with `/priv_verification_test`; it creates and drops only its own fresh
test database. No configured application database is reset, seeded or migrated.
