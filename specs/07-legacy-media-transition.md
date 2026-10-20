# Spec 07 — Legacy attendance asset transition tooling

**Status:** Not started
**Depends on:** Spec 05
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/scripts/attendanceMediaInventory.ts`, `backend/scripts/attendanceMediaTransition.ts`, `docs/implementation/ATTENDANCE_MEDIA_RUNBOOK.md`, `backend/src/services/attendanceMediaTransition.test.ts`, `specs/inventory/07-legacy-media-transition.md`
**Reuses:** `backend/src/utils/cloudinary.ts`, `backend/src/services/deletedMedia.service.ts`

## Goal

Legacy attendance asset transition tooling in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Implement read-only inventory by default and explicit dry-run transition manifest. Bind legacy assets to attendance ID/company/site; copy to authenticated storage, verify hash and compare-and-swap references. Define backup, rollback, cache invalidation and old-public-asset closure review. No apply command against unknown/production DB; no automatic public deletion. Require explicit credentialed isolated rehearsal and approved live cutover.

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

- [ ] `npm test --prefix backend -- src/services/attendanceMediaTransition.test.ts` passes: Inventory emits no secrets or photo URLs; ambiguous assets are held; replay and changed-row races do not overwrite; rollback and public-cache closure gate documented. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
