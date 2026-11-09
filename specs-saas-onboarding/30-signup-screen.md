# Spec 30 — Create account screen

**Status:** Done
**Depends on:** Spec 03, Spec 04, Spec 06
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Signup/SignUpPage.tsx`, `frontend/src/pages/Signup/SignUpPage.test.tsx`, `frontend/src/pages/Signup/queries.ts`, `frontend/src/pages/Signup/queries.test.tsx`, `frontend/src/pages/Signup/api.ts`, `frontend/src/pages/Signup/types.ts`, `specs-saas-onboarding/inventory/30-signup-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03), `frontend/src/pages/Onboarding/onboardingRoutes.ts` (spec 06)

## Goal

Rebuild signup from the approved design and take the owner straight to choosing a plan.

## Scope

- Fields: your name, company name, work email, password with Show and at least 8 characters.
- Panel lists what happens next. Steps row shows on small screens.
- On success go to `/choose-plan`, carrying allowlisted `plan` and `interval` from the signup URL.
- Use the `EMAIL_EXISTS` code, not message text, to show "This email already has an account" with a sign-in link.
- Keep all typed values on any error, except that a 429 shows the wait.
- Session not established: show "Your account is ready. Sign in to continue", and do not allow a second submit.
- Server field errors appear beside their fields.
- One request on double submit.

## Explicit non-scope

- Server rules → spec 19.
- Plan page → spec 33.

## Reuse first

- Keep `useCreateManager` and its session handling.

## Steps

1. Rebuild the page.
2. Update error handling to use codes.
3. Pass plan and interval through.
4. Update tests.
5. Record what you created in `specs-saas-onboarding/inventory/30-signup-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Signup/SignUpPage.test.tsx src/pages/Signup/queries.test.tsx` passes and proves: validation; EMAIL_EXISTS shows the sign-in link; draft survives errors; session failure blocks resubmit; plan query carries through and bad values are dropped. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/30-signup-screen.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

### 2026-11-10

- Rebuilt the owner signup page from the approved prototype using the existing split FlowShell, scoped tokens, Button/Input primitives and registered English/Urdu copy. Added the next-steps worksheet, mobile account progress, eight-character password validation and Show/Hide control. Form nodes and typed values survive failures and language changes; language changes preserve focus.
- Kept `useCreateManager` session/cache handling. Successful signup navigates to `/choose-plan` with only the existing parser's allowlisted, unambiguous plan/interval values. Sign-in links preserve the same selection. A persisted account without a session replaces the form with “Your account is ready. Sign in to continue.” and blocks another submission.
- Added code-based EMAIL_EXISTS handling, associated server field errors, safe unexpected-error copy, Retry-After wait/countdown and a synchronous duplicate-submit guard. No error payloads or secrets are logged.
- Focused command: `cd frontend && npx vitest run src/pages/Signup/SignUpPage.test.tsx src/pages/Signup/queries.test.tsx` passed: **28 tests across 2 files**, 0 failures/skips (20 page tests and 8 hook tests). The first run passed 26 and failed 2 test assertions; corrected the multiple-ID error association check and the countdown timer test, then reran successfully.
- Test-only scope exception: updated exactly two tests in `frontend/src/pages/Login/LoginPage.test.tsx`: “keeps registration session-delivery failure unauthenticated with an accurate receipt” and “translates registration fields and validation using FlowShell” (previously named for the billing setup shell). They asserted signup's replaced labels, copy and validation. Updated those expectations to the approved screen while retaining all session, validation, localization and sign-in assertions; no login application code changed.
- Whole-suite command: `npm test --prefix frontend` passed with `VITEST_MAX_WORKERS=2`: **88 Node tests + 2,079 Vitest tests across 58 component files**, 0 failures/skips. An initial unrestricted-worker suite was stopped after exposing the old signup assertions and an unrelated navigation-test failure under concurrent load; no navigation test was changed. The final complete run passed every test.
- `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. `npm run build --prefix frontend` passed. Existing nonblocking advisories: the Node unit runner reports the mobile translations module-type warning, and Vite reports plugin timing. No compiler/linter warnings were reported.
- Wrote `inventory/30-signup-screen.md`; inspected the final diff and checked whitespace. All checks used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. All HTTP in signup tests was mocked. No real database, Paddle, migrations, deployment, GitHub issue/PR, commit or branch operations ran. No browser/runtime or end-to-end suite ran; responsive/RTL/reduced-motion behavior reuses the previously verified shell and was inspected in code.
