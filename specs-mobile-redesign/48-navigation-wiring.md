# Spec 48 — Navigation wiring for Part 1

**Status:** Done
**Depends on:** Spec 07, Spec 24, Spec 33, Spec 37, Spec 38, Spec 39, Spec 40
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/tests/screens/navigation.test.mjs`, `specs-mobile-redesign/inventory/48-navigation-wiring.md`
**Reuses:** `frontend-mobile/src/types.ts`, `frontend-mobile/src/navigation/routeNames.ts`, `frontend-mobile/src/design/Feedback.tsx`, `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/tests/pushNavigation.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

The app's tabs and stack match the design for Part 1: My day, Tasks and Profile tabs, the new stack screens, the message bar everywhere, and the restyled session restore and forced password screens.

## Scope

**`StaffTabs.tsx`**: three tabs `Shift` ("My day", `Clock` icon), `Tasks` ("Tasks", `ListChecks`), `Profile` ("Profile", `UserRound` with `ProfileScreen`). Remove the `Help` tab. Tab bar per `DESIGN-SYSTEM.md#components`: white, top hairline, items at least 60 high, labels `label` role translated, active colour `blueDeep` with a 62 by 32 `blueWash` pip behind the icon (custom `tabBarIcon` wrapper), inactive `muted`, bottom safe-area padding; default badge style blue and white (TasksScreen overrides to yellow when needed, spec 32). `tabBarAllowFontScaling` stays on. No tab switch animation.

**`AppNavigator.tsx`**: register `TaskDetail` (`TaskDetailScreen`), `HelpGuide` (`HelpScreen`), `TaskAlerts`, `ChangePassword` with `headerShown: false` (screens draw their own `TopBar`); keep `StartTask`, `Verification`, `SpatialDiagnostic` (dev only) and `Login`. Wrap the navigator content in `SnackbarProvider` (spec 24) inside the existing providers. Native stack animation default (slide), with `animation: 'fade'` when `AccessibilityInfo.isReduceMotionEnabled()` is true. Restyle the two screens drawn inline here:
- Session restore: centred mark, "Loading your day" (`sectionTitle`) and a spinner (the one allowed whole-screen spinner).
- Forced password change: white page, `TopBar`-like heading without back, `LaunchRecovery` (not handoff) and an outline "Sign out", inside the existing keyboard-avoiding scroll view.

**`src/types.ts`**: as the sole later editor after spec 07, remove `Help` from `StaffTabsParamList` and `StaffTabId`. Change nothing else.

Notifications: `notificationDestination` still targets `Shift` and `Tasks`; `tests/pushNavigation.test.mjs` must stay green.

## Explicit non-scope

- The History tab and `HistoryTask` → spec 51.
- Screen contents → spec 32, spec 33, spec 37 to spec 40 and spec 46.

## Reuse first

- Route names from `routeNames.ts`; tokens for every colour.

## Steps

1. Rewire the tabs and stack.
2. Restyle the two inline screens.
3. Test the structure.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/navigation.test.mjs` passes: the tab navigator declares exactly `Shift`, `Tasks`, `Profile` with translated labels; the stack declares `TaskDetail`, `HelpGuide`, `TaskAlerts`, `ChangePassword`, `StartTask`, `Verification` when signed in and `Login` when signed out; the forced password screen shows the replacement form and "Sign out"; a message shown through `useSnackbar` inside the navigator renders. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/pushNavigation.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `grep -n "Help" frontend-mobile/src/types.ts` shows no `Help` tab key (only `HelpGuide`). [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — `StaffTabs.tsx`: three tabs `Shift` (My day, `Clock`), `Tasks` (`ListChecks`), `Profile` (`UserRound`, `ProfileScreen` with no slots); `Help` tab removed. Custom `tabBarIcon` (62 by 32 `blueWash` pip on the active tab, icon `blueDeep`/`muted`) and `tabBarLabel` (`StaffText` `label` role, already translated); white bar, top hairline in `line`, item min 60, bottom safe-area padding, default badge `blue`/white (TasksScreen still overrides), `tabBarAllowFontScaling` on, `animation: 'none'`, colours only from tokens. `AppNavigator.tsx`: registers `TaskDetail`, `HelpGuide`, `TaskAlerts`, `ChangePassword` with `headerShown: false`; keeps `StaffTabs`, `Verification` (same `requirePhotoQr` initial param and title), `StartTask`, dev-only `SpatialDiagnostic`, `Login`; route names from `stackRoutes`/`tabRoutes`; stack `animation` `default`, `fade` while `AccessibilityInfo.isReduceMotionEnabled()` (also follows `reduceMotionChanged`); everything it returns sits inside `SnackbarProvider` (in a flex 1 view), so `useSnackbar().show` now works app-wide. Session restore: centred mark, "Loading your day" (`sectionTitle`), one large `blue` spinner. Forced password change: white page, 56 high "Change password" heading without back (row-reverse in Urdu), `LaunchRecovery` replacement form (no handoff, no Cancel), outline "Sign out" (`ActionButton`), inside the same keyboard-avoiding scroll view; both still call `logout()`. `src/types.ts`: `Help` removed from `StaffTabsParamList` and `StaffTabId`, nothing else.
  - Tests: new `tests/screens/navigation.test.mjs` 13/13 (exact tabs with English and Urdu labels, icons and tab-bar styling, bar height for Urdu and font scaling, mirrored order in Urdu with `initialRouteName` Shift, signed-in and signed-out stacks with hidden headers, dev-only diagnostic, slide/fade and live reduce-motion change, session restore in both languages, forced password form and Sign out (calls logout) in both languages, a `useSnackbar` message rendered inside the navigator in both languages). `tests/pushNavigation.test.mjs` 1/1. `npm test --prefix frontend-mobile` 530/530, 0 failures. `grep -n "Help" frontend-mobile/src/types.ts` shows only `HelpGuide`. Typecheck 0 errors. `npm run build:web` passes. No existing test changed.
  - Runtime check: copied `dist` to a scratch folder, served it on 127.0.0.1, drove headless Google Chrome at 360x700 with `playwright-core` (from `frontend/node_modules`, read only), a fabricated signed-in user in `localStorage` and API answers from `page.route`. English and Urdu: My day, Tasks, a task row opening `TaskDetail` and Back, Profile tab, Profile rows opening Help, Task alerts, Change password and Back from each, the forced password screen (403 `PASSWORD_CHANGE_REQUIRED`) and session restore (API held back): document width 360 every time, no page errors. Screenshots read: tab bar (en, ur), My day ur, Tasks ur, Task details, Profile en/ur, Help, Change password, forced en/ur, restore ur. Toggling اردو on Profile keeps Profile selected and mirrors the bar. Found and fixed on the way: Urdu tab labels were cut off at the bottom (Urdu `label` line height 27), so the bar height is now computed from the label line height and font scale (capped at 1.4, as `StaffText` caps it). The message bar was not exercised in the browser (unit-tested only). Not checked on a device, with a screen reader, or with system font scaling.
  - Decisions and departures: (1) The tab order is reversed in Urdu (My day on the right, as the design's RTL phone shows); route names and the focused tab are kept (the tab router matches routes by name), with `initialRouteName` Shift and `backBehavior: 'initialRoute'` so Android back still returns to My day. (2) Bar padding is 8 top and 4 bottom plus the safe area, as the design's `.tabs`; the spec only said "bottom safe-area padding". (3) The forced-password heading reads "Change password" (has Urdu); the form's own headline stays "Replace your password". (4) Stack header colours (only `Verification`, `StartTask` before they hide it, and `SpatialDiagnostic` show one) now come from tokens (`ink`, `blueDeep`, `surface`) instead of `v5Colors`. (5) `AppNavigator` no longer imports `LoadingState`, `Button` or `theme`; spec 49 can check whether anything else still uses them. (6) `SnackbarProvider` keeps its fixed `bottom: 96`, which sits above the tab bar and above a stack screen's dock; on a phone with a large bottom inset it may overlap the bar's top edge (spec 49 owns the message-bar polish). No new strings; nothing for spec 49's Urdu sweep.

