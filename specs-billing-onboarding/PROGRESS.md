# Billing implementation progress

Source of current state for specs-billing-onboarding only. Historical specs/ is a separate queue. Under Orchestro the lead updates status/issue columns; in sequential mode the implementing session updates its own row. Detailed evidence belongs in per-spec Logs.

| # | Spec | Status | Depends on | Model | Issue | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 44 | [Record approved sandbox repair decisions](44-billing-decisions.md) | Done | — | Sol medium (Heavy) | — | See decision Log |
| 45 | [Publish additive billing lifecycle and catalog contracts](45-billing-dto-contract.md) | Done | 44 | Sol medium (Heavy) | — | See spec45 Log;44 focused tests |
| 46 | [Stabilize browser SDK initialization and event subscriptions](46-paddle-sdk-events.md) | Done | 44 | Sol medium (Standard) | — | See spec46 Log;22 focused tests |
| 47 | [Build scoped billing layout, tokens and translations](47-billing-setup-shell.md) | Done | 44 | Sol medium (Heavy) | — | See spec47 Log;17 focused tests |
| 48 | [Qualify same-origin browser API transport on Netlify](48-netlify-api-transport.md) | Done | 44 | Sol medium (Standard) | — | See spec48 Log;17 focused routing checks |
| 49 | [Return authoritative readiness and safe checkout resume](49-server-lifecycle-readiness.md) | Done | 45 | Sol medium (Heavy) | — | See spec49 Log;146 focused tests |
| 50 | [Derive billing display states and exact provider prices](50-billing-view-state.md) | Done | 45 | Sol medium (Standard) | — | See spec50 Log;72 focused tests |
| 51 | [Own validated owner cache and recoverable polling](51-billing-client-queries.md) | Done | 45 | Sol medium (Heavy) | — | See spec51 Log;37 API/query checks |
| 52 | [Restyle existing owner signup without changing auth semantics](52-owner-signup-screen.md) | Done | 47 | Sol medium (Standard) | — | See spec52 Log;17 signup/hook tests |
| 53 | [Coordinate single checkout, resume and provider events](53-checkout-controller.md) | Done | 46, 51 | Sol medium (Heavy) | — | See spec53 Log;38 focused tests |
| 54 | [Render real catalog plans and interval selection](54-plan-selection-screen.md) | Done | 47, 50, 51 | Sol medium (Standard) | — | See spec Log; focused tests + full829 tests |
| 55 | [Render order summary and Paddle checkout handoff](55-payment-handoff-screen.md) | Done | 47, 50, 53 | Sol medium (Standard) | — | See spec Log; focused tests + full829 tests |
| 56 | [Confirm server entitlement and recover polling](56-activation-screen.md) | Done | 46, 47, 50, 51 | Sol medium (Standard) | — | See spec Log; full829 tests |
| 57 | [Render existing subscription and self-service portal](57-subscriber-billing-screen.md) | Done | 47, 50, 51 | Sol medium (Standard) | — | See spec Log; full829 tests |
| 58 | [Render known-failure and uncertain-payment recovery](58-billing-recovery-screen.md) | Done | 47, 50, 53 | Sol medium (Standard) | — | See spec Log; full829 tests |
| 59 | [Compose owner routes, aliases and workspace gates](59-owner-billing-routing.md) | Done | 52, 54, 55, 56, 57, 58 | Sol medium (Heavy) | — | See spec Log;83 focused,825 full tests |
| 60 | [Prove reservation and entitlement persistence in PostgreSQL](60-billing-sql-proof.md) | Done | 49 | Sol medium (Heavy) | — | See spec Log; required checks passed |
| 61 | [Prepare deployment diagnosis and sandbox release checks](61-sandbox-deployment-package.md) | Done | 48, 49, 59 | Sol medium (Standard) | — | See spec Log; required checks passed |
| 62 | [Prove every owner billing flow in the managed browser suite](62-billing-e2e-suite.md) | Done | 60, 61 | Sol medium (Heavy) | — | See Log;60 focused /170 full browser pass |
| 63 | [Verify clean suites and deployed sandbox acceptance](63-verification-pass.md) | In progress | 62 | Sol medium (Heavy) | — | Local final checks; live deferred by user |

## Log

**2026-11-06** — Planning baseline recorded. User approved revised design as amended to remove Help/Contact/support/FAQ elements and requested detailed Sol medium implementation/test instructions. Prototype amendment passed26 local no-help/layout/state checks with zero browser errors; these are not application tests. Decision44 is Done. All code, SQL, browser, deployment-package and final acceptance units remain Not started. No application code, live account/payment or deployment changed.

**2026-11-06** — Spec45 completed locally. Additive DTOs and safe client parsers verified with44 focused tests, full frontend64 Node +475 Vitest tests, scoped lint and production build/typecheck. No billing UI/deployment is claimed complete. Next lowest ready unit is46;47/48 are also ready, and49/50/51 now have their contract dependency.

**2026-11-07** — Spec46 completed locally. SDK singleton initialization/retry and cleanable callback subscriptions verified with22 focused tests, complete frontend64 Node +497 Vitest tests, typecheck, scoped lint and production build. Failed-CDN recovery also exercises the installed wrapper with a fake provider global. No deployed/provider acceptance claimed. Next lowest ready unit is47;48/49/50/51 remain independently ready by their completed dependencies.

**2026-11-07** — Planning amendment for reported signup/dashboard and empty-options failure. Confirmed source routing and catalog-query coupling; live provider failure/reservation state remains unverified. Strengthened49/51/54/58/59/60/61/62/63 acceptance, expanded browser coverage to33 rows and added read-only diagnosis/release/history safeguards. Reused approved revision-2/v3; no app code, status, deployment, provider/account data or completed evidence changed. See docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md and validator.md.

**2026-11-07** — Repair-plan validation passed:20 specs,0 errors,3 accepted missing-issue warnings (44–46), documented in README Known gaps. DAG remains9 waves, widest5. No implementation/test execution claimed by this planning pass.

**2026-11-07** — Spec47 completed locally: scoped standalone setup/settings layout, approved tokens/primitive styles and65 additive EN/UR billing translation entries. Focused17 tests, complete frontend64 Node +514 Vitest tests/37 files, typecheck, scoped lint and final production build passed. Isolated shell preview checked320 Urdu/390/768 settings/1440/1920 with no horizontal overflow; independent review resolved one button-hover contrast issue. No app route/auth/provider/data/deployment changed; the reported signup flow is not yet integrated. Inventory47 and spec47 Log contain evidence. Next sequential unit is48;49/50/51/52 are also ready by consumed dependencies.

**2026-11-07** — Spec48 completed locally. Added the /api/* Netlify rewrite to the existing Heroku /api target ahead of unchanged asset404/SPA200 fallbacks. Focused17 Node routing checks, full frontend81 Node +514 Vitest tests/37 files, typecheck, Node syntax check and production build passed; dist/_redirects matches source exactly. No settings/native/webhook/cookie changes or deployed claim. Inventory48 hands VITE_API_BASE_URL=/api build/release and actual cookie/refresh/status qualification to61/63. Next sequential unit49;50/51/52 are also ready by consumed dependencies.

**2026-11-07** — Spec49 completed locally: explicit server workspace permission/readiness, exact safe draft resume, shared reservation correlation and provider catalog/trial metadata. Focused lifecycle120/config25 tests passed; full backend1596 passed/7 incumbent SQL skips (explicit isolated launch database absent), typecheck and build passed. New READY customer linkage supports safe missing-mirror resume; unproven legacy/paid/unknown/foreign outcomes remain held. No live account recovery/deployment/UI integration claimed. Inventory49 includes legacy/SQL-fixture handoffs. Next sequential unit50;51/52/60 are also ready by consumed dependencies.

**2026-11-07** — Spec50 completed locally. Pure owner/freshness display-state derivation and API-plan lookup, exact BigInt-backed recurring price formatting with runtime currency minor units, and72 focused tests passed. Full frontend81 Node +586 Vitest tests/39 files, typecheck, scoped lint and build passed. Inventory50 describes data-owner/action semantics and no guessed annual monthly equivalent or backend policy duplication. No UI route/deployment/live fix claimed. Next sequential unit51;52/60 are also ready by consumed dependencies.

**2026-11-07** — Spec51 completed locally: validated DTO/portal API boundary, company/owner private keys with cancellation/cache removal, independent catalog reads and bounded recoverable lifecycle polling. Focused36 API/query checks plus39 existing billing page and35 setup/gate regressions passed (110 total); full frontend81 Node +621 Vitest tests/40 files, typecheck, changed-file lint and build passed. Logged narrow lead-approved test-only fixture/error-expectation corrections; no runtime page/route/gate changed. Inventory51 describes new hook/refresh/timeout/dataOwner seams. No deployment or live-account recovery claimed. Next sequential unit52;53/54/56/57/60 are also ready by consumed dependencies.

**2026-11-07** — Spec52 completed locally: existing signup form now uses billing setup shell, exact request/hook/session semantics, six-character validation, pending duplicate guard, translated inline errors and durable-account sign-in recovery. Focused17 signup/hook +11 login regression tests passed; full frontend81 Node +635 Vitest tests/41 files, typecheck, changed-file lint and build passed. Visual normal/error/recovery EN/UR previews reflowed at1440/390/320; review resolved placeholder contrast/footer copy. Logged one shared translation and one login-test-only compatibility exception; login runtime, auth/routes/backend/provider/deployment untouched. Inventory52 recorded. Next sequential unit53;54/56/57/60 are also ready by consumed dependencies.

**2026-11-07** — Spec53 completed locally. Owner/session-scoped checkout controller validates identity/config/SDK before POST, locks duplicate submits, restores exact proven draft, preserves prepared ID on open failure and holds uncertain outcomes for status-first recovery. Transaction-correlated SDK signals refresh server facts without granting entitlement; account-change/unmount cleanup aborts work/listeners/owned overlay and prevents same-owner session-state revival. Focused38 tests, full frontend81 Node +673 Vitest tests/42 files, typecheck, scoped lint and build passed. Inventory53 recorded; no UI/deployment/live account repair claimed. Next sequential unit54;55/56/57/58/60 are also ready by consumed dependencies.10 units54–63 remain.

**2026-11-08** — Specs54/55 completed: real-price plan choice and provider-owned payment handoff, focused13/18 tests; full81 Node +748 Vitest, typecheck/scoped lint/build passed. Responsive review and scoped documentation complete. No deployment/provider acceptance claimed.56–58 finishing review;59 route composition underway.

**2026-11-08** — Specs56–58 complete locally: authoritative confirmation, subscriber portal/usage and status-first recovery; focused15/17/12 tests and full829-test frontend run passed with static/build/render review.59–63 remain; deployed provider evidence remains an external final gate.

**2026-11-08** — Spec59 complete: standalone billing/alias composition and pre-layout owner workspace gate;83 focused and825 full frontend tests, typecheck/scoped lint/build passed. Logged narrowly scoped legacy fixture/query51 retry-on-mount fix.60 SQL and61 documentation checks underway;62 browser and63 deployed/clean acceptance remain.

**2026-11-08** — Specs60/61 complete locally: real disposable PostgreSQL failure/entitlement proof, backend1596 passed/7 baseline launch SQL skips, package static/build checks and operator-ready sandbox release/runbook. No actual release/provider/affected-account diagnosis asserted.62 managed browser suite underway;63 final acceptance remains pending.

**2026-11-08** —49/60 fulfillment refinement completed: exact canonical transaction/subscription linkage releases only the stale draft hold;121 focused, full1604 backend/0 skips, real SQL and build pass. Clean browser run passed170 with one unrelated opt-in operator skip; final post-refinement confirmation run underway. Live verification explicitly deferred by user.

**2026-11-08** —62 complete: clean focused60 and full170 passed/1 optional nonbilling skip, scoped lint/typechecks/builds and33-flow map. No provider proof claimed. User deferred live verification.63 completes only local acceptance; actual deployment/card/webhook/affected-account criteria remain unchecked.

**2026-11-08** —51 confirmation timing complete: explicit activation polling continues through a proven AWAITING_PROVIDER draft;16 query tests, full829 frontend tests/build/lint and focused61 managed browser cases passed. Final172-test complete browser run is underway; only live verification is deferred by user scope.
