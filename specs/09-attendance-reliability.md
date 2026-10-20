# Spec 09 — Attendance write and calendar correctness

**Status:** Not started
**Depends on:** Spec 05
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/attendanceWrites.service.ts`, `backend/src/services/attendanceWrites.service.test.ts`, `backend/src/controllers/attendanceWrites.controller.ts`, `backend/src/validations/attendance.validation.ts`, `specs/inventory/09-attendance-reliability.md`
**Reuses:** `backend/src/utils/dateTime.ts`, `backend/src/utils/syncAttendanceWindow.ts`, `backend/src/utils/geofencing.ts`

## Goal

Attendance write and calendar correctness in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Validate finite latitude/longitude ranges and nonnegative bounded accuracy. Implement conditional checkout and check-in reconciliation using existing unique shifts and expected location snapshots; reject transfer/open-shift mismatch. Clean up only newly orphaned private uploads. Scope dates by each location timezone, not union of unrelated day ranges. New handlers replace old route handlers at spec 26.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Shared visual/navigation composition → spec 27.

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

- [ ] `npm test --prefix backend -- src/services/attendanceWrites.service.test.ts` passes: Parallel duplicate checkout writes once; lost response re-read returns persisted state; overnight/DST/mixed-zone filters and malformed geography cannot bypass scope. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
