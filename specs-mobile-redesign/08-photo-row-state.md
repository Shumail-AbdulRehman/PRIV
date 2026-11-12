# Spec 08 — Photo row state

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/verification/photoRowState.ts`, `frontend-mobile/src/verification/photoRowState.test.ts`, `specs-mobile-redesign/inventory/08-photo-row-state.md`
**Reuses:** `frontend-mobile/src/verification/presentation.ts`, `frontend-mobile/src/verification/feedback.ts`, `frontend-mobile/src/verification/policy.ts`, `frontend-mobile/src/verification/types.ts`, `docs/PRODUCT_UI_RULES.md`

## Goal

A pure mapping turns each photo's real state into the redesigned row label, tone and icon, without ever claiming an upload or a check that has not happened.

## Scope

`photoStatuses(manifest, local, rows)` in `presentation.ts` already produces one entry per required view with a `state` that may be a local queue state (`SAVED`, `UPLOADING`, `RETRY_WAIT`, `AUTH_REQUIRED`, `BLOCKED`, `SERVER_ACCEPTED`, `PROCESSING`) or a server requirement state (`MISSING`, `AVAILABLE`, `PROCESSING`, `PASSED`, `MANAGER_ACCEPTED`, `WAIVED`, `RECAPTURE_REQUIRED`, `CLEANING_REQUIRED`, `REVIEW_REQUIRED`, `PRIVACY_HOLD`, `SERVICE_FAILURE`).

Export `photoRow(state)` returning `{ kind, label, tone, icon, done, needsYou, spinning }`:

| States | Kind | Label | Tone | Icon | Done | Needs you |
|---|---|---|---|---|---|---|
| `SAVED`, `UPLOADING` | `sending` | Saved, uploading | blue | spinner | no | no |
| `RETRY_WAIT`, `AUTH_REQUIRED`, `BLOCKED` | `uploadAgain` | Upload again | red | cloud upload | no | yes |
| `SERVER_ACCEPTED`, `PROCESSING` | `checking` | Uploaded, checking | blue | hourglass | no | no |
| `PASSED`, `MANAGER_ACCEPTED` | `uploaded` | Uploaded | green | tick | yes | no |
| `WAIVED` | `notNeeded` | Not needed | neutral | minus | yes | no |
| `REVIEW_REQUIRED`, `PRIVACY_HOLD`, `SERVICE_FAILURE` | `review` | Waiting for review | blue | hourglass | yes | no |
| `RECAPTURE_REQUIRED` | `retake` | Retake photo | needsYou | camera | no | yes |
| `CLEANING_REQUIRED` | `clean` | Needs cleaning | needsYou | droplet | no | yes |
| `MISSING`, `AVAILABLE`, anything unknown | `needed` | Photo needed | neutral | none | no | no |

`done` must agree with `checkedPhotoState` in `policy.ts` for server states (`SERVICE_FAILURE` counts as done because the photo is kept for the manager; it must never read as dirty).

Export `photoSummary(rows)`: `{ total, done, needsYou, sending, checking }` for the header ("{n} of {t} photos done") and the dock decision. Export `nextPhotoAction(rows)`: `submit` when all done and none sending; `waitUpload` when every not-done row is `sending` or `checking`; `clean` when the first not-done row is `clean`; `retake`; `uploadAgain`; else `next`. Return the index of the row the action targets.

## Explicit non-scope

- Drawing rows → spec 35. The dock and submit → spec 45.
- Any change to `presentation.ts`, `feedback.ts` or `policy.ts` → spec 00 (never changed by this plan).

## Reuse first

- Import `checkedPhotoState`; do not copy its list.

## Steps

1. Write the mapping and helpers.
2. Test every state in the table, plus the summary and next action.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/verification/photoRowState.test.ts` passes: every state in the table maps to its kind and label; no queue state maps to `uploaded`; `SERVICE_FAILURE` maps to `review` and is done; `photoSummary` counts correctly; `nextPhotoAction` returns `waitUpload` when the only open rows are sending or checking, `submit` only when every row is done, and the right index for retake and clean. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `photoRowState.ts` imports nothing from React or React Native. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `src/verification/photoRowState.ts` (`photoRow`, `photoSummary`, `nextPhotoAction`, types) and `photoRowState.test.ts`. Spec test 10/10 pass; whole mobile suite `npm test` 202/202 pass, 0 fail; typecheck 0 errors; `build:web` exported `dist`. `done` is `checkedPhotoState(state)` from `policy.ts` (not copied); unknown states never count as done. Decisions where the spec was open: (1) `photoSummary` and `nextPhotoAction` take `{ state }` entries (the `photoStatuses()` output directly), and the index is into that array; (2) `nextPhotoAction` returns `{ action, index }` with `index: null` for `submit`; an empty list returns `next` with `index: null`, never `submit`, matching the current screen's `mandatory.length>0` rule; (3) "clean when the first not-done row is clean; retake; uploadAgain" is implemented as priority across all open rows (first clean, else first retake, else first upload-again, else first needed), matching `VerificationScreen`'s dirty-before-retake order; (4) icons are semantic names (`spinner`, `cloudUpload`, `hourglass`, `tick`, `minus`, `camera`, `droplet`, or null), all confirmed present in lucide (`loader-circle`, `cloud-upload`, `hourglass`, `check`, `minus`, `camera`, `droplet`). Tone type reuses `PillTone` from spec 06 (type-only import). Every label already has Urdu in `translations.ts` or `staffAppTranslations.ts`; no new strings. No UI, so the 360 by 700 check does not apply.
