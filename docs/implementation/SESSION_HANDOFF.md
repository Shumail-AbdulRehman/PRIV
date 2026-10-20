# Implementation handoff — 2026-10-20, after Specification24

## Current continuation state

Latest user authorizes continued sequential implementation; this supersedes the prior spec15 stop instruction. Approved launch scope and design/v5 remain unchanged. Read specs/AGENT-GUIDE.md and steering docs before continuing. No deployment, production mutation, destructive migration or PR merge is authorized.

Completed: decision00 and execution01–15,17–19,24,27 (20 of41 execution/gates;21 remain). Prior details remain in individual spec Logs and inventory fragments. Specs16,20–23,25–26,28–41 are Not started. No completed work has been repeated.

## Spec24 verified local boundary

Branch `implementation/spec-24-platform-companies`, base `implementation/spec-15-billing-lifecycle` at2558549. Prerequisites19 and15 are complete and reachable in Git; all predecessor PRs remain open and unmerged. Issue39: https://github.com/Shumail-AbdulRehman/PRIV/issues/39. Implementation commit5a70884 pushed; draft PR40: https://github.com/Shumail-AbdulRehman/PRIV/pull/40, stacked on PR38. No merge or issue closure.

- Service/router provide bounded name/status-filtered company paging and whitelisted detail with local subscription/provider-sync facts and last20 platform status audit records. No workforce/evidence, credentials, arbitrary audit JSON, impersonation or financial mutation.
- PATCH status consumes strict expectedVersion/status/reason. Company-first lock, conditional update and audit in one transaction; stale409, current-version same-state no-op. Suspension changes only operationalStatus/version/context. Legacy isActive:false reactivation409 requires review. Reactivation does not grant paid entitlement or change billing.
- Existing audit helper permits PLATFORM_OPERATOR; null tenant actorId, exact verified issuer/subject retained in audit newValue, reason and DB timestamp durable. Existing account policy reused for read availability.
- Router itself applies separate verifyOperator middleware and private/no-store even on denial. **Mounting is spec26** at `/api/platform/companies`. Real IdP/MFA/provisioned people remain absent, so no live operator access or whole-product policy enforcement is claimed.

Changed files: platformCompany.service.ts, its54-test file, platformCompany.route.ts, existing auditLog.service.ts actor type, backend/tests/platformCompany.integration.ts, inventory24, specs24/26/39, PROGRESS and this handoff; validator evidence refreshed. No UI or schema change. Preserve unrelated dirty work below.

Verification:54 focused tests; full backend1077 tests/84 files/zero skips with explicit isolated DATABASE_URL and LAUNCH_PERSISTENCE_TEST_DATABASE_URL; `cd backend && npx tsc --noEmit`; backend build; standalone integration tsc all pass. `PLATFORM_COMPANY_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/platformCompany.integration.ts` passed: real race one winner/one409, audit rollback, durable provenance, suspension policy, reactivation/owner/other tenant preservation. All data synthetic; no network provider calls. Logs /tmp/hygene-spec24-tests.log and /tmp/hygene-spec24-build.log. No backend lint script. Unit/router boundary tests are not the spec40 E2E suite.

## Next selected eligible unit22

Owner company settings API, depends only on10 (Done). Re-read full spec and claim its issue before code; restrict to name and genuinely approved verified-contact fields. Current Company schema has no verified company contact fields: do not invent them or modify owner email through company settings. Owner auth, strict allowlist, optimistic conflict/audit and tenant denial required. Existing updatedAt is suitable for conflict detection and will conflict safely with concurrent billing/status writes. Preserve accountVersion semantics for24. Route composition26; UI30. Newly eligible33 also consumes24/27, but22 is selected to supply remaining26/30 contracts first.

Other eligible independent units:16,20,21,23,25,28,31,32,33,34,38. This is a dependency-based selection, not numerical ordering. Complete each unit, verify, update handoff, commit and draft PR separately. Do not merge.

## Remaining external and integration gates

Billing15 local only: real merchant/catalog/terms/sandbox/portal qualification unavailable. Browser32 must replace legacy purchase; policy/job composition26 pending. Preserve ambiguous billing reservations and canonical customer linkage, never auto-repair financial state. Read BILLING.md before changes.

Other gates: operator IdP/MFA/provisioned people; verified mail/support channel; legal retention/exit text; host/TLS/secrets/signing; physical Android; calendar/customer fit; consented photo qualification; actual backup restore and legacy public URL/cache cutover. Do not invent facts or secrets. Existing photos remain private authenticated assets; credential epochs and atomic refresh regressions must remain intact. Design/v5 immutable. No frontend/mobile behavior changed by24.

## Existing Git/review state and preserved user work

Prior stacked draft PRs by spec:01→7,02→8,03→9,04→10,05→11,06→13,08→15,09→17,13→19,07→21,12→23,10→25,17→27,18→28,19→30,11→32,14→34,27→36;15→38. Nothing merged. Spec24 is stacked on spec15; compare with its immediate base for a scoped review.

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
