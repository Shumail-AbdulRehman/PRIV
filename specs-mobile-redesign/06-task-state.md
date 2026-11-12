# Spec 06 — Task display state

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/taskState.test.ts`, `specs-mobile-redesign/inventory/06-task-state.md`
**Reuses:** `frontend-mobile/src/types.ts`, `frontend-mobile/src/utils/taskStatus.ts`, `docs/PRODUCT_UI_RULES.md`, `DESIGN-SYSTEM.md#components`

## Goal

One pure function decides how any task looks (marker, pill, group, whether it needs the person) from today's feed or from History, so every screen shows the same truth.

## Scope

Export a `TaskDisplayKind` union: `notStarted`, `inProgress`, `photosNeeded`, `retake`, `overdue`, `submitted`, `waitingForReview`, `verified`, `acceptedWithExceptions`, `missed`, `cancelled`.

`taskDisplay(task)` for a `TaskInstance` from today's feed (`src/types.ts`; the server already presents submitted work as `status: 'COMPLETED'` and hides the outcome):
1. `status` `CANCELLED` → `cancelled`.
2. `status` `MISSED` → `missed`.
3. `status` `COMPLETED`, or `completionOutcome` present → `submitted`. Today's feed never says verified.
4. `status` `NOT_COMPLETED_INTIME` → `overdue`.
5. `verificationState` `REWORK_REQUIRED` → `retake`.
6. `status` `IN_PROGRESS` and `verificationState` `CAPTURING` or `PROCESSING` → `photosNeeded`.
7. `status` `IN_PROGRESS` → `inProgress`.
8. otherwise (`PENDING`) → `notStarted`.

`historyDisplay(status)` for a History item status from the Part 2 contract (`MISSED`, `VERIFIED`, `ACCEPTED_WITH_EXCEPTIONS`, `WAITING_FOR_REVIEW`, `SUBMITTED`; `ARCHITECTURE.md#api`) → the matching kind.

`displayFor(kind)` returns: `pillLabel` (English key, or null for `notStarted`), `pillTone` (`neutral`, `blue`, `green`, `needsYou`, `needsYouSoft`, `red` per `DESIGN-SYSTEM.md#components`), `marker` (`position`, `droplet`, `camera`, `clock`, `tick`, `doubleTick`, `cross`), `markerTone`, `needsYou` (true for `photosNeeded`, `retake`, `overdue`), `open` (true for `notStarted`, `inProgress`, `photosNeeded`, `retake`, `overdue`), and `hiddenLabel` (English text for screen readers when there is no pill: "Not started").

Pill words and tones: Not started (none), In progress (blue), Photos needed (needsYouSoft), Retake photo (needsYou), Overdue (needsYou), Submitted (blue), Waiting for review (blue), Verified (green), Accepted with exceptions (green), Missed (red), Cancelled (neutral).

`groupTodayTasks(tasks)`: `{ needsYou, toDo, done }` in the order the Tasks screen shows. `needsYou` = needs-you kinds plus `inProgress`, by `shiftStart`; `toDo` = `notStarted` by `shiftStart`; `done` = the rest, by `shiftStart`. Also `position(task, tasks)`: the 1-based position of the task in the day ordered by `shiftStart` then `id`.

## Explicit non-scope

- Drawing markers and pills → spec 20.
- The My day sentence → spec 15.
- History parsing → spec 10.

## Reuse first

- Stay consistent with `taskCardStatus` in `utils/taskStatus.ts` for the shared cases; document every difference in the Log (for example "Work submitted" becomes "Submitted").

## Steps

1. Write the module and test every branch.
2. Record exports in the inventory fragment.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/design/taskState.test.ts` passes: each of the eight feed rules yields its kind, including that a task with a `completionOutcome` from the feed is `submitted`, never `verified`; an overdue task with `verificationState` `REWORK_REQUIRED`, `PROCESSING` or `NEEDS_REVIEW` stays `overdue` (the same rule `src/verification/taskStatus.test.ts` proves for the old mapping); each History status maps to its kind; `needsYou` is true only for photos needed, retake and overdue; `groupTodayTasks` orders by time and puts in-progress work under needs you; `position` is stable when two tasks share a start time. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `taskState.ts` imports nothing from React or React Native. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `frontend-mobile/src/design/taskState.ts` (`taskDisplay`, `historyDisplay`, `displayFor`, `groupTodayTasks`, `position`, `compareByStart`, types) and `taskState.test.ts` (20 tests, 20 pass). Whole mobile suite `npm test --prefix frontend-mobile`: 182 tests, 182 pass, 0 fail. Typecheck 0 errors. `npm run build:web` passed (exit 0, exported `dist`); the root-owned `.expo` EACCES did not occur this time. `taskState.ts` imports only the `TaskInstance` type from `../types` (grep: no React or React Native import). Differences from `taskCardStatus`: "Work submitted" becomes "Submitted"; "Photo received and being checked" (in progress + `PROCESSING`) becomes "Photos needed", and in progress + `CAPTURING` is also "Photos needed" (old: "In progress"); "Photo needs attention" becomes "Retake photo", and the new rule applies `REWORK_REQUIRED` to any non-terminal status including `PENDING` (old: only non-pending); everything else (cancelled, missed, submitted-before-overdue, overdue whatever the verification state, not started, in progress) matches. Choices the spec left open: `markerTone` is the colour token name of the marker fill (`canvas`, `blueWash`, `yellow`, `blue`, `ok`, `badWash`), which is what spec 20 needs; `cancelled` has no design, so it uses a `cross` on `canvas` with the neutral pill; `hiddenLabel` is null whenever a pill is shown; `position` counts tasks before it rather than looking up an index, so it works for a task outside the list; an unparsable `shiftStart` sorts last. `HistoryItemStatus` is declared here because spec 10's `TaskHistoryStatus` does not exist yet; it is the same five-string union, so spec 10's type is assignable to it. Every pill label already has Urdu (`translations.ts` or `staffAppTranslations.ts`); no new strings. Not applicable: device, font scaling, screen reader (pure module).
