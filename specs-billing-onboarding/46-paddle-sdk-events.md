# Spec 46 — Stabilize browser SDK initialization and event subscriptions

**Status:** Done
**Depends on:** Spec 44
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/lib/paddle.ts`, `frontend/src/lib/paddle.test.tsx`, `specs-billing-onboarding/inventory/46-paddle-sdk-events.md`
**Reuses:** `frontend/src/lib/moduleLoadRecovery.ts`, `INVENTORY.md#paddle-sdk`

## Goal

Expose one validated Paddle singleton and a cleanable event subscription seam for owner/transaction-scoped checkout consumers.

## Scope

- Keep getPaddle and exact sandbox/test_ versus production/live_ checks. Missing/mismatched config must fail before checkout reservation.
- Initialize with one installed eventCallback; fan out project-owned subscriptions without reinitializing Paddle for each screen.
- Publish subscribe/unsubscribe behavior and event payload typing using installed PaddleEventData, checkout.closed and checkout.completed symbols.
- Allow a rejected SDK load to be retried deliberately; simultaneous callers still share one in-flight load. Do not reset a successful live singleton while consumers remain.
- Expose no global test mode, provider secret or browser access grant. Events remain refresh signals.

## Explicit non-scope

- Transaction/owner event correlation → spec 53.
- Confirmation UI → spec 56.
- Browser provider fixtures → spec 62.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read the installed @paddle/paddle-js declarations; do not guess event names or an SDK subscribe export.
2. Implement a project-owned callback fanout around the existing singleton and a cleanup returned to consumers.
3. Make configuration and failed-load retry behavior deterministic for tests while keeping the public getPaddle call compatible.
4. Record new project exports in the inventory fragment; ensure legacy imports still build.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/46-paddle-sdk-events.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/lib/paddle.test.tsx` passes: missing/invalid environment or wrong token family rejects; concurrent callers initialize once; failed initialization can retry; subscribed listeners receive events once and unsubscribe stops delivery. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/lib/paddle.ts src/lib/paddle.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-06** — Started the assigned SDK unit after reading the agent guide, tracker, steering docs, inventory and decision44 Log. Inspected installed @paddle/paddle-js declarations and implementation: PaddleEventData and CheckoutEventNames export the callback/event contract; the wrapper retains rejected CDN promises and catches initialization errors. Existing getPaddle imports remain compatible. Local implementation only; external issue/PR bookkeeping was not authorized by this execution request.

**2026-11-07** — Completed the singleton and project-owned subscribePaddleEvents cleanup boundary. One installed callback fans out current subscriptions; cleanup is idempotent and exceptions do not interrupt other consumers. Configuration still requires exact sandbox/production and matching test_/live_ token prefixes before SDK work. Concurrent calls share one promise; successful instances persist after all listeners leave. Failed script downloads are removed and retried only by a subsequent explicit getPaddle call, before invoking the installed wrapper so its rejected CDN cache cannot trap retries. Undefined/uninitialized results also reject and release the failed promise. No owner/transaction correlation or entitlement grant is implemented here (spec53/server owners retain those responsibilities).

Verification (all final commands passed):
- `npm run test:components --prefix frontend -- src/lib/paddle.test.tsx` — exit0,22 tests passed. Tests use SDK boundary mocks, synthetic public tokens and jsdom script events; one test invokes the installed SDK loader against a fake provider global to prove recovery from both download error and missing global without real network/provider access.
- `npm test --prefix frontend` — complete package run passed:64 Node tests and497 Vitest tests across36 files. Initial focused/full attempts exposed a test fixture assuming the installed wrapper cache reset between two parameterized cases; combined the related failure/retry sequence into one real-loader test and reran focused/full checks successfully.
- In frontend/: `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/lib/paddle.ts src/lib/paddle.test.tsx` — exit0, no diagnostics or lint warnings.
- `npm run build --prefix frontend` — production typecheck/Vite build passed. Non-failing plugin timing warning remains; Node suite also reports the pre-existing frontend-mobile package module-type warning.

Inventory: `inventory/46-paddle-sdk-events.md`. No new dependency, deployment, payment, browser e2e or external Paddle acceptance was performed or claimed. Actual provider/network acceptance remains with specs62/63; this unit has no unavailable prerequisite for its required local checks.
