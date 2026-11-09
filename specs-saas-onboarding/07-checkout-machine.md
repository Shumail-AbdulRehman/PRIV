# Spec 07 — Pure checkout state machine

**Status:** Done
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/checkoutMachine.ts`, `frontend/src/pages/Subscription/onboarding/checkoutMachine.test.tsx`, `specs-saas-onboarding/inventory/07-checkout-machine.md`
**Reuses:** `ARCHITECTURE.md#checkout-states`, `frontend/src/pages/Subscription/types.ts` (spec 01)

## Goal

Define every checkout state, what moves between them and which actions each allows, with no React or network code.

## Scope

- States and actions exactly as in `ARCHITECTURE.md`.
- Events include: server facts read, prepare started, succeeded, failed, timed out after sending, script failed, frame loaded, frame timeout, `checkout.error`, payment attempted, payment failed, `checkout.payment.error`, completed, offline, online, replace started, replaced.
- A prepare timeout after sending goes to `unresolved`, never to a retry. A failure before sending goes to `frameFailed`.
- `checkout.payment.failed` goes to `declined` with the form still usable. `checkout.payment.error` such as no payment methods goes to `frameFailed`, not `declined`.
- An event for another transaction is ignored. A top-level error with no transaction only affects a frame still loading.

## Explicit non-scope

- Running effects → spec 21.
- Rendering states → spec 37.

## Reuse first

- Keep this free of imports from React, Paddle and the API layer.

## Steps

1. Define states, events and the action table.
2. Write the reducer.
3. Add a table test covering every state and event pair.
4. Assert no state, other than the listed bounded ones, has zero actions.
5. Record what you created in `specs-saas-onboarding/inventory/07-checkout-machine.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/checkoutMachine.test.tsx` passes and proves: every transition; declined keeps the form; a timed-out prepare is never retried; foreign and stale events do nothing; no dead-end state exists. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/07-checkout-machine.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Implemented the pure twelve-state checkout reducer, the architecture's exact action table and explicit wait descriptions, scoped session/transaction events, fresh-server-fact handling, safe offline recovery and form-usability selector. Declines keep the same usable draft; payment setup errors fail the frame. Unknown prepare/replacement outcomes become `unresolved`, with no retry until fresh server facts resolve them. Active forms survive background facts reads, and administrative restrictions take priority. No React, Paddle, API, DOM, network, clock or storage dependency was added.
- **2026-11-09** — Added `checkoutMachine.test.tsx`: **650 passed, 0 failed, 0 skipped** in the final focused run. Independent tables cover all **12 states × 18 event types**, stale sessions, foreign/transactionless events, exact actions and explicit waits. Additional cases cover declines, replacement, prepare timeouts, server steps, input immutability and offline recovery. The literal original focused command ran first and exited 1 with “No test files found” because `cd frontend` makes its additional `frontend/` prefix invalid. Corrected only that acceptance-command path to `src/pages/Subscription/onboarding/checkoutMachine.test.tsx`; the corrected command passed twice.
- **2026-11-09** — `npm test --prefix frontend` passed: **88 Node tests + 1,714 Vitest tests across 51 files, 0 failures, 0 skips** (650 new cases included). `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. An initial type check and overlapping build caught a TypeScript union-narrowing error; the event union was corrected before final verification. Node tests retain the existing `MODULE_TYPELESS_PACKAGE_JSON` advisory from the mobile translation module. No outside-scope test changes or test-only exception were needed.
- **2026-11-09** — Wrote and inspected `inventory/07-checkout-machine.md`, documenting the shared reducer API, event semantics, controller responsibilities and test coverage. Only this spec's owned implementation/test/inventory files and its acceptance evidence were changed. Status and `PROGRESS.md` remain untouched. No GitHub issue/PR, git commit/branch/merge/push, deployment, migration, real Paddle call or real database access occurred. Test commands used the guide's inert `DATABASE_URL` and `DOTENV_CONFIG_PATH=/dev/null`. Effects and rendering remain with specs 21 and 37; real payment/runtime integration was outside this spec and was not verified.
- **2026-11-09** — Final `npm run build --prefix frontend` passed (3,028 modules transformed). It reported the existing nonblocking `PLUGIN_TIMINGS` advisory for Babel/CSS plugins; final types and lint had no warnings. `git diff --check` passed. All Done-when checks are marked only after their successful runs/inspection.
