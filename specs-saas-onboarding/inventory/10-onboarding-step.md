# Spec 10 — Server next-step decision

`backend/src/services/billingOnboardingStep.ts` exports:

- `BillingOnboardingFacts`: required plain facts computed by the lifecycle reader. Supply the company's active/suspension flags, workspace entitlement, subscription linkage, billing/catalog readiness, trial-price detection, live-mode/email verification, paid/unknown status, open reservation, recorded conflict and resumable draft. No dates, provider rows or database handles are needed.
- `BillingOnboardingDecision`: required `onboardingStep` and `recoveryReason`, using the shared spec 01 DTO unions.
- `decideBillingOnboardingStep(facts)`: pure first-match selection in architecture order: restriction, workspace, linked account, unavailable billing/catalog, email verification, confirmation, reconciliation, payment, plan selection. Returns a fresh object without changing input. Selecting a step never grants access.

Unavailable billing returns `BILLING_DISABLED`; unusable catalog or a trial-bearing price returns `PRICE_NOT_READY`. If billing and catalog are both unavailable, disabled billing takes precedence. Reconciliation preserves a recorded `EMAIL_CONFLICT` or `CUSTOMER_UNRESOLVED`; an open reservation alone returns `CUSTOMER_UNRESOLVED`. All other steps return a null recovery reason.

Spec 36 should assemble these facts and spread the returned decision into the lifecycle DTO. Subscription linkage is independent of mirror/status availability: a linked subscriber without access goes to ACCOUNT before later checks, including unknown subscription status. Existing entitlement, including an entitled historical trialing subscription, takes precedence over catalog purchase readiness.

`backend/src/services/billingOnboardingStep.test.ts` contains 120 tests covering every table row and alternative trigger, all earlier/later row pairs, simultaneous restrictions, expired subscribers, sandbox/live verification, recovery reasons and input immutability. No provider, database or clock dependency is imported.
