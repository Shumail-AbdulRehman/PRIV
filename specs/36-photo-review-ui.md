# Spec 36 — Truthful task and photo review UX

**Status:** In progress
**Depends on:** Spec 20, Spec 21, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #84
**Owns:** `backend/src/services/reviewList.service.ts`, `backend/src/services/reviewList.service.test.ts`, `frontend/src/pages/Exceptions/LaunchReviewContext.tsx`, `frontend/src/pages/Exceptions/LaunchReviewContext.test.tsx`, `specs/inventory/36-photo-review-ui.md`, `docs/implementation/PHOTO_REVIEW_UI.md`, `frontend/src/pages/Exceptions/ExceptionDetailPage.tsx`, `frontend/src/pages/Exceptions/ExceptionInboxPage.tsx`, `frontend/src/pages/Exceptions/types.ts`, `frontend/src/pages/Exceptions/reviewDiagnosis.ts`, `frontend/src/pages/Verification/ProtectedEvidence.tsx`, `frontend/src/i18n/reviewTranslations.ts`, `frontend/src/pages/Exceptions/launch-review.css`, `backend/src/services/verification-v2/launchReviewContext.ts`, `backend/src/services/verification-v2/launchReviewContext.test.ts`, `backend/src/routes/verificationException.route.ts`, `backend/src/routes/verificationException.launchReview.test.ts`, `frontend/src/pages/Exceptions/ReviewDetail.tsx`, `frontend/src/pages/Exceptions/ReviewWorkspace.test.tsx`, `frontend/src/pages/Exceptions/review-workspace.css`, `frontend/src/pages/Exceptions/DecisionForm.tsx`, `docs/implementation/V5_REVIEWS.md`
**Reuses:** `frontend/src/pages/Exceptions/DecisionForm.tsx`, `frontend/src/pages/Exceptions/ReviewSummary.tsx`, `frontend/src/pages/Verification/ProtectedEvidence.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/reviews.html`

## Goal

Truthful task and photo review UX in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Polish existing review queue/detail per approved design; received/submitted/reviewed/verified remain distinct. Display server replacement eligibility and qualification limits; current closure outcomes only, no retired extension/waiver controls. Wire through existing detail ownership handoff.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Ownership handoff

Existing detail, queue, diagnosis and protected evidence are extended in place; spec26 transfers only the detail read adapter, retaining write/authorization policies. Coordinator owns final shared translation registration, serializing the review-only import/lookup with31. No dependency on31. New read context consumes20 replacement guards and21 qualification; no authority is granted by the DTO.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/pages/Exceptions/LaunchReviewContext.test.tsx` passes: Review closure does not render verified; outage/held photo distinct from dirty; forbidden actions absent and enforced API-side. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Issue66 claimed before code. Dependencies20/21/27 verified Done and present in shared37 ancestry; branch independent of31. Read approved design/v5 review sources; extended existing React queue/detail and protected blob component, no prototype/new HR functionality. Read-only replacement context consumes actual20 guard and21 qualification, separating recorded policy eligibility from safe-disabled processing. Uploaded/submitted/attributed manager closure/verified outcome remain distinct; closure note and performance intent use existing API. Held/service uncertainty precedes stale cleaning labels;401/403/404/410/network evidence feedback distinct; EN/UR responsive facts layout.
- **2026-10-21** — Files: Owns paths plus coordinator-serialized review import/lookup in translations.ts;26 ownership transferred before source edits. Common37 prerequisite26000a7 fixes inherited native translation module resolution, with no31 implementation consumption. Relevant frontend focused22; full57 Node +124 components/11files; full lint zero errors/warnings; frontend/backend TypeScript checks and frontend build pass. Backend98 focused tests/9files (17 new read-policy/Express tests,61 existing replacement/qualification/closure,20 authorization/private evidence/queue). Logs `/tmp/hygene-spec36-{focused,frontend-tests,lint,frontend-type,build,backend-type,backend-focused,backend-read,security}.log`; mechanical UI detector `[]`.
- **2026-10-21** — Actual React synthetic HTTP render inspection covers16 EN/UR390/1440 outage/resolved/missing/denied captures, zero overflow/JS errors; `/tmp/hygene-spec36-render.log`, `/tmp/hygene-spec36-visual/`. No integrated SQL/provider/E2E claim from these fixtures. No schema/dependency/production change; real processing remains disabled21 pending actual safety qualification. Coordinator owns shared tracker/handoff/40 consumer updates and independent combined full backend/build verification.

- **2026-10-21** — Published implementation `e3c3f4a` on `implementation/spec-36-photo-review-clarity`: issue66 https://github.com/Shumail-AbdulRehman/PRIV/issues/66 and OPEN/DRAFT PR67 https://github.com/Shumail-AbdulRehman/PRIV/pull/67, base `implementation/spec-37-native-integrated`, independent of31. Coordinator independently reviewed actual source diff, original replacement guard/authority whitelist and EN/UR rendered captures. Safe combined31+36 verification passed backend1433 tests/94files/zero skips; web57 Node +142 components/12files; full frontend lint zero findings; backend/frontend builds including TypeScript pass. These combined checks and synthetic rendering do not constitute integrated whole-product/provider E2E proof. No merge/deployment/production data change. Shared progress/handoff updated by coordinator only.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-22 — Issue84 continuation:** serialized visual correction owns combined queue/detail composition and existing decision form presentation/draft navigation. New ReviewDetail module extracts the incumbent detail logic; media stays on the same authenticated seam. Spec40 consumes these paths through its screenshot/closure flows. No backend/schema change or new review authority.

- **Issue84 scope clarification:** the modern bounded queue adapter consumes the existing optional reason-code filter already available on the legacy endpoint. Add that optional scoped predicate and focused service tests; do not change authorization, ordering, schema, closure policy or processing.

- **2026-10-22 — V5 workspace correction:** implemented actual existing routes with shared queue/detail, filters, evidence/task facts/decisions, EN/UR responsive layouts, private thumbnails and inline/modal viewer. Existing closure/qualification/authorization remain authoritative. Backend reason-filter predicate is the only API extension; no schema/dependency change. Full web64Node+226React, backend1441pass/7existing skips, focused4backend+28reviewReact, lint0/TS/Vite build. Six guarded browser cases pass;45 screenshots include paired actual SQL-backed pages and explicitly labelled HTTP image presentation states. Native/live photo-provider/full36acceptance not claimed; see V5_REVIEWS.md and its open gates. Historical issue66/PR67 logs preserved; current correction issue84.

- **2026-10-28 — Independent recorded-state continuation:** issue84 claimed before edits, base8ff718e; dependencies20/21/27 Done. Existing `DecisionForm`/`ReviewDetail`/queue/translation ownership retained for truthful SETUP-without-task state and V5 saved-decision facts. No new closure authority/provider activation. Coordinator owns spec40 registration of distinct `frontend/e2e/review-states-v5.spec.ts` and `v5-review-state-evidence`, shared progress/handoff/ledger and final integration. Real configured provider/native qualification remains separately gated.

- **2026-10-29 — Recorded-state verification:** persisted source f589992/0b94928/4cf5e76/10fb4a4 in isolated implementation/v5-review-states. Correct setup/no-task/no-staff-decision copy and V5 saved closure/actor/time/note/real next-pending composition; hide stale queue facts after failed refresh; correct Urdu review captions.36 focused React,64 Node+282 full React/21files pass; frontend full lint0; managed frontend/backend TypeScript/private production build, final `npm run build --prefix frontend` and strict E2E TypeScript pass. Validator42specs/0errors/12existing documented warnings. Five actual SQL/API state cases pass51.3s,32 EN/UR1366×900/390×900 state observations without overflow/JS errors;40PNGs include V5 refs and supplemental decision viewports. Existing core accepted evidence not repeated. Initial clone-deadline fixture and loading-route harness failures corrected without policy changes. Source/ref inspection corrected contradictory setup callout/Urdu leak. No backend/schema/dependency/processing-authority changes. See V5_REVIEWS.md and v5-review-state-evidence/README.md for limits; retained provider/private-image bytes, actual privacy/photo and native qualification remain unverified, so36 stays In progress. Coordinator serializes40ownership/progress/handoff.

- **2026-10-29 — Review handoff:** published as OPEN/DRAFT [PR96](https://github.com/Shumail-AbdulRehman/PRIV/pull/96), base implementation/v5-workforce-final at8ff718e; issue84 stays open. Persistent worktree `/home/shumail/.local/share/hygene-ops/v5-continuation-20261028/reviews`; source10fb4a4, evidence947fdcb/875911b. Untracked design is a read-only approved-reference symlink, intentionally excluded. No merge/force push/deploy. Coordinator owns combined progress/handoff and remaining eligibility.
