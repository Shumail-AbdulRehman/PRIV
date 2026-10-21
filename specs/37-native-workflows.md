# Spec 37 — Native attendance/photo/account recovery

**Status:** In progress
**Depends on:** Spec 09, Spec 17, Spec 20, Spec 21, Spec 26
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #60
**Owns:** `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/src/launch/LaunchRecovery.test.ts`, `frontend-mobile/src/launch/launchApi.ts`, `frontend-mobile/src/launch/recoveryPolicy.ts`, `frontend-mobile/src/launch/launchTranslations.ts`, `frontend-mobile/tests/launchRecovery.test.mjs`, `frontend-mobile/tests/verificationLifecycle.test.mjs`, `frontend-mobile/src/auth/AuthContext.tsx`, `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/api/client.test.ts`, `frontend-mobile/tests/credentialRecovery.test.mjs`, `frontend-mobile/tests/attendanceRecovery.test.mjs`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/src/screens/LoginScreen.tsx`, `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/screens/HelpScreen.tsx`, `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/verification/types.ts`, `frontend-mobile/src/notifications/NotificationProvider.tsx`, `frontend-mobile/src/notifications/NotificationNavigation.tsx`, `frontend-mobile/src/types.ts`, `frontend-mobile/src/i18n/translations.ts`, `docs/implementation/NATIVE_RECOVERY.md`, `specs/inventory/37-native-workflows.md`
**Reuses:** `frontend-mobile/src/components/AttendanceCamera.tsx`, `frontend-mobile/src/notifications/NotificationProvider.tsx`, `frontend-mobile/src/notifications/NotificationNavigation.tsx`, `frontend-mobile/src/types.ts`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/mobile.html`

## Goal

Native attendance/photo/account recovery in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Integrate approved v5 native states into existing actual screens: role-correct staff login/handoff, credential replacement, attendance lost-response reconciliation, QR/photo same-capture result/retry, immutable submission receipt and push/location/camera help. No offline evidence queue; show required permissions and actionable contact. Amend screen ownership before integration; include all changed paths/tests.

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

- [x] `npm test --prefix frontend-mobile` passes: Offline/lost response never duplicates completed capture; receipt persists; permission retry and expired authority distinct; EN/UR/large text supported. [unit]
- [x] `npm test --prefix frontend-mobile` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes; native release separately gated. [static]

## Log

- **2026-10-21** — Claimed issue60 in isolated worktree based on Spec28/PR56. Consume26 real manifest permissions and forced-password denial; amend existing native screen/auth/client ownership before integration. No backend, provider, schema, new dependency or production change.

- **2026-10-21** — Implemented actual staff login/handoff/self replacement with retained mandatory-change gate; exact persisted attendance/lost-response reads and checkout ID; server photo qualification/authority before permission/capture/upload, retained same-capture result/manual retry and immutable submission receipt; settings/push help with EN/UR.101 mobile tests/zero skips, TypeScript and Expo web export pass. Existing72 baseline plus29 cases at policy, form, AuthProvider, Home and Verification seams. No dependency/backend/database/provider change. No adb/emulator/device available; native runtime/font scale/permission/push/Android qualification remains39/40, explicitly not proven by web export or component trees. Docs NATIVE_RECOVERY.md and inventory37 contain proof/limits. Await independent finish source/component review and lead integration before Done; no push/PR from parallel worker.
