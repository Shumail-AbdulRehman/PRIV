# Spec 53 — Verification pass

**Status:** Done
**Depends on:** 00-52
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `specs-mobile-redesign/INVENTORY.md`, `docs/plan-project/mobile-redesign/planning/verification.md`
**Reuses:** `ARCHITECTURE.md`, `DESIGN-SYSTEM.md`, `design/mobile-redesign/staff-app-design.html`

## Goal

The final gate. Prove from a clean state that what this plan promised is true, and record every place it is not. This spec observes and reports; it does not fix.

## Scope

- Clean install of `frontend-mobile` and `backend` from their lockfiles; mobile typecheck and web build; backend typecheck and build. Real output in `verification.md`.
- Whole mobile unit suite, whole backend unit suite, then the mobile e2e suite, each in one go, with real counts (for example `412/412`). A test that passed for its spec and fails now is a finding.
- The web parity test for the shared Urdu dictionary (`frontend/tests/operationsLanguage.test.mjs`).
- Walk every earlier spec's `Done when` against the real code and record every box that does not hold.
- Check every invariant in `ARCHITECTURE.md` with evidence (for example: grep for image fields in the three new services; grep for the `yellow` token in calendar code; grep for `Help` in the tab list; confirm `urdu` unchanged; confirm no new runtime dependency by diffing both `package.json` files against the commit before spec 01).
- Raw hex sweep over new code; duplicate-part sweep (two buttons, two text components, two month formatters, two attendance rules).
- Fold every `inventory/NN-*.md` into `INVENTORY.md` under its section, then delete the fragments.
- Compare each main screen with `staff-app-design.html` at 390 by 844 and 360 by 700, English and Urdu (screenshots from the e2e run are enough); list differences.
- Record what was never verified: physical Android device behaviour, Android font scaling at 1.3, screen reader, runs of the three new endpoints against a real test database, and that photo checking is still switched off on the server (`docs/CURRENT_CONTEXT.md`), so the photo steps cannot be completed by real staff until that decision is made.

## Explicit non-scope

- Fixing anything: each finding becomes a new numbered spec appended to `README.md` and `PROGRESS.md`.
- New features.

## Steps

1. Clean install and the four gates.
2. All suites.
3. Done-when walk and invariant checks.
4. Sweeps and inventory fold.
5. Write `verification.md` with every finding and the new spec numbers.

## Done when

- [x] Mobile unit suite, backend unit suite and mobile e2e suite all pass from a clean install, with real counts in `verification.md`. [suite]
- [x] Every earlier spec's `Done when` has a line in `verification.md`: holds, or finding with a new spec number. [static]
- [x] Every invariant in `ARCHITECTURE.md` has evidence in `verification.md`. [static]
- [x] `INVENTORY.md` contains every fragment's entries and `inventory/` holds no fragments. [static]
- [x] `npm run typecheck --prefix frontend-mobile` and `cd backend && npx tsc --noEmit -p tsconfig.json` pass with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` and `npm run build --prefix backend` pass. [static]

## Log

- **2026-11-12** — Verification pass done; report in `docs/plan-project/mobile-redesign/planning/verification.md`. Clean install in a scratch copy outside the repo (no `node_modules`, `dist`, `.expo` or `.env*` copied; nothing reinstalled in the shared tree; no database reached): mobile `npm ci` 790 packages, backend `npm ci` 514. Mobile typecheck 0 errors; `build:web` exported (four new fonts in `dist`). Backend `tsc` 0 errors after `prisma generate` (551 errors straight after `npm ci`, all from the missing generated client: a pre-existing property, recorded); backend build exit 0. Suites: mobile unit 620/620; backend 2631 passed, 7 skipped, 0 failed (plan's own backend tests 66/66); mobile e2e 112/112 (both projects, workers 2); web Urdu parity 1/1 (real tree, read-only). Spec 50's clean-install box holds (620/620 from `npm ci`).
  - Runs that needed a rerun, all recorded in the report: backend `releaseReadiness.test.ts` reads `../.github/workflows/ci.yml` (copied beside the scratch copy, then a full rerun); `tsx` IPC pipe path too long under the scratch temp dir (rerun with the default temp dir); first e2e run 29 of 32 failed because the e2e build reused the Metro cache of the plain build (stale `EXPO_PUBLIC_API_BASE_URL`), and a plain build after e2e bakes in the test host: finding 60.
  - Done-when walk: 0 boxes fail; spec 18's optional database box not run. Invariants: 12 hold, invariant 7 fails (Urdu times reversed on three screens, a calendar day name truncated at 390, a photo row broken mid-word at 360).
  - Findings proposed as specs 56 to 65 (the lead adds them): 56 receipt "Back to my day" returns to Task details; 57 Urdu times not isolated; 58 Urdu "جمعرات" truncated at 390; 59 photo row word-break in Urdu at 360; 60 e2e Metro cache shared with normal builds; 61 Tasks badge missing until Tasks is opened; 62 duplicate and dead parts clean-up; 63 `PRODUCT_UI_RULES.md` Staff flow out of date; 64 "Take a new photo" no-op with an unsent photo (owner decision); 65 message bar motion, bottom offset and translucent-white token.
  - Screens: scratch-only Playwright spec on the clean copy (fixtures, 390x844 and 360x700, English and Urdu) and design shots from `staff-app-design.html?shot=…`; images in the scratch `clean53/screens/` folder, not in the repo. Inventory: 54 fragments folded into `INVENTORY.md` (every fragment line checked present), fragments deleted, a few stale lines in the original sections updated.
  - Not verified: Android device, font scaling 1.3, screen reader, the three endpoints on a real test database, photo steps while server photo checking stays off, native Urdu review.
