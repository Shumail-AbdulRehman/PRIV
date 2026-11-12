# Spec 55 — Fix: Joined month in the staff member's time zone

**Status:** Done
**Depends on:** Spec 52
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/profileJoined.test.mjs`, `specs-mobile-redesign/inventory/55-fix-joined-month.md`
**Reuses:** `frontend-mobile/src/screens/profile/ProfileScreen.tsx`, `frontend-mobile/src/design/format.ts`, `frontend-mobile/src/queries/history.ts`, `frontend-mobile/tests/screens/profile.test.mjs`, `ARCHITECTURE.md#api`

## Goal

Profile shows the month a staff member joined in their own location's time zone, so someone created late on the last day of a month in UTC but on the 1st in Karachi sees the right month. This fixes bug E2E-2 found by spec 52.

## Scope

`ProfileScreen.tsx` renders "Joined" with `monthTitle(details.createdAt.slice(0, 7), language)`, which takes the UTC month.

- Compute the joined month in a time zone: the profile summary's `location.timezone` when the summary has loaded, else `Asia/Karachi` (the `ARCHITECTURE.md#api` timezone rule default). Use the date helpers in `design/format.ts` if one already gives a month key in a zone; otherwise use `Intl.DateTimeFormat` with `timeZone`, inside `ProfileScreen.tsx`.
- This spec is the **sole later editor** of `ProfileScreen.tsx` (owned by spec 37, wired by spec 51) and changes only the Joined value.

## Explicit non-scope

- Moving the helper into `format.ts` → not planned; if a shared helper is needed later, spec 53 records it.
- Navigation bug E2E-1 → spec 54.
- Removing the E2E-2 `test.fixme` marker in `e2e-web/profile.spec.ts` and running the e2e suite → spec 52 (the lead reruns it after this spec).

## Reuse first

- `monthTitle` from `design/format.ts` for the label; `useProfileSummary` data already read in `ProfileScreen`.

## Steps

1. Change the Joined value.
2. Unit-test the month boundary in Karachi and the fallback zone.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/profileJoined.test.mjs` passes: `createdAt` 2026-02-28T20:00:00Z with location `Asia/Karachi` shows March 2026; the same instant with no summary yet also shows March 2026 (fallback zone); a mid-month date is unchanged; Urdu shows the Urdu month name. [unit]
- [x] `tests/screens/profile.test.mjs` still passes unchanged. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Joined now shows the month in the location time zone. `ProfileScreen.tsx` Joined value is `monthTitle(new Intl.DateTimeFormat('en-CA', {year, month:'2-digit', timeZone: summary.data?.location?.timezone ?? 'Asia/Karachi'}).format(new Date(createdAt)).slice(0, 7), language)`. Only that value changed. `format.ts` has `localDate(value, timeZone)` which gives the month key, but using it needed an import edit on another line of ProfileScreen, so the inline `Intl.DateTimeFormat` fallback from the spec was used. Added `tests/screens/profileJoined.test.mjs` (6 tests, 6 pass): 20:00Z on 28 Feb shows March in Karachi; no summary falls back to Karachi; summary with null location falls back; `America/New_York` summary shows February (zone is honoured); mid-month unchanged; Urdu shows `مارچ 2026`. `tests/screens/profile.test.mjs` unchanged, 12 pass.
- Checks: `npm run typecheck` exit 0 (0 errors). `npm run build:web` exit 0. `npm test` ran twice: 618 tests, 617 pass, 1 fail both times, both failures outside this spec's files. Run 1: "finished shows the receipt with 'Submitted Yes' and 'Verified Not yet'; Next task goes to My day" fails. Run 2: `tests/pushNavigation.test.mjs` fails to load, a SyntaxError in its `@react-navigation/native` mock string (`Unexpected identifier 'POP_TO'`). Another session is editing the tree, so the failure moved. The "npm test with 0 failures" box is left unticked for the lead to rerun after those files settle. Not fixed, per the rules.
- Process slip: before `build:web` I ran `pgrep -f "[e]xpo export"`, which found a running export. I did not wait for it as required and ran the build anyway. It exited 0, but it may have overlapped the other export's `dist` output. The lead should check `frontend-mobile/dist` if that matters.
- Not verified: the Joined row on a device or in the browser at 360 by 700 (the unit tests render through the harness only). The e2e `test.fixme` in `e2e-web/profile.spec.ts` is still marked fixme; the lead reruns spec 52 to remove it.
- **2026-11-12** — Lead: once spec 54 finished, the whole mobile suite passed 620/620 (the helper's two failures came from spec 54 mid-edit). The build ran again inside the e2e webServer. Box ticked. Note for spec 53: an invalid `location.timezone` string would make `Intl.DateTimeFormat` throw on Profile.
