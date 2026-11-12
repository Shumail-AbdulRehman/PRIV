# Spec 71 inventory: faster task photos on the phone

- Rule: a task photo whose upload result needs nothing from the person (`PASSED`, `REVIEW_REQUIRED`, `PRIVACY_HOLD` on a requirement slot, with a next slot that can be taken) stays on the camera. `VerificationScreen.tsx` `withPhotoResult` builds the local session from the upload response; `stayOnCamera` applies it and sets `done`. Everything else reads the manifest and shows the list or sheet as before.
- `CaptureDoneCard` (`PhotoCaptureControls.tsx`): busy-card look, `CircleCheck` in yellow, one success haptic; string "{item} photo done" (Urdu in `staffAppTranslations.ts`).
- `photoPictureSize(sizes)` (exported from `VerificationScreen.tsx`): smallest 4:3 size, long side at least 1800, at most about 3.2 MP, else null. Asked once per app run from the Android scanner; set on the task camera before it mounts.
- Capture order: resize (1800, JPEG 0.85), then `inspectStill` on the resized file; the size rule reads the camera picture's own size.
- Slot activation waits for `onCameraReady`.
- Test: `frontend-mobile/tests/screens/fasterPhotoFlow.test.mjs` (mocks of `photoCapture.test.mjs`, with counting manifest reads, activations, camera mounts, resize and inspect calls).
