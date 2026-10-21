# Spec 27 — Approved v5 shared shell and route composition

**Status:** In progress
**Depends on:** Spec 06
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #35
**Owns:** `frontend/src/workspace-refresh.css`, `frontend/src/i18n/launchTranslations.ts`, `frontend/src/routes/launchPages.tsx`, `specs/inventory/27-workspace-shell.md`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/components/common/OperationStatus.tsx`, `frontend/src/components/common/ScopeFilters.tsx`
**Reuses:** `frontend/src/components/common/LanguageChoice.tsx`, `frontend/src/components/common/PageHeader.tsx`, `frontend/src/i18n/LanguageProvider.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/overview.html`

## Goal

Approved v5 shared shell and route composition in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Translate approved shell/spacing/fonts/navigation into existing reusable components. Register feature modules incrementally when they exist; gated routes render honest unavailable state until wired. Keep STAFF web app handoff, owner-only billing/settings, separate operator shell and recoverable fatal route errors. Preserve dirty Dashboard performance code.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/routes/launchPages.test.tsx` passes: EN/UR/RTL role-correct navigation, keyboard focus, mobile menu semantics and forbidden routes covered by component tests; inspect the real rendered390px layout separately. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-20** — Claimed issue35. Reuse approved v5 exact blue/white tokens and existing matching blue H logo, Inter/Arabic fonts, Radix dialog and auth/query providers. Translation entry ownership transferred08→27; attendance dictionary retained. No design/prototype changes; user dirty Dashboard/manager translations preserved.
- **2026-10-20** — Complete:22 new component regressions; full web57 node+40 component tests, build and full npm lint pass. Actual React fixture renders390/1366 EN/UR plus manager/staff pass no overflow/JS errors; two mobile dialog renders/focus/RTL inspected. Source v5 colour values confirmed computed blue/white. Screenshots in docs/implementation/previews/shell-*.png; fixture API interception is visual proof, not live provider/persistence E2E.
- **2026-10-20** — Reused exact blue H brand asset, approved Inter/Arabic fonts and existing primitives. Source detector had only its generic Inter popularity advisory; explicitly pinned v5 overrides it. Existing operational page copy/forms remain29/28/31; dirty Dashboard unchanged. Billing/settings owner-only, staff gets app handoff, operator never inherits tenant auth, route errors hide internals; future settings/operator controls unavailable honestly.
- **2026-10-20** — Removed the owner-wide forced plan-selection redirect so unpaid accounts can reach approved read-only operations; server mutation gates remain required. Future account policy composition26 must finish legacy starts/jobs/capacity handoff. No sample records or prototypes added to app.

- **2026-10-21** — Serialized setup integration ownership transferred to28 for existing route/nav/translation/form/readiness/API seams. Preserve previous behavior; subsequent feature edits must amend ownership again.

- **2026-10-21** — Serialized shared integration ownership handed to30 for actual account/settings/recovery routes, navigation and dictionary registration; existing behavior preserved.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-22 — Issue82 correction:** Shared V5 tokens, dimensions, actual company identity and grouped owner/manager navigation corrected. Mobile menu positioning/centered-dialog animation drift fixed; real rendered bounds checked, not inferred from accessibility tests. See docs/implementation/V5_IMPLEMENTATION.md for commands, counts, screenshots and intentional deviations. This log does not close the reopened full V5 acceptance criterion.
