# Spec 27 — Server confirmation of a paid checkout

**Status:** Not started
**Depends on:** Spec 08, Spec 09, Spec 18
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingConfirm.service.ts`, `backend/src/services/billingConfirm.service.test.ts`, `specs-saas-onboarding/inventory/27-confirm-checkout.md`
**Reuses:** `backend/src/services/billingProvider.ts` (spec 08), `backend/src/services/paddleFulfillment.service.ts` (spec 18), `backend/src/services/billingReservations.service.ts` (spec 09)

## Goal

Activate a subscription as soon as Paddle says it is paid, even if the webhook is late or points elsewhere.

## Scope

- Uses only the latest READY reservation for the current company. The client sends nothing.
- Read the transaction from Paddle and verify customer, reservation custom data, one item, quantity one and a configured price.
- `draft` or `ready` returns `NOT_PAID`. `paid`, `billed` or `completed` with no subscription yet returns `PROCESSING`. A `canceled` draft returns `NOT_PAID`.
- With a subscription: read it, verify customer and configured price, then apply through the shared fulfilment function and return `ACTIVE` if access is now allowed.
- No checkout returns `NO_CHECKOUT`. An uncertain Paddle read returns 503, and the client keeps waiting.
- Any mismatch returns `PROCESSING`, logs a code and grants nothing.
- Safe to call repeatedly.

## Explicit non-scope

- Polling → spec 22.
- Route wiring → spec 39.

## Reuse first

- Write access only through spec 18.

## Steps

1. Build verification.
2. Add status handling.
3. Call the shared fulfilment.
4. Test each status, each mismatch and repeated calls.
5. Record what you created in `specs-saas-onboarding/inventory/27-confirm-checkout.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/billingConfirm.service.test.ts` passes and proves: only the current company's reservation is used; a foreign customer, custom data or price grants nothing; paid with no subscription is PROCESSING; active is idempotent; a suspended company stays restricted. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/27-confirm-checkout.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
