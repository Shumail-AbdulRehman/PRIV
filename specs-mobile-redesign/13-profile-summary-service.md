# Spec 13 — Staff profile summary service

**Status:** Done
**Depends on:** Spec 11
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/mobile/staffProfileSummary.service.ts`, `backend/src/services/mobile/staffProfileSummary.service.test.ts`, `specs-mobile-redesign/inventory/13-profile-summary-service.md`
**Reuses:** `backend/src/services/mobile/staffMonth.ts`, `backend/src/controllers/staffSelf.controller.ts`, `ARCHITECTURE.md#api`

## Goal

A read-only service returns what the Profile screen shows beyond today's endpoint: company and location names, usual shift in local time, the location's manager name, and this month's attendance and task figures.

## Scope

`staffProfileSummary(actor, now = new Date(), db = prisma)`:
1. Month context for the current month (`staffMonthContext` with no input).
2. Staff row (same guard as `getStaffSelfProfile`: `id`, `companyId`, role `STAFF`, `isActive`, company active) selecting `id`, `name`, `email`, `phone`, `createdAt`, `shiftStart`, `shiftEnd`, `company.name`, `location` (`id`, `name`, `address`, `timezone`, `isActive`). Never select password, tokens or credential fields.
3. Manager: if the staff has a location, the `ManagerLocation` row for that location (it is unique per location) with its `Manager` where `isActive` and same company; return `{ name }` only. No email, no phone, no id.
4. `usualShift`: `shiftStart` and `shiftEnd` read in the location timezone as `HH:mm`; null if either is missing.
5. Month figures over `[start, end)`:
   - Attendance rows for the actor whose `expectedStart` is not after `now`, leaving out a shift still in progress with no check-in yet (lead decision 2026-11-12, matches spec 12): `shiftsScheduled` (count), `shiftsAttended` (with `checkInTime`), `onTime` (attended and not late: `isLateCheckIn` false and status not `LATE`).
   - Tasks: the actor's tasks (`staffId = actor.id`, `isActive`, not `CANCELLED`, company scope) dated in the month: `tasksAssigned`, `tasksSubmitted` (`staffSubmittedAt` set or status `COMPLETED`).
   Use `count` queries, not row reads.
6. Return the object in `ARCHITECTURE.md#api`; `joinedAt` is `createdAt` as ISO.

## Explicit non-scope

- The HTTP route → spec 18.
- A manager phone number (the field does not exist; spec 00) → not in this plan.
- Changing `GET /api/staff/profile/me` → spec 00 (never; Part 1 uses it).

## Reuse first

- Copy the guard and the safe `select` from `getStaffSelfProfile`.

## Steps

1. Write the service.
2. Test with a fake `db`.
3. Write the inventory fragment.

## Done when

- [x] `cd backend && npx vitest run src/services/mobile/staffProfileSummary.service.test.ts` passes: the staff `select` has no credential field; the manager is looked up by the staff's location and company and only `name` is returned; no location gives `location: null`, `manager: null` and the `Asia/Karachi` month; `usualShift` is `09:00` to `17:00` for crafted Karachi times; month counts come from `count` calls whose `where` include the actor, company and month bounds and exclude future shifts; a manager actor is 403 before reading. [unit]
- [x] `cd backend && npx vitest run --maxWorkers=2` passes with 0 failures; real count in the Log. [unit]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-12** — Built `staffProfileSummary.service.ts` (`staffProfileSummary`, `profileSummaryStaffSelect`) reusing `staffMonthContext` unchanged; role check before any read; manager lookup and the five month `count` queries run in one `Promise.all` after the staff read. Tests: `staffProfileSummary.service.test.ts` 11/11; whole backend suite `--maxWorkers=2` 118 files passed, 1 skipped; 2617 tests passed, 7 skipped, 0 failures; `tsc --noEmit` exit 0; `npm run build --prefix backend` exit 0. Inventory fragment written.
- **Interpretation:** two staff reads happen (the month context's own guard, then the profile row with the `getStaffSelfProfile` guard including `role: 'STAFF'`); a miss on the second is 403 "Active staff account required" like spec 11, not the 404 of `getStaffSelfProfile`. Attendance counts use the spec 12 scope (`staffId`, staff guard, `location.companyId`) with `date` in `[start, end)` plus `expectedStart <= now`; tasks use the spec 11 scope (`location.companyId`, `isActive`, not `CANCELLED`) with `staffId = actor.id` only (reassigned-away tasks are not counted as assigned). `onTime` includes a `MISSED_CHECKOUT` row whose check-in was on time. Location and manager are not filtered by location `isActive` (same as specs 11 and 12: the staff member's assignment still shows). `location.timezone` in the response is the resolved month timezone (invalid stored zone falls back to `Asia/Karachi`). `usualShift` reads each stored instant's wall clock in that zone, the same way `getZonedClockMinutes`/`withZonedClockOnLocalDay` do, so historical DST offsets of the stored date apply.
- **Lead-approved deviation from the spec text (2026-11-12):** `shiftsScheduled` counts rows with `expectedStart <= now` AND (`checkInTime` not null OR `expectedEnd < now`), so a shift that has started but not ended with no check-in yet is neither scheduled nor attended (agrees with spec 12's `UPCOMING`). Spec Scope 5 and `ARCHITECTURE.md#api` still say only "`expectedStart` not after now"; not edited (outside Owns). New test evaluates the count `where` clauses against crafted rows: in-progress, no check-in gives 0/0/0; same shift checked in on time gives 1/1/1; ended with no check-in gives 1/0/0. Rerun: `staffProfileSummary.service.test.ts` 12/12; `tsc --noEmit` exit 0. Whole suite and build not rerun after this change.
- **Not verified:** nothing against a real database (Prisma mocked; `where`/`select` type-checked against the generated client only). No route exists yet (spec 18).
