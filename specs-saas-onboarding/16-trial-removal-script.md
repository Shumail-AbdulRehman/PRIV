# Spec 16 — Remove trials from sandbox prices

**Status:** Not started
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

- [ ] `cd backend && npx vitest run src/services/paddleTrialRemoval.test.ts` passes and proves: dry run makes no writes; production is refused; billing cycle is preserved; a partial failure is reported and a re-run finishes the rest. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] All six sandbox prices read back with no trial, recorded in the Log. [requires: Paddle sandbox credentials, user approval]
- [ ] `specs-saas-onboarding/inventory/16-trial-removal-script.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
