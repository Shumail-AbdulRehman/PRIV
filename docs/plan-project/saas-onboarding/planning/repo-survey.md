# Repo survey, 2026-11-09

Baseline commit `805dd40` with uncommitted design and planning work. Existing specs: `specs/` (00 to 41), `specs-billing-onboarding/` (44 to 63, implemented), `specs-billing-checkout-repair/` (64 to 85, only its decision done).

## Current defects confirmed in code

- `SignUpPage.tsx` compares against the message "Manager with this email already exists", but the server now sends different text, so duplicate emails get a generic error.
- Signup does not lowercase email, while Paddle treats email case-insensitively.
- `BillingPaymentPage` only opens an overlay, and one busy flag disables payment and status recovery together.
- `useBillingCheckout` drops `checkout.error`, which has no transaction ID, and treats `Checkout.open` as loaded.
- Billing requests and the Paddle script load have no time limits.
- A failed Paddle customer or transaction create leaves a reservation open forever.
- `callProvider` discards Paddle errors, and the error handler logs nothing for 500s.
- A session read failure signs the user out.
- `req.ip` is wrong behind a proxy because `trust proxy` is unset.
- Frontend Vitest only includes `src/**/*.test.tsx`.
