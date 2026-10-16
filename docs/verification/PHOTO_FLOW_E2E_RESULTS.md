# Photo workflow end-to-end results — 2026-10-12

## Result

PASS: actual HTTP uploads through the existing authenticated task/capture/review routes, an actual compiled background worker, real Cloudflare Clef assessment and real authenticated Cloudinary uploads. Test tasks were created in a fresh isolated PostgreSQL database; the application/customer database was not changed. Synthetic cloud objects were deleted after testing.

Two live tasks exercised a clean submission and a dirty submission followed by a fresh QR-authorized cleaning retry. Both reached `COMPLETED_WITH_EXCEPTIONS` through audited administrator acceptance and left the waiting-for-review list. Submission alone did not verify them.

## Measured live timings

Time starts immediately before multipart HTTP upload and ends when the status endpoint reports its terminal result. It includes encrypted staging, queue wait, AI, applicable Cloudinary upload and test polling. It excludes capture/preparation on a physical phone.

| Photo | Temporary receipt | Final result | Result | Storage |
|---|---:|---:|---|---|
| clean-context | 395 ms | 6.56 s | REVIEW_REQUIRED | cloud |
| clean-fixture | 104 ms | 4.53 s | REVIEW_REQUIRED | cloud |
| dirty-context | 102 ms | 4.57 s | REVIEW_REQUIRED | cloud |
| dirty-fixture | 112 ms | 2.98 s | CLEANING_REQUIRED | discarded |
| dirty-after-cleaning | 87 ms | 5.82 s | REVIEW_REQUIRED | cloud |

The rejected dirty image returned named dirty-surface instructions, had no Cloudinary original (resource lookup returned 404), and its temporary encrypted buffer was removed. Reviewable evidence was uploaded before publishing the final result; its temporary buffer was then removed.

All live synthetic photos were classified as uncertain origin. They therefore required manager review. No threshold was relaxed to force automatic acceptance. Automatic clean acceptance also remains gated by the configured calibration/release. This test confirms workflow behavior, not cleanliness/originality accuracy on real field photographs.

## Bugs found and fixed

1. Accepting a context photo did not resolve its same-photo origin uncertainty issue, leaving the case blocked. The existing audited context action now resolves that specific issue while keeping other photos/issues independent.
2. A cleaning retry preserved the old context photo, but completion did not recognize the manager's acceptance of that photo across the new session. Completion now follows the server-preserved authorized evidence IDs. This does not inherit GPS/presence or assignment overrides into the renewed session.
3. Staff context feedback lost the photo-origin reason when no cleanliness assessment was applicable. Staff feedback now retains that policy reason and corrective instruction.

## Controlled coverage

Five HTTP scenarios: clean, dirty followed by cleaning, screen-photo followed by retake, uncertain origin, and uncertain-origin context plus cleaning retry. The last scenario deliberately made the new session's presence uncertain and proved that acceptance of preserved context cannot authorize completion until that session's own presence requirement is satisfied.

The HTTP suite also checks incorrect QR, early submission, hash mismatch, another worker's upload, future/out-of-window capture, idempotent same-capture retry, buffered receipt, final storage state, one PHOTO job, temporary-file removal, staff submission, audited manager decisions, completion outcome, and queue removal. The separate buffered database suite covers provider failure, upload failure/retry and persisted assessments. Legacy lifecycle tests cover epochs, privacy holds, presence, deadlines and completion races.

## Regression results

431 backend, 75 mobile and 38 web tests passed (544 total). Backend build, the controlled HTTP suite, the live HTTP suite, the isolated buffered suite, legacy lifecycle integration and whitespace checks passed. The development worker was restarted with the updated compiled code.

## Reproduce

From backend, with an isolated local PostgreSQL URL whose database name starts with `priv_verification_test`:

```bash
VERIFICATION_TEST_DATABASE_URL=postgresql://verification:verification-test-only@127.0.0.1:54329/priv_verification_test_manager npm run test:verification:photo-http
```

For live providers, first build backend, then run the same command with `PHOTO_FLOW_LIVE=1`. Existing backend environment credentials are required; this makes billable provider requests. The test guards against using the application database. CI runs controlled providers only.

Machine-readable evidence: `evidence/photo-flow/controlled-report.json`, `live-report.json`, synthetic JPEG inputs and `live-worker.log`.

## Limitations

Attendance was seeded checked-in; physical attendance capture was not exercised. QR scanning, GPS and camera metadata were supplied programmatically, not through a real device. The required entrance/context slot used a synthetic sink image to test transport/state, not scene correctness. Native camera, app rendering, reconnect/force-kill behavior and actual mobile-network performance still need physical-device testing. Mobile status polling is approximately 2.5 seconds, versus 250 ms in this harness, so visible phone feedback can arrive later. Remote production-database latency and concurrency/load were not benchmarked.
