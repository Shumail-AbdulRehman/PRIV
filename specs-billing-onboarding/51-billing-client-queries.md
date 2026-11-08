# Spec 51 — Own validated owner cache and recoverable polling

**Status:** Done
**Depends on:** Spec 45
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/queries.ts`, `frontend/src/pages/Subscription/api.test.tsx`, `frontend/src/pages/Subscription/queries.test.tsx`, `specs-billing-onboarding/inventory/51-billing-client-queries.md`
**Reuses:** `frontend/src/pages/Subscription/onboarding/billingContract.ts`, `frontend/src/api/client.ts`, `frontend/src/hooks/useAuth.ts`, `INVENTORY.md#billing-query`

## Goal

Expose owner-scoped lifecycle/catalog reads and bounded refresh behavior that recovers from transport failures without creating checkout mutations.

## Scope

- Validate new transport facts at the API boundary and retain existing API function names where callers depend on them.
- Key every private read by company/owner; abort old-tenant requests, remove the former owner's private billing cache, discard mismatched responses and do not let late results enable current actions.
- Allow configured catalog READ for existing subscribers as well as prospective buyers; purchase permission remains separate. Reuse existing getSubscription/useSubscription availablePlans for all plan definitions/capacities, rather than duplicating backend limits.
- Poll only pending/unknown/reconciliation states. Use explicit bounded backoff (2/5/10/30 seconds, stop automatic attempts after2 minutes), preserve safe stale display, and keep manual refresh available.
- 401/403 pauses polling and requires auth/access recovery; network5xx can retry without stopping forever after one error. Do not retry checkout POST automatically.
- Keep managed portal HTTPS host validation and fresh actor checks. Portal bearer URLs are transient, not query cache history. Server-proven checkoutResume may exist in this owner-scoped short-lived memory cache only; never persist it or expose another owner's record.

- Do not disable an authorized catalog READ merely because checkout is uncertain, reconciliation is required or purchasing is denied. Keep lifecycle freshness/identity checks; catalog visibility must never enable a purchase. A failed/disabled read exposes an explicit state rather than an empty options section.

## Explicit non-scope

- SDK initialization/event bus → spec 46.
- Checkout action controller → spec 53.
- Page/router presentation → spec 59.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read current hook keys/refetchInterval and API client refresh behavior; do not add a second HTTP client.
2. Publish hooks used by new screens, including a catalog read and explicit lifecycle/catalog refresh/invalidation seam.
3. Use fake clock/provider transport in tests to prove retry/stop/resume semantics and cancellation at owner change.
4. Retain full-package test compatibility for old subscription/pricing consumers until route integration retires the old composition.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/51-billing-client-queries.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/api.test.tsx` passes: malformed/foreign data is rejected safely; managed portal permits only HTTPS approved Paddle hosts and rejects userinfo/port/untrusted hosts; no mutation retry. [unit]
- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/queries.test.tsx` passes: pending polls recover after transient failure; timeout shows manual recovery; 401/403 stop; reconnect/focus refresh; owner switch discards old data; linked owner can read catalog without enabling checkout. [unit]
- [x] Focused query tests prove catalog read during reconciliation/checkout-denied state does not invoke checkout or authorize it; a transient lifecycle failure preserves safe stale presentation and explicit manual recovery. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/api.ts src/pages/Subscription/queries.ts src/pages/Subscription/api.test.tsx src/pages/Subscription/queries.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-07** — Started the next sequential unit with current guide/tracker, contract45/parser and repair-plan/inventory context. Added validated lifecycle/catalog/checkout boundaries, approved transient managed-portal URL validation, private company/owner query keys/cancellation/removal and recoverable pending polling with2/5/10/30-second backoff, two-minute budget and explicit manual recovery. Catalog reads are independent of purchase uncertainty/permission; no read can mutate checkout. Existing Redux auth, TanStack cache and Axios credential/refresh boundary remain in place. No external issue/PR bookkeeping performed by this request.

Lead scope decision: strict catalog parsing exposed the incumbent SubscriptionPage.test.tsx synthetic productId pro_fixture as malformed; early foreign-company rejection also intentionally changes two visible error expectations. Applied exactly three test-only fixture/assertion corrections in that future59-owned file to keep the existing39 security/action regressions meaningful without weakening validators or editing the runtime page. No concurrent worker owns that file in this sequential run. Its future59 ownership remains intact; no route/UI work is pulled into51.

Focused command `npm run test:components --prefix frontend -- src/pages/Subscription/api.test.tsx src/pages/Subscription/queries.test.tsx src/pages/Subscription/SubscriptionPage.test.tsx` exited0:75 tests (21 API +15 query +39 incumbent page). Earlier fake-clock timing assertions needed a one-millisecond query-notification flush; corrected the harness and proved recovery after a transient failure. Added owner switch/unmount cancellation and discarded late-response tests, catalog reads during linked/reconciliation states, no automatic POST retry, portal allowlist/port validation and manual recovery/invalidation tests. Fake timers and synthetic no-network API responses only; no mocked fixture is claimed as deployed payment/session proof.

In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/api.ts src/pages/Subscription/queries.ts src/pages/Subscription/api.test.tsx src/pages/Subscription/queries.test.tsx src/pages/Subscription/SubscriptionPage.test.tsx` exited0 after removing an unnecessary regex escape and making effect dependencies explicit. `git diff --check` passed. Complete unit/build results follow; no unavailable operator access is inferred as a local test pass.

**2026-11-07** — Whole-package compatibility review found two more parser-boundary assumptions: SetupPage.test.tsx supplied only ownerVerified/billingConfigured/company.plan rather than a valid lifecycle, and WorkspaceGate.test.tsx expected a foreign payload to reach its page-level mismatch message. Lead approved one synthetic fixture completion and one early-error expectation update; all production pages/gate source remain untouched. The expanded focused command adding src/pages/Setup/SetupPage.test.tsx and src/components/onboarding/WorkspaceGate.test.tsx passed110 tests across5 files. Tenant denial/no exposed operational subtree and operational readiness semantics are retained; no assertion was deleted or test skipped. Initial full suite recorded619 passed/2 failures until those compatibility fixtures were corrected; final full suite follows.

**2026-11-07** — Final `npm test --prefix frontend` exited0:81 Node tests and621 Vitest tests across40 files, no failures/skips. Final `npm exec -- tsc -b` and expanded changed-file ESLint (including the test-only compatibility exceptions) exited0 with no diagnostics/warnings. No required negative security test was removed. Full log /tmp/spec51-tests-final.log; expanded focused log /tmp/spec51-focused-expanded.log. Final production build follows. Existing frontend-mobile module-type warning is unrelated; no new package, persistence or HTTP client introduced.

**2026-11-07** — Final `npm run build --prefix frontend` exited0 (TypeScript + Vite; only the non-failing plugin-timing warning). Required focused/full/static/build checks passed; marked51 Done and recorded inventory51. Existing credential refresh serialization remains unchanged; this unit introduces no retry for lost/failed purchase responses. No frontend route/runtime page/gate, backend/provider/configuration/live account/deployment/Git-history change was made. Managed browser/provider acceptance and actual reported-account recovery remain external62/63 requirements. Next sequential unit52 owns the signup screen;53 is now ready to consume the SDK/query seams.

**2026-11-08** — Owner51 timing refinement: confirmation must keep its bounded GET polling while an AWAITING_PROVIDER customer still has a proven saved draft. A new controlled-clock query regression first failed (no second read), then passed after removing the draft-presence exclusion from the pending predicate. Plan/payment screens still do not request polling; existing subscriptions/true permission and denied actors still stop. Focused query16 passed; new managed delayed-delivery case and complete frontend/build/lint verification are running. No checkout mutation policy or timeout bound changed.

**2026-11-08** — Draft-confirmation timing verified: query regression16 passed (red before refinement), clean full frontend81 Node +748 Vitest/48 files passed, production build/typecheck/scoped lint passed, and clean focused browser61 passed including automatic delayed permission with a saved draft and no manual refresh/second POST. Logs /tmp/spec51-draft-poll-red.log, /tmp/spec51-draft-poll-green.log, /tmp/billing-final-frontend-tests.log, /tmp/billing-final-frontend-build.log, /tmp/billing-final-poll-lint.log and /tmp/billing-final-focused.log. Poll bound/backoff and existing-subscription/denied stop cases remain green.
