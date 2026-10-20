# Spec 18 — Credential epoch access revocation

**Status:** Not started
**Depends on:** Spec 04, Spec 17
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/credentialSession.service.ts`, `backend/src/services/credentialSession.service.test.ts`, `specs/inventory/18-credential-revocation.md`
**Reuses:** `backend/src/middlewares/auth.middleware.ts`, `backend/src/utils/auth.ts`

## Goal

Credential epoch access revocation in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Integrate additive credential epoch through token issuing/verification seam via explicit ownership handoff before editing shared auth files. New access tokens bind current epoch; password recovery/reset/offboard rejects old access and refresh immediately. Keep one-family behavior; carefully stage legacy-token rejection with migration rollout runbook.

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

- [ ] `npm test --prefix backend -- src/services/credentialSession.service.test.ts` passes: Old access denied after password change/reset; old refresh denied; migration defaults and missing epoch follow explicit safe rollout. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
