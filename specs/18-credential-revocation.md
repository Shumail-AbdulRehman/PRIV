# Spec 18 — Credential epoch access revocation

**Status:** Done
**Depends on:** Spec 04, Spec 17
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #26
**Owns:** `backend/src/utils/auth.ts`, `backend/src/utils/auth.test.ts`, `backend/src/controllers/companyRegistration.controller.ts`, `backend/src/services/credentialSession.service.ts`, `backend/src/services/credentialSession.service.test.ts`, `specs/inventory/18-credential-revocation.md`
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

- [x] `npm test --prefix backend -- src/services/credentialSession.service.test.ts` passes: Old access denied after password change/reset; old refresh denied; migration defaults and missing epoch follow explicit safe rollout. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/26. Current ownership transferred from completed04/13/17 for token/middleware/refresh integration and regression updates. Typed pre-version JWTs normalize to version0 and work only while the current principal remains0; no destructive account/session migration.
- **2026-10-20** — Exact-current-family logout also increments credentialVersion, immediately invalidating its access tokens while stale/access-only logout still cannot revoke newer login. Forced-password sessions can reach only the dedicated own-password adapter; refresh/operational endpoints reject them.

- **2026-10-20** — Complete:72 targeted tests;819 whole backend tests/78 files on explicit isolated PostgreSQL (no skips), build/typechecks and real PostgreSQL handoff/password/logout old-access+refresh denial pass. No production mutation or IdP/provider claim. Legacy typed tokens are version0 only; deploy additive migration10 before this code.

- **2026-10-20** — Serialized registration-test ownership transferred to16 for enrollment marker regression tests; all existing epoch/session assertions retained. No18 implementation repeated or weakened.

- **2026-10-21** — Serialized composition ownership transferred to26: `backend/src/middlewares/auth.middleware.ts`, `backend/src/middlewares/auth.middleware.test.ts`, `backend/src/controllers/common.controller.ts`, `backend/src/controllers/common.session.test.ts`, `backend/src/routes/credentialHandoff.route.ts`. Prior completed behavior retained;26 consumes rather than reimplements this contract.
