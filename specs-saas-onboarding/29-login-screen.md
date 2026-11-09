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

- [x] `cd frontend && npx vitest run src/pages/Login/LoginPage.test.tsx` passes and proves: no role field; each error message; one request on double submit; email kept and password cleared; keyboard order; Urdu direction. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/29-login-screen.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]


## Log

- **2026-11-10** — Rebuilt the sign-in screen against the approved v3 prototype using `FlowShell`, React Hook Form, `Input` and `Button`. Removed the account-type selector and role payload; the API now posts only email/password to `/common/login`. Kept the existing session/cache mutation and left routing to spec 40. Added Show/Hide text controls, recovery/signup/platform links, the security-completion notice and the hidden, visibly labelled example worksheet using shared one-time tick and reduced-motion styles. Added coded deactivation handling, numeric `Retry-After` copy with a fallback, safe connection/service errors, email retention and password clearing only on 401, plus a synchronous duplicate-submit lock. Error copy follows language changes without losing the draft.
- **Verification:** With `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`, `cd frontend && npx vitest run src/pages/Login/LoginPage.test.tsx` passed **27 tests**, 0 failures/skips (the initial focused run passed 26 before adding the language-switch case). `npm test --prefix frontend`, rerun with `VITEST_MAX_WORKERS=2`, passed **88 Node tests + 2,084 Vitest tests across 58 files**, 0 failures/skips; the 27 focused cases are included in that Vitest total. Coverage includes unified owner/staff payloads and session/cache behavior, validation, every error category, one request on double submit, retry, credential retention/clearing, keyboard order and focus, Urdu direction and live translation, security notice and hidden worksheet examples. Existing signup/session regression tests were retained. No test-only scope exception was needed.
- **Static checks:** `cd frontend && npx tsc -b --noEmit` passed, including a final rerun after the language-state change. `npm run lint --prefix frontend` passed with 0 errors and 0 warnings. `npm run build --prefix frontend` passed; it emitted the existing Rolldown `PLUGIN_TIMINGS` advisory for Babel/CSS. The Node suite emitted the existing mobile-translation module-type warning. `git diff --check` passed. Wrote `inventory/29-login-screen.md`.
- **Run conditions:** The first unrestricted whole-suite attempt reported navigation/location-test failures during concurrent resource pressure and was stopped before a final count; its results were not marked as passing. The complete two-worker retry above passed without changing those tests. No browser/runtime or application end-to-end suite was run. No real database, Paddle, migrations or deployments were used. No GitHub issue/PR, commit, push or branch operation was performed, per this run's instructions.
- **Integration limitation:** The current spec 20 backend emits an uncoded 403 for deactivation. This screen recognizes `ACCOUNT_DEACTIVATED` at the top level or in `errors[]`, as tested, and safely shows the generic unavailable-account message for uncoded/other 403s. The specific deactivation message requires that backend code to be supplied; backend application files are outside this spec's ownership and were left untouched. No backend-message matching was introduced.
