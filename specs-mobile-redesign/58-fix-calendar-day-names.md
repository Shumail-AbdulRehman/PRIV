# Spec 58 — Fix: Urdu calendar day names are never cut off

**Status:** Done
**Depends on:** Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/history/calendarDayNames.test.mjs`, `specs-mobile-redesign/inventory/58-fix-calendar-day-names.md`
**Reuses:** `frontend-mobile/src/screens/history/AttendanceCalendar.tsx`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/src/i18n/staffAppTranslations.ts`, `frontend-mobile/tests/history/attendanceHistory.test.mjs`, `DESIGN-SYSTEM.md#type`, `design/mobile-redesign/v3/style.css`, `design/mobile-redesign/v3/NOTES.md`

## Goal

History › Attendance shows every weekday name in full, in English and Urdu, at every window width from 320 up. Today "جمعرات" shows as "جمعرا…" at 390 by 844. This fixes finding 58 (`docs/plan-project/mobile-redesign/planning/verification.md` §7).

## Scope

Why it truncates, from the code: `AttendanceCalendar.tsx` line 60 sets `cell = max(28, floor((width − 16 − 18) / 7))`, and lines 73 to 74 put each name in a box exactly `cell` wide with `numberOfLines={1}`. The size comes from the `calendarHead` role (`tokens.ts` line 181): Urdu 14.5, or 13 when `isNarrow(width)` (below `space.narrowWidth` 375, read by `StaffText` line 121). So at 390 the name gets a 50 wide box at 14.5 and is cut; at 360 it gets 46 at 13 and fits just; at 320 the cell is 40 and even 13 cannot fit. The design does not cut: its grid (`v3/style.css` lines 316 to 318, 392) lets the name run past its column, and `v3/NOTES.md` line 48 sets 13 as the floor.

- Stop limiting a day name to its cell's width. Give each name a label area wide enough for the widest name at its size, centred on its day column, so the columns still line up exactly with the day cells below and the grid's total width does not change. Names stay on one line and never show an ellipsis.
- Size the label area from a measurement, not a guess: in the web export, measure the rendered width of "جمعرات" at 14.5 and at 13 in the `urduBold` face, and of "Wed" at 14 in English; record the numbers in the Log and derive the minimum label width from them (rounded up, with a few points to spare).
- Adjacent names must not touch: the short neighbours of Thursday ("بدھ", "جمعہ") leave room; prove it at 320.
- Keep the type sizes (`calendarHead` 14 and 14.5, 13 narrow); do not add a size below 13 or a new token. English keeps today's look.
- This spec is the **sole later editor** of `AttendanceCalendar.tsx` among specs 56 to 63 (owned by spec 42) and changes only the weekday header row. It may update `tests/history/attendanceHistory.test.mjs` lines 160 to 179, whose "name box equals cell width" assertion describes the old rule (test-only exception, Log line; keep the Urdu names, row direction and narrow-size checks).

## Explicit non-scope

- Day cells, legend, list and day sheet → unchanged (spec 42); times in the day sheet → spec 57.
- Android font scaling above 1 (the `calendarHead` cap is 1.4) → not verified here; device checks stay open (spec 53 §8).
- Shorter Urdu weekday names in `staffAppTranslations.ts` → not planned; it needs a native reader (spec 53 §8).
- e2e layout tests → spec 52 (the lead reruns e2e after this spec).

## Reuse first

- `StaffText` with the `calendarHead` role; `tokens.ts` for any size or gap. The test uses its own `useLanguage` mock whose `t` fills values, not the shared harness `t()` (spec 62 changes it).

## Steps

1. Measure the three widths in the web export and record them.
2. Change the header row of `AttendanceCalendar.tsx`.
3. Write `tests/history/calendarDayNames.test.mjs`; adapt the one old assertion; run them and the suite.
4. Check the rendered header in a browser at the five widths below.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/history/calendarDayNames.test.mjs` passes: in Urdu at widths 320, 360, 375, 390 and 412, each of the seven name areas is at least the minimum width recorded in the Log, its centre equals its day column's centre (within 0.5), and the header row's laid-out width equals the day row's; the 390 Urdu case fails on the tree before the change. [unit]
- [x] In English at 390 the names render at 14 and the header keeps the day columns' positions. [unit]
- [x] `tests/history/attendanceHistory.test.mjs` passes; any changed assertion keeps the Urdu names, row direction and 13-below-375 size checks. [unit]
- [x] Rendered in the web export (History › Attendance, Urdu) at 320, 360, 375, 390 and 412 wide: no day name is cut or ends in an ellipsis, and no two names overlap; the Log says how this was checked. [runtime]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** Implemented. `AttendanceCalendar.tsx` header row only: each name sits in a label area `max(cell, 58)` wide (exported `DAY_NAME_MIN_WIDTH = 58`) with equal negative horizontal margins, so it is centred on its day column and the row width is unchanged; one line, no new size.
- Measured in headless Chrome with the app's font files (`NotoSansArabic-Bold`, `Inter-SemiBold`): "جمعرات" 51.16 at 14.5 and 45.86 at 13; "Wed" 30.59 at 14 (also "منگل" 32.84, "اتوار" 26.66 at 14.5). Minimum label width 58 = widest + about 7.
- New `tests/history/calendarDayNames.test.mjs`: 6 pass (Urdu at 320, 360, 375, 390, 412; English 390). With the old header the 5 Urdu cases fail, English passes.
- Existing test adapted (test-only exception): `attendanceHistory.test.mjs` Urdu test: the old "cell width >= 13*6*0.55" assertion replaced by "every label area >= 58"; Urdu names, row-reverse and 7 names at size 13 kept. File 11/11.
- Runtime: scratch copy of `dist` served on 127.0.0.1, headless Chrome, API mocked with `e2e-web/fixtures`, stored session, Urdu, History > Attendance, at 320x640, 360x700, 390x844, 430x932 (lead's widths; 375 and 412 not rendered, so the runtime box is left unticked). Measured each name's box and glyph range: none clipped, text-overflow never triggered, document width equals viewport, smallest gap between neighbouring names 4.5 at 320, 10.5 at 360, 10.1 at 390, 16.1 at 430; "جمعرات" is 46 wide at 13 and 52 at 14.5, whole. Screenshot of 390 read. Files: `/tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/fix58/ur-calendar-{320x640,360x700,390x844,430x932}.png`.
- Typecheck exit 0; `build:web` exit 0. `npm test --prefix frontend-mobile`: 642 tests, 640 pass, 2 fail on two runs, both in files this spec does not own ("progress bar fill is blue and proportional"; "Urdu translates the fixture names and labels but not the area name, and rows reverse"), likely the other helper's in-flight edits; not touched. Box left unticked.
- Not verified: device, font scaling above 1, e2e.
- Runtime follow-up: same method at 375x812 and 412x915 in Urdu: none clipped, document width equals viewport, smallest name gap 8.1 and 14.1. Screenshots `ur-calendar-375x812.png`, `ur-calendar-412x915.png` in the same folder. Runtime box ticked.
- **2026-11-12** — Lead: once spec 59 finished, the whole mobile suite passed 642/642 (the two earlier failures came from spec 59 mid-edit). Box ticked. Lead viewed `ur-calendar-390x844.png`: all day names are whole.
