# Spec 66 — Fix: the message bar shows failures with a failure icon, not a tick

**Status:** Done
**Depends on:** Spec 65
**Model:** Light — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/design/messageBarTone.test.mjs`, `specs-mobile-redesign/inventory/66-message-bar-tone.md`
**Reuses:** `frontend-mobile/src/design/Feedback.tsx`, `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/screens/TasksScreen.tsx`, `frontend-mobile/tests/design/feedback.test.mjs`, `frontend-mobile/tests/design/messageBarPolish.test.mjs`, `DESIGN-SYSTEM.md#states`

## Goal

A failure shown in the staff message bar no longer carries the yellow `Check` tick, which means "done". The bar gets a tone; both existing callers, which only report failed refreshes, use the failure tone.

## Scope

**(a) Tone.** `useSnackbar().show(messageKey, values?, tone?)` takes an optional third argument `tone`: `'confirm'` (default) or `'failure'`. `confirm` keeps today's look: `Check` in `colors.yellow`. `failure` shows `CircleAlert` (the error glyph `Field.tsx` already uses) in `colors.surface`, the colour `OfflineBanner` uses for its icon on a dark bar; `yellow` stays reserved for confirmation, `bad` does not reach contrast on `ink`, and `late` is reserved for late check-in. The bar, text, timing, motion and offset from spec 65 are unchanged. The text is the same for screen readers: the icon is decorative and the live region still reads the message.

**(b) Callers.** `HomeScreen.tsx` ("Today could not refresh. Try again.") and `TasksScreen.tsx` ("Tasks could not refresh. Try again.") pass `'failure'`.

- This spec is the **sole later editor** of `Feedback.tsx` (spec 24, edited by 65), `HomeScreen.tsx` (spec 33) and `TasksScreen.tsx` (spec 34). It changes only: the `Show` type and the `SnackBar` icon and its tone plumbing in `Feedback.tsx`; the one `snackbar.show(...)` line in each screen.

## Explicit non-scope

- The Photo uploaded message in `VerificationScreen.tsx` → stays a confirmation (default tone; spec 57 owns the photo screen).
- New message texts or translations → none needed (spec 62 owns the shared translation helper).
- Bar motion, offset, timer → spec 65.

## Reuse first

- `Icon`, `colors.yellow`, `colors.surface` as `Feedback.tsx` already imports them.

## Steps

1. Add the tone to `Show`, `SnackbarProvider` state and `SnackBar`.
2. Pass `'failure'` in the two screens.
3. Write `tests/design/messageBarTone.test.mjs`; run the existing tests.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/messageBarTone.test.mjs` passes: `show(key)` renders `Check` in `colors.yellow`; `show(key, undefined, 'failure')` renders `CircleAlert` in `colors.surface` and no `Check`; the live region text is identical in both; the two screen files pass `'failure'` and name no raw colour. Each assertion fails on the tree before the change. [unit]
- [x] `tests/design/feedback.test.mjs`, `tests/design/messageBarPolish.test.mjs`, `tests/screens/myDay.test.mjs` and `tests/screens/tasks.test.mjs` pass unchanged. [unit]
- [x] `grep -nE "rgba|#[0-9a-fA-F]{3,8}\b" frontend-mobile/src/design/Feedback.tsx` prints nothing. [static]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- `show` gained a third argument `tone` (`'confirm'` default, `'failure'`); `SnackTone` exported. Failure icon `CircleAlert` in `colors.surface` (same as `OfflineBanner`'s icon on a dark bar). `late` was rejected (reserved for late check-in), `bad` does not reach contrast on `ink`.
- Existing tests (feedback, messageBarPolish, myDay, tasks, navigation) pass unchanged, 60/60. New `messageBarTone.test.mjs` 4/4. `npm test --prefix frontend-mobile` 667/667; typecheck 0 errors; `build:web` exit 0 (no expo export was running).
