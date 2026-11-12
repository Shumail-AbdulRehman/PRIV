# Spec 58 inventory: calendar day names are never cut

- `AttendanceCalendar.tsx` exports `DAY_NAME_MIN_WIDTH` (58, from measured Urdu widths). The weekday header gives each name a label area `max(cell, 58)` wide, centred on its column by equal negative margins; the row's width is unchanged.
- Template: `frontend-mobile/tests/history/calendarDayNames.test.mjs` (real `translate`, asserts area width, centre and row width from styles).
