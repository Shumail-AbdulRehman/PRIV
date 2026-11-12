# Spec 54 — Fix: return to the one My day

**Status:** Done
**Depends on:** Spec 52
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/returnToMyDay.test.mjs`, `specs-mobile-redesign/inventory/54-fix-return-to-my-day.md`
**Reuses:** `frontend-mobile/src/screens/task/TaskDetailScreen.tsx`, `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/notifications/NotificationNavigation.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/tests/pushNavigation.test.mjs`, `frontend-mobile/tests/screens/taskDetail.test.mjs`, `frontend-mobile/tests/verificationLifecycle.test.mjs`

## Goal

Going back to My day from a stacked screen returns to the existing tab navigator instead of mounting a second one, so only one My day exists and polls. This fixes bug E2E-1 found by spec 52.

## Scope

React Navigation 7 changed `navigate`: it no longer goes back to a screen already in the stack, it pushes a new one. Three call sites still navigate to `StaffTabs` from a screen stacked above it, so a second tab navigator mounts. This spec is the **sole later editor** of these three files (owned by specs 33, 45 and the push work) and changes only these calls:

- `TaskDetailScreen.tsx` around line 142: the "Check in" dock action when not checked in.
- `VerificationScreen.tsx` around line 219: `onNext` ("Next task") on the Work submitted receipt.
- `NotificationNavigation.tsx` around line 27: opening a phone alert while a stacked screen is open.

Each must return to the existing `StaffTabs` route and select the target tab: `popTo` with the nested `screen` param, or equivalent stack behaviour that never adds a second `StaffTabs` entry. When `StaffTabs` is already focused, the notification path must still switch tabs without pushing.


## Explicit non-scope

- Any other navigation call or route rename → not planned; record more instances in the Log for spec 53.
- The Joined month bug (E2E-2) → spec 55.
- Removing the two E2E-1 `test.fixme` markers in `e2e-web/` and running the e2e suite → spec 52 (the lead reruns it after this spec).

## Reuse first

- Route names from `navigation/routeNames.ts`; mock patterns from `tests/pushNavigation.test.mjs`.

## Steps

1. Change the three call sites.
2. Unit-test that each call uses the go-back action with the right tab, and that nothing pushes a second `StaffTabs`.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/returnToMyDay.test.mjs` passes: "Check in" in Task details, "Next task" on the receipt, and a pending alert each return to the existing `StaffTabs` with the right tab and never call `navigate` or `push` for `StaffTabs` from a stacked screen. [unit]
- [x] `tests/pushNavigation.test.mjs`, `tests/screens/taskDetail.test.mjs` and `tests/verificationLifecycle.test.mjs` still pass; any test changed keeps every behaviour it proved. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Implemented. `TaskDetailScreen.tsx` "Check in" and `VerificationScreen.tsx` `onNext` now call `navigation.popTo(stackRoutes.staffTabs, { screen: tabRoutes.myDay })`. `NotificationNavigation.tsx` now calls `staffNavigation.dispatch(StackActions.popTo("StaffTabs", { screen }))` (the container ref has no `popTo` method, so the action is dispatched; with StaffTabs already focused it finds it at the current index and only sets the tab param, no push). Verified against `@react-navigation/routers` `POP_TO` reducer (params replace, route found by name, nothing pushed).
  - Tests: new `tests/screens/returnToMyDay.test.mjs` (2 tests): alert path by behaviour, plus a source guard on all three call sites. "Check in" and "Next task" behaviour is asserted in the screens' existing mounted tests, adapted (each still proves the same behaviour and now also asserts no `navigate`): `taskDetail.test.mjs` (own `useNavigation` mock with `popTo`, since the shared harness navigation has none and is not owned here; expects `popTo`), `photoCapture.test.mjs` (mock navigation gains `popTo`; expects `popTo`), `pushNavigation.test.mjs` (mock gains `StackActions` and `dispatch`; same destinations asserted, plus no `navigate`).
  - Counts: targeted four files 33 pass, 0 fail; `npm test` 620 pass, 0 fail; typecheck 0 errors; `build:web` exit 0.
  - Departure: the unit test does not mount VerificationScreen/TaskDetailScreen itself (heavy mocks duplicated from existing tests); the source guard plus the adapted mounted tests cover them.
  - More instances for spec 53: none seen in the three files; no other call sites searched.
