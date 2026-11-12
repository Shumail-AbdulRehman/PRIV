# Spec 70 — Block reused task photos before the check

**Status:** Done
**Depends on:** Spec 69
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/verification-v2/reusedPhoto.test.ts`, `specs-mobile-redesign/inventory/70-block-reused-photos.md`
**Reuses:** `backend/src/services/verification-v2/directPhoto.service.ts`, `backend/src/services/verification-v2/duplicate.service.ts`, `backend/src/services/verification-v2/staffPhotoInstructions.ts`, `backend/src/services/verification-v2/photoDecision.service.ts`, `backend/src/services/verification-v2/quality.service.ts`, `frontend-mobile/src/i18n/staffAppTranslations.ts`

## Goal

The direct task-photo path (spec 69) works out and stores each photo's `sha256`, `normalizedHash` and `perceptualHash` but never compares them. The photo-flow analysis (2026-11-12, §3.2) saw the same image accepted three times across tasks, and nothing stops one sink photo from being sent for "Sink 1", "Sink 2" and "Sink 3" in one task. `duplicate.service.ts` is only used by the old `pipeline.service.ts`. After this spec a reused photo goes back to the staff member as a normal retake, before any Cloudflare or Cloudinary call. The owner asked for something simple that must not break the flow.

## Scope

- **Where.** In `processDirectPhoto`, after the claim and the server quality check and before the AI and storage. A photo that fails quality keeps its quality retake. The check is not run for it.
- **Rule 1, exact reuse.** The original bytes (`sha256`) or the normalized pixels (`normalizedHash`) match a kept earlier photo anywhere in the same company, with no age limit. Uses the existing `(companyId, sha256)` and `(companyId, normalizedHash)` indexes.
- **Rule 2, near duplicate.** Any of the photo's three hash variants (whole, mirrored, centre crop) is at most **2 of 64 bits** away from a kept photo of the **same area**, taken at the same location in the **last 48 hours**. This covers the same task, because a task has one area. It reads the newest 200 rows through the `(locationId, createdAt)` index, and the area is checked with the `TaskInstance (id, areaId)` index.
- "Kept" means the asset's `privacyState` is not `DISCARDED`. Discarded photos (dirty, wrong item, screen photo, earlier reuse) never block. Another company's photos never block.
- **Outcome.** `RECAPTURE_REQUIRED` with the existing reason `DUPLICATE_EVIDENCE` and `keep:false`, published like a quality retake: no AI call, no upload, an evidence row marked `DISCARDED`, `retryAction` `REQUEST_RETAKE_SLOT`. The staff text already exists in `staffPhotoInstructions`: "This photo was already used. Please take a new photo of the {item}." The app shows the server's text in its retake sheet (`assessmentDetail` → `photoCorrection` → `t`), so it needs no code change. It only needs Urdu for the eight forms of that sentence.
- **Never blocks the flow.** If the check throws (for example a database error), the photo goes on to the normal check and `DIRECT_PHOTO_REUSE_CHECK_SKIPPED` is logged. The check is timed as stage `reuse`.
- **Threshold choice.** `duplicate.service`'s near distance of 8 is too loose here. On the repo fixtures (`docs/verification/evidence/photo-flow/*.jpg` and `design/v4/assets/toilet.webp`), a 2° turn or a 1–2% shift of the same scene measured 4–14, and most of those were within 8. Re-encoded, half-size, brighter, darker, sharpened and blurred copies measured 0–2. The clean and dirty shots of the same sink measured 14, and unrelated photos measured 24–34. The exact and variant logic of `duplicateClassification` is reused through a new optional `nearDistance` argument (default 8, so the old pipeline is unchanged).
- This spec is the **sole later editor** of `directPhoto.service.ts` (spec 69), `duplicate.service.ts` (existing before the redesign plan; no earlier spec edited it) and `staffAppTranslations.ts` (spec 71). It changes only: in `directPhoto.service.ts` the exported `reusedPhoto` check and its three constants, the claim read gaining the task's `locationId`, and one branch before the AI; in `duplicate.service.ts` the `nearDistance` argument; in `staffAppTranslations.ts` eight Urdu entries. `staffPhotoInstructions.ts`, `photoDecision.service.ts` and `quality.service.ts` are read only.

## Explicit non-scope

- Manager-side duplicate review and the old pipeline's `duplicateCandidates` → unchanged (spec 69's non-scope keeps the old pipeline as it is).
- `VerificationScreen.tsx`, `PhotoCaptureControls.tsx` and the retake sheet → unchanged (spec 71 is their last editor).
- A new index or migration → not needed (spec 00 records any schema decision).
- Comparing against discarded photos, other areas, or photos older than 48 hours for near duplicates → not planned (owner decision, spec 00).
- Phone-side detection of reused photos → not planned (spec 00).

## Reuse first

- `duplicateClassification` (exact plus any-variant Hamming) in `duplicate.service.ts`, `hammingDistance` and `hashVariants` from `inspectImage`, the existing `DUPLICATE_EVIDENCE` reason and staff text, and the quality-retake publish path in `processDirectPhoto`.

## Steps

1. Add `nearDistance` to `duplicateClassification`.
2. Add `reusedPhoto` and the branch to `processDirectPhoto`, and read `session.task.locationId` in the claim.
3. Add the eight Urdu strings.
4. Write `reusedPhoto.test.ts` and run the backend suite, typecheck, build and the mobile suite.
5. Time the check against a throwaway copy of the schema on the local test Postgres, then drop it.

## Done when

- [x] `cd backend && npx vitest run src/services/verification-v2/reusedPhoto.test.ts` passes: exact reuse across tasks in the company and a normalized-hash copy are retakes; a near duplicate in the same task, a mirrored copy and a near duplicate from another task in the same area within the window are retakes; none of them calls the AI, storage or delete; a different photo of the same item (distance 4) goes to the check; another company's identical photo, a discarded earlier photo, another area and an older photo do not block; a failed check falls through to the normal check; a quality failure skips the check; the queries carry the company, location, area, window and limit filters; the staff text matches and all eight forms have Urdu; on the real fixtures a re-encoded copy is at distance ≤ 2 and the clean and dirty sink shots are more than 8 apart. [unit]
- [x] `grep -c "This photo was already used" frontend-mobile/src/i18n/staffAppTranslations.ts` prints 8. [static]
- [x] `cd backend && npx vitest run src/services/verification-v2/directPhoto.service.test.ts src/services/verification-v2/fasterPhotoUpload.test.ts` passes unchanged. [unit]
- [x] `cd backend && npx vitest run` passes with 0 failures; the real count is in the Log. [unit]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. [static]
- [x] `cd backend && npm run build` passes. [static]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures. [unit]

## Log
