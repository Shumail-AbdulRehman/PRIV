# Dependency record, 2026-11-09

Every edge means the later spec imports, calls, renders or tests something the earlier spec creates. Waves are in `specs-saas-onboarding/README.md`.

| Spec | Title | Depends on |
|---|---|---|
| 00 | Decisions for the account, plan and checkout flow | — |
| 01 | Billing lifecycle and outcome contract | 00 |
| 02 | Safe error logging and trusted proxy | 00 |
| 03 | Flow shell, tokens and motion | 00 |
| 04 | English and Urdu copy for the flow | 00 |
| 05 | New Hygene Ops logo | 00 |
| 06 | Next-step route map | 01 |
| 07 | Pure checkout state machine | 01 |
| 08 | Paddle gateway with time limits | 01, 02 |
| 09 | Reservation facts | 01 |
| 10 | Server next-step decision | 01 |
| 11 | Authentication rate limiter | 02 |
| 12 | Time-limited billing requests | 01 |
| 13 | Paddle.js loading and normalized events | 01 |
| 14 | Real Paddle sandbox probe | 08 |
| 15 | Trial-free plan catalog | 08 |
| 16 | Remove trials from sandbox prices | 08 |
| 17 | One Paddle customer per company | 08, 09 |
| 18 | Shared subscription fulfilment | 01 |
| 19 | Signup rules | 11 |
| 20 | Email and password login | 11 |
| 21 | Owner checkout controller | 07, 12, 13 |
| 22 | Activation polling | 12 |
| 23 | Keep people signed in through outages | 06 |
| 24 | Order summary | 03, 04 |
| 25 | Inline Paddle frame | 03, 13, 14 |
| 26 | Prepare and replace checkout | 15, 17 |
| 27 | Server confirmation of a paid checkout | 08, 09, 18 |
| 28 | Repair stuck reservations | 17 |
| 29 | Sign-in screen | 03, 04, 06 |
| 30 | Create account screen | 03, 04, 06 |
| 31 | Forgot password screens | 03, 04 |
| 32 | Staff web handoff screen | 03, 04 |
| 33 | Choose plan screen | 03, 04, 06 |
| 34 | Public pricing links and trial copy | 06 |
| 35 | Confirming and ready screens | 03, 04, 22 |
| 36 | Assemble the lifecycle service | 10, 26 |
| 37 | Payment screen | 21, 24, 25 |
| 38 | Recovery screen | 03, 04, 12 |
| 39 | Billing HTTP routes | 27, 28, 36 |
| 40 | Routes and workspace entry | 23, 29, 30, 33, 35, 37, 38 |
| 41 | Configuration check and runbook | 16, 39 |
| 42 | End-to-end suite | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41 |
| 43 | Verification pass | 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42 |
