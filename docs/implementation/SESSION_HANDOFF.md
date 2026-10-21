# Active V5 correction checkpoint — 2026-10-22

Source commit5313b73 passes clean detached-worktree frontend build and64Node+220React tests without copying the user performance work. Final real-backend edge geometry case passes for1366/390 EN/UR; menu/drawer screenshots were re-inspected.242PNG reference/app captures are committed, with capture coverage distinct from acceptance.0generated test DBs remain; owned56442cluster/temporary5199preview stopped; user5173/8080 left running.

User authorizes implementing the complete approved V5 in the real applications,
with sequential work; no new prototype/design version, production action, merge
or reset. This instruction supersedes historical STOP/next-spec restrictions below.

Current correction branch `implementation/v5-visual-corrections` derives from
`e0337b4`/spec40, issue82. **Full V5 implementation remains incomplete.** UI specs
27–38 were reopened for missing visual acceptance; historical logs/checkmarks remain.
See [V5_IMPLEMENTATION.md](V5_IMPLEMENTATION.md) for the complete29-entry mapping,
four independent statuses, implementation checklist, test evidence and deviations.

Implemented: shared blue/white shell/company identity/navigation/control/type/table
foundations; Today summary/task register/right attention rail; actual API search/status/
location/date/pagination; accessible task drawer preserving QR/review/schedule actions;
EN/UR/RTL and summary error/retry; submitted remains distinct from verified. Native
NativeWind/navigation/capture/button palette now consumes approved V5 colours, with
no native device acceptance claim. Existing business APIs/authorization retained.

Verification:64Node+220React tests;27focused;101native tests; frontend lint0;
TypeScript/Vite build; native TypeScript and Expo web export;14real persisted SQL/API/
React integration cases passed. Paired screenshots are under `v5-evidence/`; final
recapture outcome is recorded in V5_IMPLEMENTATION.md. The screenshot harness now
serves its private disposable build directory instead of sharing frontend/dist.
No whole-product/provider/native qualification claimed. Known signup redirect issue
from the earlier spec40 suite remains uncorrected and is not hidden by subset passes.

Environment: Vite5173 and backend8080 both serve this root checkout (verified cwd).
8080 uses the existing guarded restored local DB, not production. Screenshot tests
use fresh disposable migrated synthetic DBs under owned local56442 cluster; they do
not use restored customer data. ADB reports no connected device/emulator. Operator
positive routes remain blocked by unqualified/missing IdP; do not bypass guards.

Preserve original dirty CI/gitignore/DESIGN/backend/dashboard/manager dictionary
and the prior handoff append below. Their original diffs were checked byte-for-byte;
none belongs in the correction commit. Overview screenshot provenance includes the
user's performance changes; do not overwrite or claim to have implemented them.
No new dependencies/framework/schema, deployed service or production mutation.

Next coherent boundary: implement `design/v5/reviews.html` queue/evidence/decision
composition in existing ExceptionInboxPage/ExceptionDetailPage, reusing protected
media/zoom and current server-authorized closure. Keep receive/submit/review/verify
separate, then continue the remaining customer/platform/form/table/chart pages and
native workflows. Do not mark a captured page accepted without comparing it. Finish
each component group with matching rendered evidence and current functional checks.

## Retained prior handoff history

# Latest database operation — 2026-10-21

User explicitly authorized applying the pending migration through backend/.env DIRECT_URL. Completed202610200001_launch_lifecycle with Prisma migrate deploy; both configured connections now18applied/0pending/0unfinished, all checksums match. Encrypted full backup plus isolated public-schema restore/migration rehearsal passed before apply. Backup/reports: ~/.local/share/hygene-ops/backups/launch-lifecycle-2026-10-21T18-00-04-984Z; key separately protected.40business tables unchanged;8heartbeat stable identities/start times/job counts preserved with normal lastSeenAt advances. New defaults/tables/trigger validated; no reset/seed/deployment or env changes. See MIGRATIONS.md authorized-apply entry. Spec40 and the registration fix remain incomplete; this does not mark41eligible.

# Active handoff — 2026-10-21: Spec40 plus requested testing APK

Latest user authorizes continuing40 and building a fresh testing APK with current mobile UI. Do not start41 or unrelated specs. **40 remains In progress**, not Done;39of41 execution/gate units +decision00 Done. Full persisted/device/provider acceptance is not met. No production deployment/data/provider activation, merge or rewrite.

## Working branches and evidence

- `/tmp/hygene-spec40`, `implementation/spec-40-launch-e2e`, based39/dbbb51d and issue79. Real Playwright1.58.2 suite uses actual compiled React/API and migrated synthetic UUID child PostgreSQL databases. Initial28case final run27passed/1failed; two additional suspended-account/public inquiry cases passed in9case focused run. Final combined30case run29passed/1failed in37.1s, zero skipped/expected failures; OPEN/DRAFT PR81 https://github.com/Shumail-AbdulRehman/PRIV/pull/81 base39; code6a53ba0. Registration persists correctly but navigates to dashboard rather than canonical billing; narrow proposed fix in followups/E2E_DEFECTS.md, no application fix inside40.
- Strict browser TypeScript, backend TypeScript, frontend TypeScript/Vite build, frontend lint,64Node +215React tests passed. E2E_RESULTS.md maps every required flow and gaps; passing subset/API calls/component checks are not whole-product proof. Rerun with synthetic checkout .env sentinels confirms29passed/1same failure in35.0s after environment hardening (Vite envDir:false/private backend/probe cwd), with lint/types/build passing. Sentinels/raw artifacts removed and owned test PG stopped again. Four source-checked native Maestro templates remain unexecuted. Hosted CI39643043841 on6a53ba0 and39645400371 on64d42c4 passed all4jobs, but does not invoke this new E2E command and therefore does not override the failing integrated case.
- Fresh APK build branch `/tmp/hygene-apk-20261021`, `build/hygeneops-android-testing-20261021`, latest build-fix commitd69d855, OPEN/DRAFT PR80 https://github.com/Shumail-AbdulRehman/PRIV/pull/80 base39. Initial unmodified39 workflow39641691401 failed Expo doctor (dynamic context composition) and retired integration assumptions. Build branch preserves supplied Expo config, adds a regression and uses39current isolated SQL/manager tests plus current push-only/notification packaging inspection. No business-policy change. Retry39642102013 https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/39642102013; native packaging succeeded but retained unused speech translation caused inspection failure; corrected inedffaa3, keeping actual API/DEX denial. Subsequent39644171558 needs Expo asset12.0.14 patch, pinned ind69d855; Final39644524268 all3jobsSUCCESS on d69d855; artifact https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/39644524268/artifacts/12366663839. Local frontend-mobile/build-output/HygeneOps-staff-2.1.7-ui-20261021.apk,56,742,055bytes; SHA2565851b5df48c9e0f7957847d88197a7ddbe13ec9c3d1568e96f6d0df7c25fc717. Local signature/checksum/16KiB ZIP alignment and current native recovery/help bundle markers pass; sameFAC61745...testing certificate as previous local APK, no re-signing. Reports under build-output/ui-20261021-reports. Physical tests remain unexecuted.
- Phone API default `http://192.168.100.198:8080/api`, configurable in native Server settings; no test backend availability or reachability inferred. Android2.1.7/versionCode10 current source. Packaging does not prove physical install/update, camera/GPS/push or photo qualification. adb discovered under user-local tools; `adb devices -l` reports no devices. No Maestro executable located. Never use old private access/test-session fixtures as current qualification.

## Safety and remaining work

Main checkout safely switched from39to implementation/spec-40-launch-e2e after scoped commits were saved; original isolated/tmp/hygene-spec40 is detached at0d3971b.8original dirty tracked file hashes in `/tmp/hygene-spec40-preserved.json` must remain byte-identical, along with unrelated untracked work. No conflicting root app edits or blanket staging; all8hashes verified unchanged after branch switch.40and build branch are independent siblings, no spec dependency added.

Owned40PostgreSQL16.15 at127.0.0.1:56442, bootstrappriv_e2e_test; server tools `/tmp/hygene-spec39-postgres-tools/usr/lib/postgresql/16/bin`, owned data `/tmp/hygene-spec40-postgres-data`. Child DBs and generated secrets cleaned after each run. Final cleanup confirmed0generated child databases; this owned cluster was stopped. Restart it explicitly before reproducing tests; do not stop the user's backendPID2737 or unknown servers. Artifacts/logs in/tmp are temporary; publish redacted source/results, no tokens or raw credential traces. Build outputs are not committed.

All15required-flow gaps are enumerated in E2E_RESULTS.md, including real IdP/MFA browser adapter, qualified mail/Paddle/storage/photo processing, full native permission/retry/receipt/push/ENUR workflows and full browser setup/calendar/suspension-audit/restore coverage. Operator sign-in and new photo processing stay disabled.41depends40and is not eligible; resolve the confirmed proposed fix and missing40evidence before final qualification. Do not mark completion from APK or unit tests alone.

## Previous handoff history

# Final handoff — 2026-10-21: Specs38 and39 complete — STOP

Latest user requested next two specs. Completed38 Configured support/service information and39 Launch operations/active CI proof. Decision00 and39 of41units Done; **2 remain:40/41**. Next in graph40, but real release/provider/device gates below still block full integrated qualification. Do not automatically begin40 or41. No PR merged, image pushed, production deployment/data/configuration modification, production migration/restore or live provider/email/IdP/photo call.

## Git and review

-38 implementation44df792 plus66723be typography follow-up, branch implementation/spec-38-service-information, issue75, OPEN/DRAFT PR76 https://github.com/Shumail-AbdulRehman/PRIV/pull/76; base35/5f10d3c (PR74).
-39 implementations24b7fdb/fbd5ca7, branch implementation/spec-39-release-operations, issue77, OPEN/DRAFT PR78 https://github.com/Shumail-AbdulRehman/PRIV/pull/78; base38 now66723be. Normal dependency-branch merge9e7164d follows fbd5ca7; no PR merged or branch history rewritten. Final documentation commit follows; behavior unchanged except verified38 heading inheritance.
- Verified actual ancestors:38 consumes25(c04c7ab)/27(b8396ff);39 consumes03(9ed82d6)/26(7368750). Git stack serialization preserves all completed application work, without adding specification dependencies. Existing draft review/merge prerequisites remain outstanding, including independent31/36 and verification checkpointb21dcca; no merges authorized/performed.
- Seven original dirty files byte-identical to /tmp/hygene-spec38-39-preserved.json. CI intentionally changed by39, but its original3-line Company performance step is retained **unstaged**; committed workflow blob contains only39 edits. Original backend/package/controller/routes/dashboard/translation/skills/design/investor-video/performance work excluded; no blanket staging.

## Spec38 delivered

Actual public /help and /service-information outside tenant session bootstrap; shared PublicLayout, sidebar/footer navigation and EN/UR/RTL. Public support/contact omits credentials, refuses redirects and uses no-store with loading/error/real retry. Only operator-configured safe mailbox links; opening email never claims delivery. Explicit approved origin-pinned legal/privacy/closure/Android URLs or unavailable defaults; no invented promises. Current photo guidance separates upload/submission/review/verification and unavailable new processing. New checkout requires policy/support availability, rechecks recipient before transaction; existing portal/account reads preserved. Public flags do not authorize billing, prove legal approval or qualify providers/devices.

Checks:16Help+24billing focused React; whole57Node+215React/16files;109existing backend support/billing tests; frontend full lint0/TypeScript/Vite build.8built-route HTTP-fixture renders EN/UR390/1440, no overflow/JS errors and only public support requests. Desktop/mobile reviewed and heading precedence/contact wrapping fixed; detector[]. Real support/legal/distribution values were not supplied/activated. See COMMERCIAL_CONTENT.md and inventory38.

## Spec39 delivered and verified

CI retains full backend/web/native tests/types/builds, manager SQL contracts and non-pushing container builds; adds explicit active direct-photo/qualification/review/receipt/read-model tests and a guarded current SQL runner. Replaces old lifecycle/buffered/photo-HTTP entries whose fixture expectations contradict current receipt/qualification rules. Prior hosted lifecycle failure39619823659 is documented. Retained manager HTTP first exposed obsolete typeless/no-expiry JWTs (run39625860958); fixture now uses real generator, verifies old-token401 and supplies only local synthetic mirrored entitlement. No auth/account policy weakened.

Owned SQL runner rejects non-local/non-test/production targets before connecting; no dotenv fallback. It creates one generated child of explicit disposable priv_verification_test bootstrap, applies ordered actual migrations, runs10current workforce/capacity/billing/owner/settings/annotation/operator-company/operator-support/photo/composition proofs sequentially and7SQL invariants; drops only that child, with timeout/failure blocking CI. Manager integration independently owns its disposable database.

Local verification:13readiness/103focused active tests; whole backend1439passed+7explicit SQL skips/95files (includes4pre-existing untracked performance tests excluded from commits). Backend tsc/build pass.101native tests/typecheck/Expo web build pass. All10actual SQL workflows+7invariants and retained manager HTTP/query/pagination SQL passed on an unprivileged fresh PostgreSQL16.15 cluster at127.0.0.1:56441. Official server package extracted under /tmp/hygene-spec39-postgres-tools, new data under /tmp/hygene-spec39-postgres-data; no system installation/production DB/Docker privilege. Tools/cluster are temporary. Expected immutability negative-test errors and pg concurrency deprecation warnings are documented non-failing output.

Hosted code run39626388658 https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/39626388658 on fbd5ca7: clean backend1435passed+7explicit SQL skips (then7run separately), current SQL and retained manager steps passed; web57Node+215React and native101/type/web build passed. All4jobs concluded SUCCESS, including3non-pushing container image builds. Code proof is on fbd5ca7;38 typography-only66723be was subsequently integrated from the updated base with frontend TypeScript/Vite rebuild and8EN/URrender checks passing. Final docs changes do not claim a new CI run has finished. This is CI/isolated contract proof, not whole-product E2E, live-provider or physical-device verification. Validator42specs/0errors/8existing documented warnings. Local logs /tmp/hygene-spec38-* and /tmp/hygene-spec39-* are ephemeral; source tests/runbook/inventories are durable.

## Unresolved release blockers

releaseReadiness.ts validates actual production-security configuration and reports only redacted observations. All12external evidence gates remain REQUIRES_EVIDENCE and releaseAllowed=false: actual TLS/origin, secrets/job ownership, backup/migration/rollback/restore, Paddle merchant/catalog/sandbox, owner delivery/legacy bootstrap, operator IdP/MFA/browser adapter, verified support/approved policies, signed Android/physical-device, old-media transition, representative consented photo privacy/identity, customer calendar/fit and query scale. No flag, schema observation, synthetic data or historical report completes these gates. Existing operator browser sign-in and new automated photo processing stay disabled; completed-result reconciliation remains supported.

Confirmed unbounded staff/manager/location master lists and per-inquiry JSON audit lookup scale risk are a separate **proposed** follow-up specification in followups/BOUNDED_LISTS_SPEC.md, not implemented or silently added to the41-unit DAG. No broad query/API rewrite. Real release qualification and whole-product40/41 remain outstanding.

## Changed files

38: frontend/src/pages/Help/{HelpPage.tsx,HelpPage.test.tsx,serviceInformation.ts,help.css}; frontend/src/i18n/{serviceTranslations.ts,translations.ts}; frontend/src/main.tsx; frontend/src/components/layout/{Sidebar.tsx,PublicLayout.tsx}; frontend/src/pages/Subscription/{SubscriptionPage.tsx,SubscriptionPage.test.tsx}; docs/implementation/COMMERCIAL_CONTENT.md; .impeccable/surfaces/frontend-src-pages-help-helppage-tsx.md; specs/{30-account-ui.md,32-billing-ui.md,34-platform-security-ui.md,35-platform-service-ui.md,38-service-information.md,40-e2e-suite.md,PROGRESS.md}; inventory38 and SESSION_HANDOFF. Shared ownership transferred before edits; actual approved design files untouched.

39: .github/workflows/ci.yml (intended hunks only); backend/scripts/launchCiDatabase.ts; backend/src/services/{releaseReadiness.ts,releaseReadiness.test.ts}; backend/tests/managerOperations.integration.ts (fixture only); docs/implementation/{RELEASE_RUNBOOK.md,followups/BOUNDED_LISTS_SPEC.md,SESSION_HANDOFF.md}; specs/{38-service-information.md,39-release-operations.md,40-e2e-suite.md,PROGRESS.md}; inventory39. No package/schema/application-auth/provider production source change.

## Prior handoff history

# Active batch — 2026-10-21:38 complete, continue39

Latest user authorizes next two38/39 only.38 implemented/verified on implementation/spec-38-service-information based35/5f10d3c, issue75; draft publication follows.16Help+24billing React; whole57Node+215React/16files;109backend; frontend lint0/TS/build.8built-route EN/UR renders no overflow/JS errors; public help never bootstraps tenant session. Customer facts default unavailable, new checkout requires policies/support and fresh recipient, existing portal retained. Real commercial/legal/delivery/device qualification remains external; no production config/provider changes. Files/config/evidence in inventory38 and COMMERCIAL_CONTENT. Eight original dirty files preserved;39 must retain unrelated CI step as uncommitted. Continue39 then STOP, never40/41.

## Prior history

# Final handoff — 2026-10-21: Specs33 and35 complete — STOP

Latest user requested two next specs. Completed33 Platform company workspace and35 Platform service audit/leads UI; no further spec started. Decision00 plus37 of41 units Done. Remaining38/39/40/41; **next eligible38**.39 is graph-eligible but has unresolved real launch/provider/device/operational qualification requirements.40 waits on38/39 and41 waits on40. No merge, deployment, production data/configuration change, database migration/reset or live IdP/provider/email operation.

## Branches and review

-33: implementation/spec-33-platform-company-ui, e0a5d63, issue71, OPEN/DRAFT PR72 https://github.com/Shumail-AbdulRehman/PRIV/pull/72; base implementation/spec-32-billing-ui/207dd6c (PR70).
-35: implementation/spec-35-platform-service-ui, issue73 https://github.com/Shumail-AbdulRehman/PRIV/issues/73; base33/e0a5d63. Implementation02fbd79 published OPEN/DRAFT PR74 https://github.com/Shumail-AbdulRehman/PRIV/pull/74. Final docs commit follows; source checks unchanged.
- Both actual spec dependencies were verified in current Git ancestry (33:24/27;35:25/27).34's existing separate identity boundary is also present. Git serialization preserves existing completed work and draft stack; no new specification dependency added. Outstanding review includes all prior stacked draft PRs and31/36 combined verification checkpointb21dcca. Human integration/review remains required; no PR merged.

## Implemented behavior

33: bounded company search/status/cursor pages; Account/Billing/Activity detail with allowlisted metadata; explicit reasoned/versioned suspend/reactivate confirmation.409 refresh preserves reason and intended action; legacy inactive reactivation stays unavailable. No workforce/photos/impersonation or paid/financial overrides. Historical records unchanged.

35: actual service/audit/inquiry routes; real nullable redacted diagnostics, database observation separated from overall health/provider connectivity/production readiness; bounded metadata audit and inquiry filters/pages. Separately loaded submission text stays escaped/untrusted. Handling persists through existing25 API, with deliberate SELF/UNASSIGNED assignment/status/reason/expectedVersion.409/uncertain save keeps draft and blocks resave until successful explicit refresh; failed refresh preserves draft; duplicate click lock. Only configured validated support mailbox gets an email handoff; queue handling neither verifies contacts nor sends messages. Responsive approved v5 blue/white EN/UR/RTL.

**External limitation:** existing34 browser operator provider remains unqualified and safe-disabled. Actual guarded routes never mount workspaces or request protected data from tenant/storage identity. Positive component/render fixtures replace only operatorRequest to prove contracts; they do not qualify live IdP/MFA or integrated application mutation. Real browser adapter/provider security qualification remains39/40. No tenant authentication fallback or fabricated session was added.

## Verification

-33:11focused React; whole frontend57Node+176React/14files;123backend company/operator tests/2files; full lint0/TypeScript/Vite build pass.16EN/UR390/1440 isolated renders; desktop account/mobile Urdu dialog inspected; title-close RTL overlap fixed. Detector[].
-35:22focused React; whole frontend57Node+198React/15files includes33/34 regressions;135backend support/operator tests/2files. Full lint0/TypeScript/Vite build pass (existing non-failing plugin timing advisory).20EN/UR390/1440 named-workspace diagnostics/audit/inquiries/detail/error renders: no page overflow/JS errors or visible buttons below44px; source controls48px. Desktop EN diagnostics/mobile Urdu detail inspected; detector[]. Actual guard denial checked on all3routes. No whole-product E2E or live provider proof claimed.
- No backend source/schema/dependency/config change. Test seams use isolated synthetic data; no production/test DB operation required. Temporary render/request harness removed before final checks. Logs/captures `/tmp/hygene-spec33-*`, `/tmp/hygene-spec35-*` are ephemeral; durable behavior/tests/limitations documented in specs/inventory and PLATFORM_SERVICE_UI.md.
- Original eight dirty tracked files verified byte-for-byte against `/tmp/hygene-spec33-35-preserved.json`; unrelated untracked assets/skills/performance/investor-video files excluded. No blanket staging.

Spec validator:42specs,0errors/8existing documented warnings. Final read-only Git checks confirm PR72/74 OPEN/DRAFT with the intended32→33→35 stack.

## Changed files in this batch

33 commit: frontend/src/pages/Platform/{CompaniesPage.tsx,CompaniesPage.test.tsx,companyApi.ts,companies.css,platformRoutes.tsx}, frontend/src/i18n/{platformCompanyTranslations.ts,translations.ts}, specs/{32-billing-ui.md,33-platform-company-ui.md,34-platform-security-ui.md,40-e2e-suite.md,PROGRESS.md}, specs/inventory/33-platform-company-ui.md, docs/implementation/SESSION_HANDOFF.md. See e0a5d63 for exact ownership metadata changes.

35: frontend/src/pages/Platform/{ServicePage.tsx,ServicePage.test.tsx,serviceApi.ts,service.css,platformRoutes.tsx,CompaniesPage.tsx(nav only)}, frontend/src/i18n/{platformServiceTranslations.ts,translations.ts}, specs/{33-platform-company-ui.md,35-platform-service-ui.md,40-e2e-suite.md,PROGRESS.md}, specs/inventory/35-platform-service-ui.md, docs/implementation/{PLATFORM_SERVICE_UI.md,SESSION_HANDOFF.md}, .impeccable/surfaces/frontend-src-pages-platform-servicepage-tsx.md. Shared ownership transferred explicitly before edits; approved design artifacts untouched.

## Prior handoff history

# Active batch checkpoint — 2026-10-21:33 complete, continue35

Latest user authorized next two specs33/35 only.33 scoped UI implementation and checks pass; continue35 before final handoff/STOP. Branch implementation/spec-33-platform-company-ui based32/PR70 at207dd6c, issue71. Actual24/27 dependencies and existing34 auth seam verified in Git. Company search/paging/detail Account/Billing/Activity/status confirmation use24 contracts through separate operator transport. Draft409 reason/intended target preserved, no tenant/workforce/evidence/financial mutations. Existing unqualified browser sign-in remains disabled; positive workspace fixtures are network-seam proof, not live IdP qualification.39/40 retain that external gate.

33 verification:11focused React; full57Node+176components/14files;123backend/2files; full frontend lint0+TypeScript/build.16 EN/UR390/1440 synthetic named-component renders zero overflow/JS errors; Urdu close-title overlap corrected. Actual guarded route never mounts workspace or calls API from tenant/storage identity. Logs/captures /tmp/hygene-spec33-*. Ownership/dto reuse in inventory33. No schema/dependency/production/provider changes. Preserve eight dirty files checkpoint /tmp/hygene-spec33-35-preserved.json; unrelated files excluded.33 draft PR/commit publication follows; then35 separate branch/issue/PR. No further specs authorized.

## Prior handoff history

# Implementation handoff — 2026-10-21, Spec32 complete — STOP

## Current continuation state

Latest user authorized the next specification only and requested notification when complete. **Spec32 is implemented and verified.** Decision00 and35 of41 execution/gate units Done; **6 remain:33,35,38,39,40,41**. Stop after this unit; next eligible33 identified only. No other specification was started, no PR merge, deployment, production data/configuration, destructive migration or live financial/provider action.

Branch `implementation/spec-32-billing-ui` is based on completed integration checkpointb21dcca (`implementation/spec-31-36-verification`), which includes both independent31/36 implementations and their resolved dictionary registration. Spec32 actual dependencies15/27/28 are Done and verified Git ancestors; no new spec dependency was added. The Git base preserves the latest complete application; it does not imply32 consumes workforce or photo features. Existing draft PR68(31) and67(36) remain independently based37/PR64. Their human integration and the verification checkpoint remain outstanding review prerequisites of the Git stack, not authorized merges.

Issue69: https://github.com/Shumail-AbdulRehman/PRIV/issues/69. Implementation9a08f78 is published as **OPEN/DRAFT PR70**: https://github.com/Shumail-AbdulRehman/PRIV/pull/70, base implementation/spec-31-36-verification atb21dcca. Issue remains open for human review; completion metadata is a subsequent documentation commit. Pre-existing eight dirty tracked files and all unrelated untracked files were preserved; checkpoint `/tmp/hygene-spec32-preserved.json` verified byte-for-byte after implementation.

## Spec32 implemented behavior

- Actual React `/subscription` reads owner-scoped lifecycle/catalog from15, showing provider state/periods/scheduled changes/last-event facts separately from workspace capacity and permissions. Null dates are unavailable; no invented trial clock, price, paid flag or grace period. Actual over-limit counts remain visible; no deletion controls or record loss.
- Owner/company query identity, principal-keyed UI, fresh identity/lifecycle rechecks, duplicate-click lock and late-response cancellation protect billing actions. Restricted owners retain billing/account-security links; administrative suspension is separate from payment.
- Existing linked subscribers use fresh `/subscription/manage/managed-portal` only. Temporary URLs are host-validated, navigated directly, and never query/mutation/browser persisted.
- Approved available catalog entries show provider currency/minor-unit amounts and only genuine trialPeriod facts. Checkout posts only plan/interval to server `/checkout`; Paddle opens the returned transaction ID, never browser-owned price/customer/customData. Prepared checkout can reopen without another POST. Uncertain responses block new attempts until explicit refresh/reconciliation; no automatic purchase retry or inferred failure.
- Legacy `/choose-plan` goes to canonical billing; `/welcome` redirects with a pending hint that never proves payment. Public pricing retains capacity/inquiry and links to owner billing/signup; no public price-only purchase or fixed7-day trial claim remains in that component. Billing provider/terms approval flag was not enabled or modified.
- Approved v5 blue/white, existing component primitives, EN/UR/RTL, explicit loading/denial/stale/empty/error states, responsive facts/capacity and48px actions. No additional billing infrastructure or dependency.

## Verification and evidence

- Focused `npm run test:components --prefix frontend -- src/pages/Subscription/SubscriptionPage.test.tsx`: **23 passed**.
- Exact `npm test --prefix frontend`: **57 Node +165 React tests/13files**, zero failures/skips.
- Backend relevant existing lifecycle/account-access/auth: **109 tests/3files passed**. Backend implementation unchanged; no SQL/provider operation required or claimed for this UI unit.
- Full frontend lint: **0 errors/warnings**. `npm run build --prefix frontend`: **pass**, including TypeScript; non-failing plugin timing advisory only.
-16 built-app synthetic HTTP fixtures EN/UR×390/1440×unconfigured/linked/pending/suspended: no page overflow/JS errors, no initial POSTs, billing buttons48px. Desktop EN linked and mobile Urdu pending visually reviewed. Detector `[]`. Network-mocked screenshots/component tests are not live Paddle/payment/portal/webhook/whole-product qualification; those remain39/40.
- Spec validator:42specs, **0errors/8documented warnings**; current output `docs/implementation/planning/validator.md`.

Logs `/tmp/hygene-spec32-{focused-final,web-tests-final,backend-focused,lint-final,build-final,render-final}.log`, captures `/tmp/hygene-spec32-visual/`, synthetic harness `/tmp/hygene-spec32-render.mjs`; temporary evidence may disappear. Only our frontend fixture servers5198/5199 were started; existing root user dev processes were untouched. No application .env was used to choose a database.

## Changed files and reuse

Runtime/test files: `frontend/src/pages/Subscription/{SubscriptionPage.tsx,SubscriptionPage.test.tsx,api.ts,queries.ts,types.ts,billing.css}`, `frontend/src/pages/Pricing/{PaddlePricing.tsx,ChoosePlanPage.tsx,WelcomePage.tsx}`, `frontend/src/i18n/{billingTranslations.ts,translations.ts}`. Reuse: existing15 APIs,28 lifecycle client/types,27 shell, API/auth, Paddle.js transaction contract, PageHeader/Button and language provider. Shared operational summary hooks and existing enterprise inquiry remain intact.

Documentation: `docs/implementation/BILLING.md`, `specs/32-billing-ui.md`, inventory32, ownership handoffs in15/28/31, runtime consumers40, PROGRESS/README and this handoff. No generated artifacts, original dirty CI/dashboard/performance/manager translations/package files or untracked design/skills/investor-video staged.

## Limits and next eligible unit

No unresolved local implementation failures. Real merchant eligibility, catalog/terms approval, actual sandbox payment/portal/webhook and reconciliation operations remain external39/40 qualification gates. No live billing availability claimed from mocks; existing backend release activation configuration remains authoritative and disabled unless independently qualified. Existing photo/privacy/operator/mail/legal/host/backup/Android gates remain unchanged.

**Next eligible33** consumes24/27Done;35 and38 also eligible.39 locally consumes03/26Done but external operational qualification remains incomplete;40 waits remaining units and41 waits40. **STOP after publishing32; do not begin33 without a new instruction.**

## Previous verified handoffs (historical; latest Spec32 state above takes precedence)

# Implementation handoff — 2026-10-21, Specs31/36 complete — STOP

## Current verified state

Latest user explicitly requested two simultaneous implementation agents in isolated worktrees, followed by independent review, combined verification, documentation and STOP. That batch is complete. Decision00 and34 of41 execution/gate units are Done; **7 remain:32,33,35,38,39,40,41**. No other specification was started. No PR merge, deployment, production mutation, destructive migration or new dependency.

Both11/17/27 and20/21 dependencies were independently checked against full specs/PROGRESS and actual Git ancestry. Both implementation branches start from the same dependency-complete37/PR64, with no31↔36 edge. Common prerequisite26000a7 fixes only the inherited native translation import extension so Node parity tests resolve;101 native tests and native tsc passed. It fast-forwarded37/PR64, with no feature scope expansion or history rewrite.

## Branches and draft reviews

- **31:** `/tmp/hygene-spec31`, `implementation/spec-31-workforce-management`; implementation0264ad9, completion metadata325149f. Issue65 https://github.com/Shumail-AbdulRehman/PRIV/issues/65; **draft PR68** https://github.com/Shumail-AbdulRehman/PRIV/pull/68.
- **36:** `/tmp/hygene-spec36`, `implementation/spec-36-photo-review-clarity`; implementatione3c3f4a, completion metadata628545f. Issue66 https://github.com/Shumail-AbdulRehman/PRIV/issues/66; **draft PR67** https://github.com/Shumail-AbdulRehman/PRIV/pull/67.
- Both PRs confirmed OPEN/DRAFT, base `implementation/spec-37-native-integrated` at26000a7/PR64. All earlier stacked drafts remain unmerged. Neither31 nor36 depends on the other's PR. The evidence subagent reached its usage limit after its final documentation commit; coordinator verified that628545f was already pushed.
- Current checkout **`implementation/spec-31-36-verification`** combines both through scoped cherry-picks9de1347(36),99592ad(31),8e3b3f1/b3a30c3(metadata). Shared progress/handoff/validator final checkpoint lives here, preserving both independently reviewable branches. This is a verification branch, not a production merge or deployment.
- Only application conflict was the shared translation registry. Coordinator retained both imports/lookups (`reviewUrdu` and `workforceUrdu`) and reran the complete frontend suite/lint/build. Human merge review should retain both registrations; the combined branch contains the resolved result. Do not make36 depend on31 just to resolve this textual conflict.

## Implemented behavior

**31:** Real staff list/detail and manager forms now expose reasoned history-preserving deactivate/archive, assigned-site transfer with expected source and open-shift denial/draft preservation, manager hire site requirement, and current-password one-use recovery code. The code stays out of browser storage/query/mutation caches, is cleared on dialog close/principal changes and is displayed without refresh unmounting the detail. Existing APIs revoke credentials/push/capture and preserve historical attendance/task/evidence. Manager handover deliberately uses two persisted steps: deactivate/release sites, then assign released sites to an active replacement using the existing editor. Other-account manager password replacement and general restore remain unavailable. Misleading reasonless permanent-delete row controls were replaced; shared DeleteButton retained-history fallback for other entities is unchanged. New workforce actions/form controls have measured48px targets, English/Urdu/RTL and busy/error feedback.

**36:** Actual review queue/detail independently render current upload receipts, persisted task submission, attributed manager closure/note and only persisted VERIFIED_COMPLETE as verified. Closing a review never grants verification. New authorized read-only per-view context reuses20 failed-view/current assignment guard and21 qualification, separating policy eligibility from service availability. Held/outage/unknown evidence never implies dirty,403/404/410/network evidence states differ, and protected credentialed blob access is retained. Existing resolve-review/performance-issue actions remain the only closure workflows. No retired extension, waiver or manual manager retake actions were restored; no fabricated AI scores/results. Real new photo processing stays disabled pending genuine privacy/production qualification.

## Independent verification

Coordinator reviewed both actual diffs and representative desktop/mobile English/Urdu renders, then verified the combined application source:

- `DATABASE_URL=<explicit isolated loopback test URL> LAUNCH_PERSISTENCE_TEST_DATABASE_URL=<same> npm test --prefix backend`: **1433 tests/94files, zero skips**. Includes new replacement DTO/helper/Express authorization reads and existing role/company/site/private-media/closure policies.
- `npm test --prefix frontend`: **57 Node +142 React component tests/12files**, zero failures/skips.
- `npm run lint --prefix frontend`: **zero errors/warnings**.
- `npm run build --prefix frontend` and `npm run build --prefix backend`: **pass**, including TypeScript. No backend lint script exists. The frontend emits a non-failing plugin timing advisory, not a compilation warning/error.
- Coordinator separately reran guarded `backend/tests/workforceLifecycle.integration.ts` and `backend/tests/credentialHandoff.integration.ts` against `postgresql://shumail@127.0.0.1:56439/hygene_launch_test`: **both PASS**. Proved upload/transfer race, open-shift denial, original history, revoked captures/epochs/push/session, manager site release, wrong-site recovery denial, hash-only code, one-winner consumption, old access/refresh/logout denial and secret-free credential audits. Synthetic local entitlement/catalog only; no provider or production data.
- Per-branch31:18focused React;57+120whole web;50focused backend; backend/web builds, frontend lint, native101+tsc. Per-branch36:22focused React;57+124whole web;98focused backend/9files (17new), frontend/backend tsc, web lint/build. Exact commands/details in spec Logs/inventories.
- Each engineer inspected16 synthetic API-intercepted actual React presentation captures (EN/UR ×390/1440):31 transfer/handoff/manager/conflict,36 outage/resolved/missing/denied. No page overflow/JS errors.31 final mobile transfer targets measured48px and dialog bounds fit viewport. These screenshots/component fixtures are **not integrated product/device/provider E2E proof**. Whole-product E2E remains40; no release qualification inferred.

Logs: `/tmp/hygene-spec31-36-{combined-backend,combined-web,backend-build,web-build,lint,workforce-sql,credential-sql}.log`; per-agent logs `/tmp/hygene-spec31-*` and `/tmp/hygene-spec36-*`. Captures `/tmp/hygene-spec31-captures/`, `/tmp/hygene-spec36-visual/`; temporary artifacts may vanish. Durable contracts: inventory31/inventory36 and `docs/implementation/PHOTO_REVIEW_UI.md`. Validator evidence: `docs/implementation/planning/validator.md`.

## Changed files

### Spec31

- `backend/tests/credentialHandoff.integration.ts`
- `backend/tests/workforceLifecycle.integration.ts`
- `frontend/src/i18n/translations.ts`
- `frontend/src/i18n/workforceTranslations.ts`
- `frontend/src/pages/Managers/ManagerAccessActions.tsx`
- `frontend/src/pages/Managers/ManagerFormDialog.tsx`
- `frontend/src/pages/Managers/ManagersPage.tsx`
- `frontend/src/pages/Staff/StaffCreateDialog.tsx`
- `frontend/src/pages/Staff/StaffDetailPage.tsx`
- `frontend/src/pages/Staff/StaffPage.tsx`
- `frontend/src/pages/Staff/WorkforceActions.test.tsx`
- `frontend/src/pages/Staff/WorkforceActions.tsx`
- `specs/11-workforce-lifecycle-api.md`
- `specs/18-credential-revocation.md`
- `specs/28-setup-ui.md`
- `specs/29-attendance-context-ui.md`
- `specs/30-account-ui.md`
- `specs/31-workforce-ui.md`
- `specs/inventory/31-workforce-ui.md`

### Spec36

- `backend/src/routes/verificationException.launchReview.test.ts`
- `backend/src/routes/verificationException.route.ts`
- `backend/src/services/verification-v2/launchReviewContext.test.ts`
- `backend/src/services/verification-v2/launchReviewContext.ts`
- `docs/implementation/PHOTO_REVIEW_UI.md`
- `frontend/src/i18n/reviewTranslations.ts`
- `frontend/src/i18n/translations.ts`
- `frontend/src/pages/Exceptions/ExceptionDetailPage.tsx`
- `frontend/src/pages/Exceptions/ExceptionInboxPage.tsx`
- `frontend/src/pages/Exceptions/LaunchReviewContext.test.tsx`
- `frontend/src/pages/Exceptions/LaunchReviewContext.tsx`
- `frontend/src/pages/Exceptions/launch-review.css`
- `frontend/src/pages/Exceptions/reviewDiagnosis.ts`
- `frontend/src/pages/Exceptions/types.ts`
- `frontend/src/pages/Verification/ProtectedEvidence.tsx`
- `specs/26-launch-api-composition.md`
- `specs/36-photo-review-ui.md`
- `specs/inventory/36-photo-review-ui.md`

### Shared coordination and prerequisite correction

- `frontend-mobile/src/i18n/translations.ts`: shared prerequisite import-only correction26000a7, kept in37/PR64.
- `specs/PROGRESS.md`, `specs/README.md`, `specs/40-e2e-suite.md`, `docs/implementation/SESSION_HANDOFF.md`, `docs/implementation/planning/validator.md`: verified status, consumers, final handoff and validation evidence. Completion metadata updates only the assigned31/36 specification Logs.

## Remaining limitations and next eligible work

No unresolved local implementation failures. Manager handover is explicitly two persisted actions, not an invented atomic HR workflow. Real consented photo/privacy qualification, live OIDC/MFA/provisioned operators, verified delivery/support, Paddle/catalog/terms, legal/retention/exit, hosting/TLS/backups, signing/device and customer/calendar qualification remain39/40 external gates.31/36 do not enable any of these. Real new photo processing remains disabled21.

**Next eligible:32**, consuming15/27/28Done;33,35,38 also eligible.39 is locally dependency-eligible via03/26 but its actual external operations qualification remains incomplete.40 requires remaining01–39;41 requires40. Identify only; **STOP — do not implement another specification without a fresh instruction.**

All eight original dirty tracked files passed the byte-for-byte preservation check before temporary runtime cleanup; existing dashboard/performance/CI/package/manager translations and unrelated untracked design/skills/investor-video were excluded from commits. Preserve those files and prior worktree registrations. After the final continuation, temporary worktrees, SQL infrastructure, raw logs/captures and preservation JSON were no longer present; their Git branches, implementation commits, published PRs and durable verification records remain. Do not mistake prunable worktree registrations for missing implementation commits. Recreate isolated infrastructure only if future changes require retesting. Agents used distinct frontend ports5195/5196/5197 with API mocks and isolated Vite caches; SQL/build generation serialized between agents. Existing root backend/frontend dev processes are not ours and must not be stopped. No production environment loaded to choose a database.

## Historical handoff (prior batches; superseded by the verified checkpoint above)


# Implementation handoff — 2026-10-21, requested batch29/30/34/37 complete — STOP checkpoint

## Current continuation state

Latest user explicitly authorizes parallel agents for independent work, then asks to STOP after the current batch29/30/34/37 completes. Finish verification, integration, scoped commits/pushes and draft PRs for this batch only, update this handoff and report remaining work. Do not start another specification. This supersedes earlier unlimited-continuation instructions. Approved launch scope/design/v5 remain authoritative. No deployment, production mutation, destructive migration or PR merge is authorized.

Completed: decision00 and32 of41 execution/gate units:01–30,34,37. **9 remain:31,32,33,35,36,38,39,40,41.** Latest user asked to finish this batch and stop; do not implement any further unit until a fresh instruction. Draft review is unmerged and no production operation/deployment is authorized.

## Latest batch and next continuation

Root integrated isolated parallel implementations onto a serialized stack:29→30→34→37.29 implementation008c2d3 draftPR61 (base28/PR56).30 integrated83e8a8c/2b42bad/be81d57 plus52c301b draftPR62 (base29/PR61).34 integrated874fff1/3cb20d1/82a7d21 plusb5d88d2 draftPR63 (base30/PR62).37 integratedab9e8da/bc2d2fc currentbranch `implementation/spec-37-native-integrated` based34/PR63; finalpublicationrecordbelow. Issues57/58/59/60 remainopenforhumanreview. NoPRmerged.

Final evidence: wholefrontend57Node+102componenttests/10files, fullfrontendlint0, TypeScript/Vitebuildpass; wholemobile101tests/zeroskips,tsc,Expowebexportpass. Backendunchangedafter28 (1416tests/92files/zeroskips +tsc/buildverifiedthen). 29actualAPIcontext12focused,30account19focused,34operator15focused; fresh independentreviews/documentation completed.29mobiletargetfix48 verifiedbyfreshfixreview afteroriginalreviewerquota;30samereviewerfixverdictresolved;34scopeintentionallydisabledprovider, zerotenant/APIrequestsfromactual4platformroutefixture renders. Native37review/sourcecomponentsONLY; noAndroidruntimevisualapproval.

Nexteligibleunit31 consumes11/17/27Done;32(15/27/28),33(24/27),35(25/27),36(20/21/27),38(27/25) also eligible.39 operations/config is locallyeligible via03/26 but actualIdP/mail/support/Paddle/legal/host/backup/signing/device/consentedphoto qualification remains external.40 requires01–39,41requires40; do not markeither frommocks. User has NOT authorized continuingafterthisbatch.

Preservealloriginaldirtytrackedfiles:CI,gitignore,DESIGN.md,backendpackage,managercontroller/routes,managertranslations,Dashboard.8filehashesmatch `/tmp/hygene-spec29-preserved.json`; untrackedperformance/design/skills/investor-video remainoutsidecommits. Parallelworktrees /tmp/hygene-spec30,/tmp/hygene-spec34,/tmp/hygene-spec37 retainimplementationbranches andlocalcaptureevidence; don'treset/stash/deleteuserwork. Sharedroute/translation/progressconflictswere resolvedretainingallfeaturechangesandlateststopinstruction. Rootmainownernow34; furtherregistrationneedsserializedownershiphandoff.

No newdependencies/schema/migration/backendpolicy/providerconfiguration introducedbybatch. Actual21newphoto processing staysunavailable;37camera/uploadhonorsmanifestqualification while historicalsamecaptureresult/retryandpersistedreceipt remainreachable. Historicalnativeglobalteal/systemfontvsapprovedv5blue/Interdrift is documentedandunchanged, notvisualparityclaim. Noadb/emulator/nativecaptures; fontscale/Urdu/devicepermissionsGPS/push/IMEBack/install/signing/performance39/40unverified. LiveIdPbrowseradapterabsent:34separateplatformrequestsdenybeforeI/Oandnocallerprovidestoken; do notfallbacktotenantauthin33/35.

Logs `/tmp/hygene-batch-web-{tests,lint,build}-final.log`, `/tmp/hygene-batch-native-{tests,type,build}.log`, `/tmp/hygene-spec34-route-proof.log`;temporaryfilescanvanish. SyntheticReactcaptures29root `.impeccable/review/spec29/`,30/34respectiveworktreesarecomponent/renderproofonly, not40E2E. Validator42specs/zeroerrors/eightjustifiedwarnings; READMEwaves/DAGinclude30actual28composition and37actual26capabilityconsumption.


## Spec28 verified local boundary

Current branch `implementation/spec-28-derived-setup`, base26/PR54 atd078847. Issue55. Implemented actual owner/assigned-manager setup page using12 persisted bounded per-site readiness plus14 exact server MANAGE_WORK permission and15 owner lifecycle metadata. Four derived steps navigate existing location/staff/area/schedule forms, no saved browser checklist. Role/403/error/loading/read-only/partial-page selection explicit; timestamp uses location timezone. Owner contact and billing service state remain independent from permission; unknown permission never implies billing failure. Actual API policies retained. Today adds calendar/setup guidance; dirty Dashboard performance source unchanged.

Verification:17 readiness tests; whole backend1416/92 files/zero skips using explicit isolated test DB.16 focused frontend tests/2 files, whole57 Node+56 component/6 files. Backend tsc/build and frontend lint/TypeScript/build pass; no backend lint script. Eight synthetic React capture states1440/390 EN/UR checked with no overflow/JS errors; these are component/render evidence, not40 integrated persistence E2E. Impeccable detector returned[]; independent reviewer requested access-unknown state separation, same reviewer scored the correction resolved/ship at fix scope. Approvedv5 and dirty DESIGN.md preserved; no new raster assets/dependencies/schema/production data/config. Full contracts/reuse in SETUP_UI.md and inventory28. Validator42 specs/zero errors/six justified warnings.

Future30 replaces honest settings-unavailable boundary;32 consumes shared getBillingLifecycle/BillingLifecycle and replaces legacy billing management. Spec21 real privacy/identity/consented empirical qualification and39/40 provider/device/legal/host/mail/billing/backup gates remain external; never infer qualification from these mocks. All8 original dirty tracked files verified byte-for-byte against checkpoint. Continue29 after scoped commit/push/stacked draft PR; don't merge.

Logs `/tmp/hygene-spec28-{backend-tests,backend-tsc,backend-build,focused-final,web-final,lint-final,build-final,render}.log`, detector JSON. Temporary render tooling may disappear; screenshots under ignored `.impeccable/review/spec28/` are local evidence. Loopback Vite5188 session53653 is fixture tooling; no deployed service.


## Spec24 verified local boundary

Branch `implementation/spec-24-platform-companies`, base `implementation/spec-15-billing-lifecycle` at2558549. Prerequisites19 and15 are complete and reachable in Git; all predecessor PRs remain open and unmerged. Issue39: https://github.com/Shumail-AbdulRehman/PRIV/issues/39. Implementation commit5a70884 pushed; draft PR40: https://github.com/Shumail-AbdulRehman/PRIV/pull/40, stacked on PR38. No merge or issue closure.

- Service/router provide bounded name/status-filtered company paging and whitelisted detail with local subscription/provider-sync facts and last20 platform status audit records. No workforce/evidence, credentials, arbitrary audit JSON, impersonation or financial mutation.
- PATCH status consumes strict expectedVersion/status/reason. Company-first lock, conditional update and audit in one transaction; stale409, current-version same-state no-op. Suspension changes only operationalStatus/version/context. Legacy isActive:false reactivation409 requires review. Reactivation does not grant paid entitlement or change billing.
- Existing audit helper permits PLATFORM_OPERATOR; null tenant actorId, exact verified issuer/subject retained in audit newValue, reason and DB timestamp durable. Existing account policy reused for read availability.
- Router itself applies separate verifyOperator middleware and private/no-store even on denial. **Mounting is spec26** at `/api/platform/companies`. Real IdP/MFA/provisioned people remain absent, so no live operator access or whole-product policy enforcement is claimed.

Changed files: platformCompany.service.ts, its54-test file, platformCompany.route.ts, existing auditLog.service.ts actor type, backend/tests/platformCompany.integration.ts, inventory24, specs24/26/39, PROGRESS and this handoff; validator evidence refreshed. No UI or schema change. Preserve unrelated dirty work below.

Verification:54 focused tests; full backend1077 tests/84 files/zero skips with explicit isolated DATABASE_URL and LAUNCH_PERSISTENCE_TEST_DATABASE_URL; `cd backend && npx tsc --noEmit`; backend build; standalone integration tsc all pass. `PLATFORM_COMPANY_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/platformCompany.integration.ts` passed: real race one winner/one409, audit rollback, durable provenance, suspension policy, reactivation/owner/other tenant preservation. All data synthetic; no network provider calls. Logs /tmp/hygene-spec24-tests.log and /tmp/hygene-spec24-build.log. No backend lint script. Unit/router boundary tests are not the spec40 E2E suite.

## Prior Spec22 verified local boundary

Prior branch `implementation/spec-22-company-settings`, stacked on `implementation/spec-24-platform-companies` at6c6bdc5/PR40. Issue41: https://github.com/Shumail-AbdulRehman/PRIV/issues/41. Implementation commit1b677af pushed; draft PR42: https://github.com/Shumail-AbdulRehman/PRIV/pull/42, base PR40. This documentation is a subsequent checkpoint commit. Both units were completed sequentially and will have separate review PRs; no merge.

Name-only settings reuse registration name validation (trim2–160, Unicode), exact persisted active ADMIN/company authorization, existing READ_OPERATIONAL account policy and AuditLog. Company has no approved verified-contact columns; no new contact field or owner email change was invented. Settings DTO has id/name/accountVersion/updatedAt. Strict PATCH `{name,expectedVersion}` rejects company/plan/role/security/provider fields. Shared accountVersion under company-first lock safely conflicts with spec24 changes and avoids timestamp-precision lost writes. Same-name/current-version save no-op; stale409; audit and update atomic. Suspended company settings denied; active unentitled owner may rename (no new work/capacity).

Router GET/PATCH `/` applies tenant JWT/ADMIN/no-store, rejects operator context. **Mount at `/api/company/settings` in26**. No UI or schema change; account UI30 remains pending.

Spec22 files: companySettings.service.ts, its38-test file, companySettings.route.ts, backend/tests/companySettings.integration.ts, inventory22, specs22/26/39, PROGRESS and this handoff. Validator report refreshed. Existing unrelated dirty files remain preserved; final git status matches the pre-session dirty/untracked list exactly.

Verification:38 focused tests; whole backend1115 tests/85 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build; standalone22/24 integration tsc pass. `COMPANY_SETTINGS_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/companySettings.integration.ts` passed: persisted owner/tenant denial, concurrent rename one winner, actor/name/time durable, actual audit-failure rollback, shared name/status race, billing/owner/other company preservation. Logs `/tmp/hygene-spec22-tests.log`, `/tmp/hygene-spec22-build.log`. No backend lint script or frontend/mobile changes. Final validator42 specs/zero errors/two accepted warnings (decision00 issue, terminal VERIFICATION.md), justified in README.

## Prior Spec23 verified local boundary

Prior branch `implementation/spec-23-attendance-annotations`, base `implementation/spec-22-company-settings` at09e0a82/PR42. Dependency10 is locally Done and present in Git; all predecessor PRs remain unmerged. Issue43: https://github.com/Shumail-AbdulRehman/PRIV/issues/43. Implementation207dad5 pushed; draft PR44: https://github.com/Shumail-AbdulRehman/PRIV/pull/44, stacked on PR42. No merge or deployment; issue43 stays open. This checkpoint is a subsequent documentation commit.

New service/router append immutable NOTE and parent-bound ACKNOWLEDGEMENT using existing schema/SQL trigger. Staff adds/views only own historical attendance even after site transfer; MANAGER consumes current persisted assignment to Attendance.locationId, ignoring claimed token sites; ADMIN company-wide. Both attendance worker/site company bindings required. Actor and company access rechecked, suspended/inactive actors denied. Context creates no new paid work/capacity, so active unentitled actors may add notes. No edit/delete/payroll/corrected-hour endpoint; original attendance and parent notes untouched.

POST strict input: NOTE `{kind,reason,requestId}` or ACKNOWLEDGEMENT additionally `parentId`; only ADMIN/MANAGER acknowledge a NOTE on exact same company/attendance. Trimmed1–1000 reason, UUID request/parent, server identity/time. Advisory lock per tenant/role/actor/request followed by company/actor/target staff/attendance/scope locks; exact retry200/reused:true returns original, changed intent409, new append201. Annotation + audit reference atomic; no note text duplicated into audit. GET limit25 default/50 max, scoped UUID cursor, stable createdAt/id order; DTO only annotation identity/actor/kind/reason/parent/time. No original photo or workforce payload.

Mount `backend/src/routes/attendanceAnnotation.route.ts` under `/api/attendance` in26; paths GET/POST `/:attendanceId/annotations`, tenant JWT/no-store, operator context denied. Router remains unmounted until26; UI29 and E2E40 separate.

Files: attendanceAnnotation.service.ts, its55-test file, attendanceAnnotation.route.ts, backend/tests/attendanceAnnotation.integration.ts, inventory23, specs23/26/39, PROGRESS/handoff; validator evidence refreshed. No dependency, schema or UI changes. Final git status matches the original preserved dirty/untracked list exactly.

Verification:55 focused tests; whole backend1170 tests/86 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build; standalone integration tsc pass. `ATTENDANCE_ANNOTATION_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/attendanceAnnotation.integration.ts` passes real retry races, historical scope/revocation, tenant/parent/cursor denial, chronological paging, audit rollback, SQL update/delete denial and exact original fact preservation. Expected SQL immutability rejection messages appear in integration log. Initial synthetic fixture status fixed to schema CHECKED_IN before successful proof. Logs `/tmp/hygene-spec23-tests.log`, `/tmp/hygene-spec23-build.log`, `/tmp/hygene-spec23-integration.log`. No known failing checks. Backend has no lint script; frontend/mobile not changed.

## Prior Spec25 verified local boundary

Prior branch `implementation/spec-25-platform-support`, base `implementation/spec-23-attendance-annotations` at74a4bc9/PR44. Prerequisites19 and24 are Done and in Git; no preceding PR merged. Issue45: https://github.com/Shumail-AbdulRehman/PRIV/issues/45. Implementationc04c7ab pushed; draft PR46: https://github.com/Shumail-AbdulRehman/PRIV/pull/46, stacked on PR44. Issue45 stays open for human review. This checkpoint is a subsequent documentation commit.

Default platformSupport router uses separate verifyOperator and no-store; mount at `/api/platform/service` in26. GET diagnostics exposes actual DB reachability, aggregate persisted webhook/worker timestamps and configuration availability booleans only. UNAVAILABLE/null differs from reachable/no observations; no guessed liveness threshold, live provider connectivity, env/secret/worker-ID/log dump. GET audit has bounded companyId/action/ID filters and allowlisted platform company/inquiry summary fields only; no arbitrary reason/JSON or workforce actions.

Existing public enterprise-inquiry controller/source unchanged. Operator GET inquiries supports submitted-company q, stable UUID cursor, default25/max50. Summary excludes submitted contact/requirements; operator detail includes submitted name/email/requirements as untrusted text, never system workforce data. ContactVerification always UNVERIFIED. PATCH strict expectedVersion/status(NEW|IN_PROGRESS|CLOSED)/ownership(SELF|UNASSIGNED)/reason; original inquiry row locked but unchanged. Existing AuditLog records PLATFORM_INQUIRY/INQUIRY_UPDATED, inquiry UUID/newValue and distinct operator issuer/subject, owner/status, reason/DB time. Latest audit ID is version; initial0/NEW/unassigned. Current exact state no-op; stale409; invalid stored state unavailable. Sole durable state write is atomic audit append. Any verified operator may reasonedly claim/release/update; no arbitrary third-party assignee input or contact-verification assertion. No message sent.

Named customerSupportRouter separately mounts `/api/support` in26; public GET `/contact` exposes only available/email/channel/verification, never platform operations. Requires both valid SUPPORT_CONTACT_EMAIL and exact SUPPORT_CONTACT_VERIFIED=true, set only after responsible operator qualifies an approved public mailbox. Otherwise explicit unavailable/null. OPERATOR_CONFIGURED is a deployment fact, not automated verification/delivery proof. Actual channel/IdP remain unqualified. See SUPPORT_OPERATIONS.md for full contracts/limits/release checklist.35/38 consume this; no UI started.

Dependency corrections:25 consumes24's PLATFORM_OPERATOR audit helper type as well as19 identity.38 consumes25's public contact contract. Specs/tracker/README waves/DAG agree. Validator42 specs/zero errors/four justified warnings: prior00 no issue and terminal report, plus retained direct19→25 and24→26 consumption edges implied transitively. No additional execution wave from retaining those direct contracts.

Files: platformSupport.service.ts, its66-test file, platformSupport.route.ts, backend/tests/platformSupport.integration.ts, SUPPORT_OPERATIONS.md, inventory25, specs25/26/38/39, index/tracker, DAG/validator/handoff. No package dependency, migration, existing submission controller, production configuration or UI changed. Final Git status matches the original preserved dirty/untracked list exactly.

Verification:66 focused tests; full backend1236 tests/87 files/zero skips with explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build pass. Standalone integration command from backend uses `npx tsc --noEmit --strict --module NodeNext --moduleResolution NodeNext --target ES2023 --esModuleInterop --skipLibCheck src/types/express.d.ts tests/platformSupport.integration.ts` (strict nullability matches backend tsconfig/Zod transforms). Guarded real proof: `PLATFORM_SUPPORT_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/platformSupport.integration.ts`; existing public submission/retry unchanged, concurrent handling one winner/one409, actor/time/reason/owner durable, audit failure leaves state unchanged, release/close/no-op/stale safety, redacted audit filtering and actual DB observations. Logs `/tmp/hygene-spec25-tests.log`, `/tmp/hygene-spec25-build.log`, `/tmp/hygene-spec25-integration.log`. No known failing code checks; backend has no lint script, frontend/mobile unchanged. These are local boundary proofs, not40 E2E or actual provider qualification.

## Prior Spec16 verified local boundary

Prior branch `implementation/spec-16-owner-identity`, base25/PR46 atb775842. Issue47: https://github.com/Shumail-AbdulRehman/PRIV/issues/47. Prerequisites10/13 Done and present; all PRs still unmerged. Implementation8c6d64f pushed; draft PR48: https://github.com/Shumail-AbdulRehman/PRIV/pull/48, stacked on PR46; issue47 open. Continue20.

New ownerIdentity service/factory implements status, authenticated/current-password verification enrollment request, neutral deferred public reset request, purpose-bound one-use confirmation and whenIdle drain. Existing CredentialToken hashes only,24h verify/30m reset, exact active ADMIN/company/current case-sensitive email/purpose, future/expired/used denial. Completion manager→token lock and conditional consume, bcrypt extension once, all owner links consumed, epoch increment/refresh clear and audit atomic. Verification also revokes sessions; no implicit login or company/billing reactivation. Inactive/suspended-company own security remains allowed in service; ordinary route auth's inactive-company integration is26.

Serialized registration ownership transferred13→16 and registration tests18→16, preserving old signup/session tests. New registrations atomically get an email-hash eligibility marker, never emailVerifiedAt. Legacy unverified accounts get no automatic trust; external identity-checked SYSTEM enrollment plus current password and link proof required. No bootstrap API or real bootstrap was performed. OWNER_IDENTITY.md describes restricted privileged maintenance process and refusal when real proof missing.

Public recovery responses `{requestAccepted:true,deliveryConfirmed:false}` occur before account lookup/provider timing. Bounded volatile setImmediate work (64 pending,20/client/15m,10000 hashed buckets); DB owner lock limits3 links/purpose/15m across processes. No durable outbox/sent guarantee; crash can lose admitted work and UI must say delivery unconfirmed. Unknown/unverified/non-owner/inactive accounts produce same response/no mail. Missing sender configuration503 globally before account lookup. Authenticated verification checks password/enrollment; sender errors never leak. Provider uncertainty leaves potentially delivered link valid.39 must qualify distributed ingress/proxy controls and drain whenIdle on graceful shutdown.

Opt-in native-fetch Resend adapter has pinned HTTPS host/no redirects/5s timeout/8KiB response bound, idempotency by token-record UUID, plain-text fragment link and no raw token logs/persistence. Requires explicit OWNER_IDENTITY_MAIL_ENABLED/MAIL_PROVIDER/SENDER_VERIFIED/SENDER_EMAIL/RESEND_API_KEY/WEB_ORIGIN. No actual sender/domain/key/channel was provided/activated or real message sent.30 owns `/verify-owner-email` and `/reset-owner-password` fragment cleanup/POST confirmation UI; never activate before UI/origin qualification.26 mounts `/api/owner-identity` and supplies inactive-company own-security auth. API no-store/no-referrer; unknown credential driver errors sanitized before generic logging.

Files: ownerIdentity.service.ts, ownerIdentityDelivery.service.ts, ownerIdentity.service.test.ts, ownerIdentity.route.ts, transferred companyRegistration.service.ts/test.ts, backend/tests/ownerIdentity.integration.ts, OWNER_IDENTITY.md, research/owner-delivery.md, inventory16, specs13/16/18/26/30/39, tracker/handoff/validator. No schema/package/UI/production changes. Existing dirty files preserved.

Verification:74 focused tests (60 owner/14 registration), full backend1297 tests/88 files/zero skips with isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc --noEmit/build; strict standalone integration tsc pass. `OWNER_IDENTITY_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/ownerIdentity.integration.ts` proves real enrollment/hash/expiry/one-winner verify/reset/bcrypt/epoch/suspension/audit rollback mechanics; synthetic bootstrap grant and mail capture are explicitly not real proof/sender qualification. Logs `/tmp/hygene-spec16-tests.log`, `/tmp/hygene-spec16-build.log`, `/tmp/hygene-spec16-integration.log`. No failing checks; no backend lint script. Validator42 specs/zero errors/four accepted warnings retained.

## Spec20 verified local boundary and current Git state

Current branch `implementation/spec-20-photo-contract`, base16/PR48 at5b6f82c. Issue49: https://github.com/Shumail-AbdulRehman/PRIV/issues/49. Decision00/real capture contracts read; implementation7414539 and draftPR50 published; all checks pass. Prior PRs unmerged.

launchPhotoPolicy binds legacy waiver receipt to exact WAIVE_REQUIREMENT decision generation/task and retained same-company ADMIN/MANAGER actor. Bare/stale/foreign waiver labels do not satisfy a mandatory view. Every remaining mandatory item/view must have its exact received checked media attempt at current task/staff/assignment ID/epoch; no other-view, stale, missing, failed or processing receipt substitution. Staff submission still distinct from verification credit; existing finalization presence/privacy/identity rules unchanged. Sequential activation/reservation uses same waiver proof for earlier waived steps.

Failed-view replacement requires current active unsubmitted work, current staff/assignment, open existing capture/upload authority, exact expected requirement generation/current attempt and source slot decision generation. Only server-received RECAPTURE_REQUIRED or explicit privacy hold proves generic replacement. CLEANING_REQUIRED needs existing fresh task QR rework. Uncertain review/service/reservations cannot allocate new authority. Guard wired to retake, fresh QR rework and normal QR renewal; renewal not a bypass. Legacy required context failure likewise bound; successful context preserved. New slot/generation/nonce never rewrites old attempt/slot/media; exact allocation retry returns same allocation. Same-capture upload/result reconciliation, manager action retirement, QR/device/deadline/rate/slot limits preserved.

Changed policy/test, existing staffSubmission(+tests), captureSession(+security tests), sequentialCapture; isolated launchPhoto integration, PHOTO_CONTRACT.md, inventory20, specs20/26/39, progress/handoff/validator. No schema/package/provider/actual-photo or UI change. Existing dirty work preserved.

Verification:41 policy tests plus wired capture/submission/sequential/legacy-controller regressions; whole backend1340 tests/89 files/zero skips on explicit isolated DATABASE_URL/LAUNCH_PERSISTENCE_TEST_DATABASE_URL; backend tsc/build and strict standalone integration tsc pass. `LAUNCH_PHOTO_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/launchPhoto.integration.ts` proves new immutable generation, slot retry/old record preservation and mixed waiver/review submission without credit, plus submitted/missing denial. Initial synthetic fixture corrected for existing SQL snapshot constraints; full-suite regression restored early missing-evidence rejection. Log has a non-failing pre-existing pg concurrent-query deprecation warning; no dependency update made. Logs `/tmp/hygene-spec20-tests.log`, `/tmp/hygene-spec20-build.log`, `/tmp/hygene-spec20-integration.log`. No known failing checks; validator42/zero errors/four documented warnings.

## Spec21 verified local boundary (26 is now complete below)

Current branch implementation/spec-21-photo-qualification, base20/PR50 at29fc1d0, issue51.44 focused tests, whole backend1360 tests/90 files/zero skips; backend tsc/build pass. Logs /tmp/hygene-spec21-{focused,tests,build}.log. New launchQualification.ts/test reuses existing pinned measured release reader and binds status to exact active configuration digest. Active adapter explicitly excludes privacy and exact fixture identity; even a historical valid release cannot manufacture them. D08/D11 prohibit guessing privacy thresholds. New direct PHOTO requests unavailable503 before AI/storage; same-capture retry and completed-result reconciliation preserved. Buffered PHOTO gate after lease before buffer reads or cached approval replay; no deletion/retention change. Existing authorization, receipt, epoch and failure/retry rules unchanged.

All current checks pass; safe-disabled implementation is locally complete, NOT empirically qualified. No real consented representative dataset, independent policy/threshold approval or redaction proof exists. PHOTO_QUALIFICATION.md documents required live sample categories, independent labels and release review. No model/provider/schema/dependency changes. The guard intentionally prevents new photo checking until an actual qualified privacy path is implemented and independently verified; do not remove for demonstrations or reinterpret historical NOT_REQUIRED as qualified. Lower-level orchestration fixtures explicitly mock qualification only to test existing storage/lease mechanics; active denial tests exercise real guard. Issue label attempt failed (label absent); issue51 created/claimed without labels.

26 of41 execution/gates Done;15 remain. Next26 now eligible (all declared dependencies Done). Read full spec/inventory14: mount owner16, credentials17, billing15, settings22, annotations23, operator24/25, public support config, task-readiness12 behind explicit audiences/policy. Amend ownership before editing existing hot files. Must wire operational reads/manage/start/complete/capacity and jobs to14; record exact work grants in winning locked start/check-in transaction. No guessed grace or legacy entitlement. Owner own-security/billing/support must stay reachable on suspended/inactive company while operations denied. Existing auth must retain18 role/epoch/forced-password checks. credentialHandoff.currentPrincipal currently filters company.isActive even for own-password; only the own-security path may relax company activation, not assisted handoffs. Do not stage user dirty manager route/controller/dashboard/package/CI changes. Preserve20 strict receipts/replacement and21 safe-disabled qualification.

User explicitly requests completing specs while sleeping; no routine handoff stops or ordinary permission questions. Verify each unit, update docs, commit/push separate stacked draft PR, continue. Never merge/deploy/change production. Handoff is durable state, not instruction to stop. Ready after21:26,28–38 (check actual dependencies before selecting). At that historical checkpoint26 was unstarted; see the completed26 state below.

## Spec26 complete; next28 (active continuation)

Current branch implementation/spec-26-api-composition, base21/PR52 atf265636, issue53. All dependencies consumed, with explicit14/15/17 edges recorded in DAG/tracker; validator42/zero errors/four justified warnings. Existing hot-file ownership transferred before edits; user dirty manager.route.ts/controller/performance/dashboard/CI/package untouched. Source/test/doc paths listed in26 Owns; no new migration/dependency.

API_COMPOSITION.md and inventory26 map actual mounts and policy. app.ts imports initializeRuntime FIRST, then policy/jobs, and preserves raw Paddle webhook before JSON. Launch router mounts public owner POST links/request, operator24/25 and public configured-only support separately from tenant operational gates; settings22/annotations23/common17/subscription15 mounted before existing operations. Own-security adapters/refresh allow active people while company is inactive/suspended, without role/epoch/forced-password relaxation; only password POST admits forced change. Billing restriction exception is OWNER only; legacy manager summary still needs active company. No new manager reset policy: old manager PATCH password replacement now400. Existing staff handoff remains scoped/reasoned/current-password/one-use and operational.

Concrete manage/annotation policy, transactional capacity with callback tx and inside-tx staff site scope; exact winning start/check-in WORK_ENTITLEMENT_GRANTED atomic. Check-in audit failure rolls back clock; expired attendance check-in denied before provider storage. Capture mutations use start policy for pending, exact saved completion grant for started; submission/finalization preserve20 checks. Internal submitted-job finalization may inspect already-submitted work but still needs exact retained start after expiry; public submitted mutation still denied. Unproven legacy start stays denied when expired. Jobs reuse14 state; no guessed grace/trial. Snapshots and attendance preparation/assignment/new work require entitlement; active bookkeeping retained; suspension prevents operational jobs/notification send/verification publish. Earlier startup/attendance unguarded bulk inserts replaced with existing staff-locked preparation.21 processing remains unavailable before AI/storage; capabilities/manifests show unavailable and disable new capture/upload. Real qualified privacy path/empirical record is still missing, no redaction claim.

Verification:215 focused tests/9 files; whole backend1413 tests/92 files/zero skips with explicit isolated DB; backend tsc/build pass. Isolated launchComposition actual controller start/check-in/capacity races one grant/last-slot winner; failure-injected audit rollback; expiry denies storage/preparation/new/legacy starts but permits saved-grant completion/checkout; suspended own-password epoch passes. Existing20 isolated launchPhoto proof rerun with synthetic billing entitlement preserves immutable slot/attempt/generation/waiver/receipt assertions; no real photo/provider. Strict standalone integration tsc recorded separately. Logs /tmp/hygene-spec26-{focused,tests,type,build,integration,integration-type,photo-regression}.log. Fixture errors fixed only for existing SQL v2 contracts and Prisma proxy injection; no schema changes. Non-failing old pg deprecation in20 regression retained, no dependency upgrade.

Next28: real derived setup/overview/Today. Depends12/27 both Done, no issue/code started yet. Read full spec, applicable impeccable UI skill and approved design/v5/setup reference (markup lives in journeys.js), inventory12/27, actual query/API/components. Preserve dirty Dashboard/performance integration and manager translations. New /setup route/nav composition requires serialized transfer27; setup translations should use a separate dictionary and existing translation registration, never overwrite dirty manager dictionary. Deep links must actually open existing site/team/shift/schedule dialogs; no fake checklist or reset on reload. Derive readiness from scoped /location/readiness; note pagination and each site's timezone/calendar. Owner billing/verification facts require reading actual qualified API contract; add real consumption dependency if needed, not assumptions. Keep unavailable/privacy/security/empty/loading/error/403 states honest. No redesign or prototype changes. All28–38 ready by current graph;39 also eligible on03/26 but UI units are selected next.40 waits remaining units,41 waits40.

The user explicitly says do not stop and is asleep: finish/publish one verified draft per spec and proceed next. Do not end the turn at ordinary unit checkpoints or compaction. Do not merge/deploy/modify production. Missing actual IdP/MFA/mail/Paddle/photo/privacy/legal/backup/Android facts remain qualified external gates, never fabricate completion.

## Remaining external and integration gates

Billing15 local only: real merchant/catalog/terms/sandbox/portal qualification unavailable. Browser32 must replace legacy purchase; policy/job composition26 is now integrated. Preserve ambiguous billing reservations and canonical customer linkage, never auto-repair financial state. Read BILLING.md before changes.

Other gates: operator IdP/MFA/provisioned people; verified mail/support channel; legal retention/exit text; host/TLS/secrets/signing; physical Android; calendar/customer fit; consented photo qualification; actual backup restore and legacy public URL/cache cutover. Do not invent facts or secrets. Existing photos remain private authenticated assets; credential epochs and atomic refresh regressions must remain intact. Design/v5 immutable. No frontend/mobile behavior changed by22/23/24/25.

## Existing Git/review state and preserved user work

Prior stacked draft PRs by spec:01→7,02→8,03→9,04→10,05→11,06→13,08→15,09→17,13→19,07→21,12→23,10→25,17→27,18→28,19→30,11→32,14→34,27→36;15→38;24→40;22→42;23→44;25→46;16→48. Nothing merged. Spec24 is stacked on spec15; compare with its immediate base for a scoped review.

The following working-tree entries predate the final handoff and are **preserved user work/tooling/design inputs**, not spec15 changes. Never blanket stage, discard or overwrite them:

```text
 M .github/workflows/ci.yml
 M .gitignore
 M DESIGN.md
 M backend/package.json
 M backend/src/controllers/managerOperations.controller.ts
 M backend/src/routes/manager.route.ts
 M frontend/src/i18n/managerTranslations.ts
 M frontend/src/pages/Dashboard/DashboardPage.tsx
?? .agents/skills/animate
?? .agents/skills/gpt-taste
?? .agents/skills/impeccable
?? .agents/skills/plan-project
?? .ai/
?? backend/src/services/companyPerformance.service.test.ts
?? backend/src/services/companyPerformance.service.ts
?? backend/tests/companyPerformance.integration.ts
?? design/
?? docs/OVERVIEW_PERFORMANCE.md
?? docs/plan-project/
?? frontend/src/pages/Dashboard/performance.css
?? frontend/src/pages/Dashboard/performance.ts
?? frontend/tests/performanceBrowser.mjs
?? investor-video/
```

Plans/docs are ignored by the existing .gitignore; explicitly force-stage only intended files. The user changes to dashboard, manager operations, package script and CI must remain outside scoped implementation commits. No new migration was required by15, and no production records/configuration were modified.

## Isolated local infrastructure and reproduction

PostgreSQL16.15 is user-owned, extracted from official Ubuntu packages: binaries `/tmp/hygene-isolated-postgres/server/usr/lib/postgresql/16/bin`, data `/tmp/hygene-isolated-postgres/data`, socket `/tmp/hygene-isolated-postgres`, loopback127.0.0.1 port56439, jitoff. Test role `shumail` uses local trust for synthetic data only. `hygene_launch_test` has the18 existing migrations; other synthetic DBs are hygene_upgrade_test, hygene_upgrade_rerun_test, hygene_upgrade_signup_test and hygene_restore_test. No system install/Docker escalation/deployment was performed.

Temporary infrastructure/logs can disappear between sessions. Check availability before integration tests; recreate only isolated scratch infrastructure if needed using MIGRATIONS.md, never reset an existing unknown database. Explicit dedicated test variables are mandatory. Never load application .env to choose the integration target. The full suite skips7 SQL cases without LAUNCH_PERSISTENCE_TEST_DATABASE_URL, so record that truth if not provided. Integration fixtures may write only their guarded local test target. Prior10 upgrade/transaction rollback/reapply, signup race/hash and dump/restore proofs passed locally; these do not qualify production backups.

Possible leftover frontend fixture devserver is loopback127.0.0.1:5188 (earlier session38397); do not mistake it for a deployed app. There are no pending spec15 test processes after this handoff. See BILLING.md, MIGRATIONS.md and OPERATOR_IDENTITY.md for detailed safe boundaries.

- Published spec21 implementation8d32c4f in stacked draft PR52: https://github.com/Shumail-AbdulRehman/PRIV/pull/52 (base20/PR50); issue51 remains open for review.

- Published26 implementation7368750 in stacked draft PR54: https://github.com/Shumail-AbdulRehman/PRIV/pull/54 (base21/PR52); all checks including strict standalone integration TypeScript pass, issue53 remains open for human review. Continue28.

- Published28 implementation8ffdcf8 in stacked draft PR56: https://github.com/Shumail-AbdulRehman/PRIV/pull/56 (base26/PR54). Issue55 remains open for review. Continue eligible29; no merge/deploy.

## Spec29 batch checkpoint

Branch implementation/spec-29-attendance-context base28/PR56 at2d77fd3, issue57. Actual immutable context dialogs wired in AttendancePage and StaffDetailPage; originalfacts/08protectedmedia preserved, reasonedNOTE/parentACK, serverattribution, bounded chronological paging, exactretainedrequestretry and409draftrecovery.12focused,57Node+68components/7files,lint/tsc/build pass;18syntheticReactrenders EN/UR1440/390 andempty/denied/loading/conflict/uncertain, detector[]. Independentreview mobiletargetfix resolved byfreshfixverifier afteroriginalreviewerquota; no wholeE2E/liveproofclaim. DocsATTENDANCE_CONTEXT_UI/inventory29. All8dirtytrackedfiles preserved. Batch30/34/37 implementationcommits are in isolatedworktrees and reviewed; root nowintegrates individuallyandpublishes stackedPRs, thenSTOP perlatestuser. Do notstart31/32/33/35/36/38/39/40/41.

## Spec30 integrated checkpoint

Root branch implementation/spec-30-account-integrated based29/PR61 (008c2d3); parallelcommitc38e208 integrated83e8a8c plus48pxtargetfix2b42bad anddocsbe81d57. Owner16verification/recovery,17ownpassword and22versionedname actualAPIs; principal-boundownerstatus; first-importfragmentcapture/scrub, explicitPOST only; mandatorypassword403standalonesecurity withcache/sessionclearandsigninconfirmation.19focused; integrated29+30 whole57Node+87components/9files, lint/type/buildpass. Independentfullreview mobileerroraction48pxfixresolvedbysamereviewer; documentercomparisoncompleted.9syntheticEN/URcapturesvalid, nooverflow/JSerrors, no realmaildelivery/productionqualification. Specs31/32/33/35/36/38/39/40/41 untouched; complete34/37integrationthenSTOP.

## Spec34 integrated checkpoint

Rootbranch implementation/spec-34-operator-integrated base30/PR62 at52c301b; issue59. Top-levelplatformRoutes outsidetenantApp preservefirstownerlinktokenimport; zeroAPImountproof4routes, callbackscrubbed, noJSerrors.15focused; integrated57Node+102components/10files,lint/type/buildpass. Independentreviewer scopedship anddocumentercomparisonpass. MissingrealOIDCclient/provider/MFA qualificationremains39/40external, allauthhandoffdisabledbeforeI/O, notenantreuse. Complete37integration/publishandSTOP; noadditionalunits.

## Final publication — STOP

Allfour requestedbatchPRs confirmedOPEN/DRAFT andstackedcorrectly:29 https://github.com/Shumail-AbdulRehman/PRIV/pull/61 base28;30 https://github.com/Shumail-AbdulRehman/PRIV/pull/62 base29;34 https://github.com/Shumail-AbdulRehman/PRIV/pull/63 base30;37 https://github.com/Shumail-AbdulRehman/PRIV/pull/64 base34.37verifiedintegrationcheckpointbbe3175 pushed, currentbranchimplementation/spec-37-native-integrated. Issues57–60remainopen, no merge/deploy. Thispublicationrecordis a subsequentdocumentationcommit. Userstopcheckpoint reached:32Done/9remaining; nexteligible31identifiedonly, notstarted.


## Current final checkpoint

Main root branch implementation/spec-40-launch-e2e, draftPR81 base39, issue79. Latest behavior commit64d42c4; final documentation commit follows.40Inprogress/41Notstarted;39of41Done. E2E29passed/1confirmed registration redirect failure; all15required rows and remaining gaps mapped. Both tested commit CI39645400371 and fresh APK39644524268 passed their respective jobs, without overriding the failing E2E or absent physical/provider evidence. Build PR80 and test PR81 are OPEN/DRAFT; no merges/deployment. All8original dirty files remain byte-identical, unrelated untracked work preserved. STOP: no next eligible existing spec until40acceptance is met; proposed registration fix remains unimplemented.
