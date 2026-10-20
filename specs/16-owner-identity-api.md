# Spec 16 — Owner verification and recovery API

**Status:** Done
**Depends on:** Spec 10, Spec 13
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #47
**Owns:** `backend/src/services/ownerIdentity.service.ts`, `backend/src/services/ownerIdentity.service.test.ts`, `backend/src/routes/ownerIdentity.route.ts`, `specs/inventory/16-owner-identity-api.md`, `backend/src/services/ownerIdentityDelivery.service.ts`, `backend/src/services/companyRegistration.service.ts`, `backend/src/services/companyRegistration.service.test.ts`, `backend/tests/ownerIdentity.integration.ts`, `docs/implementation/OWNER_IDENTITY.md`, `docs/implementation/research/owner-delivery.md`
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

- [x] `npm test --prefix backend -- src/services/ownerIdentity.service.test.ts` passes: Expired/used/wrong-purpose tokens rejected; transaction consumes once and invalidates credentials; absent delivery reports unavailable without account enumeration. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed47 on branch based25/PR46; dependencies10/13 verified. Serialized ownership transfers registration service from13 to16 for a transactional new-account enrollment marker (not verification), plus existing registration tests. Legacy accounts get no automatic marker. Added delivery adapter, isolated proof and runbook/research ownership before editing. Bounded deferred public recovery admission separates response from account/provider timing; no sent claim, absent configuration unavailable globally. Sender remains opt-in/unqualified.

- **2026-10-20** — Completed74 focused owner/registration tests (60 owner +14 registration); whole backend1297 tests/88 files/zero skips using explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL. Backend tsc --noEmit/build and strict standalone integration tsc pass. Isolated PostgreSQL verifies enrollment/no legacy auto-trust, hashed24h/30m scoped tokens, one-winner verify/reset consumption, bcrypt once, epoch/refresh revocation, suspended company preservation and actual credential/token rollback on audit failure. Native mail adapter tested only injected fetch; no actual mail/provider calls or credentials. Public response explicitly admits volatile processing without claiming sent/durable delivery; no sender configured means global503 before lookup. Runbook records bootstrap/sender/UI/proxy/graceful-drain qualification. Logs `/tmp/hygene-spec16-tests.log`, `/tmp/hygene-spec16-build.log`, `/tmp/hygene-spec16-integration.log`. Validator zero errors/four previously justified warnings. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/47; PR after publication. Continue20 next under latest user instruction; no routine handoff stop.
