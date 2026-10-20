# Implementation handoff — 2026-10-20, after Specification23

## Current continuation state

Latest user authorizes continued sequential implementation; this supersedes the prior spec15 stop instruction. Approved launch scope and design/v5 remain unchanged. Read specs/AGENT-GUIDE.md and steering docs before continuing. No deployment, production mutation, destructive migration or PR merge is authorized.

Completed: decision00 and execution01–15,17–19,22–24,27 (22 of41 execution/gates;19 remain). Prior details remain in individual spec Logs and inventory fragments. Specs16,20–21,25–26,28–41 are Not started. No completed work has been repeated.

## Spec24 verified local boundary

Branch `implementation/spec-24-platform-companies`, base `implementation/spec-15-billing-lifecycle` at2558549. Prerequisites19 and15 are complete and reachable in Git; all predecessor PRs remain open and unmerged. Issue39: https://github.com/Shumail-AbdulRehman/PRIV/issues/39. Implementation commit5a70884 pushed; draft PR40: https://github.com/Shumail-AbdulRehman/PRIV/pull/40, stacked on PR38. No merge or issue closure.

- Service/router provide bounded name/status-filtered company paging and whitelisted detail with local subscription/provider-sync facts and last20 platform status audit records. No workforce/evidence, credentials, arbitrary audit JSON, impersonation or financial mutation.
- PATCH status consumes strict expectedVersion/status/reason. Company-first lock, conditional update and audit in one transaction; stale409, current-version same-state no-op. Suspension changes only operationalStatus/version/context. Legacy isActive:false reactivation409 requires review. Reactivation does not grant paid entitlement or change billing.
- Existing audit helper permits PLATFORM_OPERATOR; null tenant actorId, exact verified issuer/subject retained in audit newValue, reason and DB timestamp durable. Existing account policy reused for read availability.
- Router itself applies separate verifyOperator middleware and private/no-store even on denial. **Mounting is spec26** at `/api/platform/companies`. Real IdP/MFA/provisioned people remain absent, so no live operator access or whole-product policy enforcement is claimed.

Changed files: platformCompany.service.ts, its54-test file, platformCompany.route.ts, existing auditLog.service.ts actor type, backend/tests/platformCompany.integration.ts, inventory24, specs24/26/39, PROGRESS and this handoff; validator evidence refreshed. No UI or schema change. Preserve unrelated dirty work below.

Verification:54 focused tests; full backend1077 tests/84 files/zero skips with explicit isolated DATABASE_URL and LAUNCH_PERSISTENCE_TEST_DATABASE_URL; `cd backend && npx tsc --noEmit`; backend build; standalone integration tsc all pass. `PLATFORM_COMPANY_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/platformCompany.integration.ts` passed: real race one winner/one409, audit rollback, durable provenance, suspension policy, reactivation/owner/other tenant preservation. All data synthetic; no network provider calls. Logs /tmp/hygene-spec24-tests.log and /tmp/hygene-spec24-build.log. No backend lint script. Unit/router boundary tests are not the spec40 E2E suite.

## Prior Spec22 verified local boundary

Prior branch `implementation/spec-22-company-settings`, stacked on `implementation/spec-24-platform-companies` at6c6bdc5/PR40. Issue41: https://github.com/Shumail-AbdulRehman/PRIV/issues/41. Implementation commit1b677af pushed; draft PR42: https://github.com/Shumail-AbdulRehman/PRIV/pull/42, base PR40. This documentation is a subsequent checkpoint commit. Both units were completed sequentially and will have separate review PRs; no merge.

Name-only settings reuse registration name validation (trim2–160, Unicode), exact persisted active ADMIN/company authorization, existing READ_OPERATIONAL account policy and AuditLog. Company has no approved verified-contact columns; no new contact field or owner email change was invented. Settings DTO has id/name/accountVersion/updatedAt. Strict PATCH `{name,expectedVersion}` rejects company/plan/role/security/provider fields. Shared accountVersion under company-first lock safely conflicts with spec24 changes and avoids timestamp-precision lost writes. Same-name/current-version save no-op; stale409; audit and update atomic. Suspended company settings denied; active unentitled owner may rename (no new work/capacity).

Router GET/PATCH `/` applies tenant JWT/ADMIN/no-store, rejects operator context. **Mount at `/api/company/settings` in26**. No UI or schema change; account UI30 remains pending.

Spec22 files: companySettings.service.ts, its38-test file, companySettings.route.ts, backend/tests/companySettings.integration.ts, inventory22, specs22/26/39, PROGRESS and this handoff. Validator report refreshed. Existing unrelated dirty files remain preserved; final git status matches the pre-session dirty/untracked list exactly.

Verification:38 focused tests; whole backend1115 tests/85 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build; standalone22/24 integration tsc pass. `COMPANY_SETTINGS_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/companySettings.integration.ts` passed: persisted owner/tenant denial, concurrent rename one winner, actor/name/time durable, actual audit-failure rollback, shared name/status race, billing/owner/other company preservation. Logs `/tmp/hygene-spec22-tests.log`, `/tmp/hygene-spec22-build.log`. No backend lint script or frontend/mobile changes. Final validator42 specs/zero errors/two accepted warnings (decision00 issue, terminal VERIFICATION.md), justified in README.

## Spec23 verified local boundary and current Git state

Current branch `implementation/spec-23-attendance-annotations`, base `implementation/spec-22-company-settings` at09e0a82/PR42. Dependency10 is locally Done and present in Git; all predecessor PRs remain unmerged. Issue43: https://github.com/Shumail-AbdulRehman/PRIV/issues/43. Draft PR publication follows verification; no merge or deployment.

New service/router append immutable NOTE and parent-bound ACKNOWLEDGEMENT using existing schema/SQL trigger. Staff adds/views only own historical attendance even after site transfer; MANAGER consumes current persisted assignment to Attendance.locationId, ignoring claimed token sites; ADMIN company-wide. Both attendance worker/site company bindings required. Actor and company access rechecked, suspended/inactive actors denied. Context creates no new paid work/capacity, so active unentitled actors may add notes. No edit/delete/payroll/corrected-hour endpoint; original attendance and parent notes untouched.

POST strict input: NOTE `{kind,reason,requestId}` or ACKNOWLEDGEMENT additionally `parentId`; only ADMIN/MANAGER acknowledge a NOTE on exact same company/attendance. Trimmed1–1000 reason, UUID request/parent, server identity/time. Advisory lock per tenant/role/actor/request followed by company/actor/target staff/attendance/scope locks; exact retry200/reused:true returns original, changed intent409, new append201. Annotation + audit reference atomic; no note text duplicated into audit. GET limit25 default/50 max, scoped UUID cursor, stable createdAt/id order; DTO only annotation identity/actor/kind/reason/parent/time. No original photo or workforce payload.

Mount `backend/src/routes/attendanceAnnotation.route.ts` under `/api/attendance` in26; paths GET/POST `/:attendanceId/annotations`, tenant JWT/no-store, operator context denied. Router remains unmounted until26; UI29 and E2E40 separate.

Files: attendanceAnnotation.service.ts, its55-test file, attendanceAnnotation.route.ts, backend/tests/attendanceAnnotation.integration.ts, inventory23, specs23/26/39, PROGRESS/handoff; validator evidence refreshed. No dependency, schema or UI changes. Pre-existing user changes preserved.

Verification:55 focused tests; whole backend1170 tests/86 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build; standalone integration tsc pass. `ATTENDANCE_ANNOTATION_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/attendanceAnnotation.integration.ts` passes real retry races, historical scope/revocation, tenant/parent/cursor denial, chronological paging, audit rollback, SQL update/delete denial and exact original fact preservation. Expected SQL immutability rejection messages appear in integration log. Initial synthetic fixture status fixed to schema CHECKED_IN before successful proof. Logs `/tmp/hygene-spec23-tests.log`, `/tmp/hygene-spec23-build.log`, `/tmp/hygene-spec23-integration.log`. No known failing checks. Backend has no lint script; frontend/mobile not changed.

## Safe checkpoint and next selected eligible unit25

Stop at a verified review/handoff checkpoint after23. No25 issue/code/branch started; continued implementation remains authorized. Read full spec25, steering docs and current scope first. Claim issue before code; one unit/PR, no merge. Do not repeat completed specs.

25 (redacted diagnostics and inquiry operations) consumes Done19 operator identity and supplies26/35. Inspect existing durable EnterpriseInquiry schema/controller and audit/provider sync seams. Metadata-only operator access; bounded/filterable inquiry/audit views, ownership/status recorded durably; no arbitrary logs/env, workforce/photos/credentials or financial mutation. Support contact must explicitly be unavailable unless genuinely configured; do not invent approved channels or legal/service policy. Use actual schema and simple secure approach; no speculative CRM model.

Eligible after23 from the graph:16,20,21,25,28,29,31,32,33,34,38.29 is newly eligible (23/27/08 Done).25 is the selected next unit for26/35 consumption, not numeric order.26 still waits16/20/21/25;30 needs16. No future unit marked Done from contracts alone.

## Remaining external and integration gates

Billing15 local only: real merchant/catalog/terms/sandbox/portal qualification unavailable. Browser32 must replace legacy purchase; policy/job composition26 pending. Preserve ambiguous billing reservations and canonical customer linkage, never auto-repair financial state. Read BILLING.md before changes.

Other gates: operator IdP/MFA/provisioned people; verified mail/support channel; legal retention/exit text; host/TLS/secrets/signing; physical Android; calendar/customer fit; consented photo qualification; actual backup restore and legacy public URL/cache cutover. Do not invent facts or secrets. Existing photos remain private authenticated assets; credential epochs and atomic refresh regressions must remain intact. Design/v5 immutable. No frontend/mobile behavior changed by22/23/24.

## Existing Git/review state and preserved user work

Prior stacked draft PRs by spec:01→7,02→8,03→9,04→10,05→11,06→13,08→15,09→17,13→19,07→21,12→23,10→25,17→27,18→28,19→30,11→32,14→34,27→36;15→38;24→40;22→42. Nothing merged. Spec24 is stacked on spec15; compare with its immediate base for a scoped review.

The following working-tree entries predate the final handoff and are **preserved user work/tooling/design inputs**, not spec15 changes. Never blanket stage, discard or overwrite them:

```text
 M .github/workflows/ci.yml
 M .gitignore
 M DESIGN.md
 M backend/package.json
 M backend/src/controllers/managerOperations.controller.ts
 M backend/src/routes/manager.route.ts
 M frontend/src/i18n/managerTranslations.ts
 M frontend/src/pages/Dashboard/DashboardPage.tsx
?? .agents/skills/animate
?? .agents/skills/gpt-taste
?? .agents/skills/impeccable
?? .agents/skills/plan-project
?? .ai/
?? backend/src/services/companyPerformance.service.test.ts
?? backend/src/services/companyPerformance.service.ts
?? backend/tests/companyPerformance.integration.ts
?? design/
?? docs/OVERVIEW_PERFORMANCE.md
?? docs/plan-project/
?? frontend/src/pages/Dashboard/performance.css
?? frontend/src/pages/Dashboard/performance.ts
?? frontend/tests/performanceBrowser.mjs
?? investor-video/
```

Plans/docs are ignored by the existing .gitignore; explicitly force-stage only intended files. The user changes to dashboard, manager operations, package script and CI must remain outside scoped implementation commits. No new migration was required by15, and no production records/configuration were modified.

## Isolated local infrastructure and reproduction

PostgreSQL16.15 is user-owned, extracted from official Ubuntu packages: binaries `/tmp/hygene-isolated-postgres/server/usr/lib/postgresql/16/bin`, data `/tmp/hygene-isolated-postgres/data`, socket `/tmp/hygene-isolated-postgres`, loopback127.0.0.1 port56439, jitoff. Test role `shumail` uses local trust for synthetic data only. `hygene_launch_test` has the18 existing migrations; other synthetic DBs are hygene_upgrade_test, hygene_upgrade_rerun_test, hygene_upgrade_signup_test and hygene_restore_test. No system install/Docker escalation/deployment was performed.

Temporary infrastructure/logs can disappear between sessions. Check availability before integration tests; recreate only isolated scratch infrastructure if needed using MIGRATIONS.md, never reset an existing unknown database. Explicit dedicated test variables are mandatory. Never load application .env to choose the integration target. The full suite skips7 SQL cases without LAUNCH_PERSISTENCE_TEST_DATABASE_URL, so record that truth if not provided. Integration fixtures may write only their guarded local test target. Prior10 upgrade/transaction rollback/reapply, signup race/hash and dump/restore proofs passed locally; these do not qualify production backups.

Possible leftover frontend fixture devserver is loopback127.0.0.1:5188 (earlier session38397); do not mistake it for a deployed app. There are no pending spec15 test processes after this handoff. See BILLING.md, MIGRATIONS.md and OPERATOR_IDENTITY.md for detailed safe boundaries.
