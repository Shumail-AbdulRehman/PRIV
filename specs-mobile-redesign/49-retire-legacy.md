# Spec 49 — Retire unused old parts and sweep strings

**Status:** Done
**Depends on:** Spec 28, Spec 32, Spec 34, Spec 45, Spec 46, Spec 48
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/components/TaskCard.tsx`, `frontend-mobile/src/components/StaffBrand.tsx`, `frontend-mobile/src/components/ScreenHeader.tsx`, `frontend-mobile/src/components/StatCard.tsx`, `frontend-mobile/src/components/FactRow.tsx`, `frontend-mobile/src/components/StatusBadge.tsx`, `frontend-mobile/src/components/EmptyState.tsx`, `frontend-mobile/src/components/LoadingState.tsx`, `specs-mobile-redesign/inventory/49-retire-legacy.md`
**Reuses:** `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/src/theme.ts`

## Goal

Old parts the redesign replaced are removed when nothing uses them, and English strings logged as untranslated by earlier specs get Urdu.

## Scope

- For each file in Owns: if `grep -rn` finds no import outside the file and its own test, delete it (and its test if it only tests that file). If something still imports it, keep it and list the importer in the fragment.
- Report only, never delete (not in Owns): `components/LanguageChoice.tsx`, `components/ui/card.tsx`, `ui/badge.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`, `ui/button.tsx`, `ui/input.tsx`, `ui/text.tsx`, `src/theme.ts` and `src/utils/taskStatus.ts` (still imported by `src/verification/taskStatus.test.ts`, which proves an overdue task never reads as in progress). List each with its importers in the fragment; spec 53 decides follow-ups. (`LoadingState` is used by the session restore today; spec 48 replaced it; confirm.)
- Read the Log of every Done spec from 01 to 48 for "untranslated" or "English string" notes and add those keys to `staffAppTranslations.ts` (this spec may edit that file for this purpose only), keeping the rules of spec 04 (no key that already exists in the shared `urdu`).
- Run a raw-hex search over files created by this plan (`src/design`, `src/screens/day`, `src/screens/task`, `src/screens/profile`, `src/screens/history`); anything outside `tokens.ts` is listed as a finding for spec 53.

## Explicit non-scope

- Visual changes → none. Navigation → spec 48. The web app → never.

## Reuse first

- Prove a file is unused with `grep` and the build, not by reading one screen.

## Steps

1. Inventory importers; delete what is unused, in small batches, running the suite after each.
2. Sweep strings; run spec 04's tests and the web parity test.
3. Record kept files and reasons.

## Done when

- [x] Each deleted file had no importer (grep output in the Log), and each kept file lists its importers in the fragment. [static]
- [x] `cd frontend-mobile && npx tsx --test src/i18n/staffAppTranslations.test.ts` passes, and `cd frontend && node --experimental-strip-types --test tests/operationsLanguage.test.mjs` passes. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] The raw-hex search output is in the Log. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Deleted 8 files (TaskCard, StaffBrand, ScreenHeader, StatCard, FactRow, StatusBadge, components/EmptyState, LoadingState); `grep -rnw <name> src tests App.tsx` found no importer for any (the `EmptyState` hits are the separate `design/Feedback.tsx` export). No test deleted. Kept-file importers are in the fragment (LanguageChoice and ui/card, badge, separator, skeleton, input have none; button, text, theme, taskStatus have importers). Added 21 Urdu keys to `staffAppTranslations.ts`; the other collected strings (Email, Password, Location, Camera, Use manager access code, Retry phone alerts, registration messages, Permissions answer, Task {id}, Task photos are unavailable, the long "Photo upload is unavailable…" status) already existed in `urdu` or `launchUrdu`. Spec 34's "Wi-Fi hint" is "Use the server computer’s Wi-Fi address. Include :8080/api."; "Hide password" and "Something could not load"/body included. Raw hex search: only `src/design/tokens.test.ts` fixtures, no findings. Results: staffAppTranslations 4/4, web parity 1/1, mobile suite 530/530, typecheck 0 errors, build:web passed. Not verified: Urdu wording by a native reader. Spec 05 `Show password` already existed.
- **2026-11-12** — Lead: removed `frontend-mobile/src/components/LanguageChoice.tsx` from Reuses because spec 62 deleted the file (it had no importer).
