# Spec 03 — Flow shell, tokens and motion

**Status:** Done
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

- [x] `cd frontend && npx vitest run src/pages/Onboarding/FlowShell.test.tsx` passes and proves: each step marks earlier items done and one item current; edges match finished steps; Test mode shows only when asked; focus moves on step change. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/03-flow-shell.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Implemented the additive `FlowShell`, closed scoped palette and reusable control/state motion classes. Reused the existing logo, language context/control and form primitives. Added semantic progress, fixed aurora/tick background, split-panel slot, prior-sheet edges, step-change heading focus and reduced-motion handling. No existing page, route, logo asset, translation dictionary, global token or workspace stylesheet was changed. Ready completes four ticks and retains the prototype's three prior-sheet edges; the workspace itself is the fourth sheet.
- **2026-11-09** — Corrected the focused acceptance command's duplicated `frontend/` prefix after running the original: it exited 1 with "No test files found". The corrected command ran **28 tests, all passed**, both with `--maxWorkers=2` initially and without extra arguments on the final run. The final `npm test --prefix frontend` ran **81 Node tests + 860 Vitest tests across 49 files, all passed, 0 failures/skips**; the 28 shell cases are included in the 860. No tests outside this spec's ownership needed edits.
- **2026-11-09** — Browser verification used a temporary isolated Vite build of component fixtures under `/tmp/hygene-spec03-review/`, without application routing, API requests, Paddle or database access. **25 layout/reduced-motion measurement cases passed**: 320/390/768/1440px in both directions, all four sheet sizes, hidden mobile panel/visible progress, fixed backgrounds, 48px fields/actions, and a 312px content target for the wide sheet at 320px. Keyboard tab order, 3px focus outline, step-change focus and retained input identity/draft also passed; 0 browser errors. Inspected 10 captures, including reduced motion and a 720px reflow equivalent to a 1440px viewport at 200% zoom. Two captures were recaptured after settling their 120ms notice fades. The first temporary harness invocation failed to resolve the React compiler from the repository root; running it from `frontend/` fixed resolution. An initial width assertion ran during the sheet's scale entrance; waiting for it to finish established the actual 312px width.
- **2026-11-09** — The reuse fragment exists. Static palette inspection found all **27** documented tokens and no added tokens. Impeccable's changed-target detector returned **0 findings**. Final type checking and lint passed with **0 errors, 0 warnings**; the final production build passed. Existing Node tests emit the mobile translation module-type warning; the build emits the existing plugin-timing advisory. The independent finish review returned **ship**, with all 10 captures valid and no material fixes. No secrets were printed or committed. No issue/PR per the run override; local branch commit only, no push/deploy/migrations.
- **2026-11-09** — Not verified: real Paddle, real databases, integrated future screens, physical devices and native browser zoom. These are outside this spec; no end-to-end suite or production route was added. Urdu string additions remain with spec 04, and the current logo asset remains until spec 05.
- **2026-11-09** — Final plan validation: **44 specs, 0 errors, 52 nonblocking warnings**. The additional warning is the missing GitHub issue for this completed spec, required by the user's no-issue override; the other planning advisories predate this work. An earlier validation while In progress correctly reported the Log had not yet been added. `docs/CURRENT_CONTEXT.md` was updated under the repository's explicit context-maintenance instruction; the spec/tracker were changed only after all five acceptance items passed. Existing unrelated design/planning work remains outside the commit.
- **2026-11-09** — Read-only documentation comparison confirmed the reuse fragment matches the shipped API, classes and approved design. Existing global design-document drift was left untouched; this flow's scoped design system remains its authority.
