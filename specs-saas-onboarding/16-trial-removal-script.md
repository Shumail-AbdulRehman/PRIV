# Spec 16 — Remove trials from sandbox prices

**Status:** Done
**Depends on:** Spec 08
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/paddleTrialRemoval.ts`, `backend/src/services/paddleTrialRemoval.test.ts`, `backend/scripts/removePaddleTrials.ts`, `specs-saas-onboarding/inventory/16-trial-removal-script.md`
**Reuses:** `backend/src/services/billingProvider.ts` (spec 08), `backend/config/paddle-sandbox-catalog.json`, `docs/plan-project/saas-onboarding/research/paddle.md`

## Goal

Give the user a safe command that shows which sandbox prices have trials and removes them only when approved.

## Scope

- Default mode only lists what would change.
- Applying needs `--apply`, and refuses unless `PADDLE_ENVIRONMENT` is sandbox.
- Touches only the six configured price IDs. Sends `trial_period` as null and keeps the existing `billing_cycle`, which Paddle requires.
- Re-reads each price afterwards and reports success or failure per price.
- Safe to re-run.

## Explicit non-scope

- Production prices → spec 41.
- Changing amounts or products → spec 41.

## Reuse first

- Call Paddle only through `billingProvider.ts`.

## Steps

1. Build the plan-and-apply module.
2. Add the thin command.
3. Test dry run, apply, production refusal and partial failure.
4. Apply only after the user approves, and record the result in the Log.
5. Record what you created in `specs-saas-onboarding/inventory/16-trial-removal-script.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/paddleTrialRemoval.test.ts` passes and proves: dry run makes no writes; production is refused; billing cycle is preserved; a partial failure is reported and a re-run finishes the rest. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] All six sandbox prices read back with no trial, recorded in the Log. [requires: Paddle sandbox credentials, user approval]
- [x] `specs-saas-onboarding/inventory/16-trial-removal-script.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Ran the approved real sandbox preview once from `backend/` with the specified unreachable `DATABASE_URL`; exit code **0**. No apply flag was passed and no trials were removed. The `[requires: Paddle sandbox credentials, user approval]` box remains unchecked. Exact preview output:

```text
DRY RUN: no prices will be changed. Use --apply to remove trials.
STARTER/month pri_01m26dxq2nvjb2ak7jt4gym22g: WOULD_REMOVE
STARTER/year pri_01m26dxqw2hx8kk0tc70wg5t29: WOULD_REMOVE
PRO/month pri_01m26dxtv0k73yk444nc0vvqjj: WOULD_REMOVE
PRO/year pri_01m26dxvj8cmtdtr7a660mqa2h: WOULD_REMOVE
ADVANCED/month pri_01m26dxxw7h9ma5xxcmsc0axgp: WOULD_REMOVE
ADVANCED/year pri_01m26dxyqpqr2cmr8cwez9am00: WOULD_REMOVE
```

- **2026-11-10** — Implemented the dry-run-first service, thin CLI and 23 isolated tests. The command uses only the six IDs in `backend/config/paddle-sandbox-catalog.json`, refuses non-sandbox environments before provider access, and updates only trial metadata while preserving the actual billing cycle. Every attempted write receives a fresh verification read; partial failures are reported per price, and reruns skip cleared prices. All provider calls use spec 08's gateway. Exceptions are reduced to fixed failure codes; no raw provider data or credentials are printed.
- **2026-11-10** — Final verification with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`: focused command **23 passed, 0 failed, 0 skipped**; `npm test --prefix backend` **2,516 passed, 7 skipped, 0 failed** across 112 passed files and one skipped SQL file. The existing SQL tests require a separate persistence-test database and were not enabled. Initial command-test parameterization produced two fixture failures; corrected the table shape and reran successfully. Final focused and full-suite runs include preservation of a non-default billing cycle.
- **2026-11-10** — Backend `npx tsc --noEmit -p tsconfig.json` and `npm run build --prefix backend` both passed with 0 errors. The CLI is outside the backend tsconfig's root, so also checked it with `cd backend && npx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2023 --strict --esModuleInterop --skipLibCheck scripts/removePaddleTrials.ts` (passed). No backend lint script exists. Build printed the existing Prisma upgrade advisory (7.5.0 to 8.0.0-rc.33); dependencies were not changed. Added and inspected `inventory/16-trial-removal-script.md`.
- **2026-11-10** — Per the run instructions, the real CLI was never executed, no real Paddle or database was contacted, and no migration or deployment ran. The **[requires: Paddle sandbox credentials, user approval]** box remains unchecked: all six real sandbox price read-backs and application are reserved for the user's coordinator. This is deliberately deferred, not a blocker. No files outside Owns required the test-only exception. Status and PROGRESS were left unchanged; no issue, PR, commit, branch operation, merge or push was performed.
