# Spec 56 — Fix: the receipt's "Back to my day" returns to My day

**Status:** Done
**Depends on:** Spec 53
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/receiptBackToMyDay.test.mjs`, `specs-mobile-redesign/inventory/56-fix-receipt-back-to-my-day.md`
**Reuses:** `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/screens/verification/SubmissionReceipt.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `frontend-mobile/tests/screens/photoCapture.test.mjs`, `frontend-mobile/tests/screens/returnToMyDay.test.mjs`

## Goal

After the last task is submitted, "Back to my day" on the Work submitted receipt always lands on My day, however deep the stack is. This fixes finding 56 in `docs/plan-project/mobile-redesign/planning/verification.md` (§7).

## Scope

Today `VerificationScreen.tsx` line 219 passes `onDone={()=>navigation.goBack()}` to `SubmissionReceipt`, while `onNext` on the same line already returns with `navigation.popTo(stackRoutes.staffTabs,{screen:tabRoutes.myDay})` (spec 54). Opened from My day the stack is one screen deep, so `goBack` happens to work; opened through Tasks › Task details › Take task photos, `goBack` lands on Task details of the task just submitted (reproduced at 390 and 360).

- Make `onDone` return to the existing `StaffTabs` route with the My day tab selected, the same way `onNext` does, so it never pushes a second `StaffTabs` and never stops on Task details.
- This spec is the **sole later editor** of `VerificationScreen.tsx` among specs 56 to 63 (owned by spec 45, edited by spec 54) and changes only the `onDone` callback on line 219. The top bar back (`back`, line 203) keeps `goBack`.
- Adapt `tests/screens/photoCapture.test.mjs` "finished with no other task goes back to my day by going back" (lines 304 to 309), which asserts `['goBack']`: it must now assert the `popTo` to `StaffTabs` with `{ screen: 'Shift' }` and no `navigate` or `goBack`, like the "Next task" test above it (test-only exception, Log line).

## Explicit non-scope

- "Take a new photo" with an unsent photo (finding 64) → waits for the owner; not planned before a decision (spec 53 lists it).
- Any other `goBack` in `VerificationScreen.tsx` or other screens → not planned; list any other stacked "Back to my day" path you notice in the Log for the lead (spec 53 follow-up).
- The attendance receipt's "Back to my day" (`AttendanceReceipt.tsx`, inside the tab itself) → unchanged; it already works (e2e `my-day.spec.ts`, spec 52).
- Re-running the e2e suite → spec 52 (the lead reruns it after this spec).

## Reuse first

- The `onNext` call on the same line and `stackRoutes`/`tabRoutes` from `navigation/routeNames.ts`.
- The mount and mocks of `tests/screens/photoCapture.test.mjs`; the source-guard style of `tests/screens/returnToMyDay.test.mjs`. The new test uses its own `useLanguage` mock whose `t` fills values, so it does not depend on the shared harness `t()` that spec 62 changes.

## Steps

1. Change `onDone` on line 219.
2. Write `tests/screens/receiptBackToMyDay.test.mjs`: mount the screen in the finished state with no other open task, press "Back to my day", and assert the single `popTo` call; add a source guard that no `goBack` is passed to `SubmissionReceipt`.
3. Adapt the one photoCapture assertion; run the touched tests, then the suite.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/receiptBackToMyDay.test.mjs` passes: with no next task, pressing "Back to my day" calls `popTo('StaffTabs', { screen: 'Shift' })` once and never `goBack`, `navigate` or `push`; this test fails on the tree before the change. [unit]
- [x] `tests/screens/photoCapture.test.mjs`, `tests/screens/returnToMyDay.test.mjs` and `tests/screens/submissionReceipt.test.mjs` pass; the photoCapture diff only changes the one "no other task" test's expectation and title. [unit]
- [x] The only change in `VerificationScreen.tsx` is the `onDone` expression on the `SubmissionReceipt` line (the tree is uncommitted, so compare with a copy taken before editing; the Log quotes the line before and after). [static]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Implemented. `VerificationScreen.tsx` line 219 `onDone` changed from `()=>navigation.goBack()` to `()=>navigation.popTo(stackRoutes.staffTabs,{screen:tabRoutes.myDay})`, the same expression as `onNext` on that line. Top bar `back` (line 203) keeps `goBack`. Only that expression changed (diff against a copy taken before editing: one line, 219). Before the change the source guard and the new test failed (2 fail); after, they pass.
  - Test-only exception used: `tests/screens/photoCapture.test.mjs` "finished with no other task goes back to my day by going back" renamed to "...by popping to StaffTabs" and now asserts `['popTo','StaffTabs',{screen:'Shift'}]` as last call and no `navigate` or `goBack`. No other test in that file changed.
  - New `tests/screens/receiptBackToMyDay.test.mjs` (2 tests): mounts the finished receipt with no next task and presses "Back to my day" (single popTo, no goBack/navigate/push), plus a source guard that `SubmissionReceipt`'s `onDone` is the popTo and contains no `goBack`. Mount and mocks are copied from the head of `photoCapture.test.mjs` (lines 1 to 128), because `nativeHarness.mjs` has no shared mount helper; the copy includes its own `useLanguage` mock whose `t` fills values.
  - Counts: `receiptBackToMyDay` 2/2; `photoCapture` 17/17; `returnToMyDay` 2/2; `submissionReceipt` 6/6; `npm test --prefix frontend-mobile` 625 pass, 0 fail, 0 cancelled; typecheck exit 0 (no errors); `build:web` exit 0 ("Exported: dist"), run after the `expo export` of another session had finished.
  - Not verified: device or 360 by 700 layout (no layout changed); no device run.
  - Other stacked "Back to my day" paths: none searched beyond this receipt. The attendance receipt is inside the tab and is out of scope.
  - Line before (219): `onNext={...popTo...} onDone={()=>navigation.goBack()}/>`. Line after: `onNext={...popTo...} onDone={()=>navigation.popTo(stackRoutes.staffTabs,{screen:tabRoutes.myDay})}/>`.
  - Spec was slightly off: the mount also records a `setOptions` call from `StackHeaderHidden`, so the new test asserts on the last call and filters `popTo`, not the whole `calls` array.
