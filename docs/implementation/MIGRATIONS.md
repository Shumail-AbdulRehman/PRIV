# Launch lifecycle additive migration

Migration: backend/prisma/migrations/202610200001_launch_lifecycle/migration.sql.
No production apply is authorized or performed. Never run migrate reset, db push, seed-demo, rollback drops or destructive down migrations against an application database.

## Contents and deployment order
Add credentialVersion(default0), mustChangePassword(defaultfalse) for Manager/Staff; owner emailVerifiedAt remains null for existing accounts. Add operational company status/version/reason/time separate from provider status. Existing inactive companies backfill to SUSPENDED without inventing reason/time or changing isActive. Existing ADMIN still means company owner, never platform operator.

CredentialToken stores SHA256 hash only, purpose, company-bound manager/staff target, optional delivery email, expiry/consumption timestamps. Composite foreign keys enforce target tenant; checks enforce purpose/target/hash/lifetime. No provider credentials or raw token/password column. Services16–18 must consume atomically, verify current role/contact and revoke credential epochs; fields alone do not activate recovery or revoke existing JWTs.

AttendanceAnnotation is append-only actor/time/reason context. Database trigger enforces same attendance/tenant, own staff or assigned-site manager, same-record acknowledgement parent and immutable note rows. It never rewrites captured Attendance. Deletion of annotated attendance is restricted; retain/archive and identity-verified exit process must handle that boundary in23/38. Company audit reuses existing AuditLog; operator role integration belongs24/25.

Deploy schema before application code that selects the added fields. Backward-compatible defaults preserve existing account records and hashes; no existing contact is silently marked verified. Existing login rollout of typed JWTs requires re-sign-in (spec04); credential epoch enforcement remains18.

## Preflight and backup
- Confirm exact target host/database, operator and written approved migration/rollback procedure. Do not infer target from a developer .env.
- Record applied migration list/checksums and current owner/staff/company/attendance counts. Check foreign-key tenant consistency and annotation author-scope assumptions; investigate existing anomalies without deleting or guessing.
- Take encrypted PostgreSQL backup and protect storage manifests/credentials separately. Prove restore into a newly created isolated database and compare counts/content before approving live apply.
- Evaluate locks for new composite unique indexes and Company metadata backfill on actual table sizes. Schedule an approved maintenance window if needed; no new unmeasured performance architecture.
- Keep sender, operator IdP, support contact, Paddle terms/catalog, retention/legal and Android distribution disabled until configured and qualified.

## Apply and rollback
Apply only via explicit approved target and `prisma migrate deploy`. This session used explicit loopback disposable test URLs; no app configuration overwritten. Verify new constraints, safe defaults, old counts and captured data. Audit deployment and test tenant/site denials.

Before commit, a PostgreSQL transaction rollback removes the additive DDL/backfill and preserves previous rows; this was rehearsed. After commit/new feature writes, roll back the application while preserving added schema/data. Never drop tokens/annotations or remove constraints as a routine down migration; that destroys new history and can restore insecure behavior. A full restore or field-level compensating operation requires separate data-owner approval, downtime/backup plan and reconciliation of post-backup changes. Preserve existing accounts, task evidence, attendance and company records.

## Local verification evidence — 2026-10-20
Temporary user-owned PostgreSQL16.15 extracted under /tmp/hygene-isolated-postgres, listening only127.0.0.1:56439; no system service changed. Docker socket was unavailable; no permission escalation requested. No application DATABASE_URL/.env was used for database selection.

Fresh install:18 migrations deployed into hygene_launch_test. Seven SQL invariant tests passed with explicit LAUNCH_PERSISTENCE_TEST_DATABASE_URL; the full backend suite was run with explicit local DATABASE_URL and the SQL test URL (787 tests, zero skips). Without that dedicated test URL, the seven SQL tests explicitly skip instead of accessing a configured app database.

Upgrade/rollback: tests/launchMigration.integration.ts refuses nonempty/remote/unidentified DB. It builds prior schema, seeds synthetic existing company/owner/worker/site/attendance, applies the new migration transactionally, rolls back and checks every old column/row, reapplies and verifies again. It also exercises concurrent real Prisma registration and actual bcrypt hashing. All results must pass before local spec completion. Never rerun against a nonempty database; create another disposable isolated database.

Restore rehearsal: pg_dump of synthetic hygene_upgrade_test restored using pg_restore --single-transaction into new hygene_restore_test; company/manager/staff/attendance counts1/1/1/1. This proves local tooling, not production backup ownership, storage recovery or live restore readiness. Actual deployment/restore remains39 gate.

Continuation commands (substitute an explicitly isolated local URL; no credentials in tracked files):
- `LAUNCH_PERSISTENCE_TEST_DATABASE_URL=<isolated-url> npm test -- src/services/launchPersistence.test.ts` from backend.
- `LAUNCH_MIGRATION_TEST_DATABASE_URL=<new-empty-isolated-url> npx tsx tests/launchMigration.integration.ts` from backend.

Temporary fixture database/process can be stopped with the user-owned pg_ctl path after the session; it is not a production application service. Keep test fixtures separate from customer data.
