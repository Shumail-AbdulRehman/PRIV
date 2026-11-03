# Source research — 2026-10-31

Verified against source, not prior conversations:
- backend/prisma/schema.prisma: Staff single location and DateTime shifts, ManagerLocation site authorization, CredentialToken, AuditLog; no Shift model.
- backend/src/controllers/staff.controller.ts and validations/staff.validation.ts: required name/email/phone/password and paired times, existing list/detail routes.
- backend/src/prisma/prisma.ts: bcrypt10 hooks apply to staff.create/update; createMany bypass would require explicit hashing.
- backend/src/services/{accountAccess,subscription,workforceLifecycle,credentialHandoff}.service.ts: company locks and3/25/200staff plan capacities; historic transfer preservation; one-use secure handoff and real password reauthentication.
- backend/src/utils/{dateTime,syncAttendanceWindow}.ts, services/attendanceWrites.service.ts, cron/{startupCron,attendanceCron,attendanceStatusCron,taskInstanceWindow}.ts: IANA timezone, overnight rollover, late15min, previous-day checkout, current-day preparation and DAILY/ONCE tasks.
- frontend/src/pages/Location/{LocationDetailPage,locationTranslations,queries}.tsx/ts; Staff/{StaffCreateDialog,queries,WorkforceActions}; existing cache invalidation and V5 dialogs.
- frontend-mobile/src/auth/AuthContext.tsx, screens/HomeScreen.tsx and launch/recoveryPolicy: native credential replacement and attendance eligibility.
- backend/node_modules/exceljs/index.d.ts, lib/csv/csv.js: Workbook xlsx load/writeBuffer, CSV map retaining phone text, Excel cell-value contracts.
- backend/node_modules/yauzl/index.js and @types/yauzl/index.d.ts: lazy ZIP entry reads, openReadStream and validated actual decompression before XML parsing. Limits1MB compressed/8MB expanded/256entries/500rows.
- Model sizing metadata inherits the already recorded Heavy tier in specs/00-launch-decisions.md; no provider/model migration is performed or claimed.
- root Git, all worktrees, branch refs and gh pr list inspected. PRs7–107 are draft/open in the queried listing; newer acceptance source is preserved on a8728ed. No merge/deploy performed.
