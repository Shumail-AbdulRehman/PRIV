# Spec 20 — Pills, status markers and avatar

**Status:** Done
**Depends on:** Spec 02, Spec 06, Spec 14
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/StatusMarker.tsx`, `frontend-mobile/src/design/Avatar.tsx`, `frontend-mobile/tests/design/statusParts.test.mjs`, `specs-mobile-redesign/inventory/20-status-parts.md`
**Reuses:** `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/components/ui/icon.tsx`, `DESIGN-SYSTEM.md#components`

## Goal

Small presentational parts that carry status: a pill in eight tones, a round task marker that never looks like a checkbox, and the default avatar.

## Scope

**`Pill`** props: `tone` (`neutral`, `blue`, `green`, `needsYou`, `needsYouSoft`, `red`, `late`, `warn`), `label` (English key), `icon` (optional Lucide name, 14), `spinning` (rotates the icon, for "Saved, uploading"; static under reduced motion). Colours and padding exactly as `DESIGN-SYSTEM.md#components`; `warn` has the 1.5 outline. Text role `label`. Never wraps (single line, shrinks the container instead).

**`StatusMarker`** props: `marker` and `tone` from `displayFor` (spec 06), `position` (number for `position` markers), `hiddenLabel` (English key for screen readers when no pill is shown). 34 round, filled, no border. Icons: droplet (`Droplets`), camera (`Camera`), clock (`Clock`), tick (`Check`), double tick (`CheckCheck`), cross (`X`), 18 size. A `position` marker shows the number in `bodyBold` 15 on `canvas` with `muted` text. The marker itself is `accessibilityElementsHidden`; `hiddenLabel` is rendered as an accessible, visually hidden text.

**`Avatar`** props: `size` (44, 38 or 76). A circle on `tintBg` with the `UserRound` icon in `tintFg` at 56% of the size. No initials, no image, `accessible={false}`.

## Explicit non-scope

- The task row that combines marker and pill → spec 25.
- Calendar day cells → spec 42.

## Reuse first

- Tone and marker choice come only from `displayFor` in `taskState.ts`; do not map task statuses again here.

## Steps

1. Build the three parts.
2. Test each tone and marker.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/statusParts.test.mjs` passes: each pill tone uses its two colour tokens; `late` uses the `late` token, not `yellow`; a `position` marker shows "3"; a `doubleTick` marker uses the `CheckCheck` icon on `ok`; the marker is hidden from accessibility and the hidden label is present; the avatar renders an icon and no text. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in the three files. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `Pill.tsx`, `StatusMarker.tsx`, `Avatar.tsx` and `tests/design/statusParts.test.mjs` (20 tests, all pass). Whole mobile suite: 287 tests, 287 pass, 0 fail. Typecheck 0 errors; `build:web` exit 0; no raw hex in the three files (grep). Notes: (1) the position number is "bodyBold 15" but no `StaffText` role has that size, so `StatusMarker` uses a plain RN `Text` with `fontFor('bodyBold', 'en', fontsReady)` size 15 / line 18. (2) The `warn` pill subtracts the 1.5 outline from its padding so its size matches the other tones. (3) The hidden label is a 1 by 1 clipped sibling of the hidden marker. (4) The test stands in a plain `Icon` element because lucide needs react-native-svg under node. Icons confirmed present: droplets, camera, clock, check, check-check, x, user-round, loader. Not verified: real device, font scaling, screen reader, the 360 by 700 visual check (parts are fixed-size and single-line; not viewed in a browser).
