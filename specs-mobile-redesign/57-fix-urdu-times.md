# Spec 57 — Fix: times keep their order in Urdu

**Status:** Done
**Depends on:** Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/urduTimes.test.mjs`, `specs-mobile-redesign/inventory/57-fix-urdu-times.md`
**Reuses:** `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/design/TaskRow.tsx`, `frontend-mobile/src/design/Moment.tsx`, `frontend-mobile/src/design/format.ts`, `frontend-mobile/src/screens/task/TaskDetailScreen.tsx`, `frontend-mobile/src/screens/StartTaskScreen.tsx`, `frontend-mobile/src/screens/verification/SubmissionReceipt.tsx`, `frontend-mobile/src/screens/history/HistoryTaskScreen.tsx`, `frontend-mobile/src/screens/day/AttendanceReceipt.tsx`, `frontend-mobile/src/screens/history/AttendanceHistoryView.tsx`, `frontend-mobile/tests/screens/submissionReceipt.test.mjs`, `frontend-mobile/tests/screens/taskDetail.test.mjs`, `frontend-mobile/tests/screens/qrScan.test.mjs`, `frontend-mobile/tests/history/historyTask.test.mjs`, `frontend-mobile/tests/day/attendanceViews.test.mjs`

## Goal

In Urdu every clock time and time range reads in its own left-to-right order ("12:00 – 1:00 PM", "10:41 AM پر جمع ہوا"), as the design draws it, instead of "PM 1:00 – 12:00". This fixes finding 57 (`docs/plan-project/mobile-redesign/planning/verification.md` §7) and the invariant 7 failure it causes.

## Scope

The pattern already exists: `isolate()` in `design/StaffText.tsx` (line 29) wraps text in first-strong isolate marks, and `TaskRow.tsx` line 77 renders `{isolate(time)}`. Apply it at every place below where a time from `clock()` or `timeRange()` (`design/format.ts`) reaches the screen without it. Call sites found by `grep -rnE "\b(clock|timeRange)\(" src` (tests and `format.ts` excluded):

| File:line | What | Change |
|---|---|---|
| `task/TaskDetailScreen.tsx:155` | time line `timeRange(task.shiftStart, …)` | isolate |
| `task/TaskDetailScreen.tsx:168` | manager note `<Note tone="blue" body={note} />` (entered text; a Latin note's full stop lands on the left) | isolate the note |
| `StartTaskScreen.tsx:318` | task header `timeRange(…)` | isolate |
| `verification/SubmissionReceipt.tsx:38, 53` | `time` placed into "Submitted at {time}…" | isolate the value |
| `history/HistoryTaskScreen.tsx:128, 129, 131` | Step values Scheduled, Started, Submitted (and `130`, "x / y" photos, same `Step`) | isolate inside `Step` (line 39) so every step value is covered |
| `day/AttendanceReceipt.tsx:54` | `subtitle={clock(at, timeZone)}`; Moment renders a string subtitle as is (`Moment.tsx:119–121`) | isolate at the call site |
| `history/AttendanceHistoryView.tsx:173, 179, 184` | day-sheet In, Out, Shift values through the local `Fact` (line 193) | isolate literal values inside `Fact` (the Location name on line 185 is covered too) |
| `history/AttendanceHistoryView.tsx:35, 144` | row range already wrapped by a local `ltr()` (left-to-right isolate) | replace `ltr` with the shared `isolate` so one helper remains |

Already correct, leave unchanged: `TaskRow.tsx:77`; `StartTaskScreen.tsx:229–230`; `DayHeader.tsx:64–65, 97, 106, 123, 150–151` (every `nowState.ts` time value is isolated there or in `HomeScreen.tsx:191`); `ProfileWork.tsx:83`; `VerificationScreen.tsx:464` (countdown); `AttendanceReceipt.tsx:37–47` facts (Moment isolates `fact.value`, `Moment.tsx:145`). `history/parse.ts:205–206` is a validator, not display.

- This spec is the **sole later editor** among specs 56 to 63 of the six source files above (owned by specs 33, 34, 36, 43, 31 and 42) and changes only the listed expressions, the `Step` value line and the `Fact` value line.
- `tests/screens/submissionReceipt.test.mjs` line 111 compares the Urdu subtitle with an unisolated time; update its expected value to the isolated time (test-only exception, Log line). Other existing assertions use `includes` and keep passing.

## Explicit non-scope

- "Results updated · {time}" in `VerificationProgress.tsx:190` (`toLocaleTimeString`, unisolated) → spec 59, the sole editor of that file.
- The live-region sentence built in `HomeScreen.tsx:139` (announced, not drawn) → not planned; screen-reader checks are unverified (spec 53 §8).
- `tests/history/attendanceHistory.test.mjs` → spec 58 edits it; put AttendanceHistoryView assertions in the new test file.
- Making `clock()` or `timeRange()` return isolated text → not planned (spec 05 keeps `format.ts` pure; isolating twice is harmless but changes accessibility labels such as `tests/design/taskRow.test.mjs:71`).
- Any e2e assertion that changes because of the marks → spec 52 (the lead reruns e2e after this spec).

## Reuse first

- `isolate` from `design/StaffText.tsx`; no new helper. Tests assert the marks as `tests/design/staffText.test.mjs:136` does.

## Steps

1. Make the eight changes in the table.
2. Prove each call site in Urdu. Put the assertions in `tests/screens/urduTimes.test.mjs`, or add them to the screen's existing test named in Reuses; mocked `useLanguage` must fill values (`t: (text, values) => translate(text, language, values)`), not the shared harness `t()`.
3. Run the touched tests, then the suite.

## Done when

- [x] In Urdu, each of these renders its time wrapped as U+2068 time U+2069, asserted by a test that fails before the change: Task details time line, Start cleaning header time, Work submitted subtitle, finished-task Scheduled/Started/Submitted values, check-out receipt subtitle, attendance day-sheet In/Out/Shift. [unit]
- [x] In Urdu, a Latin manager note on Task details renders isolated, so its full stop stays at its end. [unit]
- [x] `grep -n "ltr(" frontend-mobile/src/screens/history/AttendanceHistoryView.tsx` prints nothing. [static]
- [x] Each test file named in Reuses passes; the submissionReceipt diff changes only the expected Urdu subtitle. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** Implemented. Isolated: `TaskDetailScreen.tsx` 155 (time line) and 168 (note); `StartTaskScreen.tsx` 318; `SubmissionReceipt.tsx` 38 (value, import added); `HistoryTaskScreen.tsx` `Step` value line 39; `AttendanceReceipt.tsx` 55 (subtitle, import added); `AttendanceHistoryView.tsx` `Fact` value (literal only), and `ltr` removed in favour of `isolate` (line 143).
- Tests: new `tests/screens/urduTimes.test.mjs` (4: finished-task steps, day-sheet In/Out/Shift, check-out receipt subtitle, Work submitted subtitle); added one Urdu test each to `taskDetail.test.mjs` (time line and Latin note) and `qrScan.test.mjs` (header time, task shown as completed). New assertions check for marks that were not there before.
- Existing test adapted (test-only exception): `submissionReceipt.test.mjs` line 111 now compares raw `allText` with the isolated time; behaviour unchanged.
- Counts: the seven touched files 73/73; `npm test --prefix frontend-mobile` 631 pass, 0 fail; typecheck exit 0; `build:web` exit 0 (run after the other session's `expo export` finished). `grep -n "ltr(" AttendanceHistoryView.tsx` prints nothing.
- Not verified: device or layout; e2e (the lead reruns).
