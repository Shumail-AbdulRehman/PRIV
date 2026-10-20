# Spec 05 — P0 private attendance media boundary

**Status:** Done
**Depends on:** Spec 02
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #5
**Owns:** `backend/src/routes/attendance.route.ts`, `backend/src/controllers/attendanceSelf.controller.ts`, `backend/src/routes/attendancePhotos.route.ts`, `backend/src/services/attendanceMedia.service.test.ts`, `backend/src/controllers/attendanceMedia.controller.ts`, `specs/inventory/05-attendance-private-media.md`
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

- [x] `npm test --prefix backend -- src/services/attendanceMedia.service.test.ts` passes: Wrong company/site/worker and absent authentication fail before provider call; new assets upload authenticated; no public/signed URLs in attendance DTO; bytes bounded and no-store. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/5. Current ownership transferred from completed specs01/02 for DTO sanitization. Separate attendancePhotos router can be mounted in existing attendance router through explicit transfer. No Cloudinary credentials/provider calls or production migration. Private-media cleanup/old-cache cutover remains controlled spec07/09, never automatic deletion.
- **2026-10-20** — Authenticated sanitized JPEG uploads store opaque references; byte endpoint checks active actor/company/historical manager site or own staff, limits bytes and disables caching. All attendance list/self/write/staff-detail DTOs suppress raw URLs and expose safe photo state/path. Legacy unused self export delegated; precise GPS/attendance logs removed. 20 new media tests plus 17 self/history regressions pass (37 targeted); full backend 687/687 (71 files); build passed. Cloudinary mocked: no live account/cache migration proof. Legacy photos deliberately unavailable pending spec07; new metadata consumed by spec08. Private asset lifecycle/orphan cleanup remains spec07/09 under D08, not auto-deletion.
- **2026-10-20** — Scoped commit published as draft https://github.com/Shumail-AbdulRehman/PRIV/pull/11; stacked on previous spec branch, not merged. Unrelated pre-existing changes excluded.
- **2026-10-20** — Current attendance controller edit ownership transfers to09 for reliability extraction; private DTO and storage boundaries retained.
- **2026-10-20** — Current media service edit ownership transfers07 solely to extract no-side-effect reference parser for maintenance CLI; existing export retained.

- **2026-10-20** — Current ownership of backend/src/controllers/staff.controller.ts transferred to11 for live workforce lifecycle/attendance serialization; earlier completed behavior and tests preserved.
