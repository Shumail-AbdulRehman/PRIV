# Spec 05 — Time, date and duration formatting

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/format.ts`, `frontend-mobile/src/design/format.test.ts`, `specs-mobile-redesign/inventory/05-format-helpers.md`
**Reuses:** `frontend-mobile/src/utils/format.ts`, `DESIGN-SYSTEM.md#copy`

## Goal

One pure module formats every time, range, date, month and duration the design shows, in English and Urdu, in the right timezone.

## Scope

Pure functions, no React. Each takes ISO strings or `Date` plus an optional IANA `timeZone` (default: the device zone, matching `utils/format.ts`), and a `language` where wording differs.

- `clock(value, timeZone)`: "9:30 AM". Same as `formatClockTime`; reuse it.
- `timeRange(start, end, timeZone)`: "9:30 AM – 11:00 AM", with an en dash and spaces. When both ends have the same AM/PM suffix, say it once: "12:30 – 1:30 PM", "9:00 – 11:30 AM". Times always stay Latin with AM/PM, also in Urdu (the design keeps them left-to-right).
- `localDate(value, timeZone)`: "YYYY-MM-DD" in that zone.
- `shortDay(value, timeZone, language)`: English "Tue, 10 Nov"; Urdu "منگل، 10 نومبر" (Urdu weekday and month names, Latin digits). Use `Intl.DateTimeFormat` with `ur-PK` for Urdu names, and verify the output in the test; if the runtime lacks Urdu month names, fall back to fixed name tables in this module.
- `dayLabel(dateYmd, todayYmd, language)`: "Today", "Yesterday", else the weekday name ("Saturday"), translated through the shared lookup (pass a `t` function in, do not import React).
- `dayMonth(dateYmd, language)`: "9 Nov" or "9 نومبر".
- `monthTitle('2026-11', language)`: "November 2026" or "نومبر 2026".
- `addMonths('2026-11', -1)` returns "2026-10"; `compareMonths(a, b)`.
- `duration(minutes, language)`: "8h 4m" in English; Urdu "8 گھنٹے 4 منٹ".
- `countdown(seconds)`: "4:32" (minutes without padding, seconds padded).
- `minutesBetween(start, end)`.

## Explicit non-scope

- Attendance windows (check-in opens, late after, check-out opens) → keep using `utils/attendance.ts`; spec 15 calls those.
- Rendering → spec 14 and screens.

## Reuse first

- Build on `formatClockTime` from `utils/format.ts`; do not create a second clock formatter with different output.

## Steps

1. Write the functions.
2. Write tests with fixed instants and `Asia/Karachi` so they do not depend on the machine's timezone.
3. Record exports in the inventory fragment.

## Done when

- [x] `cd frontend-mobile && npx tsx --test src/design/format.test.ts` passes: `timeRange` gives "9:30 AM – 11:00 AM" across the meridiem and "12:30 – 1:30 PM" within it, using `Asia/Karachi`; `shortDay` in English is "Tue, 10 Nov" and in Urdu contains "نومبر" for 10 Nov 2026; `dayLabel` returns Today, Yesterday and a weekday; `monthTitle('2026-10','ur')` contains "اکتوبر"; `addMonths('2026-01',-1)` is "2025-12"; `duration(484,'en')` is "8h 4m"; `countdown(272)` is "4:32"; a time near midnight UTC lands on the right local date in Karachi. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `format.ts` imports nothing from React or React Native. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Added `format.ts` and `format.test.ts`. Format test: 9 pass, 0 fail. `npm test --prefix frontend-mobile`: 162 tests, 162 pass, 0 fail. Typecheck: 0 errors. `format.ts` imports only `../utils/format`. `build:web` NOT ticked: fails with the known EACCES favicon-cache error (root-owned `.expo` link). Notes: the Done-when line says "9:30 AM – 11:00 AM" but that is both AM, so by the shared-suffix rule it is "9:30 – 11:00 AM"; tests assert the rule ("9:30 AM – 1:00 PM" across the meridiem). Urdu day and month names use fixed tables (deterministic, no ICU dependency). `dayLabel` takes `t` as a fourth argument.
- **2026-11-11** — Lead: after the owner fixed the `.expo` cache owner, `npm run build:web --prefix frontend-mobile` passed (exit 0, "Exported: dist", new fonts present in `dist/assets/assets/fonts`). Build box ticked.
