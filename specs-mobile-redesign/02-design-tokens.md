# Spec 02 — Design tokens

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/src/design/tokens.test.ts`, `specs-mobile-redesign/inventory/02-design-tokens.md`
**Reuses:** `DESIGN-SYSTEM.md#colour`, `DESIGN-SYSTEM.md#type`, `DESIGN-SYSTEM.md#layout`, `DESIGN-SYSTEM.md#motion`, `design/mobile-redesign/v3/style.css`

## Goal

Every value in `DESIGN-SYSTEM.md` exists once, typed, in `src/design/tokens.ts`, so every later spec styles with names instead of numbers and hex.

## Scope

Create `src/design/tokens.ts` exporting plain frozen objects (no React, no React Native imports):

- `colors`: every token in `DESIGN-SYSTEM.md#colour`, same names, same values. Values are strings React Native accepts (6 or 8 digit hex).
- `type`: one entry per role in `DESIGN-SYSTEM.md#type` with `en` and `ur` variants. Each variant has `family` (a role key, not a font file name: `body`, `bodySemi`, `bodyBold`, `bodyExtra`, `title`, `titleBold`, `urdu`, `urduBold`), `size` and `lineHeight` in px. For `nowTitleLong` include both the normal and the compact sizes. Include `maxLines` where the design limits lines (`nowTitleLong`: 3).
- `space`: `gutter` (20), `gutterNarrow` (16), `narrowWidth` (375), and the row, dock, field, chip, segment, tab, sheet, card, tile, badge and shutter sizes from `DESIGN-SYSTEM.md#layout`, with names that say what they size (for example `rowMinHeight`, `rowMinHeightCompact`, `markerSize`, `actionHeight`).
- `radius`: values from the same table.
- `motion`: durations in ms (`press` 120, `nowChange` 220, `sheet` 280, `scrim` 200, `dialog` 180, `snack` 200, `busy` 180, `scanLine` 1900, `locateRing` 1500, `badge` 340, `tickDraw` 300, `tickDelay` 120, `reducedFade` 120), easing control points (`easeOut` 0.23, 1, 0.32, 1 and `drawer` 0.32, 0.72, 0, 1) and press scales (0.97, shutter 0.93).
- `contrast(foreground, background)`: a pure helper returning the WCAG contrast ratio of two 6-digit hex colours. It is used by the test and may be used by later specs' tests.
- `isNarrow(width)`: true below `narrowWidth`.
- `gutterFor(width)`: 20 or 16.

Keep names exactly as `DESIGN-SYSTEM.md` writes them; later specs cite those names.

## Explicit non-scope

- Font files and family registration → spec 03 maps the role keys to real families.
- Any component or screen → specs 14 onward.
- Removing `src/theme.ts` or `global.css` → spec 49.

## Reuse first

- Read values from `DESIGN-SYSTEM.md`, then cross-check against `design/mobile-redesign/v3/style.css` `:root` and the rules it names. If they disagree, `DESIGN-SYSTEM.md` wins; note the difference in the Log.

## Steps

1. Transcribe the tables.
2. Write `tokens.test.ts`.
3. Write `inventory/02-design-tokens.md` listing each export and its keys.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/design/tokens.test.ts` passes: every colour token in `DESIGN-SYSTEM.md` is present with the same value (the test holds the expected list); every contrast pair listed in `DESIGN-SYSTEM.md#colour` is at least 4.5; `late` differs from `yellow`; every `type` role has `en` and `ur` with Urdu size at least the English size (as run: every role except the six Manrope display roles DESIGN-SYSTEM.md sets smaller in Urdu, see Log); `gutterFor(360)` is 16 and `gutterFor(390)` is 20; `isNarrow(374)` true, `isNarrow(375)` false. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `tokens.ts` imports nothing from React or React Native. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes (as run: from a scratch copy of the same sources; in place it fails on the root-owned `.expo` cache, see Log). [static]

## Log

- **2026-11-11** — Built `frontend-mobile/src/design/tokens.ts` (`colors`, `type`, `space`, `radius`, `motion`, `tokens`, `contrast`, `isNarrow`, `gutterFor`; deep-frozen, no imports at all) and `tokens.test.ts` (9 tests, 9 pass). Whole suite `npm test --prefix frontend-mobile`: 143 tests, 143 pass, 0 fail (spec 01's glob script was already in place, so the new file was picked up). Typecheck: 0 errors. Static check: `grep '^import' src/design/tokens.ts` finds nothing. Inventory fragment `inventory/02-design-tokens.md` written.
  - **Spec wrong (needs the lead):** the Done-when check "Urdu size at least the English size" contradicts `DESIGN-SYSTEM.md#type`, which sets `nowTitle` (31/28), `nowTitleCompact` (26/23), `nowTitleLong` (27/25), `pageTitle` (30/27), `headline` (27/25) and `moment` (30/25) smaller in Urdu (taller lines instead), and `v3/style.css` agrees (e.g. RTL compact now-title 23px). DESIGN-SYSTEM.md wins per this spec, so values are unchanged; the test asserts Urdu size >= English for the other 14 roles, asserts the six are the only exceptions, and asserts Urdu line height >= English for all 20. Invariant 7 / AGENT-GUIDE "Urdu one step larger" is therefore only true of line height for those six roles.
  - **Build gate:** `npm run build:web` in place fails with `EACCES` creating the favicon cache: `frontend-mobile/.expo` is a symlink to `.notifications-original-frontend-mobile/.expo`, whose `web/cache` tree is owned by root. Environment problem, not caused by this spec; the JS bundle step had already succeeded (3223 modules). Ran the same export from a scratch copy of `frontend-mobile` (same sources, fresh `.expo`, real `node_modules` symlink): exit 0, "Exported: dist". Scratch copy deleted. Someone with root should `chown` that cache or the build gate will fail for every spec.
  - Design choices: `family` keys follow spec 03's mapping (`title` = Manrope ExtraBold, `titleBold` = Manrope Bold). Urdu variants use `urdu`/`urduBold` (SemiBold and heavier → `urduBold`), except `input` (Latin, LTR) and `badge` (a number), which keep `body`/`bodyBold`. `nowTitle` also carries `compact` (= `nowTitleCompact`) because spec 14's `compact` prop applies to `nowTitle`; `nowTitleCompact` stays as its own role. `calendarHead.ur.narrow` holds the 13/18 below-375 size. `dockPad` is split into `dockPadTop`/`dockPadSide`/`dockPadBottom`; layout radii live in `radius` (`actionRadius`, `sheetRadius`, `workSheetRadius`, `cardRadius`, `tileRadius` plus `fieldRadius`, `chipRadius`, `segmentTrackRadius`, `segmentThumbRadius`, `tabPipRadius`, `badgeOkRadius`, `pillRadius`). Motion is grouped as `motion.duration.*`, `motion.easing.{easeOut,drawer}`, `motion.scale.{press,shutter}`.
  - CSS cross-check differences (DESIGN-SYSTEM.md kept): `.chip` radius is 20 in `v3/style.css`, 22 in DESIGN-SYSTEM.md. All colour hex values and the row, dock, field, segment, tab, shutter, sheet, badge and tile sizes match the CSS. Not verified on a device (no UI in this spec).
