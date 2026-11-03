# Spec 39 — Launch operations and active CI proof

**Status:** Done
**Depends on:** Spec 03, Spec 26
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #77
**Owns:** `backend/tests/managerOperations.integration.ts`, `backend/src/services/releaseReadiness.ts`, `backend/scripts/launchCiDatabase.ts`, `docs/implementation/followups/BOUNDED_LISTS_SPEC.md`, `.github/workflows/ci.yml`, `docs/implementation/RELEASE_RUNBOOK.md`, `backend/src/services/releaseReadiness.test.ts`, `specs/inventory/39-release-operations.md`
**Reuses:** `frontend-mobile/scripts/validate-device-config.mjs`, `backend/src/services/verification-v2/readiness.service.ts`

## Goal

Launch operations and active CI proof in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Preserve21 `launchQualification` guards in direct and buffered PHOTO paths: active adapter lacks privacy/identity qualification, so new processing is unavailable before provider/storage; completed result reconciliation remains available. Do not bypass with deployment flags, synthetic data or historical release records. Real representative consented privacy qualification remains an external release gate.


Consume `backend/tests/launchPhoto.integration.ts` and `docs/implementation/PHOTO_CONTRACT.md` for real isolated failed-view generation and legacy waiver receipt proof; no live photo/provider qualification implied.


Consume `backend/tests/ownerIdentity.integration.ts`, `docs/implementation/OWNER_IDENTITY.md`, `docs/implementation/research/owner-delivery.md` and `backend/src/services/ownerIdentityDelivery.service.ts` for local lifecycle proof and actual sender/domain/links/legacy identity-bootstrap qualification.


Consume `backend/tests/platformSupport.integration.ts` and `docs/implementation/SUPPORT_OPERATIONS.md` for isolated queue race/redaction proof and actual verified support channel qualification.


Consume `backend/tests/attendanceAnnotation.integration.ts` for guarded local annotation retry/authorization/immutability/audit rollback proof.


Consume `backend/tests/companySettings.integration.ts` for isolated owner settings race/audit rollback and tenant preservation proof.


Consume `backend/tests/platformCompany.integration.ts` to reproduce isolated company status race, audit rollback and policy proof; never run against production.


Consume docs/implementation/BILLING.md for qualified merchant/catalog/sandbox and ambiguous provider-request recovery requirements; never enable commercial flows with fixture values.

Consume docs/implementation/OPERATOR_IDENTITY.md for real IdP/MFA qualification; missing provider configuration keeps operator access disabled.

Activate relevant current tests/builds, retain existing CI dirty changes. Prove config/TLS/secret/job owner, migration backup/rollback/restore, bounded operational queries, Paddle config and Android signed distribution boundaries. Instrument redacted readiness; no fake provider health. Evaluate existing list bounds; add dedicated follow-up spec for confirmed query gaps, not silent broad changes. Never deploy or modify production.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Composition evidence consumed

Review26 audience/action/job integration and21 qualification denials at these concrete existing entry points when qualifying release operations; retain their focused and isolated SQL reproduction evidence: `backend/src/controllers/location.controller.ts`, `backend/src/controllers/taskInstance.controller.ts`, `backend/src/cron/attendanceCron.ts`, `backend/src/cron/attendanceStatusCron.ts`, `backend/src/cron/taskStatusCron.ts`, `backend/src/routes/area.route.ts`, `backend/src/routes/assignment.route.ts`, `backend/src/routes/taskTemplate.route.ts`, `backend/src/routes/verification.route.ts`, `backend/src/routes/verificationException.route.ts`, `backend/src/services/launchJobs.service.ts`, `backend/src/services/staff-notifications/reminders.service.ts`, `backend/src/services/staff-notifications/worker.service.ts`, `backend/src/services/verification-v2/authorization.service.ts`, `backend/src/services/verification-v2/completion.service.ts`, `backend/src/services/verification-v2/deadline.service.ts`, `backend/src/services/verification-v2/inventorySnapshot.service.ts`, `backend/src/services/verification-v2/jobQueue.service.ts`, `backend/src/services/verification-v2/pipeline.service.ts`, `backend/src/services/verification-v2/staffSubmission.service.ts`, `backend/tests/launchComposition.integration.ts`, `docs/implementation/API_COMPOSITION.md`, `backend/src/services/verification-v2/directPhoto.service.ts`, `backend/src/services/verification-v2/bufferedPipeline.service.ts`.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [x] `npm test --prefix backend -- src/services/releaseReadiness.test.ts` passes: CI invokes active direct-photo/review/mobile regressions; production config fails closed; restore/provider/device/old-media/fit gates explicit until evidence. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-21** — Issue77 claimed before edits; actual03/26 commits9ed82d6/7368750 verified as current Git ancestors. Branch implementation/spec-39-release-operations based38/44df792 (draftPR76), no DAG edge introduced. DraftPR78 https://github.com/Shumail-AbdulRehman/PRIV/pull/78. User authorizes38/39 only, no40/41. Explicit scoped runner/readiness/follow-up/manager-fixture ownership added before changes.
- **2026-10-21** — Implemented current CI regression group and owned disposable SQL runner, redacted release observations and12external human-evidence gates; real photo processing remains unavailable. Preserved original three-line CI performance step only in working tree, staged intended workflow blob without unrelated edits. Seven other original dirty tracked files byte-preserved. Proposed bounded-list follow-up documents actual unbounded master lists and inquiry lookup risk without a source rewrite.
- **2026-10-21** — Hosted prior run39619823659 failed legacy lifecycle receipt/verification expectation; replaced obsolete lifecycle/buffered/photo-HTTP entries with current launch contract proofs and qualification regressions. First39 hosted run39625860958 passed backend units/web/native but manager SQL stopped401 at an old typeless/no-expiry JWT fixture. fbd5ca7 updates only that retained test's token generator/mirrored-entitlement fixture and adds legacy-token denial; no server auth/account-policy relaxation. Hosted rerun underway; do not claim SQL/CI completion before actual results.
- **2026-10-21** —13release-readiness focused tests;103focused active/backend tests/6files. Full local backend1439passed/7explicit SQL skips (94passed files/1skipped; includes4pre-existing untracked performance tests, excluded from commits). Clean hosted code run39626388658 backend1435passed/7SQL skips, web57Node+215React and native101 all pass. Local native101/typecheck/Expo web build and backend TypeScript/build pass. All10actual contract workflows plus7SQL invariants pass via owned fresh unprivileged PostgreSQL16.15 on127.0.0.1:56441; retained manager query/HTTP/paging integration also passes with real typed tokens. SQL runner drops its generated child. No app/production DB/provider/mail/IdP calls. Hosted run39626388658 passed all4jobs including all3container builds without push. Final38 typography-only follow-up66723be integrated by normal dependency-branch merge; frontend rebuild/8renders pass. No PR merge/image push/deploy.
- **2026-10-21** — Spec validation42specs/0errors/8existing documented warnings. Real TLS/secret ownership/backup-restore/merchant-delivery/legal/IdP-MFA/signed-device/old-media/photo privacy/customer-fit/query-scale gates remain REQUIRES_EVIDENCE and releaseAllowed=false. Code/CI qualification does not satisfy those external facts.39 implementation complete;40/41 not started. Final docs publication follows.
- **2026-10-21** — fbd5ca7 hosted run39626388658 concluded success for backend/frontend/mobile-web/docker-builds; current10SQL proofs+7invariants passed on hosted Postgres independently of local proof. Evidence https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/39626388658. Metadata-only final publication follows; STOP.
