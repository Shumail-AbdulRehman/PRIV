# Spec 61 — Fix: the Tasks tab shows its count from launch

**Status:** Done
**Depends on:** Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/tasksTabBadge.test.mjs`, `specs-mobile-redesign/inventory/61-fix-tasks-tab-count.md`
**Reuses:** `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/screens/TasksScreen.tsx`, `frontend-mobile/src/queries/staff.ts`, `frontend-mobile/src/queries/mobileWork.ts`, `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/auth/AuthContext.tsx`, `frontend-mobile/tests/screens/tasks.test.mjs`, `frontend-mobile/tests/screens/navigation.test.mjs`, `frontend-mobile/tests/screens/part2Wiring.test.mjs`, `DESIGN-SYSTEM.md#components`

## Goal

Right after sign-in or launch, the Tasks tab shows how many tasks are open (blue, or yellow when one needs the person), as the design shows on My day, without the person opening Tasks first. This fixes finding 61 (`docs/plan-project/mobile-redesign/planning/verification.md` §7).

## Scope

Today the count is set from inside the Tasks screen: `TasksScreen.tsx` lines 73 to 88 compute `pendingCount + inProgressCount` (from `tasksQuery.counts`, else by status) and `needsYou` (`groups.needsYou` with `displayFor(taskDisplay(task)).needsYou`) and call `navigation.setOptions({ tabBarBadge, tabBarBadgeStyle })`. Bottom tabs mount lazily, so until Tasks is opened nothing sets the badge. `StaffTabs.tsx` builds every tab's options in `tabOptions` (lines 41 to 47) and only sets the default blue `tabBarBadgeStyle` (line 82).

- Move the badge to the tab level: `StaffTabs` reads today's tasks through the shared `useTodaysTasksQuery` (`queries/staff.ts` line 17, same query key as My day and Tasks) and gives the Tasks tab its `tabBarBadge` and `tabBarBadgeStyle` with exactly today's rule: count is pending plus in progress, hidden at 0; yellow with `ink` text when a task needs the person, otherwise blue with `surface` text.
- The tab level must add no request and no poll of its own: observe the cached query that My day (the initial tab, which fetches on launch) and Tasks already keep fresh (`mobileTaskOptions`, `queries/mobileWork.ts`, polls every 60 s while enabled), for example by passing `enabled = false`. Write in the Log how this was ensured.
- Remove the `setOptions` badge effect from `TasksScreen.tsx` so one place owns the badge; nothing else on that screen changes.
- This spec is the **sole later editor** among specs 56 to 63 of `StaffTabs.tsx` (owned by spec 48, edited by spec 51) and `TasksScreen.tsx` (owned by spec 32), and changes only the badge parts named above.
- Tests: move the badge assertions of `tests/screens/tasks.test.mjs` lines 155 to 166 into the new test (their rule is unchanged; replace them with an assertion that Tasks no longer calls `setOptions` for the badge, Log line). `navigation.test.mjs` and `part2Wiring.test.mjs` mount `StaffTabs`; add only the mocks the new query and auth reads need, keeping every assertion (test-only exception).

## Explicit non-scope

- The History or Profile tabs, tab order, labels or bar style → unchanged (spec 48, spec 51).
- Counting rules or the meaning of "needs you" → unchanged (spec 06 `taskState.ts`).
- A badge on My day or History → not planned (spec 00 design).
- e2e badge checks → spec 52 (the lead reruns e2e after this spec).

## Reuse first

- `useTodaysTasksQuery`, `useAuth`, `groupTodayTasks`, `displayFor`, `taskDisplay`, colour tokens from `tokens.ts`. Do not add a second tasks query or key. The new test uses its own `useLanguage` mock whose `t` fills values (not the shared harness `t()`, which spec 62 changes).

## Steps

1. Add the badge to the Tasks tab options in `StaffTabs.tsx`; remove the effect from `TasksScreen.tsx`.
2. Write `tests/screens/tasksTabBadge.test.mjs` mounting `StaffTabs` with the navigator stand-in style of `navigation.test.mjs` and a mocked tasks query.
3. Adapt the three existing test files as described; run them and the suite.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/tasksTabBadge.test.mjs` passes: with Tasks never mounted, the Tasks tab options carry badge 2 in yellow/`ink` when one of two open tasks needs the person, 9 in blue/`surface` from `counts`, and no badge at 0; English and Urdu; the first case fails on the tree before the change. [unit]
- [x] The same test proves the tab-level read starts no fetch and no poll (the query is observed with fetching disabled, or the Log explains the equivalent). [unit]
- [x] `grep -n "tabBarBadge" frontend-mobile/src/screens/TasksScreen.tsx` prints nothing. [static]
- [x] `tests/screens/tasks.test.mjs`, `tests/screens/navigation.test.mjs` and `tests/screens/part2Wiring.test.mjs` pass; no behaviour assertion was removed except the moved badge test. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- `StaffTabs.tsx`: new `useTasksBadge` calls `useTodaysTasksQuery(user?.id, false)` and passes `tabBarBadge` and `tabBarBadgeStyle` to the Tasks tab only (rule unchanged: pending plus in progress from `counts` else by status, hidden at 0, yellow/`ink` when needsYou else blue/`surface`).
- No extra request or poll: `enabled = false` observes the same cache entry (same key) without fetching, and `refetchInterval` does not run while disabled. My day (initial tab) and Tasks keep the entry fresh. Test asserts every tab-level call passes `enabled === false`.
- `TasksScreen.tsx`: badge effect and its three now-unused locals (`pendingCount`, `inProgressCount`, `needsYou`) removed; nothing else changed.
- Tests: new `tasksTabBadge.test.mjs` (8 tests, en and ur); first case fails before the change (no badge without Tasks mounted). `tasks.test.mjs`: the badge test replaced by "Tasks no longer calls setOptions for the badge" (rule moved to the new test; `lastOptions` helper left unused). `navigation.test.mjs` and `part2Wiring.test.mjs`: only added a `/queries/staff` mock; assertions unchanged.
- Four files run: 41/41 pass. `npm test`: 650/650 pass, 0 fail. `npm run typecheck`: 0 errors. `npm run build:web`: exit 0.
