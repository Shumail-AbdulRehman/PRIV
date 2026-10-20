# Spec 01 — P0 actor-safe self endpoints

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #1
**Owns:** `backend/src/controllers/staffSelf.controller.ts`, `backend/src/controllers/selfAuthorization.test.ts`, `backend/src/routes/staff.route.ts`, `specs/inventory/01-actor-self-authorization.md`
**Reuses:** `backend/src/controllers/staff.controller.ts`, `backend/src/controllers/attendance.controller.ts`, `backend/src/middlewares/authorize.middleware.ts`

## Goal

P0 actor-safe self endpoints in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Move staff-only self reads to focused controllers. Require STAFF at route and controller boundaries; constrain profile and attendance by authenticated company, staff role and active actor. Retain recent-own-attendance limit and response shape. Keep existing write/list handlers. Reject owners/managers before any Staff query even when numeric IDs collide across tenants.

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

- [x] `npm test --prefix backend -- src/controllers/selfAuthorization.test.ts` passes: Colliding ADMIN/MANAGER IDs never query Staff/Attendance; missing actor fails; STAFF queries include company and role and return only safe fields. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/1. No production DB needed; test DB boundary mocked.
- **2026-10-20** — Implemented new self controllers and route STAFF gates. Targeted tests 9/9; whole backend 591/591 (66 files); Prisma generate + TypeScript build passed. No DB/provider integration performed or needed for this read-authorization unit. Legacy unused handler exports will be delegated by their owning specs 02/05. PR publication pending clean scoped commit; unrelated dirty changes preserved.
- **2026-10-20** — Serialized storage-boundary integration transfers current edit ownership of `backend/src/controllers/attendanceSelf.controller.ts` to spec05; earlier authorization checks remain mandatory.
- **2026-10-20** — Current attendance router ownership transfers to spec05 to mount photo routes; STAFF self gate preserved.
- **2026-10-20** — Scoped commit published as draft https://github.com/Shumail-AbdulRehman/PRIV/pull/7; stacked on previous spec branch, not merged. Unrelated pre-existing changes excluded.
