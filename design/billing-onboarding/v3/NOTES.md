# v3 — impeccable review and polish

Status: pending owner approval. Copied from v2; v1 and v2 remain unchanged. Real application source has not been edited.

## Retained direction

Current blue/slate/Inter identity, existing mark, flat capacity comparison, selected-plan receipt, quiet surfaces and English/Urdu support. This is an operational setup flow. Provider card collection stays in Paddle. Prototype amounts, billing dates and usage are illustrative, labelled in the review strip.

## Review batch

Two independent reviews were followed by one focused correction batch:

- Put the compact phone price/continue block before included features. Put selected amount and sandbox test-card guidance before the checkout action.
- Isolate usage ratios and localize billing periods in Urdu; preserve typed account fields and keyboard focus when changing language.
- Give native plan radios complete accessible names including capacity units and price, plus the owner-seat note.
- Separate known checkout-open failure from uncertain payment submission. Uncertain recovery offers status checking without a new payment action.
- Make account, confirmed and existing-subscriber footers truthful; pending progress says Confirming. Help opens in context and returns without losing the current step.
- Increase support/payment copy to readable sizes, keep language/interval/modal controls at 48px, and remove narrow-screen progress overflow.
- Add loading and unavailable plan previews without fabricated amounts or an enabled purchase action.

Reviewer reports and focused verdicts are under `docs/plan-project/billing-onboarding/research/`. Browser evidence and local interaction results are in `design/billing-onboarding/evidence/v3/` and reviewer subfolders.

## Motion retained from v2

Primary action press: transform .985, 140ms, existing cubic-bezier(.23,1,.32,1). Native modal entrance: opacity/scale .97→1, 220ms; backdrop opacity 180ms. Exit is immediate for prompt focus release. All motion is absent under prefers-reduced-motion. Prices, allowances, status text and progress reading remain still. No animation library is needed. See preserved v2/NOTES.md for the complete table.

## Detector and limits

The initial review ran the Impeccable detector once. Inter's generic-font warning is accepted because Inter is the fixed existing brand input. Preview-strip small-text flags are outside the product; payment/support copy was increased. The browser checks cover local prototype behavior, not actual Paddle rendering, session cookies, webhooks or deployed entitlement. Provider styling is illustrative and cannot be promised pixel-for-pixel.

Approval of this design permits transcribing its tokens into feature steering documents; it does not certify the deployed billing flow or authorize real payments.
