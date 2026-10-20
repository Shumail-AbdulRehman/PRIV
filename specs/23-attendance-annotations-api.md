# Spec 23 — Immutable attendance annotations API

**Status:** Not started
**Depends on:** Spec 10
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/attendanceAnnotation.service.ts`, `backend/src/services/attendanceAnnotation.service.test.ts`, `backend/src/routes/attendanceAnnotation.route.ts`, `specs/inventory/23-attendance-annotations-api.md`
**Reuses:** `backend/src/utils/scope.ts`, `backend/src/services/auditLog.service.ts`

## Goal

Immutable attendance annotations API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Append reason/note, authenticated actor/time and acknowledgement to scoped attendance. Staff sees own context; operational review uses historical site/company. Preserve original captured facts, no edit/delete of annotation or corrected-hours engine.

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

- [ ] `npm test --prefix backend -- src/services/attendanceAnnotation.service.test.ts` passes: Cross-site/tenant annotation denied; duplicate retry idempotent; original attendance time/photo/status unchanged. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
