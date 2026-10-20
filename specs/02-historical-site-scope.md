# Spec 02 — P0 historical worker site authorization

**Status:** Not started
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/controllers/staffHistory.authorization.test.ts`, `specs/inventory/02-historical-site-scope.md`
**Reuses:** `backend/src/controllers/staffSelf.controller.ts`, `backend/src/utils/scope.ts`, `backend/src/services/verification-v2/reviewClosure.service.ts`

## Goal

P0 historical worker site authorization in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Constrain worker detail task templates, task instances, attendance rows and every count/group aggregate by historical row location company and current manager assigned-site scope. Preserve owner company-wide history, current-worker visibility gate and date filters. Prevent late-count OR predicates replacing date predicates. Delegate legacy getProfile export to actor-safe implementation when available; do not keep an insecure alternative.

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

- [ ] `npm test --prefix backend -- src/controllers/staffHistory.authorization.test.ts` passes: Transferred site-A history is absent for manager-B in rows and every aggregate; ADMIN retains both sites; cross-company/empty-scope denied. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
