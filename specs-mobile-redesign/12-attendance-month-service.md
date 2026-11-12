# Spec 12 — Staff attendance month service

**Status:** Done
**Depends on:** Spec 11
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/mobile/staffAttendanceMonth.service.ts`, `backend/src/services/mobile/staffAttendanceMonth.service.test.ts`, `specs-mobile-redesign/inventory/12-attendance-month-service.md`
**Reuses:** `backend/src/services/mobile/staffMonth.ts`, `backend/src/controllers/attendanceSelf.controller.ts`, `ARCHITECTURE.md#api`

## Goal

A read-only service returns one staff member's attendance for a month with a single display state per day and the month's counts, never any photo.

## Scope

`staffAttendanceMonth(actor, input, now = new Date(), db = prisma)`:
1. Parse `input` (`month` optional) and get the month context from `staffMonthContext` (spec 11).
2. Read `Attendance` rows: `staffId = actor.id`, staff in the actor's company and active (same guard as `getStaffSelfAttendance`), location in the actor's company, `date` in `[start, end)`. Select only `id`, `date`, `expectedStart`, `expectedEnd`, `checkInTime`, `checkOutTime`, `status`, `isLateCheckIn`, `lateMinutes`, `location` (`id`, `name`, `timezone`). **Never select `checkInImage` or `checkOutImage`.**
3. For each row, `date` becomes `YYYY-MM-DD` in the row's location timezone; compute `state` with the rule order in `ARCHITECTURE.md#api` using `now`.
4. Counts per the contract.
5. Return `{ month, timezone, range, counts, records }` with records ordered by date desc.

## Explicit non-scope

- The HTTP route → spec 18.
- Changing `GET /api/staff/mobile/attendance` or `/api/attendance/my` → spec 00 (never; the app's check-in logic still uses them).
- Attendance corrections or notes → spec 00 (not in this plan).

## Reuse first

- Use `staffMonthContext` from spec 11; do not write a second month validator.

## Steps

1. Write the service.
2. Test with a fake `db`.
3. Write the inventory fragment.

## Done when

- [x] `cd backend && npx vitest run src/services/mobile/staffAttendanceMonth.service.test.ts` passes: the query's `where` scopes staff, company and month; the `select` has no image field; a past row with no check-in is `ABSENT`; a row with status `MISSED_CHECKOUT` is `MISSED_CHECKOUT` even if it was late; a checked-in row whose shift has not ended is `ON_SHIFT`; a late row is `LATE` and counted in `late`; a future row is `UPCOMING`; counts match a crafted month; a manager actor is 403 before reading. [unit]
- [x] `cd backend && npx vitest run --maxWorkers=2` passes with 0 failures; real count in the Log. [unit]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-12** — Built `staffAttendanceMonth.service.ts` (`staffAttendanceMonth`, pure `classifyAttendanceDay`, `hasLateCheckIn`, photo-free `attendanceMonthSelect`) reusing `staffMonthContext` unchanged; role check before any read. Tests: `staffAttendanceMonth.service.test.ts` 17/17; whole backend suite `--maxWorkers=2` 117 files passed, 1 skipped; 2606 tests passed, 7 skipped, 0 failures; `tsc --noEmit` exit 0; `npm run build --prefix backend` exit 0. Inventory fragment written.
- **Interpretation (contract gap, fair to staff):** a row with no check-in whose shift has started but not ended (not after `expectedStart`, not before `expectedEnd`) matches no contract rule except `ON_TIME`; it is `UPCOMING` instead (staff can still check in) and is not counted. A row is "late" only when it has a check-in and `isLateCheckIn` or status `LATE`; a row without a check-in is never counted late. `lateMinutes` is returned only for a late check-in, else null. A late `MISSED_CHECKOUT` row counts in both `late` and `missedCheckout` (contract: `late` = any record with a late check-in). A past checked-in row with no checkout not yet marked `MISSED_CHECKOUT` keeps `LATE`/`ON_TIME`. A row's `date` uses its own location timezone (falls back to the month context timezone if invalid). Records sort by `date` desc then `id` desc in memory. Location activity is not filtered.
- **Not verified:** nothing against a real database (Prisma mocked; `where`/`select` type-checked against the generated client only). No route exists yet (spec 18).
