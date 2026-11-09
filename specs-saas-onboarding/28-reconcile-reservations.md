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

- [ ] `cd backend && npx vitest run src/services/billingReconcile.service.test.ts` passes and proves: grace leaves it alone; each match type; legacy no-custom-data adoption; full listing with no match clears; page cap and duplicates stay unresolved; no create or cancel is ever called. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/28-reconcile-reservations.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
