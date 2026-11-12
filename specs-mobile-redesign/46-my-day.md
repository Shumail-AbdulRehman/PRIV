# Spec 46 — My day screen

**Status:** Done
**Depends on:** Spec 15, Spec 16, Spec 19, Spec 23, Spec 24, Spec 29, Spec 30, Spec 31
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/tests/screens/myDay.test.mjs`, `specs-mobile-redesign/inventory/46-my-day.md`
**Reuses:** `frontend-mobile/src/screens/day/nowState.ts`, `frontend-mobile/src/screens/day/useAttendanceAction.ts`, `frontend-mobile/src/screens/day/DayHeader.tsx`, `frontend-mobile/src/screens/day/TodayWork.tsx`, `frontend-mobile/src/screens/day/AttendanceLocating.tsx`, `frontend-mobile/src/screens/day/AttendanceSheets.tsx`, `frontend-mobile/src/screens/day/AttendanceReceipt.tsx`, `frontend-mobile/src/components/AttendanceCamera.tsx`, `frontend-mobile/src/queries/staff.ts`, `frontend-mobile/tests/attendanceRecovery.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

My day is the screen staff open all day: one sentence, today's work, and one button, built from the parts of specs 15, 16, 29, 30 and 31 and matching every "Moment in the day" in the design.

## Scope

Rewrite `HomeScreen.tsx` (export name unchanged; it stays the `Shift` tab):
- Data exactly as today: `useMyAttendanceQuery`, `useTodaysTasksQuery` (focused only), the 30-second clock, NetInfo online state, pull to refresh. A failed refresh shows the message bar "Today could not refresh. Try again." instead of `Alert.alert`.
- Decision: `nowState` with `failed` when either query errors with no data, `photosAvailable` from the existing photo authority signal if the feed exposes it (otherwise true; record in the Log).
- Layout: `OfflineBanner`; a scroll view (white background) with `DayHeader` and `TodayWork` (compact when the rail shows); then the dock; the tab bar below is the navigator's.
- **Dock**: offline → `DockStatus` "Internet needed to continue"; `state.wait` → `DockStatus` with the wait text; otherwise the action as a `next` button: `checkIn`/`checkInLate` → "Check in"/"Check in late" (camera icon) → `useAttendanceAction.start('check-in')`; `checkOut` → "Check out"; `completeCheckOut` → "Complete check-out" → `start('check-out')`; `startCleaning` → "Start cleaning" (QR icon) → `TaskDetail` for that task; `takePhotos` and `retakePhoto` → "Take task photos" / "Retake photo" (camera icon) → `Verification` with `requirePhotoQr: true`; `retry` → refetch both queries.
- **Check-out with open work**: when check-out time has come but tasks are still open (rule 8 of spec 15), the dock shows a second, outline button "Check out" under the task action; pressing it opens `UnsubmittedWorkSheet` with the count; "Go back to my work" closes it; "Check out anyway" starts check-out. When there is no open work, the main action is check-out and no warning appears.
- **Attendance flow**: by hook phase: `locating` → full-screen `AttendanceLocating` (back cancels); `weakSignal`, `notAtLocation`, `needsPermission` → `AttendanceSheets` over My day; `selfie` and `saving` → full-screen `AttendanceCamera` wired to `submitSelfie`; `done` → full-screen `AttendanceReceipt` whose action returns to My day (and refetches); `error` → message bar with the error and a "Try again" note under the sentence. Android back during locating or selfie cancels.
- Loading (first load, online): `DayHeader` and `TodayWork` in their loading forms.
- Live region: the sentence announces changes.

## Explicit non-scope

- The rules behind the sentence → spec 15. Attendance calls → spec 16.
- The task detail and photo screens → specs 33 and 45.

## Reuse first

- Everything listed in Reuses; this spec composes, it does not re-implement. `tests/attendanceRecovery.test.mjs` must stay green under the test-only exception.

## Steps

1. Rewrite the screen as a composition.
2. Test the main moments with mocked queries and a mocked hook.
3. Check the design's 360 by 700 rule.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/myDay.test.mjs` passes: at 8:52 the dock says "Check in" and pressing it calls `start('check-in')`; on shift with a pending task "Start cleaning" opens `TaskDetail` with its id; all submitted at 3:40 shows the wait status "Check-out opens at 5:00 PM" and no button; at 5:02 with open work the outline "Check out" opens the unsubmitted-work sheet and "Check out anyway" calls `start('check-out')`; offline shows the offline status; each hook phase renders its screen or sheet; Urdu renders the next-task label and the name on separate lines. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/attendanceRecovery.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] At a 360 by 700 window, after check-in, at least three task rows are fully visible above the main button in English and Urdu for the states "next task", "cleaning", "retake", "time to check out" and "all submitted"; the Log says how this was checked. [runtime]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Rewrote `HomeScreen.tsx` (export unchanged, still the `Shift` tab) as a composition: `useMyAttendanceQuery` and `useTodaysTasksQuery` (focused only), 30-second clock, `useOnline`, pull to refresh with the message bar "Today could not refresh. Try again." (no `Alert`); `nowState` (`failed` when either query errors with no data); `OfflineBanner`, white scroll view with `DayHeader` and `TodayWork` (compact when the rail shows), then an `ActionDock` with `DockStatus` (offline, wait) or the `next` action; outline "Check out" plus `UnsubmittedWorkSheet` at check-out time with open work; `useAttendanceAction` phases drawn by `AttendanceLocating` (back and Android back cancel), `AttendanceSheets`, `AttendanceCamera` (wired to `submitSelfie`/`cancel`) and `AttendanceReceipt` (its action cancels the hook and refetches both queries). The check-in/out calls, geofence handling and upload are the hook's, unchanged. New `tests/screens/myDay.test.mjs`: 18/18 pass (all Done-when moments plus late, missed check-out, cleaning/retake to `Verification` with `requirePhotoQr`, loading, failed + retry, failed refresh message bar, avatar/See all/row navigation, receipt, live announcement, Urdu split title and RTL rows). `tests/attendanceRecovery.test.mjs` 4/4 pass. Typecheck 0 errors. `npm run build:web` passes. **Blocked only on the whole-suite box:** `npm test --prefix frontend-mobile` ran twice, both 500 tests, 499 pass, 1 fail: `native photo shutter stays circular through styling, pressing and loading` (`tests/photoCaptureControls.test.mjs`). It fails loading `react-native-worklets` because the uncommitted `src/components/PhotoCaptureControls.tsx` (spec 45, in progress, not mine) now imports Reanimated and that old test has no Reanimated mock; nothing of spec 46 is involved. Tick the box once spec 45 lands its test change and the suite is rerun.
  - Runtime check: copied the fresh `dist` to a scratch folder, served it on 127.0.0.1, and drove headless Google Chrome at 360x700 with `playwright-core` (from `frontend/node_modules`, read only), a fabricated signed-in user in `localStorage` and API answers from `page.route` (checked-in shift at Gulberg Plaza, five tasks). States next task, cleaning, retake, time to check out and all submitted, each in English and Urdu (10 runs): three task rows fully visible (bottoms 421 to 484) above the main button or wait status (top 548), document width 360, no page errors. Screenshots read for next (en), retake (ur) and all submitted (en): nothing clipped, Urdu title label and area on separate lines, rows mirrored. Not checked on a device, with large font scaling or with a screen reader.
  - Test-only exception: `tests/attendanceRecovery.test.mjs` moved onto the shared harness because the screen now renders the design parts (old `Button`/`Text`/`Card` stubs no longer apply). Same four tests and the same assertions: exact check-out id 456 sent to `/attendance/check-out`, lost write response reconciled, camera closed afterwards; read failure before any permission request means no camera, no permission, no upload; camera and location denial show "Open settings", which opens settings, with no upload, then an explicit retry opens the camera. Changed only where wording or markup changed: the button is the `ActionButton` "Check out" (was `Button` "Check Out"); success is the receipt title "Checked out" (was the "Check-out recorded." notice, which the receipt replaces); "Open settings" is the permission sheet's button. Added: the read failure shows "Attendance not saved". It still uses the real `useAttendanceAction`.
  - Decisions and departures: (1) `photosAvailable` is always true: the task feed does not expose the photo authority (`photoAuthority` needs each task's manifest), so My day never hides a photo action; the photo screen still enforces it. (2) Hook `error` shows spec 31's "Attendance not saved" sheet (message and Try again) instead of a message bar plus a note under the sentence; spec 16/31 moved the error there and showing both would repeat it. (3) The live region is `AccessibilityInfo.announceForAccessibility` of the title and sub when the title changes (not on first render), because `DayHeader` (not owned) has no live region on its sentence. (4) The outline "Check out" also shows when photos are off and work is open (main action null), so check-out is never unreachable. Open count = loaded feed tasks whose display kind is open. (5) Offline with no action and no wait shows no dock (the banner already says it), as the design does. (6) When offline a `night2` spacer of the top inset sits above the banner; `DayHeader` still adds its own top inset, so offline on a notched phone the blue top is one inset taller. (7) Receipt record is the attendance row the action started on (by id), else the relevant one; tasks submitted = feed `counts.submitted`, else completed tasks.
  - For spec 48: `TaskDetail` (Start cleaning, task rows) and the `Profile` tab (avatar) are not registered yet, so those presses do nothing in the running app until spec 48 wires them; `SnackbarProvider` must be mounted for the refresh message. For spec 49: "Today could not refresh. Try again." needs Urdu. Removed from this screen as the design requires: `StaffBrand`, the long date line, "Shift details" facts, the inline notices and `Alert`s (all moved into the hook phases, sheets and receipt).
- **2026-11-11** — Lead: after spec 45 fixed `tests/photoCaptureControls.test.mjs`, reran the whole mobile suite: 529 of 529 pass, 0 fail. Status set to Done.
