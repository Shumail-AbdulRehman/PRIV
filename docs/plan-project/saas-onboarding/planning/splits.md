# Splits, 2026-11-09

| Feature | Specs |
|---|---|
| Contracts | 01 |
| Diagnostics and proxy | 02 |
| Look | 03 shell, 04 copy, 05 logo |
| Paddle access | 08 gateway, 13 browser SDK, 14 sandbox probe |
| Free trial removal | 15 catalog, 16 price script, 34 public copy |
| Reservations | 09 facts, 17 customer, 26 prepare and replace, 28 repair |
| Activation | 18 fulfilment, 27 server check, 22 polling, 35 screens |
| Next step | 10 server, 06 client map, 40 composition |
| Sign in and sign up | 11 limiter, 19 rules, 20 login, 29 and 30 screens, 31 recovery, 32 staff |
| Checkout screens | 07 machine, 12 transport, 21 session, 24 summary, 25 frame, 33 plan, 37 payment, 38 recovery |
| Session | 23 |
| Release | 41 runbook, 42 e2e, 43 verification |

## Rejected splits

- One spec per screen with its logic included: UI and logic would each need the other, and they could not run in parallel.
- Refactoring `billingLifecycle.service.ts` first in place: later specs would all need the same file. New modules are created and one assembly spec removes the old code.
- Changing `useBillingCheckout.ts` and `queries.ts` in place: this would break screens awaiting rebuild. New files are added and spec 40 removes the old code.
