# Spec 72 — Photo-check progress: stages and a percentage after the shutter

**Status:** Done
**Depends on:** Spec 70, Spec 71
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/components/PhotoCheckProgress.tsx`, `frontend-mobile/src/verification/photoCheck.ts`, `frontend-mobile/tests/screens/photoCheckProgress.test.mjs`, `frontend-mobile/src/api/uploadProgress.test.ts`, `specs-mobile-redesign/inventory/72-photo-check-progress.md`
**Reuses:** `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/components/PhotoCaptureControls.tsx`, `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/verification/api.ts`, `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/tests/support/nativeHarness.mjs`, `frontend-mobile/tests/verificationLifecycle.test.mjs`

## Goal

Owner request (`PROGRESS.md` Log, queued after spec 71): after the shutter, staff see what is really happening to the photo — checking photo quality, uploading, checking with AI, done — with one bar and a percentage, a short success or retake ending, in English and Urdu. It must never add waiting time: the card follows the real work and never holds it back.

## Scope

- **Stages, moved only by the real work.** `capture()` starts the check at "Checking photo quality" (shutter, resize, `inspectStill`, hash); the first send moves it to "Uploading photo"; all bytes sent moves it to "Checking with AI"; the server's answer ends it. A stage that finishes quickly is skipped; stages never go back. The card shows in the busy card's place only while the photo's work is busy, and is cleared when it ends; other busy work keeps `CaptureBusyCard`.
- **One honest percentage.** Quality 0 to 14 eased with time; upload 15 to 60 from the real bytes sent; AI 60 to 94 eased with time, never further; 100 only on the answer. The shown value only grows.
- **Real upload progress.** React Native's `fetch` cannot report bytes sent; its `XMLHttpRequest` can (`didSendNetworkData` on Android and iOS). `uploadFormData` gains an optional `onProgress`; only then the same POST (same URL, headers, body, timeout, 401 retry, account guards, error shapes) goes through `XMLHttpRequest`. Without it nothing changes. `uploadPhoto` passes it through. A throwing callback never breaks the upload. Unknown totals are ignored (the bar stays at 15 until the answer).
- **Endings.** Accepted (`PASSED`, `REVIEW_REQUIRED`, `PRIVACY_HOLD` and anything not a problem): the green tick pops; on the camera spec 71's "{item} photo done" card now has the check card's look at 100% with the tick, and keeps its success haptic. Retake, clean, service failure: an amber glyph, the matching sheet title at 100%, and a short shake while the list is read; the list and sheet then show as before.
- **Motion** (reuses motion tokens): card rise (`busy`), scan line down the camera during quality (`scanLine`), AI glyph pulse (`locateRing`), tick pop (`badge`), shake (3 × `press`). Reduced motion: fades only, no sweep, pulse, pop or shake; the bar jumps.
- **Accessibility and RTL.** The stage line is the one polite live region (iOS: one announcement per stage); the percentage is hidden from it and given as the bar's `progressbar` value. Urdu mirrors the row and fills the bar from the right; the percentage is isolated.
- Three new strings with Urdu in `staffAppTranslations.ts`: "Checking photo quality", "Uploading photo", "Checking with AI". Endings reuse existing strings. Colours are tokens only.
- This spec is the **sole later editor** of `VerificationScreen.tsx` (spec 45; last edited by spec 71), `PhotoCaptureControls.tsx` (spec 62; last edited by spec 71), `client.ts` (pre-redesign), `api.ts` (pre-redesign), `staffAppTranslations.ts` (spec 49; last edited by spec 70) and `verificationLifecycle.test.mjs` (last edited by spec 71), and changes only: the screen's `check` state, its clearing when busy ends, the stage moves in `capture()` and `sendPhoto()`, the progress callback for a new photo's first send, and `CaptureView`'s card choice; `CaptureDoneCard`'s look; `uploadFormData`'s optional progress path; `uploadPhoto`'s pass-through parameter; three strings; one mock line. `tokens.ts`, `StaffText.tsx` and the harness are read only.
- Test adaptation (behaviour kept): `verificationLifecycle.test.mjs` gains a stand-in for `/components/PhotoCheckProgress` (it stands in all camera parts, and the real one loads Reanimated). No assertion changed.

## Explicit non-scope

- Server calls, endpoints and payloads → unchanged (spec 69 and spec 70 own the server).
- One photo at a time, the scan error hold, the saved-photo page, the camera staying open → unchanged (spec 45, spec 68, spec 64, spec 71).
- "Upload again" and "Check result" from the saved-photo page → no check card (spec 64's page is unchanged).
- The `DESIGN-SYSTEM.md` motion table rows for this card → spec 02 (design tokens and their table; the lead adds the rows, no new token was added).

## Reuse first

- `CaptureBusyCard`'s card look, `motion` durations and `easeOut`, `whiteAlpha.track`, `isolate`, the result sheets' titles and their Urdu, the mocks of `fasterPhotoFlow.test.mjs`.

## Steps

1. Write `photoCheck.ts` and `PhotoCheckProgress.tsx`; add the progress path to `client.ts`/`api.ts`; wire the screen; restyle `CaptureDoneCard`; add the strings.
2. Write the two tests; add the one mock line.
3. Run the tests, the suite, typecheck, `build:web`, a rendered check and e2e once.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/photoCheckProgress.test.mjs` passes: percent bands (quality under 15, upload 15 to 60 from bytes, AI at most 94 after an hour, endings 100); stages only move forward and all bytes sent starts AI; on the screen, with each real promise held open, the card shows quality (with the sweep), upload at 15 then 37 for half the bytes and never back, AI at 60 or more and below 100, then "Sink photo done" at 100 with the tick and the success haptic and the camera still open; ten simulated minutes of AI stay at 94 until the answer; with nothing held the done card follows and the check card is gone; a retake answer shows the amber ending at 100 while the list is read, then the list; Upload again asks for no progress and shows no card; reduced motion has no sweep; the stage line is the live region and the percentage is not; Urdu labels for every stage. [unit]
- [x] `cd frontend-mobile && npx tsx --test src/api/uploadProgress.test.ts` passes: with a callback the same POST, headers and body go through `XMLHttpRequest`, fractions are reported 0 to 1 (unknown totals skipped), a refusal keeps message, status and `retry-after`, a network failure is a `TypeError`, a timeout says "Upload timed out", a throwing callback does not break the upload, and without a callback `fetch` is used. [unit]
- [x] `grep -c '"Checking photo quality"\|"Uploading photo"\|"Checking with AI"' frontend-mobile/src/i18n/staffAppTranslations.ts` prints 3. [static]
- [x] `fasterPhotoFlow`, `photoCapture`, `photoPendingUpload`, `scanErrorLoop`, `client` and `auth` tests pass unchanged; `verificationLifecycle.test.mjs` passes with only the mock line in Scope. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]
- [x] No raw hex colour was added to the files this spec edits or owns. [static]

## Log

- **2026-11-12** — Written and done (helper). Upload progress is real: `uploadFormData` used `fetch`, which reports no bytes sent; React Native 0.81's `XMLHttpRequest` emits upload progress on Android (OkHttp `ProgressRequestBody`, file size from the stream) and iOS, so the progress path uses it only when a callback is given. Updates reach the screen only when the shown percentage changes (at most 45 redraws per upload). The upload answer is the server's AI answer, so the AI stage is the time between the last byte and the response.
- Depends on spec 70 as well as 71: spec 70 also edits `staffAppTranslations.ts`, so 72 runs after it (wave 18).
- Tests: `photoCheckProgress.test.mjs` 10/10, `uploadProgress.test.ts` 3/3. Adapted: `verificationLifecycle.test.mjs` gains one mock line (16/16, no assertion changed); before it, its 16 tests failed to import Reanimated. `fasterPhotoFlow` 14/14, `photoCapture` 17/17, `photoPendingUpload` 4/4, `scanErrorLoop` 5/5, `client` 5/5, `auth` 4/4 unchanged. Found on the way: the harness's `react-native-svg` mock lacks `Line`, so the service-failure glyph is `Info` (as its sheet) rather than `CircleAlert`. `npm test --prefix frontend-mobile` 717/717; typecheck 0; `build:web` exit 0 (no expo export running); `npm run test:e2e` 112/112 (2.2 min); no raw hex.
- Rendered check: a scratch preview (copy of `src` with a preview entry, built with its own temp folder and `--clear`; the shared tree and `dist` untouched) rendering the real `PhotoCheckOverlay`, `CaptureDoneCard`, shutter and step bar over a sample sink picture, with a real `uploadFormData` progress upload of 6 MB to a local server that reads slowly and answers after 4.5 s. Headless Chrome at 360x700, English and Urdu: quality 7%, upload 47-49% (real bytes), AI 70-72%, done 100%; retake 100%; reduced motion has no sweep; document width 360; no page errors. Web cannot run the camera or `inspectStill`, so the quality stage there is a 1.5 s stand-in. Screenshots in `/tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/fix72/`. Not checked on a phone: real upload progress events, the haptic, TalkBack and VoiceOver announcements, motion smoothness.
