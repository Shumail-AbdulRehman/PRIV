# Spec 11 — Staff task history service

**Status:** Done
**Depends on:** Spec 00
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/mobile/staffHistory.service.ts`, `backend/src/services/mobile/staffHistory.service.test.ts`, `backend/src/services/mobile/staffMonth.ts`, `backend/src/services/mobile/staffMonth.test.ts`, `specs-mobile-redesign/inventory/11-history-service.md`
**Reuses:** `backend/src/services/mobile/staffMobile.service.ts`, `backend/src/utils/dateTime.ts`, `backend/src/controllers/selfAuthorization.test.ts`, `ARCHITECTURE.md#api`

## Goal

A read-only service returns one staff member's finished and missed tasks for a month, with Submitted, Verified and Review closed kept separate, exactly as `ARCHITECTURE.md#api` describes for `GET /history`.

## Scope

**Shared month helper** `backend/src/services/mobile/staffMonth.ts` (specs 12 and 13 depend on this spec and import it; keep its signature stable): `staffMonthContext(actor, monthInput, now, db)` loads the active staff row for `actor.id` in `actor.companyId` (with company active, as `staffMobileTasks` does), picks the timezone (location timezone, else `Asia/Karachi`), computes `latestMonth`, `earliestMonth` (later of the `createdAt` month and 12 months back), validates `monthInput` (`YYYY-MM`, inside the range, default latest) and returns `{ staff, timezone, month, range, start, end }` using `getZonedMonthRange`. Invalid month is `ApiError(400, 'Choose a month from your history')`. Non-staff actor is `ApiError(403, 'Staff account required')`; no active staff row is `ApiError(403, 'Active staff account required')`.

**Service** `staffTaskHistory(actor, input, now = new Date(), db = prisma)` in `staffHistory.service.ts`:
1. Parse `input` with Zod: `month` optional, `filter` in `all|verified|waiting|missed` default `all`, `cursor` optional string up to 512, `limit` 1 to 50 default 30.
2. Get the month context.
3. Read tasks with Prisma: company scope through `location.companyId`, `isActive`, status not `CANCELLED`, `date` in `[start, end)`, and responsibility (`staffId = actor.id` or `assignments.some({ staffId: actor.id, status in STARTED, COMPLETED, MISSED, FAILED })`). Select only what the row needs: ids, title, `areaNameSnapshot`, `date`, `shiftStart`, `shiftEnd`, `status`, `staffSubmittedAt`, `startedAt`, `completionOutcome`, `location` (`id`, `name`, `timezone`), the actor's own assignments (status), `verificationException` (`state`), and mandatory evidence requirement states (through `verificationItems.requirements`).
4. Classify each row with the status and `reviewState` rules in `ARCHITECTURE.md#api`. Drop still-open rows.
5. Compute `counts` over all classified rows of the month, then apply the filter, order `date` desc, `shiftStart` desc, `id` desc, and page with an opaque base64url cursor that carries `month`, `filter`, and the last row's `date`, `shiftStart`, `id`. A cursor whose `month` or `filter` differs is `ApiError(400, 'Refresh your history')`.
6. Return the response object (no envelope; the route adds it).

Keep the query bounded: one task query for the month (a staff member has at most a few hundred tasks a month) is acceptable; say in the Log how many rows a worst case reads.

## Explicit non-scope

- The HTTP route → spec 18.
- Attendance and profile figures → specs 12 and 13.
- Any write, migration or index → spec 00 (never in this plan).
- Photos, scores, issue reasons, manager notes → spec 00 (never returned).

## Reuse first

- Copy the tenant and active-staff guard from `staffMobileTasks` in `staffMobile.service.ts`; do not invent a looser one.
- Use `getZonedMonthRange` and `getZonedDayRange` from `utils/dateTime.ts`; use `formatInTimeZone` (already used by the backend) for local dates.

## Steps

1. Write `staffMonth.ts` and its test.
2. Write the service and its test with Prisma mocked (`vi.mock('../../prisma/prisma.js')`), or pass a fake `db`.
3. Write the inventory fragment.

## Done when

- [x] `cd backend && npx vitest run src/services/mobile/staffMonth.test.ts` passes: default month is the current month in `Asia/Karachi`; a month before `createdAt` or more than 12 months back is 400; a manager actor is 403 before any read. [unit]
- [x] `cd backend && npx vitest run src/services/mobile/staffHistory.service.test.ts` passes: the task query's `where` contains the company scope, the month bounds, `status not CANCELLED`, `isActive` and the actor responsibility clause; each of the five statuses and three review states is produced from crafted rows; an open in-progress task is dropped; a reassigned-away task where the actor's assignment is `REASSIGNED` is excluded; `counts` ignore the filter; paging with `limit` 2 returns a cursor and the next page continues without repeats; a cursor for another month is 400; no field named like `image`, `url`, `score` or `note` appears in the output. [unit]
- [x] `cd backend && npx vitest run --maxWorkers=2` passes with 0 failures; real count in the Log. [unit]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-11-12** — Built `staffMonth.ts` (`staffMonthContext`, guard copied from `staffMobileTasks`: `id`, `companyId`, `isActive`, `company.isActive`; role check before any read) and `staffHistory.service.ts` (`staffTaskHistory`, pure `classifyHistoryTask`). Tests: `staffMonth.test.ts` 15/15, `staffHistory.service.test.ts` 9/9; whole backend suite `--maxWorkers=2` 116 files passed, 1 skipped; 2589 tests passed, 7 skipped, 0 failures; `tsc --noEmit` 0 errors; `npm run build --prefix backend` exit 0. Worst-case read: one `taskInstance.findMany` for the month (Prisma issues it as the task query plus batched relation reads for assignments, exception, items and requirements). At 10 tasks a day that is about 310 task rows, each with 1 to 3 of the actor's assignments and roughly 20 to 60 mandatory requirement states; no `take` cap because `counts` need every row of the month. Paging is done in memory over the classified rows.
- **Interpretation (contract gap):** `ARCHITECTURE.md#api` says "submitted" without saying by whom. A submission or `completionOutcome` counts only when the task is still the actor's (`staffId = actor.id`) or the actor's own assignment is `COMPLETED`; otherwise a task the actor `FAILED`/`MISSED` and someone else finished shows as `MISSED`, never as the other person's `VERIFIED` (keeps "never other staff"). "The actor's assignment" is the current one, else the newest by id. `reviewState` and `photos` stay task-level as the contract says. Mandatory requirements are those with `mandatory` on both the item and the requirement (same rule as `staffSubmission.service.ts`). `submittedAt` is `staffSubmittedAt` only, so a legacy `COMPLETED` row without it shows `SUBMITTED` with `submittedAt: null`. Location activity is not filtered (history of a since-closed location still shows).
- **Not verified:** nothing against a real database (Prisma mocked; the `where`/`select` shape is type-checked against the generated client only). No route exists yet (spec 18).
