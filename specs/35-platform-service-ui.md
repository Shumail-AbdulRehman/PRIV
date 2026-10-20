# Spec 35 — Platform service audit and leads UI

**Status:** Not started
**Depends on:** Spec 25, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Platform/ServicePage.tsx`, `frontend/src/pages/Platform/ServicePage.test.tsx`, `frontend/src/pages/Platform/serviceApi.ts`, `specs/inventory/35-platform-service-ui.md`
**Reuses:** `frontend/src/components/common/DataTable.tsx`, `frontend/src/components/common/OperationStatus.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/service.html`

## Goal

Platform service audit and leads UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Expose real redacted diagnostics/audit/inquiry status with bounded filters and accountable lead assignment. Use existing queue; configured verified support handoff. No synthetic service health, secret dumps or nonfunctional reconcile buttons.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Platform/ServicePage.test.tsx` passes: Unavailable diagnostic distinct from healthy; lead state persists; retry performs actual scoped request; no private workforce data. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
