# Spec 64 — Fix: no "Take a new photo" while a photo waits to upload

**Status:** Done
**Depends on:** Spec 53
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/photoPendingUpload.test.mjs`, `specs-mobile-redesign/inventory/64-fix-new-photo-while-uploading.md`
**Reuses:** `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/src/launch/recoveryPolicy.ts`, `frontend-mobile/tests/screens/photoCapture.test.mjs`, `frontend-mobile/tests/verificationLifecycle.test.mjs`, `frontend-mobile/tests/photoCaptureControls.test.mjs`, `frontend-mobile/tests/support/nativeHarness.mjs`

## Goal

While a photo for the current view is saved on the phone but not yet sent, the person is not offered a "Take a new photo" button that does nothing. They see a short status line instead, and the normal capture action returns once the upload finishes. This fixes finding 64 (`docs/plan-project/mobile-redesign/planning/verification.md`; spec 45 Log). Owner decision: hide the button and show "This photo is saved on your phone and has not uploaded yet." next to "Upload again"; nothing is ever thrown away.

## Scope

How the unsent state is known: `VerificationScreen.tsx` keeps the saved photo in `pending` (line 55, `PendingPhoto`, mirrored in `pendingRef`). `rememberPending(photo)` (line 66) sets it after a capture whose `sendPhoto` fails (the `catch` at line 186) and `rememberPending(null)` clears it when `sendPhoto` (line 151) or `checkResult` (line 190) learns the photo was received. While `pending` is set, the screen renders the "pending" page (line 229) whose dock offers "Upload again" (`uploadAgain`, line 201) and, today, a ghost "Take a new photo" (line 234, shown when `authority.capture`, from `photoAuthority(manifest)`). That button calls `beginPhotos()`, which at line 141 deletes the pending file and clears it, then re-activates a slot the same slot still holds; the person sees nothing happen and the photo is dropped. When the photo is rejected the server result replaces the manifest state and `pending` is already null, so the normal retake flow (`RECAPTURE_REQUIRED`, "Retake photo") applies; that path is unchanged.

- In the upload branch of the pending dock (online and `authority.upload`), remove the "Take a new photo" `ActionButton` and show the status line "This photo is saved on your phone and has not uploaded yet." (muted, centred, no ellipsis) beside "Upload again", in the same `View style={styles.stack}`.
- The line shows whenever a photo is pending in that branch. It must not claim an upload is running: this dock only appears after a failed `sendPhoto` and nothing retries by itself, so the line says the photo is saved and has not uploaded yet. Offline and upload-unavailable branches keep their `DockStatus` and have no capture button today; unchanged.
- Add the Urdu for "This photo is saved on your phone and has not uploaded yet." to `frontend-mobile/src/i18n/staffAppTranslations.ts` (never `translations.ts`).
- This spec is the **sole later editor** among specs 56 to 65 of `VerificationScreen.tsx` (owned by spec 45) and `staffAppTranslations.ts` (owned by spec 49), and changes only the dock lines named above and the one added string.
- Tests: `photoCapture.test.mjs` line 256 asserts `findPressable(r, 'Take a new photo')` on the failed-upload pending page; that single assertion changes to assert the button is absent and the status line is present (every other assertion stays). `verificationLifecycle.test.mjs` and `photoCaptureControls.test.mjs` should need no change (test-only exception if one does; Log it).

## Explicit non-scope

- Removing the temporary-photo text, "Check result" or "Refresh results" → unchanged (spec 45).
- Automatic upload retry or a queue that outlives the screen → not planned (no spec; owner decision, spec 45 keeps manual upload).
- Retake after a rejected photo ("Retake photo", the retake sheet) → unchanged (spec 45).
- `beginPhotos` behaviour and slot activation → unchanged (spec 31, spec 45).
- Other Urdu strings → spec 49.

## Reuse first

- `ActionButton`, `StaffText`, `styles.stack`, `authority`, `pending` already in `VerificationScreen.tsx`. Nothing new to add except one string.

## Steps

1. Edit the pending dock in `VerificationScreen.tsx`; add the Urdu string.
2. Write `tests/screens/photoPendingUpload.test.mjs` with the mocks of `photoCapture.test.mjs`.
3. Adapt line 256 of `photoCapture.test.mjs`; run the existing tests and the suite.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/photoPendingUpload.test.mjs` passes: with a failed upload (photo pending) there is no "Take a new photo" button, "This photo is saved on your phone and has not uploaded yet." and "Upload again" are shown; after "Upload again" succeeds the pending page is gone; after a rejected photo the "Retake photo" action is offered as before; the Urdu run shows the Urdu line; the first case fails on the tree before the change. [unit]
- [x] `grep -n "Take a new photo" frontend-mobile/src/screens/verification/VerificationScreen.tsx` prints nothing. [static]
- [x] `grep -n "This photo is saved on your phone and has not uploaded yet." frontend-mobile/src/i18n/staffAppTranslations.ts` prints one line and `git diff --stat frontend-mobile/src/i18n/translations.ts` shows no change from this spec. [static]
- [x] `tests/screens/photoCapture.test.mjs`, `tests/verificationLifecycle.test.mjs` and `tests/photoCaptureControls.test.mjs` pass; no assertion removed except the one at line 256, replaced as described. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]
- [x] No raw hex colour was added to the files this spec edits. [static]

## Log

- **2026-11-12** — Written from the owner's decision on finding 64.
- `VerificationScreen.tsx`: the ghost "Take a new photo" button in the pending dock is replaced by a muted centred "This photo is saved on your phone and has not uploaded yet." line (polite live region) under "Upload again". Pending is detected by `pending` (set by `rememberPending` after a failed `sendPhoto`, cleared on receipt), so nothing else changed. `staffAppTranslations.ts`: Urdu line added.
- Tests: new `photoPendingUpload.test.mjs` (4 tests, en and ur). `photoCapture.test.mjs`: the one assertion expecting the "Take a new photo" button now asserts it is absent and the status line is present; all else unchanged. `verificationLifecycle` and `photoCaptureControls` needed no change. Four files 38/38.
- `npm test`: 663/663 pass, 0 fail. `npm run typecheck`: 0 errors. `npm run build:web`: exit 0. No raw hex added.
- **2026-11-12** — Coordinator correction: the line first read "Uploading this photo…", which was false (the pending dock appears only after a failed send and nothing retries automatically). Now "This photo is saved on your phone and has not uploaded yet."; live region removed; old Urdu key replaced. Tests and spec text updated.
