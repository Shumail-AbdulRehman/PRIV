# Spec 29 — Attendance exception context UI

**Status:** In progress
**Depends on:** Spec 23, Spec 27, Spec 08
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #57
**Owns:** `frontend/src/pages/Attendance/api.ts`, `frontend/src/pages/Attendance/queries.ts`, `frontend/src/pages/Attendance/attendance-v5.css`, `frontend/src/pages/Attendance/AttendancePage.test.tsx`, `.impeccable/surfaces/frontend-src-pages-attendance-attendancecontext-tsx.md`, `frontend/src/pages/Attendance/attendance-context.css`, `frontend/src/i18n/attendanceContextTranslations.ts`, `frontend/src/pages/Attendance/AttendancePage.tsx`, `docs/implementation/ATTENDANCE_CONTEXT_UI.md`, `frontend/src/pages/Attendance/AttendanceContext.tsx`, `frontend/src/pages/Attendance/AttendanceContext.test.tsx`, `frontend/src/pages/Attendance/contextApi.ts`, `specs/inventory/29-attendance-context-ui.md`
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

- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/pages/Attendance/AttendanceContext.test.tsx` passes: Required reason validates; save/error/conflict maintains draft; original capture separate from annotation; EN/UR text complete. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Claimed issue57 on implementation/spec-29-attendance-context, base28/PR56 at2d77fd3.23/27/08 Done and reachable; preceding PRs remain unmerged. Transfer attendance/staff detail ownership from08 and dictionary registration from28 before editing. Reuse actual23 GET/POST annotation contract and08 protected-photo rendering; original facts unchanged. Approvedv5/code-led Operate extension, no redesign/new dependency/schema. Dirty user work preserved; no E2E before40.

- **2026-10-21** — Actual attendance and staff-history dialogs consume23 immutable note/acknowledgement API; original day/shift/capture/status/protected-media separate, local timestamps, attributed chronology/paging, strict reason, principal reset, retained exact-request/lost-response retry and explicit409 review.12 focused tests; whole frontend57 Node+68 components/7files; lint/TypeScript/build pass.18 synthetic render captures desktop1440/mobile390 EN/UR plus empty/denied/loading/conflict/uncertain, including lowerform; no overflow/JS errors. Detectoronce[]. Independent full review found only mobile44px minimum; fixed to48px, fresh independent fix verification resolved after original reviewer hit usage limit. Review is fix scope, not liveE2E. Ordinary-extension documenter preserves dirtyDESIGN/sidecars and existingv5. No backend/dependency/schema/production changes.8 original dirtytracked files byte-identical. External39/40 qualification and nativevisual gates unchanged. Latest user asks stop afterbatch29/30/34/37.

- **2026-10-21** — Serialized shared integration ownership handed to30 for actual account/settings/recovery routes, navigation and dictionary registration; existing behavior preserved.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-28 — V5 register/context source:** Claimed existing57, dependency27 now scoped web Done3d503cc;23/08 unchanged. Source0357439 implements approved real register/filter/summary/phone composition and flat context facts/history +300px note rail; existing dialog entry and immutable API/draft/uncertain retry preserved. Explicit authorized locationId API consumption, real location timezone join and honest UTC fallback; selected-site Today calendar tested acrossUTCboundary. Eight new page behaviors +12retained context pass; whole64Node+258React/20files and lint0 pass. No backend/schema/provider/Staff/shared-source changes. Rendered acceptance remains pending coordinator's matching API/SQL capture and independent V5 review; no Done claim from source/tests.
