# Spec 14 — Text roles and name lines

**Status:** Done
**Depends on:** Spec 01, Spec 02, Spec 03
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/tests/design/staffText.test.mjs`, `specs-mobile-redesign/inventory/14-staff-text.md`
**Reuses:** `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/src/fonts.ts`, `frontend-mobile/src/components/ui/text.tsx`, `frontend-mobile/tests/support/nativeHarness.mjs`, `DESIGN-SYSTEM.md#type`, `DESIGN-SYSTEM.md#copy`

## Goal

Every new screen sets text through one component that picks the right face, size, line height, colour and direction for a role, and puts entered names on their own isolated line in Urdu.

## Scope

`StaffText` props: `role` (a key of `tokens.type`), `color` (a key of `tokens.colors`, default `ink`), `align` (`start`, `center`, `end`; default `start`), `numberOfLines`, `compact` (for `nowTitle` and `nowTitleLong`), `translate` (default true), `accessibilityRole`, `accessibilityLiveRegion`, `style` (layout only), `children`.

Behaviour:
- Plain string children go through `t()` from `useLanguage` when `translate` is true. Entered names pass `translate={false}`.
- Size and line height come from `tokens.type[role][language]`. The face comes from `fontFor(family, language, fontsReady)` (spec 03). A Latin-only string in Urdu (checked with `isLatinOnly`) uses the English face and English line height, so task names and times stay readable.
- Direction: `writingDirection` and `textAlign` follow `isRTL` (`start` means right in Urdu), like `components/ui/text.tsx`.
- `fontVariant: ['tabular-nums']` on every role.
- `allowFontScaling` stays on; `maxFontSizeMultiplier` 1.4 for `action`, `label`, `badge` and `calendarHead`, so Android font scaling cannot break those.

Also export:
- `NameLine({ role, color, name })`: one line holding an entered name, never translated, wrapped in Unicode first-strong isolate characters (U+2068 … U+2069), aligned to the screen's start side.
- `LabeledName({ role, color, labelKey, name, values })`: in English renders one text `t(labelKey)` with `{area}` replaced by the isolated name (for example "Next: Lobby and reception"). In Urdu renders the translated label with the `{area}` placeholder removed (trailing colon kept) on one line, then a `NameLine` below. This is the design's Urdu fix (`design/mobile-redesign/v3/NOTES.md`, item 3).
- `isolate(text)`: returns the text wrapped in U+2068 and U+2069 for use inside a sentence (times, numbers).

## Explicit non-scope

- Buttons and pills → specs 19 and 20 (they use `StaffText`).
- Changing `components/ui/text.tsx` → never; legacy screens keep it until spec 49.

## Reuse first

- Copy the RTL and Latin-detection rules from `components/ui/text.tsx` instead of inventing new ones.

## Steps

1. Build the component and the helpers.
2. Test with the harness in English and Urdu.
3. Record exports in the inventory fragment.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/staffText.test.mjs` passes: role `body` in English renders size 16 and line height 23 and the Inter regular family, and in Urdu size 17 and the Noto family; a Latin-only child in Urdu keeps the Inter family; `translate={false}` leaves "Check in" in English under Urdu; `LabeledName` with `Next: {area}` renders one English text containing the name, and in Urdu renders two texts where the second is exactly the isolated name; `align="start"` gives right alignment in Urdu. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `src/design/StaffText.tsx` (`StaffText`, `NameLine`, `LabeledName`, `isolate`) and `tests/design/staffText.test.mjs`. Single file: 16/16 pass. Whole mobile suite: 218/218 pass, 0 failures. Typecheck: 0 errors. `npm run build:web`: passes (exported `dist`). Sizes are asserted against `tokens.ts` (Urdu `nowTitle` is smaller but taller than English; Urdu `body` 17 vs English 16). Choices the spec left open: a Latin-only string in Urdu keeps the Urdu role size but uses the English face and English line height (as the spec says); `input` and `badge`, whose Urdu token keeps a Latin family key, render in Inter in Urdu (`fontFor` with `ur` would have returned Noto for any key); `numberOfLines` defaults to the role's `maxLines` (3 for `nowTitleLong`); the `narrow` `calendarHead` Urdu size is applied below 375 wide; before fonts load the system face gets a weight matching the role (fonts ready sets `fontWeight: normal`, as legacy `Text` does); on web an Urdu face is followed by the role's English face in the family list so Latin glyphs inside Urdu text render in Inter. `LabeledName` fills placeholders itself after `t(labelKey)`, so it also works with the harness `t` mock, which ignores values. Not verified: a device, Android font scaling at 1.4, a screen reader, and a 360 by 700 window (this spec adds no screen).
