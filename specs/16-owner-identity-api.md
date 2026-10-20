# Spec 16 — Owner verification and recovery API

**Status:** Not started
**Depends on:** Spec 10, Spec 13
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/ownerIdentity.service.ts`, `backend/src/services/ownerIdentity.service.test.ts`, `backend/src/routes/ownerIdentity.route.ts`, `specs/inventory/16-owner-identity-api.md`
**Reuses:** `backend/src/utils/auth.ts`, `backend/src/utils/ApiError.ts`

## Goal

Owner verification and recovery API in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Store only hashed scoped one-use reset/verify tokens with D04 expiry, neutral requests and throttling. Verify email before recovery; legacy unverified owners use identity-verified bootstrap runbook, never auto-trust legacy contact. Delivery injected/configured, disabled safely without sender; no fake sent acknowledgement.

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

- [ ] `npm test --prefix backend -- src/services/ownerIdentity.service.test.ts` passes: Expired/used/wrong-purpose tokens rejected; transaction consumes once and invalidates credentials; absent delivery reports unavailable without account enumeration. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
