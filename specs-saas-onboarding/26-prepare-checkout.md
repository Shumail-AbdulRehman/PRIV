# Spec 26 — Prepare and replace checkout

**Status:** Done
**Depends on:** Spec 15, Spec 17
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingCheckout.service.ts`, `backend/src/services/billingCheckout.service.test.ts`, `specs-saas-onboarding/inventory/26-prepare-checkout.md`
**Reuses:** `backend/src/services/billingCustomer.service.ts` (spec 17), `backend/src/services/billingCatalog.service.ts` (spec 15), `backend/src/services/billingReservations.service.ts` (spec 09)

## Goal

Create or reuse the single draft transaction for an owner, and let them switch plan without any risk of paying twice.

## Scope

- Strict `{plan, interval}` input. Keep existing owner, suspension, billing-enabled and verification guards.
- Same plan with an open draft returns it with `reused`.
- A different plan: read the draft from Paddle. If `draft` or `ready`, cancel it with `status: canceled` alone, record `CHECKOUT_CANCELED`, then create the new one and return `replaced`.
- If the draft is paid, billed or completed, return 409 with code `CHECKOUT_PAID`. Never create another.
- A cancel that is uncertain leaves the old draft and returns 503.
- Draft creation carries `checkoutReservationId` in custom data.
- `REJECTED` writes `CHECKOUT_FAILED`. `UNCERTAIN` leaves the reservation open.
- An existing linked subscription returns 409 and points to the portal.

## Explicit non-scope

- Repairing open reservations → spec 28.
- Route wiring → spec 39.
- Confirmation → spec 27.

## Reuse first

- Use the gateway and facts modules for everything.

## Steps

1. Move the transaction branch here.
2. Add replace.
3. Add failure handling.
4. Test each path, and concurrency with a shared fake.
5. Record what you created in `specs-saas-onboarding/inventory/26-prepare-checkout.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingCheckout.service.test.ts` passes and proves: one draft for two concurrent requests; reuse; replace cancels before creating; paid draft blocks; uncertain cancel changes nothing; rejected allows retry; timeout stays open. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/26-prepare-checkout.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

### 2026-11-10

- Added the additive `billingCheckout.service.ts` entry point using the existing customer, trial-free catalog, gateway and reservation-facts services. Strict selection and owner/company/verification/configuration guards run before purchase; linked subscribers receive 409 directing them to the portal. The legacy lifecycle branch and route wiring remain with specs 36/39, outside this spec's ownership.
- Matching drafts return `reused`; plan or interval changes perform an exact provider read, cancel with `{ status: 'canceled' }` alone, append `CHECKOUT_CANCELED` and reserve before creating the replacement. A company lock spans cancellation and the replacement reservation; its transaction budget is 40 seconds for two bounded gateway calls. New drafts include `checkoutReservationId`; results always send both flags.
- Paid/billed/completed transactions return `CHECKOUT_PAID`. Uncertain cancellation/read results leave local facts untouched and never start another purchase. Proven create rejection/rate limiting appends FAILED and allows retry; uncertain creates, invalid responses and lost READY persistence leave the reservation open. Subscription access is never granted here.
- Focused command: **77 passed, 0 failed, 0 skipped**. The shared stateful fake exercises real customer/catalog/facts helpers, lock serialization, rollback, provider cancellation order, competing prepares/replacements, paid races, rejection retry, real gateway create/cancel deadlines and late success, correlation and authorization guards.
- Whole backend command: **2,297 passed, 7 skipped, 0 failed**, across **108 passing files and 1 skipped file**. The skipped SQL persistence cases require their explicitly isolated test database and were not enabled.
- Backend `npx tsc --noEmit -p tsconfig.json` passed with **0 errors**. `npm run build --prefix backend` passed. No backend lint script exists. Build output included Prisma's upgrade advisory; no upgrade was performed. Inventory fragment existence/content and `git diff --check` passed.
- Verification corrections: the first focused run had **76 passed, 1 failed** because its replacement-concurrency test allowed the first operation to finish before observing the competing reservation. The test now explicitly overlaps cancellation and creation; final counts above are from passing reruns. Initial type errors in the new dependency seam/result narrowing were corrected within owned files. The first full run had **2,294 passed, 7 skipped and 1 failed import suite** while shared Prisma client generation overlapped execution; after generation completed, the exact whole-suite command passed with the final counts above.
- Created `inventory/26-prepare-checkout.md`. No tests outside Owns needed edits. Status and PROGRESS were left unchanged; issue/PR and commit operations were skipped per run instructions. Every backend test/type/build command used `DATABASE_URL='postgresql://none:none@127.0.0.1:1/none'` and `DOTENV_CONFIG_PATH=/dev/null`. No real Paddle or database was used; no migrations, deploys or provider-side validation ran. Real SQL locking and real Paddle behavior remain unverified by this mock-only spec run.

- **2026-11-10** — Removed explicit draft status from checkout transaction creation; retained all request fields, omitted address and kept returned-draft validation. Updated the exact request expectation and added an explicit no-status assertion in `billingCheckout.service.test.ts`. Also updated the `billingProvider.test.ts` create fixture and its exact forwarded-arguments expectation to omit draft status, as requested by the backend-wide search. Recorded the create-status rule in `docs/plan-project/saas-onboarding/research/paddle.md`. Focused `npx vitest run src/services/billingCheckout.service.test.ts src/services/paddleSandboxProbe.test.ts`: **101 passed, 0 failed, 0 skipped**, **2 passing files**. `npm test --prefix backend`: **2,540 passed, 7 skipped, 0 failed**, **113 passing files and 1 skipped file** (SQL persistence tests disabled). `cd backend && npx tsc --noEmit -p tsconfig.json` and `npm run build --prefix backend` both passed with **0 errors**; the build generated Prisma Client only. Every command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`; SQL persistence opt-in was unset for tests. No real Paddle calls, probe/trial scripts, database access, .env reads, deploys, migrations or git commands. Status lines and `PROGRESS.md` unchanged.
