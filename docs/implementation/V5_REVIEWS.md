# V5 Photo Reviews correction — issue84 / spec36

Status: **incomplete overall acceptance**. The real queue/evidence/decision workspace
is implemented. This checkpoint does not certify every review/provider/state or the
rest of the V5 application. Earlier spec36 completion records remain historical.

## Implementation

Existing `/exceptions` and `/exceptions/:id` now share the approved V5 workspace:
vertical pending/reviewed queue, actual scoped filters/search/pagination, reason
callout, evidence card, current-view thumbnails, task/evidence facts, and manager
closure panel. Wide screens place decisions beside evidence; ordinary desktops put
them beneath the task record. Phones show either the queue or selected detail,
with evidence before decisions and a working return link. EN/UR use logical layout.

`ReviewDetail` preserves the original authorized reads, receipt, next lookup,
diagnosis, privacy distinctions and invalidation. `ProtectedEvidence` reuses the
credentialed blob endpoint for thumbnail/default/workspace variants, with bounded
zoom, fit, enlargement, abort/URL cleanup and explicit unavailable/denied/retry/decode
feedback. A thumbnail contains no nested interactive viewer.

The decision form uses only backend closure permissions. Resolve is initially
selected; recording staff performance remains deliberate. Notes survive view
selection and conflicts. Leaving the review still offers stay/leave. A conflict
locks stale resubmission until a new row version arrives; refresh retains the note.
Existing request idempotency, attribution, mandatory notes and business rules remain.
Closing a review does not submit work or verify evidence.

The bounded modern list adapter now accepts the existing optional reason-code
filter within company/site scope. Queue counts and next lookup share that predicate.
No schema, dependency, qualification, authorization or ordering change.

## Independent acceptance facts

| Fact | Evidence / remaining limitation |
|---|---|
| Functional implementation | Existing contracts retained; scoped reason filter and draft behavior corrected |
| Visual implementation | V5 queue/evidence/task record/decision composition in real React, blue/white shared tokens |
| Functional verification | Full web/backend suites and six guarded browser cases; retained live media/provider delivery remains unqualified |
| Visual verification | Paired references and actual SQL-backed missing-evidence queue/detail at1366/390/1920 ×900 EN/UR; separate labelled HTTP image presentation captures. Broader resolved/setup/held/large-queue state acceptance remains open |

## Verification

- `npm test --prefix frontend`:64 Node utility tests; initial full React225/18files.
- After adding image-decode feedback: full React226/18files, zero failures.
- `npm test --prefix backend`:1441 passed,7 existing SQL skips,94 files passed/1 skipped.
  Focused review-list tests4 passed (including reason scope and validation).
- Frontend lint: zero findings. Frontend TypeScript + production Vite build passed;
  the guarded browser runner also compiles backend and production web from this checkout.
- Guarded spec40 runner: six cases passed: real EN/UR responsive queue/detail,
  actual reason filter/empty/foreign-site denial, actual concurrent version conflict,
  labelled HTTP image viewer presentation, persisted manager closure, task QR/retired
  action denial. SQL closure proof confirms task submission/outcome unchanged.
- Six width/language observations have no horizontal overflow or browser JS errors;
  assertions check queue visibility, evidence-before-decision geometry and modal bounds.
- An initial run failed because closure preceded pending-queue capture; test ordering
  was corrected. Another API assertion accidentally exercised the legacy unpaged
  endpoint; it now explicitly tests the modern scoped adapter. No production policy
  was changed to satisfy either assertion.

Latest screenshots and provenance: [v5-review-evidence/README.md](v5-review-evidence/README.md).
Final capture/checkpoint results are recorded there and in the spec log.

## Intentional differences and remaining work

- Real API ordering is priority, then oldest first; the UI labels it accurately
  instead of claiming V5's newest-first sample order.
- The backend exposes Pending, Reviewed, Waiting for staff and Checks pending
  queues. The latter two remain in review filters; no fabricated combined All count.
- Existing service qualification/replacement explanations remain explicit. No new
  processing or automatic approval is enabled. No prototype future AI panel ships.
- Actual receipt/submission/closure/verification facts replace fictional prototype
  timestamps, identity, totals and outcomes. All unavailable facts remain unknown.
- Task facts include more service/capture context than the sample task record.
  Optional findings/capture rules remain available in a disclosure.
- A next-review lookup and safe filter-preserving links remain visible. Page sizes
  and pagination are retained for real datasets absent from the tiny V5 sample.
- The synthetic SQL fixture has no retained photo. Successful thumbnail/enlargement
  captures use an explicitly intercepted HTTP fixture, never proof of storage-provider
  delivery, real AI evaluation, privacy qualification or native capture.
- Full recorded closed/setup/held/multi-review/next-page visual acceptance, and
  production-provider/native-device acceptance, are not certified here.

No production service/database, provider activation, merge, reset or force push.
All eight unrelated tracked diffs remain byte-for-byte unchanged; original handoff
append and unrelated untracked files are preserved and excluded from this correction.

Implementation `d64e0ea` published as OPEN/DRAFT [PR85](https://github.com/Shumail-AbdulRehman/PRIV/pull/85), base `implementation/v5-visual-corrections`/PR83. Independent detached-worktree `/tmp/hygene-v5-review-clean-d64e0ea` passes backend/frontend builds and64Node+226React tests without user performance changes. Final six-case browser rerun passes in36.7s; final captures re-inspected.

