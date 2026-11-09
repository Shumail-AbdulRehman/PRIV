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

- [x] `cd frontend && npx vitest run src/pages/Account/AccountPages.test.tsx` passes and proves: public recovery renders in the new shell with the neutral result; signed-in security keeps its layout; invalid links explain the next step. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/31-account-recovery-screens.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]


## Log

### 2026-11-10 — Public account recovery screens

- Kept `SecurityShell` as the single wrapper, with an explicit public option using narrow `FlowShell` for owner recovery, email verification and password reset. Reused flow controls/notices, the existing language dictionary, heading focus and sign-in navigation; preserved public document titles.
- Recovery shows the exact neutral result, “If that email has an owner account, a reset link is on its way.” Managers and staff are directed to their company owner. Missing/rejected links expose recovery or company-settings actions. Existing token capture, explicit completion, password validation and session/cache clearing are unchanged.
- Signed-in own-security, forced-password replacement and company settings retain their existing layout and form styles. No application files outside Owns were edited; no test-only exception was needed. Wrote and inspected the reusable inventory fragment.
- All commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`.
- Focused command: `cd frontend && npx vitest run src/pages/Account/AccountPages.test.tsx`: **32 passed**, 0 failed/skipped, including public shells, neutral result, invalid-link next steps, signed-in layout preservation, Urdu/LTR email and token/session behavior. Reran after the final title/markup changes: **32 passed** again.
- Whole suite: `npm test --prefix frontend`, final run with `VITEST_MAX_WORKERS=2`: **88 Node + 2,077 Vitest tests passed** across 58 Vitest files, 0 failures/skips. Initial unrestricted run had 88 Node passed and 2,074 Vitest passed / 3 failed: one navigation lazy-load timeout and two title assertions while the title fix was being edited. The first bounded rerun had 88 Node passed and 2,076 Vitest passed / 1 navigation timeout. The unchanged navigation file passed separately (**26 tests**); after the competing build/type processes finished, the final full run passed without test changes or weakened assertions.
- `cd frontend && npx tsc -b --noEmit`: passed, 0 errors/warnings, including a final rerun. `npm run lint --prefix frontend`: passed, 0 errors/warnings; reran from frontend as `npm run lint --prefix .` after the final changes, also passed.
- `npm run build --prefix frontend`: passed. Vite emitted the existing nonblocking `PLUGIN_TIMINGS` advisory for Babel/CSS processing. Node tests emitted the existing mobile translation module-type advisory. `git diff --check` passed; the inventory fragment exists and is nonempty.
- No browser/runtime or end-to-end checks were run; no email delivery was verified. No real database or Paddle calls, deployment, migrations, GitHub issue/PR, status/progress edits or git branch/commit/merge/push commands were used.
