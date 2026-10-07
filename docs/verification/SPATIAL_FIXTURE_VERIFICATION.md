# Spatial fixture verification

Implementation date: 2026-10-07. **Evaluation implementation; not production ready. Automatic spatial identity acceptance is disabled in code.** Physical washroom testing, native device validation and calibration have not been performed. No production migration, deployment or cutover was performed.

## Existing architecture preserved

Read the inventory implementation plan, steps 9–14, steps 15–18 and release 19 handoffs; inspected the current capture, queue, ingestion, schema, pipeline, policy, completion and Clef code. This checkout already had uncommitted Clef/native/release work; it was preserved. No fixture labels, stickers or additional hardware were added. The existing area QR remains the sole required physical marker for this feature.

The additive sequence is:

```text
Area QR / GPS / authorized CaptureSession
  → start one local AR camera/world
  → ENTRANCE and LAYOUT context stills
  → fixture 01 views → fixture 02 views → remaining fixtures
  → stop camera after capture sequence
  → existing durable upload / quality / privacy / duplicate / coverage / cleanliness / completion
```

The native camera owns preview, visual-inertial tracking and evidence stills while spatial capture is enabled. It does not open a new AR session for each fixture or view. `expo-camera` remains the QR scanner and unsupported-device camera fallback. Two competing camera sessions are never intentionally opened together. Capture from an AR frame preserves the image and pose together; attempting to run AR alongside an independent Expo shutter would not provide that association.

Modules:

- `frontend-mobile/modules/spatial-tracking/`: optional local Expo native module, native preview, lifecycle handling and frame-aligned stills.
- `src/verification/spatialTypes.ts`, `spatialSession.ts`: bounded observation/checkpoint contracts, sequence, movement and interruption handling.
- `SpatialDiagnosticScreen.tsx`: development-only diagnostic; route and entry button excluded from production navigation.
- Existing `VerificationScreen.tsx`, `queue.ts`, `types.ts`, `api.ts`: guided integration, encrypted persistence and optional upload field.
- `backend/src/services/verification-v2/spatial.contracts.ts`, `spatialIdentity.service.ts`: independent validation and spatial candidate decisions.
- `spatialEvaluation.ts`, `backend/scripts/spatialEvaluation.ts`: labelled evaluation metrics without fabricated results.
- Existing contracts, capture-session service, coverage publication transaction, policy, staff result DTO and routes: additive integration.
- `VerificationAttempt`: three nullable columns and additive migration `202610070001_spatial_observations`; no new tables.

## Version and native integration choices

Inspected versions: Expo `~54.0.35`, React Native `0.81.5`, React `19.1.0`, new architecture enabled, existing Expo local native module autolinking via `./modules`. No third-party React Native AR framework was introduced. The bridge uses Expo Modules API, following the already established capture-quality module pattern.

Official references checked:

- [Expo local native code](https://docs.expo.dev/workflow/customizing/) and [native view API](https://docs.expo.dev/modules/native-view-tutorial/).
- [ARCore optional-device configuration](https://developers.google.com/ar/develop/java/enable-arcore), [camera ownership](https://developers.google.com/ar/develop/java/camera-sharing), [frame API](https://developers.google.com/ar/reference/java/com/google/ar/core/Frame), [depth limitations](https://developers.google.com/ar/develop/java/depth/developer-guide), [supported devices](https://developers.google.com/ar/devices).
- [ARCore SDK releases](https://github.com/google-ar/arcore-android-sdk/releases). Android dependency is pinned to `com.google.ar:core:1.54.0`; no cloud/geospatial anchors are used. Compatibility is not inferred from a React Native AR package's advertised support.
- [ARKit captured frame](https://developer.apple.com/documentation/arkit/arframe/capturedimage) and [session raycasting](https://developer.apple.com/documentation/arkit/arsession/raycast(_:)).

### Android

A local Expo view hosts a `GLSurfaceView`. An ARCore `Session` runs continuously with horizontal/vertical plane detection and optional automatic depth when supported. Preview samples the external camera texture. Shutter reads the current frame's CPU camera image, checks its timestamp against the pose frame, converts YUV locally to a JPEG, and rotates using actual camera sensor orientation. The image goes through the existing local quality, normalization, hashing and encrypted save pipeline.

The center reticle uses ARCore screen hit testing. Tracked-plane or depth hits retain method and position, but remain `CANDIDATE` with `uncertaintyMeters:null`. Camera texture, preview geometry and image/pose registration require real-device testing. The highest available CPU-image resolution is selected, but some devices may still lack adequate evidence resolution. Do not upscale an inadequate image to assert quality: existing quality checks run before resizing. CPU-image encoding performance and shutter delay must be measured on low-end devices.

Manifest declares AR **optional**, not a device requirement. Missing/unsupported/outdated Google Play Services for AR uses existing capture; no forced install flow was added. Availability checks can be transient; a later new capture session can retry. Camera denial/startup failure also uses fallback.

No frame sequences, recordings, world maps or anchors are persisted. Android frame update errors stop the native session; stale/no frames produce unavailable tracking. Background, detach and module destruction close the camera.

### iOS

An `ARSession` with `ARWorldTrackingConfiguration` backs the `ARSCNView` preview. Shutter derives a JPEG and camera pose from one `ARFrame`; raycasting uses that frame's camera optical axis and existing plane geometry. Plane hits are `CANDIDATE` with unknown uncertainty. No invented fixture-depth estimate or LiDAR accuracy claim is made. LiDAR-specific fixture estimation is not implemented.

The app is portrait-only. Physical rotation, rendered reticle alignment and JPEG orientation must be tested. `ARWorldTrackingConfiguration.isSupported` determines fallback capability. Background, native interruption, AR errors and preview detach pause the session and mark it broken. Recovery explicitly starts a new world; this implementation does not claim reliable relocalization.

## Capabilities and geometric quality

The contract supports `FULL_SPATIAL`, `LIMITED_SPATIAL`, `NO_SPATIAL`. Both native implementations currently report **LIMITED_SPATIAL** when available: they provide camera pose and optional geometric center hits, but no calibrated fixture-specific point estimator. Unsupported/uninstalled platforms and old binaries without the optional module report **NO_SPATIAL**.

Tracking states are `GOOD`, `DEGRADED`, `LOST`, `UNAVAILABLE`. Continuity is `CONTINUOUS` or `BROKEN`. Good tracking means the native tracking system currently has a usable pose; it does not establish semantic fixture identity.

A center hit on a tile floor, wall or stall partition may be repeatable while failing to locate the toilet. Mirrors, shiny porcelain and repetitive tiles can also produce incorrect or missing geometry. Consequently native points are not promoted to `GOOD` fixture points. Reliable server comparisons require `GOOD` point quality **and a reported bounded uncertainty**; the current native implementation does not manufacture either. Explicit evaluation mode can compare candidate geometry, with `reliable:false`, to measure whether a future estimator is practical. This limitation is deliberate and material: this implementation does not yet establish accurate fixture localization on real washrooms.

## Data stored per capture

The existing encrypted SQLite queue stores the still bytes and metadata in one exclusive transaction. The same transaction updates the spatial sequence checkpoint. Checkpoints survive foreground refresh and logout; account isolation and existing queue bounds remain intact. On process restart a new world is created with broken continuity, rather than pretending that a persisted UUID restores an AR map.

Optional `spatialEvidence` version 1 contains:

- Server CaptureSession ID; ephemeral local world UUID; increasing capture sequence.
- Exact requirement ID or context key; capability.
- Tracking and continuity states; interruption reasons.
- Capture elapsed time against the existing server-session anchor; world start against that same anchor; native frame monotonic timestamp.
- Nullable local camera position in metres and normalized quaternion orientation.
- Nullable center world point, estimation method, candidate/reliable quality and nullable uncertainty.
- Nullable camera displacement from the preceding saved capture in the same world.

Only poses at submitted stills and their displacement are stored, not a dense trajectory or continuous frames. Camera movement is supporting evidence and never establishes fixture distinction. No uncertainty/confidence number is fabricated. Pose values are native sensor outputs, not scientifically exact coordinates.

Backend attempt columns:

- `spatialEvidence Json?`: immutable client observation.
- `spatialVersion Int?`: 1 when metadata is present; null for older/non-spatial clients.
- `spatialDecision Json?`: immutable versioned server decision, threshold snapshot, comparison attempt/fixture IDs, pairwise point distances, camera displacements and reliable flags.

The migration adds binding/version checks and immutable observation/decision guards. No raw AR map or camera stream is stored. Production migration application is a separate release step; only isolated local test databases were migrated here.

## Upload integrity and ordering

The existing optional manifest and multipart upload share the same parsed metadata. Multipart adds one optional `spatialEvidence` JSON field, bounded at 4 KiB, retaining the eight existing metadata fields and photo. Older clients remain valid and receive unavailable spatial identity rather than fabricated verification.

Server validates version, exact server-session/purpose binding, finite coordinate bounds (±100 m local room envelope), normalized orientation, point-camera range, tracking/capability consistency, supported methods/states, anchor, timestamp and sequence. These are payload sanity limits, not identity thresholds. Elapsed time matches existing capture metadata within a bounded allowance; native time deltas must agree with capture order. A changed spatial payload under the same capture ID fails idempotency.

Offline uploads may arrive out of order. Validation checks capture ordering against both earlier and later stored observations, rather than treating request arrival order as capture order. Duplicate sequence numbers, changed world anchors, contradictory native time or silently restored continuity are rejected. A new world after interruption must be marked broken. Ingestion holds the existing task lock, serializing competing reservations. Evidence remains locally retained after upload rejection.

Client coordinates and quality claims remain **untrusted integrity signals**. There is no sensor attestation or cryptographic proof that the phone or toilet occupied those coordinates. Coordinates never authorize a slot, bypass QR/GPS, or complete a requirement.

## Spatial decision and policy

Coverage publication computes spatial identity separately under the existing task transaction. It compares earlier safe fixture observations in the same current CaptureSession and world, excluding other views of the same inventory fixture. Normal comparison candidates are current credited `PASSED`/`MANAGER_ACCEPTED` fixture attempts. Evaluation mode additionally allows earlier coverage-matched, identity-consistent safe observations so the existing closed cleanliness pass gate does not prevent collecting useful evaluation pairs. Those evaluation comparisons are provisional, not credits or manager reference images.

Results: `DISTINCT`, `SAME_POSITION_SUSPECTED`, `UNCERTAIN`, `UNAVAILABLE`. The first fixture is an uncertain baseline, not automatically distinct. Decisions include explicit reason codes: same-position candidate, position distinct, absent point, uncertain point, low/lost tracking, broken continuity and unavailable capability.

Distances are meaningful only within the same uninterrupted world. Camera-only motion remains uncertain. Reliable point uncertainty widens the undecided band. Candidate comparisons are permitted only by explicit evaluation policy. Defaults are versioned heuristic candidates, not validated scientific boundaries:

```json
{
  "version": 1,
  "thresholdVersion": "candidate-v1",
  "mode": "OFF",
  "autoIdentityAcceptance": false,
  "samePositionMeters": 0.25,
  "distinctPositionMeters": 0.6,
  "cameraMovementMeters": 0.15,
  "maxPointUncertaintyMeters": 0.2,
  "evaluateCandidatePoints": false
}
```

The existing exact-duplicate gate remains authoritative for reused bytes. Same-position candidates alone do not change coverage or cleanliness. Targeted spatial identity recapture requires the separately enabled assisted gate, a reliable same-position comparison against the **same** near-duplicate candidate, coverage MATCH, identity consistency and acceptable room context. `DISTINCT` strengthens the recorded evidence only; it never produces PASSED. Privacy, quality, presence, coverage and exact-duplicate gates retain precedence.

Clef remains unchanged and receives only controlled still, existing rubric/view/type inputs. It does not receive or judge world coordinates or continuity. Spatial uncertainty never becomes DIRTY. Existing passed requirements and cleanliness results remain preserved; targeted recapture changes only the unresolved affected requirement through existing generation/decision machinery.

## Continuity, staff UX and fallback

The same native view/world stays mounted throughout context and consecutive fixture/view captures. Staff sees the existing fixture heading, reticle and Take photo. Durable save advances the existing guided slot order. A short saved/move prompt is shown without coordinates or tracking jargon.

Background, navigation away, occupancy pause, permission change, camera restart, new capture authority and native failure persist broken continuity. Tracking degraded for more than three seconds after previously good tracking also marks the world broken; this timeout is a conservative lifecycle heuristic requiring device evaluation, not a relocalization guarantee. Tracking subsequently returning to GOOD does not erase the broken flag. A resumed session uses a new world marked broken, retaining all previous evidence.

Staff guidance is plain language: move the phone slowly when temporarily degraded; take a wider surrounding-stall photo when continuity cannot be confirmed. Native startup/stale-frame failure switches to the existing camera without dropping photos. Unsupported devices retain QR/GPS, context, guided capture, duplicate, coverage and cleanliness checks, with explicit unavailable spatial evidence when collection is enabled. Existing offline authority/reboot/expiry rules remain unchanged.

Photography stops on occupation; no proof of an occupant is requested. Privacy screening and protected evidence delivery continue. The AR camera processes frames locally, with no continuous bathroom video recording or uploading. Pilot builds must include the platform-required AR service privacy disclosure in their appropriate privacy notice; ordinary fixture instructions must remain simple. [ARCore disclosure requirements](https://developers.google.com/ar/develop/java/enable-arcore).

## Diagnostic and configuration

Use a freshly rebuilt development binary; Expo Go is not sufficient. From task verification's preparation screen, choose **Open spatial diagnostic** (`__DEV__` only). Confirm an empty consented room. Start tracking, center fixture A, capture A, move, center fixture B and capture B. Inspect tracking, continuity, camera displacement, optional geometric point distance and raw sample values. Reliable-point distance is unavailable while points remain uncalibrated. Still files are deleted after diagnostic sampling; exported metadata contains no images/video.

Label the pair SAME/DIFFERENT/UNKNOWN from physical human observation and export metadata. Starting again explicitly creates a new world and clears the pair. Backgrounding stops the diagnostic session and requires a new world; do not compare coordinates across exports/worlds.

To collect observations in guided verification for an authorized **test** company:

1. Rebuild native binaries so `SpatialTracking` is autolinked.
2. After separate deployment approval, apply the additive migration with existing release procedures. No production application is authorized by this handoff.
3. Set the company's validated `verificationPolicy.spatial` to `{ "version":1, "mode":"EVALUATE", "autoIdentityAcceptance":false, "evaluateCandidatePoints":true }`, preserving other policy settings. Threshold defaults are filled by `resolvePolicy`. New task snapshots receive this configuration; existing immutable task policy snapshots do not change.
4. Keep `VERIFICATION_SPATIAL_RECAPTURE_ENABLED=false`. Recreate test tasks through normal snapshot generation, not by rewriting historical policy JSON. Their manifest has `spatialCaptureEnabled:true`.
5. An authorized operational actor can export paginated attempt metadata and duplicate/coverage outcomes through `GET /api/task-instance/:taskId/verification/spatial-evaluation?cursor=...`. This endpoint requires normal task/location/tenant access plus an operational role; it exposes no media URLs/GPS/nonces.

For later assisted recapture, after independently reviewed physical evaluation: use new task snapshots with `mode:"ASSISTED_RECAPTURE"`, calibrated versioned thresholds (including a new `thresholdVersion` identifier), `evaluateCandidatePoints:false`, and deployment `VERIFICATION_SPATIAL_RECAPTURE_ENABLED=true`. The current native estimator still produces candidates, so reliable actionable fixture-point estimation must be implemented/calibrated before that gate is useful. Do not set client quality flags to GOOD to make a gate work.

**There is no configuration to enable automatic spatial acceptance.** The policy schema accepts only `autoIdentityAcceptance:false`, spatial actions never return a pass, and existing cleanliness auto-pass remains closed. Any future acceptance change requires a separately scoped, evaluated code change preserving every existing integrity/completion gate.

## Evaluation procedure and required physical checks

No physical scenarios below have been run. Use consented **empty** washrooms, separate room/fixture/device development and held-out groups, and recorded human ground truth. Never label identity solely from image similarity or coordinates. Freeze app/module/OS/AR-services versions and policy thresholds. Include positive and negative examples, repeated trials and adjacent-stall negatives. Keep consented media in approved protected evidence storage.

Required scenarios:

1. Same toilet/same angle.
2. Same toilet/different angle.
3. Same toilet after walking around it.
4. Adjacent toilet.
5. Toilets about 1 m apart.
6. Toilets farther apart.
7. Six visually identical stalls, including repeating a non-adjacent earlier fixture.
8. White-tile washroom.
9. Mirror-heavy washroom.
10. Poor lighting.
11. Temporary tracking loss and recovery (including prolonged loss).
12. App background/foreground and force kill before/after durable save.
13. Phone rotation, sensor orientations, reticle/photo registration.
14. Different low/mid/high Android devices, AR service missing/outdated, CPU image quality/performance.
15. iPhones with/without LiDAR; supported/unsupported world tracking.

Also verify offline capture after valid server authority, queue encryption/key/account isolation, reboot and permission changes, occupation during shutter/encoding/save, no residual plaintext camera files after startup cleanup, large text, no per-fixture session resets, and preservation of passed views/cleanliness across interruption. Verify actual HTTP payloads contain only stills and bounded spatial JSON, with no hidden frame/video uploads. Test manager-only export scoping.

Annotate ground truth and outcomes in a private JSON array using:

```json
[{
  "device":"actual model",
  "os":"actual OS / AR service version",
  "scenario":"same toilet after walking around it",
  "groundTruth":"SAME",
  "spatialResult":"UNCERTAIN",
  "tracking":"GOOD",
  "coverage":"MATCH",
  "duplicate":"NEAR"
}]
```

This is an input-format example, **not a measured observation**. Join diagnostic/export attempt IDs to physical human labels and actual server outcomes. Retain the original metadata for recalibration; the reporter does not invent provider predictions.

Run `npm --prefix backend run verification:spatial-evaluate -- /private/labelled-results.json /private/new-report.json`. Output files cannot overwrite previous reports. Metrics: same-fixture detection rate; false same-fixture rate among genuinely different fixtures; tracking failure rate; spatial uncertainty rate; device/OS breakdown. Empty/missing denominators yield null rates. A command succeeding does not meet an accuracy gate. Set release targets from the product risk assessment before examining held-out results; none were fabricated or declared met here.

Calibrate meaningful separation, camera-motion expectations, geometric surface validity, point uncertainty and required tracking quality. Examine near/coverage outcomes jointly and investigate false same detections for adjacent stalls. Reliable surface points can still differ when the worker centers different parts of one toilet; world drift can move the apparent point; identical stalls can confuse tracking. Client metadata can be modified. This is an additional fallible integrity signal, **not proof and not cheat-proof**.

## Automated validation record

Executed checks for this implementation:

| Check | Result |
| --- | --- |
| Backend unit/regression tests | 256 passed across 32 files |
| Mobile queue, upload and spatial tests | 27 passed |
| Backend Prisma generation and TypeScript build | Passed |
| Mobile TypeScript check | Passed |
| Mobile web export | Passed |
| Verification worker compiled-entry syntax check | Passed |
| PostgreSQL verification integration, including spatial bindings and immutable persistence | Passed in an isolated local database |
| PostgreSQL verification lifecycle integration | Passed in a separate isolated local database |
| Expo Android and Apple native-module autolinking | Passed |
| Temporary Expo Android prebuild | Passed |
| Android spatial module Kotlin/API compilation | Passed against ARCore 1.54.0, React Native 0.81.5 and the installed Expo Modules sources |
| Full Android APK build and installation | Not completed |
| iOS native build and installation | Not run; this Linux host has no Xcode |
| Physical phone/washroom scenarios | Not run |
| Spatial accuracy evaluation | No physical dataset; no measured accuracy claims |

Native/device evidence is distinct from TypeScript, synthetic policies and simulated queue tests. Android checks used a temporary project and SDK under `/tmp/hygeneops-spatial-native`. The full Android build encountered insufficient space for the React Native NDK. To check the bridge APIs independently, the temporary build omitted the app/root React plugin and Expo core CMake build, retained the actual Expo core Java/Kotlin sources, pinned React Native dependencies to 0.81.5 and aligned the temporary Java/Kotlin targets to 17. This checks Kotlin/API compatibility; it does **not** validate the final APK, C++ integration, camera operation or device lifecycle. Production project files and dependency sources were not changed by that workaround. Build log: `/tmp/spatial-native-module-build.txt`.

Integration test databases were retained for inspection: `priv_verification_test_1791330371602_9960` and `priv_verification_test_lifecycle_1791330075923`. No production database was migrated. Source whitespace checks passed. Current gate remains `OFF` by default, with automatic spatial acceptance prohibited by the policy schema even when evaluation is enabled.

Automated tests cover metadata validation/version/ranges/orientation, expected session/purpose, upload JSON, idempotency, world anchor/sequence/native times, reordered offline ingestion, immutable DB persistence, same/different candidates, uncertainty/loss/no support, interrupted/restored continuity, phone movement not establishing distinction, duplicate/coverage/context combination, targeted identity recapture gating, passed requirement preservation, encrypted queue metadata/checkpoint recovery and evaluation rates. Clef retains existing independent contract/regression tests.
