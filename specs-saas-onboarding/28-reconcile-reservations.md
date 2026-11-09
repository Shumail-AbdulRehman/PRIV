# Spec 28 — Repair stuck reservations

**Status:** Not started
**Depends on:** Spec 17
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingReconcile.service.ts`, `backend/src/services/billingReconcile.service.test.ts`, `specs-saas-onboarding/inventory/28-reconcile-reservations.md`
**Reuses:** `backend/src/services/billingProvider.ts` (spec 08), `backend/src/services/billingReservations.service.ts` (spec 09), `backend/src/services/billingCustomer.service.ts` (spec 17)

## Goal

Resolve an open reservation from Paddle's real state, so no owner stays locked out.

## Scope

- Inside the 120 second grace, return `IN_PROGRESS` and change nothing.
- Open customer reservation: list by exact email including archived. A match on reservation custom data becomes READY. A match without custom data follows invariant 6, so existing stuck accounts recover. No match closes it with `FAILED`. A conflict returns `CONFLICT`.
- Open checkout reservation: page through the customer's transactions, capped at 10 pages, matching `checkoutReservationId` in custom data. `draft` or `ready` writes READY and returns `RESUMABLE`. Paid states return `PAID`. `canceled` writes `CHECKOUT_CANCELED` and returns `CLEARED`. A full listing with no match writes `FAILED` and returns `CLEARED`. Hitting the cap or an uncertain read returns `UNRESOLVED`.
- Two matches return `UNRESOLVED`.
- Never creates or cancels anything at Paddle. Repeat calls give the same result.

## Explicit non-scope

- Recovery screen → spec 38.
- Route wiring → spec 39.

## Reuse first

- Write facts only through spec 09.

## Steps

1. Build customer reconciliation.
2. Build checkout reconciliation.
3. Test each path and repeats.
4. Record what you created in `specs-saas-onboarding/inventory/28-reconcile-reservations.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/billingReconcile.service.test.ts` passes and proves: grace leaves it alone; each match type; legacy no-custom-data adoption; full listing with no match clears; page cap and duplicates stay unresolved; no create or cancel is ever called. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/28-reconcile-reservations.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Implemented `reconcileBillingReservations` with injected database, read-only provider and clock. Reuses spec 09 for reservation reads and every append-only fact. Grace makes no changes; exact-email customer recovery supports reservation metadata and guarded legacy adoption, atomic mirror/link/READY writes, stable conflict facts and exhaustive no-match failure. Follows spec 17's linkage rules without calling its create-capable entry point. Checkout recovery exhausts customer-scoped listings through the gateway's five-page batches, continuing by cursor up to ten pages. Draft/ready, paid/billed/completed, canceled and proven absent results close with the appropriate facts; ambiguous, incomplete, failed or unsafe reads remain unresolved. Company locking, fresh owner checks, version preservation, concurrent repeats and rollback prevent stale or partial repairs. No subscription access is granted.
- **2026-11-10** — Final focused command `cd backend && npx vitest run src/services/billingReconcile.service.test.ts`: **80 passed, 0 failed, 0 skipped**. Includes a real gateway with a fake SDK collection proving exactly ten provider pages, plus provider write spies checked in every case. The first focused run had 77 passes and 3 test-table failures; corrected array parameterization and reran successfully. The final rerun also passed all 80 cases.
- **2026-11-10** — `npm test --prefix backend`: **2,300 passed, 7 skipped, 0 failed** across **108 passed files and 1 skipped file**. The skipped persistence cases require `LAUNCH_PERSISTENCE_TEST_DATABASE_URL`, which was absent. `cd backend && npx tsc --noEmit -p tsconfig.json` passed with **0 errors** after correcting one inferred optional-outcome narrowing error. `npm run build --prefix backend` passed, including Prisma client generation and TypeScript compilation, with no warnings reported. All commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`; build also set `DIRECT_URL` to the same unusable URL. Backend has no lint script.
- **2026-11-10** — Wrote and inspected `inventory/28-reconcile-reservations.md`; source, test and fragment whitespace checks passed, as did `git diff --check`. No test-only scope exception was needed. Changes are confined to this spec's owned service, test and inventory fragment, plus this required Log/checklist update. Status and tracker were left unchanged. No real Paddle or database access, migrations, deployment, issue/PR, commit, merge, push or branch commands. Live provider/database behavior was not verified; route wiring and recovery UI remain with their assigned specs.
