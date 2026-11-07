# Billing implementation progress

Source of current state for specs-billing-onboarding only. Historical specs/ is a separate queue. Under Orchestro the lead updates status/issue columns; in sequential mode the implementing session updates its own row. Detailed evidence belongs in per-spec Logs.

| # | Spec | Status | Depends on | Model | Issue | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 44 | [Record approved sandbox repair decisions](44-billing-decisions.md) | Done | — | Sol medium (Heavy) | — | See decision Log |
| 45 | [Publish additive billing lifecycle and catalog contracts](45-billing-dto-contract.md) | Done | 44 | Sol medium (Heavy) | — | See spec45 Log;44 focused tests |
| 46 | [Stabilize browser SDK initialization and event subscriptions](46-paddle-sdk-events.md) | Done | 44 | Sol medium (Standard) | — | See spec46 Log;22 focused tests |
| 47 | [Build scoped billing layout, tokens and translations](47-billing-setup-shell.md) | Not started | 44 | Sol medium (Heavy) | — | See spec Done when |
| 48 | [Qualify same-origin browser API transport on Netlify](48-netlify-api-transport.md) | Not started | 44 | Sol medium (Standard) | — | See spec Done when |
| 49 | [Return authoritative readiness and safe checkout resume](49-server-lifecycle-readiness.md) | Not started | 45 | Sol medium (Heavy) | — | See spec Done when |
| 50 | [Derive billing display states and exact provider prices](50-billing-view-state.md) | Not started | 45 | Sol medium (Standard) | — | See spec Done when |
| 51 | [Own validated owner cache and recoverable polling](51-billing-client-queries.md) | Not started | 45 | Sol medium (Heavy) | — | See spec Done when |
| 52 | [Restyle existing owner signup without changing auth semantics](52-owner-signup-screen.md) | Not started | 47 | Sol medium (Standard) | — | See spec Done when |
| 53 | [Coordinate single checkout, resume and provider events](53-checkout-controller.md) | Not started | 46, 51 | Sol medium (Heavy) | — | See spec Done when |
| 54 | [Render real catalog plans and interval selection](54-plan-selection-screen.md) | Not started | 47, 50, 51 | Sol medium (Standard) | — | See spec Done when |
| 55 | [Render order summary and Paddle checkout handoff](55-payment-handoff-screen.md) | Not started | 47, 50, 53 | Sol medium (Standard) | — | See spec Done when |
| 56 | [Confirm server entitlement and recover polling](56-activation-screen.md) | Not started | 46, 47, 50, 51 | Sol medium (Standard) | — | See spec Done when |
| 57 | [Render existing subscription and self-service portal](57-subscriber-billing-screen.md) | Not started | 47, 50, 51 | Sol medium (Standard) | — | See spec Done when |
| 58 | [Render known-failure and uncertain-payment recovery](58-billing-recovery-screen.md) | Not started | 47, 50, 53 | Sol medium (Standard) | — | See spec Done when |
| 59 | [Compose owner routes, aliases and workspace gates](59-owner-billing-routing.md) | Not started | 52, 54, 55, 56, 57, 58 | Sol medium (Heavy) | — | See spec Done when |
| 60 | [Prove reservation and entitlement persistence in PostgreSQL](60-billing-sql-proof.md) | Not started | 49 | Sol medium (Heavy) | — | See spec Done when |
| 61 | [Prepare deployment diagnosis and sandbox release checks](61-sandbox-deployment-package.md) | Not started | 48, 49, 59 | Sol medium (Standard) | — | See spec Done when |
| 62 | [Prove every owner billing flow in the managed browser suite](62-billing-e2e-suite.md) | Not started | 60, 61 | Sol medium (Heavy) | — | See spec Done when |
| 63 | [Verify clean suites and deployed sandbox acceptance](63-verification-pass.md) | Not started | 62 | Sol medium (Heavy) | — | See spec Done when |

## Log

**2026-11-06** — Planning baseline recorded. User approved revised design as amended to remove Help/Contact/support/FAQ elements and requested detailed Sol medium implementation/test instructions. Prototype amendment passed26 local no-help/layout/state checks with zero browser errors; these are not application tests. Decision44 is Done. All code, SQL, browser, deployment-package and final acceptance units remain Not started. No application code, live account/payment or deployment changed.

**2026-11-06** — Spec45 completed locally. Additive DTOs and safe client parsers verified with44 focused tests, full frontend64 Node +475 Vitest tests, scoped lint and production build/typecheck. No billing UI/deployment is claimed complete. Next lowest ready unit is46;47/48 are also ready, and49/50/51 now have their contract dependency.

**2026-11-07** — Spec46 completed locally. SDK singleton initialization/retry and cleanable callback subscriptions verified with22 focused tests, complete frontend64 Node +497 Vitest tests, typecheck, scoped lint and production build. Failed-CDN recovery also exercises the installed wrapper with a fake provider global. No deployed/provider acceptance claimed. Next lowest ready unit is47;48/49/50/51 remain independently ready by their completed dependencies.
