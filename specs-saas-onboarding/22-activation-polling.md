# Spec 22 — Activation polling

**Status:** Done
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

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/useCheckoutConfirmation.test.tsx` passes and proves: gap sequence; a hung call still times out at 120 seconds; stops on active and denied; retry restarts; no parallel calls. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/22-activation-polling.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-10** — Added `useCheckoutConfirmation()` with `status`, latest-run `lifecycle` and stable `retry()`. It starts after 2 seconds, then waits 3, 5, 8 and repeated 13-second gaps after settlement. Independent 20-second slow and 120-second deadline timers bound even abort-ignoring requests. Transient failures keep polling without overlapping requests; active confirmation, HTTP 401/403, unmount and owner/company/role changes stop the current run. Manual retry aborts and replaces the run, resetting both clocks. Late results/errors cannot affect another run or its owner-scoped cache. Activation requires a fresh server `ACTIVE` outcome, allowed workspace access and an active, unsuspended company; no lifecycle access field is fabricated.
- **2026-11-10** — Focused command `cd frontend && npx vitest run src/pages/Subscription/onboarding/useCheckoutConfirmation.test.tsx` passed: **31 tests**, **1 file**, **0 failures/skips**. Coverage includes exact gaps and deadlines, ignored aborts, real transport deadlines, no overlap, active/401/403 terminal states, transient errors, retry, scoped cache updates, late responses, role/owner/company changes, unmount and StrictMode replay.
- **2026-11-10** — `npm test --prefix frontend` passed: **88 Node tests + 1,989 Vitest tests (55 files) = 2,077 passed**, **0 failures/skips**, no unhandled errors. The 31 focused tests are included in the Vitest total. The existing Node `MODULE_TYPELESS_PACKAGE_JSON` advisory for the mobile translation file remains outside this spec's ownership.
- **2026-11-10** — `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. `npm run build --prefix frontend` passed; the existing Vite `PLUGIN_TIMINGS` advisory remains outside this spec's ownership. Created and inspected `specs-saas-onboarding/inventory/22-activation-polling.md` for spec 35 reuse. `queries.ts`, the legacy poll, screens, server logic and tests outside Owns were not changed.
- **2026-11-10** — All test/build commands used the dummy loopback database URL and `DOTENV_CONFIG_PATH=/dev/null`; the whole-suite command additionally used `VITEST_MAX_WORKERS=2`. No real Paddle, application database, end-to-end application run, migration, deployment, GitHub issue/PR, commit, merge, push or branch command was used. Real provider/database behaviour was neither required nor verified. Status and progress tracking were left unchanged per the run instructions.
