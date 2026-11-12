# Spec 32 — Tasks screen

**Status:** Done
**Depends on:** Spec 07, Spec 19, Spec 24, Spec 25
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/TasksScreen.tsx`, `frontend-mobile/tests/screens/tasks.test.mjs`, `specs-mobile-redesign/inventory/32-tasks-screen.md`
**Reuses:** `frontend-mobile/src/queries/staff.ts`, `frontend-mobile/src/utils/attendance.ts`, `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/TaskRow.tsx`, `frontend-mobile/src/design/Feedback.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `design/mobile-redesign/v3/index.html`

## Goal

The Tasks tab lists all of today's work in three groups, opens a task's details, and keeps the check-in reminder, paging and the tab badge.

## Scope

Rebuild `TasksScreen.tsx` with the same queries (`useTodaysTasksQuery`, `useMyAttendanceQuery`) and refresh behaviour:
- White page, top safe area, `OfflineBanner`. Title "Today's work" (`pageTitle`) and "{n} of {t} submitted".
- When not checked in (no open attendance from `hasOpenCheckout`): a `yellowWash` note with a camera icon "Check in before starting a task." and, unless check-in has not opened yet, a dock with `next` "Check in" that navigates to My day (`tabRoutes.myDay`); My day runs the flow.
- When check-out time has come (record open and `now` at or past `getRecommendedCheckoutAt`): dock `next` "Check out" that navigates to My day; My day's dock then runs the check-out flow, including the unsubmitted-work warning (spec 46). For a missed check-out, the dock label is "Complete check-out" with the same navigation.
- Groups from `groupTodayTasks` (spec 06) with headings "Needs you", "To do", "Done today" (`label` bold), each a list of `TaskRow`s. Row press opens `stackRoutes.taskDetail` with the task id.
- "Load more tasks" ghost button when `hasNextPage`, labelled "Loading tasks…" and busy while fetching. Hide it while offline (the offline banner explains why) rather than showing a dead button.
- Empty: `EmptyState` with the list icon, "No tasks today", "Your manager has not given you work for today."
- Error: `ErrorState` with retry. Not loaded and offline: "Today has not loaded yet. Reconnect and refresh."
- Loading: skeleton title and five skeleton rows.
- Pull to refresh as today, but a failed refresh shows the message bar "Tasks could not refresh. Try again." instead of `Alert.alert`.
- Tab badge: keep setting `tabBarBadge` to the open count; also set `tabBarBadgeStyle` to the needs-you colours (yellow and ink) when any task needs the person, otherwise blue and white.

## Explicit non-scope

- Starting a task from this screen directly → spec 33 (task detail has the start button).
- Tab bar look → spec 48.

## Reuse first

- `useTodaysTasksQuery` paging and counts; `hasOpenCheckout` and `getRecommendedCheckoutAt`.

## Steps

1. Rebuild the screen.
2. Test groups, states and navigation.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/tasks.test.mjs` passes: a retake and a not-started task land under "Needs you" and "To do"; pressing a row navigates to the task detail with its id; before check-in the reminder and a "Check in" dock show; an empty feed shows the empty state; an error shows retry; the badge style is yellow when a task needs the person; "Load more tasks" calls `fetchNextPage`; Urdu headings translate. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — `TasksScreen` rebuilt on `groupTodayTasks`, `TaskRow`, `ActionButton`/`ActionDock`, `OfflineBanner`, `EmptyState`/`ErrorState`, `Skeleton`, `useOnline`, `useSnackbar`. New `tests/screens/tasks.test.mjs`: 14 tests (groups and title, row navigation, check-in reminder and dock, check-in not yet open, no dock mid-shift, Check out and Complete check-out docks, empty, error retry, offline-not-loaded, loading skeletons, badge colours and count, load more incl. busy and hidden offline, Urdu headings and row-reverse, failed refresh message bar). Suite 444/444; typecheck 0 errors; `build:web` passes. Not verified: a 360x700 browser screenshot (the Tasks tab needs a signed-in session against a live API; no spec box requires it) and device behaviour. Notes: `now` is read on each render (no ticking timer), so the Check out dock appears on the next re-render or refocus. "Tasks could not refresh. Try again." needs Urdu (spec 49). The message bar uses the shared snackbar, which needs `SnackbarProvider` mounted (spec 48), otherwise the message is silently dropped. The old Alert, `StaffBrand`, `TaskCard`, direct Start/Complete buttons and "{n} not started" subtitle are gone from this screen as specified. Icon: "List" (list icon in the spec).
- **2026-11-11** — Lead fix: `TasksScreen` now schedules one `setTimeout` to the recommended check-out time (cleared on unmount or when the time changes), so "Check out" appears without another prop change. Test added (15 in `tasks.test.mjs`): dock absent before, present after the timer fires, unmount clears the timer; the file unrefs long timers so other tests do not hold the process open. Suite 458/458 (other specs added tests meanwhile), typecheck 0 errors; build not rerun (imports unchanged).
