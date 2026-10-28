# Spec 31 workforce access UI

- `frontend/src/pages/Staff/WorkforceActions.tsx`: persisted reasoned staff deactivation/archive, compare-and-set site transfer and current-password one-use credential handoff. Owner or assigned-site manager only; current source/destination enforced again by existing APIs. Secret stays only in keyed dialog state, clears on close/principal/person/scope changes; never enters query/mutation cache, browser storage or URL. No detail invalidation during one-use display.
- `frontend/src/pages/Managers/ManagerAccessActions.tsx`: owner-only manager deactivation/archive; explicit two-step handover releases sites before assigning them to an active replacement using existing ManagerFormDialog. No reset-owner/manager-password action or general restore.
- `frontend/src/pages/Staff/StaffPage.tsx` and `StaffDetailPage.tsx`: real workforce actions integrated; removes unsafe reasonless site change from edit form. Legacy permanent-delete labels are removed because existing backend DELETE is safe deactivation requiring a reason. Shared DeleteButton retained unchanged for other entities.
- `frontend/src/pages/Staff/StaffCreateDialog.tsx`: manager hire must select an assigned site; backend independently enforces scope.
- `frontend/src/pages/Managers/ManagersPage.tsx` and `ManagerFormDialog.tsx`: manager access integration, inactive edit disabled, existing assignment editor, no prohibited password PATCH; bounded dialog with sanitized conflict/denial messages.
- `frontend/src/i18n/workforceTranslations.ts`: English/Urdu workforce action and error vocabulary registered in existing translations.
- `frontend/src/pages/Staff/WorkforceActions.test.tsx`: 18 behavioral tests covering denial, transfer conflict/draft, actual routes, no secrets persisted/cached, stale principal response, busy guard, one-use display, manager handover/editor, manager hire and Urdu.
- Existing `backend/tests/workforceLifecycle.integration.ts`: refreshed synthetic billing prerequisite and assertion that manager password PATCH is forbidden; actual transfer race/shift/access/history rehearsal remains intact.
- Existing `backend/tests/credentialHandoff.integration.ts`: checks the three expected credential audit actions instead of all audit rows now that registration writes its own audit. Secret-free audit assertions unchanged.

Verification: targeted18; exact full web57 Node +120 components/11 files; full frontend lint, TypeScript/build; backend focused50/3 and build; actual SQL workforce and credential proofs all pass. Coordinator separately verifies whole backend/combined code. Shared baseline native import fix26000a7 is on common prerequisite37, with101 native tests and native tsc passing; no31 dependency on36.

No new model, migration, package or backend business rule. Synthetic browser captures are presentation checks with intercepted APIs, not whole-product E2E or production proof. Full real browser/device integration remains40.

## Current V5 web correction — 2026-10-28

- StaffEditDialog.tsx is reused by directory/detail; person/principal key clears drafts and late feedback. Existing hook/API/name/contact/shift contract retained; site transfers stay in accountable actions.
- StaffCreateDialog inline variant reuses real Location modal contract; current scope key clears old credentials. Capacity/subscription/permission/conflict are distinct sanitized failures, with associated client errors and preserved drafts.
- workforce-v5.css owns Team/detail/Managers blue-white frames, four supported directory metrics, custom mobile records, semantic charts and bounded dialogs. StaffDetail actualtotalInstances replaces incorrect templatecount; Attendancecontext is an action outside collapsed fields.
- WorkforceActions retained exact server paths, role/site/epoch and one-use boundaries; real contextrefresh preserves reason/destination; unique reasonlabel remains stable after typing/errors.
- Current34Staff-focused regressions and64Node+274React combined suite pass; actual integrated/SQL proof, viewport screenshots and final scope limits in V5_WORKFORCE.md. Historical counts/fixture-only records above are retained history.
