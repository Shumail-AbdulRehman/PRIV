# Spec 11 — Authentication rate limiter

**Status:** Not started
**Depends on:** Spec 02
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/services/authRateLimit.ts`, `backend/src/services/authRateLimit.test.ts`, `specs-saas-onboarding/inventory/11-auth-rate-limit.md`
**Reuses:** `backend/src/services/ownerIdentity.service.ts`, `backend/src/utils/operationalLog.ts` (spec 02)

## Goal

Provide one limiter that public login and signup can use, so password guessing and signup floods are bounded.

## Scope

- In-process fixed window with an injected clock and a bounded key count.
- Login: 10 attempts per 15 minutes per IP plus hashed email, and 50 per IP.
- Signup: 10 per hour per IP.
- Over the limit is a 429 with code `AUTH_RATE_LIMITED` and a `Retry-After`. Log the event with no email.
- State plainly in a comment that limits are per process, because the app runs on one dyno today.

## Explicit non-scope

- Applying it to login → spec 20.
- Applying it to signup → spec 19.
- A shared store such as Redis → spec 43.

## Reuse first

- Follow the bucket approach in `ownerIdentity.service.ts`. Do not change that service.

## Steps

1. Build the limiter.
2. Hash emails before using them as keys.
3. Prune expired buckets and cap total keys.
4. Test limits, window reset and the key cap.
5. Record what you created in `specs-saas-onboarding/inventory/11-auth-rate-limit.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd backend && npx vitest run src/services/authRateLimit.test.ts` passes and proves: limits trigger exactly at the threshold, reset after the window, keys for different emails are separate, and the key cap holds. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/11-auth-rate-limit.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
