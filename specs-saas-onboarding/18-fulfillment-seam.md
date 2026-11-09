# Spec 18 — Shared subscription fulfilment

**Status:** Not started
**Depends on:** Spec 01
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/paddleFulfillment.service.ts`, `backend/src/services/paddleFulfillment.service.test.ts`, `specs-saas-onboarding/inventory/18-fulfillment-seam.md`
**Reuses:** `backend/src/services/accountAccess.service.ts`

## Goal

Let a server read of Paddle apply a subscription through the exact same code path as a signed webhook.

## Scope

- Export a function that applies provider subscription data for a known customer, under the same company and customer locks and the same version check.
- It writes no `PaddleWebhookEvent` row, so a later real webhook still processes.
- An older webhook arriving afterwards cannot regress newer data.
- Webhook behaviour is otherwise unchanged. Transaction webhooks stay accepted in any order.
- New `trialing` subscriptions are accepted without crashing, so an untouched old price cannot break a paying user, but a new checkout cannot select a trial price (spec 15).

## Explicit non-scope

- Deciding when to call it → spec 27.
- Webhook endpoint changes → spec 39.

## Reuse first

- Reuse `handleSubscription` and `syncCompanyAccess`. Do not write access anywhere else.

## Steps

1. Extract the shared function.
2. Add the adapter from the SDK `Subscription` entity to the shape the handler needs, checking the installed types.
3. Test both entry paths give identical company state.
4. Test ordering.
5. Record what you created in `specs-saas-onboarding/inventory/18-fulfillment-seam.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/paddleFulfillment.service.test.ts` passes and proves: webhook and server-read paths produce identical access; a later webhook still applies; an older one does not regress data; a mismatched customer is refused. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/18-fulfillment-seam.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
