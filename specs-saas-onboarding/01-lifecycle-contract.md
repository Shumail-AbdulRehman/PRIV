# Spec 01 — Billing lifecycle and outcome contract

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/types/billingLifecycle.ts`, `frontend/src/pages/Subscription/types.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.test.tsx`, `specs-saas-onboarding/inventory/01-lifecycle-contract.md`
**Reuses:** `frontend/src/pages/Subscription/onboarding/billingViewState.ts`, `ARCHITECTURE.md#lifecycle-dto-additions`

## Goal

Define the owner-safe data shapes every later billing spec builds against, on both server and client, with free-trial fields removed.

## Scope

- Add `onboardingStep` and `recoveryReason` to the lifecycle DTO with exactly the values in `ARCHITECTURE.md`.
- Add the confirm result (`ACTIVE`, `PROCESSING`, `NOT_PAID`, `NO_CHECKOUT`) and reconcile result (`RESUMABLE`, `CLEARED`, `IN_PROGRESS`, `PAID`, `UNRESOLVED`, `CONFLICT`), each carrying a fresh lifecycle.
- Add `replaced` to the checkout result.
- Mark `trialPeriod` optional and deprecated on the catalog DTO on both sides. New code never sets or reads it. It stays optional because screens not yet rebuilt still reference it and every spec must keep the build green. Spec 43 confirms it has no readers.
- Extend the strict client parser. An unknown step or outcome is rejected. `onboardingStep` and `recoveryReason` stay optional until the server sends them in spec 36: a missing step parses as `null`. `null` grants nothing, and spec 40 treats it as an unreadable step. Existing response fixtures stay valid.

## Explicit non-scope

- Deriving the step on the server → spec 10.
- Mapping steps to routes → spec 06.
- HTTP wiring of confirm and reconcile → spec 39.

## Reuse first

- Extend `billingContract.ts`. Do not add a second parser.
- No DTO may carry a raw Paddle error, email or another tenant identifier.

## Steps

1. Read the existing DTOs, parser and their tests.
2. Add the new fields and outcome types on the backend.
3. Mirror them in `types.ts` and the parser, using its existing strict helpers.
4. Make `trialPeriod` optional and deprecated. The parser ignores it and always returns no trial, so a rolling deploy cannot break the page.
5. Update parser tests.
6. Record what you created in `specs-saas-onboarding/inventory/01-lifecycle-contract.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/billingContract.test.tsx` passes and proves: every step and outcome parses; unknown values and wrong company are rejected; a missing step parses as `null` and grants no permission; a leftover `trialPeriod` is ignored. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/01-lifecycle-contract.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json`, `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]

## Log

**2026-11-09** — Pre-implementation scope review blocked. Created branch `saas-onboarding` and committed the authorized planning files first as `9052ea5`. GitHub issue and PR steps are skipped under the user's local workflow override. Read the current context, agent guide, architecture, inventory, tracker, decision spec, existing DTOs, parser and tests. The inventory directory has no existing fragments.

The required rejection of a missing `onboardingStep` conflicts with success fixtures in `frontend/src/pages/Subscription/api.test.tsx`, `frontend/src/pages/Subscription/queries.test.tsx` and `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`. They exercise the existing parser through the real API adapter with lifecycle responses that omit the step. Updating those fixtures is needed to keep the required whole frontend suite green, but all three files are outside this spec's `Owns`. No application files were edited. Decision requested: allow this spec to update these test fixtures and related assertions for the new contract, keeping server step derivation, route mapping and HTTP wiring in their assigned specs.

No tests, type checks, lint or builds were run (0 tests executed); no acceptance boxes are checked. The planning commit passed `git diff --cached --check`, staged-path inspection and a credential-pattern scan. No real database or Paddle sandbox was accessed. Resume spec 01 after the scope decision; spec 02 is the next numbered independently eligible spec, but was not started.

**2026-11-09** — Planner correction after the block above: the spec wrongly rejected a missing `onboardingStep`, which the server does not send until spec 36. The field now parses as `null` until then, and `null` grants nothing. No scope extension is needed. Status returned to Not started.

**2026-11-09** — Implementation resumed on `saas-onboarding` under the local commit-only workflow. Added matching server/client steps, recovery reasons, confirm/reconcile outcomes, lifecycle-bearing results and checkout replacement facts. Extended the existing strict parser with optional current-company scoping, normalized missing onboarding fields to `null`, and ignored legacy trial metadata. `replaced` stays optional on the wire until spec 26 emits it; the parser returns `false` when absent, keeping the current server buildable without editing its service. No server step derivation, route mapping or endpoint wiring was implemented.

The original focused command was run and found no tests because it duplicated `frontend/` after `cd frontend`; corrected the acceptance command to `npx vitest run src/pages/Subscription/onboarding/billingContract.test.tsx`. The corrected command passed **128 tests**. The first full frontend run passed **81 Node tests**, then **831 Vitest tests passed and 1 failed**: `frontend/src/pages/Subscription/api.test.tsx`, `validates actual catalog facts and exact checkout response`, expected the old checkout shape without `replaced`. Under the guide's test-only exception, updated only its exact expected object to include `replaced: false`; retained the legacy response fixture and all existing checks. No other out-of-scope files were edited.

Final verification in this session:

- Focused contract suite: **128 passed, 0 failed**. Covers all nine steps, five recovery reason values including `null`, four confirm outcomes and six reconcile outcomes, unknown/malformed values, wrong-company rejection, no inferred access, optional fields, ignored trials and sanitized result payloads.
- `npm test --prefix backend`: **99 files passed, 1 skipped; 1,597 tests passed, 7 skipped, 0 failed**.
- Final `npm test --prefix frontend`: **81 Node tests passed, 0 failed; 48 Vitest files passed, 832 tests passed, 0 failed**. The 128 focused cases are included in the 832, not additional cases.
- Backend `npx tsc --noEmit -p tsconfig.json`, frontend `npx tsc -b --noEmit` and `npm run lint --prefix frontend`: passed with **0 errors and 0 warnings**. Frontend types and lint were repeated after the API test correction and passed.
- `npm run build --prefix backend`: passed (Prisma client generation and TypeScript compilation only). `npm run build --prefix frontend`: passed; a repeat with no concurrent test jobs also passed. Both frontend builds emitted the Rolldown `PLUGIN_TIMINGS` advisory for Babel/CSS time; it was not hidden or disabled. No compiler or lint diagnostics occurred.
- Inventory fragment created and inspected; static comparison confirms all four server/client enum unions agree. `python3 .ai/plan-project/scripts/validate-specs.py specs-saas-onboarding`: passed with **44 specs, 0 errors, 50 warnings** (issue references omitted by the local workflow override, plus planning ownership/reference advisories). Frontend Node tests also emitted the existing mobile translation module-type warning. These tooling/planning advisories are recorded rather than changing configuration or other specs outside this scope.

All application test, type-check, lint and build commands ran with `DATABASE_URL` and `DIRECT_URL` set to `postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`; `LAUNCH_PERSISTENCE_TEST_DATABASE_URL` and `PADDLE_API_KEY` were unset. Full Vitest runs used `VITEST_MAX_WORKERS=2`. The seven SQL persistence tests were skipped because no isolated database was authorized. Real database persistence and real Paddle payments were not verified or accessed. No migrations, pushes or deployments ran. The user's pre-existing corrections in `specs-saas-onboarding/` and `docs/CURRENT_CONTEXT.md` are included with this spec; unrelated design/audit work is left in place. Spec 02 is the next lowest-numbered eligible spec and was not started.
