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

- [ ] `cd backend && npx vitest run src/services/billingCustomer.service.test.ts` passes and proves: reuse; creation sends custom data; rejected allows retry; adoption succeeds only when exact, active, unlinked and sandbox or verified; linked-elsewhere and archived become conflicts; timeout stays open. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/17-ensure-customer.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
