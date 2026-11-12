# Spec 34 — Scan the task QR and cleaning started

**Status:** Done
**Depends on:** Spec 19, Spec 21, Spec 23
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/StartTaskScreen.tsx`, `frontend-mobile/tests/screens/qrScan.test.mjs`, `specs-mobile-redesign/inventory/34-qr-scan.md`
**Reuses:** `frontend-mobile/src/api/startCleaning.ts`, `frontend-mobile/src/verification/errors.ts`, `frontend-mobile/src/design/BottomSheet.tsx`, `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/tests/startTaskLifecycle.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

Starting a task looks like the design (Scan the QR, Wrong QR, Cleaning) while the scanner keeps every safeguard it has today.

## Scope

Restyle `StartTaskScreen.tsx`. Keep all logic: the task query, camera permission request once, the 350 ms mount delay, the 4 second ready check, `AppState` pause, the `inFlight` guard, `startCleaning`, `restart()`, the web fallback message, the "needs area inventory setup" message for version 1 tasks.

**Scanning** (task pending): full-screen dark camera (`night`, hide the stack header for this screen through `navigation.setOptions({ headerShown: false })`). Top overlay: back (48 round), torch toggle (yellow when on, labels "Torch on" and "Torch off"); title "Scan the task QR" (`cameraTitle`); "Find the code for {area}." (Urdu: label line then the area on its own line). Centre: a 236 square viewfinder with four white rounded corners and a yellow scan line moving up and down (1.9 s alternating, static under reduced motion). Bottom bar: "Hold the QR inside the frame. It scans by itself." and a ghost "Restart scanner". While confirming: a busy card "Confirming…". When permission is missing: the bottom bar shows "Allow camera access to scan the task QR code." with "Allow camera" or "Open camera settings" as today.

**Wrong or failed scan**: instead of the red inline box, a `BottomSheet`: when the error is the wrong-task or wrong-area case, "This QR is for another task" with "Find the code for {area}, then scan again." (Urdu: label then area line); otherwise "Couldn't confirm the start" with the message from `verificationErrorMessage`. Action "Scan again" calls `restart()`. Read `src/verification/errors.ts` to find how the wrong-QR case is identified; if it cannot be told apart, always use the second title and log it.

**Cleaning started** (task now in progress): white screen, `TopBar` with the area name; a blue 96 badge with a droplet; "Cleaning started" (`headline`); "Started at {time}. Finish by {end}."; a `blueWash` note with a QR icon "Clean everything on this list. Then scan the same QR to take photos."; dock `next` "Cleaning is finished" (QR icon) that replaces this screen with `Verification` (`requirePhotoQr: true`), as today's "Take task photos" does. One success haptic when the start is confirmed.

## Explicit non-scope

- The "What to clean" list on this screen (the design shows it; it needs the manifest) → spec 33 shows it on task details; here show it only if the manifest is already in the query cache, otherwise omit. Record the choice in the Log.
- The photo flow → spec 45.

## Reuse first

- Keep `tests/startTaskLifecycle.test.mjs` green under the test-only exception.

## Steps

1. Restyle the three states.
2. Write the screen test; adjust only changed wording in the old test.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/qrScan.test.mjs` passes: the scanning state shows the title and the area; a scan calls `startCleaning` once even if the scanner fires twice; a rejection opens the sheet and "Scan again" restarts the camera; success shows "Cleaning started" and "Cleaning is finished" replaces the screen with `Verification`; the torch label toggles; Urdu puts the area on its own line. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/startTaskLifecycle.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Restyled `StartTaskScreen.tsx` into three states: dark scanner, `BottomSheet` for wrong or failed scans, white "Cleaning started" page. All logic is unchanged (task query, permission asked once, 350 ms mount delay, 4 s ready check, `AppState` pause, `inFlight` guard, `startCleaning`, `restart()`, web message, version 1 message). New `tests/screens/qrScan.test.mjs` has 14 tests, all passing. `tests/startTaskLifecycle.test.mjs` passes 1/1. Whole suite passes 409/409. Typecheck has 0 errors. `build:web` passes.
  - **Test-only exception.** `startTaskLifecycle.test.mjs` moved from its own temp-dir mocks onto `tests/support/nativeHarness.mjs`, because the old `Button` and `Text` stubs and the bare `react-native` mock cannot render `ActionButton` or `BottomSheet`. It keeps every step and assertion: background and stale callbacks are ignored, a double scan calls `startCleaning` once, a rejection removes the camera and shows the server message with no navigation, `Scan again` rescans with the right arguments, success removes the camera and keeps the worker on the cleaning page, and the photos button replaces with `Verification {taskId: 7, requirePhotoQr: true}`. Only the wording changed: "In progress" became "Cleaning started", and "Take task photos" became "Cleaning is finished". The navigation stub gained a no-op `setOptions`.
  - **How the wrong QR is identified.** `verification/errors.ts` cannot tell this case apart. The server's start route sends `errors: [{ code: 'AREA_QR_MISMATCH' }]` in its envelope, which is the same envelope `recoveryPolicy.ts` already reads codes from. The screen checks that code and shows "This QR is for another task". Every other failure, including camera open and permission errors, shows "Couldn't confirm the start" with the message. Android back or a scrim tap on the sheet calls `restart()`.
  - **"What to clean" list left out.** No query cache key for the manifest exists: `VerificationScreen` keeps the manifest in local state, and spec 33 has not run. The note still says "this list"; spec 33 or 49 may want to revisit that wording.
  - **Departures from the spec or design.**
    - "Restart scanner" is a local white ghost button. `ActionButton` ghost uses `blueDeep` text, which fails contrast on `night`.
    - The camera top has no gradient, because no translucent `night` token exists. The title block sits above the viewfinder in the layout instead of overlapping it, so long Urdu lines cannot cover the frame.
    - Torch labels follow the spec ("Torch on" and "Torch off"), not the design's "Light".
    - The torch shows only on native once camera permission is granted.
    - The scan line is a straight 3 px yellow bar with no QR illustration behind it.
    - The task description that the old screen showed is not on the scanner. Task details (spec 33) owns it.
    - The old "Back to tasks" button is replaced by the back button (camera) or the `TopBar` back (white pages).
    - Loading uses skeletons, and a load error uses `ErrorState` ("Try again" in place of "Retry loading task").
    - Tasks that are not pending and not in progress show the title, time range and `taskState` pill.
  - **Strings without Urdu, for spec 49:** "Couldn't confirm the start", "This task needs area inventory setup. Ask your manager to repair or replace it.", "Scanner paused", "Camera could not open. Restart the scanner.", "Camera permission could not be requested. Try again.", "Loading assigned task…" (accessibility label only).
  - **Not verified:** a device, the camera or torch on hardware, screen reader order, font scaling, and the success haptic on hardware. The 360 by 700 check was done by layout arithmetic only, not in a browser, because reaching this screen in the web export needs a signed-in session and a task. At 700 high, the camera area is about 560 and the Urdu top block about 182, which leaves about 378 for the 236 frame. The widest row is 236 plus padding, inside 360.
