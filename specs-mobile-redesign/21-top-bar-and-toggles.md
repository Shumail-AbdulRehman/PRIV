# Spec 21 — Top bar, segmented control and language toggle

**Status:** Done
**Depends on:** Spec 02, Spec 14
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/TopBar.tsx`, `frontend-mobile/src/design/SegmentedControl.tsx`, `frontend-mobile/src/design/LanguageToggle.tsx`, `frontend-mobile/tests/design/topBarToggles.test.mjs`, `specs-mobile-redesign/inventory/21-top-bar-and-toggles.md`
**Reuses:** `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/i18n/LanguageProvider.tsx`, `DESIGN-SYSTEM.md#components`, `design/mobile-redesign/v3/style.css`

## Goal

Screens share one back-and-title bar, one segmented control, and one language switch with two looks (on blue, on white), all mirrored in Urdu.

## Scope

**`TopBar`** props: `title` (English key, or an entered name with `translateTitle={false}`), `onBack`, `backLabel` (default "Back"), `trailing` (optional element). 56 high, `surface` fill, 48 round back button with `ArrowLeft` 24 (mirrored in Urdu), title `barTitle`, one line with ellipsis. Adds the top safe-area inset when `withSafeArea` is set.

**`SegmentedControl`** props: `options` (`{ value, label, translate }[]`), `value`, `onChange`, `accessibilityLabel`. Track `segmentTrack` with radius 14 and 4 padding; segments 44 high; selected segment `surface` with a soft shadow and `ink` text, others `muted`. `accessibilityRole` tablist for the group and tab for each segment with `selected` state. Order reverses in Urdu.

**`LanguageToggle`** props: `appearance` (`onBlue` or `onWhite`). Two segments "English" and "اردو", each always shown in its own script and face (never translated), calling `setLanguage`. `onBlue`: translucent white track, active segment white with `blueDeep` text, others white text, 42 high segments, 44 minimum width. `onWhite`: uses `SegmentedControl`. Accessibility label "Language / زبان" like `LanguageChoice` today.

## Explicit non-scope

- Tab bar → spec 48.
- Removing `LanguageChoice` → spec 49.

## Reuse first

- `setLanguage` and persistence from `LanguageProvider` exactly as `LanguageChoice` uses them.

## Steps

1. Build the three parts.
2. Test with the harness.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/topBarToggles.test.mjs` passes: `TopBar` calls `onBack` and its back icon is mirrored in Urdu; `SegmentedControl` marks the selected tab and calls `onChange` with the pressed value; `LanguageToggle` shows "English" and "اردو" in both languages and pressing "اردو" calls `setLanguage('ur')`; both appearances render. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in the three files. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `TopBar`, `SegmentedControl`, `LanguageToggle` in `frontend-mobile/src/design/`. New test file: 10 tests, all pass. Whole mobile suite: 297 tests, 0 failures. Typecheck 0 errors; `build:web` passes (waited for another export to finish first). Not verified: 360 by 700 layout in a browser or device, font scaling, screen reader. Notes: no translucent-white token exists, so the `onBlue` track uses `cameraButton` (white at 14 percent) instead of the design's 16 percent; `onBlue` segments use RN `Text` with `fontFor` directly because `StaffText` cannot force the Urdu face while the app is in English; mirroring of the back arrow is a `scaleX: -1` wrapper because `Icon` takes no style; the `onWhite` toggle reuses `SegmentedControl` (44 high segments, label role).
- **2026-11-11** — Follow-up fix: the `onWhite` language toggle showed "En..." at 360 by 700 because `SegmentedControl` segments were `flex: 1` with `numberOfLines={1}` inside a narrow parent. Segments now size to their label (`flexShrink: 0`, `minWidth` touch minimum), the track does not shrink, and the label no longer sets `numberOfLines`. Added a test.
- **2026-11-11** — Follow-up: `SegmentedControl` gained a `fit` prop. `'fill'` (default) keeps equal `flex: 1` segments for full-width switches (spec 47); `'content'` sizes segments to their labels with a non-shrinking track. Both have `minWidth` touch minimum and no truncation. `LanguageToggle` `onWhite` passes `fit="content"`. Test updated.
- **2026-11-12** — Lead: removed `frontend-mobile/src/components/LanguageChoice.tsx` from Reuses because spec 62 deleted the file (it had no importer).
