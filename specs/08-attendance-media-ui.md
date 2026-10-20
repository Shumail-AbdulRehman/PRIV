# Spec 08 — Protected attendance image presentation

**Status:** Done
**Depends on:** Spec 05, Spec 06
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #12
**Owns:** `frontend/src/i18n/attendancePhotoTranslations.ts`, `frontend/src/i18n/translations.ts`, `frontend/src/components/common/ProtectedAttendancePhoto.tsx`, `frontend/src/components/common/ProtectedAttendancePhoto.test.tsx`, `frontend/src/pages/Attendance/AttendancePage.tsx`, `frontend/src/pages/Staff/StaffDetailPage.tsx`, `specs/inventory/08-attendance-media-ui.md`
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

- [x] `npm run test:components --prefix frontend -- src/components/common/ProtectedAttendancePhoto.test.tsx` passes: Render no image for unavailable/legacy reference; credentialed fetch, denied/retry state, URL cleanup and dialog keyboard labels are asserted. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/12. Use existing Dialog/Button/evidence styles and auth hook. Read Impeccable context/harden/craft-floor; latest approved v5 overrides historical root teal guidance, no drift repair or new design. Added ownership of isolated photo vocabulary and its registration in existing translator.
- **2026-10-20** — Attendance/StaffDetail now use request-on-open protected blob dialog, bounded JPEG response checks, denied/missing/retry/legacy states, zoom, localized close/title, abort/revoke on close/unmount/identity change. Targeted 13/13; full web57 node +15 component tests; TypeScript/Vite build and touched ESLint pass. Impeccable detector returns zero findings. Real React route rendered at390/1366px EN/UR, four fixture captures: no page overflow or JS errors, one scoped photo read each. Visual fixture uses existing v5 floor asset and intercepted APIs, not live persistence/provider proof. Existing page-wide untranslated/teal shell remains27/29 scope, no redesign done. Screenshots in docs/implementation/previews; no new prototype.
