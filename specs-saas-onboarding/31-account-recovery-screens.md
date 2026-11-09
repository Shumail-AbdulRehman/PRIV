# Spec 31 — Forgot password screens

**Status:** Not started
**Depends on:** Spec 03, Spec 04
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Account/AccountPages.tsx`, `frontend/src/pages/Account/AccountPages.test.tsx`, `specs-saas-onboarding/inventory/31-account-recovery-screens.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03)

## Goal

Give forgot password and reset links the same look as sign-in.

## Scope

- Public owner recovery, verify email and reset password use `FlowShell` at narrow size.
- Recovery keeps its neutral result: "If that email has an owner account, a reset link is on its way."
- Say that managers and staff should ask their company owner.
- Signed-in security and company settings pages keep their current look.
- Existing token handling is unchanged.

## Explicit non-scope

- Email delivery → spec 41.
- Staff credential screens → spec 32.

## Reuse first

- Keep `SecurityShell` as the single wrapper and change only what it renders for public use.

## Steps

1. Switch the public wrapper.
2. Check signed-in pages are untouched.
3. Update tests.
4. Record what you created in `specs-saas-onboarding/inventory/31-account-recovery-screens.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Account/AccountPages.test.tsx` passes and proves: public recovery renders in the new shell with the neutral result; signed-in security keeps its layout; invalid links explain the next step. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/31-account-recovery-screens.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
