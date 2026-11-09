# Spec 20 — Email and password login

**Status:** Not started
**Depends on:** Spec 11
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/login.service.ts`, `backend/src/services/login.service.test.ts`, `backend/src/controllers/login.controller.ts`, `backend/src/routes/common.route.ts`, `specs-saas-onboarding/inventory/20-unified-login.md`
**Reuses:** `backend/src/services/authRateLimit.ts` (spec 11), `backend/src/utils/auth.ts`, `backend/src/controllers/manager.controller.ts`

## Goal

Add one login endpoint that finds the account type itself, so people only enter email and password.

## Scope

- `POST /common/login` with strict email and password.
- Check owner and manager accounts first, then staff. If an email exists in both and the password fits both, owner or manager wins.
- Exact match first, then a case-insensitive match so existing mixed-case accounts still work. More than one case-insensitive match means sign in fails generically.
- Missing account and wrong password return the same 401, and always run one bcrypt comparison.
- A deactivated account is revealed only after the correct password.
- Issue tokens and cookies exactly as the current login does.
- Apply the login limiter.
- Leave `/manager/manager-login` and `/staff/staff-login` in place, because the mobile app uses the staff one.

## Explicit non-scope

- Login screen → spec 29.
- Post-login routing → spec 40.

## Reuse first

- Use `generateAccessToken`, `generateRefreshToken`, `isPasswordCorrect` and `getCookieOptions`.

## Steps

1. Write the service with an injected `db`.
2. Write the controller.
3. Mount the route.
4. Test every case, including timing work being done for unknown emails.
5. Record what you created in `specs-saas-onboarding/inventory/20-unified-login.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/login.service.test.ts` passes and proves: manager wins over staff; mixed-case legacy accounts sign in; unknown email and wrong password are identical and both run bcrypt; deactivated shows only after a correct password; the limiter returns 429. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/20-unified-login.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Implemented the injected-database login service, thin controller and rate-limited `POST /common/login`. Strict email/password input cannot select an account type or tenant. Owners/managers are checked before staff; each table uses exact lookup before a bounded case-insensitive fallback and rejects ambiguous fallback matches. Wrong manager passwords can fall through to staff. Unknown accounts do real cost-10 bcrypt work and share the wrong-password 401; deactivation is revealed only after a matching password. Token helpers, refresh-token persistence, cookie options and role-specific public response fields match the existing logins. Existing manager/staff endpoints were left in place.
- **2026-11-10** — Focused command `cd backend && npx vitest run src/services/login.service.test.ts`: **42 passed, 0 failed, 0 skipped**. Tests use real bcrypt and token helpers with mocked/injected in-memory database access. Local HTTP checks exercise the actual common router, success/error responses, cookie settings, failed persistence and the shared limiter's 429/Retry-After. Service cases cover ADMIN/MANAGER precedence, staff fallback, legacy case matching, exact-match precedence, ambiguity, unknown/wrong-password parity, deactivation, strict validation and token claims. No tests outside this spec's Owns were edited.
- **2026-11-10** — Whole command `npm test --prefix backend`: **2,204 passed, 0 failed, 7 skipped** across **107 passed test files and 1 skipped file** (108 total). The seven SQL invariant cases require `LAUNCH_PERSISTENCE_TEST_DATABASE_URL` and were deliberately skipped. `cd backend && npx tsc --noEmit -p tsconfig.json` passed with **0 errors**; `npm run build --prefix backend` passed with **0 errors and no warnings**. Build generated the existing Prisma client and compiled TypeScript; no migration ran. The backend has no lint script.
- **2026-11-10** — All verification commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`; the whole suite additionally unset the SQL-test URL, and the build also pointed `DIRECT_URL` at the unused local port. No real database, Paddle, deployment or migration was used. Live-service behavior was not verified and is not required by this spec. Created and checked the nonempty inventory fragment; `git diff --check` passed. No issue, PR, commit, merge, push or branch command was run, per this session's override. Tracker and spec Status remain unchanged.
