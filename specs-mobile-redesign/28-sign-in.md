# Spec 28 — Sign in screen

**Status:** Done
**Depends on:** Spec 19, Spec 21, Spec 22
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/LoginScreen.tsx`, `frontend-mobile/tests/screens/signIn.test.mjs`, `specs-mobile-redesign/inventory/28-sign-in.md`
**Reuses:** `frontend-mobile/src/design/Field.tsx`, `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/src/design/LanguageToggle.tsx`, `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/src/api/serverAddress.ts`, `frontend-mobile/assets/hygene-ops-mark.png`, `frontend-mobile/tests/loginKeyboard.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

Sign in matches the design (All screens > Sign in, Wrong password, Manager access code) and keeps every function it has today.

## Scope

Rebuild the rendering of `LoginScreen.tsx`; keep its state, `handleLogin`, keyboard handling, server address logic and the handoff switch.

- White page. Top row: Hygene Ops mark (existing `hygene-ops-mark.png`, 36) with "Hygene Ops" (Ops in `blue`), and `LanguageToggle` `onWhite` at the end.
- Title "Staff sign in" in the `pageTitle` role, 30 px below the top row. (The prototype draws it at 33; `pageTitle` is the closest token and wins.)
- `Field` "Email" (`kind: email`, placeholder "name@company.com") and "Password" (`kind: password`). A failed login shows "Email or password is wrong. Check them and try again." under the password field with both fields in the error border, unless the server sends a different message (keep showing the server message, as today).
- Bottom area: `form` button "Sign in" (busy while signing in); `ghost` "Use manager access code" (opens the restyled `LaunchRecovery` with `handoff`); fine print "Forgot your password? Ask your manager for a one-use access code."
- Keep the server address tool below, collapsed: ghost "Show connection settings" toggles a panel with the current address, "Change server address", the `Field` (`kind: url`), "Save address" and "Cancel". Same validation and messages as today.
- "Password replaced. Sign in with your new password." still appears after a successful handoff.
- Replace `Alert.alert` for missing fields with the inline error "Email and password are both required." under the password field.

## Explicit non-scope

- Session restore screen and forced password change → spec 48.
- Changing authentication calls in `AuthContext` → spec 00 (never).

## Reuse first

- `LaunchRecovery` for the access code (spec 27); `Field` and `ActionButton` for everything else.

## Steps

1. Rebuild the rendering.
2. Write the screen test; keep `tests/loginKeyboard.test.mjs` green under the test-only exception.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/signIn.test.mjs` passes: empty submit shows the inline required message and does not call login; a rejected login shows the wrong-password message; "Use manager access code" shows the access code form and "Back to sign in" returns; connection settings expand and saving an invalid address shows the existing error; the language toggle switches to Urdu and the title translates; the button label "Sign in" is a blue form button. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/loginKeyboard.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] At a 360 by 700 window the sign in button and the access code link are visible without scrolling when the keyboard is closed; the Log says how this was checked. [runtime]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Restyled `LoginScreen.tsx` (white page, brand row with `LanguageToggle`, `pageTitle`, `Field`s, form/ghost `ActionButton`s, collapsed connection settings; state, keyboard padding, handoff and server logic kept). `signIn.test.mjs` 13/13; `loginKeyboard.test.mjs` 1/1 (test-only exception: its old Button/Input/Card/LanguageChoice stubs replaced by design-part stubs, same keyboard-padding and "Sign in button present" assertions kept); full suite 394/394; typecheck 0 errors; `build:web` passes. Not ticked: the 360x700 runtime check (not run in a browser; layout estimated at about 580 px of content, sign in and access code well within 700). Deviations: the wrong-password message shows under the password field only, because `Field` cannot show a red border without a message line, so the email border stays normal. Login failure no longer uses `Alert`; server-address save errors now show inline under the address field instead of `Alert`. Failures with no server message and a 400/401/403 or no status show the wrong-password text; network errors keep the old detail text. Strings without Urdu keys (use English via `t()`, for spec 49): "Email and password are both required.", "Use manager access code", "Email", "Password", "Cancel", "Use the server computer’s Wi-Fi address. Include :8080/api.".
- **2026-11-11** — Runtime check done: served `frontend-mobile/dist` (rebuilt, passes) on localhost, headless Google Chrome at 360x700, English screenshot read. Sign in button (y 389-453), "Use manager access code" (about y 492) and the fine print and connection-settings link all sit inside the first 700 px (content ends near y 620). Urdu not screenshotted (the language switch cannot be driven from a headless screenshot). Observed: the English segment of the shared `LanguageToggle` shows "En..." at this width (a `SegmentedControl` width issue in spec 21, not fixed here; I wrapped the toggle in a non-shrinking View, which did not change it). Tests 14/14 and typecheck re-run after that wrapper.
