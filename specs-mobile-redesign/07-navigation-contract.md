# Spec 07 — Navigation contract

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/types.ts`, `frontend-mobile/src/navigation/routeNames.ts`, `frontend-mobile/src/navigation/routeNames.test.ts`, `specs-mobile-redesign/inventory/07-navigation-contract.md`
**Reuses:** `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/src/notifications/model.ts`, `ARCHITECTURE.md`

## Goal

Every route the redesign needs is typed before any screen uses it, so screen specs can navigate with checked names while the navigators are wired later (specs 48 and 51).

## Scope

In `src/types.ts`, extend the param lists. Change nothing else in the file.

- `StaffTabsParamList`: keep `Shift`, `Tasks` and `Help` (`Help` stays only so today's `StaffTabs.tsx` still typechecks; spec 48 removes it), add `History: undefined` and `Profile: undefined`.
- `RootStackParamList`: keep `Login`, `StaffTabs`, `Verification`, `StartTask`, `SpatialDiagnostic`; add `TaskDetail: { taskId: number }`, `HelpGuide: undefined`, `TaskAlerts: undefined`, `ChangePassword: undefined`, `HistoryTask: { taskId: number; month: string }`.
- `StaffTabId`: add `History` and `Profile`.

Create `src/navigation/routeNames.ts` exporting constant objects `tabRoutes` (`myDay: 'Shift'`, `tasks: 'Tasks'`, `history: 'History'`, `profile: 'Profile'`) and `stackRoutes` (`taskDetail`, `startTask`, `verification`, `helpGuide`, `taskAlerts`, `changePassword`, `historyTask`, `login`, `staffTabs`) typed against the param lists, so a typo fails typecheck. Screens import these names.

`notificationDestination` in `src/notifications/model.ts` must keep returning `Tasks` and `Shift`; do not edit it.

## Explicit non-scope

- Registering screens in the navigators, tab bar look and removing the `Help` tab → spec 48.
- The History tab and `HistoryTask` registration → spec 51.

## Reuse first

- Keep existing route names; notifications and deep links depend on `Shift` and `Tasks`.

## Steps

1. Edit the param lists; add the constants.
2. Write `routeNames.test.ts`.
3. Typecheck the whole app (existing screens must still compile).

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/navigation/routeNames.test.ts` passes: `tabRoutes.myDay` is `Shift` and `tabRoutes.tasks` is `Tasks`; every value is unique; `notificationDestination('TASK_ASSIGNED')` is `tabRoutes.tasks` and `notificationDestination(undefined)` is `tabRoutes.myDay`. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `git diff frontend-mobile/src/types.ts` changes only the param lists and `StaffTabId`. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Added `History`/`Profile` to `StaffTabsParamList` and `StaffTabId`, and `TaskDetail`, `HelpGuide`, `TaskAlerts`, `ChangePassword`, `HistoryTask` to `RootStackParamList` (`Help` tab kept; nothing else in `types.ts` touched, checked with `git diff`). Created `src/navigation/routeNames.ts` (`tabRoutes`, `stackRoutes` with `as const satisfies Record<string, keyof …ParamList>`, plus `TabRouteName`/`StackRouteName` types); a scratch probe confirmed a typo (`"Shfit"`) fails tsc with TS2820. `routeNames.test.ts`: 4/4 pass. Mobile suite 186/186, 0 failures. Typecheck 0 errors. `npm run build:web` passed in place this time (no EACCES). `stackRoutes` deliberately omits `SpatialDiagnostic` (dev only, not in the spec's list). No screens or navigators changed (specs 48, 51).
