# Launch photo receipt and replacement — specification20

## Submission receipt

Staff finishing is separate from verification/manager review. Every mandatory view of a mandatory item must have its exact current received, checked attempt with media metadata, bound to the same task/staff/assignment ID/epoch. Missing, processing, recapture or cleaning-required requirements cannot be covered by another view, an older photo or an incomplete reservation. Review/privacy/service outcomes with genuinely received media remain review, never automatic cleanliness credit.

A legacy WAIVED label is not sufficient. The exact requirement must have a persisted WAIVE_REQUIREMENT decision at decisionVersion-1 for the same task, attributable to a retained ADMIN/MANAGER record in the same company. Inactive past managers are retained historical provenance, not current authority to issue a waiver. Bare/stale/cross-task/foreign-actor waiver states are rejected. The valid waiver supplies only that requirement's receipt; every non-waived mandatory view still needs its own current receipt. A waiver grants no presence/privacy/identity override or verified-work claim.

Existing finalization checks remain. Mixed authorized waiver plus review receipts may record staffSubmittedAt while persistent task status/completionOutcome still reflect unresolved manager verification. Existing completed/staff-submitted retries remain idempotent. Sequential activation/reservation uses the same scoped waiver receipt check so a proven waived prior view does not block remaining capture steps; naked labels never bypass receipt checks.

## New immutable failed-view generation

Existing retakeSlots and fresh QR rework remain the only allocation paths. Before a mandatory requirement replacement:

- Current active unsubmitted IN_PROGRESS/NOT_COMPLETED_INTIME task and authorized same staff/task/assignment epoch; current session belongs to the current assignment ID; existing capture/upload deadlines still open.
- Exact requirement expected decision generation, mandatory item/view and currentAttemptId.
- Server-received current failed attempt bound to the same requirement/task/staff/assignment. Its immutable slot generation must be decisionVersion-1, reflecting the decision for that captured generation.
- RECAPTURE_REQUIRED requires the exact RECAPTURE_REQUIRED attempt; REVIEW_REQUIRED can replace only its explicit PRIVACY_HOLD attempt. Uncertain review, processing, reservation and service failure are not proven failed views and cannot allocate a new capture. Check/retry the same capture result instead; no new timer or result is invented.
- CLEANING_REQUIRED requires an exact failed cleaning attempt and the existing fresh task QR rework path. Existing same-session dirty retake denial remains. No retired manager retake/window-extension action is enabled.

Normal fresh-QR renewal also checks failed-view proof before reallocating RECAPTURE_REQUIRED; it is not a bypass around retake guards. Missing/abandoned unreceived reservations remain recoverable under existing renewal rules. Current successful/accepted/waived work and submitted tasks cannot be replaced. New allocation increments generation, clears the current pointer where the existing retake path does so and creates a new slot/nonce; old slot, attempt, media and result stay unchanged. Same exact allocation retry can return its existing allocation, never a second generation.

Legacy required room-context replacement similarly requires a server-received failed context attempt, exact context/generation and current assignment; passed context cannot be replaced. Retired context keys remain unavailable. A privacy hold permits a new screened capture, never accepting/revealing the held original.21 supplies actual qualification/privacy gates; no fixture-attestation or redaction guarantee is added here.

## Existing reconciliation retained

Same session/clientCaptureId still reconciles only identical hash/slot/nonce/time/boot/spatial metadata; different bytes require a new authorized generation. Existing direct-photo processing ownership, lost-response/status checks, upload/capture/QR/assignment/device checks and rate/slot limits remain.20 does not introduce offline photo guarantees, manager rework extensions, new deadlines, provider/model thresholds or a new queue.

Composition26 consumes these guarded services; web36/native37 must use server outcomes and retain drafts/uncertain upload state. They cannot infer replacement authority from a disabled button or a REVIEW_REQUIRED label alone. Actual photo qualification and live device/provider/end-to-end proof remain21/39/40.

## Local verification only

`npm test --prefix backend -- src/services/verification-v2/launchPhotoPolicy.test.ts` plus affected capture/submission/sequential/controller regressions, whole backend suite, TypeScript/build. Guarded SQL proof:

`LAUNCH_PHOTO_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/launchPhoto.integration.ts`

Synthetic metadata only: new immutable failed-view generation and allocation retry, old slot/attempt unchanged, proven legacy waiver plus review receipt submits without verified credit, submitted replacement and missing mandatory view denied. No actual photos, provider request or production mutation. All fixture snapshot fields satisfy existing SQL constraints; no migration is changed.
