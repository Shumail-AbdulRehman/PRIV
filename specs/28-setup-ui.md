# Spec 28 — Real derived setup and operational dashboard

**Status:** Done
**Depends on:** Spec 12, Spec 14, Spec 15, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #55
**Owns:** `frontend/src/pages/Setup/SetupLinks.test.tsx`, `.impeccable/surfaces/frontend-src-pages-setup-setuppage-tsx.md`, `frontend/src/pages/Setup/SetupPage.tsx`, `frontend/src/pages/Setup/SetupPage.test.tsx`, `frontend/src/pages/Setup/api.ts`, `frontend/src/pages/Setup/setup.css`, `frontend/src/i18n/setupTranslations.ts`, `frontend/src/routes/workspacePages.tsx`, `frontend/src/components/layout/DashboardLayout.tsx`, `frontend/src/pages/Location/LocationsPage.tsx`, `frontend/src/pages/Location/components/LocationTemplatesTab.tsx`, `frontend/src/pages/Manager/TodayStatusPage.tsx`, `backend/src/services/taskReadiness.service.ts`, `backend/src/services/taskReadiness.service.test.ts`, `docs/implementation/SETUP_UI.md`, `specs/inventory/28-setup-ui.md`
**Reuses:** `frontend/src/components/onboarding/WorkspaceGate.tsx`, `frontend/src/components/common/OperationalSummary.tsx`, `frontend/src/pages/Dashboard/DashboardPage.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/setup.html`

## Goal

Real derived setup and operational dashboard in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Implement approved setup surface driven by real scoped readiness; deep-link existing site/team/shift/template/schedule dialogs, derived completion and correct billing/verification gate. Polish existing overview/Today without replacing actual performance integration. Add honest unassigned/no-replacement links, daily calendar explanation and local dates. Amend Dashboard ownership before edits.

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

- [x] `npm run test:components --prefix frontend -- src/pages/Setup/SetupPage.test.tsx` passes: Readiness persists after reload via real API state; no record means incomplete; denied/error/loading distinct; role-specific setup actions. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Claimed issue55 on implementation/spec-28-derived-setup (base26/PR54 atd078847).12/27 Done. Add direct14/15 consumption: readonly readiness access flag must use existing server account evaluation, not browser plan inference; owner contact state comes from actual15 lifecycle API. No entitlement mutation or new business rule. Transfer existing route/nav/translation/form/readiness and shared subscription API ownership before edits.32 consumes the shared lifecycle client introduced here; add28 dependency. Preserve user dirty Dashboard/performance/manager translations/CI/package/design exactly; no Dashboard source edit. Approvedv5 setup hierarchy, actual per-site persisted counts, no browser checkbox progress. User already authorizes continued ordinary implementation; no design reapproval/tournament. Impeccable context read; approvedv5 overrides stale historical DESIGN.md colors; use Operate/code-led extension and skill finish review/documentation.

- **2026-10-21** — Implemented actual `/setup` with bounded persisted per-site readiness and exact14 `access.manageWork`, owner15 lifecycle guidance, role/empty/loading/error/read-only states, local dates, daily/weekend/task-QR guidance, exact site unassigned links and incumbent location/staff/area/schedule entry points. No Dashboard or dirty user work changed.17 readiness tests;16 focused web tests/2 files; full backend1416/92 files/zero skips with guarded isolated DB; whole frontend57 Node +56 component/6 files. Backend tsc/build, frontend lint/tsc/build pass; no backend lint configured. Synthetic actual React captures1440/390 EN/UR and manager-empty/read-only/error/loading: no overflow/JS errors. Marketing class collision fixed; detector once returned[]. Independent Impeccable review requested one access-unknown correction; same reviewer scored resolved and ship at that fix scope. Inventory28 and SETUP_UI.md document reuse/future30/32/external release gates. Validator42 specs/zero errors/six justified warnings. No new dependency/schema/production mutation, no E2E/qualification claim. Next eligible29 consumes23/27/08; also30–38 have satisfied respective dependencies,39 external qualification remains separate.

- **2026-10-21** — Independent Impeccable documenter comparison PASS for ordinary extension; all8 captures match approvedv5/incumbent system. Historical teal/Manrope DESIGN.md, stale PENDING design-system metadata and pre-existing heading-size drift reported without repair. DESIGN.md/sidecars unchanged; no shipping rasters.

- Published28 implementation8ffdcf8 in stacked draft PR56: https://github.com/Shumail-AbdulRehman/PRIV/pull/56 (base26/PR54). Issue55 remains open for review. Continue eligible29; no merge/deploy.

- **2026-10-21** — Serialized dictionary registration ownership transferred29 for attendance context copy;28 setup dictionary remains intact.

- **2026-10-21** — Serialized shared integration ownership handed to30 for actual account/settings/recovery routes, navigation and dictionary registration; existing behavior preserved.

- **2026-10-21** — Serialized workforce integration ownership transferred to31; existing setup/account behavior retained.

- **2026-10-21** — Serialized billing integration ownership transferred to32; prior contracts preserved.
