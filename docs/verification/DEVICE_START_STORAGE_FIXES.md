# Device start and storage fixes — 2026-10-07

## Fixed in source

- Expo SQLite exposes its default Android database directory as an absolute filesystem path. The new File API requires a file URI. Normalize only the File existence check, keeping SQLite's own directory argument unchanged. Existing encrypted databases without their SecureStore key remain protected against replacement. The native queue harness now enforces the real File constructor's URI requirement.
- Starting cleaning uses the current task assignment and time window, without scanning a template QR. Room QR/GPS validation remains in the guided capture session. Concurrent start retries serialize on the task row and are idempotent.
- Remove old mobile QR-start and gallery-completion screens, backend reference-photo verification providers/writers, reference-photo schedule form fields and obsolete deployment configuration. Retired upload/scan URLs return authorized 410 responses before multipart parsing. The completion URL only reads an already finalized server outcome.
- Manager schedule QR panels show the actual area QR for mapped inventory schedules. Unmapped schedules display setup guidance instead of generating an obsolete template token.
- Scope task reads to the actor/company/location, deny staff access to another worker's feed, and allow authorized administrator task detail reads.
- Missing spatial columns return an actionable verification 503 and appear in capabilities/readiness diagnostics. This guard covers verification routes only, allowing other API routes to continue. Mobile errors distinguish network, server setup and secure photo storage failures; successful manifest reload clears a previous load error.
- Compose forwards the assisted spatial recapture flag with a false default. Automatic spatial acceptance and cleanliness passing remain disabled.

Historical schema, retained photos, authorized historical readers and explicit audited inventory mapping/repair tools remain. Authentication storage migration and Expo's legacy free-disk-space API are unrelated to the retired reference-photo workflow and remain necessary.

## Checks executed

- Backend: 256 tests across 32 files, plus the new HTTP readiness regression test; TypeScript/Prisma build passed.
- Mobile: 33 tests including strict file URI behavior, missing encryption key protection, queue resume and guided QR/spatial lifecycle; TypeScript passed.
- Manager web: 32 tests, lint and production build passed. Existing large-bundle warnings remain.
- Real PostgreSQL integration, lifecycle and compiled worker integration passed against newly created isolated local databases. These apply migrations only to their disposable fixtures. Tests cover concurrent start, retired writers, authorization, spatial bindings, replay, reassignment, privacy, targeted rework, completion races and worker health/shutdown.
- Android production Metro/Hermes export passed to `/tmp/hygene-fixed-android-bundle`. Device URL validation passed for `http://192.168.100.198:8080/api`.

## Initial configured backend blockers (before the approved update)

The read-only `npm --prefix backend run verification:doctor` found:

- Missing `VerificationAttempt.spatialEvidence`, `spatialDecision`, `spatialVersion`. The existing additive migration is `backend/prisma/migrations/202610070001_spatial_observations/migration.sql`. Applying it to the configured database requires the user's explicit approval under the no-production-migrations instruction. No configured database migration/reset was executed.
- Zero verification worker heartbeats within 30 seconds. The API development process does not start the separate verification worker. Once the database is ready, run the built worker with `npm --prefix backend run worker:verification`, and rerun the doctor.
- QR/slot and Cloudflare credentials are present; no values were printed. Clef candidate threshold/version are absent. Candidate calibration remains necessary; automatic cleanliness passing is false regardless of threshold settings.
- An earlier read-only count found 91 old pending tasks and one inventory task in progress. Old tasks need explicit manager inventory setup and replacement or individually audited repair. No mass conversion or rollout was performed.

The API at the configured LAN address responds; phone-to-server connectivity has not been established by this session.

## APK and device validation

The existing `frontend-mobile/build-output/HygeneOps-testing.apk` predates these fixes. It has no OTA update runtime; installing one newly built APK is necessary to receive the JavaScript fixes. No native module change was needed. This session validated the updated Android bundle but did not package a new APK or claim real Android/iOS/washroom validation. Retain application data when updating so queued work and encryption keys remain intact.

Real device launch, secure storage, area QR/GPS, capture/resume/upload, protected storage and live provider checks remain required. Spatial accuracy and held-out cleanliness calibration remain outstanding. No Step 20/21 cutover occurred.

## Approved development update

The user subsequently approved only the additive spatial migration to the current development database, worker startup, repeat checks and one updated Android APK.

- Verified all prior migration checksums and that exactly `202610070001_spatial_observations` was pending, then applied it with Prisma. The transaction pool on port 6543 stalled Prisma; the configured direct connection was unreachable over IPv6. A session-pool connection on port 5432 was verified against the original connection's database identity and migration history, then used only for the Prisma CLI child process. Existing environment files remain unchanged.
- Verified the successful migration record/checksum, all three nullable columns, validated constraint and enabled protection trigger. No other migration, reset, task conversion or legacy data removal ran.
- Started `hygeneops-verification-development.service` under the current user's systemd manager. It loads the backend's existing `.env` through the worker's dotenv startup, uses `/tmp/hygeneops-verification-development-health.json`, and restarts on failure. It is started for this development session; boot autostart was not enabled. Inspect with `systemctl --user is-active hygeneops-verification-development.service`; stop with `systemctl --user stop hygeneops-verification-development.service`.
- The readiness doctor reports schema ready and one healthy worker; its own compiled health check passes. QR/slot, coverage/privacy provider, protected-storage and Clef credentials are present without printing values. No live image/provider assessment was executed by these checks.
- Repeated checks passed: 257 backend tests (33 files), 33 mobile tests, 32 web tests, backend/mobile TypeScript, web lint/build, all three isolated PostgreSQL integration suites and phone API configuration validation.
- Android version code is increased to 2; the native version remains 2.0.0. Build isolation uses a dedicated GitHub build branch/worktree; the original dirty main workspace is retained. The build snapshot was checked against configured backend secrets before publication. Automatic spatial acceptance, assisted recapture and cleanliness passing remain disabled.

The ordinary Prisma schema diff lists custom SQL foreign keys/indexes absent from the Prisma model and the historical restrictive Paddle customer relation. It must not be applied: doing so would remove protections. A full read-only comparison with a fresh migration fixture checks columns, constraints, indexes, triggers and enum values instead.

That comparison verified all 454 application columns including types/defaults/nullability, all 27 triggers, and all 99 enum labels. Existing development-only details remain: an additional `ManagerLocation_locationId_key` unique constraint, a partial unique index enforcing one current `TaskAssignment` per task, and a different historical `Role` enum order. Column creation order also differs. No expected migration constraint/index was missing; these pre-existing differences were left untouched. The Prisma model diff contained no table, column or enum-label changes.
