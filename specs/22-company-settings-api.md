# Spec 22 — Owner company settings API

**Status:** Done
**Depends on:** Spec 10
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #41
**Owns:** `backend/src/services/companySettings.service.ts`, `backend/src/services/companySettings.service.test.ts`, `backend/src/routes/companySettings.route.ts`, `specs/inventory/22-company-settings-api.md`, `backend/tests/companySettings.integration.ts`
**Reuses:** `backend/src/services/auditLog.service.ts`

## Goal

Owner company settings API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Read/update Company name and only approved verified-contact fields using optimistic updatedAt/version check and audit. Owner only; whitelist input and prohibit tenant/plan/role/security changes. No speculative tax/CRM schema. Existing Company has no approved verified-contact field: name only. Reuse registration name schema and account read policy (deny suspended company settings). Use shared accountVersion optimistic guard/increment so rapid writes cannot collide at timestamp precision; settings/status changes safely invalidate each other. Mounting remains26.

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

- [x] `npm test --prefix backend -- src/services/companySettings.service.test.ts` passes: Manager/staff/other-tenant denied; stale update preserves draft/current record; unknown protected fields rejected. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue41; dependency10 present on stacked spec24 base. Scoped name-only contract; no approved verified company contacts exist. Reuse accountVersion from10 for safe serialized optimistic writes, registration name validation and account policy from14.

- **2026-10-20** — Complete:38 focused tests; whole backend1115 tests/85 files, zero skips with explicit isolated LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build and standalone integration tsc pass. Real isolated PostgreSQL proof: persisted owner/tenant denial, one concurrent rename winner/one409, durable actor/name/time audit, real audit failure rollback, shared settings/status version guard, unchanged owner/billing/other company. Logs `/tmp/hygene-spec22-tests.log`, `/tmp/hygene-spec22-build.log`. No contact schema, UI or dependencies added. Router mount26 and account UI30 remain pending. Next selected23 (dependency10 Done), unblocks29/26; no23 issue/code started. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/41; draft PR publication recorded below after creation.
