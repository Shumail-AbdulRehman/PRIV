# Spec 15 — Paddle lifecycle API and configuration

**Status:** Not started
**Depends on:** Spec 14
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/billingLifecycle.service.ts`, `backend/src/services/billingLifecycle.service.test.ts`, `backend/src/routes/billingLifecycle.route.ts`, `backend/src/config/paddle.ts`, `specs/inventory/15-billing-lifecycle.md`
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

- [ ] `npm test --prefix backend -- src/services/billingLifecycle.service.test.ts` passes: Out-of-order/repeated signed events, cross-tenant portal request, duplicate checkout and absent config covered; sandbox lifecycle explicitly required. [unit]
- [ ] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [ ] `npm run build --prefix backend` passes. [static]
