# Spec 51 — Part 2 wiring: History tab and profile sections

**Status:** Done
**Depends on:** Spec 18, Spec 43, Spec 44, Spec 47, Spec 50
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/part2Wiring.test.mjs`, `specs-mobile-redesign/inventory/51-part2-wiring.md`
**Reuses:** `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/src/screens/profile/ProfileScreen.tsx`, `frontend-mobile/src/screens/history/HistoryScreen.tsx`, `frontend-mobile/src/screens/history/HistoryTaskScreen.tsx`, `frontend-mobile/src/screens/profile/ProfileMonth.tsx`, `frontend-mobile/src/screens/profile/ProfileWork.tsx`, `frontend-mobile/src/queries/history.ts`

## Goal

Part 2 becomes visible: the History tab, finished task details, and the Profile month and work sections, only after Part 1 has passed its release check and the server routes exist.

## Scope

This spec is the **sole later editor** of three files owned by earlier specs, and changes only what is listed:
- `StaffTabs.tsx` (spec 48): add the `History` tab between `Tasks` and `Profile`, label "History", icon `RotateCcwClock` (Lucide has no `History` icon in this version), screen `HistoryScreen`. Order: My day, Tasks, History, Profile.
- `AppNavigator.tsx` (spec 48): register `HistoryTask` (`HistoryTaskScreen`, header hidden).
- `ProfileScreen.tsx` (spec 37): read `useProfileSummary` and pass `companyName`, `topSlot` = `ProfileMonth` (with `onSeeHistory` navigating to the History tab) and `workSlot` = `ProfileWork`. If the summary fails (for example an older server), the slots show their own error lines and the rest of Profile still works.

`src/types.ts` already has `History` and `HistoryTask` (spec 07); no change.

Deployment order note for the owner (write it in the fragment): the backend with spec 18 must be live before an app build containing this spec reaches staff; otherwise History shows its error state.

## Explicit non-scope

- Building the screens → specs 41 to 44 and 47. Server → specs 11 to 13 and 18.

## Reuse first

- The slots spec 37 left for this purpose; do not restructure Profile.

## Steps

1. Make the three edits.
2. Test the wiring.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/part2Wiring.test.mjs` passes: the tab navigator declares `Shift`, `Tasks`, `History`, `Profile` in that order; the stack declares `HistoryTask`; Profile renders the month and work sections from a mocked summary and the company name under the person's name; a failed summary leaves details and settings visible. [unit]
- [x] `npx tsx --test tests/screens/navigation.test.mjs tests/screens/profile.test.mjs` (from `frontend-mobile`) still pass, with assertions updated only for the added tab and slots (test-only exception). [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `git diff` of the three files contains only the listed changes. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Wired History tab (RotateCcwClock, between Tasks and Profile; Urdu bar mirrored), `HistoryTask` stack screen (header hidden), and ProfileScreen reading `useProfileSummary` (company line from `summary.company.name`, `ProfileMonth` with `onSeeHistory` navigating to `History`, `ProfileWork`; explicit props still override). Failed summary: month shows "Figures could not load." with Try again (refetch), work shows its empty wording, details/settings unaffected. New `tests/screens/part2Wiring.test.mjs`: 5 pass. `navigation.test.mjs` + `profile.test.mjs`: 25 pass. `npm test`: 611 pass, 0 fail. Typecheck 0 errors. `build:web` exported. Existing tests adapted: navigation.test.mjs — added mocks for the two history screens, tab/stack name lists, title list, icon list, Urdu mirrored order and inactive pip count 2 to 3 for the 4th tab; profile.test.mjs — added a `/queries/history` mock (pending summary) because ProfileScreen now reads it; no behaviour assertion removed. The last `git diff` box is left unticked: the three files also carry earlier uncommitted Part 1 changes, so a diff cannot isolate this spec; I verified by reading that only the listed edits were made. Urdu keys missing from `translate(..., 'ur')` (not added, not mine): "Figures could not load.", "No shifts yet", "No tasks yet", "Not set", "No manager assigned". Not verified: no browser/360x700 screenshot was taken, no device. Deployment order: the backend with spec 18 must be live before an app build with this spec reaches staff; otherwise History shows its error state.
- **2026-11-12** — Lead: `git diff` cannot isolate this spec because the three files also hold uncommitted Part 1 changes. The lead checked instead that the only History and profile-summary lines are the listed ones: the `History` tab with `RotateCcwClock` in `StaffTabs`, the `HistoryTask` route in `AppNavigator`, and `useProfileSummary`, `ProfileMonth` and `ProfileWork` in `ProfileScreen`. The three test files pass 30/30. Box ticked on that basis.
