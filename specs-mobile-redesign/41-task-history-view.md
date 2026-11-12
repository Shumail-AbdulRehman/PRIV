# Spec 41 — Task history list

**Status:** Done
**Depends on:** Spec 17, Spec 21, Spec 24, Spec 25
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/history/TaskHistoryView.tsx`, `frontend-mobile/src/screens/history/MonthBar.tsx`, `frontend-mobile/tests/history/taskHistory.test.mjs`, `specs-mobile-redesign/inventory/41-task-history-view.md`
**Reuses:** `frontend-mobile/src/queries/history.ts`, `frontend-mobile/src/design/TaskRow.tsx`, `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/format.ts`, `frontend-mobile/src/design/Feedback.tsx`, `design/mobile-redesign/v3/index.html`

## Goal

Staff can look back month by month at the tasks they finished or missed, filter them, and open one (All screens > History: Task history).

## Scope

**`MonthBar`** (shared with spec 42) props: `month`, `range`, `onChange`. Row with a previous arrow, "November 2026" (`monthTitle`, `groupTitle` role), next arrow; arrows are 48 buttons labelled "Previous month" and "Next month", hidden (not dead) at the range ends; arrows mirror in Urdu.

**`TaskHistoryView`** props: `staffId`, `month`, `onMonthChange`, `onOpenTask(item)`.
- `MonthBar`.
- Summary: a 10 high stacked bar with green (verified), blue (waiting) and red (missed) parts proportional to `counts`, then a legend "Verified {n}", "Waiting {n}", "Missed {n}" with colour squares (status also in words).
- Filter chips (horizontal, scrollable): "All", "Verified", "Waiting", "Missed"; 44 high; selected chip `ink` fill with white text; `accessibilityState.selected`.
- List grouped by `date` with a day heading: `dayLabel` ("Today", "Yesterday", weekday) at the start and `dayMonth` at the end; rows are `TaskRow`s built from `historyDisplay(item.status)`, the area name, and the task window in the item's timezone; pressing a row calls `onOpenTask(item)`.
- Paging: "Load earlier tasks" ghost button while `hasNextPage`.
- Empty month or filter: `EmptyState` "Nothing here yet" / "Try another filter." (for `all`, the body is "No finished tasks this month.").
- Loading: skeleton bar, chips and five rows. Error: `ErrorState` with retry (also used for a 404 from an older server).

## Explicit non-scope

- The Tasks/Attendance switch and the screen shell → spec 47. Task details → spec 43.

## Reuse first

- `useTaskHistory` (spec 17) and `TaskRow` (spec 25).

## Steps

1. Build `MonthBar` and the view.
2. Test with mocked query results.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/history/taskHistory.test.mjs` passes: the legend shows the three counts in words; selecting "Missed" re-queries with `filter: 'missed'`; rows group under "Today" and "Yesterday" with the right day-month; a verified item shows the green "Verified" pill and a waiting item the blue "Waiting for review" pill; the previous arrow is hidden at the earliest month; "Load earlier tasks" calls `fetchNextPage`; an error shows retry; Urdu mirrors the arrows. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built `MonthBar` and `TaskHistoryView` plus `inventory/41-task-history-view.md`. `tests/history/taskHistory.test.mjs`: 10 pass, 0 fail. Whole mobile suite: 567 pass, 0 fail. Typecheck: 0 errors. `build:web`: exported OK. Not verified: device, font scaling, screen reader, a browser check at 360 by 700 (layout uses flex and wrapping legend/scrollable chips only). Notes: the view returns a plain View (no vertical scroll) so spec 47's shell must scroll it; the last known `range` is kept so arrows do not vanish while the next month loads; legend renders the word and the count as separate texts (reads "Verified 31", with a combined accessibility label) so no new key was needed; the day heading uses the page `timezone` for "today". Urdu key needed in `staffAppTranslations.ts` (not owned): "No finished tasks this month." (currently falls back to English). All other keys (All, Verified, Waiting, Missed, Load earlier tasks, Nothing here yet, Try another filter., Previous month, Next month) already exist.
- **2026-11-12** — Follow-up: added optional `onRange(range)` to the view (called when the server range changes, by value, never looping). Test added in its test file.
