# Spec 37 — Profile screen

**Status:** Done
**Depends on:** Spec 07, Spec 09, Spec 20, Spec 21, Spec 23, Spec 24
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/profile/ProfileScreen.tsx`, `frontend-mobile/tests/screens/profile.test.mjs`, `specs-mobile-redesign/inventory/37-profile-screen.md`
**Reuses:** `frontend-mobile/src/queries/profile.ts`, `frontend-mobile/src/auth/AuthContext.tsx`, `frontend-mobile/src/design/Avatar.tsx`, `frontend-mobile/src/design/ConfirmDialog.tsx`, `frontend-mobile/src/design/LanguageToggle.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `design/mobile-redesign/v3/index.html`

## Goal

A Profile tab where staff see who they are, their details, and every setting and help path that used to live on "Help & account".

## Scope

New screen `ProfileScreen` (registered as the `Profile` tab by spec 48). `canvas` background, white blocks separated by 10.

1. **Header** (white): `Avatar` 76, name (`headline` role, untranslated), "Cleaning staff" muted. The company line appears only when a `companyName` prop is given (Part 2 passes it; Part 1 has no company name and shows nothing there).
2. **Slots for Part 2**: render `topSlot` and `workSlot` props (React nodes) after the header, in that order, when given. Spec 51 passes the month and work sections; Part 1 passes nothing. This keeps spec 51 from rewriting this file's layout.
3. **My details**: rows with a leading muted icon, a small label and the value: Phone (left-to-right; "Not recorded" when null), Email (left-to-right), Staff number (the id), Joined (month and year of `createdAt` via `monthTitle` from spec 05). Below: "Ask your manager to change these." Data from `useStaffProfileQuery` (spec 09); while loading, skeleton rows; on error, the rows show the signed-in user's name and email from `useAuth` and a small "Details could not load." line with "Try again".
4. **Settings and help**: Language row with `LanguageToggle` `onWhite`; "Task alerts" row (chevron) to `TaskAlerts`; "Change password" to `ChangePassword`; "Help" to `HelpGuide`; "Sign out" row in `bad` text with the log-out icon that opens `ConfirmDialog` ("Sign out of this phone?", "You will need your email and password to sign in again.", destructive "Sign out", "Cancel") and on confirm calls `logout()` from `useAuth`.
5. **Footer**: "Version {v}" from `expo-application` `nativeApplicationVersion` (the same value `configureNativeAppVersion` uses).

Every row is at least 60 high; pressable rows have accessibility labels.

## Explicit non-scope

- Month figures, location, shift and manager → spec 44 (sections) and spec 51 (wiring).
- Task alerts, help and password screens → specs 38, 39, 40.
- Registering the tab → spec 48.

## Reuse first

- `logout` from `useAuth` (it already clears alerts, session and cache).

## Steps

1. Build the screen.
2. Test it.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/profile.test.mjs` passes: details render from the profile query with phone and email left-to-right; a null phone shows "Not recorded"; each settings row navigates to its route; sign out opens the dialog and only confirm calls `logout`; `topSlot` and `workSlot` render when given and nothing extra when not; a failed profile read shows the fallback and "Try again"; Urdu translates labels but not the name. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `ProfileScreen({ companyName?, topSlot?, workSlot? })`. `tests/screens/profile.test.mjs`: 12 tests pass (details, null phone, phone/email isolated with U+2068/2069 in English and Urdu, company line, three routes, language toggle, sign-out cancel vs confirm, slots order, loading skeletons, error fallback + Try again, Urdu labels with name untranslated and row-reverse/ChevronLeft, English row min height 60). Full mobile suite 482 pass, 0 fail; typecheck 0 errors; `build:web` passes (screen is not imported yet, so it is not bundled until spec 48). Not checked: 360x700 rendering, a device. Left-to-right is proved by the isolate marks, not a rendered view. New string "Details could not load." has no Urdu yet (shown in English; spec 49 to add). The sign-out confirm in the test is the last "Sign out" pressable, since the dialog button shares the label. Spec note: the profile query's `createdAt` month is sliced as `YYYY-MM` from the ISO string (UTC month), not shifted to a location timezone.
