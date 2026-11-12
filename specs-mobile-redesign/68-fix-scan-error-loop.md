# Spec 68 — Fix: a failed photo-QR scan never retries by itself

**Status:** Done
**Depends on:** Spec 67
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/scanErrorLoop.test.mjs`, `specs-mobile-redesign/inventory/68-fix-scan-error-loop.md`
**Reuses:** `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/src/screens/StartTaskScreen.tsx`, `frontend-mobile/tests/support/nativeHarness.mjs`, `frontend-mobile/tests/screens/photoPendingUpload.test.mjs`

## Goal

The owner's APK 2.2.1 video (2026-11-12, task 1288 already started) showed the photo scanner flickering between "Please wait…" and "Scan the same QR" with no lasting error. Every scan failed (the native capture-quality module was missing from that build, so `captureClock()` threw), and the scanner scanned the QR still in view again at once. After this spec any failed photo-QR scan stops the scanner, keeps the error on screen and offers "Scan again"; scanning resumes only on that tap.

## Root cause

`VerificationScreen.tsx` `scanned()` runs inside `action()`, which clears the message when it starts and swallows the error into `message` when it fails. On failure the screen returns from `locating` to `scan`, the `CameraView` (unmounted while locating) mounts again with `onBarcodeScanned` live, and the QR still in the frame fires a new `scanned()` within a second. That clears the message, shows "Please wait…", fails again: an endless loop where the error is visible for well under a second. A failure before `locating` (manifest load) loops faster still, because the camera never unmounts. The silent `if(!valid())return;` exit loops the same way with no message at all. `StartTaskScreen.tsx` already stops: `scanning` is false while `error` is set, and only its "Scan again" button (`restart()`) clears it.

## Scope

- `VerificationScreen.tsx`: a scan hold (`scanHeldRef` plus `scanHeld` state). `scanned()` sets it whenever the attempt does not reach the capture camera (thrown error or silent exit). While held, the `CameraView` gets no `onBarcodeScanned` and no `barcodeScannerSettings`, and the handler also checks the ref so a late native event from the old handler is ignored. `beginPhotos()` releases the hold before it enters `scan`.
- `ScanView`: while held, the bar shows the error (or "The scan did not finish. Tap Scan again to try once more." when there is none) and a "Scan again" `ActionButton`; the "Hold the QR…" line and "Restart camera" are hidden. "Scan again" clears the message and releases the hold.
- Urdu for "The scan did not finish. Tap Scan again to try once more." in `staffAppTranslations.ts`. "Scan again" already has Urdu.
- This spec is the **sole later editor** of `VerificationScreen.tsx` (spec 45; last edited by spec 64) and `staffAppTranslations.ts` (spec 49), and changes only: the scan-hold ref, state and `holdScan`, the `try/finally` around `scanned()`'s work, `holdScan(false)` in `beginPhotos()`, `scanAgain`, the `CameraView` scan props, and `ScanView`'s held bar and two new props; one added string.
- `StartTaskScreen.tsx` is read only: it already pauses on error (see Root cause).

## Explicit non-scope

- The missing native module in the APK → build packaging outside the specs; spec 50 owns the release check.
- Capture-mode errors, upload and retake flows → unchanged (spec 45, spec 64).
- `StartTaskScreen.tsx` behaviour → unchanged (spec 62 last edited it).
- Translating `messageFor`'s generic fallback → spec 49 owns the Urdu sweep.

## Reuse first

- `StartTaskScreen`'s pause-until-"Scan again" model; `ActionButton`, `StaffText`, the `inFlight` guard, the mocks of `photoPendingUpload.test.mjs`.

## Steps

1. Add the hold to `VerificationScreen.tsx` and the held bar to `ScanView`; add the Urdu string.
2. Write `tests/screens/scanErrorLoop.test.mjs`.
3. Run the new test, the suite, typecheck and `build:web`.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/scanErrorLoop.test.mjs` passes: when `openCaptureSession` throws, the error and "Scan again" show, the camera has no `onBarcodeScanned`, two more calls of the old handler do not call `openCaptureSession` again, and after "Scan again" a scan opens the session and reaches "Take photo"; a throwing `captureClock` holds the same way; a silent stop shows the fallback line; leaving and reopening the scanner resumes it; Urdu shows the Urdu line and button. [unit]
- [x] `grep -n "scanHeldRef.current" frontend-mobile/src/screens/verification/VerificationScreen.tsx` prints the handler guard. [static]
- [x] `grep -n "The scan did not finish. Tap Scan again to try once more." frontend-mobile/src/i18n/staffAppTranslations.ts` prints one line. [static]
- [x] Existing tests pass with no change. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]
- [x] No raw hex colour was added to the files this spec edits. [static]

## Log

- **2026-11-12** — Written from the owner's video and the lead's finding (`captureClock()` throws: CaptureQuality native module missing from APK 2.2.1). Server evidence: `priv_manual_test` has 0 capture sessions and 0 verification requests for task 1288, while `CaptureSession`/`TaskVerificationItem` index scans (about 280) show the manifest being reloaded once per loop; the session POST was never sent because `openCaptureSession` calls `captureClock()` first.
- Changes as in Scope. `scanErrorLoop.test.mjs` 5/5. No existing test changed. New assertions fail on the old tree by construction (no "Scan again" in `ScanView`, `onBarcodeScanned` always set in `scan`); the old tree was not rerun. `npm test --prefix frontend-mobile` 690/690; typecheck 0; `build:web` exit 0 (no expo export running); no raw hex in `VerificationScreen.tsx`. Not checked on the phone.
