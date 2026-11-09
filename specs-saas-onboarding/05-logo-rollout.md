# Spec 05 — New Hygene Ops logo

**Status:** Done
**Depends on:** Spec 00
**Model:** Light — `claude-haiku-5-5` · `gpt-6.1-sol` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend/public/brand/hygene-ops-mark.svg`, `frontend/public/favicon.svg`, `frontend/src/components/common/brand.css`, `frontend/tests/brand-assets.test.mjs`, `frontend-mobile/assets/hygene-ops-icon.png`, `frontend-mobile/assets/hygene-ops-adaptive.png`, `frontend-mobile/assets/hygene-ops-favicon.png`, `frontend-mobile/assets/hygene-ops-mark.png`, `DESIGN.md`, `specs-saas-onboarding/inventory/05-logo-rollout.md`
**Reuses:** `design/saas-onboarding/assets/hygene-ops-mark.svg`, `frontend/src/components/common/BrandLogo.tsx`

## Goal

Replace the old logo with the approved checkbox mark across the web app and the staff app icon files.

## Scope

- Copy the approved SVG to the public brand path and use it for the favicon.
- Adjust `brand.css` only as needed for the mark, whose tick extends past its box.
- Regenerate the four mobile PNGs at their current pixel sizes from the approved SVG. The adaptive icon keeps Android safe-zone padding.
- Leave `hygene-ops-notification.*` alone, because Android notification icons must be single-colour.
- Add a note to `DESIGN.md` Overview describing the mark and the onboarding table and panel colours as a sanctioned exception.

## Explicit non-scope

- Building a new Android APK → spec 41.
- Changing `BrandLogo` markup → spec 03.

## Reuse first

- `BrandLogo` already feeds the sidebar, public pages and auth pages. Replacing the file updates all of them.

## Steps

1. Read the current PNG sizes before overwriting.
2. Replace the web assets.
3. Generate the PNGs with an already-installed tool such as Sharp from the backend, without adding a dependency.
4. Update `DESIGN.md`.
5. Add a test asserting the old mark colour is gone and the files exist at the expected sizes.
6. Record what you created in `specs-saas-onboarding/inventory/05-logo-rollout.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && node --experimental-strip-types --test tests/brand-assets.test.mjs` passes and proves: the public mark is the approved file and the mobile PNGs keep their original dimensions. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/05-logo-rollout.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Replaced the public brand SVG and favicon with byte-for-byte copies of the approved checkbox mark. Regenerated the four mobile PNGs with the backend's installed Sharp, without adding a dependency: icon/adaptive **1024×1024**, mark **192×192**, favicon **48×48**, matching their dimensions read before replacement. The adaptive icon uses a centred 480px SVG viewport with transparent padding; every visible pixel, including the extended tick tip, fits the central Android 66dp circular safe zone on the 108dp layer. The notification PNG checksum is unchanged. Existing `BrandLogo` markup and `brand.css` already display the complete viewBox without clipping, so neither needed an edit. Added the sanctioned brand/onboarding exception to `DESIGN.md` Overview and wrote `inventory/05-logo-rollout.md`.
- **2026-11-09 — Verification:** Focused asset command: **7 passed, 0 failed/skipped**. The tests check exact SVG copies, absence of the old mark colour, original PNG dimensions, visible box/tick/tip pixels, transparency and adaptive safe-zone padding. Frontend types and lint passed with **0 errors and 0 warnings**. Frontend build passed; the emitted brand SVG and favicon also match the approved source. The build emitted the existing `[PLUGIN_TIMINGS]` advisory. Both regenerated launcher images were visually inspected. Inventory and scope checks passed. No tests outside `Owns` were changed.
- **2026-11-09 — Whole-suite check:** Initial `npm test --prefix frontend` run: **88 Node tests passed**, then **859 Vitest tests passed and 1 failed**, with 0 skips. The existing `WorkspaceGate.test.tsx` suspended-owner recovery test exceeded its heading wait while still displaying the loading state. The unchanged whole-suite rerun with `taskset -c 0,1 npm test --prefix frontend` reduced worker contention and passed: **88 Node tests and 860 Vitest tests across 49 files, 0 failures/skips**, including all 7 asset tests in the Node total. No code or test changes were made between runs. The existing Node mobile-translation module-type warning also appeared.
- **2026-11-09 — Limits and safety:** Commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. No real database or Paddle calls, migrations, deployments, APK builds or physical-device checks ran. GitHub issues/PRs, commits and branch operations were skipped per the run instructions. The tracker and Status line remain unchanged.
