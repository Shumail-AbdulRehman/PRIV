# Spec 31 — Workforce access and transfer UI

**Status:** Not started
**Depends on:** Spec 11, Spec 17, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Staff/WorkforceActions.tsx`, `frontend/src/pages/Staff/WorkforceActions.test.tsx`, `frontend/src/pages/Managers/ManagerAccessActions.tsx`, `specs/inventory/31-workforce-ui.md`
**Reuses:** `frontend/src/pages/Staff/StaffCreateDialog.tsx`, `frontend/src/components/common/DeleteButton.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/workforce.html`

## Goal

Workforce access and transfer UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Wire safe deactivation/archive, open-shift transfer conflict, manager-site handover and one-use staff handoff in existing lists/details. Require assigned site for manager hire. Preserve existing working delete retained-history fallback; no general restore. Add actual parent integration through explicit ownership handoff.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Staff/WorkforceActions.test.tsx` passes: Manager cannot select unassigned site/reset owner; conflict keeps draft; one-use credential never saved in browser; mutation errors shown. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
