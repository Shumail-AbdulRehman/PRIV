# Staff photo latency investigation — 2026-10-18

The main measured problem is database network latency multiplied by many SQL
round trips. The inspected queries are inexpensive inside PostgreSQL. The AI
is substantially faster than the reported 30-second photo wait in the samples
available here. This does not establish that every provider call is fast.

Machine-readable measurements: [PHOTO_LATENCY_2026-10-18.json](PHOTO_LATENCY_2026-10-18.json).

## Evidence

- Read-only probes against the configured application database: connection
  establishment 1,850 ms; five successive `SELECT 1` requests took 403, 296, 308,
  286 and 432 ms from this environment.
- `EXPLAIN ANALYZE` server execution: `SELECT 1` 0.026 ms; recent-attempt count
  0.769 ms; a company-attempt count with an unmatched company 0.089 ms. These
  sample plans do not characterize every production query or a large fleet.
- Existing upload traces recorded reservation taking 9,584 ms and subsequent
  processing taking 18,339 ms, with AI metadata recording only 1,833 ms. That
  photo required recapture and therefore had no Cloudinary upload. A separate
  retained-photo trace recorded 9,388 ms reservation, 22,947 ms processing,
  and 1,858 ms AI time. These traces predate this investigation.
- A fresh live-provider probe using the repository sink illustration took
  58 ms for server image preparation and 1,090 ms for Clef. The image is an
  illustration and the result was uncertain; this is connectivity/latency
  evidence, not accuracy validation. A read-only Cloudinary missing-asset lookup
  took 913 ms and returned the expected 404. No customer photograph was sent.

## Changes

1. Capture reservation, activation, resume and retake now locate the owned
   session with a small read, lock its task, and perform full authority checks
   after locking. Previously they performed full authorization both before and
   after the lock. Role, tenant, active-account, assignment, device and QR checks
   remain. A remapped session is rejected after the lock.
2. Session authorization reuses the task and area it already loaded rather
   than independently fetching the task twice and the area again in reservation.
3. Saving the AI assessment uses a token-conditional atomic update. It no longer
   takes another task lock and rereads the attempt in an interactive transaction.
   A request that loses ownership cannot overwrite the assessment or publish it.
4. Photo publication reuses the attempt already read under its task lock when
   applying the decision. Current state, authority and requirement generation
   checks still run. Other callers retain the normal locking entry point.
5. The staff app reloads the manifest after upload without additionally resuming
   an already active session. Manifest merging supplies current results/session
   state, and the next activation obtains authoritative slot data. Dirty/retake
   QR actions and explicit retry/lost-response reconciliation remain tested.
6. Added `DIRECT_PHOTO_STAGE` timing for access, image preparation, claim, AI,
   assessment persistence, storage, publication and response reads. Added
   `PHOTO_HTTP_FINISHED` for the entire upload route, including authentication,
   transfer and reservation. Logs contain identifiers/timings, never image bytes
   or authentication credentials.

## Controlled before/after

Real HTTP routes and fresh isolated PostgreSQL databases, synthetic 1,000-pixel
photos, a controlled 30 ms AI call, and simulated storage. Each SQL dispatch gets
an extra 100 ms delay to expose round-trip overhead. SQL counts include relation
queries and transaction commands; some operations overlap, so count × delay is
not an exact wall-clock prediction.

| Path, including post-upload refresh | Before | After, final run | SQL calls before → after |
| --- | ---: | ---: | ---: |
| Clean/reviewable photo | 14,110 ms | 10,225 ms | 158 → 116 |
| Dirty photo | 12,725 ms | 8,954 ms | 144 → 103 |

An earlier after run measured 11,524/8,949 ms and 117/103 SQL calls while other
checks were running. Readiness-cache expiry can add one metadata query. These
are individual runs, not statistical fleet benchmarks or measured phone speeds.

## Validation and remaining work

- Backend: 557 unit tests, TypeScript check, isolated direct-photo HTTP integration
  and verification lifecycle integration passed.
- Mobile: 72 tests and TypeScript check passed. Added coverage for advancing to
  another photo without resume, preserving dirty/recapture QR actions, and
  preserving request ownership/authorization under concurrent changes.
- Database changes were confined to disposable local test databases. Configured
  application-database probes were read-only. No deployment or APK was built.
- The existing development watcher compiles source edits and can reload the local
  API. That is separate from deploying a release or updating the installed app.

The largest remaining improvement is reducing network distance between the API
and PostgreSQL. Measure `SELECT 1` from the actual API host before choosing
infrastructure changes. About 100 SQL calls still remain in a retained-photo
upload; evidence persistence, manager-review cases and final response reads are
the next measured candidates for consolidation. Large raw-SQL rewrites or changes
to review semantics were not introduced in this fix. Cloudinary recovery checks,
hash binding and independent server quality checks retain their integrity role.

The mobile request reduction requires an updated app bundle/build. Test one real
phone capture with the new stage logs after updating it; camera preparation,
phone upload throughput and deployed end-to-end timing remain unmeasured here.

## Reproduce

Use an explicitly isolated local PostgreSQL URL whose database starts with
`priv_verification_test`; the harness creates and drops its own fresh database.
Never supply the application database URL.

```sh
cd backend
VERIFICATION_TEST_DATABASE_URL=postgresql://test_user@127.0.0.1:55489/priv_verification_test \
PHOTO_DEBUG_QUERY_DELAY_MS=100 \
PHOTO_DEBUG_REPORT_PATH=/tmp/photo-latency.json \
npm run test:verification:latency
```

Set `PHOTO_DEBUG_RESUME_AFTER_UPLOAD=true` to include the old client's extra
resume request while testing the current backend. This does not restore the
old backend and must not be labelled a complete before-change baseline.
