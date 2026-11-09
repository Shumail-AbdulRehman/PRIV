# Spec 22 — Activation polling

**Status:** Not started
**Depends on:** Spec 12
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.ts`, `frontend/src/pages/Subscription/onboarding/useCheckoutConfirmation.test.tsx`, `specs-saas-onboarding/inventory/22-activation-polling.md`
**Reuses:** `frontend/src/pages/Subscription/api.ts` (spec 12), `frontend/src/pages/Subscription/queries.ts`, `ARCHITECTURE.md#time-limits`

## Goal

Confirm a finished checkout by asking the server repeatedly, with a hard stop and a manual retry.

## Scope

- A `useCheckoutConfirmation` hook that calls confirm at 2, 3, 5, 8 then 13 second gaps until 120 seconds.
- A hung call cannot extend the 120 seconds.
- Reports `waiting`, `slow` after 20 seconds, `timedOut`, `active` and `denied`.
- Stops on active, 401, 403, unmount or owner change.
- Manual retry restarts the window.
- Only one call runs at a time.
- Refresh the owner-scoped lifecycle cache with each result.
- Leave `queries.ts` untouched. The old lifecycle poll is removed in spec 40.

## Explicit non-scope

- Confirmation screen → spec 35.
- Server logic → spec 27.
- Removing the old poll → spec 40.

## Reuse first

- Use the existing lifecycle cache key from `queries.ts`.

## Steps

1. Add the hook with fake timers in mind.
2. Test timing, hang, stop conditions and retry.
3. Record what you created in `specs-saas-onboarding/inventory/22-activation-polling.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/pages/Subscription/onboarding/useCheckoutConfirmation.test.tsx` passes and proves: gap sequence; a hung call still times out at 120 seconds; stops on active and denied; retry restarts; no parallel calls. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/22-activation-polling.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
