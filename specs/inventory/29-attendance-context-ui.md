# Spec29 reuse inventory

- `frontend/src/pages/Attendance/AttendanceContext.tsx`: record-scoped dialog exported for actual AttendancePage and StaffDetailPage history; original capture separate from immutable notes. Principal/tenant/record key resets drafts and open state. Reuses08 ProtectedAttendancePhoto and common status/dialog/button components.
- `contextApi.ts`: typed23 annotation paging and append DTOs; exact request retry and parent-note acknowledgement. No actor/time/edit/delete authority in browser inputs.
- `attendance-context.css`: scoped approved v5 semantic styles, responsive flat facts/history/form and sticky accessible close. `attendanceContextTranslations.ts` registers new complete EN/UR vocabulary through existing translator.
- `docs/implementation/ATTENDANCE_CONTEXT_UI.md`: real contracts, safe retry, role handling and proof limitations. `.impeccable/surfaces/frontend-src-pages-attendance-attendancecontext-tsx.md` records the existing-world extension; local synthetic captures are review evidence, not shipping rasters or integrated E2E.

### V5 correction — 2026-10-28

- `frontend/src/pages/Attendance/AttendancePage.tsx`, `attendance-v5.css`: actual location/date filter panel, loaded-record summaries, authorized table/mobile register, protected photo disclosure and existing context entry. Staff/month/quick filters remain secondary. Names/counts/timestamps come from actual API results; failed reads never masquerade as zero totals.
- `frontend/src/pages/Attendance/api.ts`: consumes existing backend-authorized `locationId` query alongside staff/date filters. No client-only tenant/site scoping, new endpoint or schema.
- Existing authorized `useGetLocations` supplies location timezone absent from the retained attendance DTO; unknown timezone is explicitly labelled UTC. Today uses the selected location calendar; all-location date interpretation is explained.
- `AttendanceContext.tsx`, `attendance-context.css`: original captured facts and immutable history form the main column; existing reason/note/acknowledgement form is a300px rail, stacked after history on phone. Accessible dialog entry preserves existing callers, principal-bound draft/reset and exact-request retry semantics.
- `AttendancePage.test.tsx`: eight behaviors cover captured-fact summary derivation, draft/apply/reversed-range handling, site-calendar Today acrossUTCdate boundary, retained secondary filters, failed/loading/Urdu states and actual API location query consumption. Existing12context tests remain.
- `attendanceContextTranslations.ts`: existing registered EN/UR dictionary now includes complete register/filter/summary/error vocabulary; configured names and immutable note text remain original.
