# Spec 29 — Attendance exception context UI

**Status:** Not started
**Depends on:** Spec 23, Spec 27, Spec 08
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Attendance/AttendanceContext.tsx`, `frontend/src/pages/Attendance/AttendanceContext.test.tsx`, `frontend/src/pages/Attendance/contextApi.ts`, `specs/inventory/29-attendance-context-ui.md`
**Reuses:** `frontend/src/components/ui/dialog.tsx`, `frontend/src/lib/attendance.ts`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/attendance.html`

## Goal

Attendance exception context UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Show original captured facts plus immutable attributed annotations and acknowledgement. Wire real note submit and conflict/retry states into attendance/staff details via explicit ownership handoff. Do not imply corrected paid hours or fabricate geofence success.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Attendance/AttendanceContext.test.tsx` passes: Required reason validates; save/error/conflict maintains draft; original capture separate from annotation; EN/UR text complete. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
