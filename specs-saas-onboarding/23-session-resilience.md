# Spec 23 — Keep people signed in through outages

**Status:** Not started
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

## Steps

1. Classify the session read error.
2. Add the outage screen.
3. Update the refresh path.
4. Update `GuestRoute`.
5. Test each case.
6. Record what you created in `specs-saas-onboarding/inventory/23-session-resilience.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/App.test.tsx` passes and proves: 503 shows retry and keeps the user away from protected pages without clearing; 401 signs out; an ADMIN is sent to /continue; an unsafe from path is ignored. [unit]
- [ ] `cd frontend && npx vitest run src/api/client.test.tsx` passes and proves: a refresh that loses to another tab recovers once instead of signing out. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/23-session-resilience.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
