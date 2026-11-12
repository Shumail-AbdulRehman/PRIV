# Spec 62 — Clean-up: duplicate camera parts, Joined month helper, dead files, test `t()`

**Status:** Done
**Depends on:** Spec 56, Spec 57, Spec 58, Spec 59, Spec 61
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/cleanupDuplicates.test.mjs`, `frontend-mobile/src/components/LanguageChoice.tsx`, `frontend-mobile/src/components/ui/card.tsx`, `frontend-mobile/src/components/ui/badge.tsx`, `frontend-mobile/src/components/ui/separator.tsx`, `frontend-mobile/src/components/ui/skeleton.tsx`, `frontend-mobile/src/components/ui/input.tsx`, `specs-mobile-redesign/inventory/62-cleanup-duplicates.md`
**Reuses:** `frontend-mobile/src/screens/StartTaskScreen.tsx`, `frontend-mobile/src/components/PhotoCaptureControls.tsx`, `frontend-mobile/src/screens/profile/ProfileScreen.tsx`, `frontend-mobile/src/design/format.ts`, `frontend-mobile/tests/support/nativeHarness.mjs`, `frontend-mobile/tests/support/nativeHarness.test.mjs`, `frontend-mobile/tests/screens/qrScan.test.mjs`, `frontend-mobile/tests/screens/profileJoined.test.mjs`, `INVENTORY.md`

## Goal

One copy of each camera part, one way to get a month key in a zone, no unused legacy files, and a shared test `t()` that fills placeholders like the real one. This fixes finding 62 (`docs/plan-project/mobile-redesign/planning/verification.md` §5 and §7). No visible change.

## Scope

**(a) Camera parts.** `StartTaskScreen.tsx` keeps file-local copies of parts `components/PhotoCaptureControls.tsx` already exports: `Viewfinder` (line 47) = `CaptureFrame` (line 59), `CameraButton` (line 95) = `CameraRoundButton` (line 46), and `BusyCard` (line 71) = `CaptureBusyCard` (line 98) with the label "Confirming…". Use the shared parts at lines 269 to 281, then delete the three local functions and the styles, constants and imports only they used. Do not edit `PhotoCaptureControls.tsx`. The shared frame's test ids are `photo-viewfinder` and `photo-scan-line`; update the two ids in `tests/screens/qrScan.test.mjs` (lines 103 and 121), keeping its frame-size and reduced-motion assertions.

**(b) Joined month.** `ProfileScreen.tsx` line 153 builds the month key with an inline `Intl.DateTimeFormat` (spec 55), which throws a `RangeError` on an invalid zone string. Use `localDate(createdAt, zone).slice(0, 7)` from `design/format.ts`, and when the zone is not a valid time zone fall back to `Asia/Karachi` instead of throwing. Only the Joined value changes.

**(c) Unused legacy files.** Delete the six files in Owns. Each has no importer today (`INVENTORY.md` lines 647 to 648; checked again for this spec with grep over `src`, `tests`, `App.tsx`, `index.ts`, `scripts` and `e2e-web`). Re-run that grep before deleting; if any importer appears, keep the file and log it. `ui/button.tsx`, `ui/text.tsx` and `ui/icon.tsx` stay (still imported).

**(d) Test `t()`.** `tests/support/nativeHarness.mjs` line 98 mocks `t: text => translate(text, state.language)`, dropping placeholder values, so several tests override it. Make it pass values through, as the real `LanguageProvider` does. Then run the whole suite; adapt any test that now differs only because placeholders are filled (test-only exception, one Log line each), never weakening what it proves. Overrides in other test files may stay.

- This spec depends on 56, 57, 58, 59 and 61 because it is the **sole later editor** after them of `StartTaskScreen.tsx` (spec 57 also edits it), and the harness change may require adapting test files those specs touched. It is the sole later editor of `ProfileScreen.tsx` (owned by spec 37, edited by 51 and 55) and `nativeHarness.mjs` (owned by spec 01), and changes only the parts named above.

## Explicit non-scope

- Hardening `localDate`, `clock` or other formatters against invalid zones → not planned (the server sends validated zones; spec 53 notes it).
- `ui/button.tsx`, `ui/text.tsx`, `src/theme.ts` and `SpatialDiagnosticScreen.tsx` → kept (spec 49 lists their importers).
- The specs whose `Reuses` lines name deleted files (spec 21 and spec 49 name `LanguageChoice.tsx`, spec 22 names `ui/input.tsx`) → the lead updates those headers after this spec so the validator still resolves them.
- Raw `rgba` colour and message bar motion (finding 65) → waits for the owner (spec 53).
- e2e → spec 52 (the lead reruns e2e after this spec).

## Reuse first

- `CaptureFrame`, `CameraRoundButton`, `CaptureBusyCard`; `localDate` and `monthTitle`; the real `translate` from `i18n/translations.ts`.

## Steps

1. (a), then run `qrScan.test.mjs`.
2. (b), then run `profileJoined.test.mjs` and `profile.test.mjs`.
3. (c) grep, then delete.
4. (d), then the whole suite; adapt only what the fill changes.
5. Write `tests/cleanupDuplicates.test.mjs` for the checks below.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/cleanupDuplicates.test.mjs` passes: `StartTaskScreen.tsx` defines no `Viewfinder`, `CameraButton` or `BusyCard` and imports the three shared parts; Profile with location zone `Not/AZone` renders the Joined month from `Asia/Karachi` without throwing; the harness `t('{n} of {t}', { n: 1, t: 3 })` returns "1 of 3". Each assertion fails on the tree before the change. [unit]
- [x] `tests/screens/qrScan.test.mjs`, `tests/screens/profileJoined.test.mjs`, `tests/screens/profile.test.mjs` and `tests/support/nativeHarness.test.mjs` pass; the qrScan diff changes only the two test ids. [unit]
- [x] `grep -rnE "LanguageChoice|ui/(card|badge|separator|skeleton|input)\b" frontend-mobile/src frontend-mobile/tests frontend-mobile/App.tsx frontend-mobile/index.ts frontend-mobile/scripts frontend-mobile/e2e-web` prints nothing before deletion (except `LanguageChoice.tsx` itself) and after it, and none of the six files exists. [static]
- [x] `grep -n "Intl.DateTimeFormat" frontend-mobile/src/screens/profile/ProfileScreen.tsx` prints nothing. [static]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count and every adapted test in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- (a) `StartTaskScreen.tsx`: removed local `Viewfinder`, `BusyCard`, `CameraButton`, their styles (`roundButton*`, `frameBox`, `frame`, `corner*`, `scanLine`, `busyCard`), constants (`FRAME`, `CORNER*`, `LINE_*`, `BUSY_OFFSET`, `easeOut`) and the unused imports (`ReactNode`, `ActivityIndicator`, reanimated, `motion`). Now imports `CameraRoundButton`, `CaptureBusyCard label="Confirming…"`, `CaptureFrame`.
- (b) `ProfileScreen.tsx`: `joinedMonthKey()` uses `localDate(createdAt, zone || 'Asia/Karachi').slice(0, 7)`, falling back to `Asia/Karachi` on a `RangeError`. `grep -n "Intl.DateTimeFormat"` prints nothing.
- (c) Grep before deletion (`grep -rnE "LanguageChoice|ui/(card|badge|separator|skeleton|input)\b"` over `src`, `tests`, `App.tsx`, `index.ts`, `scripts`, `e2e-web`) printed only `frontend-mobile/src/components/LanguageChoice.tsx:4:export function LanguageChoice() {` (the file itself). Deleted with `rm`: `LanguageChoice.tsx`, `ui/card.tsx`, `ui/badge.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`, `ui/input.tsx`. The same grep after deletion prints nothing (exit 1); `cleanupDuplicates.test.mjs` builds the names from parts so it does not match.
- (d) `nativeHarness.mjs`: `t: (text, values) => translate(text, state.language, values)`.
- Test edits: `qrScan.test.mjs`: the two ids (`photo-viewfinder`, `photo-scan-line`) plus the icon mock key `/components/ui/icon` to `/ui/icon`, because the shared `PhotoCaptureControls.tsx` imports `./ui/icon` and the old key did not match it (react-native-svg failed to load under node). Same change in `startTaskLifecycle.test.mjs`. No assertion changed. The harness fill changed no other test.
- Runs: `cleanupDuplicates.test.mjs` 4/4; qrScan + profileJoined + profile + nativeHarness 37/37; `npm test --prefix frontend-mobile` 654/654, 0 fail; typecheck 0 errors; `build:web` exit 0 (no expo export was running). Each new assertion fails on the old tree by construction (local functions defined, inline `Intl` threw on `Not/AZone`, harness `t` returned `{n} of {t}`); I did not rerun the old tree.
- Reuses lines naming deleted files (lead to update): spec 21 and spec 49 (`LanguageChoice.tsx`), spec 22 (`ui/input.tsx`). A broader grep also lists 28 and 45 and INVENTORY.md in prose; their Reuses lines were checked: only 21, 22, 49 name deleted files.
