# Spec 36 — Truthful task and photo review UX

**Status:** Not started
**Depends on:** Spec 20, Spec 21, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Exceptions/LaunchReviewContext.tsx`, `frontend/src/pages/Exceptions/LaunchReviewContext.test.tsx`, `specs/inventory/36-photo-review-ui.md`
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

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [ ] `npm run test:components --prefix frontend -- src/pages/Exceptions/LaunchReviewContext.test.tsx` passes: Review closure does not render verified; outage/held photo distinct from dirty; forbidden actions absent and enforced API-side. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
