# Spec 10 — Server next-step decision

**Status:** Done
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/billingOnboardingStep.ts`, `backend/src/services/billingOnboardingStep.test.ts`, `specs-saas-onboarding/inventory/10-onboarding-step.md`
**Reuses:** `ARCHITECTURE.md#lifecycle-dto-additions`, `backend/src/types/billingLifecycle.ts` (spec 01)

## Goal

Write the pure function that decides the owner's next step from server facts, so every screen and redirect agrees.

## Scope

- Inputs are plain facts already computed by the lifecycle read. No I/O and no clock.
- Follow the first-match order in `ARCHITECTURE.md` exactly.
- Set `recoveryReason` for `UNAVAILABLE` and `RECONCILE`.
- A price with a trial yields `UNAVAILABLE` with `PRICE_NOT_READY`.

## Explicit non-scope

- Gathering the facts → spec 36.
- Client routing → spec 06.

## Reuse first

- Use the DTO types from spec 01.

## Steps

1. Define the input type.
2. Implement the ordered decision.
3. Table-test every row and each priority conflict, such as suspended and paid at once.
4. Record what you created in `specs-saas-onboarding/inventory/10-onboarding-step.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingOnboardingStep.test.ts` passes and proves: every row of the table, and suspension beats payment, paid-pending beats a resumable draft, and an expired subscriber goes to ACCOUNT. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/10-onboarding-step.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Implemented `decideBillingOnboardingStep` and its plain-fact input/result types, reusing the spec 01 DTO unions. The function follows the architecture's first-match order, reports billing/catalog/trial-price unavailability and reconciliation reasons, and does no I/O or clock reads. Linked subscribers without access go to ACCOUNT, including expired subscribers; administrative restriction always takes precedence. Lifecycle fact gathering and wiring remain with spec 36.
- **2026-11-09** — Focused command `cd backend && npx vitest run src/services/billingOnboardingStep.test.ts`: **120 passed, 0 failed, 0 skipped**, 1 test file passed. Covers all decision rows and alternative triggers, every earlier/later decision-row pair, suspension versus payment, paid-pending versus resumable draft, expired subscribers, recovery reasons, verification and immutability. Full command `npm test --prefix backend`: **1,840 passed, 7 skipped, 0 failed**, 102 test files passed and 1 skipped. The existing persistence tests remain skipped; no real database verification was performed.
- **2026-11-09** — `cd backend && npx tsc --noEmit -p tsconfig.json` and `npm run build --prefix backend` both exited 0, with no errors or warnings. Build ran the existing Prisma client generation and TypeScript compilation only; no migrations. All verification commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. Verified the inventory fragment exists and documents all reusable exports. No application files or tests outside Owns changed; the spec's checklist and this Log were updated as requested, with Status and PROGRESS.md unchanged. No provider calls, real database access, deployment, issue/PR or git branch/commit/merge/push commands were used. Real Paddle and database behavior were not exercised and are unnecessary for this pure function.
