# Spec 18 — Staff history, attendance month and profile routes

**Status:** Done
**Depends on:** Spec 11, Spec 12, Spec 13
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/routes/staffMobile.route.ts`, `backend/src/routes/staffMobile.route.test.ts`, `specs-mobile-redesign/inventory/18-staff-routes.md`
**Reuses:** `backend/src/services/mobile/staffHistory.service.ts`, `backend/src/services/mobile/staffAttendanceMonth.service.ts`, `backend/src/services/mobile/staffProfileSummary.service.ts`, `backend/src/routes/launch.route.test.ts`, `ARCHITECTURE.md#api`

## Goal

The three Part 2 endpoints are reachable at `/api/staff/mobile/history`, `/api/staff/mobile/attendance/month` and `/api/staff/mobile/profile`, for staff only, with the same envelope and error handling as the existing staff routes.

## Scope

In `staffMobile.route.ts`, add three `GET` handlers after the existing two, each one line like the existing ones: call the service with `req.user!` and `req.query` (or nothing for profile) and respond `{ success: true, data }`. Register `/attendance/month` **before** anything that could match `/attendance` with a parameter (Express 5 matches in order; today `/attendance` has no parameter, so order only needs to stay explicit). The router-level `verifyJwt` and `authorize('STAFF')` already apply. The existing Zod error mapping at the bottom converts validation errors to 400 "Invalid mobile query"; keep it. `ApiError` from the services passes through.

Add a `Cache-Control: private, no-store` header on the three new responses (personal records).

Do not edit `backend/src/app.ts`; the router is already mounted at `/api/staff/mobile`.

## Explicit non-scope

- Service logic → specs 11 to 13.
- Rate limits, caching layers or pagination changes to existing routes → spec 00 (not in this plan).

## Reuse first

- Follow `routes/launch.route.test.ts` for the route test: build an Express app with the router, sign a token with the test secret, mock the Prisma principal lookup and the three services, call with `fetch`.

## Steps

1. Add the handlers and header.
2. Write the route test.

## Done when

- [x] `cd backend && npx vitest run src/routes/staffMobile.route.test.ts` passes: anonymous calls to each new path are 401; a manager token is 403; a staff token reaches each service with `req.user` and the query, and gets `{ success: true, data }` with `Cache-Control: private, no-store`; `month=2026-13` reaches the service and its 400 passes through; the existing `/tasks` and `/attendance` routes still respond. [unit]
- [x] `cd backend && npx vitest run --maxWorkers=2` passes with 0 failures; real count in the Log. [unit]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. [static]
- [x] `npm run build --prefix backend` passes. [static]
- [ ] Optional, only with an isolated local test database (`VERIFICATION_TEST_DATABASE_URL` pointing at a `priv_verification_test` database on 127.0.0.1, never production): extend nothing, but run the three services against seeded rows once and record the output in the Log. [requires: isolated local Postgres test database]

## Log

- **2026-11-12** — Added `GET /history`, `GET /attendance/month` and `GET /profile` to `backend/src/routes/staffMobile.route.ts` after the existing `/tasks` and `/attendance` (unchanged), each one line calling the spec 11 to 13 service with `req.user!` (and `req.query` for the first two) and setting `Cache-Control: private, no-store`; the router-level `verifyJwt`, `authorize('STAFF')` and ZodError → 400 "Invalid mobile query" mapping are untouched. `app.ts` not edited. The header is set before the service runs, so an error response from these three paths also carries it. New `backend/src/routes/staffMobile.route.test.ts`: 13 tests pass (401 anonymous and 403 manager for each new path, actor and query reach each service, envelope and header, `month=2026-13` ApiError 400 passes through on history and attendance month, ZodError maps to "Invalid mobile query", existing `/tasks` and `/attendance` still respond and stay guarded). It uses a minimal local ApiError handler instead of importing `launchErrorHandler` (whose module graph needs many more mocks). Full backend suite: 119 files passed, 1 skipped; 2631 tests passed, 7 skipped, 0 failures. `tsc --noEmit` 0 errors. `npm run build --prefix backend` exit 0. Checked against the mobile client: `frontend-mobile/src/queries/history.ts` calls `/staff/mobile/history`, `/staff/mobile/attendance/month`, `/staff/mobile/profile` and reads `response.data.data`, which matches; top-level fields read by `src/history/parse.ts` (`month`, `timezone`, `range`, `counts`, `items`/`records`, `nextCursor`; profile fields) match what the services return. Not verified: the optional seeded-database run (no isolated test database used; no database connection made), and the real app-level error handler on these paths (covered only by the mounted router plus a local handler).
