# Hygene Ops account, plan and checkout flow — spec index

A complete rebuild of the first-run journey: create account, choose plan, enter a Paddle test card on the page, confirm, open the workspace. Free trials are removed. Sign-in, signup and the logo are redesigned. Everything after a company reaches its dashboard is out of scope.

**Release as one unit.** Specs merge one at a time and each keeps the build and unit tests green, but the flow is only coherent once spec 40 lands. Deploy nothing until spec 43 has passed.

These specs are small, independently workable units with a goal, exact scope, explicit non-scope, steps and a provable done list. They are shaped to run in parallel, or one at a time.

This set **replaces** `specs-billing-checkout-repair/`, which was never executed.

- **Design:** [`../design/saas-onboarding/v3/index.html`](../design/saas-onboarding/v3/index.html), approved 2026-11-09.
- **Research and raw planning:** [`../docs/plan-project/saas-onboarding/`](../docs/plan-project/saas-onboarding/).

Track progress in [PROGRESS.md](./PROGRESS.md).

## Steering docs, read before any spec

| Doc | What it settles |
|---|---|
| [AGENT-GUIDE.md](./AGENT-GUIDE.md) | How to work here, commands, safety rules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Flow, files, data, states, invariants |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | The closed token list and motion table |
| [INVENTORY.md](./INVENTORY.md) | What already exists |

## Spec list

| # | Spec | Wave | Model | What it covers |
|---|---|---|---|---|
| 00 | [Decisions](./00-saas-flow-decisions.md) | 0 | Heavy | Record the choices this spec set is built on, so implementing sessions never re-decide them. |
| 01 | [Billing lifecycle and outcome contract](./01-lifecycle-contract.md) | 1 | Heavy | Define the owner-safe data shapes every later billing spec builds against, on both server and client, with free-trial fields removed. |
| 02 | [Safe error logging and trusted proxy](./02-operational-logging.md) | 1 | Standard | Make server failures diagnosable without leaking personal data, and make `req.ip` correct behind a proxy. |
| 03 | [Flow shell, tokens and motion](./03-flow-shell.md) | 1 | Heavy | Build the shared page frame every screen in this flow sits in: aurora table, header, paper sheet, stacked edges and the four-step progress row. |
| 04 | [English and Urdu copy for the flow](./04-urdu-dictionary.md) | 1 | Light | Provide every user-visible string in this flow in Urdu, from one registered dictionary, so screens never edit shared translation files. |
| 05 | [New Hygene Ops logo](./05-logo-rollout.md) | 1 | Light | Replace the old logo with the approved checkbox mark across the web app and the staff app icon files. |
| 06 | [Next-step route map](./06-onboarding-routes.md) | 2 | Standard | Give the app one pure function that turns the server's `onboardingStep` into a route. |
| 07 | [Pure checkout state machine](./07-checkout-machine.md) | 2 | Standard | Define every checkout state, what moves between them and which actions each allows, with no React or network code. |
| 08 | [Paddle gateway with time limits](./08-paddle-gateway.md) | 2 | Heavy | Create the single module this flow uses to call Paddle, with a time limit on each call and a precise failure classification. |
| 09 | [Reservation facts](./09-reservation-facts.md) | 2 | Heavy | Own all reading and writing of billing reservation facts, including the new failed and cancelled facts that stop a reservation staying open forever. |
| 10 | [Server next-step decision](./10-onboarding-step.md) | 2 | Standard | Write the pure function that decides the owner's next step from server facts, so every screen and redirect agrees. |
| 11 | [Authentication rate limiter](./11-auth-rate-limit.md) | 2 | Standard | Provide one limiter that public login and signup can use, so password guessing and signup floods are bounded. |
| 12 | [Time-limited billing requests](./12-billing-transport.md) | 2 | Standard | Make every billing request end within a known time and report whether it failed before or after being sent. |
| 13 | [Paddle.js loading and normalized events](./13-paddle-sdk-inline.md) | 2 | Heavy | Load Paddle.js reliably, open the inline form with the right settings and give the app one normalized event stream. |
| 14 | [Real Paddle sandbox probe](./14-sandbox-probe.md) | 3 | Standard | Prove the riskiest assumptions against the real Paddle sandbox before the checkout screens are built on them. |
| 15 | [Trial-free plan catalog](./15-trial-free-catalog.md) | 3 | Standard | Serve the plan catalog from Paddle with free trials refused and a short cache, so the plan page is fast. |
| 16 | [Remove trials from sandbox prices](./16-trial-removal-script.md) | 3 | Standard | Give the user a safe command that shows which sandbox prices have trials and removes them only when approved. |
| 17 | [One Paddle customer per company](./17-ensure-customer.md) | 3 | Heavy | Guarantee a company ends up linked to exactly one Paddle customer, without ever getting permanently stuck. |
| 18 | [Shared subscription fulfilment](./18-fulfillment-seam.md) | 2 | Heavy | Let a server read of Paddle apply a subscription through the exact same code path as a signed webhook. |
| 19 | [Signup rules](./19-signup-rules.md) | 3 | Heavy | Make signup safe and predictable: normalized email, a real password rule, a stable duplicate-email code and a rate limit. |
| 20 | [Email and password login](./20-unified-login.md) | 3 | Heavy | Add one login endpoint that finds the account type itself, so people only enter email and password. |
| 21 | [Owner checkout controller](./21-checkout-controller.md) | 3 | Heavy | Run one owner's checkout from page arrival to completion, using the state machine and never starting two purchases. |
| 22 | [Activation polling](./22-activation-polling.md) | 3 | Heavy | Confirm a finished checkout by asking the server repeatedly, with a hard stop and a manual retry. |
| 23 | [Keep people signed in through outages](./23-session-resilience.md) | 3 | Heavy | A temporary server problem must never look like being signed out, and signed-in users must land in the right place. |
| 24 | [Order summary](./24-order-summary.md) | 2 | Standard | Show the purchase details Paddle requires beside the card form, using real totals only. |
| 25 | [Inline Paddle frame](./25-paddle-frame.md) | 4 | Standard | Provide the stable page element that Paddle's card form loads into, with a skeleton until it is ready. |
| 26 | [Prepare and replace checkout](./26-prepare-checkout.md) | 4 | Heavy | Create or reuse the single draft transaction for an owner, and let them switch plan without any risk of paying twice. |
| 27 | [Server confirmation of a paid checkout](./27-confirm-checkout.md) | 3 | Heavy | Activate a subscription as soon as Paddle says it is paid, even if the webhook is late or points elsewhere. |
| 28 | [Repair stuck reservations](./28-reconcile-reservations.md) | 4 | Heavy | Resolve an open reservation from Paddle's real state, so no owner stays locked out. |
| 29 | [Sign-in screen](./29-login-screen.md) | 3 | Standard | Rebuild sign-in from the approved design with email and password only. |
| 30 | [Create account screen](./30-signup-screen.md) | 3 | Standard | Rebuild signup from the approved design and take the owner straight to choosing a plan. |
| 31 | [Forgot password screens](./31-account-recovery-screens.md) | 2 | Standard | Give forgot password and reset links the same look as sign-in. |
| 32 | [Staff web handoff screen](./32-staff-web-handoff.md) | 2 | Light | Show staff who sign in on the web a clear message in the new design. |
| 33 | [Choose plan screen](./33-plan-screen.md) | 3 | Standard | Rebuild plan selection as the approved ledger, using real prices and exact allowances. |
| 34 | [Public pricing links and trial copy](./34-public-pricing.md) | 3 | Light | Send visitors from the pricing page into signup with their plan already chosen, and remove all trial wording. |
| 35 | [Confirming and ready screens](./35-confirmation-screens.md) | 4 | Heavy | Show honest progress while the server confirms the subscription, then a clear success with explicit entry to the workspace. |
| 36 | [Assemble the lifecycle service](./36-lifecycle-assembly.md) | 5 | Heavy | Remove the moved code from the old service and make the lifecycle read return the next step. |
| 37 | [Payment screen](./37-payment-screen.md) | 5 | Heavy | Rebuild the payment page with Paddle's real card form on the page beside the order summary. |
| 38 | [Recovery screen](./38-recovery-screen.md) | 3 | Standard | Explain any billing problem with its reason and one next action, and repair stuck checkouts automatically. |
| 39 | [Billing HTTP routes](./39-billing-routes.md) | 6 | Standard | Expose confirm and reconcile, and point checkout at the new service. |
| 40 | [Routes and workspace entry](./40-route-composition.md) | 6 | Heavy | Connect every screen so each user always lands on the correct step. |
| 41 | [Configuration check and runbook](./41-configuration-runbook.md) | 7 | Standard | Let the user check that everything Paddle needs is configured, and give a clear release procedure. |
| 42 | [End-to-end suite](./42-e2e-suite.md) | 8 | Heavy | The only spec that writes or runs end-to-end tests. Prove every flow below against the real running app and an isolated database, then record real Paddle sandbox runs separately. |
| 43 | [Verification pass](./43-verification-pass.md) | 9 | Heavy | The final gate. Prove from a clean state that what this spec set promised is true, and record every place it was not. This spec observes and reports. It does not fix. |

## Waves

```
W0: 00
W1: 01 02 03 04 05
W2: 06 07 08 09 10 11 12 13 18 24 31 32
W3: 14 15 16 17 19 20 21 22 23 27 29 30 33 34 38
W4: 25 26 28 35
W5: 36 37
W6: 39 40
W7: 41
W8: 42
W9: 43
```

## Dependency order

| Spec | Depends on |
|---|---|
| 00 | — |
| 01 | 00 |
| 02 | 00 |
| 03 | 00 |
| 04 | 00 |
| 05 | 00 |
| 06 | 01 |
| 07 | 01 |
| 08 | 01, 02 |
| 09 | 01 |
| 10 | 01 |
| 11 | 02 |
| 12 | 01 |
| 13 | 01 |
| 14 | 08 |
| 15 | 08 |
| 16 | 08 |
| 17 | 08, 09 |
| 18 | 01 |
| 19 | 11 |
| 20 | 11 |
| 21 | 07, 12, 13 |
| 22 | 12 |
| 23 | 06 |
| 24 | 03, 04 |
| 25 | 03, 13, 14 |
| 26 | 15, 17 |
| 27 | 08, 09, 18 |
| 28 | 17 |
| 29 | 03, 04, 06 |
| 30 | 03, 04, 06 |
| 31 | 03, 04 |
| 32 | 03, 04 |
| 33 | 03, 04, 06 |
| 34 | 06 |
| 35 | 03, 04, 22 |
| 36 | 10, 26 |
| 37 | 21, 24, 25 |
| 38 | 03, 04, 12 |
| 39 | 27, 28, 36 |
| 40 | 23, 29, 30, 33, 35, 37, 38 |
| 41 | 16, 39 |
| 42 | 01-41 |
| 43 | 00-42 |

## Run with Sol

Configure the executor to use OpenAI `gpt-6.1-sol` for every spec.

- **Orchestro:** run `orchestro specs graph specs-saas-onboarding/`, then `orchestro specs ready specs-saas-onboarding/`. It was not installed on this machine when this plan was written.
- **One at a time:** give Sol one spec per session, in number order, with this prompt: "Read `specs-saas-onboarding/AGENT-GUIDE.md`, then implement exactly `specs-saas-onboarding/NN-name.md`. Stop when its Done when list is complete."

Specs 14 and 16 touch the real Paddle sandbox and need your approval when they run. Spec 42 needs a disposable local database.

## Status shorthand

- **Not started**: nothing done yet
- **In progress**: being worked on
- **Blocked**: waiting on a decision or another spec
- **Done**: every Done when item is checked and actually verified

## Open questions

- Reading the stuck company's billing rows in spec 14 needs your approval at that time.
- Going live later needs real domain approval at Paddle, the live email rule tested, and a decision on rate limiting across several servers.

## Known gaps

- Spec 00 is a recorded decision, so it has no GitHub issue.
- Spec 42 is long by design, because it is the single end-to-end unit with one row per flow.
- The validator's "no other spec mentions it" warnings are accepted. Those files are existing entry points, operator scripts or files reached through a route, so no later spec needs to name them. Coverage was checked by hand against the flow table.
- `trialPeriod` stays as an optional, unread field so earlier specs compile. Spec 43 confirms it has no readers.
- OpenAI model IDs in every spec use `gpt-6.1-sol` at the user's request. The tier still records risk.
