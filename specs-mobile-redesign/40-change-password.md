# Spec 40 — Change password screen

**Status:** Done
**Depends on:** Spec 07, Spec 21, Spec 27
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/profile/ChangePasswordScreen.tsx`, `frontend-mobile/tests/screens/changePassword.test.mjs`, `specs-mobile-redesign/inventory/40-change-password.md`
**Reuses:** `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/src/auth/AuthContext.tsx`, `frontend-mobile/src/design/TopBar.tsx`, `design/mobile-redesign/v3/index.html`

## Goal

"Change password" from Profile opens its own screen that uses the existing replacement form and signs the person out afterwards, as Help does today.

## Scope

New screen `ChangePasswordScreen` (route `ChangePassword`): `TopBar` "Change password" with back; white page with 20 padding; `LaunchRecovery` without `handoff`, with `onCancel` going back and `onComplete` calling `logout()` (today's Help behaviour: `await logout().catch(() => {})`). Keyboard-safe: wrap in a `KeyboardAvoidingView` and a scroll view with `keyboardShouldPersistTaps="handled"`, the same way the forced password screen in `AppNavigator.tsx` does.

## Explicit non-scope

- Form fields and rules → spec 27. Registering the route → spec 48.

## Reuse first

- `LaunchRecovery` only; no second password form.

## Steps

1. Build the screen.
2. Test it.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/changePassword.test.mjs` passes: the title renders; the form is shown without the access code field; completing calls `logout` once; cancel calls `navigation.goBack`. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `ChangePasswordScreen` (`src/screens/profile/ChangePasswordScreen.tsx`) on the real `LaunchRecovery` (not edited) with `TopBar` "Change password", white page, 20 gutter, `KeyboardAvoidingView` plus `ScrollView keyboardShouldPersistTaps="handled"`. Cancel and back call `goBack`; a saved change calls `logout()` once. Tests: `tests/screens/changePassword.test.mjs` 6/6 pass (English title, no access code field, completion calls logout once with no navigation, failed change keeps the session, Cancel and Back call goBack once, Urdu title and save label with a row-reverse top bar). `npm test --prefix frontend-mobile` 470/470 pass (includes other sessions' files); `npm run typecheck` exit 0; `npm run build:web` exit 0. Not verified: the 360 by 700 layout check and a device or screen-reader check. Route registration is spec 48. The spec's "Keyboard-safe" scope is implemented but not exercised by a test. No spec errors found.
