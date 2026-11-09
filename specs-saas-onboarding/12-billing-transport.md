# Spec 12 — Time-limited billing requests

**Status:** Not started
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/api.test.tsx`, `frontend/src/pages/Subscription/onboarding/billingRequest.ts`, `frontend/src/pages/Subscription/onboarding/billingRequest.test.tsx`, `specs-saas-onboarding/inventory/12-billing-transport.md`
**Reuses:** `frontend/src/api/client.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.ts` (spec 01), `ARCHITECTURE.md#time-limits`

## Goal

Make every billing request end within a known time and report whether it failed before or after being sent.

## Scope

- A deadline helper that composes a caller abort with a timeout.
- Apply read, confirm, reconcile and prepare limits from `ARCHITECTURE.md`.
- Add `confirmBillingCheckout` and `reconcileBillingCheckout` transport functions.
- Classify a failure as `not_sent`, `timed_out_after_send`, `server` with status and code, or `offline`.
- POST requests are never retried automatically.

## Explicit non-scope

- Polling → spec 22.
- Global Axios defaults → spec 23.

## Reuse first

- Keep using the shared `client`. Do not set a global timeout.
- Parse with spec 01's contract.

## Steps

1. Build the helper.
2. Apply it to each billing function.
3. Add the two new calls.
4. Test hung requests, caller abort and classification.
5. Record what you created in `specs-saas-onboarding/inventory/12-billing-transport.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Subscription/onboarding/billingRequest.test.tsx` passes. [unit]
- [x] `cd frontend && npx vitest run src/pages/Subscription/api.test.tsx` passes and proves: a never-settling request ends at its limit; caller abort wins; a POST is sent once; new endpoints parse strictly. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/12-billing-transport.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Implemented per-request billing deadlines (reads 15s, confirm 20s, reconcile 30s, prepare/portal creation 45s), caller cancellation, adapter-independent termination, cleanup, and conservative failure classification. `sent` records dispatch to the shared client, not proof of server receipt; cancellation after dispatch leaves the outcome unknown. HTTP failures preserve status and server code without retaining raw errors/payloads. Added strict, optionally company-scoped confirm/reconcile transports using spec 01 parsers. Every billing POST sets the existing shared refresh interceptor's replay guard; no global client defaults changed.
- **2026-11-09** — Focused verification: `cd frontend && npx vitest run src/pages/Subscription/onboarding/billingRequest.test.tsx`: **18 passed**, 0 failures/skips. `cd frontend && npx vitest run src/pages/Subscription/api.test.tsx`: **42 passed**, 0 failures/skips. The latter includes a real shared-interceptor test with an injected HTTP adapter, so no network is used. A subsequent combined API/checkout-hook run passed **80 tests** (42 API + 38 hook), 0 failures/skips.
- **2026-11-09** — Guide test-only exception: updated only the POST configuration assertion in `frontend/src/pages/Subscription/onboarding/useBillingCheckout.test.tsx`, test “verifies fresh owner/config/SDK before one exact plan/interval POST and opens its returned transaction”, to require `_retry:true` alongside the composed signal. The original exact configuration assertion failed because the replay guard is intended new behaviour; no check was removed or weakened.
- **2026-11-09** — Validation corrections: replaced constructor parameter properties to comply with the repository's `erasableSyntaxOnly` setting. Normalized synchronous adapter throws before racing promises, including simultaneous cancellation/throw. The initial unbounded whole-suite run was stopped after a timing failure under concurrent load. An intermediate bounded run reported **1,894 passed, 1 failed, 1 unhandled rejection** while the fixture and synchronous-error corrections were being made; final verification was restarted against the completed files.
- **2026-11-09** — Final `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. `npm run build --prefix frontend` passed; its existing `PLUGIN_TIMINGS` advisory remains (outside this spec's ownership). Inventory fragment written at `specs-saas-onboarding/inventory/12-billing-transport.md`.
- **2026-11-09** — All test/build commands used the dummy loopback database URL and `DOTENV_CONFIG_PATH=/dev/null`; whole-suite runs used `VITEST_MAX_WORKERS=2` after the initial unbounded attempt. No real Paddle, real database, end-to-end application run, migration, deployment, issue, PR, commit, merge, push or branch command was used. Real provider/database behaviour was neither required nor verified. Status and progress tracking were left unchanged per this run's instructions.
- **2026-11-09** — Final `npm test --prefix frontend` passed: **88 Node tests + 1,895 Vitest tests (53 files) = 1,983 passed**, **0 failures, 0 skipped, 0 unhandled errors**. The focused helper/API/hook counts above are included in the Vitest total. The existing Node `MODULE_TYPELESS_PACKAGE_JSON` advisory for the mobile translation file remains; changing that package is outside scope. All Done-when commands ran and passed in this session, and the inventory fragment was inspected. No application code outside Owns was changed.
