# Spec43 reuse inventory

- `backend/src/services/localOperatorSession.service.ts`: explicitly gated loopback development-only credential verification and opaque server sessions. Owner-only bcrypt credential file outside Git; separate15minute HttpOnly platform cookie, origin checks, throttling, expiry/revocation and bounded memory.
- `backend/src/routes/localOperatorSession.route.ts`: status/login/logout under `/api/platform/session`; never tenant registration or tenant login.
- Existing operator middleware first recognizes a valid explicitly local session, otherwise retains the original provider bearer verifier. Production verification is unchanged.
- `frontend/src/pages/Platform/LocalOperatorLogin.tsx`: V5 AuthShell/Input/Button login, status/error/logout and authenticated boundary; EN/UR. Existing Companies/Service components remain the metadata consumers.
- Existing `operatorSession.ts`: separate local-only fetch client and platform query scope; no tenant Redux/interceptor or browser credential storage.
