# Spec 10 — Additive launch lifecycle persistence

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/prisma/schema.prisma`, `backend/prisma/migrations/202610200001_launch_lifecycle/migration.sql`, `docs/implementation/MIGRATIONS.md`, `backend/src/services/launchPersistence.test.ts`, `specs/inventory/10-launch-persistence.md`
**Reuses:** `backend/src/prisma/prisma.ts`

## Goal

Additive launch lifecycle persistence in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Add only required credential epoch/force-change fields, verified owner contact/hashed one-use identity token, immutable attendance annotation and reasoned company-account status/audit metadata. Keep operator identities external; reuse inquiry and audit records where safe. Supply preflight/backup/rollback with no drops/resets; migration deploy only on isolated DB. Default new fields preserve existing accounts; rollout of epochs must not silently trust old token claims.

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

- [ ] `npm test --prefix backend -- src/services/launchPersistence.test.ts` passes: Schema validates, migration additive and backward compatible; constraints enforce token purpose/use and annotation attribution; isolated round-trip required before deployment. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
