# Spec36 — task and evidence clarity

- `frontend/src/pages/Exceptions/LaunchReviewContext.tsx`: persisted current upload receipts, submission, attributed closure note and verified completion independently rendered; replacement policy versus qualification limits. Reuse in existing detail only; no new route/state framework.
- `frontend/src/pages/Exceptions/ExceptionDetailPage.tsx` and `ExceptionInboxPage.tsx`: actual network-backed integration, queue submission/review facts; no submitted-as-completed label. Existing DecisionForm closure intents unchanged.
- `frontend/src/pages/Exceptions/reviewDiagnosis.ts`: explicit held/service uncertainty precedes stale dirty labels.
- `frontend/src/pages/Verification/ProtectedEvidence.tsx`: same credentialed blob/abort/object URL/zoom seam; distinct denied/unavailable/retryable errors and no recapture promise for restricted images.
- `backend/src/services/verification-v2/launchReviewContext.ts`: read-only per-view policy explanation using actual20 failed-view guard and21 qualification. Assignment binding checked by authorized detail adapter; DTO exposes no authority. Staff writes must recheck independently.
- `frontend/src/i18n/reviewTranslations.ts`, `launch-review.css`: feature-specific EN/UR copy, semantic approved v5 responsive facts layout; coordinator serializes shared translation registration.
- `docs/implementation/PHOTO_REVIEW_UI.md`: consumers, safety boundary, verification meaning and limitations for40/41. No real processing activation/provider claims.

## V5 correction — issue84

- `ExceptionInboxPage.tsx` is the shared paginated queue/workspace for both existing `/exceptions` routes; `ExceptionDetailPage.tsx` retains the lazy route entry. `ReviewDetail.tsx` contains the preserved authorized detail queries, next lookup, receipt, diagnosis and closure invalidation.
- `review-workspace.css` applies existing V5 tokens to queue/evidence/decision composition and EN/UR responsive layouts. Old mobile action-first ordering is explicitly overridden.
- `ProtectedEvidence.tsx` adds authenticated thumbnail/workspace variants to the existing default viewer; inline zoom/fit, enlargement, decode failure, abort/object URL cleanup and authorization remain in one component.
- `DecisionForm.tsx` keeps backend-supplied closure choices, request idempotency and notes; view selection does not discard notes, and conflicts disable stale resubmission.
- `backend/src/services/reviewList.service.ts` applies the optional bounded reason filter inside the existing company/site scope, shared by the queue/count/next operations.
- `ReviewWorkspace.test.tsx` checks draft navigation, conflicts, protected thumbnails, bounded zoom, decode errors and blob cleanup; spec40 owns integrated browser and screenshot evidence.
