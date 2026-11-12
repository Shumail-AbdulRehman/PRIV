# Spec 10 — History and profile summary client contract

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/history/types.ts`, `frontend-mobile/src/history/parse.ts`, `frontend-mobile/src/history/parse.test.ts`, `specs-mobile-redesign/inventory/10-history-client-contract.md`
**Reuses:** `ARCHITECTURE.md#api`

## Goal

The phone has typed, defensive parsers for the three Part 2 responses, written from the contract so phone and server work can run at the same time.

## Scope

In `src/history/types.ts`, types exactly matching `ARCHITECTURE.md#api`:
- `TaskHistoryItem`, `TaskHistoryStatus` (`MISSED`, `VERIFIED`, `ACCEPTED_WITH_EXCEPTIONS`, `WAITING_FOR_REVIEW`, `SUBMITTED`), `ReviewState` (`NOT_NEEDED`, `OPEN`, `CLOSED`), `TaskHistoryPage` (`month`, `timezone`, `range`, `counts`, `items`, `nextCursor`), `HistoryFilter` (`all`, `verified`, `waiting`, `missed`).
- `AttendanceMonth`, `AttendanceDayState` (`UPCOMING`, `ABSENT`, `MISSED_CHECKOUT`, `ON_SHIFT`, `LATE`, `ON_TIME`), `AttendanceMonthRecord`.
- `ProfileSummary` with `company`, `location`, `usualShift`, `manager`, `month`.

In `src/history/parse.ts`, `parseTaskHistoryPage`, `parseAttendanceMonth`, `parseProfileSummary`:
- Return null when the body is not an object or a required field (`month`, `items` or `records`) is missing.
- Drop individual items that are malformed instead of failing the page; count dropped items in a returned `dropped` number.
- Unknown `status` or `state` values are dropped (never shown as something else).
- Missing optional fields become null, never undefined.
- Month strings must match `YYYY-MM`; dates `YYYY-MM-DD`.

These parsers are what keeps the app safe if an older server is running during a rolling deploy: a 404 or an unexpected body leads to the screen's error state, never to a crash.

## Explicit non-scope

- HTTP calls and query hooks → spec 17.
- Server implementation → specs 11, 12, 13.

## Reuse first

- Follow the defensive style of `parseStaffProfile` (spec 09) if it is already merged; otherwise write the same pattern here.

## Steps

1. Write the types from the contract, field by field.
2. Write the parsers and tests with full, partial and hostile bodies.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/history/parse.test.ts` passes: a full contract-shaped body of each kind parses; a body missing `items` returns null; one malformed item among three is dropped and `dropped` is 1; an unknown status is dropped; `nextCursor` absent becomes null; an attendance record with an image field does not carry it through; a profile without a manager parses with `manager: null`. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] Field names in `types.ts` match `ARCHITECTURE.md#api` exactly (listed side by side in the Log). [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built `frontend-mobile/src/history/types.ts` (contract types plus `as const` lists for statuses, review states, filters and day states), `src/history/parse.ts` (`parseTaskHistoryPage`, `parseAttendanceMonth`, `parseProfileSummary`, plus per-row `parseTaskHistoryItem` and `parseAttendanceMonthRecord`), `src/history/parse.test.ts` and `inventory/10-history-client-contract.md`. Parser file: 18/18 pass (`npx tsx --test src/history/parse.test.ts`). Mobile suite: 550/550 pass, 0 fail. Typecheck: 0 errors. `npm run build:web`: passes (exported `dist`); note the new modules are not imported by the app yet, so the build only proves nothing else broke.
- Field names side by side (`ARCHITECTURE.md#api` → `types.ts`): history `month, timezone, range{earliestMonth, latestMonth}, counts{verified, waiting, missed, total}, items[], nextCursor` → `TaskHistoryPage` same; item `id, areaName, title, date, shiftStart, shiftEnd, timezone, status, reviewState, startedAt, submittedAt, photos{received, required}, location{id, name}` → `TaskHistoryItem` same; attendance `month, timezone, range, counts{onTime, late, absent, missedCheckout}, records[]` → `AttendanceMonth` same; record `id, date, expectedStart, expectedEnd, checkInTime, checkOutTime, lateMinutes, location{id, name}, state` → `AttendanceMonthRecord` same; profile `id, name, email, phone, joinedAt, company{name}, location{id, name, address, timezone}, usualShift{start, end}, manager{name}, month{month, shiftsScheduled, shiftsAttended, onTime, tasksAssigned, tasksSubmitted}` → `ProfileSummary` / `ProfileMonthFigures` same.
- Choices the spec left open: `dropped` is returned on the page objects (`ParsedTaskHistoryPage = TaskHistoryPage & { dropped }`, same for attendance); `ProfileSummary` has no list, so it has no `dropped`. Page-level `timezone`, `range` and `counts` are treated as required like `month` (null page if missing). A nullable field that is absent or null becomes null; one present with the wrong type makes the row malformed (dropped) or, at page/profile level, the parse null (same rule as `parseStaffProfile`), e.g. a numeric `nextCursor` gives null rather than silently ending paging. Ids are positive integers (Prisma `Int`); `checkInTime`, `checkOutTime`, `lateMinutes` are nullable per the schema; `expectedStart`/`expectedEnd`, `shiftStart`/`shiftEnd` are required instants. Location `address` may be an empty string (schema `String`). `TaskHistoryStatus` and friends are derived from runtime lists in `types.ts` so the parser and the types cannot drift.
- Not verified: against a live server (specs 11 to 13 and 18 not built); no HTTP or hook code here (spec 17).
