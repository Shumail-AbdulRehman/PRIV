# Spec 37 — Native attendance/photo/account recovery

**Status:** In progress
**Depends on:** Spec 09, Spec 17, Spec 20, Spec 21, Spec 26
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #60
**Owns:** `frontend-mobile/src/screens/TasksScreen.tsx`, `frontend-mobile/src/screens/StartTaskScreen.tsx`, `frontend-mobile/src/components/TaskCard.tsx`, `frontend-mobile/src/components/ui/card.tsx`, `frontend-mobile/src/components/ui/text.tsx`, `frontend-mobile/src/fonts.ts`, `frontend-mobile/assets/fonts/`, `frontend-mobile/package.json`, `frontend-mobile/package-lock.json`, `frontend-mobile/tests/nativeComposition.test.mjs`, `docs/implementation/V5_NATIVE_COMPOSITION.md`, `frontend-mobile/src/launch/LaunchRecovery.tsx`, `frontend-mobile/src/launch/LaunchRecovery.test.ts`, `frontend-mobile/src/launch/launchApi.ts`, `frontend-mobile/src/launch/recoveryPolicy.ts`, `frontend-mobile/src/launch/launchTranslations.ts`, `frontend-mobile/tests/launchRecovery.test.mjs`, `frontend-mobile/tests/verificationLifecycle.test.mjs`, `frontend-mobile/src/auth/AuthContext.tsx`, `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/api/client.test.ts`, `frontend-mobile/tests/credentialRecovery.test.mjs`, `frontend-mobile/tests/attendanceRecovery.test.mjs`, `frontend-mobile/src/navigation/AppNavigator.tsx`, `frontend-mobile/src/screens/LoginScreen.tsx`, `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/screens/HelpScreen.tsx`, `frontend-mobile/src/screens/verification/VerificationScreen.tsx`, `frontend-mobile/src/verification/types.ts`, `frontend-mobile/src/notifications/NotificationProvider.tsx`, `frontend-mobile/src/notifications/NotificationNavigation.tsx`, `frontend-mobile/src/types.ts`, `frontend-mobile/src/i18n/translations.ts`, `docs/implementation/NATIVE_RECOVERY.md`, `specs/inventory/37-native-workflows.md`, `frontend-mobile/global.css`, `frontend-mobile/src/theme.ts`, `frontend-mobile/App.tsx`, `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/components/StaffBrand.tsx`, `frontend-mobile/src/components/PhotoCaptureControls.tsx`, `frontend-mobile/src/components/ui/button.tsx`
**Reuses:** `frontend-mobile/src/components/AttendanceCamera.tsx`, `frontend-mobile/src/notifications/NotificationProvider.tsx`, `frontend-mobile/src/notifications/NotificationNavigation.tsx`, `frontend-mobile/src/types.ts`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/mobile.html`

## Goal

Continuation ownership additionally includes `frontend-mobile/src/screens/TasksScreen.tsx`,
`frontend-mobile/src/screens/StartTaskScreen.tsx`, `frontend-mobile/src/components/TaskCard.tsx`,
`frontend-mobile/src/components/ui/card.tsx`, `frontend-mobile/src/components/ui/text.tsx`,
`frontend-mobile/src/fonts.ts`, `frontend-mobile/assets/fonts/`,
`frontend-mobile/package.json`, `frontend-mobile/package-lock.json`,
`frontend-mobile/tests/nativeComposition.test.mjs`, and
`docs/implementation/V5_NATIVE_COMPOSITION.md`; these are exclusive37 paths.

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

- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm test --prefix frontend-mobile` passes: Offline/lost response never duplicates completed capture; receipt persists; permission retry and expired authority distinct; EN/UR/large text supported. [unit]
- [x] `npm test --prefix frontend-mobile` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes; native release separately gated. [static]

## Log

- **2026-10-29 — Approved composition continuation:** Independent source inspection against design/v5/mobile confirms remaining native hierarchy/header/help/task-start/font work beyond the earlier palette bridge. Separate persistent native worktree starts from verifiedadae1b9 plus common preservation metadata. Coordinator owns this scope; company/service/QA workers do not edit native source. Reuse existing attendance/QR/camera/authority/retry/API behavior; add only approved composition and bundled font loading, using the already installed Expo font version where necessary. Additional paths listed above transfer exclusively before edits. Actual native runtime/physical-device proof is unavailable, so37 remains In progress regardless of component/web-preview success. Issue60 reused; no provider/backend/production change.

- **2026-10-21** — Claimed issue60 in isolated worktree based on Spec28/PR56. Consume26 real manifest permissions and forced-password denial; amend existing native screen/auth/client ownership before integration. No backend, provider, schema, new dependency or production change.

- **2026-10-21** — Implemented actual staff login/handoff/self replacement with retained mandatory-change gate; exact persisted attendance/lost-response reads and checkout ID; server photo qualification/authority before permission/capture/upload, retained same-capture result/manual retry and immutable submission receipt; settings/push help with EN/UR.101 mobile tests/zero skips, TypeScript and Expo web export pass. Existing72 baseline plus29 cases at policy, form, AuthProvider, Home and Verification seams. No dependency/backend/database/provider change. No adb/emulator/device available; native runtime/font scale/permission/push/Android qualification remains39/40, explicitly not proven by web export or component trees. Docs NATIVE_RECOVERY.md and inventory37 contain proof/limits. Await independent finish source/component review and lead integration before Done; no push/PR from parallel worker.

- **2026-10-21** — Fresh independent review ship at source/component scope, no material fixes; documenter confirms reuse and explicitly limits evidence: no native visual/device approval, historical teal/systemfont drift remains unchanged, qualification39/40 external. Root integration/publication remains.

- **2026-10-21** — Root integratedab9e8da/bc2d2fc on34/PR63, preservinglatest stopinstruction andsharedprogress.101native tests/zeroskips,tsc andExpo webexportpass; current29/30/34web57Node+102components/10files,lint/tsc/build unchangedandpassing. Freshindependentreview anddocumenter ship SOURCE/COMPONENT SCOPE ONLY: noadb/emulator/device/nativecaptures, Urdufontscale/IME/Back/cameraGPS/push/install/signing/performance qualificationremains39/40. Historicalnativeglobalteal/systemfontdriftpreserved, notrenderedv5visualparity. Actual26photoChecking/allowedActions andstructuredPASSWORD_CHANGE_REQUIRED consumed;21newprocessingunavailable, samecaptureresultlookup andpersistedreceiptretained. No newdependency/backend/schema/productionmutation. Validator42/zeroerrors/eightjustifiedwarnings afterdirect26edge/W7 and40consumers. Userbatch29/30/34/37ends here; nofutureunitstarted.

- **2026-10-21** — Publishedverifiedcheckpointbbe3175 in draftPR64 https://github.com/Shumail-AbdulRehman/PRIV/pull/64 base34/PR63. Issue60openforreview; finalpublicationdocscommitfollows. Stoprequestedbatch.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-22 — Issue82 correction:** Existing NativeWind/navigation/native control colours now consume approved V5 palette via the new native prop bridge.101tests/typecheck/Expo web export pass. No connected device/emulator; native visual acceptance remains open. See docs/implementation/V5_IMPLEMENTATION.md for commands, counts, screenshots and intentional deviations. This log does not close the reopened full V5 acceptance criterion.
