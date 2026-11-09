# Spec 30 — Create account screen

## Signup screen

`frontend/src/pages/Signup/SignUpPage.tsx` rebuilds the owner signup form with the shared `FlowShell` (`size="split"`, `step="account"`), existing Button/Input primitives, scoped flow styles and registered English/Urdu copy. The desktop worksheet explains account, plan, card and workspace; the shell supplies mobile progress and RTL/reduced-motion behavior.

The form keeps its draft and input identity through errors and language changes. It validates required/whitespace fields, email and the eight-character password minimum, includes a Show/Hide password control, associates validation errors with inputs, and guards duplicate submissions. `EMAIL_EXISTS` offers sign-in, HTTP 400 field errors stay beside their fields, and 429 displays the server's numeric Retry-After countdown (or a safe generic wait). A durable account without a session replaces the form with a sign-in receipt, preventing another signup.

## Signup transport and session handling

- `signupFailure` in `frontend/src/pages/Signup/api.ts` decodes the public error contract into duplicate-account, retry wait and allowlisted field errors. Duplicate detection uses `EMAIL_EXISTS` in the top-level code or errors list, never message text. Only HTTP 400 validation messages are shown; unexpected error messages remain private.
- `useCreateManager` in `frontend/src/pages/Signup/queries.ts` keeps existing auth/cache/session handling and uses `parseOnboardingQuery` to carry only valid, unambiguous `plan` and `interval` values to `/choose-plan`. Sign-in links preserve the same allowlisted selection, including when session delivery fails. No plan choice is sent as a registration/access grant.

## Verification seams

`SignUpPage.test.tsx` exercises the real signup hook/API with a mocked HTTP client, including validation, draft continuity, duplicate codes, field errors, double submission, session failure, Urdu/focus continuity, password reveal and rate-limit waits. `queries.test.tsx` independently verifies session/cache behavior and query allowlisting. No database or Paddle is involved.
