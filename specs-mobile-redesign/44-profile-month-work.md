# Spec 44 — Profile "This month" and "My work" sections

**Status:** Done
**Depends on:** Spec 05, Spec 17, Spec 20
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/profile/ProfileMonth.tsx`, `frontend-mobile/src/screens/profile/ProfileWork.tsx`, `frontend-mobile/tests/screens/profileSections.test.mjs`, `specs-mobile-redesign/inventory/44-profile-month-work.md`
**Reuses:** `frontend-mobile/src/queries/history.ts`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/design/Feedback.tsx`, `design/mobile-redesign/v3/index.html`

## Goal

Two Profile sections built on the profile summary endpoint: this month's attendance and task figures with named totals, and where and when the person works.

## Scope

**`ProfileMonth`** props: `summary` (the `month` part of `ProfileSummary`), `loading`, `error`, `onRetry`, `onSeeHistory`. White block titled "This month" with three meter rows (label at the start, value at the end, a 6 high blue bar below):
- "Shifts attended": "{n} of {t} scheduled" (attended / scheduled).
- "Arrived on time": "{n} of {t} attended" (on time / attended).
- "Tasks submitted": "{n} of {t}" (submitted / assigned).
A zero denominator shows "No shifts yet" or "No tasks yet" instead of the value and no bar (never "0 of 0", never a fabricated percentage). Then a "See my history" link with an arrow (mirrored). Loading: three skeleton rows. Error: one line "Figures could not load." with "Try again".

**`ProfileWork`** props: `summary` (`location`, `usualShift`, `manager`), `loading`. White block "My work": Assigned location (location name and, below it, the address; "No location assigned" when null), Usual shift (for example "9:00 AM – 5:00 PM", through `timeRange` using today's date and the location timezone; "Not set" when null), Manager (name; "No manager assigned" when null). Entered names untranslated. No call button and no phone (spec 00).

## Explicit non-scope

- Placing the sections in Profile and the History tab → spec 51.
- Query hooks → spec 17.

## Reuse first

- `useProfileSummary` data shape from spec 10 and 17; `timeRange` from spec 05.

## Steps

1. Build both sections.
2. Test values, zero cases and states.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/profileSections.test.mjs` passes: values read "8 of 8 scheduled", "7 of 8 attended" and "38 of 42"; zero scheduled shows "No shifts yet" with no bar; "See my history" calls `onSeeHistory`; a null manager shows "No manager assigned"; no element offers a call; the usual shift renders "9:00 AM – 5:00 PM" for 09:00 to 17:00; Urdu translates labels and leaves names. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- Built `ProfileMonth.tsx`, `ProfileWork.tsx`, test (8 tests, all pass), inventory fragment.
- Results: `npm test --prefix frontend-mobile` 585 pass, 0 fail; typecheck 0 errors; `build:web` exported.
- Urdu keys missing from `staffAppTranslations.ts` (not mine; English fallback until added): "Manager", "No shifts yet", "No tasks yet", "No manager assigned", "Not set", "Figures could not load.". "Try again" and "No location assigned" exist in `translations.ts`.
- Usual shift arrives as "HH:mm" already in the location zone, so it is rebuilt as today at that wall time in UTC and formatted with `timeRange(..., 'UTC')` (no zone shift).
- "Arrived on time" with zero attended shows "No shifts yet" and no bar.
- Not verified: rendering on device; mounting is spec 51.
