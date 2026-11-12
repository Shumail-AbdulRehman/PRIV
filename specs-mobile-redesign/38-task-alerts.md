# Spec 38 — Task alerts screen

**Status:** Done
**Depends on:** Spec 07, Spec 19, Spec 21
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/profile/TaskAlertsScreen.tsx`, `frontend-mobile/tests/screens/taskAlerts.test.mjs`, `specs-mobile-redesign/inventory/38-task-alerts.md`
**Reuses:** `frontend-mobile/src/notifications/native.ts`, `frontend-mobile/src/screens/HelpScreen.tsx`, `frontend-mobile/src/design/TopBar.tsx`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/ActionButton.tsx`, `design/mobile-redesign/v3/index.html`

## Goal

Phone alerts and permissions get their own screen with honest wording, using the exact registration logic that is on Help today.

## Scope

New screen `TaskAlertsScreen` (route `TaskAlerts`):
- `TopBar` "Task alerts".
- Status note (`blueWash`, bell icon): before any check this screen session, "Alert registration has not been checked on this screen. Your assigned work stays available." After "Retry phone alerts", the result message exactly as `HelpScreen` produces it today (enabled, denied, unavailable, failure), followed by "Registered does not prove every alert will arrive. Your work always stays in this app."
- "Permissions" block: Camera and Location rows with a pill "Allowed" (green) or "Not allowed" (red), read on focus with `getCameraPermissionsAsync` and `getForegroundPermissionsAsync`. Reading never prompts.
- Actions: outline "Retry phone alerts" (busy while registering, same lock and call `registerPhoneAlerts(scope, language, true)` as `HelpScreen`), ghost "Open settings" (`Linking.openSettings`, with the existing fallback message "Open this app in your phone settings." on failure).

Copy the logic from `HelpScreen.tsx`; do not edit `HelpScreen.tsx` here (spec 39 removes the duplicate there).

## Explicit non-scope

- Help content → spec 39. Registering the route → spec 48.
- Changing `notifications/native.ts` → spec 00 (never).

## Reuse first

- The registration lock and messages from `HelpScreen.tsx`.

## Steps

1. Build the screen.
2. Test it with mocked permissions and registration.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/taskAlerts.test.mjs` passes: the initial note shows the not-checked text; a granted camera and denied location show "Allowed" and "Not allowed"; retry calls `registerPhoneAlerts` once even when pressed twice and shows "Phone alerts registered." for `enabled`; a thrown error shows the could-not-confirm message; "Open settings" calls `Linking.openSettings`. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `TaskAlertsScreen` and `tests/screens/taskAlerts.test.mjs` (9 tests, all pass). Whole suite ran twice: 430 tests, 429 pass, 1 fail: `tests/nativeComposition.test.mjs` fails at module load (`Platform.select is not a function` from react-navigation); that file is modified by another session (spec 39 area) and not mine. Typecheck 0 errors; `build:web` passes (the screen is not in the bundle until spec 48 routes it). Not verified: 360x700 browser check (screen unrouted, so not reachable in the export); device, font scaling, screen reader. Urdu missing for "Not allowed", "Location", "Retry phone alerts", "Phone alerts registered." and the other result messages, "Open this app in your phone settings." (spec 49; shown in English via `t()`). Spec said `Camera`/`Location` read via `getCameraPermissionsAsync` from `Camera` namespace of expo-camera; used `Camera.getCameraPermissionsAsync`.
- **2026-11-11** — Follow-up: the Urdu test now presses retry and asserts `registerPhoneAlerts` was called with `['7_2', 'ur', true]` (moved from the removed HelpScreen test). taskAlerts 9/9; whole suite 430/430, 0 failures (nativeComposition passes now). Status set to Done.
- **2026-11-12** — Part 1 release-check fix: each Allowed/Not allowed pill sits in a centred slot in its row (Pill's own alignSelf flex-start overrode the row's centring). Regression assertion in tests/screens/taskAlerts.test.mjs; re-rendered at 360x700 in English and Urdu, pills centred in the rows.
