# Spec 28 — Real derived setup and operational dashboard

**Status:** Not started
**Depends on:** Spec 12, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Setup/SetupPage.tsx`, `frontend/src/pages/Setup/SetupPage.test.tsx`, `frontend/src/pages/Setup/api.ts`, `specs/inventory/28-setup-ui.md`
**Reuses:** `frontend/src/components/onboarding/WorkspaceGate.tsx`, `frontend/src/components/common/OperationalSummary.tsx`, `frontend/src/pages/Dashboard/DashboardPage.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/setup.html`

## Goal

Real derived setup and operational dashboard in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Implement approved setup surface driven by real scoped readiness; deep-link existing site/team/shift/template/schedule dialogs, derived completion and correct billing/verification gate. Polish existing overview/Today without replacing actual performance integration. Add honest unassigned/no-replacement links, daily calendar explanation and local dates. Amend Dashboard ownership before edits.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Setup/SetupPage.test.tsx` passes: Readiness persists after reload via real API state; no record means incomplete; denied/error/loading distinct; role-specific setup actions. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
