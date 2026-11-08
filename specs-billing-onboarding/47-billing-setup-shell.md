# Spec 47 — Build scoped billing layout, tokens and translations

**Status:** Done
**Depends on:** Spec 44
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.test.tsx`, `frontend/src/pages/Subscription/onboarding/billing-setup.css`, `frontend/src/i18n/billingTranslations.ts`, `specs-billing-onboarding/inventory/47-billing-setup-shell.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/account.html`, `design/billing-onboarding/revision-2/v3/index.html`, `design/billing-onboarding/revision-2/v3/billing.html`, `frontend/src/components/common/BrandLogo.tsx`, `frontend/src/components/common/LanguageChoice.tsx`, `frontend/src/components/ui/button.tsx`, `DESIGN-SYSTEM.md#layout-conventions`, `DESIGN-SYSTEM.md#states-and-motion`

## Goal

Provide the approved reusable setup/settings shell so every screen shares the same brand, spacing, translation and accessible navigation.

## Scope

- Transcribe the closed design tokens into scoped .billing-onboarding CSS; preserve existing global workspace styles.
- Render desktop setup rail/current/completed steps and mobile progress; provide an existing-subscriber account-settings variant without unfinished setup progress.
- Reuse actual mark, language state and Button/Input conventions. Export slot-based main/footer/navigation composition without API calls.
- Remove all Help/Contact/support/FAQ UI and placeholder destinations. Render real Terms/Privacy links only if configured; unavailable policy links are omitted in sandbox.
- Add the necessary EN/UR billing copy to the existing billing translation fragment; do not replace unrelated translations or copy prototype review controls.
- Preserve local draft/focus when switching language; prices/status reading stay still, reduced motion and native focus remain intact.

## Explicit non-scope

- Signup form → spec 52.
- Plan/payment/confirmation/recovery screen content → spec 54.
- Route wiring → spec 59.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read approved v3 CSS and the exact design-system mapping; create the scoped stylesheet and layout variants.
2. Use slot props for screen content and explicit step identity; do not bind layout to pathname guesses or billing requests.
3. Add translation keys before dependent screens start. Feature copy can be adjusted by the lead through this sole owner rather than concurrent global dictionary edits.
4. Test semantic navigation/current-step labels, settings variant, language changes and absent help/contact entry points.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/47-billing-setup-shell.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingSetupLayout.test.tsx` passes: setup and settings variants expose correct current semantics; active billing has no setup steps; EN/UR controls use existing context; no Help/Contact/mailto/# support actions render. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingSetupLayout.tsx src/pages/Subscription/onboarding/BillingSetupLayout.test.tsx src/i18n/billingTranslations.ts` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-07** — Started the next sequential unit after guide/tracker, steering/inventory, decision44 and approved revision-2/v3 review. Applied impeccable context/craft guidance while preserving the approved design, existing brand assets, primitives, language provider and pure policy-link validator. Local source work is restricted to this unit's owned paths; no external issue/PR bookkeeping is performed by this request. No router/auth/provider/database change or release is part of47.

**2026-11-07** — Implemented presentation-only BillingSetupLayout, setup/settings variants, explicit progress semantics, content/navigation/footer slots, scoped approved tokens/primitive treatment and65 additive billing translations. Existing language preference/direction and brand/policy validators are reused; no Help/Contact/FAQ, provider-owned form or placeholder links added. Child form identity/draft/focus survives language updates. Inventory47 records exported props, CSS token mapping and downstream ownership.

Verification performed during this unit:
- `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingSetupLayout.test.tsx` — exit0,17 tests passed, including current/completed steps, settings semantics, policy omission/validation, slots, actual EN/UR controls and draft/focus preservation. Uses MemoryRouter, actual LanguageProvider and synthetic public policy URLs; no billing/auth/provider endpoint called.
- `npm test --prefix frontend` — first complete run exit0:64 Node tests and514 Vitest tests across37 files. Final repeat after the CSS hover correction is recorded below when complete.
- In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/BillingSetupLayout.tsx src/pages/Subscription/onboarding/BillingSetupLayout.test.tsx src/i18n/billingTranslations.ts` — exit0, no diagnostics/warnings.
- `npm run build --prefix frontend` — first production build exit0. Final repeat after the CSS correction is recorded below when complete. Non-failing plugin timing and incumbent frontend-mobile module-type warnings are unrelated to this unit.
- Isolated visual render using a temporary Vite virtual entry (no app route/file added), inspected at1440/390/320 Urdu/768 settings/1920 widths: scrollWidth equals viewport throughout, all language buttons48px high. Screenshots/metrics under /tmp/spec47-review and /tmp/spec47-layout-metrics.log. These are shell previews with illustrative child content, not integrated billing browser acceptance. Initial temporary preview attempts required launching from frontend/ for the existing compiler resolution and fixing the virtual-entry self-import; source/build configuration stayed unchanged.
- Impeccable detector on the owned component/stylesheet returned[] (exit0). Independent review found ghost/link hover contrast needed a wash background; corrected it, rerendered the viewports and checked both fine-pointer hover states (blue37/86/216 on wash238/243/255). Review scored the finding resolved and approved this shell unit subject to final checks. Documentation verification confirms API/token/translation inventory; the commands requested by that check are recorded here.

No backend/SQL, managed browser suite, provider payment, routing integration, actual deployed acceptance or Git publication performed. Route mounting/screens remain with their assigned specs;47 alone does not repair the live signup redirect. No external prerequisite prevented this unit's local checks. Missing issue reference reflects local execution without external bookkeeping, not a fabricated GitHub issue.

**2026-11-07** — Final full frontend rerun after hover correction: `npm test --prefix frontend` exit0,64 Node tests and514 Vitest tests across37 files, no failures/skips. Focused17 tests were also rerun successfully. Independent review scored the hover finding resolved (ship for this shell unit); no API/route/provider acceptance is implied.

**2026-11-07** — Final `npm run build --prefix frontend` after CSS correction exited0 (tsc -b + Vite production build). Documentation reviewer confirmed the missing evidence entry resolved. All required local checks are satisfied; marked47 Done. No temporary preview route/config was added to the application and all review-server processes were stopped.

**2026-11-07** — Post-completion spec validator exited0:20 specs,0 errors,4 non-blocking missing-issue warnings (44–47);47 adds a local-completion warning because no external issue was created. `git diff --check` passed.
