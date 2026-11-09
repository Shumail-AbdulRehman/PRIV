# Spec 23 — Keep people signed in through outages

**Status:** Done
**Depends on:** Spec 06
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/App.tsx`, `frontend/src/App.test.tsx`, `frontend/src/queries/auth.ts`, `frontend/src/api/client.ts`, `frontend/src/api/client.test.tsx`, `specs-saas-onboarding/inventory/23-session-resilience.md`
**Reuses:** `frontend/src/pages/Onboarding/onboardingRoutes.ts` (spec 06), `frontend/src/store/slices/authSlice.ts`

## Goal

A temporary server problem must never look like being signed out, and signed-in users must land in the right place.

## Scope

- Clear the session only on a confirmed 401, or a 403 that says so. A network error or 5xx shows a retryable "We could not reach Hygene Ops" screen.
- Retry the session read once, with a short delay.
- Do not send a user with an unknown session to protected content.
- After a failed refresh, re-read the current user once before signing out, since another tab may have rotated the token.
- `GuestRoute`: an ADMIN goes to `/continue`, others to `/dashboard`. Keep a safe `from` path using the checker from spec 06.
- Remove the `console.log` in `client.ts`.

## Explicit non-scope

- The `/continue` resolver → spec 40.
- Mobile refresh behaviour → spec 43.

## Reuse first

- Keep existing guards and the forced-password flow.
- `frontend/src/pages/Subscription/onboarding/billingRoutes.test.tsx` exercises this screen through the composer. Update only this screen's assertions there, under the test-only exception in `AGENT-GUIDE.md`.

## Steps

1. Classify the session read error.
2. Add the outage screen.
3. Update the refresh path.
4. Update `GuestRoute`.
5. Test each case.
6. Record what you created in `specs-saas-onboarding/inventory/23-session-resilience.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/App.test.tsx` passes and proves: 503 shows retry and keeps the user away from protected pages without clearing; 401 signs out; an ADMIN is sent to /continue; an unsafe from path is ignored. [unit]
- [x] `cd frontend && npx vitest run src/api/client.test.tsx` passes and proves: a refresh that loses to another tab recovers once instead of signing out. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/23-session-resilience.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]


## Log

### 2026-11-10

- Implemented shared confirmed-session rejection classification, one session-read retry after 500 ms, offline reads that reach a retryable outage screen, and protection against mounting child routes before restored or rejected auth reaches Redux. Network/5xx and unconfirmed 403 errors preserve identity; the existing forced-password flow remains available. The screen reuses FlowShell, Button and the existing English/Urdu dictionary.
- Replaced refresh failure's immediate sign-out with one shared current-user recovery read, disabled recursive refresh for that read, reused its successful response for an original session read, and bounded other request replays. Removed the refresh console log. GuestRoute sends ADMIN to `/continue` and other roles to `/dashboard`, preserving only a spec-06-validated `state.from`. The `/continue` resolver remains spec 40's work.
- Added `frontend/src/App.test.tsx` and `frontend/src/api/client.test.tsx`. Required focused commands passed: `cd frontend && npx vitest run src/App.test.tsx` — **27 passed**; `cd frontend && npx vitest run src/api/client.test.tsx` — **32 passed**; 0 failures/skips in both.
- Under the guide's test-only exception, updated `frontend/src/pages/Login/LoginPage.test.tsx` (the two authenticated ADMIN redirect expectations and a `/continue` fixture) and `frontend/src/pages/Subscription/onboarding/billingRoutes.test.tsx` (authenticated owner signup's redirect expectation and fixture). These three assertions failed on the intentional GuestRoute destination change. No checks were removed or weakened; unrelated screen assertions remain intact. `cd frontend && npx vitest run src/pages/Login/LoginPage.test.tsx src/pages/Subscription/onboarding/billingRoutes.test.tsx` — **23 passed**, 0 failures/skips.
- `npm test --prefix frontend` — **88 Node tests + 2,017 Vitest tests across 56 files passed**, 0 failures/skips. The initial whole-suite run had 88 Node passes and 2,013 Vitest passes with the three old route expectations failing; the final full run passed after those narrowly scoped test updates. The initial App run had 26 passes and one retry-UI test failure: manual retry uses the existing loading screen, so the test now verifies that screen and continued protection rather than expecting a disabled button. The final App run passed all 27. A test-only TypeScript narrowing error was corrected before the successful type check.
- `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. `npm run build --prefix frontend` passed. The build retains the existing Vite plugin-timing advisory; Node tests retain the existing mobile translations module-type advisory. Neither requires or prompted an out-of-scope configuration edit.
- Created and inspected `specs-saas-onboarding/inventory/23-session-resilience.md`; `test -s specs-saas-onboarding/inventory/23-session-resilience.md` and `git diff --check` passed.
- Every verification command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. Auth and refresh tests use synthetic adapters/mocks. No real database or Paddle, migration, deployment, application end-to-end run, GitHub issue/PR, commit, merge, push or branch command was used. No live browser/provider validation is claimed. PROGRESS.md and this spec's Status line were left unchanged per the run instructions.
