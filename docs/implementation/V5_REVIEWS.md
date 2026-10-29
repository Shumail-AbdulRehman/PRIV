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

## Recorded-state continuation — 2026-10-29

The independent branch `implementation/v5-review-states` extends the accepted core
without repeating its audit. Setup-only records now state that no task was generated,
link the existing setup destination and offer no staff closure decision. Their reason
callout also gives setup guidance. Closed task reviews use the approved V5 saved
outcome/note/actor/site-local-time panel. A real next-pending action preserves filters
and falls back to the first pending API row when the current queue is exhausted;
no next record is invented. Urdu review tabs/options use review-specific vocabulary.
Failed queue refresh hides earlier counts/rows instead of presenting them as current.

The actual SQL/API browser state extension covers setup closure409, saved closure
reload with unchanged task outcome, persisted HOLD metadata taking precedence over
older cleaning state, private bytes/site403,25-record paging/next, delayed request
loading and labelled network-abort/retry. Five cases pass in51.3s;32 EN/UR desktop/
phone state observations have no overflow/page JS errors. Forty PNGs include four
V5 references and four focused decision viewports; these counts are not accepted
screen counts. Direct paired/state inspection corrected the contradictory setup
callout and Urdu tab leak before final captures. Evidence and precise provenance:
[v5-review-state-evidence/README.md](v5-review-state-evidence/README.md).

Current isolated branch verification:36 focused review React checks;64 Node +282
whole React tests/21 files pass; frontend full lint0, managed frontend/backend
TypeScript/private production builds, final `npm run build --prefix frontend` and
standalone strict E2E TypeScript pass. Validator42 specs/0errors/12 existing warnings.
Source checkpoints f589992→0b94928→4cf5e76→10fb4a4. Spec36 stays In progress:
no provider image bytes, real privacy/photo qualification or native device acceptance
is claimed. A persisted HOLD synthetic record is not a successful provider fixture.
Shared tracker/handoff and Spec40 ownership are integrated only by the coordinator.

Recorded-state continuation published as OPEN/DRAFT [PR96](https://github.com/Shumail-AbdulRehman/PRIV/pull/96), base `implementation/v5-workforce-final`/8ff718e; issue84 remains open. No earlier draft branch was rewritten or merged. The persistent review worktree contains only the intentional untracked approved-design symlink beyond the published source/evidence.

## Single-spec acceptance continuation — 2026-10-29

Status: **Blocked for full acceptance; scoped web implementation and local visual
verification complete.** The first Spec36 criterion remains unchecked. Only36 was
implemented; no other unfinished specification was started or marked complete.

Reused the accepted queue/detail/closure/qualification/evidence implementation at
85e64f5 (Spec38/PR103), including review-state PR96 ancestry and completed20/21/27.
Added failed-detail-refresh submission guards without losing notes, selected-issue
replacement explanations, distinct review401/403/404/410 feedback, localized save
denial and cleared obsolete conflicts after actual version recovery. Added named
keyboard-pannable image regions,44/48px zoom targets and dialog focus restoration.
The existing evidence service now keeps authenticated delivery mandatory for HOLD
review; role/site/task/original restrictions remain. No processing or retired
manager authority was added.

### Fresh verification

- Focused review components:50pass; backend receipt/replacement/qualification/read/
 closure/list/security:89pass. The full backend suite passes1444tests with7existing
 integration skips (94files passed,1skipped). No backend lint script exists.
- Full web:64Node+386React/28files with one worker, no skipped tests. Full frontend
 lint, backend build/TypeScript, frontend build/TypeScript, strict browser TypeScript
 and native TypeScript pass. Native's unchanged suite passes106tests.
- Actual isolated PostgreSQL17 launch-photo, launch-composition and manager-closure scripts pass.
 They verify receipt/submission without verification credit, immutable replacement/
 exact retry, submitted/missing/stale denial, task-start/check-in CAS and retained
 entitlement boundaries. They do not run photo providers.
- Scoped managed browser:15cases pass in3.1m;6core+32recorded+20new observations,
 58total, with no page overflow or JS errors.117PNGs (45core/40recorded/32new)
 capture1366/390 EN/UR plus1920core views. Paired actual/reference and changed-state
 panels were inspected; automatic geometry checks supplement that inspection.
 Successful images are explicitly intercepted presentation fixtures, not provider proof.
- Spec validator42specs/0errors/12documented warnings; whitespace check passes.
 Mechanical detector has one inherited V5 queue-accent warning, retained because
 it matches the fixed reference. No new design/prototype/token was introduced.

Commands use the existing npm scripts and guarded runner. Full-suite web command:
`npm test --prefix frontend -- -- --maxWorkers=1` (64Node, then all386React).
Parallel runs occasionally exceeded the unchanged shell test's one-second lazy
fixture wait; the standalone26shell tests and whole serial suite pass without
changing assertions/timeouts/source. Initial harness failures bound a missing-view
issue to no requirement and attempted an insertion the SQL privacy constraint
correctly forbids. The fixture now links its real synthetic view and asserts23514;
no constraint was disabled. A stale saved-note selector was scoped to its existing
Decision recorded region because the note legitimately appears in two panels.
One browser batch was stopped for a feedback correction; the final15-case run
passes. The keyboard check found and drove the actual focus-return fix.

Initial native TypeScript used the old shared install without a direct expo-font
entry. Using the accepted native worktree's dependency layout (same declared pinned
version, read-only symlink) passes. No package/native source changed. Native tests
and web viewports cannot establish native rendering/camera/GPS/QR/provider behavior.
Vite plugin-timing and existing pg concurrency deprecation advisories are non-failing.

### Design evidence and remaining gate

Evidence: [v5-review-acceptance/README.md](v5-review-acceptance/README.md), source and
image hashes in its manifest. Earlier evidence directories remain unchanged; fresh
outputs were copied into this distinct acceptance directory. Matching missing/closed
references and EN/UR desktop/phone panels show the same blue/white queue, evidence,
facts and decision hierarchy. Wider views keep the decision rail; phones inspect
evidence before decisions. Actual dates/status/identities, priority ordering,
unknown qualification and additional capture rules intentionally replace sample facts.
The new errors, preserved notes, keyboard viewer, zoom targets and return focus are
verified locally. No prototype future-AI/reviewer tool or deprecated action ships.

The active adapter still reports `privacyAssessment:false` and
`fixtureIdentityAssessment:false`; no configuration flag creates those capabilities.
No approved authenticated retained-media provider fixture and no native runtime are
available to close the existing full-acceptance gates. Available original-checkout
credential names are not proof of consent, an isolated test account, measured safety
or independent qualification; their values were not loaded or used. Processing and
automatic approval remain disabled. Successful HTTP fixture images and persisted
HOLD metadata are not claimed as privacy/AI/provider evidence.

The declared prerequisites20/21/27 remain Done for their existing contracts. This
unit does not implement a new photo evaluator, activate providers or start37/40.
Full36is Blocked until qualified retained-media/privacy evidence and applicable
native runtime acceptance are supplied and genuinely verified. No existing acceptance
criterion was removed or marked complete on the basis of fixtures/builds alone.

The existing manager-closure integration fixture needed current synthetic billing
entitlements (including its foreign-company actor) and the real typed access-token
helper. Legacy subscriptionStatus/untyped JWT fixtures correctly failed current
guards. Only that test setup changed; its real owner/manager/staff/tenant denial,
performance attribution across reassignment, period filtering, idempotency,
concurrent200/409 and failed-KPI transaction rollback assertions now pass. No guard
was bypassed. Standalone strict types run from backend with Node/Multer and operator
Request augmentation. This is the third actual SQL suite, separate from15browser cases.
