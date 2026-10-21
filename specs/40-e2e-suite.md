# Spec 40 — Launch end-to-end suite

**Status:** Not started
**Depends on:** Spec 01, Spec 02, Spec 03, Spec 04, Spec 05, Spec 08, Spec 07, Spec 06, Spec 09, Spec 10, Spec 11, Spec 12, Spec 13, Spec 14, Spec 15, Spec 16, Spec 17, Spec 18, Spec 19, Spec 20, Spec 21, Spec 22, Spec 23, Spec 24, Spec 25, Spec 26, Spec 27, Spec 28, Spec 29, Spec 30, Spec 31, Spec 32, Spec 33, Spec 34, Spec 35, Spec 36, Spec 37, Spec 38, Spec 39
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/playwright.config.ts`, `frontend/e2e/`, `frontend-mobile/e2e/`, `docs/implementation/E2E_RESULTS.md`
**Reuses:** `docs/implementation/NATIVE_RECOVERY.md`, `frontend-mobile/src/auth/AuthContext.tsx`, `frontend-mobile/src/launch/recoveryPolicy.ts`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/src/notifications/NotificationNavigation.tsx`, `frontend-mobile/src/notifications/NotificationProvider.tsx`, `frontend-mobile/src/screens/HelpScreen.tsx`, `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/screens/LoginScreen.tsx`, `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/operatorSession.ts`, `frontend/src/pages/Platform/operator.css`, `frontend/src/pages/Platform/operatorTranslations.ts`, `frontend/src/pages/Platform/platformRoutes.tsx`, `frontend/src/main.tsx`, `docs/implementation/OPERATOR_UI.md`, `.impeccable/surfaces/frontend-src-pages-platform-operatorlogin-tsx.md`, `frontend/src/routes/workspaceRoutes.tsx`, `frontend/src/pages/Account/AccountPages.tsx`, `frontend/src/pages/Account/api.ts`, `frontend/src/pages/Account/linkToken.ts`, `frontend/src/pages/Account/account.css`, `frontend/src/i18n/accountTranslations.ts`, `frontend/src/App.tsx`, `frontend/src/pages/Login/LoginPage.tsx`, `docs/implementation/ACCOUNT_UI.md`, `.impeccable/surfaces/frontend-src-pages-account-accountpages-tsx.md`, `docs/implementation/ATTENDANCE_CONTEXT_UI.md`, `.impeccable/surfaces/frontend-src-pages-attendance-attendancecontext-tsx.md`, `frontend/src/pages/Attendance/AttendanceContext.tsx`, `frontend/src/pages/Attendance/attendance-context.css`, `frontend/src/pages/Attendance/contextApi.ts`, `frontend/src/i18n/attendanceContextTranslations.ts`, `frontend/src/pages/Attendance/AttendancePage.tsx`, `frontend/src/pages/Staff/StaffDetailPage.tsx`, `specs/ARCHITECTURE.md`, `docs/implementation/SETUP_UI.md`, `.impeccable/surfaces/frontend-src-pages-setup-setuppage-tsx.md`, `frontend/src/pages/Setup/setup.css`, `frontend/src/i18n/setupTranslations.ts`, `frontend/src/pages/Location/LocationsPage.tsx`, `frontend/src/pages/Location/components/LocationTemplatesTab.tsx`, `frontend/src/pages/Manager/TodayStatusPage.tsx`, `frontend/src/pages/Staff/StaffPage.tsx`

Consumes31 staff list/create/detail/actions and manager access in actual workforce lifecycle flows. Inputs include `frontend/src/pages/Staff/StaffCreateDialog.tsx`, `frontend/src/pages/Managers/ManagersPage.tsx`, `frontend/src/pages/Managers/ManagerFormDialog.tsx`, and `frontend/src/i18n/workforceTranslations.ts`.

Consumes36 receipt/submission/closure/verification flows from `frontend/src/pages/Exceptions/ExceptionDetailPage.tsx`, `frontend/src/pages/Exceptions/ExceptionInboxPage.tsx`, `frontend/src/pages/Exceptions/reviewDiagnosis.ts`, `frontend/src/pages/Exceptions/launch-review.css`, `frontend/src/i18n/reviewTranslations.ts`, `backend/src/services/verification-v2/launchReviewContext.ts`, and `docs/implementation/PHOTO_REVIEW_UI.md`. Existing protected evidence and server authorization remain mandatory; no qualification inferred from fixtures.

## Goal

Launch end-to-end suite in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Consume backend/tests/billingLifecycle.integration.ts for local atomic webhook proof; real sandbox checkout/portal qualification remains mandatory before release.

Reuse backend/tests/accountCapacity.integration.ts for isolated quota/entitlement evidence; integrated route tests must also prove no bypass through legacy creates/jobs.

Reuse backend/tests/workforceLifecycle.integration.ts as isolated DB evidence; add actual integrated workforce UI flow coverage here, including reasoned legacy delete/archive and in-flight check-in/transfer conflict.

Install Playwright Chromium and configure self-started web/backend, baseURL and failure traces. Use isolated PostgreSQL fixture strategy; no route interception in persistence proofs. Add Maestro physical Android flows. Table below owns complete integrated coverage. Report app bugs as new fix specs; do not fix app inside this unit.

| Flow | Built by specs | Proves |
|---|---|---|
| Owner registration/session/recovery/settings | 13,16,18,30 | Atomic owner creation, persistence, one-use recovery and role denial |
| Refresh/role collisions/logout | 01,04,18 | Wrong-table access denied; concurrent/stale sessions safe |
| Historical transferred-worker detail | 02,31 | Site-A rows/totals hidden from manager-B; owner retained |
| Protected attendance photos | 05,06,07 | No public URL; self/site/company denial and legacy hold |
| Check-in/checkout/calendar | 09,29,37 | Lost response/concurrent retry, local midnight/overnight, annotation preserves facts |
| Setup/site/area/staff/schedule/QR | 11,12,28,31 | Real setup state persists; preview pure; task assigned and started |
| Offboard/transfer/handover | 11,31 | Open shift conflict, former session/capture revoked, retained history |
| Task photo/submission/review | 20,21,36,37 | Required views, failure/reconcile, waiver compatibility and review distinction |
| Subscription lifecycle | 14,15,32 | Provider sandbox activation/change/cancel, webhook order, over-limit and blocked capacity |
| Suspension and owner recovery paths | 14,24,32,33 | Operational block, reasoned audit and accessible owner billing/support |
| Operator MFA/company workspace | 19,24,33,34 | Tenant/operator audience separation and no workforce data |
| Diagnostics/leads/support/content | 25,35,38 | Redacted real statuses, persisted inquiry, configured contacts and unavailable states |
| Permissions/alerts/native distribution | 37,39 | Physical Android permission denial/retry, push and signed release boundary |
| EN/UR/RTL/responsive keyboard | 27,28,29,30,31,32,33,34,35,36,37,38 | Every workflow readable and operable in supported languages |
| Safe startup/qualification/restore | 03,07,21,39 | Invalid production config cannot boot; unqualified mode blocked; isolated rollback/restore |

Photo authorization route: `backend/src/routes/attendancePhotos.route.ts` is mounted by the attendance router for protected-photo flows.

Photo vocabulary integration: `frontend/src/i18n/attendancePhotoTranslations.ts` and `frontend/src/i18n/translations.ts` are consumed by every EN/UR protected-photo flow.

Registration caller surfaces: `backend/src/controllers/manager.controller.ts` delegates signup; `frontend/src/pages/Signup/SignUpPage.tsx` handles account-created/session-failed outcome.

Media migration integration: `backend/src/services/attendanceMediaTransition.service.ts`, `backend/src/services/attendancePhotoReference.ts` and `backend/src/services/deletedMedia.service.ts` are consumed by the isolated copy/replay/reference-cleanup flow.

Readiness HTTP composition: `backend/src/routes/location.route.ts` mounts the bounded taskReadiness router before generic:id reads.

Persistence rehearsal supplement: `backend/tests/launchMigration.integration.ts` is an isolated schema/SQL/service test (not a browser end-to-end runner); final verification reruns it only in a new empty disposable PostgreSQL database.

Credential service SQL rehearsal: `backend/tests/credentialHandoff.integration.ts` verifies actual transactions, password hashing and concurrent consumption in explicit local DB; browser/native handoff completion remains in the final flow suite.

### Runtime coverage surfaces

These owned surfaces are consumed by the flow table above or the clean verification gate; tests must exercise their actual caller integration.

- 01: `backend/src/controllers/staffSelf.controller.ts`, `backend/src/controllers/attendanceSelf.controller.ts`, `backend/src/routes/staff.route.ts`, `backend/src/routes/attendance.route.ts`.
- 02: `backend/src/controllers/staff.controller.ts`.
- 03: `backend/src/config/runtimeSecurity.ts`, `backend/src/config/initializeRuntime.ts`, `backend/src/app.ts`, `docker-compose.yml`.
- 04: `backend/src/controllers/common.controller.ts`, `backend/src/utils/auth.ts`, `backend/src/middlewares/auth.middleware.ts`.
- 05: `backend/src/services/attendanceMedia.service.ts`, `backend/src/controllers/attendanceMedia.controller.ts`, `backend/src/controllers/attendance.controller.ts`.
- 06: `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `frontend/package.json`, `frontend/package-lock.json`.
- 07: `backend/scripts/attendanceMediaInventory.ts`, `backend/scripts/attendanceMediaTransition.ts`, `docs/implementation/ATTENDANCE_MEDIA_RUNBOOK.md`.
- 08: `frontend/src/components/common/ProtectedAttendancePhoto.tsx`, `frontend/src/pages/Attendance/AttendancePage.tsx`, `frontend/src/pages/Staff/StaffDetailPage.tsx`.
- 09: `backend/src/services/attendanceWrites.service.ts`, `backend/src/controllers/attendanceWrites.controller.ts`, `backend/src/validations/attendance.validation.ts`.
- 10: `backend/prisma/schema.prisma`, `backend/prisma/migrations/202610200001_launch_lifecycle/migration.sql`, `docs/implementation/MIGRATIONS.md`.
- 11: `backend/src/services/workforceLifecycle.service.ts`, `backend/src/routes/workforceLifecycle.route.ts`.
- 12: `backend/src/services/taskReadiness.service.ts`, `backend/src/routes/taskReadiness.route.ts`.
- 13: `backend/src/services/companyRegistration.service.ts`, `backend/src/controllers/companyRegistration.controller.ts`.
- 14: `backend/src/services/accountAccess.service.ts`, `backend/src/middlewares/accountAccess.middleware.ts`.
- 15: `backend/src/services/billingLifecycle.service.ts`, `backend/src/routes/billingLifecycle.route.ts`, `backend/src/config/paddle.ts`.
- 16: `backend/src/services/ownerIdentity.service.ts`, `backend/src/routes/ownerIdentity.route.ts`.
- 17: `backend/src/services/credentialHandoff.service.ts`, `backend/src/routes/credentialHandoff.route.ts`.
- 18: `backend/src/services/credentialSession.service.ts`.
- 19: `backend/src/services/operatorIdentity.service.ts`, `backend/src/middlewares/operatorAuth.middleware.ts`.
- 20: `backend/src/services/verification-v2/launchPhotoPolicy.ts`.
- 21: `backend/src/services/verification-v2/launchQualification.ts`, `docs/implementation/PHOTO_QUALIFICATION.md`.
- 22: `backend/src/services/companySettings.service.ts`, `backend/src/routes/companySettings.route.ts`.
- 23: `backend/src/services/attendanceAnnotation.service.ts`, `backend/src/routes/attendanceAnnotation.route.ts`.
- 24: `backend/src/services/platformCompany.service.ts`, `backend/src/routes/platformCompany.route.ts`.
- 25: `backend/src/services/platformSupport.service.ts`, `backend/src/routes/platformSupport.route.ts`.
- 26: `backend/src/routes/launch.route.ts`, `backend/src/routes/common.route.ts`, `backend/src/routes/manager.route.ts`.
- 27: `frontend/src/main.tsx`, `frontend/src/routes/workspacePages.tsx`, `frontend/src/components/layout/DashboardLayout.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/workspace-refresh.css`, `frontend/src/i18n/launchTranslations.ts`, `frontend/src/routes/launchPages.tsx`.
- 28: `frontend/src/pages/Setup/SetupPage.tsx`, `frontend/src/pages/Setup/api.ts`.
- 29: `frontend/src/pages/Attendance/AttendanceContext.tsx`, `frontend/src/pages/Attendance/contextApi.ts`.
- 30: `frontend/src/pages/Account/AccountPages.tsx`, `frontend/src/pages/Account/api.ts`.
- 31: `frontend/src/pages/Staff/WorkforceActions.tsx`, `frontend/src/pages/Managers/ManagerAccessActions.tsx`.
- 32: `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/queries.ts`.
- 33: `frontend/src/pages/Platform/CompaniesPage.tsx`, `frontend/src/pages/Platform/companyApi.ts`.
- 34: `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/operatorSession.ts`.
- 35: `frontend/src/pages/Platform/ServicePage.tsx`, `frontend/src/pages/Platform/serviceApi.ts`.
- 36: `frontend/src/pages/Exceptions/LaunchReviewContext.tsx`.
- 37: `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/src/launch/launchApi.ts`.
- 38: `frontend/src/pages/Help/HelpPage.tsx`, `frontend/src/pages/Help/serviceInformation.ts`, `docs/implementation/COMMERCIAL_CONTENT.md`.
- 39: `.github/workflows/ci.yml`, `docs/implementation/RELEASE_RUNBOOK.md`.

## Explicit non-scope

- Clean release gate → spec 41.

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

- [ ] `npm run test:e2e --prefix frontend` passes every flow with persisted backend state; record count and map tests to table. [e2e]
- [ ] Maestro native flow suite passes on physical Android; record device/build and cases. [requires: Android device, signed build, test backend]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
