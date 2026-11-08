# Billing onboarding agent guide

## Read before implementing

1. Read this file, then PROGRESS.md. The tracker outranks assumptions from previous sessions.
2. Read ARCHITECTURE.md, DESIGN-SYSTEM.md and INVENTORY.md plus existing inventory fragments.
3. Read only the assigned numbered spec, its dependencies' Logs, and its named source/tests.
4. Use the approved source `design/billing-onboarding/revision-2/v3/`; the first proposal and revision-2/v1/v2 are history. Help/contact/support controls are explicitly excluded.

This is an additive feature set, numbered 44–63, in repository-root `specs-billing-onboarding/`. Do not run or modify the historical specs/ queue. Paths in Owns/Reuses are relative to the real repository root unless a steering anchor is named.

## Reported signup regression

Before implementing49/51/54/58/59/60/61/62/63, read `docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md`. Keep confirmed routing/catalog defects separate from unverified live provider/root-cause claims. Diagnose the affected account read-only when authorized evidence is available. Do not reset a reservation, delete records or retry an uncertain provider create to escape a hold. Application code belongs only to its assigned unit; live-account recovery beyond49 requires a reviewed repair spec before the final two gates.

Preserve the user's Git history: ordinary additive commits/fast-forward or reviewed merges only; never reset, rebase or force-push this repair. Commit complete reviewed dependencies without staging unrelated work. Only actual deployed revision/provider evidence can close63.

## Execution profile

Use **gpt-6.1-sol with medium reasoning effort** for every implementing Codex session, as requested by the user. Header tiers express risk; they do not authorize a model/effort change. Reasoning headers are human-readable requirements, not a claim that every runner parses them. Set the runner's real reasoning option and verify it before starting. Alternate provider IDs exist only to satisfy portable spec metadata; do not silently use them. If a task stalls, report the specific uncertainty and split/review it before asking to change the requested profile.

## One spec per session

Implement exactly one assigned unit. Explicit non-scope is binding. Read actual source before editing; proposed new paths/symbols in this set do not exist until their owner lands. Do not paste prototype app.js or illustrative prices into application code. Do not implement the entire queue in a single medium-effort context.

## Claim the issue before writing code

If there is an authenticated GitHub remote and the execution instruction authorizes issue/PR bookkeeping, search all issues for the exact prefix `Spec NN —` before creating one. Claim the existing/new issue, record its number in the spec header, and let the lead update the tracker. Open one PR with `Closes #n` and the spec/evidence links after checks pass; never merge your own PR. Use body files for multiline text. A missing remote or gh authentication is logged and does not block local implementation. The planning session opens no external issue or PR.

## Other specs may be running concurrently

Only edit the assigned Owns paths, its own Log and inventory fragment. An unexpected change outside ownership needs a lead decision, not a surprise edit. Under Orchestro the lead changes Status/tracker rows at merge; workers report results without racing on PROGRESS.md. In sequential use, the session updates its own row and appends a dated log. Never modify another running worker's files or revert unrelated changes.

The four steering docs are protected during parallel execution. Missing tokens/contracts are raised to the lead; the lead changes the steering contract before dispatching consumers. Inventories are written per spec and folded by spec 63.

## Verify before asserting

Resolve paths with rg --files; read manifests for dependencies, installed declarations for library exports, and dependency Done when/Logs for new symbols. Environment diagnostics report presence/validity only: never print keys, cookies, secrets, portal bearer URLs or private .env contents. A network failure is not proof of a wrong secret. Netlify build settings and Heroku runtime settings are distinct.

Reuse the established TanStack Query server cache, Redux auth, API client, language context, component primitives, backend services, owner middleware, provider reservation and signed fulfillment paths. No new state library, card form, auth storage system, database migration or alternative billing engine is authorized.

## Unit and static commands

Run from repository root; use Node compatible with installed packages and existing lockfiles.

- Backend focused: `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts` (substitute the spec's exact test file).
- Backend whole unit suite: `npm test --prefix backend`.
- Backend typecheck: `npm exec --prefix backend -- tsc -p backend/tsconfig.json --noEmit`; build: `npm run build --prefix backend`.
- Frontend component/helper focused: `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/BillingPlanPage.test.tsx` (substitute the exact file).
- Frontend pure Node focused: `node --experimental-strip-types --test frontend/tests/billing-proxy.test.mjs`.
- Frontend whole suite: `npm test --prefix frontend` (includes Node tests AND Vitest).
- Frontend typecheck: `npm exec --prefix frontend -- tsc -b frontend/tsconfig.json`; changed frontend lint, with frontend/ as the working directory: `npm exec -- eslint --max-warnings 0 <owned source paths relative to frontend/>`; build: `npm run build --prefix frontend`.
- Backend has no lint script. Do not invent a passing lint command or install a new linter for this feature. Record unrelated baseline frontend lint failures without hiding introduced failures.

Frontend Vitest currently includes `src/**/*.test.tsx`; helper tests must use .test.tsx too. Backend includes `src/**/*.test.ts`. Keep tests beside their code except the existing Node/SQL/browser conventions. Mock network/provider/clock boundaries; do not mock the function being asserted. Use roles/labels and behavioral assertions rather than snapshots.

## SQL and browser tests

Spec 60 alone adds/runs the feature's isolated PostgreSQL service tests, using a disposable localhost database and the existing isolation guard. Never use the live app database. Spec 62 alone adds/runs browser tests with `npm run test:e2e --prefix frontend -- <billing spec paths>`, then the full managed browser suite. Set the explicit HYGENE_E2E_DATABASE_URL bootstrap documented in frontend/e2e/README.md; the existing runner creates/drops only its generated child database and never attaches to a current app process. Do not weaken its guard or inherit private .env values. These test tiers complement unit tests; they are not substitutes for deployed Paddle sandbox acceptance.

## Acceptance tiers

[static]: inspect/typecheck/lint/build. [unit]: unit/component/isolated service tests actually run. [runtime]: local running-process check. [e2e]: only spec 62. [suite]: only spec 63. [requires: ...]: explicit external prerequisites, with unavailable evidence left pending. A green build or mocked browser result does not satisfy actual provider delivery or stored entitlement.

## Before finishing

Run focused behavior tests, then the package's complete unit suite, then typecheck/changed-file lint/build. Record exact commands, exit status, real counts, fixture boundaries and unresolved external checks in a dated Log. Write the assigned inventory fragment. Do not tick a box based on intention or a previous session's result. Implementation claims require current evidence.

## Deployment and blocked work

This plan is sandbox-only. Prepare changes/runbook in spec 61; run local integrated tests before publishing a candidate. The user/operator controls actual Netlify/Heroku/Paddle configuration and deployment; spec 63 cannot close until its separate deployed acceptance evidence exists. A missing credential is an external requirement, not permission to bypass a gate. Keep making independent local progress and report what operator evidence remains. No production payment activation, customer deletion or trial/pricing-policy changes.

A reproducible app defect discovered by the browser/final gate is assigned back to its code-owning spec, or gets an added repair spec with the final two gate numbers/index/tracker updated consistently. Gate sessions do not silently edit app files they do not own.
