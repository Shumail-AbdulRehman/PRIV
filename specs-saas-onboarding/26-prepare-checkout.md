# Spec 26 — Prepare and replace checkout

**Status:** Not started
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

- [ ] `cd backend && npx vitest run src/services/billingCheckout.service.test.ts` passes and proves: one draft for two concurrent requests; reuse; replace cancels before creating; paid draft blocks; uncertain cancel changes nothing; rejected allows retry; timeout stays open. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/26-prepare-checkout.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
