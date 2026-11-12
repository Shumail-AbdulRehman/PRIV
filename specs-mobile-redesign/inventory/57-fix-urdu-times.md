# Spec 57 inventory: Urdu times keep their order

- Every clock time or range drawn as a bare string goes through `isolate()` from `frontend-mobile/src/design/StaffText.tsx`. `format.ts` stays pure. The local `ltr()` in `AttendanceHistoryView.tsx` is gone; use `isolate`.
- Shared value cells isolate for every caller: `Step` in `HistoryTaskScreen.tsx` (all values) and `Fact` in `AttendanceHistoryView.tsx` (literal values only; translated values such as "Still on shift" are left alone).
- Template: `frontend-mobile/tests/screens/urduTimes.test.mjs` (Urdu, real `translate`, asserts U+2068 value U+2069).
