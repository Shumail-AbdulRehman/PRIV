# Hygene Ops implementation progress

Source of truth for execution; latest user authorization supersedes old pending labels. Approved v5 preserved.

| # | Spec | Status | Depends on | Model | Issue | Notes |
|---|---|---|---|---|---|---|
| 00 | [Launch decisions](00-launch-decisions.md) | Done | — | Heavy | — | See decision Log |
| 01 | [P0 actor-safe self endpoints](01-actor-self-authorization.md) | Done | 00 | Heavy | #1 | 591 tests; see spec 01 Log |
| 02 | [P0 historical worker site authorization](02-historical-site-scope.md) | Not started | 01 | Heavy | — | See spec |
| 03 | [P0 fail-closed production runtime](03-production-runtime.md) | Not started | 00 | Heavy | — | See spec |
| 04 | [P0 atomic role-safe refresh sessions](04-refresh-session-safety.md) | Not started | 00 | Heavy | — | See spec |
| 05 | [P0 private attendance media boundary](05-attendance-private-media.md) | Not started | 01, 02 | Heavy | — | See spec |
| 06 | [Web component test harness](06-web-unit-harness.md) | Not started | 00 | Standard | — | See spec |
| 07 | [Legacy attendance asset transition tooling](07-legacy-media-transition.md) | Not started | 05 | Heavy | — | See spec |
| 08 | [Protected attendance image presentation](08-attendance-media-ui.md) | Not started | 05, 06 | Standard | — | See spec |
| 09 | [Attendance write and calendar correctness](09-attendance-reliability.md) | Not started | 05 | Heavy | — | See spec |
| 10 | [Additive launch lifecycle persistence](10-launch-persistence.md) | Not started | 00 | Heavy | — | See spec |
| 11 | [Workforce transfer and offboarding API](11-workforce-lifecycle-api.md) | Not started | 10 | Heavy | — | See spec |
| 12 | [Task generation and assignment reliability](12-task-readiness.md) | Not started | 00 | Standard | — | See spec |
| 13 | [Atomic company registration](13-registration-atomicity.md) | Not started | 00 | Heavy | — | See spec |
| 14 | [Account access and capacity policy](14-entitlement-policy.md) | Not started | 10 | Heavy | — | See spec |
| 15 | [Paddle lifecycle API and configuration](15-billing-lifecycle.md) | Not started | 14 | Heavy | — | See spec |
| 16 | [Owner verification and recovery API](16-owner-identity-api.md) | Not started | 10, 13 | Heavy | — | See spec |
| 17 | [Self credentials and assisted worker recovery](17-credential-handoff-api.md) | Not started | 10 | Heavy | — | See spec |
| 18 | [Credential epoch access revocation](18-credential-revocation.md) | Not started | 04, 17 | Heavy | — | See spec |
| 19 | [Separate platform operator authorization](19-operator-identity.md) | Not started | 00 | Heavy | — | See spec |
| 20 | [Photo receipt and replacement contract](20-photo-submission-contract.md) | Not started | 00 | Heavy | — | See spec |
| 21 | [Fail-closed active photo qualification](21-photo-qualification.md) | Not started | 00 | Heavy | — | See spec |
| 22 | [Owner company settings API](22-company-settings-api.md) | Not started | 10 | Standard | — | See spec |
| 23 | [Immutable attendance annotations API](23-attendance-annotations-api.md) | Not started | 10 | Standard | — | See spec |
| 24 | [Platform company operations API](24-platform-company-api.md) | Not started | 19, 15 | Heavy | — | See spec |
| 25 | [Redacted diagnostics and inquiry operations](25-platform-support-api.md) | Not started | 19 | Standard | — | See spec |
| 26 | [Wire launch backend routes and policies](26-launch-api-composition.md) | Not started | 07, 09, 11, 12, 16, 18, 20, 21, 22, 23, 24, 25 | Heavy | — | See spec |
| 27 | [Approved v5 shared shell and route composition](27-workspace-shell.md) | Not started | 06 | Heavy | — | See spec |
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
| 38 | [Configured support and service information](38-service-information.md) | Not started | 27 | Standard | — | See spec |
| 39 | [Launch operations and active CI proof](39-release-operations.md) | Not started | 03, 26 | Heavy | — | See spec |
| 40 | [Launch end-to-end suite](40-e2e-suite.md) | Not started | 01, 02, 03, 04, 05, 08, 07, 06, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39 | Heavy | — | See spec |
| 41 | [Final clean verification pass](41-verification-pass.md) | Not started | 40 | Heavy | — | See spec |

## Log

- **2026-10-20** — Spec 01 implemented; whole backend 591 tests and build passed. See spec Log.
