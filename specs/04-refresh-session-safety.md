# Spec 04 — P0 atomic role-safe refresh sessions

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/controllers/common.controller.ts`, `backend/src/controllers/common.session.test.ts`, `backend/src/utils/auth.ts`, `backend/src/utils/auth.test.ts`, `backend/src/middlewares/auth.middleware.ts`, `backend/src/middlewares/auth.middleware.test.ts`, `specs/inventory/04-refresh-session-safety.md`
**Reuses:** `backend/src/services/staff-notifications/session.ts`, `backend/src/utils/cookies.ts`

## Goal

P0 atomic role-safe refresh sessions in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Use unique refresh JWT IDs for all roles. Validate token purpose/algorithm, positive integer ID and allowed role before database access. Manager and staff refresh require current role/active user/active company and atomic expected-token rotation. A stale token never clears a newer login. Logout revokes only the presented current family. Preserve push renewal transaction and safe response DTO. Access revocation epochs belong to spec 18 after additive persistence.

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

- [ ] `npm test --prefix backend -- src/controllers/common.session.test.ts` passes: Concurrent refresh has one winner; inactive company/stale role/invalid identity denied; stale refresh/logout cannot revoke current session; all refresh tokens have unique jti. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
