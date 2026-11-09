# Spec 17 — One Paddle customer per company

**Status:** Not started
**Depends on:** Spec 08, Spec 09
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingCustomer.service.ts`, `backend/src/services/billingCustomer.service.test.ts`, `specs-saas-onboarding/inventory/17-ensure-customer.md`
**Reuses:** `backend/src/services/billingProvider.ts` (spec 08), `backend/src/services/billingReservations.service.ts` (spec 09), `ARCHITECTURE.md#invariants`

## Goal

Guarantee a company ends up linked to exactly one Paddle customer, without ever getting permanently stuck.

## Scope

- Reuse a linked customer when one exists.
- Otherwise reserve, then create with `custom_data` holding the company and reservation IDs.
- On `REJECTED`, write `CUSTOMER_CREATE_FAILED` so the owner can retry.
- On `CUSTOMER_EXISTS`, confirm with an exact email list that includes archived customers. Adopt only under invariant 6, writing `READY` with `adopted`. Otherwise write `FAILED` with `EMAIL_CONFLICT`.
- An archived match is never adopted.
- On `UNCERTAIN`, leave the reservation open for reconciliation.
- Email comparison ignores case, as Paddle does.

## Explicit non-scope

- Repairing an old open reservation → spec 28.
- Creating transactions → spec 26.

## Reuse first

- Use the facts module for every write.
- Keep the existing `PaddleCustomer` upsert and company lock.

## Steps

1. Move the customer branch out of `createBillingCheckout`.
2. Add `custom_data`.
3. Add each failure path.
4. Test all adoption conditions.
5. Record what you created in `specs-saas-onboarding/inventory/17-ensure-customer.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingCustomer.service.test.ts` passes and proves: reuse; creation sends custom data; rejected allows retry; adoption succeeds only when exact, active, unlinked and sandbox or verified; linked-elsewhere and archived become conflicts; timeout stays open. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/17-ensure-customer.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Added `ensureBillingCustomer` with linked-customer reuse, company/reservation custom data, retryable proven rejections, exhaustive exact-email conflict confirmation including archived customers, invariant-6 adoption, and open holds for uncertain outcomes. Retained the Company lock and PaddleCustomer upsert; mirror/link/READY commit together through the shared facts service. Final linkage rechecks ownership, email, verification, suspension and both mirror/canonical tenant links.
- **2026-11-09** — Scope boundary: extracted the customer logic into the owned additive service. Editing/removing the branch in `billingLifecycle.service.ts` is outside Owns, so that part was left for specs 26/36, consistent with architecture invariant 16 and the existing gateway/facts/catalog rollout. No application code outside Owns or tests under the guide's exception were changed. Status and PROGRESS.md were left unchanged; issues/PRs and Git write operations were skipped per run instructions.
- **2026-11-09** — Verification used `DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null`. `cd backend && npx vitest run src/services/billingCustomer.service.test.ts`: **48 passed, 0 failed, 0 skipped** (also rerun after completing SDK fixture fields). `npm test --prefix backend`: **2,105 passed, 7 skipped, 0 failed**, **106 files passed, 1 skipped**; the skipped SQL persistence tests require an isolated database and were not enabled. Stateful fakes exercise the real facts module, lock serialization and transaction rollback; a real gateway with an injected hung customer client proves its 15-second timeout and late success leave the hold open, even after the 120-second grace.
- **2026-11-09** — `cd backend && npx tsc --noEmit -p tsconfig.json`: passed with **0 errors** after fixing the test fixture's required SDK `marketingConsent`/`importMeta` fields caught by the first type-check attempt. `npm run build --prefix backend`: passed (Prisma generation and TypeScript compilation), with no warnings reported. Backend has no lint script. Read and checked the nonempty inventory fragment and ran `git diff --check` successfully. No real Paddle or database checks, deployments or migrations ran; real provider/SQL behaviour remains unverified by this unit-only spec.
