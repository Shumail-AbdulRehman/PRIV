# Spec 43 — Finished task details

**Status:** Done
**Depends on:** Spec 07, Spec 17, Spec 20, Spec 21
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/history/HistoryTaskScreen.tsx`, `frontend-mobile/tests/history/historyTask.test.mjs`, `specs-mobile-redesign/inventory/43-history-task-detail.md`
**Reuses:** `frontend-mobile/src/queries/history.ts`, `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/TopBar.tsx`, `frontend-mobile/src/design/format.ts`, `design/mobile-redesign/v3/index.html`

## Goal

Opening a finished task shows what happened, step by step, and the three separate states Submitted, Verified and Review closed (All screens > History: Finished task, Waiting for review, Missed task).

## Scope

New screen `HistoryTaskScreen` (route `HistoryTask`, params `taskId`, `month`). The item comes from the cached `useTaskHistory` pages for that month (search all cached filters); if absent (for example after a cold start), refetch that month with `filter: 'all'` and find it; if still absent, show `ErrorState` "This task is not in your history." with "Back".

- `TopBar` "Task details". Area name (`headline`, untranslated), title muted, then the status pill and "{day}, {date}".
- "What happened" timeline: four steps with round markers joined by a line: Scheduled (the window), Started (time or "Not recorded"), Photos received ("{r} / {t}"), Submitted (time or "Not done"). A step that did not happen has a neutral marker with a minus icon.
- "Status" table (soft background, radius 18): Submitted ("Yes" blue pill, or "Not done" red pill for a missed task); Verified ("Verified" or "Accepted with exceptions" green pill, else neutral "Not yet"); Review closed ("Yes" green when `reviewState` is `CLOSED`, "Not needed" neutral when `NOT_NEEDED` and not verified yet, "Not yet" neutral when `OPEN`).
- Footnote: "Submitted means you finished. Verified means your manager or the check confirmed it."
- No photos, no notes, no reasons (spec 00).

## Explicit non-scope

- Registering the route → spec 51.

## Reuse first

- `historyDisplay` for the pill; no second mapping.

## Steps

1. Build the screen.
2. Test the three example items and the not-found case.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/history/historyTask.test.mjs` passes: a verified item shows all four steps done and the three states as separate rows with "Verified" and review "Yes"; a waiting item shows Verified "Not yet" and review "Not yet"; a missed item shows "Not done" in red and minus markers; an uncached item triggers a refetch, and a missing one shows the not-found error; Urdu renders the footnote translated and the area name untranslated. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built `HistoryTaskScreen` and `tests/history/historyTask.test.mjs`. `historyTask.test.mjs` 10/10; whole mobile suite 577/577, 0 failures; typecheck 0 errors; `build:web` exported. Cache lookup uses `queryClient.getQueriesData` on the `['staff', id, 'history', 'tasks', month]` prefix; the fallback `useTaskHistory(..., 'all', enabled = !cached)`. Spec differences: the not-found state uses `EmptyState` + a "Back" `ActionButton` because `ErrorState` only offers "Try again"; a failed refetch (network) shows the normal `ErrorState` with Try again instead. A verified item with `reviewState` NOT_NEEDED shows Review closed "Yes" (matches the design; spec left it open). The photos step is "done" for every status but MISSED (as in the design). Missing Urdu key in `staffAppTranslations.ts`: "This task is not in your history." (all others already translate). Not verified: device or 360 px visual layout, font scaling, screen reader, and the timeline connector line rendering (only unit-tested for markers).
