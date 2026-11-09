# Account, plan and checkout flow — progress tracker

The single source of truth for where this work stands. It outranks any assumption from an earlier session.

| # | Spec | Status | Depends on | Model | Issue | Notes |
|---|------|--------|------------|-------|-------|-------|
| 00 | [Decisions](./00-saas-flow-decisions.md) | Done | — | Heavy | — | Decision recorded |
| 01 | [Billing lifecycle and outcome contract](./01-lifecycle-contract.md) | Not started | 00 | Heavy | — |  |
| 02 | [Safe error logging and trusted proxy](./02-operational-logging.md) | Not started | 00 | Standard | — |  |
| 03 | [Flow shell, tokens and motion](./03-flow-shell.md) | Not started | 00 | Heavy | — |  |
| 04 | [English and Urdu copy for the flow](./04-urdu-dictionary.md) | Not started | 00 | Light | — |  |
| 05 | [New Hygene Ops logo](./05-logo-rollout.md) | Not started | 00 | Light | — |  |
| 06 | [Next-step route map](./06-onboarding-routes.md) | Not started | 01 | Standard | — |  |
| 07 | [Pure checkout state machine](./07-checkout-machine.md) | Not started | 01 | Standard | — |  |
| 08 | [Paddle gateway with time limits](./08-paddle-gateway.md) | Not started | 01, 02 | Heavy | — |  |
| 09 | [Reservation facts](./09-reservation-facts.md) | Not started | 01 | Heavy | — |  |
| 10 | [Server next-step decision](./10-onboarding-step.md) | Not started | 01 | Standard | — |  |
| 11 | [Authentication rate limiter](./11-auth-rate-limit.md) | Not started | 02 | Standard | — |  |
| 12 | [Time-limited billing requests](./12-billing-transport.md) | Not started | 01 | Standard | — |  |
| 13 | [Paddle.js loading and normalized events](./13-paddle-sdk-inline.md) | Not started | 01 | Heavy | — |  |
| 14 | [Real Paddle sandbox probe](./14-sandbox-probe.md) | Not started | 08 | Standard | — |  |
| 15 | [Trial-free plan catalog](./15-trial-free-catalog.md) | Not started | 08 | Standard | — |  |
| 16 | [Remove trials from sandbox prices](./16-trial-removal-script.md) | Not started | 08 | Standard | — |  |
| 17 | [One Paddle customer per company](./17-ensure-customer.md) | Not started | 08, 09 | Heavy | — |  |
| 18 | [Shared subscription fulfilment](./18-fulfillment-seam.md) | Not started | 01 | Heavy | — |  |
| 19 | [Signup rules](./19-signup-rules.md) | Not started | 11 | Heavy | — |  |
| 20 | [Email and password login](./20-unified-login.md) | Not started | 11 | Heavy | — |  |
| 21 | [Owner checkout controller](./21-checkout-controller.md) | Not started | 07, 12, 13 | Heavy | — |  |
| 22 | [Activation polling](./22-activation-polling.md) | Not started | 12 | Heavy | — |  |
| 23 | [Keep people signed in through outages](./23-session-resilience.md) | Not started | 06 | Heavy | — |  |
| 24 | [Order summary](./24-order-summary.md) | Not started | 03, 04 | Standard | — |  |
| 25 | [Inline Paddle frame](./25-paddle-frame.md) | Not started | 03, 13, 14 | Standard | — |  |
| 26 | [Prepare and replace checkout](./26-prepare-checkout.md) | Not started | 15, 17 | Heavy | — |  |
| 27 | [Server confirmation of a paid checkout](./27-confirm-checkout.md) | Not started | 08, 09, 18 | Heavy | — |  |
| 28 | [Repair stuck reservations](./28-reconcile-reservations.md) | Not started | 17 | Heavy | — |  |
| 29 | [Sign-in screen](./29-login-screen.md) | Not started | 03, 04, 06 | Standard | — |  |
| 30 | [Create account screen](./30-signup-screen.md) | Not started | 03, 04, 06 | Standard | — |  |
| 31 | [Forgot password screens](./31-account-recovery-screens.md) | Not started | 03, 04 | Standard | — |  |
| 32 | [Staff web handoff screen](./32-staff-web-handoff.md) | Not started | 03, 04 | Light | — |  |
| 33 | [Choose plan screen](./33-plan-screen.md) | Not started | 03, 04, 06 | Standard | — |  |
| 34 | [Public pricing links and trial copy](./34-public-pricing.md) | Not started | 06 | Light | — |  |
| 35 | [Confirming and ready screens](./35-confirmation-screens.md) | Not started | 03, 04, 22 | Heavy | — |  |
| 36 | [Assemble the lifecycle service](./36-lifecycle-assembly.md) | Not started | 10, 26 | Heavy | — |  |
| 37 | [Payment screen](./37-payment-screen.md) | Not started | 21, 24, 25 | Heavy | — |  |
| 38 | [Recovery screen](./38-recovery-screen.md) | Not started | 03, 04, 12 | Standard | — |  |
| 39 | [Billing HTTP routes](./39-billing-routes.md) | Not started | 27, 28, 36 | Standard | — |  |
| 40 | [Routes and workspace entry](./40-route-composition.md) | Not started | 23, 29, 30, 33, 35, 37, 38 | Heavy | — |  |
| 41 | [Configuration check and runbook](./41-configuration-runbook.md) | Not started | 16, 39 | Standard | — |  |
| 42 | [End-to-end suite](./42-e2e-suite.md) | Not started | 01-41 | Heavy | — |  |
| 43 | [Verification pass](./43-verification-pass.md) | Not started | 00-42 | Heavy | — |  |

## Status legend

Not started · In progress · Blocked · Done

## Log

- **2026-11-09** — Design approved. Steering docs and 44 specs written. Only the decision spec is Done. No application code has changed, and no real payment has been run.
