# Spec 14 — Real Paddle sandbox probe

**Status:** Not started
**Depends on:** Spec 08
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/paddleSandboxProbe.ts`, `backend/src/services/paddleSandboxProbe.test.ts`, `backend/scripts/paddleSandboxProbe.ts`, `docs/plan-project/saas-onboarding/research/sandbox-probe.md`, `specs-saas-onboarding/inventory/14-sandbox-probe.md`
**Reuses:** `backend/src/services/billingProvider.ts` (spec 08), `backend/config/paddle-sandbox-catalog.json`

## Goal

Prove the riskiest assumptions against the real Paddle sandbox before the checkout screens are built on them.

## Scope

- A script that refuses to run unless the environment is sandbox and a `--confirm` flag is given.
- It reads all six prices and reports status, interval, currency and whether a trial is set.
- It creates one disposable customer and one draft transaction for a catalog price, confirms the draft can be read back and listed by customer, then cancels it. It reports each result.
- Output is redacted to IDs, statuses and codes.
- Record findings in `sandbox-probe.md`: trial state, whether a cancelled draft is final, and the exact `customer_already_exists` shape.
- With the user's explicit approval, also read the stuck company's `BILLING_OPERATION` rows and record which reservation state it is in.

## Explicit non-scope

- Removing trials → spec 16.
- Real card payment → spec 42.

## Reuse first

- Call Paddle only through `billingProvider.ts`.

## Steps

1. Build the redaction and report logic as a tested module.
2. Add the thin command.
3. Run it, once approved, and save the report.
4. If credentials or approval are missing, mark the spec Blocked and say so. Do not invent results.
5. Record what you created in `specs-saas-onboarding/inventory/14-sandbox-probe.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/paddleSandboxProbe.test.ts` passes and proves: refuses production and a missing confirm flag; output never contains emails or API keys; a cancel failure is reported. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `docs/plan-project/saas-onboarding/research/sandbox-probe.md` records real results with the date. [requires: Paddle sandbox credentials, user approval]
- [ ] `specs-saas-onboarding/inventory/14-sandbox-probe.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
