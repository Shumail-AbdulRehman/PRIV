# Spec 10 — Additive launch lifecycle persistence

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #22
**Owns:** `backend/tests/launchMigration.integration.ts`, `backend/prisma/schema.prisma`, `backend/prisma/migrations/202610200001_launch_lifecycle/migration.sql`, `docs/implementation/MIGRATIONS.md`, `backend/src/services/launchPersistence.test.ts`, `specs/inventory/10-launch-persistence.md`
**Reuses:** `backend/src/prisma/prisma.ts`

## Goal

Additive launch lifecycle persistence in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Add only required credential epoch/force-change fields, verified owner contact/hashed one-use identity token, immutable attendance annotation and reasoned company-account status/audit metadata. Keep operator identities external; reuse inquiry and audit records where safe. Supply preflight/backup/rollback with no drops/resets; migration deploy only on isolated DB. Default new fields preserve existing accounts; rollout of epochs must not silently trust old token claims.

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

- [x] `npm test --prefix backend -- src/services/launchPersistence.test.ts` passes: Schema validates, migration additive and backward compatible; constraints enforce token purpose/use and annotation attribution; isolated round-trip required before deployment. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Explicitly isolated PostgreSQL migration/constraint/transaction rollback and seeded-record preservation tests pass; never use app DATABASE_URL. [requires: isolated PostgreSQL]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/22. Preparing additive schema/migration only; no production DB/config loaded. Checking isolated local PostgreSQL availability for real migration/constraint/rollback proof. Docker socket unavailable, so extracting a temporary user-owned server package instead of touching system services.
- **2026-10-20** — Additive schema validates;18 migrations applied fresh to own loopback PostgreSQL16.15,7 real SQL invariants pass. Seeded prior-schema upgrade/transactional rollback/reapply preserves every old column. Synthetic pg_dump restored to new isolated DB, counts1/1/1/1. Full backend787/787 with explicit local DB, zero skips. Actual Prisma concurrent signup/hash supplemental proof in migration integration script; no production app DB/config touched.
- **2026-10-20** — Upgrade proof rerun against another empty local DB passes, including real concurrent registerCompany calls (one winner, one uniqueness rejection, no orphan Company) and bcrypt comparison proving transaction query extension hashes exactly once. Expected unique-conflict log is synthetic fixture only. Local backup/restore succeeds with preserved fixture counts. Script typecheck, Prisma validation/generation, backend build and787 full tests all pass. No live deployment/migration authorized; typed-client schema must be applied before selecting new columns on a future deployment.
