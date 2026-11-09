# Spec 30 — Create account screen

**Status:** Not started
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

- [ ] `cd frontend && npx vitest run src/pages/Signup/SignUpPage.test.tsx src/pages/Signup/queries.test.tsx` passes and proves: validation; EMAIL_EXISTS shows the sign-in link; draft survives errors; session failure blocks resubmit; plan query carries through and bad values are dropped. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/30-signup-screen.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
