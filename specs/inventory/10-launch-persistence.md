# Spec10 reuse additions

### lifecycle-persistence
`backend/prisma/schema.prisma` — CredentialToken (hashed/company-bound purpose/expiry), immutable AttendanceAnnotation, principal credentialVersion/mustChangePassword and Company operationalStatus/accountVersion. Reuse instead of separate local auth/billing databases.

### isolated-migration-proof
`backend/src/services/launchPersistence.test.ts` —7 PostgreSQL invariant tests, only explicit local test URL. `backend/tests/launchMigration.integration.ts` —empty isolated DB upgrade/rollback/preservation and real registration race/hash proof; never app database fallback.
