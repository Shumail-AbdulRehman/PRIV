# Spec 21 — Fail-closed active photo qualification

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #51
**Owns:** `backend/src/services/verification-v2/launchQualification.ts`, `backend/src/services/verification-v2/launchQualification.test.ts`, `docs/implementation/PHOTO_QUALIFICATION.md`, `specs/inventory/21-photo-qualification.md`, `backend/src/services/verification-v2/directPhoto.service.ts`, `backend/src/services/verification-v2/directPhoto.service.test.ts`, `backend/src/services/verification-v2/bufferedPipeline.service.ts`, `backend/src/services/verification-v2/bufferedPipeline.service.test.ts`
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

- [x] `npm test --prefix backend -- src/services/verification-v2/launchQualification.test.ts` passes: Missing/mismatched qualification disables automatic approval; provider outage is unavailable not dirty; representative live dataset result required. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue51 on implementation/spec-21-photo-qualification (base20/PR50 at29fc1d0). Serialized ownership amendment for active direct and dormant buffered PHOTO services/tests; no other spec owns these existing paths. Active adapter explicitly excludes privacy and exact fixture identity. D08/D11 prohibit invented privacy thresholds; no representative consented dataset or approved privacy qualification exists. Implement an unavailable processing boundary before provider/storage, preserve completed-result reconciliation and existing receipt/retry/authorization contracts; no invented redaction or live qualification. Existing release reader already pins the complete pipeline/rubric/model/dataset evidence and independent review; reuse it rather than invent a second release system.

- **2026-10-20** — Complete safe-disabled implementation: qualification status reuses checksum-pinned existing measured release/configuration reader, reports active digest and denies absent active privacy/identity capabilities even with historical qualification. New direct and buffered PHOTO work returns sanitized503 before AI/storage/cache replay; direct own-token retry release and immutable completed-result reconciliation preserved. No invented privacy thresholds or redaction.44 focused tests; whole backend1360 tests/90 files/zero skips on explicit isolated SQL target; backend tsc and build pass. Only new gate/test, four explicitly owned active seams, docs/inventory/consumer specs and tracker changed. No schema/dependency/provider/production changes. Real consented representative dataset/independent approved privacy policy remain external release blockers; synthetic tests are not empirical approval. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/51 (initial label request failed because spec label absent; issue created/assigned without inventing project labels). Logs /tmp/hygene-spec21-{focused,tests,build}.log. Next26 eligible; continue automatically.

- Published spec21 implementation8d32c4f in stacked draft PR52: https://github.com/Shumail-AbdulRehman/PRIV/pull/52 (base20/PR50); issue51 remains open for review.
