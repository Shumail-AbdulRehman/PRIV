# Spec 45 — Publish additive billing lifecycle and catalog contracts

**Status:** Done
**Depends on:** Spec 44
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `backend/src/types/billingLifecycle.ts`, `frontend/src/pages/Subscription/types.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.ts`, `frontend/src/pages/Subscription/onboarding/billingContract.test.tsx`, `specs-billing-onboarding/inventory/45-billing-dto-contract.md`
**Reuses:** `backend/src/routes/billingLifecycle.route.ts`, `INVENTORY.md#transport`

## Goal

Publish the exact backend/client DTO and a runtime-safe client boundary before server, query and screen work fan out.

## Scope

- Retain current envelope, company, usage, limits, subscription, providerState, checkoutAvailable and portalAvailable fields; preserve legacy SubscriptionSummary consumers.
- Add workspaceAccessAllowed, sanitized checkoutReadiness, nullable checkoutResume with plan/interval/transactionId, subscription priceId/interval, and provider trial requiresPaymentMethod when known.
- Keep new transport fields optional for existing fixtures/consumers and normalize them at the guard; define explicit null/unknown semantics: absent new server permission is never true; absent resume never authorizes reconstruction of a transaction.
- Define bounded safe readiness reasons for disabled config, owner verification, company restriction, reconciliation, linked subscription and ready. No secret values, provider raw errors or persistent portal URLs.
- Client validation rejects malformed required identity/price/action fields and degrades additive legacy fields to a non-authorizing unknown state; do not import Prisma/backend implementation into Vite.

## Explicit non-scope

- Fetching/populating DTOs → spec 49.
- Query transport and cache → spec 51.
- Rendering derived states → spec 50.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read actual service/API/types and freeze field names/types/nullable rules in the new backend type and existing client module.
2. Add the client guard in billingContract.ts and table fixtures that use the same public wire shape as the backend type.
3. Make backend/client declarations compile against representative no-link, prepared, pending, qualified and restricted fixtures.
4. Document compatibility behavior in the inventory fragment so consumers do not treat older deployments as activated.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/45-billing-dto-contract.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/billingContract.test.tsx` passes: valid owner/catalog records pass; malformed IDs, string booleans, invalid enum/interval/amount shapes fail safely; legacy absent permission/resume never authorize readiness. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/types.ts src/pages/Subscription/onboarding/billingContract.ts src/pages/Subscription/onboarding/billingContract.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-06** — Implemented the additive JSON DTO/client type contract and runtime parsers within assigned ownership. Legacy fields remain source-compatible; absent server permission/readiness/resume normalize false/UNKNOWN/null. Validators reconstruct allowed fields, reject malformed flags/IDs/catalog pairs and preserve exact provider amount strings; no backend authorization, API wiring or UI route behavior changed. Type-only fixtures check backend/client compatibility without bundling server code.

Verification in this session: focused contract Vitest44/44; complete frontend suite64/64 Node and475/475 Vitest (35 files); owned-file ESLint with max-warnings0 passed; npm run build --prefix frontend passed, including tsc -b. Logs: /tmp/priv-spec45-tests.log and /tmp/priv-spec45-build.log. No actual provider/deployment/SQL test was run or claimed. No GitHub issue/PR was created: this session implements locally and no external bookkeeping was requested. Inventory fragment recorded. Per the requested README one-spec-per-fresh-session contract, remaining implementation specs are still Not started.
