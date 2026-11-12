# Spec 68 inventory: failed photo-QR scan pauses the scanner

- Rule: a QR scanner never rescans by itself after a failed scan. It stops (`onBarcodeScanned` undefined plus a ref guard for late native events), keeps the error on screen and resumes only on "Scan again". `StartTaskScreen` (`!error` in `scanning`, `restart()`) and `VerificationScreen` (`scanHeldRef`/`scanHeld`, `scanAgain`) both follow it.
- `VerificationScreen.tsx` `ScanView` takes `held` and `onScanAgain`; the held bar shows the error or "The scan did not finish. Tap Scan again to try once more." (Urdu in `staffAppTranslations.ts`).
- Test: `frontend-mobile/tests/screens/scanErrorLoop.test.mjs` (mocks of `photoPendingUpload.test.mjs`, with a counting `openCaptureSession`, a throwing `captureClock` and a switchable capture account).
