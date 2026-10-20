# Spec 27 — Approved v5 shared shell and route composition

**Status:** Not started
**Depends on:** Spec 06
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/main.tsx`, `frontend/src/routes/workspacePages.tsx`, `frontend/src/components/layout/DashboardLayout.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/workspace-refresh.css`, `frontend/src/i18n/launchTranslations.ts`, `frontend/src/routes/launchPages.tsx`, `frontend/src/routes/launchPages.test.tsx`, `specs/inventory/27-workspace-shell.md`
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

- [ ] `npm run test:components --prefix frontend -- src/routes/launchPages.test.tsx` passes: EN/UR/RTL role-correct navigation, keyboard focus, 390px layout and forbidden routes covered by component tests. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
