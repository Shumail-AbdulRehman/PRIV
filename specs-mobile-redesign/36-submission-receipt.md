# Spec 36 — Work submitted receipt

**Status:** Done
**Depends on:** Spec 26
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/verification/SubmissionReceipt.tsx`, `frontend-mobile/tests/screens/submissionReceipt.test.mjs`, `specs-mobile-redesign/inventory/36-submission-receipt.md`
**Reuses:** `frontend-mobile/src/design/Moment.tsx`, `frontend-mobile/src/design/format.ts`, `design/mobile-redesign/v3/index.html`

## Goal

After submitting, staff see a clear receipt that keeps Submitted and Verified separate, and one button to the next task.

## Scope

`SubmissionReceipt` props: `taskId`, `areaName`, `submittedAt`, `timeZone`, `photosReceived`, `photosRequired`, `hasNextTask`, `onNext`, `onDone`.

`Moment` with a blue badge and tick, title "Work submitted", subtitle "Submitted at {time}. Your manager may still review it.", facts: "Task {id}" with the area name (untranslated), "Photos received" "{r} / {t}" (left-to-right), "Submitted" with a blue pill "Yes", "Verified" with a neutral pill "Not yet". Action: `next` "Next task" when `hasNextTask` (calls `onNext`), else "Back to my day" (calls `onDone`).

## Explicit non-scope

- When to show it and which task is next → spec 45.

## Reuse first

- `Moment` only.

## Steps

1. Build it.
2. Test it.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/submissionReceipt.test.mjs` passes: the four facts render with "Yes" and "Not yet" as separate pills; "Next task" calls `onNext` when there is a next task, otherwise "Back to my day" calls `onDone`; the area name is not translated in Urdu. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `SubmissionReceipt` in `frontend-mobile/src/screens/verification/SubmissionReceipt.tsx` on `Moment` (blue badge and tick, "Work submitted", time subtitle, four facts, one `next` action: "Next task" calls `onNext`, else "Back to my day" calls `onDone`). Submitted shows a blue "Yes" pill and Verified a neutral "Not yet" pill, as separate rows. Area name is shown as given and not translated. Tests: 6 in `tests/screens/submissionReceipt.test.mjs`, all pass (`npx tsx --test`). Suite 464/464 (`npm test`). Typecheck 0 errors. `build:web` passes.
- **2026-11-11** — Not verified: the 360 by 700 layout and the design screen in `design/mobile-redesign/v3` were not viewed in this session; no device check. "Photos received" value "r / t" relies on the existing first-strong isolate for left-to-right, not an explicit direction.
- **2026-11-11** — Spec gaps for spec 49: Urdu key for "Task {id}" is missing (the English "Task 42" label shows in Urdu; the key belongs in `staffAppTranslations.ts`, which this spec does not own). "Verified" is covered by the shared dictionary. The fact label is pre-filled with `t()` because `MomentFact.label` takes no values.

