# Spec 15 — Paddle lifecycle API and configuration

**Status:** Done
**Depends on:** Spec 14
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #37
**Owns:** `backend/src/services/paddleFulfillment.service.ts`, `backend/src/services/paddleFulfillment.service.test.ts`, `backend/src/services/subscription.service.ts`, `backend/src/controllers/subscription.controller.ts`, `backend/tests/accountCapacity.integration.ts`, `backend/tests/billingLifecycle.integration.ts`, `docs/implementation/BILLING.md`, `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/billingLifecycle.service.test.ts`, `backend/src/config/paddle.ts`, `specs/inventory/15-billing-lifecycle.md`
**Reuses:** `backend/src/services/paddleFulfillment.service.ts`, `backend/src/controllers/paddleWebhook.controller.ts`

## Goal

Paddle lifecycle API and configuration in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Consume14 account window and lock contract: provider mirror/account synchronization takes company→subscription locks consistently with capacity transactions. Replace legacy status-only paid-access callers with qualified current-period policy; preserve provider facts, never invent a trial period.

Reuse provider mirrors/dedup and customer links. Prevent repeat checkout for linked subscriptions; use qualified provider portal for changes. Show provider period/status/sync errors. No client company/plan trust; missing catalog/config returns unavailable, no invented trial or pricing. Reconciliation must not mutate provider financial state implicitly.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Shared visual/navigation composition → spec 27.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [x] `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts` passes: Out-of-order/repeated signed events, cross-tenant portal request, duplicate checkout and absent config covered; sandbox lifecycle explicitly required. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue37. Existing fulfillment is not atomic and links by email/client customData; replace with canonical server-provisioned customer linkage and company→provider locks. Ownership14 transferred for current-period/catalog policy seam. Existing SDK supports portal, native signatures and server draft checkout. Actual provider/catalog/merchant facts unavailable; no live API/financial calls.
- **2026-10-20** — Local backend complete:43 new tests/99 targeted (billing+account+webhook),1023 whole backend tests/83 files on explicit isolatedPG/no skips; build/typechecks pass. Native SDK real HMAC/tamper proof and isolated HTTP router check pass. Actual localPG proves atomic duplicate/rollback/out-of-order customer/subscription/transaction linkage, placeholder convergence, unknown catalog denial, concurrent checkout one-draft and signed-event lost-response reconciliation. No live Paddle requests, payments or production changes.
- **2026-10-20** — Canonical customer linkage replaces email/client companyId. Environment catalog replaces hardcoded price IDs. Reservation holds ambiguous creates; provider-confirmed canceled drafts may retry, paid pending-sync cannot. Metadata/checkout/catalog/portal mounted under /subscription/manage, old portal delegates; browser purchase32 and restricted-company policy26 remain. Actual merchant/catalog/terms/credentials/sandbox remain external disabled boundary, documented BILLING.md.

- **2026-10-20 — Final handoff.** Commit1ea9ae8 pushed on implementation/spec-15-billing-lifecycle; draft [PR38](https://github.com/Shumail-AbdulRehman/PRIV/pull/38) closes [issue37](https://github.com/Shumail-AbdulRehman/PRIV/issues/37) only on eventual merge. TypeScript/project and standalone integrations reconfirmed; isolatedPG billing rerun passes. Complete file/check/blocker/next-unit record in SESSION_HANDOFF.md. User requests stop after15;24 remains Not started. No PR merged or next-spec implementation begun.

- **2026-10-21** — Serialized composition ownership transferred to26: `backend/src/routes/subscription.route.ts`, `backend/src/routes/billingLifecycle.route.ts`. Prior completed behavior retained;26 consumes rather than reimplements this contract.

- **2026-10-21** — Serialized account action/route wiring ownership transferred to26; ancestor behavior preserved.
