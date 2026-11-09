# Implementation plan: account, plan and checkout flow

The executable plan is `specs-saas-onboarding/`. Start at its `README.md`. This page is the short narrative.

## End result

A new owner enters their details, picks a plan and interval, types a Paddle test card into Paddle's own form on our payment page, sees the subscription confirmed, and opens their workspace. No free trial. Returning users land on the right step automatically.

## Order of work

1. Contracts, logging, the visual shell, Urdu copy and the new logo.
2. Pure logic: next-step decision, route map, checkout state machine, Paddle gateway, reservation facts, rate limiter, time-limited requests.
3. A real Paddle sandbox probe, then trial removal, signup rules, unified login and the checkout session.
4. Screens: sign-in, signup, recovery, plan, confirmation, payment.
5. Assembly: lifecycle read, routes and workspace entry.
6. Configuration runbook, 57-flow end-to-end suite, and final verification.

## What is different from the earlier Codex plan

- Fixes the permanent lock-out instead of leaving it unresolved.
- Logs Paddle failures safely, so problems can be diagnosed.
- Tests the real Paddle sandbox before building screens on it.
- Confirms payment by asking Paddle directly, so localhost and late webhooks work.
- Lets owners change plan before paying.
- Removes free trials, adds email-only login, and redesigns sign-in, signup and the logo.

## Release

Deploy nothing until spec 43 passes. Real payment results are recorded separately from automated tests.
