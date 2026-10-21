# Spec29 reuse inventory

- `frontend/src/pages/Attendance/AttendanceContext.tsx`: record-scoped dialog exported for actual AttendancePage and StaffDetailPage history; original capture separate from immutable notes. Principal/tenant/record key resets drafts and open state. Reuses08 ProtectedAttendancePhoto and common status/dialog/button components.
- `contextApi.ts`: typed23 annotation paging and append DTOs; exact request retry and parent-note acknowledgement. No actor/time/edit/delete authority in browser inputs.
- `attendance-context.css`: scoped approved v5 semantic styles, responsive flat facts/history/form and sticky accessible close. `attendanceContextTranslations.ts` registers new complete EN/UR vocabulary through existing translator.
- `docs/implementation/ATTENDANCE_CONTEXT_UI.md`: real contracts, safe retry, role handling and proof limitations. `.impeccable/surfaces/frontend-src-pages-attendance-attendancecontext-tsx.md` records the existing-world extension; local synthetic captures are review evidence, not shipping rasters or integrated E2E.
