# Inventory verification: release verification, step 19

Date: 2026-10-06 (Asia/Karachi). Starting HEAD: `458e8e6` (`implement inventory verification workflow through steps 18`). Initial `git status --short` was empty. Read the inventory implementation plan and both steps 9–14 / 15–18 handoffs, inspected the scripts, tests, provider/storage contracts, worker, mobile policies and automatic-pass gate before edits. The existing regression suites passed before any source changes.

**Disposition:** local automated release checks pass. Step 19 is **partially validated, with external release gates still open**. Do not proceed to step 20's production migration/cutover yet. Planning and review of its runbook can proceed; execution needs the remaining evidence below and separate authorization. No production migration, deployment, customer cutover, route removal or step 20–21 implementation occurred.

## Changes limited to release validation

- Extended the existing offline held-out reporter with rates/counts for DIRTY false-clean predictions, DIRTY candidate passes, wrong-item/replayed candidate passes, CANNOT_ASSESS, coverage verdicts/failures, incomplete stage evidence, inconsistent candidate passes and per-fixture-type latency/cost. Missing denominators produce null rates. Historical input rows still parse, but cannot establish release targets without stage evidence.
- Added seven synthetic reporting tests for diagnostic counts, missing evidence, unsafe passes, sparse types, consent/configuration/split validation and threshold boundaries. These are tooling tests, not held-out evaluation results.
- Added opt-in `--require-targets`: exit 1 unless pooled and every included fixture type meet targets. Default report-only behavior remains exit 0 even with missing data. New reports cannot overwrite existing files.
- Corrected outdated migration-report capability text that still described step 18 as unimplemented. The report remains read-only; it does not assert deployed native-client readiness.
- Added the dataset/run instructions in [HELD_OUT_EVALUATION_19.md](HELD_OUT_EVALUATION_19.md), an honest [empty-dataset status report](RELEASE_19_BENCHMARK_STATUS.json), and gitignore exceptions for these two new Markdown records.

`cleanliness.service.ts:autoPassAllowed()` still returns **false for every fixture type**. Provider setup, credentials, reporter success and `--require-targets` cannot enable it. Completion authority, assignment epochs, immutable snapshots, privacy/presence/mandatory-view gates and legacy routes were unchanged.

## Checks executed and exact results

Runtime: Node **v24.14.1**, PostgreSQL **16** on isolated `127.0.0.1:55439`; repository CI targets Node 22. The checks used existing installed dependencies; a fresh install or remote CI run was not performed. Captured output is in [RELEASE_19_CHECK_OUTPUTS.txt](RELEASE_19_CHECK_OUTPUTS.txt).

| Check | Result |
| --- | --- |
| Initial `git status --short` | Clean |
| Baseline `npm --prefix backend test` | **193 passed / 193**, **28 files passed / 28** |
| `npm --prefix frontend test` | **32 passed / 32**, **0 failed**, **0 skipped** |
| `npm --prefix frontend-mobile test` | **18 passed / 18**, **0 failed**, **0 skipped** |
| Final `npm --prefix backend test` | **200 passed / 200**, **28 files passed / 28** |
| `npm --prefix backend run build` | Passed Prisma generation and TypeScript, before and after reporting changes |
| `npm --prefix backend run worker:verification:check` | Passed both compiled entry syntax checks |
| `npm --prefix frontend run lint` | Passed |
| `npm --prefix frontend run build` | Passed TypeScript/Vite production build |
| `npm --prefix frontend-mobile run typecheck` | Passed |
| `npm --prefix frontend-mobile run build:web` | Passed Expo web export; compilation check only |
| `test:verification:integration` with explicit isolated URL | Exit **0**; all assertions passed, **9 PASS summaries** |
| `test:verification:lifecycle` with explicit isolated URL | Exit **0**; all assertions passed |
| `test:verification:worker` with explicit isolated URL | Exit **0**; startup/own-instance health/graceful shutdown/unhealthy after stop passed |
| Manager `frontend/tests/verificationBrowser.mjs` | Passed inbox/detail at **1440 × 900** and **390 × 900**, location filtering, read receipt, blob evidence, maintenance consequence, waiver, stale conflict/note retention and completion outcome; API fixtures |
| Both `docker compose … config --quiet` commands | Exit **0**, default and deploy configurations; no container deployment |
| Fresh local `prisma migrate deploy --config backend/prisma.config.ts` | **12 migrations applied successfully** |
| Local `prisma migrate status` | Exit **0**, **12 migrations**, schema up to date |
| `verification:report`, explicit local migration DB | Exit **0**, `read-only-dry-run`; 12 completed migrations, no rolled-back migration, empty company/template/instance fixtures |
| `verification:backfill`, explicit local migration DB | Exit **0**, `dry-run`, **0 candidates**, no `--apply` |
| `verification:backfill`, populated integration DB | Exit **0**, `dry-run`, **0 candidates**, no `--apply` |
| `verification:benchmark`, no dataset | Exit **0**, **DATASET_UNAVAILABLE**, **0 examples**, `targetMet: false`, `autoPassEnabled: false` |
| `verification:benchmark -- --require-targets`, no dataset | Expected exit **1**; missing evaluation blocks the opt-in gate |
| Empty JSON input → new report file | Exit **0**, DATASET_UNAVAILABLE report written |
| Repeat report write to existing output | Expected exit **1**, `EEXIST`; prior report preserved |
| Invalid JSON input | Expected nonzero exit; no report written |
| Final `git diff --check` | Passed |

Frontend/mobile sources were unchanged; their baseline tests plus production compilation/lint checks serve as the final regressions. Backend regressions were rerun after the final tooling edits. There were no blocking automated failures. Expected negative PostgreSQL assertions log Prisma constraint errors. Existing warnings remain: pg concurrent-query deprecation, Vite plugin timing/large chunks, and unset optional Compose provider/mobile image variables in the validation-only environment.

The browser harness used installed `playwright-core` at `/tmp/hygeneops-ui-tools/node_modules/playwright-core/index.mjs`, `/usr/bin/google-chrome` and Vite at `127.0.0.1:5179`. This run's screenshots are in `/tmp/step19-browser/exception-{inbox,detail}-{1440,390}.png`. These temporary artifacts are API fixtures, not customer/device evidence.

## Validated by local automated evidence

**Backend consistency and races:** real PostgreSQL verifies migration of an existing completed legacy fixture to v1/LEGACY_RECORDED, tenant/area/session bindings, snapshots through daily/once/startup generation, inventory-edit conflicts, subset/ALL expansion and retirement review, archive/deletion retention, concurrent session/manifests/uploads, replay and changed bytes, slot generations/retakes, exactly-once result publication and completion, lease expiry/competing claims, stale results after retake, storage racing reassignment with retained review-only bytes, QR rotation during assessment and inactive staff/company revocation. Lifecycle tests cover item aggregation, mandatory/optional distinctions, deadlines/pending jobs, extension bounds, privacy/presence, maintenance versus waiver and accepted evidence retention. These are deterministic fixture scenarios, not a production stress/load benchmark.

**RBAC and privacy:** unit tests and real service/HTTP integration cover tenant and manager-location scoping, STAFF-only mutation/active-account checks, obsolete-native rejection, scoped exception/read APIs, original-media ADMIN restriction, denied pending/held delivery, protected history DTOs and bounded concurrent standard-photo privacy retries. Database checks bind decisions/follow-up evidence to valid same-scope safe replacement evidence. Browser blob URLs validate the UI contract. External Cloudinary access controls remain unvalidated here.

**Provider/storage contracts:** tests validate separate coverage/privacy/cleanliness stages, strict schemas/aggregate required surfaces, refusal/malformed/outage handling, actual-versus-requested model metadata, immutable results and bounded retries. Storage mocks validate authenticated upload, no overwrite, hash-bound stored-response-loss recovery, changed-byte rejection, lookup outages and verification-namespace restrictions. The real PostgreSQL suite verifies storage acknowledgment/reassignment races with injected storage. No live vendor call, model-quality measurement or real Cloudinary upload/delivery was performed.

**Worker:** compiled-process integration starts a real worker against a fresh isolated DB, checks its own process marker/database heartbeat, verifies graceful SIGTERM and health failure after stop. Unit tests reject missing/future/expired heartbeats. Queue integration exercises concurrent company caps, leases, stale owner publish/fail rejection and retries. External provider execution in a deployed worker fleet is not established by these checks.

**Mobile offline/reconnect:** 18 tests include a child-process SIGKILL after a real Node SQLite save, recovery of exact bytes/slot/capture identity and interrupted upload, logout retention and account/company isolation, low storage/50-photo limit, atomic slot uniqueness, offline/suspended retention and reconnect metadata/acknowledgment, durable same-request replay after lost session response, offline session refusal, targeted rework, monotonic expiry/reboot/pause and auth/network retry distinctions. Auth tests exercise serialized refresh and account changes during token/refresh work. Expo, SQLCipher, SecureStore, NetInfo and quality adapters are mocked; this validates JS/SQL behavior, not physical native encryption/camera/OS behavior.

## Migration validation boundary

All mutation-bearing migration checks explicitly targeted **new local test databases**, never the configured customer database. The supplied local test database was not reset/dropped. All test databases remain retained:

- Main integration: `priv_verification_test_1791312383252_8659`.
- Lifecycle: `priv_verification_test_lifecycle_1791312384581`.
- Worker: `priv_verification_test_worker_1791312438722`.
- Actual Prisma deployment rehearsal: `priv_verification_test_migration19_1791312480537`.

The integration suite applies early migrations, inserts historical fixture rows, then applies verification migrations and checks preserved legacy behavior. The separate Prisma deployment rehearsal verifies all repository migrations and the migration ledger on an empty local DB. Read-only reports/backfill previews do not prove real customer mapping completeness, production volume/lock duration or a backup/restore process. No customer-copy restore, real data audit, production backfill, mapping, active-task drain or cutover was attempted. The temporary local PostgreSQL server was stopped after checks; retained data is `/tmp/hygeneops-verification-pg` and may disappear when this environment resets.

## Physical-device and external checks still required

**No physical Android/iPhone, native build or physical-device test was executed.** Run a SQLCipher-enabled compatible native build on low/mid-range Android and iPhone. Record device/OS/app versions, scenario, actual result, evidence and defects; all entries below currently have status **NOT RUN**.

| Required scenario | Acceptance evidence to collect |
| --- | --- |
| Encryption/key lifecycle | Inspect DB/WAL for plaintext absence; SecureStore isolation, lock/unlock, missing key, backup/reinstall behavior; preserve unsent evidence during recovery |
| Kill during shutter/quality/save/upload/ack/poll | Before durable save request retake; after save recover exact bytes/IDs, no double assessment, remove plaintext caches on restart |
| Poor network and OS suspension | Offline session creation refused; valid issued offline capture works; interrupted multipart/lost acknowledgment retries same identity; reopen/reconnect resumes without assuming background delivery |
| Auth/shared device | Concurrent Axios/multipart expiry, revocation, same-account resume, logout with queued evidence and account/company switch; no cross-account bytes or token overwrite |
| Storage/time/authority | 100 MB/50-photo bounds, exhausted disk, wall-clock changes, reboot, expired/revoked session, fresh QR/GPS renewal and review-only late uploads |
| Permissions/camera | Denial/permanent denial/Settings recovery, indoor GPS accuracy, Android focus/watchdog/restart/torch, foreground transitions |
| Guided multi-view capture | Many similar fixtures, numbering/position cues, save-before-advance, passed-view preservation, hidden/missing surface, wrong item, CANNOT_ASSESS targeted recapture, DIRTY targeted cleaning, outage/manual review |
| Occupied-room interruption | During framing/shutter/quality, pause/unmount immediately; no occupant image submitted; explicit empty-room resume; offline damaged/inaccessible/cannot-locate reports |
| Accessibility | Large fonts, screen reader, long fixture/instruction text, reachable fixed footer and landscape/small-screen behavior |
| Real quality hints | Calibrate blur/exposure/glare candidates across physical phones; no cleanliness-accuracy claim from local hint thresholds |
| Protected Cloudinary in nonproduction | Real authenticated originals/derivatives; staff/manager/admin delivery, cross-location/tenant denial, role/location revocation, pending/held restrictions and lost-response recovery |
| Live provider pilot | Frozen chosen provider/configuration, actual malformed/outage/latency/cost behavior, private consented evaluation and bounded retries; no silent fallback |

Plan edge cases that remain operational/manual evidence include genuinely similar adjacent fixtures/tasks, partial large-floor visibility, reflections containing people, worn/damaged-but-clean fixtures, maintenance mid-task, long translations and fleet-wide provider outage under real load. Synthetic coverage/schema/privacy/outage tests validate policy reactions; real imagery and operational load still need evaluation/pilot evidence.

## Held-out evaluation and automatic-pass blockers

**Held-out evaluation was not performed.** No consented real dataset was supplied. The checked-in release status has zero examples, null latency/cost/confidence intervals, `overall.targetMet: false` and `autoPassEnabled: false`; zeros here are absence of data, not measured zero errors.

The existing harness was inspected and extended, rather than replaced. Follow [HELD_OUT_EVALUATION_19.md](HELD_OUT_EVALUATION_19.md) to prepare private labels/predictions and run:

```sh
npm --prefix backend run verification:benchmark -- /absolute/private/results.json /absolute/private/new-report.json --require-targets
```

Remaining blockers before automatic passing can be enabled:

1. Supply independently labelled, consented, room/fixture-separated held-out data from real phones. Freeze and record the evaluated provider/model/prompt/rubric/stage configuration and candidate policy; predictions must come from actual evaluations, not the currently closed deployment gate.
2. Establish at least **100 held-out DIRTY** and **100 known wrong/replayed** examples, **zero wrong/replayed candidate passes**, and **at most 2 false-clean predictions per 100 DIRTY**. Report CANNOT_ASSESS, coverage failures, uncertainty, latency/cost and per-fixture-type performance. Missing/contradictory stage evidence and sparse types remain blocked.
3. Complete native physical reliability, SQLCipher/privacy, real protected storage checks and a controlled operational pilot. Customer/native readiness and production migration safety require separate review.
4. Review the actual evaluation evidence and make a separately scoped gate change binding allowed fixture types to the evaluated configuration. Preserve deterministic presence, privacy, duplicate/identity, mandatory views, epoch and completion guards. No such change is authorized or made here.

**Ready for step 20 execution: NO.** The local source/tooling checks are green and ready for external validation and step 20 runbook review. Missing device/live-storage/held-out/pilot evidence prevents declaring full step 19 acceptance or universal rollout readiness. All work remains uncommitted; no commit/push/deployment was made.
