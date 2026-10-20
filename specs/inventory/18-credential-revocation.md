# Spec18 reuse inventory

- `backend/src/services/credentialSession.service.ts`: exact persisted credential epoch assertion; versionless typed legacy tokens map only to0; forced replacement sessions restricted.
- `backend/src/middlewares/auth.middleware.ts`: ordinary verifier plus own-password-only adapter; never expose credential fields in req.user.
- `backend/src/utils/auth.ts`: epoch-bound access/refresh claims on existing HS256 session family.
- `backend/tests/credentialHandoff.integration.ts`: isolated PostgreSQL concurrency, bcrypt, immediate old-access/refresh and exact-family logout denial proof; explicit dedicated local DB only.
