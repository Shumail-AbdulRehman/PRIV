# Spec 65 — Fix: message bar motion, offset and translucent-white tokens

**Status:** Done
**Depends on:** Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/design/messageBarPolish.test.mjs`, `specs-mobile-redesign/inventory/65-message-bar-polish.md`
**Reuses:** `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/src/design/Feedback.tsx`, `frontend-mobile/src/screens/day/DayHeader.tsx`, `frontend-mobile/src/design/LanguageToggle.tsx`, `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/tests/design/feedback.test.mjs`, `DESIGN-SYSTEM.md#motion`, `design/mobile-redesign/v3/style.css`

## Goal

The staff message bar fades in and rises, always sits clear above the tab bar, and every translucent white comes from a token. This fixes finding 65 (`docs/plan-project/mobile-redesign/planning/verification.md` §3 and §7; spec 24 Log).

## Scope

**(a) Tokens.** `v3/style.css` uses white at 14 percent (`.icbd`, `.timer`; already `colors.cameraButton`), 16 (`.langpill`), 22 (skeleton `.sk` is 20), and 26 (`.rail .track`); `DayHeader.tsx` also uses 7 for its ticks. Add a frozen `whiteAlpha` export to `tokens.ts`: `tick` `#ffffff12` (7), `track` `#ffffff29` (16), `block` `#ffffff38` (22), `rail` `#ffffff42` (26). It is separate from `colors` because `tokens.test.ts` requires `colors` to match the DESIGN-SYSTEM colour table exactly. Use them in `Feedback.tsx` (`Skeleton` `onBlue`, replacing the raw `rgba`), `DayHeader.tsx` (delete `withAlpha`; ticks and track) and `LanguageToggle.tsx` (`onBlue` track, no longer `cameraButton`; 14 becomes the design's 16). No other visual change.

**(b) Entry motion.** The snackbar becomes a small `SnackBar` part using Reanimated: fade 0 to 1 and `translateY` 12 to 0 over `motion.duration.snack` (200 ms) with `easeOut`, replayed for each new message id. Under `useReducedMotion()` (the pattern `Pill`, `PhotoCaptureControls` and `DayHeader` already use) it only fades, in `motion.duration.reducedFade` (120 ms), with no rise. No exit animation: the provider's existing 2.2 s timer unmounts the bar, so there is nothing to flicker.

**(c) Offset.** `useBottomTabBarHeight` is not available: `SnackbarProvider` is mounted in `AppNavigator` outside the tab navigator, and the bar also shows on stack screens. Instead the bar's `bottom` is computed from the same formula as the tab bar: `tokens.ts` gains `tabBarHeight(insetBottom, labelLineHeight, fontScale)` and the tab spacing numbers (`space.tabBarPadTop` 8, `tabBarPadBottom` 4, `tabPipLabelGap` 6, `tabLabelScaleCap` 1.4, `snackAboveBar` 12); `StaffTabs.tsx` uses it for its own `height` and padding (identical values), and `Feedback.tsx` uses `useSafeAreaInsets().bottom`, `useWindowDimensions().fontScale` and the language's `label` line height. `bottom = tabBarHeight(...) + 12`, so it never overlaps the bar at any inset, font scale or language, and does not depend on where the provider sits. The fixed 96 is removed.

- This spec is the **sole later editor** of `tokens.ts` (owned by spec 02), `Feedback.tsx` and `feedback.test.mjs` (spec 24), `DayHeader.tsx` (spec 29), `LanguageToggle.tsx` (spec 21) and `StaffTabs.tsx` (spec 50, edited by 51 and 61). It changes only: the new tokens and helper; the `SnackBar` part, the offset and the `Skeleton` colour; the two translucent constants in `DayHeader`; the track colour in `LanguageToggle`; the bar height lines in `StaffTabs`; and in `feedback.test.mjs` the `bottom` expectation (96 to 84) and the skeleton colour expectation.

## Explicit non-scope

- `DESIGN-SYSTEM.md` colour table and `tokens.test.ts` → unchanged (spec 02 and spec 53 own them); `whiteAlpha` lives outside `colors` on purpose.
- Moving the provider into the tab navigator, or a swipe to dismiss → not planned (spec 24 owns the bar).
- "Take a new photo" no-op (finding 64) → waits for the owner (spec 53 finding 64).
- e2e → spec 52 (the lead reruns it).

## Reuse first

- `motion.duration.snack`, `motion.duration.reducedFade`, `motion.easing.easeOut`; `useReducedMotion` as in `Pill.tsx`; `useSafeAreaInsets`; `StaffText`.

## Steps

1. Tokens and `tabBarHeight`; switch `StaffTabs.tsx` to it and run `navigation.test.mjs`.
2. Use `whiteAlpha` in the three files.
3. `SnackBar` with motion and offset; adapt the two expectations in `feedback.test.mjs`.
4. Write `tests/design/messageBarPolish.test.mjs`.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/messageBarPolish.test.mjs` passes: the four `whiteAlpha` values; the three files name the tokens (no `rgba(`, no `withAlpha`, no `cameraButton` in `LanguageToggle`); the bar starts at opacity 0 and `translateY` 12 and animates to 1 over 200 ms; under reduced motion it starts at `translateY` 0 and animates over 120 ms; `bottom` equals `tabBarHeight(...) + 12` for insets 0, 34, 48 and font scales 1, 1.4, 2. Each assertion fails on the tree before the change. [unit]
- [x] `tests/design/feedback.test.mjs`, `tests/day/dayHeader.test.mjs`, `tests/design/topBarToggles.test.mjs`, `tests/screens/navigation.test.mjs` and `src/design/tokens.test.ts` pass; the only test edits are the two expectations named in Scope. [unit]
- [x] `grep -nE "rgba|#[0-9a-fA-F]{3,8}\b" frontend-mobile/src/design/Feedback.tsx frontend-mobile/src/screens/day/DayHeader.tsx frontend-mobile/src/design/LanguageToggle.tsx frontend-mobile/src/navigation/StaffTabs.tsx` prints nothing. [static]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- Tokens: `whiteAlpha` = `tick` `#ffffff12`, `track` `#ffffff29`, `block` `#ffffff38`, `rail` `#ffffff42`. They live outside `colors` because `tokens.test.ts` compares `colors` to the DESIGN-SYSTEM table (a first try inside `colors` failed that test). `DESIGN-SYSTEM.md` was not edited. The skeleton stays at 22 as before (v3 shows 20); the language track moves 14 to 16 as the design says.
- Motion: Reanimated `withTiming` on one shared value; opacity and `translateY` `(1 - p) * 12`; reduced motion fades in 120 ms only.
- Offset: `tabBarHeight` (8 + item + 4 + inset) shared with `StaffTabs`; the snackbar adds 12. English at inset 0 gives 72 + 12 = 84 (was 96); with inset 34 it is 118.
- Test edits in `feedback.test.mjs`: `bottom` 96 to 84; skeleton colour now `whiteAlpha.block` instead of the `rgba` pattern.
- Runs: `messageBarPolish.test.mjs` 5/5; feedback, dayHeader, topBarToggles, navigation and tokens tests pass; `npm test --prefix frontend-mobile` 659/659; typecheck 0 errors; `build:web` exit 0 (no expo export was running). Rendered check done: see the next line. Each new assertion fails on the old tree by construction (no `whiteAlpha`, fixed 96, no animation); I did not rerun the old tree.
- Rendered check (headless Chrome from a copy of `dist`, API mocked with the e2e fixtures, failed refresh triggered through the screen's own `onRefresh`): at 360x700 and 390x844 the bar sat fully above the tab bar in English (Tasks tab; bar bottom 616 vs tab top 637 at 360, 760 vs 781 at 390) and Urdu (My day, since the Urdu tab click missed; 611 vs 632, 755 vs 776). Document width equals the viewport. Screenshots: `/tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/fix65/snack-360x700-en.png`, `snack-360x700-ur.png`, `snack-390x844-en.png`, `snack-390x844-ur.png`. The only page error is the blocked jsQR CDN worker. Server stopped.
