# Spec 35 — Platform service audit and leads UI

**Status:** Done
**Depends on:** Spec 25, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #73
**Owns:** `docs/implementation/PLATFORM_SERVICE_UI.md`, `.impeccable/surfaces/frontend-src-pages-platform-servicepage-tsx.md`, `frontend/src/pages/Platform/CompaniesPage.tsx`, `frontend/src/pages/Platform/platformRoutes.tsx`, `frontend/src/i18n/translations.ts`, `frontend/src/pages/Platform/service.css`, `frontend/src/i18n/platformServiceTranslations.ts`, `frontend/src/pages/Platform/ServicePage.tsx`, `frontend/src/pages/Platform/ServicePage.test.tsx`, `frontend/src/pages/Platform/serviceApi.ts`, `specs/inventory/35-platform-service-ui.md`
**Reuses:** `frontend/src/components/common/DataTable.tsx`, `frontend/src/components/common/OperationStatus.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/service.html`

## Goal

Platform service audit and leads UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Expose real redacted diagnostics/audit/inquiry status with bounded filters and accountable lead assignment. Use existing queue; configured verified support handoff. No synthetic service health, secret dumps or nonfunctional reconcile buttons.

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

- [x] `npm run test:components --prefix frontend -- src/pages/Platform/ServicePage.test.tsx` passes: Unavailable diagnostic distinct from healthy; lead state persists; retry performs actual scoped request; no private workforce data. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Issue73 claimed before source edits. Actual25(c04c7ab)/27(b8396ff) commits verified as HEAD ancestors, not assumed present on main. Existing34 unavailable operator boundary/request reused unchanged. Shared routes/dictionary/company-navigation ownership transferred33→35 before edits. Branch implementation/spec-35-platform-service-ui based completed33/e0a5d63; this preserves established Git stack, not a new spec dependency.
- **2026-10-21** — Implemented actual guarded service/audit/inquiry routes, redacted diagnostics with unknown/unavailable observations, real retry, bounded audit/company/action/inquiry search/cursors, escaped submission detail, accountable versioned status/SELF-or-UNASSIGNED handling/reason.409/uncertain save keeps draft and requires successful explicit refresh; no duplicate pending update. Configured validated support mailto only, no delivery/verification claim. No private workforce fields or fabricated health/provider results. Backend/schema/provider configuration unchanged.
- **2026-10-21** —22focused React tests; full57Node+198React/15files pass.135backend support/operator identity tests/2files pass. Full frontend lint0 and TypeScript/Vite build pass; non-failing plugin timing advisory only.20 isolated named-workspace renders EN/UR390/1440 across diagnostics/audit/inquiries/detail/error have no page overflow/JS errors or visible buttons below44px. Desktop EN diagnostics and mobile Urdu detail visually inspected; detector[]. Actual guarded route tests for all3paths deny tenant/storage roles before requests. Positive fixtures replace only the request seam; live IdP/MFA, operational mutation and integrated E2E qualification remain39/40. Temporary harness removed; eight original dirty files byte-preserved. Evidence and files in inventory35/PLATFORM_SERVICE_UI.md; ephemeral logs /tmp/hygene-spec35-*. No production/provider/database operation.
- **2026-10-21** — Published02fbd79 as OPEN/DRAFT PR74 https://github.com/Shumail-AbdulRehman/PRIV/pull/74, base33/e0a5d63. Spec validator42specs/0errors/8existing documented warnings. Final handoff published; STOP.
