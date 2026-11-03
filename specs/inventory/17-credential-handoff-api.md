# Spec17 reuse additions

### credential-handoff
`backend/src/services/credentialHandoff.service.ts` — current-password own change and issuer-confirmed same-tenant/site one-use worker handoff with hashed codes/version/audit/push revocation. Do not email/store reusable temporary passwords. Routes mounted under/api/common/security in credentialHandoff.route.ts.

### credential-handoff-integration
`backend/tests/credentialHandoff.integration.ts` — guarded local PostgreSQL concurrency/password/hash/audit proof; explicit CREDENTIAL_HANDOFF_TEST_DATABASE_URL only.
