# Spec 19 — Signup rules

**Status:** Not started
**Depends on:** Spec 11
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/companyRegistration.service.ts`, `backend/src/services/companyRegistration.service.test.ts`, `backend/src/controllers/companyRegistration.controller.ts`, `backend/src/validations/manager.validation.ts`, `backend/src/routes/manager.route.ts`, `specs-saas-onboarding/inventory/19-signup-rules.md`
**Reuses:** `backend/src/services/authRateLimit.ts` (spec 11)

## Goal

Make signup safe and predictable: normalized email, a real password rule, a stable duplicate-email code and a rate limit.

## Scope

- Trim and lowercase email before saving.
- Password at least 8 characters and at most 72 UTF-8 bytes.
- A duplicate, ignoring case, in Manager or Staff returns 409 with code `EMAIL_EXISTS`. The transaction race on the unique index gives the same result.
- Apply the signup limiter to the route.
- Keep the "account created, sign in" outcome when the session cannot be issued.
- Field errors return per-field messages.

## Explicit non-scope

- Signup screen → spec 30.
- Existing mixed-case emails at login → spec 20.

## Reuse first

- The Prisma extension hashes on `manager.create`. Do not hash again.
- Keep the existing transaction and enrolment audit row.

## Steps

1. Update validation.
2. Add normalization and the cross-table check.
3. Return stable codes.
4. Apply the limiter.
5. Test all of it.
6. Record what you created in `specs-saas-onboarding/inventory/19-signup-rules.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/services/companyRegistration.service.test.ts` passes and proves: mixed-case email saves lowercase; duplicates in either table return EMAIL_EXISTS; a seven-character password and a 73-byte password fail; the unique-index race returns EMAIL_EXISTS. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/19-signup-rules.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-10** — Implemented signup-only email trimming/lowercasing, an 8-character minimum and 72 UTF-8-byte maximum password rule, and case-insensitive Manager/Staff email checks inside the existing transaction before writes. Both a duplicate lookup and a Prisma `P2002` unique-index race produce HTTP 409 with `EMAIL_EXISTS` and an email field message through the existing error middleware. Attached the shared `authRateLimit.signup` before the public signup handler. Preserved Prisma password hashing, atomic company/ADMIN/enrolment audit creation, strict input and per-field validation errors. The existing controller already preserves HTTP 201 account creation with `sessionEstablished: false` when session issuance fails, so it required no edit; tests now cover access-token, refresh-token and session-persistence failures.
- **2026-11-10** — All Done commands ran and passed with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. Focused signup suite: **30 passed, 0 failed, 0 skipped**. Full `npm test --prefix backend`: **2,178 passed, 0 failed, 7 skipped** across **106 passed files and 1 skipped file**. The isolated SQL tests were skipped because `LAUNCH_PERSISTENCE_TEST_DATABASE_URL` was explicitly unset. Type checking and backend build passed with **0 errors and 0 warnings**; the build generated Prisma Client and compiled TypeScript without connecting to a database. `git diff --check` passed. Read and verified `inventory/19-signup-rules.md`.
- **2026-11-10** — Verification used mocked identity lookups/transactions and a loopback HTTP test of the production signup route: 10 invalid requests reached validation, and the 11th request returned 429 with `AUTH_RATE_LIMITED` and `Retry-After` before database/session work. Unique-index errors were simulated; real database persistence and real Paddle were neither required nor used. No tests outside Owns were edited. No migrations, deployments, GitHub issues/PRs, commits, merges, pushes or branch commands ran. Left the spec Status and `PROGRESS.md` unchanged as instructed.
