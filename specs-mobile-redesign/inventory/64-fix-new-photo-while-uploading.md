# Spec 64 inventory: no "Take a new photo" while uploading

- `VerificationScreen.tsx` pending dock shows "This photo is saved on your phone and has not uploaded yet." beside "Upload again"; there is no "Take a new photo" button while `pending` is set. Normal capture returns once `pending` clears.
- Urdu line lives in `src/i18n/staffAppTranslations.ts`.
- Test: `frontend-mobile/tests/screens/photoPendingUpload.test.mjs` (same mocks as `photoCapture.test.mjs`).
