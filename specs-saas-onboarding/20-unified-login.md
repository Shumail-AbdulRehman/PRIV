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

- [ ] `cd backend && npx vitest run src/services/login.service.test.ts` passes and proves: manager wins over staff; mixed-case legacy accounts sign in; unknown email and wrong password are identical and both run bcrypt; deactivated shows only after a correct password; the limiter returns 429. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/20-unified-login.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
