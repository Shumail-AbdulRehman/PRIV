# Sandbox billing implementation plan — Sol medium

Design approved as amended on 2026-11-06. Help/Contact controls and related support/FAQ wording have been removed from the current prototype. This folder is the additive implementation plan; application code and live configuration have not been changed by planning.

## Reported signup failure — repair amendment, 2026-11-07

Read the [scoped repair plan](../docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md) before continuing. Confirmed locally: signup → /choose-plan → /subscription beneath DashboardLayout. Checkout uncertainty also suppresses the catalog read, allowing a blank options region. The screenshot does not prove the exact provider failure or an unmatched server reservation; those remain read-only operator diagnosis tasks. Source evidence, intake and validation are in [repair planning](../docs/plan-project/billing-onboarding/repair-2026-11-07/).

Retain the approved revision-2/v3 design and existing four steering documents; no fresh design is proposed. Existing specs49/51/54/58/59/60/61/62/63 now contain explicit failure/regression criteria. No new overlapping queue, renumbering, dependency or application change is introduced. Specs44–46 stay Done;47 is the next sequential unit. Implement one unit per session and keep main/history intact through ordinary commits; no reset, rebase or force push. A push to main is not deployed acceptance.

Run operator diagnosis early when access is available; record failing request stage/status, environment/revision agreement and same-tenant reservation/provider correlation. Never clear holds or delete audit/customer/subscription data to make checkout available. If recovery needs a new mutation beyond spec49, add a reviewed repair unit before the final two gates. Missing affected-account evidence leaves spec63 pending, while independent local units can proceed.

## Intended result

A new company owner signs up, chooses an existing monthly/yearly provider plan, adds a **test card only in Paddle sandbox**, waits for server-confirmed current entitlement and enters the workspace. Interrupted owners resume the same server-prepared transaction. Existing subscribers use their billing settings/Paddle portal, without a second purchase. Failure states offer self-service status/refresh/security rather than nonexistent support.

Deployment remains Netlify frontend + Heroku backend. Real prices/trials/tax/card requirements come from Paddle. No real-money activation, custom card fields, new prices, provider migration, destructive reset or unrelated dashboard/auth/native rewrite.

## Start with Sol at medium effort

Set the implementing Codex session to **gpt-6.1-sol / medium**. The risk tiers in spec headers do not override that user choice. Work one spec per fresh session; do not ask one medium-effort session to hold the entire queue.

Copy this prompt into Sol after selecting that model/effort:

> Read specs-billing-onboarding/AGENT-GUIDE.md, PROGRESS.md, ARCHITECTURE.md, DESIGN-SYSTEM.md and INVENTORY.md. Implement only the earliest Not started spec whose dependencies are Done, starting with spec47. Read its actual source and tests first. Follow its Owns and Explicit non-scope; do not paste prototype code or sample prices. Run focused behavioral tests, the whole affected package unit suite, typecheck/changed-file lint/build. Record real commands/counts and inventory/Log evidence; update only your own tracker row in sequential mode. Stop after that unit. Do not claim actual Paddle/Netlify/Heroku acceptance from mocked tests or publish/activate production billing.

The installed Codex CLI supports model/config flags; an equivalent interactive launch is `codex -m gpt-6.1-sol -c 'model_reasoning_effort="medium"'`. Apply the prompt above in that session. No Codex job was launched by this planning turn.

## Read order and design

Use [agent guide](AGENT-GUIDE.md), [architecture](ARCHITECTURE.md), [closed design system](DESIGN-SYSTEM.md), [reuse inventory](INVENTORY.md), then the assigned spec. [PROGRESS.md](PROGRESS.md) is current state. [Approved prototype](../design/billing-onboarding/revision-2/v3/index.html) and [approval amendment](../design/billing-onboarding/revision-2/approval.json) define the visual source. The first rejected proposal is historical.

## Spec index

| # | Spec | Wave | What it covers |
| --- | --- | --- | --- |
| 44 | [Record approved sandbox repair decisions](44-billing-decisions.md) | 0 | Decision recorded |
| 45 | [Publish additive billing lifecycle and catalog contracts](45-billing-dto-contract.md) | 1 | Publish additive billing lifecycle and catalog contracts |
| 46 | [Stabilize browser SDK initialization and event subscriptions](46-paddle-sdk-events.md) | 1 | Stabilize browser SDK initialization and event subscriptions |
| 47 | [Build scoped billing layout, tokens and translations](47-billing-setup-shell.md) | 1 | Build scoped billing layout, tokens and translations |
| 48 | [Qualify same-origin browser API transport on Netlify](48-netlify-api-transport.md) | 1 | Qualify same-origin browser API transport on Netlify |
| 49 | [Return authoritative readiness and safe checkout resume](49-server-lifecycle-readiness.md) | 2 | Return authoritative readiness and safe checkout resume |
| 50 | [Derive billing display states and exact provider prices](50-billing-view-state.md) | 2 | Derive billing display states and exact provider prices |
| 51 | [Own validated owner cache and recoverable polling](51-billing-client-queries.md) | 2 | Own validated owner cache and recoverable polling |
| 52 | [Restyle existing owner signup without changing auth semantics](52-owner-signup-screen.md) | 2 | Restyle existing owner signup without changing auth semantics |
| 53 | [Coordinate single checkout, resume and provider events](53-checkout-controller.md) | 3 | Coordinate single checkout, resume and provider events |
| 54 | [Render real catalog plans and interval selection](54-plan-selection-screen.md) | 3 | Render real catalog plans and interval selection |
| 55 | [Render order summary and Paddle checkout handoff](55-payment-handoff-screen.md) | 4 | Render order summary and Paddle checkout handoff |
| 56 | [Confirm server entitlement and recover polling](56-activation-screen.md) | 3 | Confirm server entitlement and recover polling |
| 57 | [Render existing subscription and self-service portal](57-subscriber-billing-screen.md) | 3 | Render existing subscription and self-service portal |
| 58 | [Render known-failure and uncertain-payment recovery](58-billing-recovery-screen.md) | 4 | Render known-failure and uncertain-payment recovery |
| 59 | [Compose owner routes, aliases and workspace gates](59-owner-billing-routing.md) | 5 | Compose owner routes, aliases and workspace gates |
| 60 | [Prove reservation and entitlement persistence in PostgreSQL](60-billing-sql-proof.md) | 3 | Prove reservation and entitlement persistence in PostgreSQL |
| 61 | [Prepare deployment diagnosis and sandbox release checks](61-sandbox-deployment-package.md) | 6 | Prepare deployment diagnosis and sandbox release checks |
| 62 | [Prove every owner billing flow in the managed browser suite](62-billing-e2e-suite.md) | 7 | Prove every owner billing flow in the managed browser suite |
| 63 | [Verify clean suites and deployed sandbox acceptance](63-verification-pass.md) | 8 | Verify clean suites and deployed sandbox acceptance |

## Dependency order and ownership

Each spec lists exact consumed dependencies and exclusive source/test paths. Backend config/service is owned by49; client API/query by51; shell/styles/translation by47; router/gate/old monolithic composition by59; integrated browser tests by62. Pages add isolated files and consume the established contracts. Do not concurrently edit shared route/i18n/token files from a page spec.

| Wave | Ready together after prior consumed dependencies | Purpose |
| --- | --- | --- |
| 0 | 44 | Decision baseline |
| 1 | 45, 46, 47, 48 | Parallel-safe owned units |
| 2 | 49, 50, 51, 52 | Parallel-safe owned units |
| 3 | 53, 54, 56, 57, 60 | Parallel-safe owned units |
| 4 | 55, 58 | Parallel-safe owned units |
| 5 | 59 | Parallel-safe owned units |
| 6 | 61 | Parallel-safe owned units |
| 7 | 62 | Parallel-safe owned units |
| 8 | 63 | Parallel-safe owned units |

Use the dependency graph rather than implementing in numerical lockstep: e.g. SDK/shell/transport can run once decision44 is Done, while server readiness, pure display state and client queries fan out from contract45. For a single Sol session, take the lowest ready unit and stop after it.

## Tests and release gates

Every code spec names its focused test files and behaviors, then owes the whole affected package unit suite and build. Frontend helpers deliberately use .test.tsx because that is the installed Vitest include. Backend uses existing Vitest plus the real-SQL script in60. See [detailed test matrix](../docs/plan-project/billing-onboarding/planning/test-matrix.md).

Spec62 is the single browser-suite owner, with33 local flow coverage rows and explicit provider-fixture boundaries; it is intentionally the longer mechanical unit. Reuse the existing managed disposable-database harness, not a live app server. Spec63 runs clean suites and independently requires actual deployed sandbox test-card → signed webhook → persisted current entitlement → workspace proof. Missing private configuration access is recorded as external acceptance pending, never as passed.

Prepare the deployment runbook in61, complete local browser acceptance in62, then have the operator publish/configure the matching sandbox candidate and supply evidence for63. No automatic production activation or customer record reset.

## Optional parallel runner

In an environment with Orchestro installed, use the explicit feature directory: `orchestro specs graph specs-billing-onboarding/` and `orchestro specs ready specs-billing-onboarding/`. The lead controls tracker statuses and merges; workers stay within Owns. Orchestro/spec-run were not found on this machine, so these commands were not executed. Do not run bare spec-run here: its default specs/ is the unrelated historical queue. Sequential Sol sessions using the prompt above require no extra runner.

## Status legend

Not started: queued. In progress: claimed. Blocked: specific required input/environment is missing. Done: named checks actually passed and evidence was logged. Decision44 and implementations45/46 are Done; the remaining implementation/deployed acceptance units are Not started. See PROGRESS.md for current evidence.

## Open questions / evidence still required

- The authenticated deployed disabled-flow root cause has not been observed. Diagnose current revisions, flags/catalog/browser build settings and cookie/session behavior before claiming a cause.
- Private Netlify/Heroku/Paddle configuration and provider price/trial/card policy need operator verification. Use sanitized validity booleans and public IDs, never secret values.
- Actual deployed proxy Set-Cookie/refresh behavior, third-party-cookie-blocked browsers and signed event delivery cannot be established by the static preview or mocked checkout tests.
- Unrelated baseline suite failures, if any, must be recorded before implementation; no old audit count is a promised current pass.

## Known gaps

Current validation on2026-11-08:20 specs,0 errors,20 accepted missing-GitHub-issue warnings.44 is a planning decision;45–62 were implemented/tested locally, and63 has completed all local checks with external acceptance deferred. This execution did not authorize external issue/PR bookkeeping. Existing local evidence is preserved rather than inventing issue numbers; issue metadata does not establish provider/deployment acceptance.

The user explicitly deferred live verification on2026-11-08. Final63 keeps actual Netlify/Heroku/Paddle and affected-account criteria unchecked; see docs/implementation/billing-final-verification.md. No credential, screenshot or mocked SDK result is treated as deployed proof. Narrow .gitignore exceptions preserve plan and required implementation Markdown. Historical specs/ is unchanged. Approved application design authority remains design/billing-onboarding/revision-2/v3; earlier proposals are history.

## Research and planning evidence

[Source survey](../docs/plan-project/billing-onboarding/planning/repo-survey.md), [current implementation grounding](../docs/plan-project/billing-onboarding/research/implementation-grounding.md), [intake](../docs/plan-project/billing-onboarding/planning/intake.md), [provider/hosting sources](../docs/plan-project/billing-onboarding/research/provider-sources.md), [SaaS reference research](../docs/plan-project/billing-onboarding/research/revision-2/saas-patterns.md), [verified model metadata](../docs/plan-project/billing-onboarding/research/models.md), [DAG/ownership audit](../docs/plan-project/billing-onboarding/planning/dag.md), [test matrix](../docs/plan-project/billing-onboarding/planning/test-matrix.md) and [validator output](../docs/plan-project/billing-onboarding/planning/validator.md).
