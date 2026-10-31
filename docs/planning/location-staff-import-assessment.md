# Latest authorization amendment — 2026-10-31

The user explicitly requested manager-entered spreadsheet passwords and direct staff login, superseding the original no-password-column restriction. This is compatible with existing individual staff creation: retain its password validation and bcrypt creation hook, set mustChangePassword=false for these new accounts, and leave existing accounts/recovery unchanged. Require six headers, validate password text/minimum6characters/maximum72UTF-8bytes, do not trim meaningful whitespace, and remove password properties before constructing preview responses. Replace unkeyed file digest with server-keyed HMAC to avoid persisting a fast verifier derived from plaintext spreadsheet passwords. No schema change is needed. The original assessment below is historical where it describes inaccessible random passwords/handoff-only provisioning.

# Location staff import assessment — 2026-10-31

## Ground truth and branch reconciliation
The supplied root is fix/v5-runtime-data-loading at 55061b8, with substantial tracked/untracked user work. It was preserved. The newer preserved build/hygeneops-android-testing-20261029 at a8728ed contains the subsequent acceptance stack (PR98–107), all still draft/unmerged per gh pr list. origin/main remains 7d37761 in local refs; no fetch/merge is implied. Isolated implementation: implementation/spec-42-location-staff-import, /home/shumail/.local/share/hygene-ops/v5-import-20261031. Existing worktrees were inspected and preserved.

The root tracker is older: ten unresolved. The newer branch has 36 Done (including decision00), 30/34/36/37 Blocked, 40 In progress, 41 Not started. Their provider/device gates remain authoritative. Historical README/design pending labels are superseded by DESIGN-SYSTEM's recorded approval. Do not redo frozen prototypes. OAuth remains out of scope.

## Architecture and workflows
Express5/TypeScript routes use JWT identity, role middleware and plain-value services; Prisma7/PostgreSQL persist tenant data. No Redis dependency or runtime use was found: do not introduce it. Web React19/Vite8 uses TanStack Query, Redux identity, existing shadcn dialogs and EN/UR context. Expo native has its own authenticated staff workflows and forced credential replacement.

Company registration is atomic; ADMIN is company owner, never platform operator. ManagerLocation grants site scope. Staff has globally unique email, optional schema phone (required by createStaffSchema), one current nullable locationId and DateTime shiftStart/shiftEnd. Transfers lock staff, deny open attendance, revoke sessions and release unfinished assignments while preserving historical site/evidence rows. There is no Shift model/API, working-day table or reusable shift library. Both create and edit require paired distinct shift times.

Attendance projects saved instants into Location.timezone using resolveZonedAttendanceWindow. End <= start rolls to next local calendar day. Writes locate eligible expected windows; checkout can target yesterday's open shift, geofencing uses current site and bounded accuracy; lateness is over15min; missed checkout cron uses expectedEnd. TaskTemplate/TaskInstance use separate existing window projection and assignment/evidence snapshots, recurring jobs and manager review services. Import must not manufacture tasks or historic attendance.

Password hashing is Prisma create/update extension bcrypt10. Individual staff creation currently lives in a controller rather than a reusable business service: extract its transaction-scoped insert minimally and use it for both callers. Bulk hashing cost must be measured; no createMany without explicit hashing. Existing STAFF_ACCESS_HANDOFF issues hashed, expiring30min single-use tokens after manager password reauthentication, rotates inaccessible random password and requires replacement. Imported accounts can start with inaccessible random credentials and mustChangePassword; managers subsequently use the existing individual handoff workflow. No raw credentials or batch token export, no Resend dependency.

## Decision: valid with focused adaptations
1. Employee creation: extract shared insert, retain createStaffSchema and Prisma hash hooks.
2. Location: use existing Staff.locationId, request path is authoritative; re-read ManagerLocation in transaction.
3. Shifts: convert HH:mm using selected location timezone and same1970anchor as staff form; no Shift table/deduplication needed.
4. Attendance: existing overnight/window/write rules fit. Existing prepareStaffAttendance can manufacture ABSENT shifts starting before staff.createdAt; a focused new-record guard is required and needs regression proof. Do not rewrite recorded attendance.
5. Authentication: inaccessible random password plus existing reauthenticated handoff; no mail dependency. This preserves a secure but individual access-distribution step; batch automatic delivery is explicitly unsupported.
6. Authorization: JWT + role + current actor/company/site + paid capacity locks on preview/commit.
7. UI: location Staff and shifts tab, existing V5 dialog/table/loading/status patterns, EN/UR/RTL. No additional location picker.
8. Performance: accept <=500 rows for validation, but current plans allow3/25/200 active staff TOTAL. Reject over-capacity at preview/commit; never silently lift limits. Sequential bcrypt inside default30s transaction is a feasibility risk to benchmark before accepting implementation.
9. Maintainability: one parser/validation path for preview/commit, bounded upload in memory, no jobs/file retention/migration.
10. Complexity: signed expiring actor/company/site-bound preview plus database duplicate checks; company lock serializes imports/individual hires. Confirmation retry must reconcile via existing persisted audit metadata or a new minimal idempotency record, without storing employee PII in token/logs.

No serious conflict in the location-based UX itself was found. Capacity, onboarding distribution and first-shift eligibility are material adaptations, not permission to change commercial policy or attendance history. Confirmation and performance evidence are mandatory before claiming completion.

## Implementation evidence
The feasibility risks were tested against real disposable PostgreSQL/API/browser:200staff committed atomically in13,383ms under the existing30s transaction budget;500row preview correctly rejected current commercial capacity. Concurrent confirmation returned the same receipt, stale site permission was denied, injected second-row failure rolled back the batch, and existing handoff enabled staff authentication. No new migration/queue/shift model or mail dependency was necessary. See docs/implementation/STAFF_IMPORT_RESULTS.md.

Password amendment evidence:4real browser/API/PostgreSQL cases passed33.8s, including direct XLSX/CSV supplied-password login and wrong-password denial;200staff committed13,059ms; invalid-password batch rejected without writes. Full backend1478passed/7existing skips;64Node+395React passed. No database migration or new credential infrastructure.
