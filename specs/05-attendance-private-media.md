# Spec 05 — P0 private attendance media boundary

**Status:** Not started
**Depends on:** Spec 02
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/routes/attendance.route.ts`, `backend/src/controllers/attendanceSelf.controller.ts`, `backend/src/controllers/staff.controller.ts`, `backend/src/routes/attendancePhotos.route.ts`, `backend/src/services/attendanceMedia.service.ts`, `backend/src/services/attendanceMedia.service.test.ts`, `backend/src/controllers/attendanceMedia.controller.ts`, `backend/src/controllers/attendance.controller.ts`, `specs/inventory/05-attendance-private-media.md`
**Reuses:** `backend/src/utils/cloudinary.ts`, `backend/src/services/verification-v2/media.service.ts`, `backend/src/utils/scope.ts`

## Goal

P0 private attendance media boundary in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Use authenticated attendance upload namespace and opaque stored references without schema rewrite where existing string columns suffice. Replace outward image values with authorized endpoint references on all existing attendance responses including staff detail. Withhold legacy public URLs; do not fetch arbitrary legacy URLs. Authorize owner/company, assigned historical-site manager and own staff on each byte read; bounded downloads and no-store/nosniff. Remove precise coordinates and attendance record logs. Existing self controllers must use shared presentation at wire-up spec 26.

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

- [ ] `npm test --prefix backend -- src/services/attendanceMedia.service.test.ts` passes: Wrong company/site/worker and absent authentication fail before provider call; new assets upload authenticated; no public/signed URLs in attendance DTO; bytes bounded and no-store. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
