# Spec 32 — Real subscription lifecycle UI

**Status:** Done
**Depends on:** Spec 15, Spec 27, Spec 28
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #69
**Owns:** `docs/implementation/BILLING.md`, `frontend/src/pages/Subscription/api.ts`, `frontend/src/pages/Subscription/types.ts`, `frontend/src/pages/Subscription/billing.css`, `frontend/src/i18n/billingTranslations.ts`, `frontend/src/i18n/translations.ts`, `frontend/src/pages/Pricing/PaddlePricing.tsx`, `frontend/src/pages/Pricing/ChoosePlanPage.tsx`, `frontend/src/pages/Pricing/WelcomePage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`, `frontend/src/pages/Subscription/queries.ts`, `specs/inventory/32-billing-ui.md`
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

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/SubscriptionPage.test.tsx` passes: Unconfigured catalog cannot checkout; linked subscriber invokes portal not new purchase; delayed webhook shown pending; owner access retained. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Serialized setup integration ownership transferred to28 for existing route/nav/translation/form/readiness/API seams. Preserve previous behavior; subsequent feature edits must amend ownership again.

- **2026-10-21** — Issue69 claimed. User authorizes32 only; verified15/27/28 Git ancestry and full specification. Base b21dcca on completed31/36 verification checkpoint (both prior PRs remain independent/open). Serialized API/types/dictionary and existing public/legacy checkout entry-point ownership transferred before edits; remove unsafe price-only purchase rather than add a parallel checkout. Preserve original eight dirty files using /tmp/hygene-spec32-preserved.json. No production/provider operation authorized.

- **2026-10-21** — Implemented actual owner billing lifecycle/catalog and fresh server transaction/managed portal handoffs. Company/owner-scoped queries and keyed principal subtree, current identity/lifecycle rechecks, abort/late-response guards and duplicate-click lock. Existing subscribers use portal; unconfigured catalog/terms, unverified owner, restricted checkout and unresolved reservations cannot purchase. Server-returned transaction only (no client price/customer/customData); prepared checkout reopened without another POST. Uncertain responses block new payment and require explicit refresh/reconciliation; receipt/return never grants active status. Provider periods/scheduled changes/last-event facts and currency precision/trialPeriod are real; capacity overages preserve records. Legacy public/choose-plan/welcome unsafe paths replaced with canonical owner billing entry, preserving read-only public capacity and inquiry. No backend business rule, schema, dependency, live provider operation or production change.
- **2026-10-21** —23focused component tests; exact full frontend57Node+165React/13files, zero failures/skips; full frontend lint0 and TypeScript/Vite build pass (non-failing existing plugin timing advisory). Backend109 focused/3files (billing lifecycle, account access, auth) pass; backend source unchanged, no database/production/provider requests. Network and Paddle/browser boundaries mocked; not live payment qualification.16 actual built-app synthetic render cases EN/UR390/1440 (unconfigured/linked/pending/suspended), zero overflow/JS errors/POSTs, all billing buttons48px; desktop EN and mobile Urdu visually reviewed. Source detector[]. Initial source-server visual harness intercepted module URLs; corrected to built-preview network interception, with no application defect. Logs `/tmp/hygene-spec32-{focused-final,web-tests-final,backend-focused,lint-final,build-final,render-final}.log`; captures `/tmp/hygene-spec32-visual/`. Original eight dirty files verified unchanged. All acceptance criteria verified at scoped UI/API seam; live merchant/catalog/terms/sandbox/webhook/device release gates stay39/40.

- **2026-10-21** — Published implementation9a08f78 in OPEN/DRAFT PR70: https://github.com/Shumail-AbdulRehman/PRIV/pull/70, base implementation/spec-31-36-verification atb21dcca; issue69 remains open for human review. No merge/deploy. Final metadata checkpoint records publication; next eligible33 identified only, STOP.
