# Spec 26 — Receipt layout

**Status:** Done
**Depends on:** Spec 19, Spec 20
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/Moment.tsx`, `frontend-mobile/tests/design/moment.test.mjs`, `specs-mobile-redesign/inventory/26-moment.md`
**Reuses:** `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/StaffText.tsx`, `DESIGN-SYSTEM.md#motion`, `design/mobile-redesign/v3/views.js`

## Goal

Checked in, Checked out and Work submitted share one calm receipt layout with the one earned animation in the app.

## Scope

`Moment` props: `badge` (`blue` or `green`), `icon` (default `Check`), `title` (English key), `subtitle` (prepared node, often a time), `pill` (optional `Pill` props), `facts` (`{ label, value, valueNode? }[]`), `action` (`ActionButton` element in a borderless dock), `live` (announce the title).

- `canvas` background, content centred vertically, 26 side padding. Badge 96 square, radius 30, white 52 icon. Title `moment`, subtitle `body` muted, optional pill, then a white fact table (radius 18, rows 48 min, hairlines between, label muted, value `bodySemi` aligned to the end; values that are entered names pass untranslated).
- Motion: on mount the badge scales 0.9 to 1 with opacity over 340 ms (`easeOut`), the tick stroke draws over 300 ms after 120 ms, the title and the rest fade up after 90 and 150 ms. One `Haptics.notificationAsync(Success)` on mount. Reduced motion: everything shown at once, still one haptic.
- The tick is drawn with `react-native-svg` so its stroke can animate; the other icons are static Lucide icons.

## Explicit non-scope

- Which facts each receipt shows → specs 31 and 36.

## Reuse first

- `ActionButton` and `Pill`; no new button styles.

## Steps

1. Build the layout and the animation.
2. Test content and the reduced-motion branch.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/moment.test.mjs` passes: title, subtitle, pill and every fact render; an entered-name value is not translated under Urdu; one success haptic fires on mount and not again on re-render; with reduced motion no timing animation is started; the title is a live region when `live` is set. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in `Moment.tsx`. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `Moment.tsx` and `tests/design/moment.test.mjs` (6 tests, all pass). Whole mobile suite 342 pass, 0 fail; typecheck 0 errors; `build:web` passed; no raw hex in Moment.tsx. Decisions: `facts[].value` is always shown untranslated and isolated (entered names, times); `valueNode` is for prepared nodes. The dock is a plain borderless View (ActionDock has a top hairline, so not reused). Tick uses react-native-svg with animated strokeDashoffset (dash 24); the test stubs react-native-svg and adds `useAnimatedProps` to the reanimated mock (harness lacks it). Not verified: real-device animation feel, 360x700 visual check in a browser, screen reader.
