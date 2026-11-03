# Spec 09 — Attendance write and calendar correctness

**Status:** Done
**Depends on:** Spec 05
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #14
**Owns:** `backend/src/controllers/attendance.controller.ts`, `backend/src/controllers/attendanceWrites.controller.ts`, `backend/src/validations/attendance.validation.ts`, `specs/inventory/09-attendance-reliability.md`
**Reuses:** `backend/src/utils/dateTime.ts`, `backend/src/utils/syncAttendanceWindow.ts`, `backend/src/utils/geofencing.ts`

## Goal

Attendance write and calendar correctness in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Validate finite latitude/longitude ranges and nonnegative bounded accuracy. Implement conditional checkout and check-in reconciliation using existing unique shifts and expected location snapshots; reject transfer/open-shift mismatch. Clean up only newly orphaned private uploads. Scope dates by each location timezone, not union of unrelated day ranges. Wire new write adapters immediately through existing controller exports; route paths stay intact. Keep final cross-feature policy wiring in spec26.

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

- [x] `npm test --prefix backend -- src/services/attendanceWrites.service.test.ts` passes: Parallel duplicate checkout writes once; lost response re-read returns persisted state; overnight/DST/mixed-zone filters and malformed geography cannot bypass scope. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/14; consume05 storage and transfer current attendance controller ownership for live integration, not unused duplicate handlers. Extend existing durable media cleanup only for confirmed unused private uploads; no automatic deletion of retained or ambiguous assets.
- **2026-10-20** — Strict geography schema rejects blank/null/boolean/nonfinite/out-of-range coordinates and accuracy>200. Extracted live check-in/out service revalidates active STAFF/company/site, expected shift and CAS; replayed check-in and attendanceId checkout return saved records, concurrent loser reconciles. Overnight window uses prior local day (DST-safe). Per-site calendar predicates bound list dates; existing controller exports wire new adapters immediately. Confirmed unused uploads enter existing durable cleanup; authenticated destroy rechecks all references. Ambiguous writes never delete potentially committed photos. 45 targeted tests (37 new writes/geography/calendar +8 cleanup including2 new); whole backend726/726 (72 files); build passed after correcting a test-only injected DB parameter type. No live database/provider run; native explicit retry ID and broader lost-response UI remain37.
- **2026-10-20** — Current cleanup module edit ownership transfers to07 for pure reference parser import; behavior/tests unchanged.
- **2026-10-20** — Scoped draft https://github.com/Shumail-AbdulRehman/PRIV/pull/17 published, stacked on08; not merged.

- **2026-10-20** — Current ownership of backend/src/services/attendanceWrites.service.ts, backend/src/services/attendanceWrites.service.test.ts transferred to11 for live workforce lifecycle/attendance serialization; earlier completed behavior and tests preserved.
