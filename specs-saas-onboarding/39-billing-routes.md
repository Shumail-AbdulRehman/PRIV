# Spec 39 — Billing HTTP routes

**Status:** Not started
**Depends on:** Spec 27, Spec 28, Spec 36
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/routes/billingLifecycle.route.ts`, `backend/src/routes/billingLifecycle.route.test.ts`, `specs-saas-onboarding/inventory/39-billing-routes.md`
**Reuses:** `backend/src/services/billingCheckout.service.ts` (spec 26), `backend/src/services/billingConfirm.service.ts` (spec 27), `backend/src/services/billingReconcile.service.ts` (spec 28)

## Goal

Expose confirm and reconcile, and point checkout at the new service.

## Scope

- Add `POST /checkout/confirm` and `POST /checkout/reconcile`, with strict empty bodies.
- Keep owner auth, `no-store` and current routes.
- Stable error codes reach the client.
- The webhook mount is unchanged.

## Explicit non-scope

- Business logic → spec 26.
- Rate limiting these routes → spec 43.

## Reuse first

- Keep the router-level `verifyOwnerBillingJwt` and `authorize`.

## Steps

1. Add routes.
2. Test auth, body strictness and shape.
3. Record what you created in `specs-saas-onboarding/inventory/39-billing-routes.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/routes/billingLifecycle.route.test.ts` passes and proves: manager and staff are refused; extra body fields are rejected; results carry a lifecycle; responses are no-store. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/39-billing-routes.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
