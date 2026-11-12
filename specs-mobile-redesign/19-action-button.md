# Spec 19 — Action button and bottom dock

**Status:** Done
**Depends on:** Spec 02, Spec 14
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/tests/design/actionButton.test.mjs`, `specs-mobile-redesign/inventory/19-action-button.md`
**Reuses:** `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/components/ui/icon.tsx`, `DESIGN-SYSTEM.md#components`, `DESIGN-SYSTEM.md#motion`, `design/mobile-redesign/v3/style.css`

## Goal

One button component and one bottom dock give every screen the same big yellow next step, the blue form submit, outline and text-style actions, and a non-pressable status when no action is available.

## Scope

**`ActionButton`** props: `kind` (`next`, `form`, `outline`, `ghost`, `danger`), `label` (English key, translated), `icon` (Lucide name, optional), `onPress`, `busy`, `accessibilityLabel` (defaults to the translated label), `haptic` (default true for `next`).
- Sizes, colours, radius and type from `DESIGN-SYSTEM.md#components` (`actionHeight` 64, `actionRadius` 18; ghost 52 with no fill).
- Press feedback: Reanimated scale to 0.97 over 120 ms with the `easeOut` curve, back on release; none under reduced motion. `next` buttons trigger `Haptics.impactAsync(Light)` on press.
- `busy`: shows a spinner in place of the icon, keeps the same size and label, ignores presses, `accessibilityState.busy` true.
- There is no `disabled` prop on purpose: an unavailable action is never shown as a dead button (ARCHITECTURE invariant 10).
- Icon and label row reverses in Urdu; label may wrap to two lines under large font scale without overflowing.

**`ActionDock`** props: `hint` (optional English key shown above the button, `meta` role, muted, centred), `children`. White surface, top hairline, padding from `dockPad` plus the bottom safe-area inset when the screen has no tab bar (`withSafeArea` prop).

**`DockStatus`** props: `label`, `icon`, `onPress` (optional; design-only shortcuts must not be wired in the app). A `canvas` block the size of the big action with a `muted` label, `accessibilityRole` text and live region polite. Used for "Internet needed to continue", "Check-out opens at {time}" and "Waiting for the upload to finish".

## Explicit non-scope

- Sheets that hold actions → spec 23.
- Replacing the old `components/ui/button.tsx` → spec 49.

## Reuse first

- Icons through `Icon` from `components/ui/icon.tsx`.

## Steps

1. Build the three parts with `StyleSheet` and tokens.
2. Test with the harness.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/actionButton.test.mjs` passes: `next` renders the translated label and calls `onPress` and a light haptic once; `busy` ignores a press and reports busy; `form` has the blue fill token and white label; `ActionDock` shows the hint above the child; `DockStatus` has no press handler unless given and announces politely; the row direction is reversed in Urdu. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in `ActionButton.tsx`. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `ActionButton`, `ActionDock`, `DockStatus` in `frontend-mobile/src/design/ActionButton.tsx` and 9 tests in `tests/design/actionButton.test.mjs` (9 pass). Whole mobile suite: 267 tests, 267 pass, 0 fail. Typecheck 0 errors. No raw hex in ActionButton.tsx. Web build (npm run build:web) passed, Exported: dist. Notes: tests mock `/components/ui/icon` because lucide-react-native loads react-native-svg, which fails under node. Pressed fills for `form` (`blueDeep`), `danger` (`badDeep`), `outline`/`ghost` (`soft`) are my choice; the design system only names `yellowPress`. Ghost and DockStatus labels use the `groupTitle` role (16.5) to match the design's 16.5 size. Scale animation is not asserted (the harness reanimated mock has no hook for it); not verified on a device, at 360 wide, or with large font scale.
