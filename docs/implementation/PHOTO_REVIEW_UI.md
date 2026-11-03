# Truthful task and photo review

Spec36 consumes completed20 receipt/replacement,21 safety qualification and27 approved v5 shell. Independent branch `implementation/spec-36-photo-review-clarity` is based on shared37, including its one-line native translation import compatibility fix26000a7. It does not consume31 implementation.

Existing React `/exceptions` and `/exceptions/:id` now expose persisted task submission separately from review closure and evidence verification. `LaunchReviewContext` counts only current-view `receivedAt` receipts, shows the recorded submission time/site timezone, latest saved closure decision/manager/note, and verifies completion only when `completionOutcome=VERIFIED_COMPLETE`. Missing task information remains unknown. Uploaded, submitted, reviewed and verified are never inferred from one another. Resolved legacy cases without a saved closure decision display that limitation.

The existing detail read adapter still calls caseAccess before data reads. Its per-requirement `replacement` DTO uses20's actual failed-view guard with current assignment, task/staff/epoch, current attempt, source-slot generation and existing capture/upload windows. It reports `policyEligible` independently from21's `processingAllowed`, `automaticApproval` and effective `available`. Only guard-required session columns are loaded internally; no nonce, device ID, QR, session authority or raw provider result is exposed. This is a read-only explanation; staff mutations still enforce all access, QR, device, generation and transaction rules again. Cleaning remains fresh-task-QR rework. Review-service uncertainty cannot grant replacement.

The active21 adapter remains disabled pending real privacy/empirical qualification. UI reflects this server fact, including when a failed view would otherwise meet replacement rules. Nothing here activates providers, grants manager retakes/extensions/waivers, or fabricates AI results/confidence. Only current resolve-with-note/performance-issue closure actions remain available through the actual closure API.

Protected evidence remains credentialed blob access.403/401 access denial,404/410 unavailable evidence and retryable network/service failure have distinct feedback. Held images without authorized review mode are never fetched; manager-held evidence still passes through the same protected content endpoint. Object URL cleanup/abort/zoom are preserved. Privacy hold/provider failure explain review uncertainty even if an old requirement label says cleaning.

## Verification and limits

- Component tests cover the actual parent detail query and closure POST, queue rendering, persisted closure attribution, submission/verification distinctions,403 denial,409 draft retention, intentional staff performance closure, EN/UR/RTL, absent data, server eligibility and protected blob authorization/unavailable/service states.
- Backend tests exercise real Express detail routing with an injected Prisma boundary, case authorization before extra reads, current assignment/submission denial, safe DTO projection, and20 guard/21 qualification reuse. Existing private-evidence and authorization regressions remain in scope.
- Local browser captures render actual React with synthetic HTTP fixtures on loopback5196, English/Urdu,1440/390px, outage/resolved/missing/denied states. They prove layout/rendering only; they are not backend/database/provider E2E proof. Logs/captures `/tmp/hygene-spec36-render.log` and `/tmp/hygene-spec36-visual/`; no prototype was changed.
- No production data/configuration, database migration, new dependency or real photo processing. Existing real SQL policy proofs remain20/26; integrated whole-product/live-provider/device gates remain40/41.
- Shared tracker/handoff/40 consumer documentation is updated by the coordinating agent after independent review, avoiding concurrent edits.

## Single-spec continuation — 2026-10-29

Issue84 continues from dependency-complete Spec38 checkpoint85e64f5. Existing
implementation is reused. Failed detail refresh now leaves the note intact and
blocks decisions until actual detail recovery.401/403/404/410 remove cached private
detail and display review-specific EN/UR feedback. Issue deep links show their own
requirement's replacement policy. A newer server version clears obsolete conflict
feedback; uncertain-result retries retain their original request identity.

Protected evidence remains credentialed review bytes. Keyboard users can pan a
zoomed image in named inline/enlarged scroll regions, and closing the dialog returns
focus to the actual opener. Zoom targets meet44px desktop/48px phone minima.
HOLD review still requires authenticated delivery, role/task/site authorization and
a review derivative; it cannot reveal an original or make evidence acceptable.
The existing database constraint also rejects public evidence rows. No storage or
qualification restriction was disabled for the checks.

Fresh checks/evidence and precise full-acceptance blocker: `V5_REVIEWS.md` and
`v5-review-acceptance/README.md`. Actual privacy assessment remains absent from the
active adapter; no qualified retained-media fixture/native runtime is certified.
Existing configuration keys cannot manufacture that capability. No new AI result,
production photo access, provider activation or native acceptance is claimed.
