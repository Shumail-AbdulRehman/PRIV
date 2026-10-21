# Spec40 — integrated launch evidence, 2026-10-21

Status: **In progress; acceptance incomplete.** Decision00 plus39of41 execution/gate units remain Done. Spec41 depends on40 and is not eligible. A testing APK is a separate user-requested build; packaging alone cannot satisfy native qualification.

## Reproducible results

Branch `implementation/spec-40-launch-e2e`, base `dbbb51d` / Spec39 PR78, issue79. All declared01–39 dependencies are marked Done and their actual implementation files/commits are ancestors of this base. Independent31/36 remain independent specification nodes; the existing Git review stack is preserved.

Final local command: explicit `HYGENE_E2E_DATABASE_URL` against owned127.0.0.1:56442/priv_e2e_test, `npm run test:e2e --prefix frontend`. PostgreSQL16.15, Node24.14.1, Playwright1.58.2 Chromium, compiled real React/API, generated synthetic migrated database, serial tests, zero HTTP interception. **30cases:29passed,1failed;0skipped/expected failures**,37.1s browser phase. Failure: successful signup settles at dashboard rather than canonical billing; proposed fix recorded in followups/E2E_DEFECTS.md. Generated database and secret manifest removed on failure. App code is unchanged in this spec.

Other checks: full frontend64Node +215React tests passed; frontend lint passed with zero warnings/errors; explicit strict browser/config TypeScript passed; frontend TypeScript/Vite production build and backend TypeScript build passed within final runner before browser cases. Native101tests/typecheck and backend1435tests +7explicit SQL skips passed in initial APK workflow39641691401, but that workflow failed at stale native config/legacy integration checks; these are not whole-product E2E passes. New testing build uses its own branch and reports its own results below.

## Required flow mapping

Each row names executable evidence and its remaining acceptance gap. Passing a subset does not complete a row.

| Required flow | Executed current evidence | Remaining evidence |
|---|---|---|
| Owner registration/session/recovery/settings | lifecycle: real registration201 + owner/company SQL, own-password UI revokes old session; workspace: actual UI login/reload/logout, settings SQL/version409, honest unavailable recovery | Registration billing destination fails. Real qualified mail one-use owner recovery/verification delivery pending. |
| Refresh/role collisions/logout | lifecycle: concurrent refresh one winner/one401 + subsequent refresh; workspace: colliding numeric IDs denied staff-self/attendance and logout401 | Broader native renewal/restart coverage pending. |
| Historical transferred-worker detail | workforce: actual transfer UI persists new site, original attendance/task location retained; destination manager cannot read prior site rows/annotations, owner retained | Full historical totals and all view/language combinations pending. |
| Protected attendance photos | lifecycle: real legacy/private DTOs omit public URLs; foreign attendance media request404 before storage; workspace: staff-self role403 | Actual authorized private byte download/storage failure/legacy migration-copy+replay pending; no storage provider supplied. |
| Check-in/checkout/calendar | lifecycle: real attendance-context NOTE survives reload, captured timestamps/status/image unchanged | Actual native capture, concurrent/lost-response writes, customer midnight/overnight calendar scenarios pending. |
| Setup/site/area/staff/schedule/QR | workspace: real setup readiness contains persisted sites and reload creates no tasks; review: actual task-bound QR endpoint | Full site/area/staff/schedule creation, preview and task-start UI chain pending; physical QR pending. |
| Offboard/transfer/handover | workforce: real transfer409 open shift and retained draft; actual deactivate/archive UI invalidates prior session and preserves history; lifecycle: one-use staff handoff, old401/code replay400/new login200; manager access handover releases/assigns site through UI | In-flight native capture revocation and physical recovery UI pending. |
| Task photo/submission/review | review: missing-photo state, no submission/verification, qualified-unavailable feedback; actual manager resolution persists without altering task completion facts; deprecated extension410 | Real upload/failure/reconciliation/replacement/waiver required-view qualification pending. No AI result/confidence fabricated. |
| Subscription lifecycle | workspace: mirrored SQL facts remain Active while unconfigured portal/checkout unavailable | Real Paddle sandbox activation/change/cancel/webhook order, capacity/legacy-job route bypass scenarios pending; synthetic subscription is not provider proof. |
| Suspension and owner recovery | workspace: SQL-suspended synthetic company denies existing staff operational session403/ACCOUNT_SUSPENDED and owner operational list403 while real owner billing/security/help remain reachable | Reasoned operator suspension audit and all operational denial routes pending. |
| Operator MFA/company workspace | public: four direct routes fail closed, disabled provider sign-in, zero platform API mount; workspace: tenant audience platform401 | Real IdP/MFA/browser adapter absent; positive operator/company workspace impossible until qualified adapter exists. |
| Diagnostics/leads/support/content | public: real support200 unavailable contact/legal/distribution/checkout states; workspace: real inquiry form persists company/counts in SQL without creating subscription | Configured-contact positive UI and authenticated operator diagnostics/redaction pending. |
| Permissions/alerts/native distribution | Four Maestro source-checked templates added, not executed. Fresh current-UI testing APK requested. | Physical device, Maestro/adb, isolated phone-reachable backend, permission retry, push/renewal/navigation and install/update proof pending. |
| EN/UR/RTL/responsive keyboard | public: Urdu390/1440 actual heading, RTL, no horizontal overflow, keyboard recovery navigation | Every authenticated web/native workflow in both languages pending. Earlier component renders do not replace this. |
| Startup/qualification/restore | public: actual production app subprocess refuses unsafe config before listener/jobs; review: unqualified feedback and no invented verification | Fresh isolated backup/rollback/restore and representative consented provider/old-media qualification pending. |

## Android build and boundaries

Initial run39641691401 on39/dbbb51d failed before APK packaging: Expo doctor17/18 rejected dynamic configuration not consuming its supplied config; old lifecycle test expected VERIFIED_COMPLETE contrary to current qualification/receipt rules. No artifact was produced by that run. Separate branch `build/hygeneops-android-testing-20261021` corrects Expo context composition and consumes39's current isolated launch/manager tests; no application/business policy change, no gate bypass. Current signed APK outcome, hash and build URL will be appended after actual completion.

All local E2E data are synthetic in generated owned child databases. No production DB/migration/provider operation, merge or deployment. Existing root8dirty tracked files remain untouched. Physical Android/device/provider claims remain pending even if packaging succeeds. Real new photo processing and operator browser sign-in stay disabled.
