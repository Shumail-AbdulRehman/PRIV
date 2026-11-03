# Spec 20 — Photo receipt and replacement contract

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #49
**Owns:** `backend/src/services/verification-v2/launchPhotoPolicy.ts`, `backend/src/services/verification-v2/launchPhotoPolicy.test.ts`, `specs/inventory/20-photo-submission-contract.md`, `backend/src/services/verification-v2/captureSession.service.ts`, `backend/src/services/verification-v2/captureSession.security.test.ts`, `backend/src/services/verification-v2/sequentialCapture.service.ts`, `docs/implementation/PHOTO_CONTRACT.md`
**Reuses:** `backend/src/services/verification-v2/sequentialPolicy.ts`

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

- [x] `npm test --prefix backend -- src/services/verification-v2/launchPhotoPolicy.test.ts` passes: Mixed waived/review-required submission allowed only when all remaining required receipts exist; stale/submitted success/cross-assignment replacement denied. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed49, branched from16/PR48 after verified1297-test checkpoint. Existing waiver, immutable attempt/generation, retake/rework and same-capture paths inspected. Expanded scoped ownership before wiring: submission receipts, capture/rework allocation and sequential activation; preserve manager retirement/current assignment/deadline checks.

- **2026-10-20** — Completed41 policy tests plus wired submission/capture/sequential/controller regressions; whole backend1340 tests/89 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL. Backend TypeScript/build and strict standalone SQL-proof tsc pass. Real isolated PostgreSQL proof verifies new immutable failed-view slot generation, exact allocation retry, unchanged old attempt/slot, proven waiver + required review receipt submission without verification credit, and submitted/missing-view denial. Initial synthetic task fixture fixed to include existing snapshot fields; full-suite controller regression restored early MISSING_EVIDENCE guard. Log retains non-failing existing pg concurrent-query deprecation notice; no pg upgrade/migration performed. Logs `/tmp/hygene-spec20-tests.log`, `/tmp/hygene-spec20-build.log`, `/tmp/hygene-spec20-integration.log`. No real photo/provider/production mutation. Validator zero errors/four existing justified warnings. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/49; draft PR https://github.com/Shumail-AbdulRehman/PRIV/pull/50; implementation7414539. Continue21 without routine stop.

- **2026-10-21** — Serialized common identity adapter/staff submission completion ownership transferred to26; existing contracts preserved.

- **2026-10-21** — Serialized affected unit-fixture ownership transferred to26 to preserve lower-level contracts under new explicit account-policy seams.

- **2026-10-21** — Isolated proof fixture ownership transferred to26 for explicit synthetic billing entitlement required by integrated14 policy;20 receipt/replacement assertions unchanged.
