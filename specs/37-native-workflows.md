# Spec 37 — Native attendance/photo/account recovery

**Status:** Not started
**Depends on:** Spec 09, Spec 17, Spec 20, Spec 21
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/src/launch/LaunchRecovery.test.ts`, `frontend-mobile/src/launch/launchApi.ts`, `specs/inventory/37-native-workflows.md`
**Reuses:** `frontend-mobile/src/components/AttendanceCamera.tsx`, `frontend-mobile/src/types.ts`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/mobile.html`

## Goal

Native attendance/photo/account recovery in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Integrate approved v5 native states into existing actual screens: role-correct staff login/handoff, credential replacement, attendance lost-response reconciliation, QR/photo same-capture result/retry, immutable submission receipt and push/location/camera help. No offline evidence queue; show required permissions and actionable contact. Amend screen ownership before integration; include all changed paths/tests.

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

- [ ] `npm test --prefix frontend-mobile` passes: Offline/lost response never duplicates completed capture; receipt persists; permission retry and expired authority distinct; EN/UR/large text supported. [unit]
- [ ] `npm test --prefix frontend-mobile` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run typecheck --prefix frontend-mobile` passes. [static]
- [ ] `npm run build:web --prefix frontend-mobile` passes; native release separately gated. [static]
