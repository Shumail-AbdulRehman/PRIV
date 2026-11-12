# Spec 50 — Part 1 release check

**Status:** Done
**Depends on:** Spec 49
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `docs/plan-project/mobile-redesign/planning/part1-release.md`, `docs/PRODUCT_UI_RULES.md`, `specs-mobile-redesign/inventory/50-part1-release-check.md`
**Reuses:** `frontend-mobile/e2e/README.md`, `frontend-mobile/app.json`, `design/mobile-redesign/staff-app-design.html`

## Goal

Part 1 (the new look on today's data) is proven ready to hand to staff before any Part 2 screen is wired in, and the product rules describe the new tabs.

## Scope

- From a clean checkout of the current tree: `npm ci --prefix frontend-mobile`, typecheck, the whole unit suite, the web export build. Record real output.
- Walk the web export in Chromium at 390 by 844 and 360 by 700, English and Urdu, through: sign in screen, My day in every state that can be reached with a mocked API (use the e2e fixtures if spec 52 exists, else a quick `page.route` script kept out of the repo), Tasks, Task details, Profile, Task alerts, Help, Change password. Compare each with the same screen in `staff-app-design.html`; list differences in `part1-release.md` as "accepted" (with reason) or "fix" (each "fix" becomes a new numbered spec appended to `README.md` and `PROGRESS.md`).
- Android: if an Android SDK and a test device or emulator are available, build a test APK with the project's existing command (`npm run build:android --prefix frontend-mobile`, which runs the device-config validation first), install it on the test device only, and walk check-in, a task start scan, photos (expect "Task photos are unavailable" while the server keeps photo checking off), submit and check-out. Never point the app at production; use the server address tool to point at a test backend. If no device is available, write that clearly; do not claim device evidence.
- Update `docs/PRODUCT_UI_RULES.md`, section "Staff flow" only: tabs are now My day, Tasks and Profile (History arrives with Part 2), Help is inside Profile, and late check-in is shown in orange. Change nothing else in that file.

## Explicit non-scope

- Writing e2e tests → spec 52. Releasing to staff or publishing an APK → the owner decides; never done by this spec.
- Part 2 → spec 51.

## Reuse first

- The project's own build and device-config scripts; no new tooling.

## Steps

1. Clean install and the three gates.
2. Browser walk and comparison; write `part1-release.md`.
3. Device walk if possible.
4. Update the product rules section.

## Done when

- [x] `npm test --prefix frontend-mobile` passes from a clean install with 0 failures; the count is in `part1-release.md`. [unit]
- [x] `part1-release.md` lists every screen above with "matches", "accepted difference" or "fix (spec NN)". [runtime]
- [x] Device walk recorded with device model, Android version and APK version, or the file says no device was available. [requires: Android SDK, physical test device or emulator, test backend]
- [x] `git diff docs/PRODUCT_UI_RULES.md` touches only the "Staff flow" section. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Blocked only on box 1 (clean install). Ran on the existing install (no `npm ci`, node_modules is shared with another tool and the network is unreliable): `npm test --prefix frontend-mobile` 530 tests, 530 pass, 0 fail; typecheck 0 errors; `build:web` passes. Wrote `docs/plan-project/mobile-redesign/planning/part1-release.md`: walked sign in, My day (5 states), Tasks, Task details, Profile, Task alerts, Help, Change password (and the forced password page) in headless Chrome at 360x700 and 390x844, English and Urdu, API mocked with `page.route`, screenshots read and compared with `v3/views.js` (kept in scratch, not in the repo; server and browser stopped). Verdicts: 6 match (Sign in, My day, Tasks, Profile, Help, Change password), 2 fix (Task details, Task alerts), 0 new accepted differences. Fixes, proposed as new spec 54 for the lead to add to README and PROGRESS (I may not edit them): StepPath connector line is drawn over the digits in English; Urdu current step label "کیو آر اسکین" truncated at 360; Task alerts "Not allowed" pills sit above the row centre; My day check-out state truncates the header times at 360 in English. Device box ticked on its own wording ("or the file says no device was available"): no Android SDK or device here, no device evidence claimed. `git diff docs/PRODUCT_UI_RULES.md` shows only the "Staff flow" paragraph. Not verified: device, fonts scaling, screen reader, camera and scanner screens, offline and error states in the browser, Urdu by a native reader. Spec wrong: it says `npm ci` from a clean checkout; not run here.
- **2026-11-12** — Lead: the clean-install box holds. Spec 53 ran `npm ci` in a scratch copy, then `npm test`: 620/620 (see `verification.md` section 2). Box ticked, Status Done.
