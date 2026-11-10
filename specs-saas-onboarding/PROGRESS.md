# Account, plan and checkout flow — progress tracker

The single source of truth for where this work stands. It outranks any assumption from an earlier session.

| # | Spec | Status | Depends on | Model | Issue | Notes |
|---|------|--------|------------|-------|-------|-------|
| 00 | [Decisions](./00-saas-flow-decisions.md) | Done | — | Heavy | — | Decision recorded |
| 01 | [Billing lifecycle and outcome contract](./01-lifecycle-contract.md) | Done | 00 | Heavy | — | DTOs/parser verified; 128 focused, 1597 backend, 81 + 832 frontend passed; 7 SQL skipped |
| 02 | [Safe error logging and trusted proxy](./02-operational-logging.md) | Done | 00 | Standard | — | Safe logs/proxy/listen handling; 26 + 60 focused, 1642 backend passed; 7 SQL skipped; types/build passed |
| 03 | [Flow shell, tokens and motion](./03-flow-shell.md) | Done | 00 | Heavy | — | 28 focused; 81 Node + 860 Vitest passed; types/lint/build passed; responsive/RTL/reduced motion inspected |
| 04 | [English and Urdu copy for the flow](./04-urdu-dictionary.md) | Done | 00 | Light | — | Run by the spec runner; see spec Log |
| 05 | [New Hygene Ops logo](./05-logo-rollout.md) | Done | 00 | Light | — | Run by the spec runner; see spec Log |
| 06 | [Next-step route map](./06-onboarding-routes.md) | Done | 01 | Standard | — | Merged by hand after a spec-file conflict; see spec Log |
| 07 | [Pure checkout state machine](./07-checkout-machine.md) | Done | 01 | Standard | — | Run by the spec runner; see spec Log |
| 08 | [Paddle gateway with time limits](./08-paddle-gateway.md) | Done | 01, 02 | Heavy | — | Run by the spec runner; see spec Log |
| 09 | [Reservation facts](./09-reservation-facts.md) | Done | 01 | Heavy | — | Run by the spec runner; see spec Log |
| 10 | [Server next-step decision](./10-onboarding-step.md) | Done | 01 | Standard | — | Run by the spec runner; see spec Log |
| 11 | [Authentication rate limiter](./11-auth-rate-limit.md) | Done | 02 | Standard | — | Run by the spec runner; see spec Log |
| 12 | [Time-limited billing requests](./12-billing-transport.md) | Done | 01 | Standard | — | Run by the spec runner; see spec Log |
| 13 | [Paddle.js loading and normalized events](./13-paddle-sdk-inline.md) | Done | 01 | Heavy | — | Run by the spec runner; see spec Log |
| 14 | [Real Paddle sandbox probe](./14-sandbox-probe.md) | Done | 08 | Standard | — | Run by the spec runner; see spec Log |
| 15 | [Trial-free plan catalog](./15-trial-free-catalog.md) | Done | 08 | Standard | — | Run by the spec runner; see spec Log |
| 16 | [Remove trials from sandbox prices](./16-trial-removal-script.md) | Done | 08 | Standard | — | Run by the spec runner; see spec Log |
| 17 | [One Paddle customer per company](./17-ensure-customer.md) | Done | 08, 09 | Heavy | — | Run by the spec runner; see spec Log |
| 18 | [Shared subscription fulfilment](./18-fulfillment-seam.md) | Done | 01 | Heavy | — | Run by the spec runner; see spec Log |
| 19 | [Signup rules](./19-signup-rules.md) | Done | 11 | Heavy | — | Run by the spec runner; see spec Log |
| 20 | [Email and password login](./20-unified-login.md) | Done | 11 | Heavy | — | Run by the spec runner; see spec Log |
| 21 | [Owner checkout controller](./21-checkout-controller.md) | Done | 07, 12, 13 | Heavy | — | Run by the spec runner; see spec Log |
| 22 | [Activation polling](./22-activation-polling.md) | Done | 12 | Heavy | — | Run by the spec runner; see spec Log |
| 23 | [Keep people signed in through outages](./23-session-resilience.md) | Done | 06 | Heavy | — | Run by the spec runner; see spec Log |
| 24 | [Order summary](./24-order-summary.md) | Done | 03, 04 | Standard | — | Run by the spec runner; see spec Log |
| 25 | [Inline Paddle frame](./25-paddle-frame.md) | Done | 03, 13, 14 | Standard | — | Run by the spec runner; see spec Log |
| 26 | [Prepare and replace checkout](./26-prepare-checkout.md) | Done | 15, 17 | Heavy | — | Run by the spec runner; see spec Log |
| 27 | [Server confirmation of a paid checkout](./27-confirm-checkout.md) | Done | 08, 09, 18 | Heavy | — | Run by the spec runner; see spec Log |
| 28 | [Repair stuck reservations](./28-reconcile-reservations.md) | Done | 17 | Heavy | — | Run by the spec runner; see spec Log |
| 29 | [Sign-in screen](./29-login-screen.md) | Done | 03, 04, 06 | Standard | — | Run by the spec runner; see spec Log |
| 30 | [Create account screen](./30-signup-screen.md) | Done | 03, 04, 06 | Standard | — | Run by the spec runner; see spec Log |
| 31 | [Forgot password screens](./31-account-recovery-screens.md) | Done | 03, 04 | Standard | — | Run by the spec runner; see spec Log |
| 32 | [Staff web handoff screen](./32-staff-web-handoff.md) | Done | 03, 04 | Light | — | Run by the spec runner; see spec Log |
| 33 | [Choose plan screen](./33-plan-screen.md) | Done | 03, 04, 06 | Standard | — | Run by the spec runner; see spec Log |
| 34 | [Public pricing links and trial copy](./34-public-pricing.md) | Done | 06 | Light | — | Run by the spec runner; see spec Log |
| 35 | [Confirming and ready screens](./35-confirmation-screens.md) | Done | 03, 04, 22 | Heavy | — | Run by the spec runner; see spec Log |
| 36 | [Assemble the lifecycle service](./36-lifecycle-assembly.md) | Done | 10, 26 | Heavy | — | Run by the spec runner; see spec Log |
| 37 | [Payment screen](./37-payment-screen.md) | Done | 21, 24, 25 | Heavy | — | Run by the spec runner; see spec Log |
| 38 | [Recovery screen](./38-recovery-screen.md) | Done | 03, 04, 12 | Standard | — | Run by the spec runner; see spec Log |
| 39 | [Billing HTTP routes](./39-billing-routes.md) | Done | 27, 28, 36 | Standard | — | Run by the spec runner; see spec Log |
| 40 | [Routes and workspace entry](./40-route-composition.md) | Done | 23, 29, 30, 33, 35, 37, 38 | Heavy | — | Run by the spec runner; see spec Log |
| 41 | [Configuration check and runbook](./41-configuration-runbook.md) | Done | 16, 39 | Standard | — | Run by the spec runner; see spec Log |
| 42 | [End-to-end suite](./42-e2e-suite.md) | Not started | 01-41 | Heavy | — |  |
| 43 | [Verification pass](./43-verification-pass.md) | Not started | 00-42 | Heavy | — |  |

## Status legend

Not started · In progress · Blocked · Done

## Log

- **2026-11-09** — Design approved. Steering docs and 44 specs written. Only the decision spec is Done. No application code has changed, and no real payment has been run.
- **2026-11-09** — Spec 01 blocked during scope review: required missing-step rejection needs updates to success fixtures outside its `Owns`. No application code changed and no tests ran. Planning baseline committed on `saas-onboarding` as `9052ea5`; awaiting the user's scope decision.
- **2026-11-09** — Planner correction: spec 01 now accepts a missing `onboardingStep` until spec 36 sends it, and `AGENT-GUIDE.md` gains a narrow test-only exception. Spec 01 is back to Not started.
- **2026-11-09** — Spec 01 completed on `saas-onboarding`: additive lifecycle/confirm/reconcile contracts, strict scoped parsing, ignored legacy trials and normalized checkout replacement flag. Final results: 128 focused tests (included in the frontend total), 1,597 backend tests passed with 7 SQL tests skipped, and frontend 81 Node + 832 Vitest tests passed. Both type checks, web lint and both builds passed. Frontend build timing, Node module-type and spec-validator advisories are recorded in the spec Log. The API checkout assertion was updated under the guide's test-only exception. Planning corrections included in the local commit; no provider/database access, migrations, push or deploy. Next eligible: spec 02.
- **2026-11-09** — Spec 02 completed on `saas-onboarding`: allowlisted logging, generic unexpected-error responses with server-generated request IDs, validated proxy hops and guarded Express 5 listen failures. Final results: 26 logger and 60 route/startup tests passed (included in 1,642 backend tests passed); 7 SQL tests skipped, 0 failures. Backend types and build passed; Prisma upgrade advisory recorded in the spec Log. No issue/PR per run override; local commit only. No real provider/database access, migrations, push or deploy. Next eligible: spec 03.
- **2026-11-09** — Spec 03 completed on `saas-onboarding`: additive shared frame, closed scoped tokens, reusable motion/control classes, semantic progress, responsive split panel and preserved form state. Final results: **28 focused** (included in the total), **81 Node + 860 Vitest passed**, 0 failures/skips; frontend types/lint/build passed. Chromium verified 25 layout/reduced-motion cases plus keyboard/focus/draft continuity; 10 screenshots inspected, finish review **ship**. Existing module-type/build-timing advisories and the corrected test-path typo are recorded in the spec Log. No issue/PR per run override; local commit only. No real provider/database access, migrations, push or deploy. Next eligible: spec 04.
