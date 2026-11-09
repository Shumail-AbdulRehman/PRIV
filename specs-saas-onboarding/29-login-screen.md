# Spec 29 — Sign-in screen

**Status:** Not started
**Depends on:** Spec 03, Spec 04, Spec 06
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Login/LoginPage.tsx`, `frontend/src/pages/Login/LoginPage.test.tsx`, `frontend/src/pages/Login/login.css`, `frontend/src/pages/Login/api.ts`, `frontend/src/pages/Login/types.ts`, `frontend/src/pages/Login/queries.ts`, `specs-saas-onboarding/inventory/29-login-screen.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03), `DESIGN-SYSTEM.md#component-conventions`

## Goal

Rebuild sign-in from the approved design with email and password only.

## Scope

- Two-column card with the worksheet panel, which ticks itself once on load.
- Remove the account-type dropdown and post to `/common/login`.
- Show and Hide password.
- Links: forgot password, create an account, platform owner sign-in.
- Errors: 400 and 401 incorrect details; 403 by code for deactivated; 429 with the retry wait; network or 5xx "could not reach".
- Keep the typed email after an error. Clear only the password on 401.
- Busy button says "Signing in…", and double submit sends one request.
- Show the "security details updated" notice when present.
- Example rows are `aria-hidden`, labelled "Example day".

## Explicit non-scope

- Where the user goes next → spec 40.
- Backend login → spec 20.

## Reuse first

- Use `FlowShell`, the existing form library and `Input`.

## Steps

1. Rebuild the page.
2. Update API and types.
3. Port tests from the old page and add new cases.
4. Record what you created in `specs-saas-onboarding/inventory/29-login-screen.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Login/LoginPage.test.tsx` passes and proves: no role field; each error message; one request on double submit; email kept and password cleared; keyboard order; Urdu direction. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/29-login-screen.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
