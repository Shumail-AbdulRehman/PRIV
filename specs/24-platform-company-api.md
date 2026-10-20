# Spec 24 — Platform company operations API

**Status:** Done
**Depends on:** Spec 19, Spec 15
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #39
**Owns:** `backend/src/services/platformCompany.service.ts`, `backend/src/services/platformCompany.service.test.ts`, `backend/src/routes/platformCompany.route.ts`, `specs/inventory/24-platform-company-api.md`, `backend/src/services/auditLog.service.ts`, `backend/tests/platformCompany.integration.ts`
**Reuses:** `backend/src/services/auditLog.service.ts`

## Goal

Platform company operations API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

List bounded company commercial metadata; detail account/subscription/provider-sync facts. Reasoned audited suspension/reactivation with optimistic conflict guard consumes account policy. No photos, worker roster, tenant impersonation, credentials or financial mutations. Return whitelisted operator DTOs. Serialized ownership extends the existing audit helper actor type to PLATFORM_OPERATOR; retain issuer/subject in the status audit payload with no numeric tenant actor. Add isolated persistence proof. Route mounting remains spec 26.

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

- [x] `npm test --prefix backend -- src/services/platformCompany.service.test.ts` passes: Tenant identities denied; DTO excludes workforce; repeated/conflicting status writes safe; reason/actor/timestamp persist. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue39; dependencies19/15 and branch/PR stack verified. Existing unrelated dirty work preserved. Extended serialized ownership for accurate operator audit typing and isolated PostgreSQL proof; composition remains26.

- **2026-10-20** — Completed local contract:54 focused tests; full backend1077/84 files, zero skips (explicit isolated LAUNCH_PERSISTENCE_TEST_DATABASE_URL); `npx tsc --noEmit`, standalone integration tsc and backend build pass. Isolated PostgreSQL proof passed: one concurrent status winner, one409; durable distinct operator issuer/subject/reason/time; audit failure rolls back real status update; policy denies operations while preserving owner security/billing; reactivation preserves billing and other tenant. Logs `/tmp/hygene-spec24-tests.log`, `/tmp/hygene-spec24-build.log`. Router remains intentionally unmounted until26; IdP/MFA qualification39/40 remains external, no production/provider calls or UI changes. Next selected22 (dependency10 Done);33 also newly eligible. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/39; draft PR to be recorded after publication. No issue closure or merge.

- **2026-10-20** — Committed5a70884 and pushed; draft PR https://github.com/Shumail-AbdulRehman/PRIV/pull/40 stacked on15/PR38. Issue39 remains open until human merge.
