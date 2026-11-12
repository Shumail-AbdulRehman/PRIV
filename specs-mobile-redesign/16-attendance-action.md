# Spec 16 — Check-in and check-out action hook

**Status:** Done
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/day/useAttendanceAction.ts`, `frontend-mobile/tests/day/attendanceAction.test.mjs`, `specs-mobile-redesign/inventory/16-attendance-action.md`
**Reuses:** `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/launch/recoveryPolicy.ts`, `frontend-mobile/src/launch/launchApi.ts`, `frontend-mobile/src/verification/location.ts`, `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/utils/upload.ts`, `frontend-mobile/tests/support/nativeHarness.mjs`

## Goal

The whole check-in and check-out sequence lives in one hook with explicit phases, so the new screens can show each step, while the rules and server calls stay exactly as `HomeScreen.tsx` does them today.

## Scope

Move, do not rewrite, the logic in `HomeScreen.tsx` functions `handleAttendanceAction` and `submitAttendanceSelfie` into `useAttendanceAction({ staffId, records, now, online })`. `HomeScreen.tsx` itself is not edited here (spec 46 switches it over).

The hook returns `{ phase, mode, start(mode), retryLocation(), continueAnyway(), cancel(), submitSelfie(uri), result, error, accuracyMeters }`:

| Phase | Meaning | Entered when |
|---|---|---|
| `idle` | Nothing in progress | Start, cancel, finished |
| `checkingServer` | Re-reading attendance before acting | `start` called (existing `readAttendance` plus `attendanceResult` step; if already recorded, go to `done` with that result) |
| `needsPermission` | Camera or location refused | Permission request denied (camera first, then location, same order as today) |
| `locating` | Getting a high-accuracy fix | Permissions granted (existing `currentLocation` with `Location.watchPositionAsync`, `Accuracy.Highest`) |
| `weakSignal` | Accuracy worse than 50 m | Same threshold as today; `retryLocation` or `continueAnyway` |
| `notAtLocation` | Server said the person is outside the location | The upload failed with the server's geofence error; keep the server's message in `error` |
| `selfie` | Camera open | Location accepted |
| `saving` | Uploading the selfie | `submitSelfie` called (existing `reconcileAttendance` plus `uploadFormData('/attendance/check-in' or '/attendance/check-out')`, 60 second timeout, `attendanceId` for check-out) |
| `done` | Recorded | Upload reconciled; invalidates `staffQueryKeys.attendance` and `staffQueryKeys.tasksToday` exactly as today; `result` holds `{ mode, at, late }` |
| `error` | Anything else | Message chosen exactly as today ("Internet needed to continue" for network errors, else the server message, else "Unable to open attendance.") |

Rules carried over unchanged: offline blocks start with "Internet needed to continue"; a missing record gives "Refresh to load your shift before continuing."; duplicate starts while busy are ignored; the hook never infers success from a captured photo, only from the reconciled server result.

To decide `notAtLocation`, read how the server reports a geofence rejection in `backend/src/services/attendanceWrites.service.ts` (read only) and match on its status and code; if no reliable code exists, use `error` with the server message and say so in the Log.

## Explicit non-scope

- Location, selfie and receipt screens → spec 31. Wiring into My day → spec 46.
- Any change to `recoveryPolicy.ts`, `launchApi.ts`, `location.ts` or the backend → spec 00 (never).

## Reuse first

- Import every helper the old code imports; keep the same calls in the same order.

## Steps

1. Copy the two functions from `HomeScreen.tsx` into the hook and turn their branches into phase changes.
2. Test each phase with the harness, mocking camera and location permission, `currentLocation`, `readAttendance` and `uploadFormData`.
3. Record the phase table in the inventory fragment.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/day/attendanceAction.test.mjs` passes: start while offline sets `error` "Internet needed to continue" and calls nothing; an already-recorded check-in goes straight to `done` without the camera; camera refused gives `needsPermission`; accuracy 86 m gives `weakSignal`, and `continueAnyway` goes to `selfie`; `submitSelfie` uploads to `/attendance/check-in` with latitude, longitude, accuracy and the image, then `done` and both query invalidations; check-out sends `attendanceId`; a second `start` while saving is ignored; `cancel` returns to `idle`. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures (including the existing `tests/attendanceRecovery.test.mjs`); real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `frontend-mobile/src/screens/day/useAttendanceAction.ts`: the two HomeScreen functions moved with the same imports, calls and order (`readAttendance` → `attendanceResult` → `setQueryData`; camera then location permission; `currentLocation` over `watchPositionAsync` Highest/1000/0; FormData plus `reconcileAttendance` with `uploadFormData(..., 60000)`; both invalidations). HomeScreen.tsx untouched. Tests: `tests/day/attendanceAction.test.mjs` 19/19 pass; whole mobile suite 258/258 pass (includes `attendanceRecovery.test.mjs`); typecheck 0 errors; `build:web` passes (the hook is not imported by any screen yet, so the bundle does not include it until spec 46; typecheck covers it). Inventory fragment `inventory/16-attendance-action.md` with the phase table.
  - **Geofence:** `attendanceWrites.service.ts` rejects with `ApiError(400, "You are outside your site's attendance area. Move closer and try again.")` and no error code, so there is no reliable code. As the spec directs, the hook reports it as `error` with the server's message; `notAtLocation` stays in the phase type, documented as reserved and never entered. Spec 31 should not rely on it until the server adds a code (backend change, not in this plan's scope).
  - **Choices the spec left open:** `error` holds English keys or the server message (not pre-translated; render through `t()`), unlike the old code which called `t()` inside the handler. Old Alerts (camera/location required, low accuracy, attendance failed) are now phases only; the screen must show them. `retryLocation` re-runs only the location step (old "Retry" dropped back to idle and needed a fresh press). `start` is ignored in `checkingServer`, `locating`, `weakSignal`, `selfie`, `saving`; allowed from `idle`, `needsPermission`, `error`, `done`. `cancel` is ignored while `saving` so the upload's server result is never hidden (invariant 3). A failed upload goes to `error` and clears the capture (old code threw back into `AttendanceCamera` so the camera stayed open); retry is a new `start`, which re-reads the server first. Upload failures with `ERR_NETWORK` now show "Internet needed to continue" (old upload path showed the raw "Network Error"); other upload fallbacks keep "Unable to check in." / "Unable to check out.". `result.late` is `status === 'LATE'` (the server's late check-in status; always false after check-out since the status becomes `CHECKED_OUT`).
  - **Strings:** no new strings; "Unable to check in." / "Unable to check out." were already untranslated in the old code — spec 49 may want to add them.
  - Not applicable: 360 by 700 layout, device, screen reader (no UI in this spec).
