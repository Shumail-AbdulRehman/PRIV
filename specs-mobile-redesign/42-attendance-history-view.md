# Spec 42 — Attendance history with calendar

**Status:** Done
**Depends on:** Spec 05, Spec 17, Spec 20, Spec 23, Spec 24, Spec 41
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/history/AttendanceHistoryView.tsx`, `frontend-mobile/src/screens/history/AttendanceCalendar.tsx`, `frontend-mobile/tests/history/attendanceHistory.test.mjs`, `specs-mobile-redesign/inventory/42-attendance-history-view.md`
**Reuses:** `frontend-mobile/src/queries/history.ts`, `frontend-mobile/src/screens/history/MonthBar.tsx`, `frontend-mobile/src/design/BottomSheet.tsx`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/format.ts`, `DESIGN-SYSTEM.md#components`, `design/mobile-redesign/v3/index.html`

## Goal

Staff see each month's attendance as a calendar and a list, and can open any day for its times, with Late in orange, never yellow (All screens > History: Attendance history, Attendance day).

## Scope

**`AttendanceCalendar`** props: `month`, `records`, `todayYmd`, `width`. Monday-first grid of 7 columns (3 gap, 8 side padding) with day-name headings (`calendarHead`; Urdu 13 below 375 wide so "جمعرات" fits; check with the real width). Leading empty cells for the first weekday. Square cells radius 12 with the day number, coloured by the record's `state` per `DESIGN-SYSTEM.md#components` (calendar): `ON_TIME` and `ON_SHIFT` blue wash, `LATE` the `late` token, `ABSENT` red outline, `MISSED_CHECKOUT` warn outline, today blue, future muted, no record `offDay`. Each cell has an accessibility label like "4 November, Late".

**`AttendanceHistoryView`** props: `staffId`, `month`, `onMonthChange`.
- `MonthBar` (from spec 41).
- Calendar, then a legend with words and counts: "On time {n}", "Late {n}", "Absent {n}", "Missed check-out {n}".
- List of records (newest first): day label and day-month, "in – out" times (left-to-right; out omitted while on shift), and a pill: "On time" green, "Late" `late`, "Absent" red, "Missed check-out" warn, "On shift" blue. Rows are 68 high buttons.
- Pressing a row opens a `BottomSheet` for that day: title "{day}, {date}", a pill ("Late by {n} min" with the `late` tone when `lateMinutes` exists, else the state pill), a table with In, Out ("Still on shift" when open), Shift, Location (untranslated), and a "Close" outline action.
- Loading, empty ("No shifts this month.") and error states as in spec 41.
- No photo, no image field (ARCHITECTURE invariant 8).

## Explicit non-scope

- The screen shell → spec 47. Attendance corrections → not in this plan.

## Reuse first

- `MonthBar` from spec 41; `BottomSheet` from spec 23.

## Steps

1. Build the calendar and the view.
2. Test with a crafted month.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/history/attendanceHistory.test.mjs` passes: November 2026 starts on Sunday so the grid has six leading empty cells; a late day uses the `late` token and no cell uses `yellow`; the legend shows four counts in words; pressing a late record opens the sheet with "Late by 21 min" and its times; an on-shift record shows "Still on shift"; no rendered element receives an image source; Urdu day names render. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] At 360 by 700 in Urdu every day name fits its cell; the Log says how this was checked. [runtime]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built `AttendanceCalendar.tsx` and `AttendanceHistoryView.tsx`; test file `tests/history/attendanceHistory.test.mjs` (10 tests, all pass). Full mobile suite: 595 tests, 595 pass, 0 fail. Typecheck 0 errors; `build:web` exported.
  - The [runtime] box (Urdu at 360 by 700) was checked in the unit test, not in a browser: the test sets a 360 window, asserts the cell width (46 px), that all seven Urdu day names render at the narrow size 13, and that the width exceeds the widest name's estimated width (about 6 letters at 13 px). A real browser or device check of "جمعرات" was not done.
  - Choices where the spec was silent: a today cell is blue unless the day is Late, Absent or Missed check-out (those keep their colour so Late is never lost); `UPCOMING` records get a neutral "Upcoming" pill; Out shows "Still on shift" only for `ON_SHIFT`, otherwise a dash; time ranges are wrapped in an LTR isolate so "in – out" reads left to right in Urdu; the empty state keeps the calendar and legend and replaces only the list.
  - Missing Urdu keys (not in `staffAppTranslations.ts`, shown in English in Urdu): "On shift", "No shifts this month.", "Upcoming". Legend words are rendered separately from the count, so no "On time {n}" keys are needed. "Absent" resolves to Urdu already.
  - Not verified: device, screen reader, Android font scaling.
- **2026-11-12** — Lead: unticked the [runtime] box. A unit-test width estimate is not a rendered check. The view is not reachable until spec 47, so the browser check at 360 by 700 in Urdu runs with spec 47 and the lead ticks this box then.
- **2026-11-12** — Lead: rendered check done with spec 47 (headless Chrome 360 by 700, Urdu, API mocked, scratch copy with the History tab). Lead viewed `ur-attendance.png`: all seven Urdu day names fit, the longest being جمعرات. Box ticked.
- **2026-11-12** — Follow-up: added optional `onRange(range)` to the view (called when the server range changes, by value, never looping). Test added in its test file.
