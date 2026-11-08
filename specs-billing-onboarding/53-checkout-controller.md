# Spec 53 — Coordinate single checkout, resume and provider events

**Status:** Done
**Depends on:** Spec 46, Spec 51
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/useBillingCheckout.ts`, `frontend/src/pages/Subscription/onboarding/useBillingCheckout.test.tsx`, `specs-billing-onboarding/inventory/53-checkout-controller.md`
**Reuses:** `frontend/src/lib/paddle.ts`, `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/queries.ts`, `frontend/src/pages/Help/serviceInformation.ts`, `INVENTORY.md#commercial-readiness`

## Goal

Provide one owner/transaction-scoped action controller that safely opens or resumes checkout and refreshes server facts after provider events.

## Scope

- Before any new POST, verify current owner, refresh lifecycle/capabilities, match browser/server environment and initialize SDK. Missing config must not reserve a transaction.
- Disable duplicate submits. Retain a prepared transaction only for its exact company/owner/plan/interval; reopen it after overlay close without another POST.
- Restore server-proven checkoutResume after reload. Never trust transaction IDs in query parameters/localStorage or replace an unresolved draft to satisfy a changed plan.
- A response lost after POST, a409 or provider uncertain outcome becomes status-first recovery. A known pre-request SDK failure can retry preparation. If open throws after a valid prepared response, retain that ID and freshly recheck the server before reopening that same draft; never prepare a replacement.
- Correlate event transaction and current owner, clean listeners/abort work on unmount or account change, invalidate current lifecycle/current-user caches after completed/closed events.
- Preserve live commercial/verification guards headlessly with neutral unavailable copy; sandbox uses existing bypass. Remove Help/Contact actions, not production protections.

## Explicit non-scope

- Payment/recovery presentation → spec 55.
- Server reservation policy → spec 49.
- Confirmation UI → spec 56.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read the incumbent SubscriptionPage action sequence and SDK/query seams; move behavior into the new hook without losing its negative cases.
2. Define explicit action states (idle/loading/open/pre-submit error/uncertain/pending) and expose safe current errors/callbacks for screens.
3. Initialize SDK before mutation, recheck fresh identity after awaited calls, and validate server-returned transaction ID before open.
4. Add controlled event/transport fixtures and prove exactly-one mutation across double click, close/reopen, late completion and account switch.
5. Never use browser completion to set paid/ready fields or clear server reconciliation uncertainty.
6. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/53-checkout-controller.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/useBillingCheckout.test.tsx` passes: SDK/config failure causes0 POST; double click1 POST; close/reopen or an open failure after preparation retains the same transaction with no second POST; response loss blocks retry; fresh linked/restricted record cancels action; wrong-transaction event ignored; owner switch/unmount ignores late response; sandbox/live guard parity. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/useBillingCheckout.ts src/pages/Subscription/onboarding/useBillingCheckout.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-07** — Started assigned sequential unit after current guide/tracker, completed46 SDK/51 validated query/API seams, repair-plan and incumbent checkout sequence review. Confirmed installed PaddleEventData transaction_id and CheckoutEventNames symbols. Added only the owner-scoped checkout hook/test/inventory. Reused actual auth/API/parser, query keys, singleton and headless commercial policy functions; no new UI, state library, checkout endpoint, browser test switch or production-policy bypass. No issue/PR bookkeeping performed by this local request.

**2026-11-07** — Focused `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/useBillingCheckout.test.tsx` exited0:37 tests. Tests cover0POST before invalid SDK/config; synchronous duplicate lock; same prepared ID after close/open error/reload; exact saved plan/year; plan-change prevention; lost/409/malformed-response status-first hold; fresh linked/restricted/foreign/late-actor denial; transaction-correlated close/completion/payment-failure signals; no browser entitlement grant; owner change/unmount cancellation and overlay/listener/cache cleanup; retained production prerequisites and sandbox bypass. Added synchronous close-during-open regression and unobserved private-cache removal while reviewing cleanup; all focused reruns passed. Test transport and SDK/provider event boundaries are synthetic/no-network; no actual provider transaction/account/payment created or claimed.

Inventory53 records the public status/prepared/action/message contract, mounted-owner lifetime, fresh resume requirements and downstream screen/query responsibilities. Controller writes only validated current server reads to the private lifecycle key; events invalidate lifecycle/current-user and never mutate paid/ready flags. Browser storage/query parameters never restore transaction IDs. Final whole-package/static/build evidence follows. No UI/router/backend/configuration/deployment/Git-history change.

**2026-11-07** — Initial full `npm test --prefix frontend` exited0:81 Node +672 Vitest tests across42 files. Typecheck/scoped ESLint exited0. Final cleanup review moved session subscription/teardown to useLayoutEffect, so stale callbacks/requests are retired as an owner switch commits rather than waiting for passive effect cleanup;37 focused tests reran successfully after that change. Final whole/static/build reruns follow. Hook contains no JSX/UI and no shared source changes; no visual-design or browser fixture is introduced.

**2026-11-07** — Added a same-owner signout/sign-in regression during lifecycle cleanup review: displayed prepared/status state must not revive merely because numeric owner/company IDs match an earlier session. State now compares a memoized identity-generation object, which is replaced across signout/account changes; the mutable request/SDK session stays effect-owned. Focused38/38 passed. Re-ran whole/static checks after this bounded identity fix; final results follow. No shared auth/session code changed.

**2026-11-07** — Final focused command exited0:38 tests. Final `npm test --prefix frontend` exited0:81 Node tests +673 Vitest tests across42 files, no failures/skips. In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/useBillingCheckout.ts src/pages/Subscription/onboarding/useBillingCheckout.test.tsx` exited0, no diagnostics/warnings. `git diff --check` passed. Logs /tmp/spec53-focused.log and /tmp/spec53-tests-final.log. Existing frontend-mobile module-type warning remains unrelated. Final production build follows.

**2026-11-07** — Final `npm run build --prefix frontend` exited0 (TypeScript + production Vite, non-failing plugin-timing warning only). All required local checks passed; marked53 Done and recorded inventory53. No actual provider payment, UI route/controller mounting, backend policy/data repair, environment/deployment mutation, Git commit/push or history rewrite performed. Actual reported-account and deployed sandbox acceptance remain external gates;10 specs54–63 remain. Next sequential unit54 builds real plan selection against completed47/50/51.
