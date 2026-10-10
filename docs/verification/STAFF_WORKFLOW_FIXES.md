# Staff workflow implementation and verification handoff

Date: 2026-10-08. This work builds on the existing area QR, inventory snapshots,
spatial observations, encrypted queue, and prior session/storage handoffs. Unrelated
uncommitted changes were preserved. No production cutover was performed.

## 1. Clarification decisions

The user confirmed keeping one entrance/room photograph after removal of the normal
layout requirement, and approved the recommended genuine bundled quantized CLIP model.
Uncertain category results require an explicit retake or send-for-backend-checking
choice. Existing sessions retain their previously recorded context obligations.

## 2. Bugs found and fixes

- DIRTY could use ordinary old-authority retakes: it now requires the fresh QR rework
  endpoint, current assignment/device, new GPS, and expected requirement generations.
- New sessions unconditionally required ENTRANCE and LAYOUT: a server-persisted session
  policy now requires ENTRANCE only; malformed/missing old policies retain both.
- Slow worker batches held fast jobs: bounded dispatch refills each free slot.
- Quality was inspected again and protected media downloaded across stages: trusted
  ingestion quality is reused; protected downloads are deduplicated in bounded RAM.
- Intermediate and duplicate completion evaluations performed unnecessary database
  joins: unresolved mandatory requirements return fail-closed; each publication
  finalizes once. Completion still checks privacy, presence, assignments and jobs.
- Unauthenticated verification requests incorrectly reported SERVICE_FAILURE: they now
  report AUTH_REQUIRED consistently with the rest of the API.
- Missing calibration or malformed Clef data incorrectly requested a new photograph:
  operational processing now routes these to service failure/retry on saved evidence;
  genuine ASSESSED CANNOT_ASSESS still requests targeted recapture.
- Permanent provider HTTP/configuration errors used transient retries: explicit
  classification now stops permanent retries and keeps timeout/rate-limit retries.
- Uploading blocked polling of already accepted evidence: independent reconciliation
  now updates results during multipart uploads. SERVICE_FAILURE is terminal locally.
- Retake responses left stale failed labels: new authoritative slots replace stale
  non-passed capture state until the next manifest update.
- An undecided uncertain photo could survive a pause: it is discarded on pause or
  background, with truthful not-saved text.
- Nginx's default 1 MiB limit conflicted with 5 MiB evidence: API proxy limits are
  now 6 MiB including multipart overhead; backend retains its 5 MiB photo limit.
- Existing generated Android directories could skip the model bundling plugin:
  the build workflow now reapplies prebuild without --clean and verifies model SHA.

## 3. Final staff flow

Assigned task → Start Cleaning → persistent AREA QR → backend atomic server-timed
start with existing attendance/window rules → In Progress → perform cleaning.

Finish Cleaning → preparation/permissions → fresh AREA QR + GPS → fresh CaptureSession
→ entrance photo → guided fixture/view photos → local category check → encrypted
account-scoped image/metadata transaction → Saved → background upload → Checking.

DIRTY → clean only affected views → fresh AREA QR + GPS → targeted rework CaptureSession
→ its required entrance context + failed fixture views → verify. Other failed views
can obtain retake slots in the current authorized session; no passed view is restarted.
Only the server completion service can finalize VERIFIED_COMPLETE or
COMPLETED_WITH_EXCEPTIONS after all authoritative checks/decisions.

## 4. Room context

New finish/rework sessions require one entrance photograph and no layout photograph.
Legacy renewals/rework preserve recorded ENTRANCE + LAYOUT obligations. Context,
coverage, reconciliation, policy and mobile progress use the session's authoritative
context keys. Fresh rework also requires its room context; passed task evidence survives.

## 5. Genuine local fixture check

Quantized CLIP ViT-B/32 vision encoder + ONNX Runtime RN 1.24.3; pinned model and genuine
matching text embeddings; Android/iOS native preprocessing. TOILET, SINK/basin,
MIRROR, BIN, FLOOR are supported; other types remain UNCERTAIN. No runtime download,
remote category call, Clef call, or mocked detector.

Model: 89,117,001 bytes (89.1 MB), plus native runtime per ABI. Android has a private
model copy. MATCH cosine ≥ .23 and runner-up gap ≥ .025. CLEAR_MISMATCH requires another
supported fixture cosine ≥ .30, expected gap ≥ .09, runner-up gap ≥ .05 and two prompt
votes with gap ≥ .07. These are conservative starter thresholds, not calibrated
probabilities. Clear mismatch is not queued/uploaded. Uncertainty remains explicit.

Desktop CPU smoke: load 292 ms, inference 52–54 ms; all three repository multi-object
bathroom examples remained uncertain. Phone planning estimate 0.2–2 s warm is unmeasured.
25-second timeout/unavailability remains uncertain; inference is serialized with a busy
guard. Native/runtime pins, model SHA, licensing, provenance and reproduction are in
[LOCAL_FIXTURE_CATEGORY.md](LOCAL_FIXTURE_CATEGORY.md). New model versions need
calibration and native builds; the current model is never accepted as fixture identity.

## 6. Exact pipeline and safety

Ingestion validates authority and byte commitment, inspects/sanitizes quality and
stores both authenticated objects before acknowledgment. The durable job pipeline is:
QUALITY → PRIVACY → COVERAGE (exact/near duplicate, protected context and category/view)
→ spatial identity signal during coverage publication → CLEANLINESS (Clef only)
→ policy/completion. Exact reuse checks can raise a restricted integrity issue at
 ingestion to avoid silently accepting reused bytes; they never establish completion.

Quality/coverage/privacy/duplicate prerequisites remain required before Clef. Spatial
world observations remain separate from category. Spatial failure cannot become dirt,
cleanliness or a fraud accusation. CLEAN/DIRTY/CANNOT_ASSESS remain distinct from execution
SERVICE_FAILURE. No verification stage or acceptance gate was bypassed.

## 7. Actual latency evidence

Read-only development trace: task 8569758, session 95ea6770-3f59-4d1d-b78d-a0a2efd883bc,
attempt a82aab08-ffb8-4e37-b2fa-727fbad27e09:

| Measurement | Actual historical duration |
| --- | ---: |
| Claimed capture → upload receipt |42.998 s|
| Reservation → upload receipt |18.231 s|
| Quality job creation → finished |31.813 s|
| Privacy job creation → finished |41.703 s; provider4.351 s|
| Coverage job creation → finished |38.492 s; provider5.189 s|
| Cleanliness job creation → finished |45.455 s; Clef2.050 s|
| Upload receipt → final job finish |172.647 s|
| Claimed capture → final job finish |215.645 s|

The provider did not explain most of the delay. Proven contributing mechanisms were
repeated protected downloads, batch head-of-line waits, redundant database work and
result-polling blocked by uploads; historical retry jobs also consumed minutes.
Legacy records lack claim/phase timing, so exact attribution of every old second is
unavailable. The new instrumentation records ingestion, storage, claim, stage,
provider, duplicate, spatial and observed publication timings correlated by IDs.
Mobile persists capture/save/upload/receipt/display times; device observations are
untrusted telemetry, never authority. Use `npm run verification:trace -- <attempt-id>`.

Actual read-only Cloudinary comparison on the same safe 241,781-byte image: three
uncached sanitized reads15.850 s vs cached three reads3.055 s (one network call).
Network conditions vary; this is not an entire new capture benchmark.

Controlled isolated PostgreSQL benchmark, two samples/mode, fixed storage/providers:
reconstructed uncached behavior479.03 ms → current247.19 ms; image reads4 →1.
Quality138.26→16.71 ms, privacy92.23→79.29, coverage114.06→63.63,
cleanliness134.49→87.57. Old batch vs refill dispatcher last fast result330.83→92.47 ms
under 300/30/30/30 ms jobs. These are controlled measurements, not live provider/phone
claims. `backend/scripts/verificationControlledLatency.ts` reproduces them with an
explicit local isolated test database URL. No real-phone end-to-end after time is known.

## 8. Rework and evidence durability

The fresh QR endpoint increments only selected DIRTY generations and expires previous
capture authority. Passed currentAttempt pointers remain unchanged across sessions,
expiry and restart. Wrong view/poor image/privacy/CANNOT_ASSESS use targeted capture,
not cleaning instructions. Network/provider failures retry their existing capture/job;
exhaustion retains evidence for the existing manager retry/review policy.

## 9. Mobile UX

Simple fixture/view progress, one capture action, torch/help preserved. Saved is distinct
from Checking/Passed. Camera advancement follows the encrypted durable transaction.
Other photos can be captured while uploads/checks proceed. Checks taking over 30 seconds
explain the delay and allow continued work/back to task. First normal failures follow
existing retry/escalation policy; manager cases remain task-level, deduplicated.

## 10. Backend and worker

Targeted QR route, immutable per-session context policy, safe legacy fallback,
classification and bounded provider timeouts, bounded worker: 4 global/2 per company,
32 MiB/120 s private RAM cache and in-flight download deduplication, parallel independent
protected original/review storage, trusted persisted quality reuse, fail-closed early
completion, trace instrumentation and permanent/transient failure handling. Development
worker restarted and doctor reported one healthy process. No automatic acceptance.

## 11. Validation

Backend: 336 tests/40 files passed; backend build and worker syntax passed.
Web: 32 tests, build and lint passed (existing bundle-size warning).
Mobile: 59 tests and typecheck passed; Android JS/Hermes export passed.
Isolated integration, lifecycle/completion race and worker health/start/stop passed.
Tests cover QR separation/scopes/assignment, dirty and mixed targeted rework, session
expiry, passed preservation, legacy context, mismatch no upload, explicit uncertainty,
durable-save ordering, interruption/restart/account isolation, multipart refresh,
idempotency, provider failures/timeouts/CANNOT_ASSESS and closed gates.
The SQLite kill/recovery harness runs real SQLite, not a physical SQLCipher device.
Native Android Kotlin/Java, app code, camera/spatial modules, merged model assets
and manifest compiled successfully (299 tasks, 14m05s initial dependency build).
ONNX C++/JNI arm64-v8a compilation also passed without the temporary init script
(28 tasks, 1m10s). Native model SHA/license verification passed. A new standalone APK was assembled and inspected in CI and locally. Both physical Android ABIs compiled (12m41s), followed by packaging (3m). iOS compilation remains unavailable on Linux.
`git diff --check`, plugin syntax and APK inspection script syntax passed.

## 12. Database/migration status

No configured database migration/reset/cutover in this work. Read-only doctor:
schema ready, no missing required columns, no required additive migration. Prisma
migrate status did not finish against the pooled development URL and was stopped;
no migration was executed or inferred from that incomplete check. Spatial
columns are already present from prior work; existing migration file was preserved.
All destructive/integration fixtures use explicitly guarded local databases, retained
for inspection. Latest full integration results are in `/tmp/backend-clef-technical-integration.log`.

## 13. Native build/APK

YES: a new APK/iOS native build is required for ONNX Runtime, native preprocessing,
and bundled model. Earlier APKs do not contain these changes. APK inspection now
requires model SHA/license, ORT module/libraries and category runtime marker. No claim
of installed-phone validation or production deployment. Use `npm run build:android` (device URL validation and non-clean prebuild included)
or `npm run build:ios` so current plugins run even with an existing native directory.
Android Kotlin/Java/assets/manifest and ONNX C++/JNI checks passed for arm64-v8a and armeabi-v7a. Version2.1.0/code3 APK was assembled and inspected, but not installed or validated on a phone.

## 14. Release gates

Spatial automatic acceptance remains false; assisted spatial recapture is also false
in development. Cleanliness passing remains disabled in the current runtime for every fixture because no real reviewed release is configured. `autoPassAllowed` now validates a pinned release artifact instead of returning a hardcoded false.
Held-out benchmark status DATASET_UNAVAILABLE, zero examples. Current candidate threshold
and threshold version are not configured: the adapter conservatively returns CANNOT_ASSESS
for evaluation, while normal task processing reports technical SERVICE_FAILURE and
retains the photo for review/retry instead of asking staff to take an unhelpful photo.
Staff cannot automatically complete on CLEAN; required retries/manager review stay real.
An evaluated threshold alone cannot open the release gate; complete held-out evidence and an independently reviewed exact-configuration release record are required.

## 15. Real-device validation required

Category calibration/latency/memory on Android and iOS, multi-object/reflections/closeups,
wrong-fixture rejection, SQLCipher durability across process kill/token expiration,
permissions/URI/camera lifecycle, continuous spatial washroom observations and unsupported
fallback, fresh QR/GPS rework, actual T0–T12 timing using new traces, and native signed
build installation. Desktop model execution is not phone validation.

## 16. Remaining blockers

Entrance and model choices are resolved. The requested independently labelled dataset has not been supplied. Deployment readiness still needs physical-device validation and held-out category/cleanliness evaluation. A new native APK has been delivered. No unvalidated threshold or automatic pass was enabled to
make completion appear successful. Live end-to-end after timing awaits a legitimate
fresh phone capture; configured task evidence was read, never reprocessed or fabricated.


## Follow-up: three cleanliness outcomes and conditional release

The user confirmed using the existing Cloudflare Clef classifier. Clean, Dirty and
Needs review are now explicit staff DTO and UI outcomes; saved/uploading/checking
remain separate progress states. Manual acceptance and waivers are not labelled Clean.

The hardcoded always-false gate has been replaced by a reviewed, checksum-pinned,
configuration-bound release artifact. Development calibration and held-out release
commands are implemented. No independently labelled real washroom dataset was found,
and no real release was activated; all gate acceptance test data is synthetic and
isolated. Spatial automatic acceptance remains false.

The new integration run exposed an immutable-assessment violation from adding a policy
reason after initial publication. The assessment and reason now publish atomically in
one initial write. PostgreSQL's immutability trigger remains enforced, with a test that
rejects subsequent rewrites. Exact duplicate, stale authority, uncertainty and technical
failure retain distinct recovery actions.

Latest local verification: 336 backend tests, 59 mobile tests, backend build/TypeScript,
mobile TypeScript/web export, isolated completion/lifecycle and worker-health integration
all passed. Full isolated workflow includes synthetic valid release, tamper/config-change
holds and immutable reason publication. Actual phone testing is still pending; adb lists no device. The new APK build and inspection results are recorded below.


## Delivered APK (2026-10-08)

File: frontend-mobile/build-output/HygeneOps-staff-2.1.0.apk
Version: 2.1.0, Android versionCode3. Size:183,546,407bytes (175.0MiB).
SHA-256:62e275a3a29d0dd9b7f584b1faa494e611ad798ba5d88c9674b862b9ce49759d.
Build source:213c511523ca7bc3a84d1793daff81133c832f82.
CI:https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/37807376987

All three CI jobs passed: mobile checks, backend contracts/three isolated database
suites, and native compilation/package/inspection. CI and independent local inspection
agree on both ABIs, pinned model/license, ONNX Runtime/native modules, SQLCipher probe,
optional ARCore, camera/location/network permissions, phone-reachable development API,
and bundled three-outcome UI. APK signature and16KBZIPalignment passed. Test signing
certificate matches the previous APK certificate; no signing-key change is required.
This verifies packaging, not physical-device behavior.

The user changed the cleanup instruction at delivery: **all six old project APKs are
preserved**. The new file has a distinct name. No older APK was replaced or deleted.

Additional web verification after friendly manager-review labels:32 tests, build and
lint passed. Both Compose definitions validate without interpolation; the release
artifact mount is read-only. No Compose deployment or database migration was performed.
The development worker is healthy. Live cleanliness release status remains
RELEASE_NOT_CONFIGURED for every supported fixture; real data and review are required.


## Physical-phone login network failure (2026-10-09)

Reported APK URL was http://192.168.100.198:8080/api. The computer still had that
LAN address, but no API process or port8080 listener existed. The verification
worker was running independently, so worker health did not prove API availability.

Started and enabled the user service hygeneops-backend-development.service from
~/.config/systemd/user/, using the existing compiled backend and configured .env.
It restarts on process failure and is enabled for the user session. API listens on
all interfaces at8080. The staff-login endpoint at the exact LAN URL responded
401 Invalid email or password to deliberately invalid probe credentials in0.602s;
this proves the HTTP handler/database path responds from the development computer,
not that a physical phone is connected or that real credentials were authenticated.
No APK changes/reinstall, firewall edits, database migration or credential changes.
Phone still needs access to the same LAN; this private development URL requires the
computer to stay running, awake and reachable. Physical-phone retry remains needed.


## Start-window rejection for lassssssssssst (2026-10-09)

Read-only inspection found pending assigned task8569764 scheduled for9Oct23:55 to
10Oct03:00 Asia/Karachi. At00:46 on9Oct this is the next night, so the unchanged
five-minute early-start rule correctly rejects it. The previous-night instance8569761
was scheduled8Oct23:55 to9Oct03:00; its current assignment was marked MISSED at
9Oct00:05 by existing missed-start reassignment, with no eligible replacement and
staffId cleared. These are separate immutable task instances, not a QR error.

The start controller now distinguishes TASK_START_TOO_EARLY, TASK_START_WINDOW_ENDED
and TASK_NOT_PENDING, with exact local dates/times and enumerated structured timing.
The currently installed app already renders the server message, so no APK rebuild is
needed for this fix. QR, assignment and timing authorization remain unchanged.
Added next-night/overnight/five-minute-boundary/exact-expiry regressions. All340backend
tests passed; backend build and gitdiffcheck passed. Persistent development backend
restarted successfully and responds at the existingLANURL. No live schedule, assignment,
attendance, snapshot, migration or policy was altered during this investigation.
