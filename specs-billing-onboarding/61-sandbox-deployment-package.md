# Spec 61 — Prepare deployment diagnosis and sandbox release checks

**Status:** Done
**Depends on:** Spec 48, Spec 49, Spec 59
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `backend/SANDBOX_BILLING.md`, `docs/implementation/billing-deployment-checklist.md`, `specs-billing-onboarding/inventory/61-sandbox-deployment-package.md`
**Reuses:** `frontend/public/_redirects`, `backend/src/config/paddle.ts`, `frontend/src/lib/paddle.ts`, `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `INVENTORY.md#cookies-and-hosting`

## Goal

Leave an operator-ready Netlify/Heroku/Paddle sandbox release package with exact prerequisites, diagnosis branches, rollback and acceptance evidence.

## Scope

- Bind intended frontend/backend revisions. Inventory required Netlify build variables, Heroku runtime variables, six sandbox catalog pairs, default link and signed webhook delivery configuration.
- Record required frontend /api base, sandbox/test_ token family and rebuild requirement; backend sandbox/enabled flag, API key/webhook-secret validity, checkout URL and secure cookie/CORS settings.
- Verify provider prices/products are active, monthly/yearly pairs match, and any trial actually requires a payment method for this requested card flow. Do not invent or silently change amount/trial terms.
- Document no-Help/Contact UI scope separately from preserved production policy guards. Removing a contact button does not mean changing production prerequisites.
- Prepare operator commands/checklist without printing credentials. No actual release, billing-flag mutation or sandbox purchase in this documentation unit; candidate deployment follows local browser acceptance.

The final external/clean-suite report is `docs/implementation/billing-final-verification.md`, written by spec63; name it as the release evidence destination rather than publishing an unsupported success claim here.

- Execute read-only diagnosis as soon as authorized operator evidence is available, using docs/plan-project/billing-onboarding/repair-2026-11-07/planning/repair-plan.md. Record actual failing stage/status, sanitized provider category, reservation/READY correlation and release SHAs; unavailable access remains an open fact, never a guessed cause. No live-data repair is authorized by this documentation spec.

## Explicit non-scope

- Managed browser tests before release → spec 62.
- Actual operator deployment and provider acceptance evidence → spec 63.
- Any unsupported production policy/trial changes → spec 44.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read confirmed deployment intake and current runbook; replace stale setup instructions with the actual route/SDK/contract design.
2. Add a symptom table: disabled flag/catalog, browser/server mismatch, stale Netlify build, failed session cookie, failed SDK load, unresolved transaction and pending webhook.
3. List exact checks without exposing values: HTTP status/cookie presence/lifecycle booleans/active price IDs/delivery result/release revision.
4. Order release: local tests first; publish the additive backend DTO before the matching frontend build, keeping previous frontend/backend revisions available for rollback; operator confirms/publishes matching sandbox candidate; verify auth/reload, checkout/test card, signed webhook and persisted effective entitlement; record timestamps/revisions.
5. Document rollback to prior frontend/API-base/redirect/config revisions without deleting customer/subscription/audit data; never reset uncertainty to force checkout.
6. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/61-sandbox-deployment-package.md`; append a dated Log only when work starts.

## Done when

- [x] Runbook/checklist names all required settings, diagnosis branches, release order, rollback and external evidence without values/secrets or a claimed deployed pass. [static]
- [x] Checklist separates local uncertainty from proven server hold, lists affected-account evidence/recovery prerequisites and complete reviewed candidate dependencies (including uncommitted DTO files); rollback preserves records and Git history. [static]
- [x] Required automated test commands and the distinction between mocked browser, real SQL and real provider proof are present. [static]
- [x] `npm exec --prefix backend -- tsc -p backend/tsconfig.json --noEmit` and `npm exec --prefix frontend -- tsc -b frontend/tsconfig.json` pass; no new code lint applies. [static]
- [x] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]

## Log

**2026-11-08** — Prepared revised sandbox runbook and checklist from actual source/config. Includes current /api transport, six configured price pairs (current provider availability unverified), release dependency/revision binding, read-only stuck-account branches and history/data-preserving rollback. No actual deployment/config/provider or affected-account mutation. Running required package static/build checks.

**2026-11-08** — Required checks passed. Backend `npm exec --prefix backend -- tsc -p backend/tsconfig.json --noEmit`, frontend `npm exec --prefix frontend -- tsc -b frontend/tsconfig.json`, both package builds exited0; logs /tmp/spec61-backend-build.log and /tmp/spec61-frontend-build.log. Documentation cross-checked against redirect, actual config/SDK/cookies and current plan; no lint applies to Markdown. Exact configured six price IDs listed; no current active price/trial/delivery claim. Runbook/checklist distinguish uncertain browser result, actual server hold, read-only correlation, candidate completeness, actual external acceptance and history/data-preserving rollback. No authorized operator releases/affected-account session or provider inspection supplied; diagnosis/prerequisites explicitly remain pending63. No deployment/config/account/provider mutation performed.
