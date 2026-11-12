# Spec 35 — Task photo list

**Status:** Done
**Depends on:** Spec 08, Spec 19, Spec 20
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/verification/VerificationProgress.tsx`, `frontend-mobile/tests/screens/photoList.test.mjs`, `specs-mobile-redesign/inventory/35-photo-list.md`
**Reuses:** `frontend-mobile/src/verification/photoRowState.ts`, `frontend-mobile/src/verification/presentation.ts`, `frontend-mobile/src/verification/feedback.ts`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/tests/verificationLifecycle.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

The photo progress list (All screens > Task photos: Photo progress, Saved uploading, Ready to submit, Photos unavailable) shows each required photo with its real state.

## Scope

Rebuild `VerificationProgress` (props unchanged: `manifest`, `local`, `rows`, `online`, `lastUpdated`; add optional `onSelect(index)`):
- Header block (white): the area name (`headline`, untranslated), "{n} of {t} photos done" from `photoSummary` (spec 08), an 8 high progress bar (blue fill, direction mirrors).
- When the task is finished (submitted or completed): render nothing but a short "Work submitted" header; the receipt is spec 36's job.
- One row per entry from `photoStatuses(manifest, local, rows)`, filtered exactly as today (required ids plus `ENTRANCE` and `LAYOUT`): fixture tile (icon by fixture, like `PhotoGuide`), the item title through `translateText` and the view below it (muted), and at the end a `Pill` from `photoRow(state)` with its icon (`spinning` for "Saved, uploading").
- Under a row that needs action, show the correction text from `photoCorrection(photo.detail, t)` in `body` (as today).
- A row is pressable when `onSelect` is given (spec 45 uses it to jump to that photo).
- Footer: "Results updated · {time}" when `lastUpdated` exists.
- Offline: "Internet needed to upload. Reconnect, then tap Upload again." as a note above the list.

## Explicit non-scope

- The dock (next photo, submit, wait for upload) and the photo window → spec 45.
- Changing `photoStatuses` → spec 00 (never).

## Reuse first

- All labels from `photoRowState.ts`; do not map states here.

## Steps

1. Rebuild the component.
2. Test with crafted manifests; keep `tests/verificationLifecycle.test.mjs` green under the test-only exception.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/photoList.test.mjs` passes: a passed photo shows "Uploaded" (green); a saved queue row shows "Saved, uploading" with a spinning icon; a processing row shows "Uploaded, checking"; a recapture row shows "Retake photo" and its correction text; the header reads "3 of 7 photos done" for three done rows; offline shows the note; Urdu translates the fixture names but not the area name. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/verificationLifecycle.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Rebuilt `VerificationProgress` (props kept, optional `onSelect`) with tokens, `StaffText`, `Pill` and `photoRow`/`photoSummary`. New `tests/screens/photoList.test.mjs`: 10 pass. `verificationLifecycle.test.mjs` 16 pass (it mocks `VerificationProgress` to null, so no assertion there needed changing or moving). `npm test`: 419 pass, 0 fail. Typecheck 0 errors; `build:web` passes. No [runtime] box in this spec; no screenshot taken, so 360 wide not viewed. Choices: the muted view line under a title is the requirement's `instructionsSnapshot` (for ENTRANCE/LAYOUT rows, the standard room-photo text); fixture icons copied from `PhotoGuide` (ScanLine default). The old "Photo needs attention" banner and sentence copy are gone, as the spec lists none of them; the dock (spec 45) now owns next-step wording.
