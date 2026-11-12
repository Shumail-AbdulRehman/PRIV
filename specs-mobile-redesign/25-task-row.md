# Spec 25 — Task row

**Status:** Done
**Depends on:** Spec 05, Spec 20
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/TaskRow.tsx`, `frontend-mobile/tests/design/taskRow.test.mjs`, `specs-mobile-redesign/inventory/25-task-row.md`
**Reuses:** `frontend-mobile/src/design/StatusMarker.tsx`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/format.ts`, `frontend-mobile/src/design/taskState.ts`, `DESIGN-SYSTEM.md#components`, `design/mobile-redesign/v3/views.js`

## Goal

My day, Tasks and History list tasks with one row: round status marker, the area name, the status pill and the time, and an arrow.

## Scope

`TaskRow` props: `name` (entered area name, never translated), `kind` (from `taskDisplay` or `historyDisplay`), `position` (for not-started markers), `start`, `end`, `timeZone`, `onPress`, `compact` (My day after check-in), `separator` (draw the hairline above; default true except the first row).

- Layout per `DESIGN-SYSTEM.md#components`: marker, then a column with the name (`rowTitle`, up to two lines) and a wrapping line holding the pill (when the kind has one) and the time range from `timeRange` (spec 05) in `meta` muted; chevron (`ChevronRight`, `subtle`, mirrored in Urdu) at the end.
- Sizes: `rowMinHeight` 76 and `rowPadV` 13; with `compact` 64 and 8. Below `narrowWidth` (window width from `useWindowDimensions`): side padding 16, gap 12, no chevron, separator inset 62.
- Separator: hairline `line` starting after the marker (68 from the start side; 62 when narrow).
- Pressed background `soft`.
- Accessibility: one button whose label reads "{name}, {status}, {time}" (status from the pill label or the marker's hidden label).

## Explicit non-scope

- Grouping and headings → screen specs 30, 32 and 41.
- Navigation on press → spec 30, spec 32 and spec 41 (each screen passes `onPress`).

## Reuse first

- Marker and pill from spec 20, kinds from spec 06, time from spec 05.

## Steps

1. Build the row.
2. Test normal, compact, narrow and Urdu.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/taskRow.test.mjs` passes: a not-started row shows its position and no pill; a retake row shows the "Retake photo" pill; the time reads "12:30 – 1:30 PM" for a same-meridiem window in `Asia/Karachi`; compact sets min height 64; at width 360 the chevron is absent; the accessibility label contains name, status and time; pressing calls `onPress`; in Urdu the name stays untranslated. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in `TaskRow.tsx`. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `TaskRow` (`frontend-mobile/src/design/TaskRow.tsx`) and `tests/design/taskRow.test.mjs` (10 tests, all pass). Whole suite 324 of 324 pass; typecheck 0 errors; `build:web` passes; no raw hex in TaskRow.tsx. Pressed state uses onPressIn/onPressOut state (the harness Pressable is a host string, so a style function would not resolve). Urdu arrow mirrors by switching to `ChevronLeft` when `isRTL`. Time is wrapped in `isolate()`, so tests use `includes`. Not verified: 360 by 700 in a browser or device (width behaviour proven by unit test only), font scaling, screen reader. Spec note: `taskState` `PillTone` omits `late`/`warn`, which is fine since Pill accepts a superset.
