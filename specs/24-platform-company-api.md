# Spec 24 — Platform company operations API

**Status:** Not started
**Depends on:** Spec 19, Spec 15
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/platformCompany.service.ts`, `backend/src/services/platformCompany.service.test.ts`, `backend/src/routes/platformCompany.route.ts`, `specs/inventory/24-platform-company-api.md`
**Reuses:** `backend/src/services/auditLog.service.ts`

## Goal

Platform company operations API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

List bounded company commercial metadata; detail account/subscription/provider-sync facts. Reasoned audited suspension/reactivation with optimistic conflict guard consumes account policy. No photos, worker roster, tenant impersonation, credentials or financial mutations. Return whitelisted operator DTOs.

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

- [ ] `npm test --prefix backend -- src/services/platformCompany.service.test.ts` passes: Tenant identities denied; DTO excludes workforce; repeated/conflicting status writes safe; reason/actor/timestamp persist. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
