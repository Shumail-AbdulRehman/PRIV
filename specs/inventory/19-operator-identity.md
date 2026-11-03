# Spec19 reuse inventory

- `backend/src/services/operatorIdentity.service.ts`: fail-closed `loadOperatorIdentityConfig`, default `verifyOperatorIdentity`, injectable verifier factory for tests; native RSA/JWK + installed jsonwebtoken; issuer/API audience/provisioned subject/exact acr/15minute maximum age.
- `backend/src/middlewares/operatorAuth.middleware.ts`: `verifyOperator` assigns only immutable `req.operator`; no tenant cookie/promotion. Platform routes24–26 consume it; sign-in34 remains separate.
- `docs/implementation/OPERATOR_IDENTITY.md`: explicit configuration, provider qualification and caching/outage/lifetime limits for release39/40. No actual provider credentials or identities.
