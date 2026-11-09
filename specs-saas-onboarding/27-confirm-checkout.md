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

- [x] `cd backend && npx vitest run src/services/billingConfirm.service.test.ts` passes and proves: only the current company's reservation is used; a foreign customer, custom data or price grants nothing; paid with no subscription is PROCESSING; active is idempotent; a suspended company stays restricted. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/27-confirm-checkout.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Implemented `confirmBillingCheckout(actor, deps?)` using the existing provider gateway, company-scoped reservation reader, shared subscription fulfilment and fresh lifecycle reader. It verifies the saved transaction's identity, customer, reservation metadata, one item/quantity one and exact configured price; handles every transaction status; verifies the linked subscription before fulfilment; returns sanitized 503 for failed provider reads; and logs mismatches by fixed code only. A Company lock protects the final reservation/owner/linkage recheck and shared fulfilment, so a checkout replaced during provider reads cannot activate. Repeated reads retain provider version ordering and administrative restrictions. No access, webhook marker or reservation fact is written outside the shared fulfilment seam.
- **2026-11-10** — All Done commands ran and passed with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. Optional persistence/CI database variables and `DIRECT_URL` were unset for the whole suite and build. Focused command: **83 passed, 0 failed, 0 skipped** (rerun after fixture corrections). Whole `npm test --prefix backend`: **2,303 passed, 7 skipped, 0 failed**; **108 files passed, 1 skipped**. The skipped persistence tests require an explicitly isolated database and were not run. Both `npx tsc --noEmit -p tsconfig.json` and `npm run build --prefix backend` exited 0 with no errors or warnings. The build generated the Prisma client and compiled TypeScript; it did not migrate or connect to a database. The initial focused run found a TypeScript assertion line-break syntax error, and the first type check found two test-fixture typing issues; these were corrected before the passing runs above.
- **2026-11-10** — Added and inspected `inventory/27-confirm-checkout.md`. Tests use real installed SDK entities and injected in-memory database/provider fixtures, exercising the actual reservation, fulfilment and lifecycle/access implementations. Coverage includes current/latest reservation selection, foreign and malformed facts/mirrors, all transaction statuses, transaction/subscription mismatches, sanitized provider errors, effective subscription windows, idempotence, stale provider versions, suspended/inactive companies and changes during provider reads. No tests outside Owns needed edits. Live Paddle, real SQL concurrency and HTTP wiring were not verified; they are not required for this spec, and route wiring remains spec 39. No issue/PR, commit, branch operation, deployment, migration or real provider/database call was made. Status and PROGRESS.md were left unchanged as requested.
