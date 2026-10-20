# Spec 39 — Launch operations and active CI proof

**Status:** Not started
**Depends on:** Spec 03, Spec 26
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `.github/workflows/ci.yml`, `docs/implementation/RELEASE_RUNBOOK.md`, `backend/src/services/releaseReadiness.test.ts`, `specs/inventory/39-release-operations.md`
**Reuses:** `frontend-mobile/scripts/validate-device-config.mjs`, `backend/src/services/verification-v2/readiness.service.ts`

## Goal

Launch operations and active CI proof in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Activate relevant current tests/builds, retain existing CI dirty changes. Prove config/TLS/secret/job owner, migration backup/rollback/restore, bounded operational queries, Paddle config and Android signed distribution boundaries. Instrument redacted readiness; no fake provider health. Evaluate existing list bounds; add dedicated follow-up spec for confirmed query gaps, not silent broad changes. Never deploy or modify production.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

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

- [ ] `npm test --prefix backend -- src/services/releaseReadiness.test.ts` passes: CI invokes active direct-photo/review/mobile regressions; production config fails closed; restore/provider/device/old-media/fit gates explicit until evidence. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
