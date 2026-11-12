# Spec 15 — My day next-step decision

**Status:** Done
**Depends on:** Spec 05, Spec 06
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/day/nowState.ts`, `frontend-mobile/src/screens/day/nowState.test.ts`, `specs-mobile-redesign/inventory/15-now-state.md`
**Reuses:** `frontend-mobile/src/utils/attendance.ts`, `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/design/format.ts`, `frontend-mobile/src/design/taskState.ts`, `design/mobile-redesign/v3/views.js`

## Goal

One pure function decides the My day sentence, its tone, the shift line and the single next action, from attendance, tasks and the clock. It replaces `buildAttendanceViewModel` inside `HomeScreen.tsx` with the design's wording while keeping the same attendance rules.

## Scope

`nowState({ hasLocation, record, tasks, now, online, failed, photosAvailable })` where `record` is the result of `getRelevantAttendanceRecord` and `tasks` today's feed. Returns `{ tone, title, sub, rail, action, wait }`:
- `tone`: `blue`, `quiet`, `bad` or `ok` (the colour of the top area).
- `title` and `sub`: `{ key, values, name? }` objects (English keys, values for placeholders, `name` an entered name for `LabeledName`), never final strings, so the screen translates.
- `rail`: `{ checkedInAt, checkOutAt, progress }` or null. Shown only once the person is checked in (compact top). `progress` is 0 to 1 of the shift. `checkOutAt` is `getRecommendedCheckoutAt(record)`.
- `action`: `{ kind, taskId? }` or null, kinds `checkIn`, `checkInLate`, `checkOut`, `completeCheckOut`, `startCleaning`, `takePhotos`, `retakePhoto`, `retry`.
- `wait`: `{ key, values }` or null, the dock's static status when there is no action yet ("Check-out opens at {time}").

Rules, first match wins (times through `clock` from spec 05; windows only from `utils/attendance.ts`):
1. `failed` → quiet, "Today could not load", "Check your internet and try again.", action `retry`.
2. No location → quiet, "No location assigned", "Ask your manager to give you a location and shift."
3. No record → quiet, "No shift loaded for today", "Pull down to refresh. If it is still missing, ask your manager."
4. Checked out (`checkOutTime` or status `CHECKED_OUT`) → ok, "Shift finished", "In {in}. Out {out}. Thank you."
5. Status `ABSENT`: before `getCheckInOpenAt` → blue, "Check-in opens at {time}", "Your shift starts at {time} at {place}.", no action; between open and `getLateDeadline` → "Check in to start your shift", "Take a selfie at {place}. Keep location on.", `checkIn`; after the late deadline and before shift end → "You are late. Check in now.", "Shift started at {time}. This check-in will be marked late.", `checkInLate`; after shift end → quiet, "Shift time closed", "This shift ended at {time} without a check-in. If this is wrong, tell your manager."
6. Status `MISSED_CHECKOUT` → bad, "Check-out is overdue", "Your shift ended at {time}. This late check-out stays on your record.", `completeCheckOut`.
7. Checked in (`hasOpenCheckout`), with the rail. If not `photosAvailable` and a task is in progress → quiet, "Task photos are unavailable", "Results already received are kept. Ask your manager what to do next.", no action. Else by task, using `taskDisplay`: a retake → "Retake a photo: {area}", "One photo needs to be taken again.", `retakePhoto`; overdue → "Overdue: {area}", "This should have finished by {time}. Finish it now.", `takePhotos`; in progress or photos needed → "Cleaning: {area}", "When it is clean, take the task photos.", `takePhotos`; first not started by time → "Next: {area}", "{title}. Finish by {time}.", `startCleaning`. When no open task: if now is at or after `getRecommendedCheckoutAt` → "Time to check out", "Take a fresh selfie to close your shift.", `checkOut`; else "All work submitted" (or "No tasks today", "Your manager has not given you work for today." when the feed is empty), "Manager review may still be needed.", `wait` "Check-out opens at {time}".
8. Open tasks remaining while check-out time has come: keep the task as the title (rule 7) and do not offer check-out on My day's main button; check-out is reached from the dock warning flow in spec 46.

`online` does not change the decision; the screen replaces the action with the offline status.

## Explicit non-scope

- Rendering → specs 29 and 46. Performing check-in or check-out → spec 16.
- Changing `utils/attendance.ts` → spec 00 (never).

## Reuse first

- Every time window from `utils/attendance.ts`; the old `buildAttendanceViewModel` in `HomeScreen.tsx` is the reference for edge cases (keep its behaviour, change only the words).

## Steps

1. Write the function; table-test every rule with fixed `Asia/Karachi` instants for a 9:00 to 5:00 shift.
2. Record the result shape in the inventory fragment.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/screens/day/nowState.test.ts` passes: one case per rule above, including 8:05 (opens at 8:30, no action), 8:52 (check in), 9:24 (late), 18:10 without check-in (closed), missed check-out, retake beats overdue beats cleaning beats next, all submitted at 3:40 (wait text "Check-out opens at 5:00 PM"), 5:02 with no open work (`checkOut`), and photos unavailable. The rail is null before check-in and present after. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `nowState.ts` imports nothing from React or React Native. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `src/screens/day/nowState.ts` (pure; imports only `utils/attendance`, `design/format`, `design/taskState` and types) and `nowState.test.ts`, 21 tests, all passing (also under `TZ=America/New_York`). Mobile suite 239/239, 0 failures. Typecheck 0 errors. `npm run build:web` passes. The no-React import rule is checked by a test that reads the source. Choices the spec left open: (1) `title`/`sub` `values` hold every placeholder, entered names included, and `name` repeats the entered name (area for titles, place or task title for subs) so the screen can isolate it; `{area}` is the title placeholder `LabeledName` expects. (2) Added an optional `timeZone` input (device zone when absent) so times are deterministic; a task's own `location.timezone` wins for its times. (3) "A task is in progress" for the photos-unavailable rule is read as any open task whose next step is photos (retake, overdue, in progress, photos needed), so no photo action is ever offered while photos are off (invariant 10); a not-started task still offers `startCleaning`, matching the design's task screen. (4) No place name: subs fall back to the design's Urdu-variant keys "Your shift starts at {time}." and "Take a selfie at your location. Keep location on." (5) No area snapshot: area is the title and the Next sub is "Finish by {time}." so the title is not said twice. (6) Missed check-out has no rail (the design draws none). (7) Checked out without a check-in time shows "—" for `{in}`. (8) The old view model's unreachable "Attendance record loaded" fallback became the no-shift state. ABSENT boundaries kept from `buildAttendanceViewModel` (open at 8:30 inclusive, late after 9:15, closed after 5:00 exclusive). Rendering was not checked here (no UI in this spec).
