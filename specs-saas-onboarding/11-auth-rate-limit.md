# Spec 11 — Authentication rate limiter

**Status:** Done
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

- [x] `cd backend && npx vitest run src/services/authRateLimit.test.ts` passes and proves: limits trigger exactly at the threshold, reset after the window, keys for different emails are separate, and the key cap holds. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/11-auth-rate-limit.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-09** — Added `createAuthRateLimit` and the shared `authRateLimit.login` / `.signup` Express middleware, following the owner-identity fixed-window bucket approach without changing that service. Login allows 10 attempts per normalized email/IP and 50 per IP per 15 minutes; signup allows 10 per IP per hour. All bucket keys are SHA-256 hashes. The default 10,000-key cap prunes expired buckets before rejecting new keys, never evicts live limits, and reserves login's two keys atomically. Rejections return 429 / `AUTH_RATE_LIMITED` with rounded-up `Retry-After`; warning logs contain only the fixed event and status. Documented per-process limits for the current single dyno. Route integration remains with specs 19 and 20.
- **2026-11-09** — Verification used `DATABASE_URL='postgresql://none:none@127.0.0.1:1/none'` and `DOTENV_CONFIG_PATH=/dev/null` for every test, type and build command. Required focused command: **27 passed, 0 failed, 0 skipped** (1 file). Required `npm test --prefix backend`: **1,747 passed, 7 skipped, 0 failed** (102 passed files, 1 skipped file). Required type check: exit 0, **0 errors**. Required build: exit 0, Prisma client generation and TypeScript compilation passed; no warnings reported. Backend has no lint script. Inventory fragment written and inspected; `git diff --check` passed.
- **2026-11-09** — Tests cover exact login/email, login/IP and signup thresholds, independent email/IP buckets, normalization, malformed input, fixed expiry/reset, rounded retry delays, blocked-attempt accounting, independent areas, cap enforcement, atomic admission, expired-key pruning, forwarded-header handling and safe logs. All auth tests use injected time/logger and mocked Express request/response objects. No application code or existing tests outside Owns changed; no test-only exception needed. Real database/provider and deployed multi-process behaviour were not exercised; no such access was needed. No route wiring, migrations, deployment, issue/PR or commit was performed, per run scope.
