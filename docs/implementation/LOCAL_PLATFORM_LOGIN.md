# Local platform-owner sign-in — spec43, 2026-10-31

The user explicitly requested a unique random product-owner email/password for the current local app. Local sign-in is implemented and verified at http://localhost:5173/platform/login; successful sign-in opens `/platform/companies`. This is separate from cleaning-company ADMIN/MANAGER/STAFF and does not alter production identity/MFA requirements.

## Runtime and credentials

Current checkout: `/home/shumail/.local/share/hygene-ops/v5-import-20261031`, branch `implementation/spec-43-local-platform-login`, based on b826856/spec42. Original root source, staff-import/password functionality, database configuration and other worktrees are preserved. No migration, tenant account creation or production action occurred.

Private runtime `~/.local/share/hygene-ops/local-development/active-local-operator.json` identifies the owner-only bcrypt credential JSON and owner handoff note. Actual credentials are deliberately absent from repository documentation/tests/screenshots. Server reads only the hashed credential file; the separate handoff note is for the requesting owner. All credential artifacts are mode0600 outside Git. The existing validated private backend launcher is backed up and adds only the two explicit local values after original configuration guards.

Backend activation requires NODE_ENV=development, LOCAL_PLATFORM_LOGIN_ENABLED=true, LOCAL_PLATFORM_CREDENTIAL_FILE, a loopback peer and an approved local development/isolated-test database. File must be an owned private regular file. It rejects production even when a valid cookie/file/flag exists. Existing production RS256/issuer/audience/provisioned-subject/MFA verifier is unchanged.

Frontend local form requires an explicit `VITE_LOCAL_PLATFORM_LOGIN=true` build and a loopback browser hostname. Its fetch client refuses nonloopback API targets. Default builds preserve the original unavailable provider boundary. Use that flag when rebuilding this local frontend; `systemctl --user restart hygeneops-backend-development.service` and then `...frontend...` restart the matching compiled local app.

## Session boundary

GET `/api/platform/session` reports availability/session state. POST `/login` verifies the separate credential with bcrypt and sets only an opaque HttpOnly SameSite=Strict cookie restricted to `/api/platform`; no token is returned in JSON or browser storage. Sessions last15minutes, are bounded to64, are stored hashed in process memory, expire/revoke on logout and invalidate when credentials change. Five failed attempts per loopback peer trigger a15minute throttle. Mutations require the configured loopback frontend Origin; cross-origin credential requests and mixed tenant contexts are rejected.

The existing platform metadata services receive an explicit local PLATFORM_OPERATOR principal. Tenant credentials/cookies/JWTs cannot grant platform authority. The platform session cannot grant tenant staff/workforce access. No provider/MFA claim is fabricated; original34remains Blocked.

## Executed verification

All heavy processes ran sequentially at nice15/maxWorkers1, per the laptop resource constraint.

- Focused backend session tests:12passed. Production/remote/off gating, valid/wrong password, throttling, expiry/logout and tenant-cookie isolation covered.
- Whole backend:1490passed/7pre-existing integration skips,98files,114.89s. Existing production verifier/middleware regressions pass.
- Focused frontend existing/new login boundary:25passed/2files. Whole64Node+399React tests pass; touched frontend lint passes.
- Backend and explicit-local frontend builds pass; frontend19.02s. No schema change.
- Guarded real API/PostgreSQL/Chromium browser case:1passed/8.8s with explicit HYGENE_E2E_LOCAL_PLATFORM=true, a fresh migrated UUID child database and generated synthetic private credentials. Correct/wrong password, Companies register, metadata-only DTO, tenant API denial, logout revocation and tenant-owner platform denial pass. Default runner keeps the provider disabled; the positive local test is opt-in and was executed without skips.
- Actual restarted local app with the provisioned owner credential: login succeeded, Companies HTTP200, tenant Staff HTTP401, logout Platform HTTP401. No password/token or restored company data was captured/logged. Four empty login layouts at1366/390EN/UR were captured before credentials were entered. Two synthetic company-register captures at1280/390EN are separate disposable-data evidence.
- Spec validation:44specifications,0errors, documented inherited/issue-ID/redundant-edge warnings. Original six unfinished V5 specs remain unchanged.

The actual owner credential was tested and is supplied directly to the requesting user. Production IdP/MFA, native/device/photo/provider and whole-release gates remain unqualified. No PR is merged and no production deployment is authorized.

Source bccbb95, OPEN/DRAFT [PR111](https://github.com/Shumail-AbdulRehman/PRIV/pull/111), issue110. Test-cluster cleanup confirmed zero generated child databases, then the owned proof cluster was stopped. Matching local app services remain running.
