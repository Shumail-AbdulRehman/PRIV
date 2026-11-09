# Spec 05 — New Hygene Ops logo

**Status:** Not started
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

- [ ] `cd frontend && node --experimental-strip-types --test tests/brand-assets.test.mjs` passes and proves: the public mark is the approved file and the mobile PNGs keep their original dimensions. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/05-logo-rollout.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
