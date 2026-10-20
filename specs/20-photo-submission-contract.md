# Spec 20 — Photo receipt and replacement contract

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/verification-v2/launchPhotoPolicy.ts`, `backend/src/services/verification-v2/launchPhotoPolicy.test.ts`, `specs/inventory/20-photo-submission-contract.md`
**Reuses:** `backend/src/services/verification-v2/staffSubmission.service.ts`, `backend/src/services/verification-v2/sequentialPolicy.ts`

## Goal

Photo receipt and replacement contract in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Reconcile authorized legacy waiver receipt without allowing missing mandatory views. Define server-authorized failed-view replacement on current assignment under existing deadlines and new immutable generation; no retired manager extensions/retakes. Wire into existing capture services with explicit ownership amendment for confirmed changes; preserve same-capture result reconciliation.

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

- [ ] `npm test --prefix backend -- src/services/verification-v2/launchPhotoPolicy.test.ts` passes: Mixed waived/review-required submission allowed only when all remaining required receipts exist; stale/submitted success/cross-assignment replacement denied. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
