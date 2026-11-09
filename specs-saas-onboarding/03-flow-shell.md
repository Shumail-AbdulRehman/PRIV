# Spec 03 — Flow shell, tokens and motion

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Onboarding/flow.css`, `frontend/src/pages/Onboarding/FlowShell.tsx`, `frontend/src/pages/Onboarding/FlowShell.test.tsx`, `specs-saas-onboarding/inventory/03-flow-shell.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `DESIGN-SYSTEM.md#colour-tokens`, `DESIGN-SYSTEM.md#states-and-motion`, `frontend/src/components/common/BrandLogo.tsx`, `frontend/src/components/common/LanguageChoice.tsx`

## Goal

Build the shared page frame every screen in this flow sits in: aurora table, header, paper sheet, stacked edges and the four-step progress row.

## Scope

- `flow.css` holds every token in `DESIGN-SYSTEM.md` on `.flow-shell`, plus the reusable classes for buttons, fields, notices, chips, skeletons and all motion in the motion table. It is the only file in the flow with raw colours.
- `FlowShell` props: `size` (narrow, split, plan, wide), `step` (none, account, plan, payment, workspace, done) and optional `testMode`. It renders skip link, logo, language switch, optional Test mode tag, sheet and steps.
- Sheet edges show one per finished step, and animate when the step advances.
- The table and tick supergraphic are fixed behind content and mirror in Urdu.
- Focus moves to the sheet heading when `step` changes. The tick draw and sheet entrance respect reduced motion.

## Explicit non-scope

- Individual screens → spec 29.
- Replacing the logo file → spec 05.
- Urdu strings → spec 04.

## Reuse first

- Use `BrandLogo` and `LanguageChoice`. Restyle them with scoped rules inside `.flow-shell`.
- Do not change global tokens, `index.css` or the workspace stylesheets.
- Rebuild from the prototype. Never paste its CSS or scripts, and never build its preview bar.

## Steps

1. Transcribe the tokens from `DESIGN-SYSTEM.md`.
2. Build the shell and step row with semantic list markup and `aria-current`.
3. Add the sheet entrance, tick draw and edge transitions with CSS only.
4. Check 320, 390, 768 and 1440px widths and right-to-left in the component test where layout classes apply, and by eye in a local build.
5. Write tests for step states, sheet size, Test mode and focus.
6. Record what you created in `specs-saas-onboarding/inventory/03-flow-shell.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run frontend/src/pages/Onboarding/FlowShell.test.tsx` passes and proves: each step marks earlier items done and one item current; edges match finished steps; Test mode shows only when asked; focus moves on step change. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/03-flow-shell.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
