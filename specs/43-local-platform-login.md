# Spec 43 — Local platform-owner password sign-in

**Status:** Done
**Depends on:** Spec 19, Spec 27, Spec 33, Spec 35
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #110
**Extends serially:** `backend/src/middlewares/operatorAuth.middleware.ts`, `backend/src/routes/launch.route.ts`, `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/operatorSession.ts`, `frontend/e2e/run.mjs` (existing40harness).
**Owns:** `backend/src/services/localOperatorSession.service.ts`, `backend/src/services/localOperatorSession.service.test.ts`, `backend/src/routes/localOperatorSession.route.ts`, `frontend/src/pages/Platform/LocalOperatorLogin.tsx`, `frontend/src/pages/Platform/LocalOperatorLogin.test.tsx`, `specs/inventory/43-local-platform-login.md`
**Reuses:** `backend/src/middlewares/operatorAuth.middleware.ts`, `backend/src/services/operatorIdentity.service.ts`, `frontend/src/pages/Platform/operatorSession.ts`, `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/CompaniesPage.tsx`, `frontend/src/pages/Platform/ServicePage.tsx`, `design/v5/operator-login.html`, `DESIGN-SYSTEM.md#component-conventions`

## Goal
Allow the product owner to sign into the local platform dashboard using a unique generated email/password, without treating tenant ADMIN as a platform identity or changing production MFA/OIDC enforcement.

## Scope
Latest user explicitly requests immediate email/password access in the current local app. Provide one provisioned local operator with bcrypt-hashed credentials outside Git in a protected runtime file. Do not create a tenant Manager or a public registration endpoint.

Require an explicit enable flag, development mode, loopback request peer and an explicitly local approved development/test database. Fail closed elsewhere, including production even if the flag or credentials are present. Keep the existing production RS256/MFA/provisioned-subject verifier unchanged.

Use short-lived bounded server-side opaque sessions and a separate HttpOnly SameSite cookie restricted to platform APIs. Check allowed loopback frontend Origin, throttle password attempts, revoke on logout and expire sessions. Never log/echo/store plaintext credentials in project source or browser storage.

Add isolated session status/sign-in/sign-out endpoints before platform metadata routes. Permit the existing operator principal only through this local session or the unchanged provider verifier. Tenant cookies/JWTs alone cannot authorize platform endpoints; operator sessions cannot authorize tenant endpoints.

Enable the V5 email/password form and existing Companies/Service pages only in an explicit local frontend build. Fetch platform APIs using a separate client, without tenant refresh/interceptors. Preserve default provider-unavailable UI outside local mode, EN/UR, safe callback rejection and production security.

## Explicit non-scope
- Production identity/MFA/provider qualification → spec 34.
- Full integrated product/device qualification → spec 40.
- Production release certification → spec 41.

## Reuse first
- Keep existing platform metadata services, principal/audit boundaries, AuthShell/Input/Button and operator query scope.
- Consume the shipped unavailable boundary from34 as existing source; do not mark its blocked provider acceptance complete.
- Extend only local runtime launcher/environment allowlists needed to activate the isolated local mode.

## Steps
1. Implement gated local credential/session services, origin checks, throttling and expiry.
2. Wire separate session endpoints and existing platform middleware without tenant-role fallback.
3. Add local-only login/boundary/client behavior and logout.
4. Test correct/wrong credentials, production/remote rejection, tenant/operator separation and query cleanup.
5. Build sequentially, provision a random private credential, restart matching local services and verify the real browser sign-in/company register.
6. Record exact evidence/limits and give credentials privately to the requesting owner.

## Done when
- [x] Focused session/middleware tests pass for password verification, throttling, expiry, logout, production/remote/off rejection and audience isolation. [unit]
- [x] Frontend tests prove local login/error/logout and preserve the default unavailable boundary. [unit]
- [x] Whole affected backend/frontend suites pass with existing skips reported. [unit]
- [x] Real local browser password sign-in reaches Companies; wrong password, logout and tenant API denial are verified without recording secrets. [requires: local runtime]
- [x] Credentials remain outside Git; no production auth/DB migration/provider operation occurs. [static]
- [x] Touched TypeScript and frontend lint pass. [static]
- [x] Backend and frontend production builds pass. [static]

## Log
- **2026-10-31** — New explicit user authorization: enable product-owner sign-in with random unique email/password. Selected local-only provisioned sign-in; retain production34 gate and tenant/operator separation. Branch isolated from preserved root at b826856. Shipped34 public boundary exists, but provider-dependent completion stays Blocked.

- **2026-10-31 — Verified locally:**12focused backend/25focused frontend;1490backend passed/7existing skips,64Node+399React, lint/both builds pass. Real isolated browser1/1passed; actual provisioned local owner reached Companies200, tenant Staff401, logout401. Empty EN/UR desktop/phone captures contain no credentials. Separate private generated credential, loopback-only guards and production MFA unchanged. No schema/tenant-account/provider operation; original34remains Blocked.
