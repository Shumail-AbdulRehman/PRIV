# Spec 32 — Real subscription lifecycle UI

**Status:** Not started
**Depends on:** Spec 15, Spec 27, Spec 28
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`, `frontend/src/pages/Subscription/queries.ts`, `specs/inventory/32-billing-ui.md`
**Reuses:** `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/types.ts`, `frontend/src/lib/paddle.ts`, `frontend/src/pages/Pricing/PaddlePricing.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/billing.html`

## Goal

Real subscription lifecycle UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Display real capacity/provider period/status/activation/sync and restricted-account recovery. Existing subscribers use portal; absent approved catalog/terms disables checkout with explanation. No hardcoded pricing/trial claims. No records deleted when over limit.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Subscription/SubscriptionPage.test.tsx` passes: Unconfigured catalog cannot checkout; linked subscriber invokes portal not new purchase; delayed webhook shown pending; owner access retained. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]

- **2026-10-21** — Serialized setup integration ownership transferred to28 for existing route/nav/translation/form/readiness/API seams. Preserve previous behavior; subsequent feature edits must amend ownership again.
