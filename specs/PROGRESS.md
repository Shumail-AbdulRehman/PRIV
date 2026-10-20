# Hygene Ops implementation progress

Source of truth for execution; latest user authorization supersedes old pending labels. Approved v5 preserved.

**Active continuation after spec16:** decision00 and24 of41 execution/gate units Done (17 remain). Next selected eligible unit20 consumes completed00. Latest user explicitly requests continued completion without routine handoff stops. Review remains stacked draft PRs; Done is local verification, not merge, route composition or external release qualification.

| # | Spec | Status | Depends on | Model | Issue | Notes |
|---|---|---|---|---|---|---|
| 00 | [Launch decisions](00-launch-decisions.md) | Done | — | Heavy | — | See decision Log |
| 01 | [P0 actor-safe self endpoints](01-actor-self-authorization.md) | Done | 00 | Heavy | #1 | 591 tests; see spec 01 Log |
| 02 | [P0 historical worker site authorization](02-historical-site-scope.md) | Done | 01 | Heavy | #2 | 599 tests; see spec 02 Log |
| 03 | [P0 fail-closed production runtime](03-production-runtime.md) | Done | 00 | Heavy | #3 | 628 tests; see spec 03 Log |
| 04 | [P0 atomic role-safe refresh sessions](04-refresh-session-safety.md) | Done | 00 | Heavy | #4 | 667 tests; see spec 04 Log |
| 05 | [P0 private attendance media boundary](05-attendance-private-media.md) | Done | 01, 02 | Heavy | #5 | 687 tests; see spec 05 Log |
| 06 | [Web component test harness](06-web-unit-harness.md) | Done | 00 | Standard | #6 | 57+2 tests; see spec 06 Log |
| 07 | [Legacy attendance asset transition tooling](07-legacy-media-transition.md) | Done | 05 | Heavy | #18 | 766 tests; tooling only; see Log |
| 08 | [Protected attendance image presentation](08-attendance-media-ui.md) | Done | 05, 06 | Standard | #12 | 57+15 tests; see spec 08 Log |
| 09 | [Attendance write and calendar correctness](09-attendance-reliability.md) | Done | 05 | Heavy | #14 | 726 tests; see spec 09 Log |
| 10 | [Additive launch lifecycle persistence](10-launch-persistence.md) | Done | 00 | Heavy | #22 | 787 tests; isolated PG; see Log |
| 11 | [Workforce transfer and offboarding API](11-workforce-lifecycle-api.md) | Done | 09, 10 | Heavy | #31 | 927 tests+real PG; see Log |
| 12 | [Task generation and assignment reliability](12-task-readiness.md) | Done | 00 | Standard | #20 | 780 tests; see spec12 Log |
| 13 | [Atomic company registration](13-registration-atomicity.md) | Done | 00 | Heavy | #16 | 739 backend;57+18 web; see Log |
| 14 | [Account access and capacity policy](14-entitlement-policy.md) | Done | 10 | Heavy | #33 | 980 tests+real PG; see Log |
| 15 | [Paddle lifecycle API and configuration](15-billing-lifecycle.md) | Done | 14 | Heavy | #37 | 1023 tests+real PG; see Log |
| 16 | [Owner verification and recovery API](16-owner-identity-api.md) | Done | 10, 13 | Heavy | #47 | 74 focused/1297 backend+isolated PG; see Log |
| 17 | [Self credentials and assisted worker recovery](17-credential-handoff-api.md) | Done | 10 | Heavy | #24 | 803 tests+real PG; see Log |
| 18 | [Credential epoch access revocation](18-credential-revocation.md) | Done | 04, 17 | Heavy | #26 | 819 tests+real PG; see Log |
| 19 | [Separate platform operator authorization](19-operator-identity.md) | Done | 00 | Heavy | #29 | 69 new/888 full tests; see Log |
| 20 | [Photo receipt and replacement contract](20-photo-submission-contract.md) | Not started | 00 | Heavy | — | See spec |
| 21 | [Fail-closed active photo qualification](21-photo-qualification.md) | Not started | 00 | Heavy | — | See spec |
| 22 | [Owner company settings API](22-company-settings-api.md) | Done | 10 | Standard | #41 | 38 focused/1115 backend+isolated PG; see Log |
| 23 | [Immutable attendance annotations API](23-attendance-annotations-api.md) | Done | 10 | Standard | #43 | 55 focused/1170 backend+isolated PG; see Log |
| 24 | [Platform company operations API](24-platform-company-api.md) | Done | 19, 15 | Heavy | #39 | 54 focused/1077 full backend+isolated PG; see Log |
| 25 | [Redacted diagnostics and inquiry operations](25-platform-support-api.md) | Done | 19, 24 | Standard | #45 | 66 focused/1236 backend+isolated PG; see Log |
| 26 | [Wire launch backend routes and policies](26-launch-api-composition.md) | Not started | 07, 11, 12, 16, 18, 20, 21, 22, 23, 24, 25 | Heavy | — | See spec |
| 27 | [Approved v5 shared shell and route composition](27-workspace-shell.md) | Done | 06 | Heavy | #35 | 57+40 tests/build/lint; see Log |
| 28 | [Real derived setup and operational dashboard](28-setup-ui.md) | Not started | 12, 27 | Standard | — | See spec |
| 29 | [Attendance exception context UI](29-attendance-context-ui.md) | Not started | 23, 27, 08 | Standard | — | See spec |
| 30 | [Account settings and recovery UI](30-account-ui.md) | Not started | 16, 17, 22, 27 | Standard | — | See spec |
| 31 | [Workforce access and transfer UI](31-workforce-ui.md) | Not started | 11, 17, 27 | Standard | — | See spec |
| 32 | [Real subscription lifecycle UI](32-billing-ui.md) | Not started | 15, 27 | Standard | — | See spec |
| 33 | [Platform company workspace](33-platform-company-ui.md) | Not started | 24, 27 | Standard | — | See spec |
| 34 | [Platform sign-in and security workspace](34-platform-security-ui.md) | Not started | 19, 27 | Heavy | — | See spec |
| 35 | [Platform service audit and leads UI](35-platform-service-ui.md) | Not started | 25, 27 | Standard | — | See spec |
| 36 | [Truthful task and photo review UX](36-photo-review-ui.md) | Not started | 20, 21, 27 | Standard | — | See spec |
| 37 | [Native attendance/photo/account recovery](37-native-workflows.md) | Not started | 09, 17, 20, 21 | Standard | — | See spec |
| 38 | [Configured support and service information](38-service-information.md) | Not started | 27, 25 | Standard | — | Contact availability consumes25 |
| 39 | [Launch operations and active CI proof](39-release-operations.md) | Not started | 03, 26 | Heavy | — | See spec |
| 40 | [Launch end-to-end suite](40-e2e-suite.md) | Not started | 01, 02, 03, 04, 05, 08, 07, 06, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39 | Heavy | — | See spec |
| 41 | [Final clean verification pass](41-verification-pass.md) | Not started | 40 | Heavy | — | See spec |

## Log

- **2026-10-20** — Continued from approved scope/design. Generated source-grounded steering docs and implementation queue. No production data/config touched. Await initial validator before spec 01.
- **2026-10-20** — Spec 01 complete locally: 9 regression tests, whole backend 591 tests, build passed. Next P0 historical scope (02).
- **2026-10-20** — Spec 02 complete: 8 regression/599 full backend tests, build passed. Next 03 config and 04 sessions.
- **2026-10-20** — Spec 03 complete: production runtime guard and Compose fail closed; 29 regression/628 full backend tests, build passed. No deployment.
- **2026-10-20** — Spec04 complete: 43 targeted/667 full backend tests; build passed. Next spec05 private attendance media; old tokens require signin on rollout.
- **2026-10-20** — Spec05 complete: 20 new media/687 backend tests, build passed. Legacy URLs withheld; no live assets migrated. Next web harness06 and photo UI08, independent of controlled legacy transition07.
- **2026-10-20** — Spec06 complete: 57 node +2 component tests, build/lint passed. Specs01–05 published as separate stacked draft PRs7–11; no merges/deployment. Next eligible local unit08 protected photo UI;07 controlled legacy migration independent.
- **2026-10-20** — Spec08 complete: real protected attendance/staff photo UI;13 targeted/57+15 full web tests, build/lint pass; four EN/UR rendered fixtures checked. Seven execution units complete01–06,08. Next09 attendance writes;07 legacy transition remains independent.
- **2026-10-20** — Spec09 complete:45 targeted/726 backend tests +build. Protected photo React draftPR15 published. Next13 atomic signup;07 isolated legacy transition still pending.
- **2026-10-20** — Spec13 complete locally: atomic signup/session outcome +React caller;13 backend/3 hook tests;739 backend +57+18 web/builds pass. Next07 safe legacy media tooling, then additive lifecycle10 or task readiness12.
- **2026-10-20** — Spec07 local tooling complete:27 new tests,55 targeted,766 whole backend/build and script type check; offline CLI dry-run passed. No real assets read/migrated; public-cache/restore/live qualification remain release gates. Ten execution units complete01–09,13. Next12 readiness, then10 additive persistence.
- **2026-10-20** — Spec12 complete:14 new readiness +19 existing engine regressions;780 full backend +build pass. Eleven execution units complete01–09,12,13. Next10 additive lifecycle persistence.
- **2026-10-20** — Spec10 complete:18 migrations applied only localPG16.15;7 SQL invariants, seeded prior-state preservation/DDL rollback/reapply, real signup race/hash, local dump/restore all pass. Full backend787 tests/build/typecheck; no proddata touched. Twelve execution units done01–10,12,13. Next17 credentials and18 epoch revocation or other eligible APIs.
- **2026-10-20** — Spec17 complete locally:16 unit/803 full backend/build, real isolated concurrent handoff/hash/role-site/audit proof. Thirteen execution units done. Next18 immediate access epoch.
- **2026-10-20** — Spec18 complete:72 targeted/819 full backend tests, build/typechecks and isolated realPG revocation proof pass. Fourteen of41 execution/gate units done (about66% remaining by count). Next19 separate operator identity boundary.
- **2026-10-20** — Spec19 local operator identity boundary complete:69 new/888 full backend tests/build pass. Actual IdP/approved MFA/people remain external, disabled until configured. Fifteen of41 execution/gates done. Next11 workforce lifecycle; preserve historical rows and close existing transfer/deactivation gaps.
- **2026-10-20** — Spec11 complete:39 new/76 targeted/927 backend tests, build/typechecks and actual localPG race/history/legacy-adapter proof pass. Sixteen of41 execution/gates complete (about61% remaining by count). Next14 account policy/capacity; native/web workforce inputs remain31/37. No production mutation.
- **2026-10-20** — Spec14 contract complete:53 new/980 whole backend tests/build/typechecks and actual PG quota/entitlement proof pass. Seventeen of41 execution/gates done (about59% remaining by count). Route/job integration26/39 and real provider lifecycle15 remain. Next27 approved v5 shared shell, independently eligible; then15 billing.
- **2026-10-20** — Spec27 complete:approved blue/white shell in actual React,22 new/57 node+40 component tests, build/full lint pass; six role/language/width rendered fixtures +two mobile menus no overflow/JS errors. Eighteen of41 execution/gates done (about56% remaining by count). Next15 Paddle lifecycle; real catalog/provider qualification remains gated.
- **2026-10-20** — Spec15 local backend complete:43 new/1023 full backend tests/build/typechecks and isolatedPG billing race/order/rollback/recovery proof pass. Nineteen of41 execution/gates done (about54% remaining by count). Live merchant/catalog/sandbox qualification remains external; UI32 and route/job26 pending. Next24 platform company metadata/operations.

- **2026-10-20 — Final handoff requested by user.** Spec15 committed as1ea9ae8 on implementation/spec-15-billing-lifecycle and published in stacked draft PR38 (issue37; base spec27). Confirmed backend tsc --noEmit and standalone billing/capacity integration typechecks pass; reran isolatedPG billing proof successfully. Prior full backend1023/83 and build pass retained. Validator42 specs/0 errors/2 justified warnings. No failing spec15 checks known; live Paddle qualification, browser32 and policy26 are explicitly pending. Complete files/checks/blockers and every completed unit recorded in SESSION_HANDOFF.md. Stop here:24 remains Not started; no functionality changed after spec15. No merges, deployment or production mutations.

- **2026-10-20** — Spec24 complete:54 focused/1077 whole backend tests (84 files, zero skips), build/typechecks and isolated PostgreSQL status race/audit rollback/account policy proof pass. Operator-only whitelisted metadata; no provider/workforce mutations.20 of41 execution/gates Done;21 remain. Next selected22 (dependency10 Done);33 newly eligible; route integration26 and live operator qualification remain pending.

- **2026-10-20** — Spec22 complete:38 focused/1115 whole backend tests (85 files, zero skips), build/typechecks and isolated PostgreSQL owner/tenant/race/audit rollback proof pass. Name-only owner settings; no approved verified-contact schema exists. Shared version guard safely serializes rename/platform status.21 of41 execution/gates Done;20 remain. Safe handoff checkpoint; next selected23 (dependency10 Done), not started.24 published as stacked draftPR40; no merges/deployment/production mutation.

- **2026-10-20 — Verified session handoff.** Spec24 implementation5a70884/PR40 and spec22 implementation1b677af/PR42 pushed as separate stacked drafts. Current branch implementation/spec-22-company-settings. Issues39/41 stay open for human review; no merge. All current checks pass; validator zero errors/two documented warnings. Original dirty/untracked list preserved exactly. Next23 remains Not started; fresh-session details in SESSION_HANDOFF.md.

- **2026-10-20** — Spec23 complete:55 focused/1170 whole backend tests (86 files, zero skips), build/typechecks and real isolated PostgreSQL retry/immutability/parent/historical authorization/audit rollback/paging proof pass. No original attendance fact, schema or UI changes.22 of41 execution/gates Done;19 remain. Next selected25 (dependency19 Done), unstarted;29 newly eligible. Route composition26/E2E40 pending.

- **2026-10-20 — Spec23 verified handoff.** Implementation207dad5 pushed on implementation/spec-23-attendance-annotations; draftPR44 stacked on22/PR42, issue43 open. Final focused55 pass; validator42 specs/zero errors/two accepted warnings. Preserved pre-existing work unchanged; no merges/deployment/production mutation. Next25 unstarted; full handoff updated.

- **2026-10-20** — Spec25 complete:66 focused/1236 whole backend tests (87 files, zero skips), build/typechecks and real isolated PostgreSQL durable inquiry/race/audit/redaction proof pass. Read-only observed diagnostics, audit summaries, versioned accountable queue, fail-closed configured customer contact. Submission untouched; no schema/UI/provider/production mutation. Corrected25→24 audit-typing dependency and38→25 contact consumption; validator zero errors/four documented warnings.23 of41 execution/gates Done;18 remain. Next selected16, unstarted;35 newly eligible.

- **2026-10-20 — Spec25 verified handoff.** Implementationc04c7ab pushed on implementation/spec-25-platform-support; draftPR46 stacked on23/PR44, issue45 open. All checks pass; validator42 specs/zero errors/four justified warnings. Original dirty/untracked work preserved exactly.23 of41 units Done,18 remain; next16 unstarted. No production/provider mutation, merge or deployment.

- **2026-10-20** — Spec16 complete:74 focused/1297 whole backend tests (88 files, zero skips), build/typechecks and isolated real owner lifecycle proof pass. Hashed scoped links, legacy bootstrap boundary, neutral bounded public processing, opt-in delivery unavailable without sender, epoch revocation and audit rollback. New registration enrollment marker preserves13 atomicity; no schema/live mail/provider/production changes.24 of41 execution/gates Done;17 remain. Continue20 per user request, not a stopping handoff;30 newly eligible.
