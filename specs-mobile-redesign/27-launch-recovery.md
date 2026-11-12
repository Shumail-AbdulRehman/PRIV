# Spec 27 — Access code and password replacement form

**Status:** Done
**Depends on:** Spec 19, Spec 22
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/tests/screens/launchRecovery.test.mjs`, `specs-mobile-redesign/inventory/27-launch-recovery.md`
**Reuses:** `frontend-mobile/src/launch/recoveryPolicy.ts`, `frontend-mobile/src/launch/launchApi.ts`, `frontend-mobile/src/launch/LaunchRecovery.test.ts`, `frontend-mobile/src/design/Field.tsx`, `frontend-mobile/src/design/ActionButton.tsx`, `design/mobile-redesign/v3/views.js`

## Goal

The manager access code form and the password replacement form look like the design ("Set your new password") without changing what they check or send.

## Scope

Restyle `LaunchRecovery` (props unchanged: `handoff`, `onComplete`, `onCancel`) with `Field` and `ActionButton`:
- Heading in `headline`: handoff "Set your new password"; otherwise "Replace your password". One body sentence muted: handoff "Enter the code from your manager."; otherwise the existing sentence.
- Fields: handoff "Access code" (`kind: code`), otherwise "Current password"; then "New password", "Confirm new password". Error from the existing logic shown under the last field through `Field`'s `error`.
- Hint "Use at least 8 characters. You will sign in again on this phone." (replaces the long byte-count sentence only as a hint; the validation error text stays exactly as today).
- Actions: `form` button "Save new password" (busy while saving); `ghost` "Back to sign in" (handoff) or "Cancel" when `onCancel` is given.

Unchanged: `validReplacementPassword`, the 43-character code check, `completeStaffHandoff` and `replaceOwnPassword` calls, the in-flight guard, clearing fields after success, and every error message.

## Explicit non-scope

- Where the form is shown (sign in, forced change, change password screen) → specs 28, 40, 48.

## Reuse first

- All logic stays in the file as is; only the rendering changes.

## Steps

1. Restyle.
2. Write the component test; keep `src/launch/LaunchRecovery.test.ts` green.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/launchRecovery.test.mjs` passes: handoff shows "Set your new password" and an access code field; a short password shows the existing validation error and calls nothing; a valid handoff calls `completeStaffHandoff` once even if pressed twice, then `onComplete`; a 403 on replacement shows the existing 403 message; Urdu renders the translated heading. [unit]
- [x] `cd frontend-mobile && npx tsx --test src/launch/LaunchRecovery.test.ts` still passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — `LaunchRecovery` restyled with `Field`, `StaffText`, `ActionButton`; logic untouched. New `tests/screens/launchRecovery.test.mjs`: 8/8 pass. `src/launch/LaunchRecovery.test.ts` 15/15. Full suite 380/380. Typecheck 0 errors; build:web passes. Test-only exceptions: the old component tests in `tests/launchRecovery.test.mjs` (mocked `Button`/`Input`) were moved into the new harness file with the same behaviours (double-press guard, secrets cleared after success, 403 keeps draft, handoff code check, Urdu LTR/right-aligned inputs); that file keeps only the policy import. `tests/loginKeyboard.test.mjs` broke because LoginScreen now pulls in Reanimated via ActionButton; added a `../launch/LaunchRecovery` stub there (spec 28 owns LoginScreen). Not verified: 360x700 visual check in a browser, device, screen reader. Notes: all needed Urdu strings already existed in staffAppTranslations.ts. Non-handoff body sentence kept as today. The ghost button shows for handoff even when `onCancel` is absent (no-op), per spec. The old key 'Save password and sign in' is no longer used here.
- **2026-11-11** — Follow-up after lead review: added the replacement-form double-press/busy/clear-after-success test and secureTextEntry plus allowFontScaling-not-false assertions to the Urdu test. Spec test file now 9/9; full suite 381/381.
