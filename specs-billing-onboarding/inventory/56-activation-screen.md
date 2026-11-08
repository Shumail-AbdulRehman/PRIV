# Spec 56 inventory

Bounded query polling, SDK refresh signals with cleanup, server-permission-only ready action and manual/status/security recovery.

Owned screen/test are in `frontend/src/pages/Subscription/onboarding/`. Reuses BillingSetupLayout, billing query/state helpers and language/buttons. No new tokens, storage, card form or auth system. Verified focused15, full829 tests, typecheck/scoped lint/build, synthetic responsive render and independent review/documentation. Actual deployed-provider acceptance remains63.
