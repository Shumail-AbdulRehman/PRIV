# Spec 14 — Real Paddle sandbox probe

**Status:** Done
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

- [x] `cd backend && npx vitest run src/services/paddleSandboxProbe.test.ts` passes and proves: refuses production and a missing confirm flag; output never contains emails or API keys; a cancel failure is reported. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `docs/plan-project/saas-onboarding/research/sandbox-probe.md` records real results with the date. [requires: Paddle sandbox credentials, user approval]
- [x] `specs-saas-onboarding/inventory/14-sandbox-probe.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Ran the approved real sandbox probe once from `backend/` with the specified unreachable `DATABASE_URL` and `--confirm`; exit code **1**, `ok: false`. The dated `sandbox-probe.md` report records all six `PRICE_READ` results (`active`, `USD`, frequency `1`, alternating `month`/`year`, all `trial: true`), active customer `ctm_01m71jfw29cjar59jka8r88fpn`, and duplicate result `PASS` / `customer_already_exists` with that customer ID. Draft creation returned `FAIL` / `REJECTED`, with provider code `invalid_field`; cancellation was `SKIPPED` / `NO_KNOWN_TRANSACTION`. Draft read/list, cancellation read-back/finality, raw duplicate response shape and stuck-company rows remain unverified. Checked only the report-evidence box because it now records the checks that ran, including failure and skipped outcomes. No retry, database access or trial removal.

- **2026-11-10** — Implemented the sandbox/confirmation guards, injected probe and redacted JSON reporting, plus the thin manual command using the existing gateway and six-price sandbox catalog. The probe reports price status, billing interval/frequency, currency and trial presence; creates a disposable customer; probes duplicate-email handling without adopting another customer; creates, reads and lists a draft; attempts cancellation even when draft verification fails; and reads the canceled status back. No automatic write retries, card entry, database imports or application startup. Unknown create outcomes and cancellation failures remain explicit in the report.
- **2026-11-10** — Focused command passed: **24 tests passed, 0 failed, 0 skipped**. The initial run had two test-fixture failures (Vitest array parameter expansion and a queued mock response); those fixtures were corrected before the passing rerun. Required full backend command passed: **2,517 tests passed, 7 skipped, 0 failed**, across **112 passed test files and 1 skipped file**; the focused 24 are included in that total. SQL persistence tests remained skipped. Every test command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`.
- **2026-11-10** — Backend `npx tsc --noEmit -p tsconfig.json` and `npm run build --prefix backend` passed with **0 errors and 0 warnings**. The build performed its standard Prisma client generation only, with no migration or database access. Because backend `tsconfig.json` includes only `src/`, also type-checked the command without executing it using `cd backend && npx tsc --noEmit --strict --target ES2023 --module NodeNext --moduleResolution NodeNext --esModuleInterop --types node scripts/paddleSandboxProbe.ts`; passed with 0 errors. Backend has no lint script. Inventory fragment inspected and present; whitespace check passed.
- **2026-11-10** — Created the dated research report with the coordinator command and explicit evidence limits. **Every `[requires: ...]` box remains unchecked.** Per the user's run override, did not run the real script, call Paddle, use a real database or inspect the stuck company's billing rows. Real trial states, canceled-draft finality and the exact raw `customer_already_exists` shape remain unverified. The existing gateway intentionally strips raw provider errors, so this command reports its normalized code and optional validated customer ID only. These deferred checks are not a blocker under this run's instructions; implementation and local verification are complete.
- **2026-11-10** — Changed only this spec's owned implementation, tests, research report and inventory fragment, plus these permitted checklist/Log updates. No test-only scope exception was needed. Kept the Status line and `PROGRESS.md` unchanged. No GitHub issues/PRs, commits, branch commands, pushes, deployment, migration or secrets printed.
