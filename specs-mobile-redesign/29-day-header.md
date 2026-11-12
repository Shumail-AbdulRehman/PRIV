# Spec 29 — My day top area

**Status:** Done
**Depends on:** Spec 05, Spec 15, Spec 20, Spec 21
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/day/DayHeader.tsx`, `frontend-mobile/tests/day/dayHeader.test.mjs`, `specs-mobile-redesign/inventory/29-day-header.md`
**Reuses:** `frontend-mobile/src/screens/day/nowState.ts`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/design/Avatar.tsx`, `frontend-mobile/src/design/LanguageToggle.tsx`, `frontend-mobile/src/design/format.ts`, `design/mobile-redesign/v3/views.js`, `design/mobile-redesign/v3/style.css`

## Goal

The coloured top of My day says, in one sentence, what to do now, with the greeting, the language switch, and after check-in a compact shift line, exactly as the design draws every state.

## Scope

`DayHeader` props: `state` (the `nowState` result), `firstName`, `today` (Date), `timeZone`, `onAvatarPress`, `loading`.

- Background by `state.tone`: `blue`, `quiet` (`night2`), `bad` (`badDeep`), `ok`. The status bar area above it has the same colour (the screen sets a light status bar). A faint large tick mark in the top corner at 7% white (mirrored in Urdu), decorative and hidden from accessibility.
- **Greeting row**: `Avatar` (44, or 38 when the rail is shown) pressable with label "Profile"; "Salaam, {name}" (`label` role bold, white, one line with ellipsis, name isolated); below it the short date from `shortDay` (spec 05) in `onBlue`, **omitted when the rail is shown** (compact); `LanguageToggle` `onBlue` at the end.
- **Sentence**: `state.title` through `LabeledName` (spec 14) in role `nowTitle`, `nowTitleCompact` when the rail is shown, or `nowTitleLong` when the entered name is longer than 22 characters (max 3 lines). In Urdu the label is one line and the task name its own line. Then `state.sub` in `body` (15.5 compact) `onBlue` (`onDarkSoft` on quiet, bad and ok tones); in Urdu an entered task title or place is its own line, followed by the rest of the sentence, as in the design. Max width about 32 characters per line.
- **Sentence change motion**: when the title key or name changes while mounted, the title and sub fade up 8 px over 220 ms (`easeOut`); reduced motion fades only.
- **Rail** (only when `state.rail` exists): a 4 high track at 26% white with a white fill to `progress` and a 14 white dot with a blue border; under it one row with "Checked in {time}" (tick icon) at the start and "Check-out {time}" (log-out icon, mirrored) at the end, `label` role white.
- Bottom padding 46, or 32 when the rail is shown; the white work sheet below overlaps it by 26 (spec 30 draws the sheet).
- `loading`: the same shapes as `Skeleton` blocks on blue (avatar circle, two text lines, two title lines, one sub line).

## Explicit non-scope

- The work list and the dock → specs 30 and 46.
- Deciding the sentence → spec 15 (do not add rules here).

## Reuse first

- Copy no layout values: every size comes from tokens.

## Steps

1. Build the header from the design's My day states (All screens > My day: every "Moment in the day").
2. Test each tone, compact and Urdu.
3. Check at 360 by 700 that "Checked in" and "Check-out" fit on one line in English and Urdu.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/day/dayHeader.test.mjs` passes: before check-in the date shows and there is no rail; after check-in the rail shows both times and the date is gone; the quiet tone uses `night2`; in Urdu the next-task title renders the label and the task name as separate texts; a 30-character name uses the long title role; pressing the avatar calls `onAvatarPress`; loading renders skeletons and no sentence. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] At 360 by 700, in English and Urdu, the rail row is on one line and nothing is clipped; the Log says how this was checked. [runtime]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `DayHeader` (`frontend-mobile/src/screens/day/DayHeader.tsx`) and `tests/day/dayHeader.test.mjs`: 12/12 pass (each tone, before and after check-in, Urdu title split and RTL rows, Urdu place and task-title lines, 30-character name, avatar press in English and Urdu, loading skeletons, sentence motion and reduced motion, 360-wide rail, a real `nowState` result). Typecheck 0 errors. `npm run build:web` passes (the header is not bundled until spec 46 imports it). Whole suite: 380 tests, 379 pass, 1 fail on both runs: `Android login reserves scroll space for the keyboard and keeps sign-in reachable` (`tests/loginKeyboard.test.mjs`). It fails loading `react-native-worklets` because the uncommitted `src/launch/LaunchRecovery.tsx` (spec 27 work, not mine) now imports `ActionButton`, and that old test has no reanimated mock; that box is left unticked. Runtime check: a scratch copy of the app with a demo `App.tsx` showing seven `nowState` results plus loading, exported for web and opened in headless Chrome at 360 by 700 in English and Urdu (language set through the stored preference). Both rail texts measured one line (20 px English, 27 px Urdu) on the same row, document width 360, no text outside the header; screenshots looked right (fill and dot run from the right in Urdu, log-out icon mirrored, place line with pin). Not checked on a device, with large font scaling, or with a screen reader. Where the spec or design did not fit tokens: (1) the greeting uses `groupTitle` (Manrope Bold 16.5), not `label`, because StaffText cannot make `label` bold and the design draws 17 px bold title type; (2) the date uses `meta` in `onBlue`; (3) `body` has no 15.5 compact size, so the sub stays `body` in compact; (4) header sizes with no token (bottom padding 46/32, greeting row 52, rail 4/14/3, tick 250, spacing 18/8/4/12) are named constants in one `layout` object, and translucent white (7 percent tick, 26 percent track) is built from `colors.surface` with an alpha suffix; (5) in Urdu the design puts the place line after the sentence (with a map pin) and the task title before it; I followed the design, although the Scope sentence reads as name first in both cases. The avatar keeps its 38/44 size and reaches 48 through `hitSlop`.
- **2026-11-11** — Lead: reran the whole mobile suite after spec 27 added its `LaunchRecovery` stub to `loginKeyboard.test.mjs`: 381 of 381 pass, 0 fail. The earlier failure was spec 27 mid-edit, not this spec.
- **2026-11-12** — Part 1 release-check fix: the day header rail row now wraps (no line limit on the two times), so "Checked in" and "Check-out" never truncate at 360 wide; regression assertion in tests/day/dayHeader.test.mjs. Re-rendered at 360x700 in headless Chrome (API mocked): both times fully readable on two lines.
