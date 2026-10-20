# Spec 17 — Self credentials and assisted worker recovery

**Status:** Not started
**Depends on:** Spec 10
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/credentialHandoff.service.ts`, `backend/src/services/credentialHandoff.service.test.ts`, `backend/src/routes/credentialHandoff.route.ts`, `specs/inventory/17-credential-handoff-api.md`
**Reuses:** `backend/src/utils/auth.ts`, `backend/src/services/staff-notifications/session.ts`

## Goal

Self credentials and assisted worker recovery in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Require current password for self-change. Allow owner/scoped manager to issue one-use staff credential handoff, hash at rest and require first-use password replacement. No staff inbox assumption, saved password display or manager-to-owner reset. Record attributed reset and revoke affected family/push.

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

- [ ] `npm test --prefix backend -- src/services/credentialHandoff.service.test.ts` passes: Wrong-current-password, cross-site reset, owner escalation and consumed handoff denied; issued handoff forces credential replacement. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
