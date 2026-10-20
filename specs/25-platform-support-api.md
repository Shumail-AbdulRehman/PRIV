# Spec 25 — Redacted diagnostics and inquiry operations

**Status:** Done
**Depends on:** Spec 19, Spec 24
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #45
**Owns:** `backend/src/services/platformSupport.service.ts`, `backend/src/services/platformSupport.service.test.ts`, `backend/src/routes/platformSupport.route.ts`, `specs/inventory/25-platform-support-api.md`, `backend/tests/platformSupport.integration.ts`, `docs/implementation/SUPPORT_OPERATIONS.md`
**Reuses:** `backend/src/controllers/enterpriseInquiry.controller.ts`, `backend/src/services/auditLog.service.ts`

## Goal

Redacted diagnostics and inquiry operations in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Use existing durable inquiry records for bounded lead handling, ownership and verified-channel status. Provide redacted health/sync/audit facts; no worker evidence or arbitrary environment/log dump. Customer support contact only when configured; unavailable contact must be explicit.

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

- [x] `npm test --prefix backend -- src/services/platformSupport.service.test.ts` passes: No secrets/private tenant workforce in diagnostics; operator-only lead handling; audit filters bounded and redacted. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed45; dependency19/branch/stack verified; branched from spec23/PR44. Existing EnterpriseInquiry submission and AuditLog reused; no schema change. Queue state NEW/IN_PROGRESS/CLOSED plus self-claim/unassignment recorded as versioned operator audit events, without asserting inquiry email verification. Diagnostics expose observed aggregate timestamps only; configured support contact requires explicit verified-channel flag. Integration proof/documentation ownership added before code.

- **2026-10-20** — Dependency correction before code: consume completed24 PLATFORM_OPERATOR audit helper type/provenance contract (19 supplies identity only). Added25→24 to tracker/DAG/index;25 remains eligible. No prior implementation repeated.

- **2026-10-20** — Completed66 focused tests; whole backend1236 tests/87 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL. Backend tsc --noEmit/build and standalone integration tsc (--strict, matching backend nullability) pass. Real isolated PostgreSQL proof reuses existing public inquiry controller, preserves submissions/retries, verifies queue one-winner/one409, durable named operator/reason/time/ownership, audit failure unchanged state, no-op/stale safety, bounded inquiry/audit redaction and actual DB observation. Logs `/tmp/hygene-spec25-tests.log`, `/tmp/hygene-spec25-build.log`, `/tmp/hygene-spec25-integration.log`. No schema/UI/dependency-package/provider/production changes. Mounting26, UI35/38 and actual IdP/contact qualification39/40 remain pending. Contact unavailable until explicitly configured and qualified; inquiry email always unverified. Added38→25 for real contact API consumption; DAG/index/tracker agree. Validator42 specs/zero errors/four justified warnings (two existing plus two direct consumption edges). Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/45; draft PR recorded after publication. Next selected16 (10/13 Done);35 newly eligible.
