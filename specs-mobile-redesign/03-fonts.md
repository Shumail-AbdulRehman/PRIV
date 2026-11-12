# Spec 03 — Bold Inter and Manrope fonts

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/assets/fonts/Inter-Bold.otf`, `frontend-mobile/assets/fonts/Inter-ExtraBold.otf`, `frontend-mobile/assets/fonts/Manrope-Bold.ttf`, `frontend-mobile/assets/fonts/Manrope-ExtraBold.ttf`, `frontend-mobile/assets/fonts/MANROPE-LICENSE.txt`, `frontend-mobile/App.tsx`, `frontend-mobile/src/fonts.ts`, `frontend-mobile/src/fonts.test.ts`, `specs-mobile-redesign/inventory/03-fonts.md`
**Reuses:** `frontend-mobile/assets/fonts/INTER-LICENSE.txt`, `docs/plan-project/mobile-redesign/research/stack.md`, `DESIGN-SYSTEM.md#type`

## Goal

The app bundles and registers every weight the design uses, and one function answers "which family for this text role in this language".

## Scope

**Files.**
- `Inter-Bold.otf` and `Inter-ExtraBold.otf`: Inter 4.0, the same version as the bundled `Inter-Regular.otf` (font version 262144). Source: the official Inter 4.0 release (github.com/rsms/inter, `Inter-4.0.zip`, `extras/otf/`) or the Debian `fonts-inter` package (`/usr/share/fonts/opentype/inter/`). Confirm the version with `fc-query -f '%{fontversion}\n' <file>` and record it. The existing `INTER-LICENSE.txt` covers them.
- `Manrope-Bold.ttf` and `Manrope-ExtraBold.ttf`: from the npm tarball `@expo-google-fonts/manrope@0.4.2` (`npm pack @expo-google-fonts/manrope@0.4.2`, files `package/700Bold/Manrope_700Bold.ttf` and `package/800ExtraBold/Manrope_800ExtraBold.ttf`), renamed. Copy `package/LICENSE_FONT` to `MANROPE-LICENSE.txt`. Do not add the package to `package.json`.

**Registration.** `App.tsx` currently registers four families in `staffFonts`. Move the font map into `src/fonts.ts` (exported `staffFonts`) and have `App.tsx` import it, adding `HygeneInterBold`, `HygeneInterExtraBold`, `HygeneManropeBold`, `HygeneManropeExtraBold`. Keep the existing four names unchanged (legacy `Text` uses them). Change nothing else in `App.tsx`.

**Mapping.** In `src/fonts.ts`, keep `NativeFontsReady` and `nativeFontFamily` working exactly as today, and add `fontFor(familyKey, language, fontsReady)` where `familyKey` is one of the role keys from `tokens.ts` (`body`, `bodySemi`, `bodyBold`, `bodyExtra`, `title`, `titleBold`, `urdu`, `urduBold`):
- English: `body` Inter Regular, `bodySemi` Inter SemiBold, `bodyBold` Inter Bold, `bodyExtra` Inter ExtraBold, `title` Manrope ExtraBold, `titleBold` Manrope Bold.
- Urdu: regular weights map to Noto Arabic Regular; SemiBold and heavier (including titles) map to Noto Arabic Bold.
- When fonts are not ready, return the platform fallback the existing `Text` uses (system font), so text still renders.
- Export `isLatinOnly(text)` using the same test the existing `Text` uses (Latin letters and no Arabic script), so a Latin-only string in Urdu mode can keep the Latin face.

## Explicit non-scope

- The text component that uses `fontFor` → spec 14.
- Token values → spec 02.

## Reuse first

- Keep the "fonts never gate sign-in" rule from `src/fonts.ts`.

## Steps

1. Obtain and verify the four files; record sources, versions and SHA-256 sums in the Log.
2. Move the map and add registrations.
3. Add `fontFor` and `isLatinOnly`; write `src/fonts.test.ts`.
4. Build the web export and confirm the new fonts appear in the export's assets.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/fonts.test.ts` passes: every role key maps to the expected registered name in English and Urdu; when fonts are not ready the fallback is returned; `nativeFontFamily` returns exactly what it returned before for all four combinations; `isLatinOnly('Lobby and reception')` is true and `isLatinOnly('اگلا کام')` is false. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] The Log records the font version of both Inter files as 262144 and the SHA-256 of all four files. [static]
- [x] `git diff frontend-mobile/App.tsx` shows only the font map import and use. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes and `dist/` contains the four new font files. [static]

## Log

- **2026-11-11** — Added `Inter-Bold.otf` and `Inter-ExtraBold.otf` (Debian `fonts-inter`, `/usr/share/fonts/opentype/inter/`; `fc-query` fontversion 262144 for both and for the bundled Regular) and `Manrope-Bold.ttf`, `Manrope-ExtraBold.ttf` (npm pack `@expo-google-fonts/manrope@0.4.2` in a temp dir, fontversion 295174; licence copied from `LICENSE_FONT` to `MANROPE-LICENSE.txt`; no dependency added). SHA-256: Inter-Bold.otf `00fd6f4691ee8884a33b46bf45851b341927c37c30064f558e1befb242971c49`; Inter-ExtraBold.otf `2012ceaf1470372c415f95c00495a1ad1ebdcd1cd6a6225808f011d459a9b12a`; Manrope-Bold.ttf `4aed5d180a4f41ed21f07e678486f889bb40eb0ddf5f473769b6302f507d1e36`; Manrope-ExtraBold.ttf `5be6d9b21d23981ab520f0bfc7800c434c9d093467ef24b85b16877e7709b03b`. `staffFonts` moved to `src/fonts.ts` (eight names); `fontFor`, `fallbackFontFamily`, `isLatinOnly` added. `src/fonts.test.ts`: 6 tests pass. Whole suite `npm test --prefix frontend-mobile`: 153 tests, 153 pass, 0 fail. Typecheck 0 errors. Spec deviation: the font `require` calls are wrapped in a small `asset()` try/catch, because `tests/nativeComposition.test.mjs` and the harness import `src/fonts.ts` under plain Node, which cannot parse `.otf` (without the wrapper 5 existing tests failed); Metro never takes the catch branch. `fontFor` takes an optional fourth argument `os` (defaults to `Platform.OS` via a lazy `require('react-native')`, falling back to web) so it can be unit tested without mocking React Native. Build box left unticked: `npm run build:web` fails with the known EACCES favicon-cache error (`frontend-mobile/.expo` linked to a root-owned folder), so `dist/` was not checked; the four files exist on disk and `fc-query` reads each as a valid font.
- **2026-11-11** — Lead: after the owner fixed the `.expo` cache owner, `npm run build:web --prefix frontend-mobile` passed (exit 0, "Exported: dist", new fonts present in `dist/assets/assets/fonts`). Build box ticked.
