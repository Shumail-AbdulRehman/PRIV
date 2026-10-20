# Spec 08 — Protected attendance image presentation

**Status:** Not started
**Depends on:** Spec 05, Spec 06
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/components/common/ProtectedAttendancePhoto.tsx`, `frontend/src/components/common/ProtectedAttendancePhoto.test.tsx`, `frontend/src/pages/Attendance/AttendancePage.tsx`, `frontend/src/pages/Staff/StaffDetailPage.tsx`, `specs/inventory/08-attendance-media-ui.md`
**Reuses:** `frontend/src/pages/Verification/ProtectedEvidence.tsx`, `frontend/src/api/client.ts`, `frontend/src/components/ui/dialog.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/attendance.html`

## Goal

Protected attendance image presentation in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Replace attendance URL anchors/images with credentialed blob reads from scoped API. Revoke object URLs on cleanup/identity changes; preserve missing/legacy-unavailable/error/retry states and accessible enlargement. Reuse Dialog and language provider; never expose signed links.

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

- [ ] `npm run test:components --prefix frontend -- src/components/common/ProtectedAttendancePhoto.test.tsx` passes: Render no image for unavailable/legacy reference; credentialed fetch, denied/retry state, URL cleanup and dialog keyboard labels are asserted. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
