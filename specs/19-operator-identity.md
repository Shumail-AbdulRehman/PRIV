# Spec 19 — Separate platform operator authorization

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #29
**Owns:** `docs/implementation/OPERATOR_IDENTITY.md`, `backend/src/services/operatorIdentity.service.ts`, `backend/src/services/operatorIdentity.service.test.ts`, `backend/src/middlewares/operatorAuth.middleware.ts`, `specs/inventory/19-operator-identity.md`
**Reuses:** `backend/src/utils/ApiError.ts`

## Goal

Separate platform operator authorization in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Validate configured OIDC JWT signature via provider keys with issuer/audience/expiry/subject and exact approved MFA assurance. Explicit provisioned subject allowlist; absent config disables operator API. Never accept tenant JWT/cookie, ADMIN role or email alone. Use maintained JOSE dependency only if existing JWT/JWK support insufficient; no DIY cryptography.

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

- [x] `npm test --prefix backend -- src/services/operatorIdentity.service.test.ts` passes: Tenant token/wrong issuer/audience/subject/MFA and missing config denied; authorized operator DTO has no tenant role or workforce permissions. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue29; existing jsonwebtoken9 and Node createPublicKey JWK support suffice, no dependency added. Configured RS256 issuer/audience/JWKS, subject allowlist and exact acr required; no tenant-role promotion. External IdP/MFA facts unavailable, so real operator activation remains blocked safely.
- **2026-10-20** — Complete local boundary:69 regression tests cover actual RSA/JWK signatures, tenants, issuer/audience/subject/MFA, key rotation/cache/failure/size and middleware denial. Whole backend888 tests/79 files (isolated PG enabled; zero skips), typecheck/build and diff check pass. No IdP configured or activated; real qualification remains39/40. Consumers24–26/34 remain pending; no public operator account created.
