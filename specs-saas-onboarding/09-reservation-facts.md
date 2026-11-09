# Spec 09 — Reservation facts

**Status:** Not started
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingReservations.service.ts`, `backend/src/services/billingReservations.service.test.ts`, `specs-saas-onboarding/inventory/09-reservation-facts.md`
**Reuses:** `backend/src/services/auditLog.service.ts`, `backend/src/services/billingLifecycle.service.ts`, `ARCHITECTURE.md#data-model`

## Goal

Own all reading and writing of billing reservation facts, including the new failed and cancelled facts that stop a reservation staying open forever.

## Scope

- Move the existing reserve, inspect and pending logic here, preserving company locking.
- Add `CUSTOMER_CREATE_FAILED`, `CHECKOUT_FAILED` and `CHECKOUT_CANCELED`.
- A reservation is closed by any matching `READY`, `FAILED` or `CANCELED` fact.
- An open reservation younger than the 120 second grace is reported as in progress. Older is reported as needing reconciliation.
- A new reservation is refused while one is open, and allowed once the latest is closed.

## Explicit non-scope

- Calling Paddle → spec 17.
- Deleting the old copy from `billingLifecycle.service.ts` → spec 36.

## Reuse first

- Use `writeAuditLog` and the existing `SELECT ... FOR UPDATE` on `Company`.
- Facts are append-only. Never update or delete an audit row.

## Steps

1. Read the current logic in `billingLifecycle.service.ts`.
2. Create the module with an injected `db` and `now`.
3. Add the closure rule and grace period.
4. Port the existing resume logic with the new closed states.
5. Test all combinations.
6. Record what you created in `specs-saas-onboarding/inventory/09-reservation-facts.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/billingReservations.service.test.ts` passes and proves: each fact closes its own reservation only; grace boundaries; a foreign or mismatched READY stays open; a failed reservation allows a new one; concurrent reserve respects the lock. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/09-reservation-facts.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
