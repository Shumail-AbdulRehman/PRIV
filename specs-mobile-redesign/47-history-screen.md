# Spec 47 — History screen

**Status:** Done
**Depends on:** Spec 05, Spec 07, Spec 21, Spec 41, Spec 42
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/history/HistoryScreen.tsx`, `frontend-mobile/tests/history/historyScreen.test.mjs`, `specs-mobile-redesign/inventory/47-history-screen.md`
**Reuses:** `frontend-mobile/src/screens/history/TaskHistoryView.tsx`, `frontend-mobile/src/screens/history/AttendanceHistoryView.tsx`, `frontend-mobile/src/design/SegmentedControl.tsx`, `frontend-mobile/src/design/Feedback.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `design/mobile-redesign/v3/index.html`

## Goal

The History tab holds both histories behind one Tasks / Attendance switch and keeps the chosen month as the person moves between them.

## Scope

New screen `HistoryScreen` (registered as the `History` tab by spec 51):
- `canvas` background, top safe area, `OfflineBanner`, title "History" (`pageTitle`).
- `SegmentedControl` with "Tasks" and "Attendance"; default Tasks.
- One `month` state for both views, starting at the current month in the device timezone (the views clamp to the server's range on first response; if the server's `latestMonth` differs, adopt it).
- Tasks shows `TaskHistoryView`; pressing a row navigates to `HistoryTask` with `taskId` and `month`. Attendance shows `AttendanceHistoryView`.
- Pull to refresh refetches the visible view.
- When the user taps the History tab again while on it, scroll to top (standard tab press behaviour through the navigation `tabPress` listener).

## Explicit non-scope

- Registering the tab and the `HistoryTask` route → spec 51.

## Reuse first

- The two views from specs 41 and 42; no data fetching in this screen itself.

## Steps

1. Build the screen.
2. Test switching, month sharing and navigation.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/history/historyScreen.test.mjs` passes: the Tasks view shows by default; switching to Attendance shows the calendar view with the same month; changing month in one view and switching keeps it; a row press navigates to `HistoryTask` with id and month; Urdu translates the switch labels. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built `HistoryScreen`. Tests: `tests/history/historyScreen.test.mjs` 7/7 pass (default Tasks at current month, switch to Attendance with same month, month carried both ways, row press navigates to `HistoryTask` with id and month, pull to refresh refetches only the visible view, tab press scrolls to top only when focused, Urdu switch labels and `row-reverse`). `npm test --prefix frontend-mobile`: 602 tests, 602 pass, 0 fail. Typecheck 0 errors. `build:web` passed.
  - Rendered check: built a scratch copy of the app (outside the project, History tab added to the copy's `StaffTabs` only, symlinked node_modules, no .env), served on 127.0.0.1, headless Chrome 360x700 with `playwright-core` from `frontend/node_modules` and API answers fabricated with `page.route`. History Tasks and Attendance segments, English and Urdu: document width 360, no ellipsized text, no page errors; the content scrolls to its end inside the screen. All seven weekday names fit their calendar cells in both languages (cells 46px wide, text scrollWidth = clientWidth, longest Urdu name جمعرات). Screenshots: /tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/p2-47/en-tasks.png, en-tasks-scrolled.png, en-attendance.png, ur-tasks.png, ur-tasks-scrolled.png, ur-attendance.png. Script: /tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/p2-47/check.cjs.
  - Spec mismatch: "adopt the server's latestMonth if it differs" is not implemented. The two views do not report the server range back (they only use it to hide arrows) and the screen must not fetch, so the screen cannot see it. The month starts at the device's current month; if the server's latest month is earlier, the user sees an empty or clamped month and can use Previous. A fix needs a view callback (for example `onRangeLoaded`) in specs 41 and 42.
  - Pull to refresh uses `queryClient.refetchQueries({ queryKey: ['staff', staffId, 'history', 'tasks' | 'attendance'] })` (keys from `historyKeys`), so the visible view only. Tab-press uses the navigation `tabPress` listener and `isFocused()`.
  - Missing Urdu keys: none ("History", "Tasks", "Attendance" all translate). The title and the segment control's accessibility label both use "History".
  - Not verified: real device, screen reader, system font scaling, the `tabPress` event from a real tab navigator (unit-tested with a stub listener; History is not yet in `StaffTabs`, spec 51).
- **2026-11-12** — Follow-up: added optional `onRange(range)` to the view (called when the server range changes, by value, never looping); HistoryScreen now adopts the first reported latestMonth unless the user already picked a month, which closes the mismatch noted above. Test added in its test file.
