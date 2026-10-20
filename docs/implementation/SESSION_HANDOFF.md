# Implementation handoff — 2026-10-20, after Specification 15

## Stop point and continuation instructions

The latest user instruction is to complete spec15, prepare this complete handoff, and **not start another specification**. This session stops here. No spec24 issue, implementation, or new functionality was started. A future session may continue the approved launch implementation after reading this handoff and specs/PROGRESS.md.

Design/v5 and docs/product-discovery launch scope are approved. Read specs/AGENT-GUIDE.md, ARCHITECTURE.md, DESIGN-SYSTEM.md, INVENTORY.md plus fragments and docs/implementation/DECISIONS.md. Do not repeat discovery/audits/design; do not create prototypes. Keep React/Express/Prisma/PostgreSQL/React Native and Paddle. Make ordinary technical decisions independently, but preserve business/external configuration gates. Never modify production data, reset databases, overwrite configuration, deploy or merge these PRs without appropriate authorization.

## Completed specifications

Decision00 and19 of41 execution/gate units are Done locally;22 execution/gate units remain (approximately54% by count, not effort or release readiness). Done means the specification's local checks passed, not that PRs merged or external services qualified. Every completed specification is listed below; individual spec Logs retain detailed evidence.

| # | Spec | Status | Depends on | Model | Issue | Notes |
|---|---|---|---|---|---|---|
| 00 | [Launch decisions](../../specs/00-launch-decisions.md) | Done | — | Heavy | — | See decision Log |
| 01 | [P0 actor-safe self endpoints](../../specs/01-actor-self-authorization.md) | Done | 00 | Heavy | #1 | 591 tests; see spec 01 Log |
| 02 | [P0 historical worker site authorization](../../specs/02-historical-site-scope.md) | Done | 01 | Heavy | #2 | 599 tests; see spec 02 Log |
| 03 | [P0 fail-closed production runtime](../../specs/03-production-runtime.md) | Done | 00 | Heavy | #3 | 628 tests; see spec 03 Log |
| 04 | [P0 atomic role-safe refresh sessions](../../specs/04-refresh-session-safety.md) | Done | 00 | Heavy | #4 | 667 tests; see spec 04 Log |
| 05 | [P0 private attendance media boundary](../../specs/05-attendance-private-media.md) | Done | 01, 02 | Heavy | #5 | 687 tests; see spec 05 Log |
| 06 | [Web component test harness](../../specs/06-web-unit-harness.md) | Done | 00 | Standard | #6 | 57+2 tests; see spec 06 Log |
| 07 | [Legacy attendance asset transition tooling](../../specs/07-legacy-media-transition.md) | Done | 05 | Heavy | #18 | 766 tests; tooling only; see Log |
| 08 | [Protected attendance image presentation](../../specs/08-attendance-media-ui.md) | Done | 05, 06 | Standard | #12 | 57+15 tests; see spec 08 Log |
| 09 | [Attendance write and calendar correctness](../../specs/09-attendance-reliability.md) | Done | 05 | Heavy | #14 | 726 tests; see spec 09 Log |
| 10 | [Additive launch lifecycle persistence](../../specs/10-launch-persistence.md) | Done | 00 | Heavy | #22 | 787 tests; isolated PG; see Log |
| 11 | [Workforce transfer and offboarding API](../../specs/11-workforce-lifecycle-api.md) | Done | 09, 10 | Heavy | #31 | 927 tests+real PG; see Log |
| 12 | [Task generation and assignment reliability](../../specs/12-task-readiness.md) | Done | 00 | Standard | #20 | 780 tests; see spec12 Log |
| 13 | [Atomic company registration](../../specs/13-registration-atomicity.md) | Done | 00 | Heavy | #16 | 739 backend;57+18 web; see Log |
| 14 | [Account access and capacity policy](../../specs/14-entitlement-policy.md) | Done | 10 | Heavy | #33 | 980 tests+real PG; see Log |
| 15 | [Paddle lifecycle API and configuration](../../specs/15-billing-lifecycle.md) | Done | 14 | Heavy | #37 | 1023 tests+real PG; see Log |
| 17 | [Self credentials and assisted worker recovery](../../specs/17-credential-handoff-api.md) | Done | 10 | Heavy | #24 | 803 tests+real PG; see Log |
| 18 | [Credential epoch access revocation](../../specs/18-credential-revocation.md) | Done | 04, 17 | Heavy | #26 | 819 tests+real PG; see Log |
| 19 | [Separate platform operator authorization](../../specs/19-operator-identity.md) | Done | 00 | Heavy | #29 | 69 new/888 full tests; see Log |
| 27 | [Approved v5 shared shell and route composition](../../specs/27-workspace-shell.md) | Done | 06 | Heavy | #35 | 57+40 tests/build/lint; see Log |

Remaining units:16,20–26,28–41. No other spec is in progress.

## Specification 15 — completed local backend boundary

Implementation commit: `1ea9ae8bae1304b7b58c7a52a45e04514f32ce50`.
Current branch: `implementation/spec-15-billing-lifecycle`, pushed to origin.
Issue: [37](https://github.com/Shumail-AbdulRehman/PRIV/issues/37).
Draft PR: [38](https://github.com/Shumail-AbdulRehman/PRIV/pull/38), stacked on `implementation/spec-27-workspace-shell`. No PR has been merged; issue remains open pending merge. This handoff is a subsequent documentation-only commit on the same branch.

- Canonical server-established Company.billingCustomerId replaces email/client customData ownership claims. Cross-company linkage is rejected.
- Webhook entity writes and event dedup marker commit atomically, using consistent company→provider locks and event/provider ordering; unknown-subscription placeholders converge safely. Unknown catalog items do not grant paid access.
- Environment-supplied exact plan/interval/price catalog replaces hardcoded prices; provider periods/trials remain provider facts. Missing activation/configuration fails closed.
- Actual owner-only `/api/subscription/manage` lifecycle/catalog/checkout/managed-portal routes are mounted. Existing public pricing/inquiry routes remain outside that authenticated namespace; old portal-session delegates to the guarded service. DTOs are whitelisted and portal responses private/no-store.
- Verified-owner server draft checkout uses company-locked AuditLog reservations to prevent duplicate purchases. Resolved requests reuse the transaction; ambiguous provider creates remain held. A signed event can reconcile only the exact existing reservation/customer/price/quantity. No invented timeout, automatic charge or financial repair.
- Fresh hosted portal URLs are validated and never persisted/logged. Provider failures return safe generic errors. No live provider calls, production changes, real purchases or deployment occurred.

All spec15 Done-when checks are marked passed. Local implementation is complete; actual commercial availability is **not** claimed. Read BILLING.md before activation or recovery changes.

## Files changed for Specification 15

The implementation commit changed exactly these21 files. Adjacent spec edits record serialized ownership transfer and later consumers; they do not start those specs.

- `backend/src/config/paddle.ts`
- `backend/src/controllers/subscription.controller.ts`
- `backend/src/routes/billingLifecycle.route.ts`
- `backend/src/routes/subscription.route.ts`
- `backend/src/services/accountAccess.service.test.ts`
- `backend/src/services/accountAccess.service.ts`
- `backend/src/services/billingLifecycle.service.test.ts`
- `backend/src/services/billingLifecycle.service.ts`
- `backend/src/services/paddleFulfillment.service.ts`
- `backend/src/services/subscription.service.ts`
- `backend/tests/accountCapacity.integration.ts`
- `backend/tests/billingLifecycle.integration.ts`
- `docs/implementation/BILLING.md`
- `docs/implementation/SESSION_HANDOFF.md`
- `specs/14-entitlement-policy.md`
- `specs/15-billing-lifecycle.md`
- `specs/26-launch-api-composition.md`
- `specs/39-release-operations.md`
- `specs/40-e2e-suite.md`
- `specs/PROGRESS.md`
- `specs/inventory/15-billing-lifecycle.md`

The final handoff update additionally refreshes `docs/implementation/planning/validator.md` and modifies only progress/spec15 Log/session documentation. For the complete earlier project file history, use each completed spec's Log, inventory fragment and its scoped commit; do not confuse the preserved working-tree changes below with this work.

## Checks performed and their limits

All commands below passed for spec15. The full suite/build results are retained from the completed implementation; TypeScript and real local billing integration were confirmed again when preparing this handoff.

| Check | Command / result |
|---|---|
| New focused billing tests | `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts`:43 passed |
| Focused billing/account/webhook regressions | `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts src/services/accountAccess.service.test.ts src/controllers/paddleWebhook.controller.test.ts`:99 passed |
| Full backend suite | `DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test LAUNCH_PERSISTENCE_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test npm test --prefix backend`:1,023 passed,83 files, zero skips; log `/tmp/hygene-spec15-backend-tests.log` |
| Backend build | `npm run build --prefix backend`: passed (Prisma generation + TypeScript); log `/tmp/hygene-spec15-backend-build.log` |
| Backend TypeScript | From backend: `npx tsc --noEmit`: passed, reconfirmed during handoff |
| Standalone integration TypeScript | From backend: `npx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2023 --esModuleInterop --skipLibCheck src/types/express.d.ts tests/billingLifecycle.integration.ts tests/accountCapacity.integration.ts`: passed, reconfirmed during handoff |
| Real local PostgreSQL billing boundary | `BILLING_LIFECYCLE_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/billingLifecycle.integration.ts`: passed, rerun during handoff |
| Real local PostgreSQL account policy regression | `ACCOUNT_CAPACITY_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/accountCapacity.integration.ts`: passed during spec15 |
| Specification validator | `python3 .ai/plan-project/scripts/validate-specs.py specs`:42 specs, zero errors, two accepted warnings (decision00 has no issue; final VERIFICATION.md is a terminal report). Justifications are in README Known gaps; latest output in planning/validator.md |

Billing proof covers native SDK HMAC/raw-byte tamper rejection, isolated Express route public/private behavior, canonical customer ownership, untrusted email/customData denial, atomic duplicate/out-of-order/rollback behavior, earlier placeholder convergence, unknown catalog denial, concurrent one-draft checkout and signed-event lost-response recovery. Provider clients are injected no-network fixtures. These are local unit/persistence boundary checks, not real merchant/sandbox qualification or whole-product E2E. Only spec40 writes/runs the launch E2E suite.

No known failing spec15 tests or TypeScript checks remain. Backend has no lint script; no backend lint claim. No frontend/mobile functionality changed in15, so no new frontend/mobile test run was needed. Last completed shell27 baseline:57 node+40 component tests, web build and full lint passed; EN/UR owner/manager/staff render fixtures and mobile menus showed no overflow/JavaScript errors. Fixtures used synthetic intercepted API responses and do not prove live integrations. Existing33 frontend dependency advisories remain a release39 task, not resolved by15.

## Unresolved integration and external release gates

- **Billing26/32/39/40:** old browser price-only purchase still needs replacement in32; restricted/inactive-company owner billing/security auth adapter and unified route/job/start policy remain26. Do not report the whole product billing flow as complete. The ordinary JWT middleware still rejects inactive companies.
- **Real Paddle:** merchant eligibility, real configured catalog/terms, corresponding API/webhook credentials, approved checkout page, sandbox lifecycle and actual portal hosts are unavailable/unqualified. Billing activation is disabled without explicit complete configuration. Do not invent prices/trial/refund/legal terms or activate with fixture IDs. Legacy canonical customer linkage requires verified migration/rollback qualification before cutover.
- **Uncertain provider operation:** retain reservations; signed exact-match events may reconcile checkout. Customer-create uncertainty or conflicting IDs requires qualified provider review. No automatic reset, destructive marker deletion or production repair script is provided; release39 must qualify operational recovery.
- **Other release dependencies:** real operator IdP/MFA/approved subjects; verified sender and support recipient; legal retention/exit facts; deployment host/TLS/secrets; signed Android build/device behavior; customer calendar fit; consented photo qualification; actual backup/restore and legacy public URL/cache cutover. Safe disabled boundaries are intentional until real facts exist.
- New photos are private authenticated Cloudinary assets; UI uses scoped credentialed byte dialogs. Metadata is AVAILABLE/NONE/LEGACY_RESTRICTED and legacy URL fields remain null. Do not restore public image anchors. Legacy old public/cached URLs are an external cutover gate07.
- JWTs now require purpose/expiry/refresh jti and credentialVersion. Pre-patch sessions require signin on rollout; additive migration must precede rollout. Credential18 revokes current-family logout/password changes; preserve those regressions.

## Next eligible specification — 24 (not started)

`specs/24-platform-company-api.md`, Platform company operations API. Both consumed prerequisites19 (separate operator identity) and15 (billing facts) are Done locally. No issue has yet been claimed for24. On continuation, follow the guide's search/claim-before-code ritual, implement and test just24, then update the tracker/handoff.

Scope: bounded whitelisted company/account/subscription/provider-sync metadata; reasoned audited suspension/reactivation with optimistic accountVersion conflicts. No workforce roster/photos, credentials, tenant impersonation, financial mutation or second billing engine. Use19 operator middleware/principal, never tenant ADMIN as platform operator. Actual IdP configuration remains unavailable so live operator entry stays disabled. Inspect existing audit actor typing before reuse: PLATFORM_OPERATOR must retain its issuer/subject identity, not masquerade as SYSTEM or a tenant numeric actor. Preserve billing state and historical tenant data. Shared route/policy composition is26; platform UI33/34 is separate. Re-read actual Owns/reuse contracts before amending any serialized ownership.

Other independent eligible specs exist;24 is the selected next unit, not a claim that every smaller number is blocked. Do not start it in the closing handoff session.

## Existing Git/review state and preserved user work

Prior stacked draft PRs by spec:01→7,02→8,03→9,04→10,05→11,06→13,08→15,09→17,13→19,07→21,12→23,10→25,17→27,18→28,19→30,11→32,14→34,27→36;15→38. Nothing merged. Current spec15 branch contains the preceding stack, so compare against its spec27 base to review15 only.

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
