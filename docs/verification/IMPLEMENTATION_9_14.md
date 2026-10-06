# Inventory verification implementation handoff: steps 9–14

Date: 2026-10-06. Repository: `/home/shumail/bk-Priv/PRIV`, branch `main`.

The full implementation plan and the steps 1–8 implementation were audited before changes. The starting tree already contained substantial uncommitted foundations and frontend/mobile drafts. Those were preserved. Initial checks passed: 100 backend tests and backend build, 15 frontend tests and frontend TypeScript. Four agents worked in disjoint capture, evaluator, lifecycle/decisions, and manager UI scopes.

This session implements manager setup and the capture/verification/completion backend. It does **not** establish the held-out evaluation gates required to declare steps 12–13 fully complete. No consented dataset exists in the repository. `autoPassAllowed()` remains unconditionally false. A valid CLEAN result therefore requires review; tests exercise verified finalization with deliberately trusted database fixtures, not a production auto-pass switch.

## Checklist comparison

| Step | Implemented code and domain behavior | Remaining evidence/limits |
| --- | --- | --- |
| 9 | Location Areas tab, setup/detail/inventory/tasks/QR/labels/history/optional standards, editable room presets/count expansion, stable fixture numbering, single-area ALL/SUBSET wizard and mandatory overrides, inventory conflict handling, legacy mapping preview/setup, task list area labels, query invalidation, existing safe assignment retry. New v2 creation uses JSON and requires no reference photos or reference allowances. | Browser interaction and responsive visual review are not established by unit tests. Exception Inbox/detail/history UI remains step 17. |
| 10 | Fresh task/area/staff/assignment/epoch/device/QR-bound sessions, deterministic presence checks, context/requirement slots and nonce commitments, idempotent reservation/upload, retained Cloudinary assets, resume/renew, generation-specific retakes, explicit takeover, rate limits and structured errors. Successful task-level evidence survives renewal and handover. | Client GPS retry, camera enforcement and physical-device behavior belong to steps 15–16. Device IDs and reported GPS/time are plausibility signals, not attestation. |
| 11 | Atomic v2 start without QR; task/assignment locks; lifecycle revocation for reassignment, staff/location/company changes, cancellation and QR rotation; pending old results cannot silently credit; original deadlines retained, bounded extension, capture/upload/processing separated; v2 cron leaves accepted jobs/current assignments eligible to finalize. | Production migration application and operational cutover remain deferred. |
| 12 | Safe sniff/decode/orientation/EXIF-free derivatives, transport/pixel limits, versioned quality, dedicated privacy hold, SHA/normalized/DCT hashes including mirror/crop, tenant exact-reuse serialization, candidate search, independent context/fixture/view/label checks, ambiguous identity recapture. Similarity alone never means fraud. Optional standards are privacy screened and have bounded authorized retry. | Consented fixture dataset and threshold calibration are missing. Live protected Cloudinary delivery still needs a designated nonproduction account probe. |
| 13 | Separate typed coverage and reference-free per-surface cleanliness contracts; OpenAI/Gemini structured adapters; strict schema/aggregate validation; snapshotted rubric surfaces/criteria; provider/model/request/prompt/rubric/version/usage/latency metadata; unknown costs stay null; durable bounded retries and successful-stage reuse; no fabricated clean/dirty verdict on malformed/refused/outage responses; offline benchmark report harness. | Held-out gates have **not** been evaluated. No live provider accuracy, latency or cost claims. Auto-pass is disabled for all fixtures. |
| 14 | Guarded per-view state updates, targeted rework, immutable passed progress, nonempty mandatory completion, atomic exactly-once task/assignment finalization, verified versus manual outcomes, manager actions and history, waivers distinct from maintenance/resolution, deduplicated task cases/issues/events, counters, reminders, scoped read receipts, deadline/service/privacy/presence exceptions, linked follow-up resolution for concerns discovered after completion. | Manager exception UI remains deferred. Final validation is recorded below. |

## Foundation repairs needed by this work

- Future task snapshots now include actual rubric criteria/outcomes and `surfacesByView`. Older immutable snapshots without those fields are preserved and require review; they are never rewritten into passes.
- The worker now executes the separated pipeline rather than quality alone. Even poor-quality decodable evidence reaches privacy screening before any routine gallery delivery.
- Storage registration rechecks ownership and generation after the remote upload. Bytes authorized before a handover/storage race are retained review-only, rather than becoming orphaned or automatically credited. Review-only classifications survive the immediate ingestion response.
- Finalization remains the sole completion authority. The legacy assignment completion helper cannot independently complete an unresolved v2 assignment. Superseded provider failures remain history without blocking replacement generations.
- The optional standard-photo privacy-pending gap is repaired without inventing task evidence: retained standards use their own bounded request-time safety check and audit history.

## Migrations and schema assumptions

Apply migrations in repository order only after deployment authorization and backup/dry run. This session applied them **only to fresh isolated local test databases**.

- Preserve existing `202610040001_inventory_verification`, `202610040002_verification_foundation_constraints`, and `202610040003_verification_history_bindings` foundations.
- `202610060001_verification_lifecycle` adds transactional authority revocation and epoch/audit triggers on existing task, assignment, staff, location and company mutations. Passed requirements, stored evidence and original `shiftEnd` remain untouched. Epoch numbers are monotonic authority versions; clients must not assume an increment is exactly one across a compound handover.
- `202610060002_verification_followup` adds a nullable, retained `VerificationDecision.followUpTaskInstanceId` link and decision-specific scope/identity binding guards. It permits a completed-task concern to be resolved using a different completed same-area/location/company v2 task, started after the concern, with fresh SAFE accepted replacement evidence for the affected fixture/view or contributing context. Waived evidence, other tenants/areas, old tasks and held/reused bytes cannot satisfy it. No original completion/assignment/requirement is rewritten.
- Historical tasks/templates retain v1 and legacy readers/writes during drain. Explicit future mapping enables v2 templates; no global cutover or automatic legacy conversion was performed.
- Optional standard privacy needs no schema extension: scoped immutable audit records bound four checks and a 60-second in-flight lease. SAFE results are reused; failure remains PENDING; HOLD never becomes SAFE through an ordinary retry.

## Backend contracts for the next session

Routes are mounted under `/api`; verification routes precede the generic task-instance router.

- `GET /task-instance/:taskId/verification`: authoritative immutable names/views/instructions and server progress, deadlines, pending jobs, safe case summary, context slots, allowed actions and optional five-minute deadline warning.
- `GET /task-instance/staff/me/verification-work`: cursor-paginated current resumable work, including previous-day/overnight tasks.
- `POST /task-instance/:taskId/capture-sessions`; `POST /capture-session/:id/resume`, `/renew`, `/retake-slots`.
- `POST /capture-session/:id/attempts/manifest`; multipart `POST /capture-session/:id/attempts`; `GET /verification-attempt/:id` with safe semantic stage results and catalog retry instructions.
- `POST /task-instance/:taskId/verification-issues`; `GET /verification-exceptions`, `GET /verification-exceptions/:id`; `POST /verification-exceptions/:id/actions` and `/read`. Cases, attempts, decisions and events have scoped pagination. This is backend/API only.
- Existing area/inventory/QR/labels/standards/template-mapping APIs remain. Optional standards POST also accepts `{standardId}` without a photo to retry a pending safety check.
- `GET /evidence/:assetId/content?variant=review|original` reauthorizes each access. Original requires ADMIN; neither original nor review is served before SAFE privacy status. No signed/public URLs are exposed.

Session creation/renewal requires `requestId`, signed `areaQr`, `deviceId`, `clientBootId`, fresh location sample and `clientTime`; explicit cross-device takeover uses `takeover:true`. Capture metadata requires **nine multipart fields**: `clientCaptureId`, `slotId`, `nonce`, `sha256`, `claimedCapturedAt`, `elapsedMs`, `bootId`, `deviceId`, plus the image field `photo` (eight metadata fields and one file). Repeating the same ID/hash is idempotent; changing bytes/metadata is a conflict. A new photo uses a new slot, never a recycled consumed nonce.

Retakes use `{deviceId, requirements:[{requirementId,expectedGeneration}], contexts:[{contextKey,expectedGeneration}]}`; context keys are `ENTRANCE` and `LAYOUT`. A repeated successful allocation returns the same slot. Renewal allocates only unresolved requirements, advances their generations and leaves already received processing/passed evidence intact. Expired/revoked/rebooted responses expose no usable capture nonces. QR-rotated queued captures are retained review-only; assignment/security revocation does not authorize a former worker to upload new bytes. An upload already in flight before reassignment retains its bytes review-only.

Manager decisions require request ID, expected case version and a reviewed reason/note. `ACCEPT_CONTEXT` is an explicit session-bound presence/context override; evidence acceptance/waiver alone cannot provide it. `EXTEND_WINDOW` accepts optional bounded `extensionMinutes`, once per task, at most 120 minutes beyond original shift end. Explicit manual acceptance, waiver or context override permanently disqualifies VERIFIED_COMPLETE. Resolving a service/integrity issue is separate from accepting evidence or waiving a requirement. Held originals remain restricted even after safe replacement acceptance.

Late optional cleanliness outcomes retain attempt history without ordinary stale-assignment alert spam or completed-task mutations. A serious concern discovered after completion remains linked to its original case. Its detail DTO returns `requiresFollowUp:true`; only `RESOLVE_ISSUE` is allowed, with `issueId`, `followUpTaskInstanceId`, and optionally the selected replacement `evidenceAttemptId`. The service and database validate scope, freshness, accepted fixture/view/context evidence and privacy. The original completion outcome, timing, requirements, assignments and held originals remain unchanged; the resolution gets separate immutable decision, audit and event records.

Important services: `captureSession`, `presence`, `evidence`, `standardPrivacy`, `quality`, `coverage`, `duplicate`, `cleanliness`, `provider`, `pipeline`, `jobQueue`, `completion`, `exception`, `deadline`, and shared `inventorySnapshot`, all under `backend/src/services/verification-v2/`. Worker entry: `backend/src/workers/verificationWorker.ts`.

## Step 15 must know

- Server state is authoritative. Persist task/session/slot/generation/capture IDs, content hash, boot/time anchor and device ID locally; reconcile through manifest/resume/attempt APIs. React state must not mark evidence passed or recreate successful slots.
- Preserve capture bytes immediately, before advancement. Retry the same ID/hash after lost responses. A changed photo needs server-allocated authority after reconnecting; do not retry changed bytes under the original ID.
- Distinguish saved, upload accepted, quality/privacy/coverage/cleanliness checks, rework and server completion. CANNOT_ASSESS/wrong view means recapture; DIRTY/NEEDS_ATTENTION means cleaning; service failure consumes no staff cleaning allowance.
- Fresh QR/GPS is required for creation/renewal/takeover. Uncertain indoor presence is review-required; definitely outside cannot collect as verified. Passed evidence from old valid sessions survives expiry/handover and remains attributed to its worker.
- Carry location timezone from DTOs, not a hardcoded Karachi assumption. Keep original deadline separate from upload/processing times.
- Existing `frontend-mobile/src/verification/`, native module/config/dependency/auth drafts were present at session start and preserved. Their TypeScript passing does **not** prove encrypted persistence, forced-kill recovery, native builds or device capture reliability. Audit them rather than assuming step 15 is complete.
- Existing `frontend/src/pages/Exceptions/` files are API/query/type drafts; no Exception Inbox UI was built or routed here.

## Validation and remaining gates

Final checks passed:

- Backend: **190 tests in 26 files**, Prisma generation and TypeScript build.
- Frontend: **28 tests**, full lint, TypeScript and Vite production build.
- Existing mobile project: TypeScript; no physical-device/native reliability claim.
- Fresh PostgreSQL main integration suite: PASS, database `priv_verification_test_1791288750419_7554` retained.
- Fresh PostgreSQL lifecycle suite, including both new migrations and completed-task follow-up guards: PASS, database `priv_verification_test_lifecycle_1791288758780` retained.
- `verification:benchmark`: DATASET_UNAVAILABLE, autoPassEnabled false, targetMet false.
- `git diff --check`: PASS.

Database suites cover legacy migration/backfill and scheduler snapshots, same-area/version constraints, tenant/RBAC/inactive account access, concurrent sessions/manifests/uploads, changed bytes and nonce replay, renewal/generation security, stored-response loss, worker leases/retries, reassignment during storage, stale results, QR rotation during AI and queued old-QR evidence, two-final-result races, exactly-once completion, accepted evidence retention, service failure versus cleaning/recapture counters, third-failure escalation and first-failure suppression, waiver/maintenance/presence/privacy distinctions, deadline/processing safety, optional pending safety stages versus cleanliness, read receipts, scoped cursors, bounded standard privacy checks, and safe follow-up resolution without historical mutation.

Important uncommitted work: the new `202610060001`/`202610060002` migrations; new capture/provider/pipeline/completion/exception/deadline/standardPrivacy services/routes/tests; parent assignment/start/cron/worker integration; future rubric snapshot repairs; frontend Area/wizard/location/query changes and new standards retry tests; this handoff and evaluator benchmark records. Prior schema/foundation migrations, deployment wiring and mobile/native drafts remain in the same dirty tree. Nothing is staged or committed.

The exact expanded output of `git status --short --untracked-files=all` is in [git-status-9-14.txt](git-status-9-14.txt); it includes existing work as well as this session's changes. The normal directory-collapsed status is also preserved there.

The two PostgreSQL suites restore repository migrations into new databases whose names start `priv_verification_test`. They refuse remote/non-test connection URLs and never reset/drop the supplied database. External providers and storage are mocked; synthetic images are deterministic test fixtures, not held-out evaluation data. Negative constraint assertions emit expected Prisma error logs. The pg adapter emits a concurrency deprecation warning; frontend build retains its large-chunk/plugin timing warnings.

The dedicated local PostgreSQL server was stopped cleanly after testing. Its retained data is `/tmp/hygeneops-verification-pg`; the extracted binary is `/tmp/hygeneops-pg-bin/usr/lib/postgresql/16/bin/pg_ctl`. Restart with `pg_ctl -D /tmp/hygeneops-verification-pg -l /tmp/hygeneops-verification-pg.log -o '-p 55439 -h 127.0.0.1 -k /tmp' start` using that absolute binary. The supplied test database is `priv_verification_test` on localhost:55439. These temporary paths may disappear when the environment resets.

Run:

```sh
npm --prefix backend test
npm --prefix backend run build
VERIFICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/priv_verification_test npm --prefix backend run test:verification:integration
VERIFICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/priv_verification_test npm --prefix backend run test:verification:lifecycle
npm --prefix backend run verification:benchmark
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
cd frontend-mobile
npx tsc --noEmit
```

`verification:benchmark` reports DATASET_UNAVAILABLE and no met target. Supply independently labelled, consented, room/fixture-separated development/held-out results per `evaluatorBenchmark.ts`; at least 100 DIRTY and 100 wrong/replayed held-out examples are required. No live Cloudinary/provider evaluation, physical device tests, production migrations, workflow cutover, deployment, automatic deletion or notification channel was introduced.

All work remains uncommitted: 41 tracked modified files, 103 untracked files, zero staged entries. The dirty tree includes both prior-session foundations/mobile drafts and this session's implementation; do not discard directories based on the aggregate diff. HEAD remains `d298e51` (`fixed an ts error`).
