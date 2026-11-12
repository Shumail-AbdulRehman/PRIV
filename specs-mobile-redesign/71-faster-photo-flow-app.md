# Spec 71 — Faster task photos: camera stays open, fewer round trips, smaller capture

**Status:** Done
**Depends on:** Spec 68
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/fasterPhotoFlow.test.mjs`, `specs-mobile-redesign/inventory/71-faster-photo-flow-app.md`
**Reuses:** `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/components/PhotoCaptureControls.tsx`, `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/src/verification/api.ts`, `frontend-mobile/src/verification/policy.ts`, `frontend-mobile/src/verification/capturePolicy.ts`, `frontend-mobile/modules/capture-quality/index.ts`, `frontend-mobile/tests/support/nativeHarness.mjs`, `frontend-mobile/tests/screens/photoCapture.test.mjs`, `frontend-mobile/tests/verificationLifecycle.test.mjs`

## Goal

One task photo takes about 11 to 13 s from shutter to the next usable shutter (photo-flow timing report, 2026-11-12, rows 3 and 4 of its ranked list). About 2 to 5 s of that is on the phone: the camera closes after every photo, the person taps "Next photo", the camera reopens, two manifest reads wrap each upload, and a full-size picture is decoded twice. After this spec a photo that needs nothing from the person is confirmed over the live camera and the next item is ready with no tap, no list and no camera restart. Every other outcome behaves as before.

## Scope

- **Camera stays open.** While a new photo's first upload runs, the capture view and its `CameraView` stay mounted (busy card over the camera). When the upload response is `PASSED`, `REVIEW_REQUIRED` or `PRIVACY_HOLD` for a requirement slot, the screen updates its local manifest and session from that response, shows "{item} photo done" over the camera with one success haptic, and the next slot activates by itself. The list or a sheet is shown, after one manifest read as today, when the result needs the person (retake, clean, service failure), when no next slot can be taken (all done, window ended, pending checks, a room-photo slot) or when the response lacks what is needed. A failed send goes to the saved-photo page as today.
- **No manifest read around a normal upload.** The read before the first send is dropped; the server checks upload authority itself. When the server refuses (an HTTP status), the screen reads the manifest once and shows "Photo upload is unavailable. Check the result before retrying. Your received photos are kept." if uploads are closed, otherwise the server's message. "Upload again" and "Check result" keep their reads.
- **Timer starts when the camera is ready.** Slot activation also waits for `onCameraReady`.
- **Smaller capture.** On Android the scanner camera asks `getAvailablePictureSizesAsync` once per app run; the smallest 4:3 size with a long side of at least 1800 and at most about 3.2 MP is passed as `pictureSize` to the task camera only (set before it mounts, so it never restarts). Nothing fits, or the call fails: no `pictureSize` (full size, as today). iOS is unchanged. The picture is resized first (1800 px long side, JPEG 0.85, as today; landscape or portrait from the picture's own size), then `inspectStill` reads the resized file. The "too small" rule keeps reading the camera picture's own size.
- New string "{item} photo done" with Urdu in `staffAppTranslations.ts`. `PhotoCaptureControls.tsx` gains `CaptureDoneCard` (the busy card's look, a check icon, a polite live region).
- This spec is the **sole later editor** of `VerificationScreen.tsx` (spec 45; last edited by spec 68), `PhotoCaptureControls.tsx` (spec 62), `staffAppTranslations.ts` (spec 49), and of the two tests below, and changes only: the sending, done and picture-size state; `photoPictureSize`, `withPhotoResult` and `stayOnCamera`; the activation guard; `sendPhoto`'s authority read and refusal handling; `capture()`'s resize-then-inspect order and failure mode change; the camera's `pictureSize` and ready handler; `CaptureView`'s done card; one component; one string. `api.ts`, `policy.ts`, `capturePolicy.ts` and `capture-quality` are read only.
- Test adaptations (every behaviour assertion kept): in `photoCapture.test.mjs`, "a clean result…" starts from two done photos so the shot is the last one (asserts "3 of 3"), and "review and service-failure…" does the same for the review case only; in `verificationLifecycle.test.mjs` the `PhotoCaptureControls` mock gains `CaptureDoneCard` and "a checked first photo advances…" no longer taps "Next photo" and asserts it is absent.

## Explicit non-scope

- Server checks, timings, storage and AI → spec 69 (server speed-ups, written separately).
- One photo at a time, QR and GPS steps, the scan error hold → unchanged (spec 45, spec 68).
- The saved-photo page and its line → unchanged (spec 64).
- A staged progress animation after the shutter → not written yet (owner queue in the `PROGRESS.md` Log); until then spec 45's busy card stays.
- Translation lookup behaviour → unchanged (spec 49).

## Reuse first

- `nextSlot`, `captureAllowed` (`policy.ts`), `qualityInstruction`, `photoAuthority`, `CaptureBusyCard`'s styles, `translateText`, `isolate`, the harness `hapticsCalls`, and the mocks of `photoCapture.test.mjs`.

## Steps

1. Edit `VerificationScreen.tsx`, add `CaptureDoneCard` and the Urdu string.
2. Write `tests/screens/fasterPhotoFlow.test.mjs`; adapt the three tests named in Scope.
3. Run the new test, the suite, typecheck, `build:web` and e2e once.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/fasterPhotoFlow.test.mjs` passes: after a `PASSED` or `REVIEW_REQUIRED` upload with a next item, the camera is not mounted again, "Sink photo done" shows, a success haptic fires, the next slot is activated and the shutter is enabled with no tap and no manifest read; retake, clean and service failure read the manifest once and show the list and sheet; the last photo goes to the list; a failed send shows the saved-photo page; a refusal with uploads closed shows the unavailable message and otherwise the server's; activation waits for `onCameraReady`; `inspectStill` gets the resized URI and the resize keeps 1800 and 0.85; a 640x480 picture is refused as too small; `photoPictureSize` picks 1920x1440 from a typical list and null when nothing fits; the scanner asks sizes once and only the task camera gets the size; Urdu shows the Urdu line. [unit]
- [x] `grep -n "{item} photo done" frontend-mobile/src/i18n/staffAppTranslations.ts` prints one line. [static]
- [x] `photoCapture.test.mjs` and `verificationLifecycle.test.mjs` pass with only the adaptations listed in Scope. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]
- [x] No raw hex colour was added to the files this spec edits. [static]

## Log

- **2026-11-12** — Written and done (helper) from the photo-flow timing report, rows 3 and 4. Upload response checked against `directPhotoStatus` (attempt id, state, reason, instructions, outcome, review reason); it carries no allowed actions or session list, so outcomes that lead to the list still read the manifest. Server activation is idempotent for an activated slot. expo-camera 17.0.10: Android `pictureSize` rebinds the camera when changed, so it is fixed before the task camera mounts; iOS sizes are presets and stay at the default.
- Tests: `fasterPhotoFlow.test.mjs` 14/14. Adapted as listed in Scope (3 tests); before adapting, exactly those 3 failed. `npm test --prefix frontend-mobile` 704/704; typecheck 0; `build:web` exit 0 (no expo export running); `npm run test:e2e` 112/112 (2.8 min); no raw hex. Not checked on a phone: real time saved, the camera staying live during upload, the chosen picture size, rotation of the smaller picture, the haptic.
