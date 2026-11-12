# Spec 17 — History, attendance month and profile summary queries

**Status:** Done
**Depends on:** Spec 10
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/queries/history.ts`, `frontend-mobile/src/queries/history.test.ts`, `specs-mobile-redesign/inventory/17-history-queries.md`
**Reuses:** `frontend-mobile/src/history/parse.ts`, `frontend-mobile/src/history/types.ts`, `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/queries/mobileWork.ts`, `ARCHITECTURE.md#api`

## Goal

Screens read the three Part 2 endpoints through typed, cached hooks that never crash on an old server.

## Scope

In `src/queries/history.ts`:
- Fetchers that take the HTTP client as a parameter (tests pass a stub): `fetchTaskHistory(http, { month, filter, cursor }, signal)` to `/staff/mobile/history`, `fetchAttendanceMonth(http, month, signal)` to `/staff/mobile/attendance/month`, `fetchProfileSummary(http, signal)` to `/staff/mobile/profile`. Each unwraps `data` and parses with spec 10's parser. A null parse throws an error whose message is "History is unavailable. Try again." so screens show their error state.
- Keys under `['staff', staffId, ...]`: `historyKeys.tasks(staffId, month, filter)`, `historyKeys.attendance(staffId, month)`, `historyKeys.profile(staffId)`.
- Hooks with the real `client`: `useTaskHistory(staffId, month, filter, enabled)` as an infinite query (`initialPageParam` null, `getNextPageParam` from `nextCursor`, pages flattened by id like `flattenTaskPages`), `useAttendanceMonth(staffId, month, enabled)`, `useProfileSummary(staffId, enabled)`. `staleTime` 60 seconds for history and attendance, 5 minutes for profile. `retry` 1. No refetch interval.
- A 404 (server older than Part 2) must not retry and must surface as the same error.

## Explicit non-scope

- Screens → specs 41 to 44.
- Server routes → spec 18.

## Reuse first

- Mirror `mobileTaskOptions` and `flattenTaskPages` in `queries/mobileWork.ts`.

## Steps

1. Write fetchers and hooks.
2. Test fetchers with a stub client (paths, params, parse, error mapping, 404 no retry rule as a pure `shouldRetry` function).

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/queries/history.test.ts` passes: each fetcher calls its exact path with `month`, `filter` and `cursor` params only when given; a contract body parses; an unparseable body throws "History is unavailable. Try again."; `shouldRetry` is false for a 404 and true once for a network error; keys include staff id, month and filter. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built `queries/history.ts` (fetchers, keys, hooks, `shouldRetry`, `flattenHistoryPages`, `HistoryUnavailableError`) and `history.test.ts` (7 tests, all pass). Whole mobile suite: 557 tests, 0 failures. Typecheck 0 errors. `build:web` passed. A 404 is mapped to the same error with a `notFound` flag so `shouldRetry` stops it. Hooks also stay disabled while `month` is empty. Not verified: hooks run against a live server or rendered in a screen (screens are specs 41 to 44); no hook-level test (the spec asks for fetcher and `shouldRetry` tests).
