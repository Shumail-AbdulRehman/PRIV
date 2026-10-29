# Spec 33 — Platform company workspace

**Status:** In progress
**Depends on:** Spec 24, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #71
**Owns:** `frontend/src/pages/Platform/CompaniesPage.tsx`, `frontend/src/pages/Platform/CompaniesPage.test.tsx`, `docs/implementation/V5_PLATFORM_COMPANIES.md`, `frontend/src/pages/Platform/companies.css`, `frontend/src/i18n/platformCompanyTranslations.ts`, `frontend/src/pages/Platform/companyApi.ts`, `specs/inventory/33-platform-company-ui.md`
**Reuses:** `frontend/src/components/common/DataTable.tsx`, `frontend/src/components/ui/dialog.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/platform.html`

## Goal

Platform company workspace in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Build bounded company list/detail Account/Billing/Activity with operator-only real metadata. Reasoned suspension/reactivation requires confirmation, persists audit and handles conflict. No tenant roster/photo drilldown. Route through separate operator shell/auth state.

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

- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/pages/Platform/CompaniesPage.test.tsx` passes: Operator company search/paging/status save reflect API; tenant identity denied; protected workforce fields absent. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-29 — Current continuation:** Start from accepted billing checkpoint adae1b9, preserving completed28/32 and existing root/runtime work. Completed24/27 source and tracker verified. Serialized35/34 ownership transfers CompaniesPage.tsx and its tests back to33 before edits. Independent35 owns only service sources; shared operator identity/shell remains34. Coordinator owns40 visual harness/evidence and shared records. Approved design/v5/platform.html is fixed input; no design restart or provider activation. Issue71 reused. Full completion requires truthful separation of named-workspace fixture evidence and qualified positive operator acceptance.

- **2026-10-21** — User authorizes next two units33/35 only. Issue71 claimed; dependencies24/27 and actual existing34 boundary verified in current Git ancestry. Preserve eight dirty files checkpoint /tmp/hygene-spec33-35-preserved.json. Existing operator browser provider remains unqualified: preserve fail-closed boundary and transport, no tenant identity promotion. Implement real contract-backed workspace behind it; live access remains external39/40 qualification. Serialized route/dictionary ownership transferred before edits.

- **2026-10-21** — Implemented real24 DTO company search/status filters/cursor pages(default25), Account/Billing/Activity detail, reasoned explicit suspension/reactivation confirmation with expectedVersion, honest errors/empty/denied/legacy-inactive state, draft-preserving409 refresh and fixed intended target. Allowlisted metadata only; no tenant roster/photo/impersonation/payment mutation. Existing34 shell/request/guard reused; registered actual protected routes outside tenant App. Provider transport still rejects before I/O; no fake operator session/config flag added. Named workspace is tested at the dedicated request seam, not exposed without qualification.
- **2026-10-21** —11focused React tests; full frontend57Node+176React/14files; frontend full lint0 and TypeScript/Vite build pass.123existing backend company/operator identity tests/2files pass; backend unchanged/no database/provider operation.16 synthetic named-workspace/network-boundary renders EN/UR390/1440 list/account/confirmation/billing pass overflow/JS checks. Actual route test never mounts child or performs requests without qualified identity. Desktop EN account and Urdu mobile confirmation viewed; RTL close/title overlap fixed and rerendered. Detector[]. Positive UI/network mocks do not qualify browser IdP/MFA or live operator mutation; those remain39/40. Logs `/tmp/hygene-spec33-{focused-final,web-final,backend,lint-final,build-final,render-final,rtl-fix}.log` and `/tmp/hygene-spec33-visual/`.

2026-10-21: Published e0a5d63 as draft PR72 (https://github.com/Shumail-AbdulRehman/PRIV/pull/72), base32. Sequential shared route/dictionary ownership handed to35 before its edits; no specification dependency added.
2026-10-21:35 owns the company-page navigation seam for the service link; company behavior remains covered by33 tests.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-29 — Narrow test ownership:**34takes the existing protected-route heading assertion for the approved V5 operator title; no33runtime or API scope changes.

- **2026-10-29 — Owned V5 source implemented:** Company-specific V5 sidebar/header, real bounded-page summary/register/mobile records, split Account profile/access/context rail and Billing/Activity panels; EN/UR/RTL and existing separate operator boundary retained. No unsupported contact/usage/global-total facts added. Fix uncertain/409 retry lock until successful explicit matching refresh, retain reason/target after failed refresh, guard duplicate/pending dismissal and supersede cached metadata on401/403. Invalid unsafe IDs make no request.17focused company component tests pass/1file10.70s; initial10/11 run exposed only old post-refresh action expectation, corrected to assert enabled confirmation after successful refresh. Full suite/build/rendered verification coordinated separately; visual criterion and status remain open. See V5_PLATFORM_COMPANIES.md/inventory33. No backend/provider/schema/dependency/production change.

- **2026-10-29 — Source follow-up:** Clear the earlier save receipt before another status action and label reopened uncertain requests as pending review.18focused tests/1file4.89s pass; targeted changed-TS lint passes. Visual/provider acceptance remains pending and no status checkmark changed.
