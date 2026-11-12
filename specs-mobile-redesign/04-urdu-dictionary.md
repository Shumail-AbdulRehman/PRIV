# Spec 04 — Urdu copy for the redesign

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/src/i18n/translations.ts`, `frontend-mobile/src/i18n/staffAppTranslations.test.ts`, `specs-mobile-redesign/inventory/04-urdu-dictionary.md`
**Reuses:** `design/mobile-redesign/v3/i18n.js`, `frontend-mobile/src/launch/launchTranslations.ts`, `frontend/tests/operationsLanguage.test.mjs`

## Goal

Every new English string the design uses has a natural Urdu translation in one staff-app-only file, and the app looks it up without touching the dictionary the web shares.

## Scope

**New file** `src/i18n/staffAppTranslations.ts` exporting `staffAppUrdu: Record<string, string>`. Fill it with every entry of `window.UR` in `design/mobile-redesign/v3/i18n.js` whose English key is not already a key of `urdu` (in `translations.ts`) or `launchUrdu`. These are translation content, not code: transcribing them is expected. Also add these strings the implementation needs but the design does not show, with natural Urdu:
- "Uploaded, checking" (photo uploaded, check not finished)
- "Not needed" for waived photos (already in the design file; keep)
- "Connection settings", "Server address", "Change server address", "Save address", "Hide connection settings", "Show connection settings" (sign in keeps the server address tool)
- "Restart scanner", "Torch on", "Torch off", "Refresh results", "Results updated"
- "Today could not load" and "Check your internet and try again." (already in the design file; keep)

Keep `{placeholders}` identical between English and Urdu. Keep the brand name "Hygene Ops" untranslated.

**Lookup.** In `src/i18n/translations.ts`, change only `translate` and `translateText` so the lookup order is `launchUrdu`, then the shared `urdu`, then `staffAppUrdu`, then the English text. The shared dictionary wins on a key collision so web and phone words stay the same. **Do not add, remove or change any entry of the exported `urdu` object**: the web test `frontend/tests/operationsLanguage.test.mjs` asserts it deep-equals the web copy.

## Explicit non-scope

- Using the strings in screens → spec 28 onward (each screen spec).
- Strings found missing later → spec 49 sweeps them in from the Logs of earlier specs.
- The web dictionary → spec 00 (never changed by this plan).

## Reuse first

- Follow how `launchUrdu` is layered in front of `urdu` today.

## Steps

1. Diff the design's keys against `urdu` and `launchUrdu`; record how many were already present and how many are new.
2. Create the file, add the extra strings, update the two lookup functions.
3. Write the test. Run the web parity test.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/i18n/staffAppTranslations.test.ts` passes: no key of `staffAppUrdu` is also a key of `urdu` or `launchUrdu`; every value is non-empty and contains Arabic script; every `{placeholder}` in a key appears in its value; `translate('See my history','ur')` returns the Urdu; `translate('Check in','ur')` still returns the shared dictionary's value; an unknown key returns itself. [unit]
- [x] `cd frontend && node --experimental-strip-types --test tests/operationsLanguage.test.mjs` passes (the shared dictionary is unchanged). [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `git diff frontend-mobile/src/i18n/translations.ts` touches only `translate`, `translateText` and one import line. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Design `window.UR` had 296 keys: 76 already in `urdu`/`launchUrdu`, 232 new in `staffAppUrdu` (includes the 12 extra implementation strings; "Not needed" and the two Today error strings were already in the design or shared dictionary). `translate` and `translateText` now look up launchUrdu, urdu, staffAppUrdu, English; `urdu` object untouched (diff shows one import line plus two lookup lines). New test 4/4 pass; web parity test 1/1 pass; `npm test --prefix frontend-mobile` 153/153 pass on final run (an earlier run showed 5 failures while other sessions were editing the tree; rerun clean); typecheck 0 errors. `build:web` NOT run to success: fails with the known EACCES favicon-cache error (root-owned .expo), box left unticked.
- **2026-11-11** — Lead: after the owner fixed the `.expo` cache owner, `npm run build:web --prefix frontend-mobile` passed (exit 0, "Exported: dist", new fonts present in `dist/assets/assets/fonts`). Build box ticked.
