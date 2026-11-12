# Spec 23 — Bottom sheet and sign-out dialog

**Status:** Done
**Depends on:** Spec 19
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/design/BottomSheet.tsx`, `frontend-mobile/src/design/ConfirmDialog.tsx`, `frontend-mobile/tests/design/bottomSheet.test.mjs`, `specs-mobile-redesign/inventory/23-bottom-sheet.md`
**Reuses:** `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/src/design/StaffText.tsx`, `DESIGN-SYSTEM.md#components`, `DESIGN-SYSTEM.md#motion`, `design/mobile-redesign/v3/style.css`

## Goal

Problems and choices appear in one accessible bottom sheet (weak GPS, wrong place, camera refused, wrong QR, photo results, unsubmitted work, attendance day), and sign-out confirms in one small dialog.

## Scope

**`BottomSheet`** props: `visible`, `onDismiss` (called by Android back and scrim tap; omit to make the sheet non-dismissable), `glyph` (Lucide name), `glyphTone` (`needsYou`, `red`, `blue`, `green`), `title` (English key or prepared node), `body` (English key or node), `actions` (`ActionButton` elements), `children` (custom content, used by the attendance day sheet), `haptic` (`warning` or none, fired once on open).
- Built on React Native `Modal` with `transparent`, `statusBarTranslucent` and `onRequestClose` (Android back). Scrim `scrim` token fades in over 200 ms; the sheet slides from the bottom over 280 ms with the `drawer` curve; reduced motion fades over 120 ms instead.
- Layout per `DESIGN-SYSTEM.md#components`: grab handle, glyph tile, title `sheetTitle`, body `body` muted, actions stacked with 8 gap, bottom safe-area padding.
- Accessibility: `accessibilityViewIsModal`, the title is announced on open, focus starts at the title; the content behind is not reachable.

**`ConfirmDialog`** props: `visible`, `title`, `body`, `confirmLabel`, `cancelLabel`, `destructive`, `onConfirm`, `onCancel`. Centred card radius 26 over the scrim, title `sheetTitle`, body muted, two text buttons right-aligned (left in Urdu), confirm in `bad` when destructive. Scale 0.96 to 1 and fade over 180 ms.

## Explicit non-scope

- The content of each sheet → spec 31, spec 34, spec 42, spec 45 and spec 46.
- Toasts → spec 24.

## Reuse first

- Actions are `ActionButton`s; do not style buttons here.

## Steps

1. Build both parts.
2. Test visibility, dismissal rules and actions.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/bottomSheet.test.mjs` passes: hidden renders nothing; visible renders title, body and both actions; `onRequestClose` calls `onDismiss`; without `onDismiss` back does nothing; a warning haptic fires once on open; `ConfirmDialog` calls `onConfirm` and `onCancel`; under reduced motion no slide animation is configured. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in the two files. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `BottomSheet` (React Native `Modal`, transparent, status and navigation bar translucent; scrim fades 200 ms; sheet slides from the window height over 280 ms on the `drawer` curve, or fades 120 ms under reduced motion; grab handle, optional 50 glyph tile in four tones, `sheetTitle` title, muted `body`, children, actions stacked 8 apart, bottom padding `max(26, inset + 16)`; `accessibilityViewIsModal`, title wrapped in a `header` view that receives screen-reader focus after the opening motion; scrim tap, Android back and the escape gesture call `onDismiss`; no `onDismiss` makes back a no-op and the scrim inert; `haptic: 'warning'` fires once per opening) and `ConfirmDialog` (centred card radius 26, scale 0.96 to 1 plus fade over 180 ms, fade 120 ms reduced; two 48-high text buttons in `groupTitle`, right-aligned, mirrored in Urdu; destructive confirm in `bad`; back cancels; `cancelLabel` defaults to "Cancel"). Both render nothing while hidden. `bottomSheet.test.mjs`: 12/12 pass. Whole mobile suite 336/336. Typecheck 0 errors. `build:web` passes (no screen imports the parts yet, so the export does not bundle them). No raw hex in either file (grep).
  - Not verified: a device or browser at 360 by 700, TalkBack focus landing on the title (the harness has no host refs, so focus is not unit-tested), and the slide on a real device. The slide starts from the window height rather than the sheet's own height (`100%`), to avoid a layout pass; with the drawer curve this reads the same.
  - Spec gaps filled by judgment: the dialog scrim is not tappable (the design gives it no action; back cancels); the dialog's text buttons are built here, not `ActionButton`, because `ghost` is full width; `glyph` is optional because the attendance day sheet in the design has none. `useFocusOnOpen` is exported from `BottomSheet.tsx` for reuse by the dialog.

