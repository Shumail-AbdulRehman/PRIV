# Spec36 — task and evidence clarity

- `frontend/src/pages/Exceptions/LaunchReviewContext.tsx`: persisted current upload receipts, submission, attributed closure note and verified completion independently rendered; replacement policy versus qualification limits. Reuse in existing detail only; no new route/state framework.
- `frontend/src/pages/Exceptions/ExceptionDetailPage.tsx` and `ExceptionInboxPage.tsx`: actual network-backed integration, queue submission/review facts; no submitted-as-completed label. Existing DecisionForm closure intents unchanged.
- `frontend/src/pages/Exceptions/reviewDiagnosis.ts`: explicit held/service uncertainty precedes stale dirty labels.
- `frontend/src/pages/Verification/ProtectedEvidence.tsx`: same credentialed blob/abort/object URL/zoom seam; distinct denied/unavailable/retryable errors and no recapture promise for restricted images.
- `backend/src/services/verification-v2/launchReviewContext.ts`: read-only per-view policy explanation using actual20 failed-view guard and21 qualification. Assignment binding checked by authorized detail adapter; DTO exposes no authority. Staff writes must recheck independently.
- `frontend/src/i18n/reviewTranslations.ts`, `launch-review.css`: feature-specific EN/UR copy, semantic approved v5 responsive facts layout; coordinator serializes shared translation registration.
- `docs/implementation/PHOTO_REVIEW_UI.md`: consumers, safety boundary, verification meaning and limitations for40/41. No real processing activation/provider claims.
