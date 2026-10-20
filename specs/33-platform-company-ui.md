# Spec 33 — Platform company workspace

**Status:** Not started
**Depends on:** Spec 24, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Platform/CompaniesPage.tsx`, `frontend/src/pages/Platform/CompaniesPage.test.tsx`, `frontend/src/pages/Platform/companyApi.ts`, `specs/inventory/33-platform-company-ui.md`
**Reuses:** `frontend/src/components/common/DataTable.tsx`, `frontend/src/components/ui/dialog.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/platform.html`

## Goal

Platform company workspace in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Build bounded company list/detail Account/Billing/Activity with operator-only real metadata. Reasoned suspension/reactivation requires confirmation, persists audit and handles conflict. No tenant roster/photo drilldown. Route through separate operator shell/auth state.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Platform/CompaniesPage.test.tsx` passes: Operator company search/paging/status save reflect API; tenant identity denied; protected workforce fields absent. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
