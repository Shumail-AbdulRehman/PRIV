# Spec 21 — Fail-closed active photo qualification

**Status:** Not started
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/verification-v2/launchQualification.ts`, `backend/src/services/verification-v2/launchQualification.test.ts`, `docs/implementation/PHOTO_QUALIFICATION.md`, `specs/inventory/21-photo-qualification.md`
**Reuses:** `backend/src/services/verification-v2/directPhoto.service.ts`, `backend/src/services/verification-v2/cleanlinessRelease.ts`

## Goal

Fail-closed active photo qualification in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Bind qualification record to active adapter/rubric/model/dataset digest. No unqualified auto-approval or fixture/redaction promises. Document occupant/reflection hold/reject behavior with representative consented data; missing empirical record remains a release gate. Integrate guard through explicit ownership handoff if active service needs edits.

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

- [ ] `npm test --prefix backend -- src/services/verification-v2/launchQualification.test.ts` passes: Missing/mismatched qualification disables automatic approval; provider outage is unavailable not dirty; representative live dataset result required. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
