# Buffered photo flow — 2026-10-12

This is the current flow for new staff photo uploads, requested by the user. It supersedes the earlier quality → privacy → identity/coverage → cleanliness job chain for new captures. Existing queued legacy jobs and existing restricted evidence retain their earlier processing/access rules; historical records are not rewritten.

## Behavior

1. The mobile app checks basic capture quality, resizes the image and saves encrypted local evidence.
2. The API retains assignment, account, QR/session, capture-time, generation, hash and deadline validation. It acknowledges an encrypted, durable temporary server copy, not a Cloudinary upload.
3. A single `PHOTO` job reads the temporary image and makes one Clef request for visible cleanliness and screen recapture. No privacy, fixture category, unique fixture identity, label, reference-image or spatial-identity assessment runs in this path. Snapshotted required views/surfaces still guide capture and cleanliness assessment. The manifest disables spatial capture.
4. Dirty results request cleaning. Photographed screens and basic quality failures request a corrected photo. These rejected images are never sent to Cloudinary. Their decision, hash and audit metadata remain, then temporary bytes are removed after publication.
5. Clean or review-only results upload authenticated original/review objects to Cloudinary. The protected asset identifiers and cloud receipt in immutable job history are saved before the final result is published. Temporary bytes are then deleted. Unsigned/public URLs are not persisted or exposed.
6. Provider/storage failures retry without claiming dirt or success. A completed AI assessment is persisted before storage; storage retries reuse it. Phone bytes remain until confirmed cloud storage or a rejected terminal result.

New pending asset reservations use the existing `privacyState` string field as a compatibility storage marker: `BUFFERED`, then `DISCARDED` or `NOT_REQUIRED`. `NOT_REQUIRED` explicitly means the requested privacy assessment was not performed; it does not mean a privacy check passed. Asset delivery stays authenticated, and evidence identity remains immutable. Legacy `SAFE`, `HOLD` and `PENDING` access rules remain intact. No database migration is needed.

Clean results still obey the existing calibrated automatic-acceptance release gate. Changing this pipeline invalidates earlier release configurations. Without a qualifying release, clean predictions go to review rather than silently granting verified completion. Clear dirty predictions can request cleaning with the configured confidence threshold (screening threshold when automatic-clean calibration is absent); unassessable surfaces are never labelled dirty. Staff submission and final verification remain separate.

## Implementation

- API: `bufferedEvidence.service.ts`, called from the existing multipart capture endpoint.
- Temporary storage: `evidenceBuffer.ts`, AES-256-GCM, tenant/attempt-associated encryption, private permissions, fsync and atomic creation. Identical retries reuse the capture; different bytes are rejected.
- Assessment: `bufferedPhoto.provider.ts`, one bounded provider call, strict response validation.
- Processing: `bufferedPipeline.service.ts`, durable assessment, conditional uploads, leased publication, existing decision/finalization workflow and cleanup.
- Recovery: `evidenceBufferCleanup.ts`, cleanup of completed reservations and orphan/exhausted files after 24 hours. Active/retry jobs are never aged out. The worker runs cleanup on startup and every minute.
- Phone: explicit temporary/cloud receipt handling in `api.ts` and `sync.ts`, reason-specific cleaning/retake instructions, and existing persisted task/session recovery.

## Runtime requirements

API and worker must share the same persistent `EVIDENCE_BUFFER_DIR` (default `backend/var/evidence-buffer` when started from backend) and encryption key. Set `EVIDENCE_BUFFER_KEY` for deployment; otherwise a domain-separated key is derived from `ACCESS_TOKEN_SECRET`. Keep the key stable until outstanding buffers are drained. Multiple hosts/containers require a shared persistent volume. The directory is excluded from Git. Low server disk space rejects new staging while the phone retains its copy.

The worker remains the background processor and restart/retry mechanism, with one job for each new photo rather than four processing stages. It does not need separate hosting. Local API and worker were rebuilt/restarted; the worker health check passed. Mobile changes require the updated app bundle.

## Verification and latency

- Unit tests exercise encryption, tenant binding, atomic same-photo retries, blocked buffered/discarded viewing, absent privacy/identity questions, dirty/screen rejection, deferred upload order, service failures, lease loss and assessment reuse after storage failure.
- Native queue tests verify local bytes survive a temporary receipt and service failure, then release only after cloud confirmation or rejected terminal results.
- The isolated PostgreSQL test creates a new local database and exercises staging, job publication, dirty surface instructions, no Cloudinary calls for rejected results, clean/review storage, manager access/tenant denial, audited acceptance/manual completion and persisted retry results.
- Legacy lifecycle regression passed, including completion, epochs, presence, held media, waivers and deadline protections.

Controlled integration results were approximately 0.2–0.5 seconds per photo, with local PostgreSQL and fake AI/storage. These measure implementation overhead and exclude phone transmission, actual AI calls, Cloudinary network latency, real queue wait and polling. They are not a real end-to-end latency claim. The earlier 10–20-second target remains unverified; a physical-phone test against real providers is required.

```bash
npm --prefix backend test
npm --prefix frontend-mobile test
npm --prefix frontend run lint
VERIFICATION_TEST_DATABASE_URL=postgresql://verification@127.0.0.1:54329/priv_verification_test_manager \
  npm --prefix backend run test:verification:buffered
```

Final checks: **431 backend tests, 75 mobile tests and 38 web tests passed**; TypeScript checks and web lint passed. Both new isolated buffered-flow and legacy lifecycle integrations passed. The local worker was restarted and reported healthy. Correction text supports English/Urdu, including named dirty surfaces. Real-camera/speech behavior remains untested. Subsequent real-provider HTTP tests passed with synthetic images: about 3 seconds for rejected dirty evidence and 4.5–6.6 seconds for reviewable evidence, using local PostgreSQL. See `PHOTO_FLOW_E2E_RESULTS.md` for exact scope, measurements and the context/rework fixes. Physical-phone latency remains unmeasured.
