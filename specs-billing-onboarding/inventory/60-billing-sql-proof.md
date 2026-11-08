# Spec60 inventory

Extended `backend/tests/billingLifecycle.integration.ts` existing isolated harness; exact resume, one draft under locks, retained failure audits/READY rollback, foreign/paid denial and persisted effective entitlement. Reuses existing service/provider injection, registration and signed-event fulfillment functions. Explicit guarded localhost _test database only. SQL +1596 backend unit tests/typecheck/build passed;7 unrelated launch SQL skips.
