# Paddle research (read 2026-11-09)

Primary sources on developer.paddle.com plus the installed SDKs. Node SDK 3.10.0 and Paddle.js wrapper 1.6.5 were inspected in `node_modules`.

Caveat: `update-transaction`, `create-transaction`, the `update-price` existing-subscription question and parts of webhook ordering were partly read through a page summary. Treat "not stated" there as not confirmed.

## Inline checkout
Source: /build/checkout/build-branded-inline-checkout, /paddle-js/methods/paddle-checkout-open, /build/checkout/set-up-checkout-default-settings

- `displayMode: "inline"`, `frameTarget` (class name of container), `frameInitialHeight: 450` (recommended, number), `frameStyle` (CSS string, docs contradict themselves on required; always set it).
- Minimum width: 286px with checkout padding off, 312px with padding on.
- The frame must be sized so its footer message is visible.
- `variant`: `one-page`, `multi-page` (default), `express`.
- **The page must show**, because the frame has no breakdown: recurring interval and renewal total; what is purchased; subtotal, total tax, grand total with currency; the full frame including footer; a refund policy link if it differs from Paddle's standard.

## Paddle.Checkout.open
- Takes `items` or `transactionId`. `customer` takes `id` or `email`, never both.
- Settings in installed types: `displayMode, theme, locale, allowLogout, showAddDiscounts, showAddTaxId, showNonExpressPaymentMethods, frameTarget, frameStyle, frameInitialHeight, successUrl, allowedPaymentMethods, allowDiscountRemoval, variant`.
- Locales do not include Urdu.
- Which statuses a passed `transactionId` may have is not stated.

## Transactions
Source: /api-reference/transactions/update-transaction
- "You can cancel transactions that are draft, ready, billed, or past_due." When canceling, send only `status: "canceled"`.
- Draft or ready transactions can have items updated; send the complete list.
- Draft expiry: not stated.
- Installed status type: `draft | ready | billed | paid | completed | canceled | past_due`.
- List filters in installed types: `customerId[]`, `id[]`, `status[]`, `subscriptionId[]`, `origin[]`, `createdAt` comparators, `after`, `perPage`, `orderBy`. No custom-data filter, so correlation means reading `customData` on listed rows.

## Prices
Source: /api-reference/prices/update-price
- `trial_period` is object or null: "null for no trial period. Requires billing_cycle." Send both.
- Effect on existing subscriptions: not stated.

## Customers
Source: /api-reference/customers/create-customer, /errors/customers/customer_already_exists, /api-reference/customers/list-customers
- Conflict: HTTP 409, `error.code = customer_already_exists`, `error.type = request_error`, detail "Customer email conflicts with existing customer ID ctm_...".
- "Email addresses are unique regardless of letter case, and archived customers still count."
- Recover with list by exact `email`, `status=active,archived`.
- Create accepts `custom_data`, `name`, `email`, `locale`.

## SDK errors
`esm/internal/errors/generic.js`: `ApiError extends Error` with `type, code, detail, documentationUrl, errors, retryAfter`. No HTTP status field. Network failures are not `ApiError`. HTTP client uses `fetch` with no signal, so calls have no timeout of their own.

## Events
Source: /paddle-js/events and event pages; names from installed `CheckoutEventNames`.
- With `data.transaction_id`: `checkout.loaded` (once per checkout), `checkout.completed`, `checkout.payment.failed`, `checkout.closed`, `checkout.updated`, `checkout.items.updated`, `checkout.customer.*`, `checkout.payment.selected|initiated`.
- Flat shape, no data: `checkout.error` (`front-end_error` or `api_error`, opening failed) and `checkout.payment.error` (for example `no_payment_methods_available`).
- `checkout.loaded` data includes `items`, `totals`, `recurring_totals`, `currency_code`, `customer`, `settings`.
- `checkout.closed` in inline mode: not documented; do not depend on it.

## Sandbox
Source: /sdks/sandbox, /concepts/payment-methods/card
- Valid no 3DS `4242 4242 4242 4242`; valid 3DS `4000 0038 0000 0446`; declined `4000 0000 0000 0002`.
- Any cardholder name, any future expiry. CVC not stated on the card page; the inline tutorial uses `100`.
- Sandbox rejects real cards. Sandbox checkout opens on any domain including localhost. Client tokens start `test_`.
- A default payment link is required: "You can't create transactions without it."

## Webhooks
Source: /webhooks/about/how-webhooks-work
- Typical order: transaction.created, customer.created, address.created, transaction.paid, subscription.created, transaction.completed. Not guaranteed; use `occurred_at`, dedupe on `event_id`.
- `subscription.activated` is not in the documented checkout sequence and must not be required.
