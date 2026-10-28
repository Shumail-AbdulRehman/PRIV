# Spec 31 — Workforce access and transfer UI

**Status:** In progress
**Depends on:** Spec 11, Spec 17, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #65
**Owns:** `backend/tests/credentialHandoff.integration.ts`, `backend/tests/workforceLifecycle.integration.ts`, `frontend/src/pages/Staff/StaffDetailPage.tsx`, `frontend/src/pages/Staff/StaffPage.tsx`, `frontend/src/pages/Staff/StaffEditDialog.tsx`, `frontend/src/pages/Staff/workforce-v5.css`, `frontend/src/pages/Staff/WorkforcePages.test.tsx`, `frontend/src/pages/Staff/StaffCreateDialog.tsx`, `frontend/src/pages/Managers/ManagersPage.tsx`, `frontend/src/pages/Managers/ManagerFormDialog.tsx`, `frontend/src/i18n/workforceTranslations.ts`, `frontend/src/pages/Staff/WorkforceActions.tsx`, `frontend/src/pages/Staff/WorkforceActions.test.tsx`, `frontend/src/pages/Managers/ManagerAccessActions.tsx`, `specs/inventory/31-workforce-ui.md`
**Reuses:** `frontend/src/pages/Staff/StaffCreateDialog.tsx`, `frontend/src/components/common/DeleteButton.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/workforce.html`

## Goal

Workforce access and transfer UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Wire safe deactivation/archive, open-shift transfer conflict, manager-site handover and one-use staff handoff in existing lists/details. Require assigned site for manager hire. Preserve existing working delete retained-history fallback; no general restore. Add actual parent integration through explicit ownership handoff.

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
- [x] `npm run test:components --prefix frontend -- src/pages/Staff/WorkforceActions.test.tsx` passes: Manager cannot select unassigned site/reset owner; conflict keeps draft; one-use credential never saved in browser; mutation errors shown. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Claimed issue65; priority override31 then36. Verified11/17/27 and20/21 implementation branches are HEAD ancestors, stacked open draft PRs through64. Serialized parent/form/dictionary ownership transferred to31 before edits; preserve all eight dirty tracked files using /tmp/hygene-spec31-preserved.json. No dependency edge between31 and36.

- **2026-10-21** — Parallel implementation in isolated `/tmp/hygene-spec31`, branch `implementation/spec-31-workforce-management`, common prerequisite37/PR64 (26000a7); no36 edge. Owner/assigned-site manager workforce actions now connected in real StaffPage/StaffDetailPage; reasoned deactivation/archive, open-shift/stale-source transfer draft recovery, current-password one-use staff code, manager two-step release/assignment handover and required manager hire site. Manager edit no longer offers forbidden password PATCH; inactive manager editing disabled. Existing APIs preserve historical rows and revoke credential/capture/push access. Retired misleading reasonless permanent-delete controls replaced with safe action dialog; shared DeleteButton untouched. English/Urdu, keyboard dialog, busy/error states and 48px action targets reuse v5 tokens. Ownership handoffs from11/18/28/29/30 recorded before edits.
- **2026-10-21** — Targeted18 component tests pass; exact `npm test --prefix frontend`57 Node +120 components/11 files pass; frontend lint0 and TypeScript/build pass; backend focused workforce/credentials/authorization50/3 and backend build pass. Actual local PostgreSQL workforce SQL and credential handoff SQL both pass using explicit guarded test URL; workforce fixture now supplies synthetic catalog/entitlement and verifies prohibited manager password PATCH400, credential audit assertion selects actual credential events (registration adds another audit). No schema/data migration or production configuration. Logs `/tmp/hygene-spec31-{web-tests-final,lint-final,web-build,backend-focused,backend-build,workforce-integration,credential-integration}.log`. Native baseline one-line import correction26000a7 separately advanced common37;101 native tests and native tsc pass. Initial parallel load caused one3s lazy-import timeout, final exact whole command passes; test fixture type/expected-body issues fixed.
- **2026-10-21** — Shared PROGRESS/SESSION_HANDOFF deliberately reserved for coordinator; status remains In progress pending independent review. Browser API fixtures exercise presentation only; real integrated browser/device verification remains40, no E2E claim. No general restore, manager-password recovery, payroll, leave, deployment or production operations.

- **2026-10-21** —16 synthetic API-intercepted built-app presentation captures (transfer/handoff/manager/error × EN/UR ×390/1440) pass horizontal/document/dialog overflow and JavaScript-error checks; captures `/tmp/hygene-spec31-captures`, log `/tmp/hygene-spec31-preview-visual.log`. Visually inspected mobile English transfer and Urdu one-use display. No live API/whole-product claim.

- **2026-10-21** — Completed after coordinator independent source/diff and EN/UR screenshot review, including measured48px transfer controls. Issue https://github.com/Shumail-AbdulRehman/PRIV/issues/65; independent draft PR https://github.com/Shumail-AbdulRehman/PRIV/pull/68, base `implementation/spec-37-native-integrated`, implementation0264ad9. Coordinator combined verification: backend1433 tests/94 files/zero skips; web57 Node +142 components/12 files; frontend lint0; frontend/backend TypeScript/build pass. Coordinator independently reran both actual isolated workforce and credential SQL proofs successfully. Combined checks and API-intercepted presentation captures do not claim integrated whole-product/browser/device E2E; that remains40. Global PROGRESS/SESSION_HANDOFF belong to coordinator; no PR merged or production change.

- **2026-10-21** — Serialized billing integration ownership transferred to32; prior contracts preserved.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-28 — V5 continuation:** previous shared-shell source/render gate passed before dependent work; reconstructing the interrupted uncommitted31batch on a durable isolated worktree. Exclusive Staff/Managers/dictionary ownership includes reusable StaffEditDialog, page CSS and behavior tests above; coordinator owns progress/handoff and integrated screenshot harness. Retain11/17 API contracts and native/provider gates. Historical screenshots do not accept the reconstructed source; fresh integration and paired visual review remain required.
