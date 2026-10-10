# Device start and storage fixes — 2026-10-07

> Start-flow update (2026-10-08): the QR-free start described below is historical. Current source requires the persistent AREA QR at both start and finish, as separate server events. See [Area QR start and finish](AREA_QR_START_FINISH.md). The earlier APK does not include this update.

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

## Initial APK and device validation (before the updated build)

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

## Updated APK delivered

[GitHub build 37608197000](https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/37608197000) passed all three jobs at commit `61d37ba52c3391fc08c54434ef517d71f1cb816c`. Clean CI repeated mobile/Expo checks, backend contracts and isolated PostgreSQL tests, compiled Android native sources before packaging, then inspected and signed the standalone APK. An earlier prerequisite run caught one trailing whitespace line in a retained check log; it was fixed before native packaging began.

- Current artifact: `frontend-mobile/build-output/HygeneOps-testing.apk`, 67,958,330 bytes, package `com.hygeneops.staff`, native version `2.0.0`, Android version code `2`.
- SHA-256: `5906b5af6fe60c19f238d5ed9a7bcc1511065a724e20c52dbc62efe39eb8cda9`.
- The signing certificate matches the previous APK: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. The APK supports an in-place update without uninstalling/clearing application data. This remains a testing/debug-signed build.
- Downloaded bytes matched the CI checksum. Local APK manifest/DEX/native-module inspection, APK v2 signature verification and 16 KiB ZIP alignment passed again. All 27 ARM64 native libraries have compatible 16 KiB LOAD alignment. Both ARM phone ABIs, SQLCipher and optional ARCore are present.
- Local inspection confirmed the storage-fix messages, QR-free task-start message and expected LAN API URL in the actual packaged Hermes bundle. The updated artifact contains the reviewed source fixes.
- The previous artifact/metadata are retained in `frontend-mobile/build-output/previous-20261007/`. Current package/signature/alignment/update and read-only database comparison reports are beside the new APK.
- Final readiness check: database ready, one healthy worker, compiled health check passed. Automatic spatial acceptance, assisted recapture and cleanliness passing remain false. Candidate cleanliness thresholds remain unconfigured.

ADB lists no connected phone. No installation, launch, phone-to-backend upload, live provider/protected-storage inference or washroom calibration is claimed. Keep the API running at `http://192.168.100.198:8080/api` and connect the phone to its reachable network when validating the update. Historical tasks/data and pre-existing schema protections remain intact.

## Follow-up: remote database transaction latency

The user reported `P2028` while starting cleaning: authorization queries exceeded Prisma's default five-second interactive transaction timeout. Earlier start validation used a fast local database and did not exercise this latency.

- Reproduced the original expiry using an isolated six-second PostgreSQL delay during task start. Set shared Prisma defaults to a bounded 30-second transaction timeout and 10-second acquisition wait, matching the existing inventory-creation budget. This also covers capture-session and verification operations that previously inherited the five-second default. Transactions, row locks, authorization and completion gates remain intact.
- Added actual PostgreSQL regressions for six-second concurrent task start and six-second concurrent capture-session creation. Both pass with exactly one start/session recorded. An injected assignment-write failure rolls back task status, start timestamp, row version and assignment state together.
- Repeated all 257 backend unit tests, backend build, lifecycle and main PostgreSQL integration tests, and compiled worker checks. No mobile code or database schema/data changes were required.
- A read-only transaction on the configured development database waited six seconds, then successfully queried staff and committed in 8,878 ms; zero rows were modified.
- Restarted the development worker to load the new shared Prisma defaults. It runs under the same user service. The delivered Android APK remains current and needs no rebuild for this backend-only fix.

The 30-second limit remains finite; this change does not promise availability during database outages. Existing historical tasks still require inventory setup/explicit repair and were not converted.

## Follow-up: newly created task missing its inventory snapshot

The user's task `8564879` had verification version 1 and no area snapshot, although schedule `174` was already configured as version 2, READY, with area `5` and inventory version `1`. The schedule was created at 11:35:58 UTC and updated at 11:36:04; the task was inserted at 11:36:51. The earlier message incorrectly asserted that every missing snapshot was historical.

- Used the existing audited single-task repair utility for this exact development task after checking its identity, mapped schedule, unstarted/unexpired state and absence of any evidence. No bulk repair or legacy data removal occurred.
- The task remains PENDING with its current assignment intact and now contains four inventory items and five mandatory views. An authenticated staff manifest request returned 200 and confirmed it was within its start window. The agent did not start cleaning on the staff member's behalf.
- Changed the generic setup error to accurately describe a missing snapshot without assuming when the task was created. No APK change is required; refresh the task feed before retrying Start cleaning.
- Current source and compiled local cron generators only create version 2 tasks. The API process was confirmed to run from the current backend directory. No public database task-insert function or cron schema was found. Another old writer is a hypothesis, not a confirmed diagnosis; the user was asked about another hosted/Docker backend sharing this database. Local Docker inspection was denied by socket permissions. No remote/production service was changed.

## Follow-up: incorrect native version header blocked photo verification

The photo screen's “Update the Hygene Ops Staff app” message came from the native compatibility gate. Axios had a root default version header of `0.0.0`; configuring version `2.0.0` only changed its common headers, so the root default won. Multipart fetch used the correct version already.

- Updated both defaults and the request interceptor to send the configured native version, including retried requests with stale headers. Missing native version still reports `0.0.0` and remains blocked. No compatibility or completion gate was weakened.
- A regression test reproduced headers `[0.0.0, 0.0.0, 2.0.0]` before the fix and verifies all three request paths send `2.0.0` afterward. All 34 mobile tests and mobile typechecking pass.
- A live, read-only HTTP regression using the actual mobile Axios client confirmed unknown version receives 426, while version 2.0.0 passes the gate and receives the expected 404 for a nonexistent session. No real session was created.
- **Latest corrected APK:** `frontend-mobile/build-output/HygeneOps-header-fixed.apk`, 70,313,397 bytes, SHA-256 `aa196c28882b57dc94dc05adce7e484a063f405980fb06c8500f4c25d7bb431e`. Install this file instead of the earlier `HygeneOps-testing.apk`.
- Reused the verified CI native APK, generated the corrected production Expo bundle with the pinned Hermes compiler, replaced its JavaScript bytecode, aligned and signed the result. This was a bundle repackaging, not a fresh native compilation. All native libraries, DEX, resources and manifest entries are byte-identical to the CI build; the only changed existing ZIP entry is `assets/index.android.bundle`, with three new signing metadata entries. Native version remains 2.0.0 / version code 2.
- APK inspection, signature verification, matching previous signing certificate and 16 KiB ZIP alignment passed. The same certificate supports an in-place update without clearing local photos. Inspection and provenance reports are in `frontend-mobile/build-output/header-fix-reports/`.

No phone is connected, so installation and physical-device verification remain untested. Automatic spatial acceptance and cleanliness passing remain disabled. The current LAN backend must remain reachable from the phone.

## Follow-up: old backend shared the development database, slow start, and photo-save SQLCipher error

The user confirmed another backend runs an old app version against the same Supabase database while the manager web app uses localhost. Task `8568169` (`killme`) was inserted as version 1 with no area/items at 12:11:21 UTC, after schedule `175` was already version 2 / READY / area 5. Current local source and compiled generators only insert version 2 snapshots. The shared old writer explains the repeated incompatible instances; its service has not been stopped by the agent, and its URL has not been supplied.

- Repaired only this exact unstarted development task with the existing audited repair utility. Preserved assignment `8535`, status/window and history, and created four items / five mandatory views. A later read showed it had been started at 12:22:10 UTC by the staff workflow; the agent did not start it. Its authenticated manifest returns 200.
- New current-day ONCE/DAILY schedule creation now creates its complete task snapshot and initial assignment within the schedule transaction, before returning success. Future schedules still wait for their due day. Cron reuses the same snapshot builder. This closes the newly saved schedule race for today's identical template/date; it is not protection against every future write by the old backend. Stop that backend or isolate its database before further shared-database testing. Existing/historical schedules and tasks are not bulk converted.
- Real PostgreSQL regressions verify complete current snapshots, an old duplicate insert rejected by the existing template/date uniqueness rule, and whole-schedule rollback on snapshot failure. They also retain the six-second concurrent start/session and assignment rollback tests.
- Removed duplicate active-actor/location reads from task authorization using the current database actor and task location, retaining tenant, active-company, active-account, active-location, assignment and role checks. Added moved-staff, inactive-location and stale-manager-membership regressions.
- Found global authentication in both `/api` verification routers running on unmatched requests, causing Start cleaning to authenticate three times. Scoped each router's authentication to its own paths. Express prefix middleware requires a lookahead boundary: consuming the trailing slash skips nested paths. The readiness guard now uses the same correct boundary. Tests cover nested routes and unrelated-route fallthrough; live HTTP integration verifies unauthenticated routes remain 401.
- Mobile Start cleaning now shows a disabled loading button, suppresses duplicate taps, applies the server-confirmed task to its cache, cancels older feed requests, and refreshes in the background. Staff no longer wait for another full feed after the successful POST. Cache regressions cover stale responses, pending refresh and rejected starts.

The second screenshot (`NativeDatabase.prepareAsync`, “file is not a database”) occurred while saving the first room photo. Expo SQLite 16.0.10's `withExclusiveTransactionAsync` opens a new native connection with no SQLCipher key. Only the main queue connection had been keyed. The earlier Node SQLite harness incorrectly reused that connection, masking the error.

- Corrected the harness to model a separate unkeyed exclusive connection, which reproduced the photo-save failure before the code fix.
- Capture saves now use `withTransactionAsync` on the existing keyed connection. All queue access is private and already passes through `scoped` / `serialized`, so other queue operations cannot interleave with this transaction. No encryption key, database file or saved queue was removed or replaced.
- Added rollback-after-photo-insert and concurrent-capacity regressions; all 39 mobile tests and mobile typechecking pass.
- Compiled the actual pinned Expo SQLCipher source for Linux and ran `scripts/test-sqlcipher-connection.py`: SQLCipher 4.7.0 reproduced the unkeyed-connection error, then verified keyed transaction save, rollback preserving evidence, encrypted file header and reopening with the original key. This is an actual SQLCipher library test, not Android device validation. Build flags include `SQLITE_HAS_CODEC`, `SQLITE_TEMP_STORE=2`, `SQLCIPHER_CRYPTO_OPENSSL`, `SQLITE_EXTRA_INIT=sqlcipher_extra_init`, `SQLITE_EXTRA_SHUTDOWN=sqlcipher_extra_shutdown`; Expo prefixes C symbols with `exsqlite3_`. [SQLCipher key API](https://www.zetetic.net/sqlcipher/sqlcipher-api/) and the installed Expo SQLite implementation describe connection initialization.

### Latest consolidated APK

Use `frontend-mobile/build-output/HygeneOps-fixed.apk` instead of both earlier APKs. SHA-256: `63d71773087814d8f5a4110c9c679bea18461cb028541b6594ebc8a39c45c9f8`; 70,313,397 bytes, package `com.hygeneops.staff`, version 2.0.0 / code 2. It includes the previous URI/native-version fixes plus the start-feedback/cache and SQLCipher transaction fixes. `LATEST_APK.txt`, checksum and `latest-fix-reports/` identify it.

Regenerated the production Expo bundle and Hermes bytecode, reused the verified CI native package, aligned and signed the result. This was not a fresh native compile. All native code/resources/manifest entries match the CI APK byte-for-byte; only existing `assets/index.android.bundle` changed, with new signing metadata. Signature, 16 KiB ZIP alignment, APK/module inspection and matching prior signing certificate passed. The APK can update the existing installation without clearing data. Source hashes and SQLCipher regression results are included in the reports.

261 backend unit tests, backend build, isolated PostgreSQL integration and lifecycle checks pass. No additional migration, reset, production cutover or bulk legacy data removal was performed. Both automatic spatial acceptance and cleanliness passing remain disabled. Physical-phone installation and the complete room capture/upload workflow still require device testing; no device is connected to ADB.

Final live timing check used the already IN_PROGRESS task, preserved its original start timestamp, and started zero new tasks: idempotent POST samples were 4,307 ms cold / 2,652 ms warm. Earlier samples with duplicate router authentication were 4,224 / 4,085 ms. This is a limited local sample, not a phone benchmark or guarantee; Supabase/network/connection latency remains. The new app also removes the roughly four-second blocking feed refresh after success. Final doctor: schema ready, one healthy worker. Detailed validation outputs are in `latest-fix-reports/`.
