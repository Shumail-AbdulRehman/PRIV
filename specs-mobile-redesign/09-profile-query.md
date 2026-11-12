# Spec 09 — Profile read for Part 1

**Status:** Done
**Depends on:** Spec 00
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/src/queries/profile.ts`, `frontend-mobile/src/queries/profile.test.ts`, `specs-mobile-redesign/inventory/09-profile-query.md`
**Reuses:** `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/queries/staff.ts`, `backend/src/controllers/staffSelf.controller.ts`

## Goal

The Profile screen can read the staff member's own details from the endpoint that exists today.

## Scope

`GET /api/staff/profile/me` (client path `/staff/profile/me`) returns, inside the `{ data }` envelope: `id`, `name`, `email`, `phone` (nullable), `role`, `isActive`, `companyId`, `locationId` (nullable), `createdAt`, `updatedAt`, `shiftStart` and `shiftEnd` (nullable instants).

In `src/queries/profile.ts`:
- `StaffProfile` type with the fields above.
- `parseStaffProfile(value)`: defensive parse; returns null for a missing or malformed body; keeps nulls as nulls; ignores unknown fields.
- `fetchStaffProfile(http, signal)`: takes the HTTP client as a parameter (so tests pass a stub), calls the path, parses.
- `profileQueryKey(staffId)`: `['staff', staffId, 'profile']`.
- `useStaffProfileQuery(staffId, enabled)`: TanStack `useQuery` using the real `client`; `staleTime` 5 minutes; `enabled` only with a staff id.

## Explicit non-scope

- The Part 2 profile summary (location, company, manager, month figures) → spec 17.
- The screen → spec 37.
- Editing profile details (staff cannot) → spec 00 (not in this plan).

## Reuse first

- Use `client` from `src/api/client.ts` so token refresh and the account scope work.
- Key shape follows `staffQueryKeys` in `src/queries/staff.ts`; do not edit that file.

## Steps

1. Write the module.
2. Test the parser and fetcher with a stub client.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/queries/profile.test.ts` passes: a full body parses; a body with `phone: null` keeps null; a body missing `name` returns null; the fetcher calls `/staff/profile/me` once and passes the abort signal; the key includes the staff id. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `frontend-mobile/src/queries/profile.ts` (parser, fetcher, key, hook) and `profile.test.ts`. Profile test file: 6/6 pass. Mobile suite: 192/192 pass (`npm test --prefix frontend-mobile`). Typecheck: 0 errors. `npm run build:web`: passes. Design choice: `parseStaffProfile` takes the inner profile object and `fetchStaffProfile` unwraps the `{ data }` envelope; a malformed envelope resolves to null (not an error), as the spec's parse rule implies. Nullable fields treated as null when absent. The test imports `profile.ts`, which imports `client` (and so AsyncStorage) transitively, the same as `mobileWork.test.ts` does; the test file itself does not import React Native. Not verified: nothing on device; the hook is not exercised against a live server.
