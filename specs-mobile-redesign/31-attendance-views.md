# Spec 31 — Check-in and check-out screens

**Status:** Done
**Depends on:** Spec 16, Spec 23, Spec 26
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/components/AttendanceCamera.tsx`, `frontend-mobile/src/screens/day/AttendanceLocating.tsx`, `frontend-mobile/src/screens/day/AttendanceSheets.tsx`, `frontend-mobile/src/screens/day/AttendanceReceipt.tsx`, `frontend-mobile/tests/day/attendanceViews.test.mjs`, `specs-mobile-redesign/inventory/31-attendance-views.md`
**Reuses:** `frontend-mobile/src/screens/day/useAttendanceAction.ts`, `frontend-mobile/src/design/BottomSheet.tsx`, `frontend-mobile/src/design/Moment.tsx`, `frontend-mobile/tests/attendanceCamera.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

Every step of checking in and out looks like the design (All screens > Check in and check out) and is driven by the phases of `useAttendanceAction`.

## Scope

**`AttendanceLocating`** props: `place` (entered name or null), `onBack`. `canvas` page with a back button; a 120 circle on `blueWash` with a `MapPin` 48, an expanding ring loop (scale 1 to 1.55 and fade over 1.5 s; static under reduced motion); "Finding your location…" (`headline`, live region); "Stay still for a moment."; the place on its own line.

**`AttendanceCamera`** (existing component, same props and behaviour): full-screen dark camera (`night`). Top: close button (48 round, `cameraButton`), title "Check-in selfie" or "Check-out selfie" (`cameraTitle`), "Keep your face inside the circle." Centre: an oval guide (236 by 306, 4 white border) with the outside darkened. Bottom bar: the 80 shutter (white with a dark gap and white ring) centred, labelled "Take selfie"; "Opening camera…" until ready; while `onCapture` runs, a busy card "Saving your attendance…" over the bottom of the camera. Keep every existing guard: hardware back cancels unless taking, front camera, one capture at a time, ready check, error text on failure. Errors appear in the bottom bar in `onCamera` text.

**`AttendanceSheets`**: one component taking the hook's `phase`, `error`, `accuracyMeters`, `place`, and handlers, and rendering the right `BottomSheet`:
- `weakSignal`: glyph pin (needs you), "GPS signal is weak", "Accuracy is ±{m} m. Move near a window or outdoors, then try again.", actions "Try again" (`retryLocation`) and ghost "Continue anyway".
- `notAtLocation`: glyph pin (red), "You are not at {place}" (in Urdu "You are not at your assigned location" with the place on its own line), the server's message if it adds detail, actions "Try again" and ghost "Cancel".
- `error` while checking in or out (lead note, 2026-11-11: spec 16 found the server sends a geofence rejection as a plain 400 message with no code, so `notAtLocation` is never entered): glyph pin (red), title "Attendance not saved", body the server's message shown through `t()` (it may be English), actions "Try again" (calls `start` again) and ghost "Cancel". Keep the `notAtLocation` sheet below for when the server adds a code; it is not reachable today.
- `needsPermission`: glyph camera (blue), "Camera is needed", "Allow camera and location in phone settings to mark attendance.", actions "Open settings" (`Linking.openSettings`) and ghost "Cancel".
- Also exports `UnsubmittedWorkSheet` props `count`, `onBack`, `onCheckOutAnyway`: glyph list (needs you), "1 task is not submitted" or "{n} tasks are not submitted", "You can still check out, or go back and finish your work.", actions "Go back to my work" (`next`) and ghost "Check out anyway".
- Dismissing a location or permission sheet cancels the flow (returns to My day), never leaves a spinner.

**`AttendanceReceipt`** props: `result` from the hook, `record` (fresh attendance), `tasksSubmitted`, `tasksTotal`, `place`, `onDone`. Uses `Moment`: check-in: blue badge, "Checked in", the time, pill "On time" (green) or "Late" (`late` tone), facts Location and Shift; action "See today's work". Check-out: green badge, "Checked out", the time, no pill unless it was a missed check-out (`warn` pill "Missed check-out"), facts In, Out, Time worked (omitted for a missed check-out), Tasks submitted "{n} of {t}", Location; action "Back to my day".

## Explicit non-scope

- Wiring these into My day and the phase transitions → spec 46.
- Logic in `useAttendanceAction` → spec 16.

## Reuse first

- `BottomSheet`, `Moment`, `ActionButton`; keep `tests/attendanceCamera.test.mjs` green (test-only exception allowed for changed wording).

## Steps

1. Build the four parts from the design screens (Finding location, Weak GPS, Wrong place, Camera not allowed, Selfie, Saving attendance, Checked in, Checked out, Checked out late, Work left warning).
2. Test each.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/day/attendanceViews.test.mjs` passes: the locating view shows its title and the place; each sheet phase renders its title and actions and calls the right handler; dismissing the weak-signal sheet calls cancel; the unsubmitted sheet reads "4 tasks are not submitted" and offers both actions; the check-in receipt shows "Late" with the `late` tone for a late record; the check-out receipt shows time worked and no pill, and for a missed check-out the warn pill and no time worked; Urdu renders the wrong-place title without the place inside the sentence. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/attendanceCamera.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `AttendanceLocating`, `AttendanceSheets` (+ `UnsubmittedWorkSheet`), `AttendanceReceipt`, and restyled `AttendanceCamera` (same props, same guards; oval guide drawn with react-native-svg `Path` + `Ellipse` because RN `borderRadius` cannot make an ellipse). `tests/day/attendanceViews.test.mjs` 12/12; `tests/attendanceCamera.test.mjs` 1/1; whole suite 364/364, 0 failures; typecheck 0 errors; `build:web` passes. No raw hex in the new files.
  - Test-only exception: `tests/attendanceCamera.test.mjs` moved onto the shared harness (its hand-written `react-native` mock had only `View`/`BackHandler`, and the legacy `Button`/`Text` it found are gone). Same behaviour proved: front camera, no capture before ready ("Opening camera…", `accessibilityState.disabled`), one capture at a time, busy while saving (`accessibilityState.busy` instead of the old `loading` prop), error shown then cleared on retry. Added: busy card text, hardware back and close ignored while saving, back cancels after.
  - Choices the spec left open: `AttendanceSheets` props use the hook's own names (`start`, `retryLocation`, `continueAnyway`, `cancel`, plus `mode`) so spec 46 can spread the hook; "Try again" on `error` and on `notAtLocation` calls `start(mode)`; "Open settings" opens settings and then cancels (as the design does); the `notAtLocation` body is the design's "Go to your assigned location, then try again." plus the server message only when it is not a repeat; `AttendanceReceipt` adds optional `timeZone` (device zone by default, as today); camera close button is labelled "Cancel" (design says "Back", but it is an X that cancels and "Cancel" has Urdu); `UnsubmittedWorkSheet` adds optional `visible` (default true).
  - Missing Urdu for spec 49: "Attendance not saved". Camera error strings ("The camera did not save a selfie. Please try again.", "The camera could not open. Go back and try again.", "Could not take your selfie. Try again.") were already English-only before this spec.
  - Not verified: 360 by 700 layout in a browser or device (these parts are not mounted in any screen until spec 46; checked only by reasoning: face guide scales to 36% of the width and 42% of the camera height), camera on a device, ring and busy-card motion, screen reader, font scaling.
