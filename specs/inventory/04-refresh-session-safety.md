# Spec 04 reuse changes

### session-token
`backend/src/utils/auth.ts` — verifySessionToken validates access/refresh purpose, HS256, exp, positive identity and fixed tenant roles; refresh tokens require unique jti. Use instead of raw jwt.verify casts in tenant HTTP auth.

### expected-family-rotation
`backend/src/controllers/common.controller.ts` — expected-token CAS for refresh/logout; use instead of unconditional revocation on stale token.
