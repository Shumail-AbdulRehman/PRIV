# Spec 14 — Account access and capacity policy

**Status:** Done
**Depends on:** Spec 10
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #33
**Owns:** `backend/src/middlewares/accountAccess.middleware.ts`, `specs/inventory/14-entitlement-policy.md`
**Reuses:** `backend/src/services/subscription.service.ts`

## Goal

Account access and capacity policy in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Implement D01/D03 as one plain policy shared by mutations and jobs. Suspension denies operational access; owner billing/security/support allowed. Unentitled active accounts keep reads and only already-started work completion. Serialize quota-consuming creates with account/subscription state; preserve existing manager assigned-site access and existing records on downgrade. Wire exact route/job consumers in spec 26/39; no second billing engine.

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

- [x] `npm test --prefix backend -- src/services/accountAccess.service.test.ts` passes: Policy table covers each role, suspended/unentitled/over-limit state and in-progress completion; quota race cannot exceed limit. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed issue33. Implement shared policy/capacity contract against existing provider mirrors/plan limits; old route/job adapters are explicitly26/39. No commercial grace, free entitlement or price invented. Provider lifecycle qualification remains15/39/40.
- **2026-10-20** — Local policy contract complete:53 new tests;980 full backend tests/82 files with isolated PG enabled/no skips; build/typechecks pass. Actual isolated PostgreSQL proves quota race one winner, oversized creator rollback, persisted start entitlement after expiry, unproven legacy completion denied, downgrade history/manager reads retained and suspension/owner billing/security boundaries. No billing/provider/production mutations.
- **2026-10-20** — Exact route/start/job integration remains26/39, provider mirror synchronization15. Record WORK_ENTITLEMENT_GRANTED in the same successful start/check-in transaction; completion reads that own-work audit and exact persisted start. Never infer a legacy grant or trust body timestamps. Existing legacy subscription-only gates remain until their explicit handoff.

- **2026-10-20** — Current account policy/test/integration ownership transferred to15 to enforce verified environment catalog linkage at the existing provider read seam; original policy/capacity behavior preserved.
