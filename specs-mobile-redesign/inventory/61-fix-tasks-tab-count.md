# Spec 61 inventory: Tasks tab count

- `useTasksBadge` in `frontend-mobile/src/navigation/StaffTabs.tsx` owns the Tasks tab badge, read from the shared `useTodaysTasksQuery(user?.id, false)` (observe only, no fetch or poll). Do not set `tabBarBadge` from a screen with `navigation.setOptions`; tabs mount lazily.
- Test: `frontend-mobile/tests/screens/tasksTabBadge.test.mjs` (mounts `StaffTabs` with the tab navigator stubbed, Tasks never rendered).
