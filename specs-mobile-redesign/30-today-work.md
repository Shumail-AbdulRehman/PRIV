# Spec 30 — Today's work sheet on My day

**Status:** Done
**Depends on:** Spec 25
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/day/TodayWork.tsx`, `frontend-mobile/tests/day/todayWork.test.mjs`, `specs-mobile-redesign/inventory/30-today-work.md`
**Reuses:** `frontend-mobile/src/design/TaskRow.tsx`, `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/StaffText.tsx`, `design/mobile-redesign/v3/views.js`

## Goal

Under the top area, a white sheet shows today's progress in ticks and the next few tasks, so a person sees their whole day at a glance.

## Scope

`TodayWork` props: `tasks` (today's feed), `counts` (feed counts, may be undefined), `compact`, `onOpenTask(task)`, `onSeeAll()`, `loading`.

- White sheet with top radius 28 that overlaps the top area by 26; padding top 20 (12 when compact).
- Heading row: "Today's work" (`sectionTitle`) at the start and "{n} of {t} submitted" (`meta` muted) at the end. `n` = done tasks (not open), `t` = all; prefer `counts.submitted` and `counts.total` when present (the feed is paged).
- Tick strip: one 6 high rounded segment per task (up to 12; beyond that, proportional), coloured by kind: green for verified or accepted, blue for submitted, yellow for needs you, half blue for in progress (direction mirrors in Urdu), `line` otherwise.
- Rows: up to three `TaskRow`s. While any task is open, the open tasks by time; when none is open, the first three of the day. `compact` passed through. Position numbers from `position` (spec 06).
- "See all tasks" text link with an arrow (mirrored) at the bottom, 52 high.
- No tasks: the sheet is a short empty block (the sentence above already says "No tasks today").
- `loading`: four skeleton rows (round 34 marker and two lines).

## Explicit non-scope

- The Tasks tab → spec 32. The top area → spec 29.

## Reuse first

- `TaskRow` and `taskDisplay`; no new row style.

## Steps

1. Build the sheet.
2. Test with crafted feeds.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/day/todayWork.test.mjs` passes: with five tasks and one submitted the heading reads "1 of 5 submitted" and shows the three open tasks by time; when all are submitted it shows the first three with ticks; the strip has one segment per task with the right tone tokens; "See all tasks" calls `onSeeAll`; a row press calls `onOpenTask` with that task; loading shows four skeleton rows. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `TodayWork.tsx` and `tests/day/todayWork.test.mjs` (10 tests, all pass). Whole mobile suite 352 pass, 0 fail; typecheck 0 errors; `build:web` passes (TodayWork is not imported by the app until spec 46, so the build does not bundle it). Choices the spec left open: segments in day order; more than 12 tasks collapse into 12 buckets showing the bucket's most attention-needing tone; "done" for the count and the open/closed split comes from `displayFor(kind).open`; area name is `areaNameSnapshot ?? title`, time zone from `location` or `template.location`. The shared harness `t()` drops placeholder values, so the test overrides `/i18n/LanguageProvider` with the real `translate`. Not verified: 360 by 700 layout in a browser or on a device (rows use the width-aware TaskRow, covered by spec 25's unit test), the Urdu line-height of the heading on a device.
