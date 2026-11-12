# Spec 63 — Fix: product rules name the four staff tabs

**Status:** Done
**Depends on:** Spec 53
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `specs-mobile-redesign/inventory/63-fix-product-rules.md`
**Reuses:** `docs/PRODUCT_UI_RULES.md`, `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `ARCHITECTURE.md`

## Goal

`docs/PRODUCT_UI_RULES.md` describes the staff app as it now ships: four tabs, with History live. This fixes finding 63 (`docs/plan-project/mobile-redesign/planning/verification.md` §3 row 50 and §7).

## Scope

Line 15, the only paragraph under "## Staff flow" (line 13), still reads "Staff tabs are My day, Tasks and Profile (History arrives with Part 2)", written by spec 50 before spec 51 wired the History tab. The real tab list is `StaffTabs.tsx` lines 56 to 61: My day, Tasks, History, Profile, in that order (mirrored in Urdu; route names `Shift`, `Tasks`, `History`, `Profile` in `routeNames.ts`).

- Rewrite that paragraph's first sentence so it lists the four tabs in order and says in one short clause what History holds (finished tasks and attendance by month, read only, no photos; `ARCHITECTURE.md` invariant 8).
- Keep the rest of the paragraph as it is: Help inside Profile with Task alerts and Change password; what My day shows; late check-in in orange; the check-in to submit sequence; starting cleaning and submitting evidence are different actions.
- Plain, short sentences, matching the file's voice. No other section, heading or line in the file changes.
- This spec is the **sole later editor** of `docs/PRODUCT_UI_RULES.md` among specs 56 to 63 (owned by spec 50) and changes only the "Staff flow" paragraph.

## Explicit non-scope

- Any other section of `PRODUCT_UI_RULES.md` (Language, Photo status meanings and the rest) → not planned; spec 53 found no other outdated line.
- `docs/CURRENT_CONTEXT.md` → the lead updates it (spec 53 and spec 60 hand it items).
- The Tasks tab count behaviour → spec 61; describe tabs only, not badges.
- App code → none here; the code fixes are specs 56 to 62.

## Reuse first

- The tab list and order from `StaffTabs.tsx`; wording of the existing paragraph.

## Steps

1. Edit line 15.
2. Check the diff touches only that paragraph.

## Done when

- [x] `grep -n "History arrives with Part 2" docs/PRODUCT_UI_RULES.md` prints nothing. [static]
- [x] The "Staff flow" paragraph names My day, Tasks, History and Profile in that order and still contains "Help is inside Profile", "orange", the check-in to submit sequence and "different actions". [static]
- [x] Comparing the file with a copy taken before the edit, only the line under "## Staff flow" differs (the tree is uncommitted, so `git diff` also shows spec 50's earlier change). [static]

## Log

- **2026-11-12** — Done (Haiku 5.5, single session). Line 15 of `docs/PRODUCT_UI_RULES.md` now reads "Staff tabs are My day, Tasks, History and Profile, in that order. History shows finished tasks and attendance by month, read only, with no photos." The rest of the paragraph is unchanged. Checks: the grep for "History arrives with Part 2" printed nothing; the paragraph still holds the four required phrases; `diff` against a pre-edit copy (scratchpad `PRODUCT_UI_RULES.before.md`) shows only line 15 changed. Tab order verified against `StaffTabs.tsx` (`tabs` array: My day, Tasks, History, Profile; Urdu reversed). Invariant 8 is in `specs-mobile-redesign/ARCHITECTURE.md`, not the repo root. Its text covers "no photos" only; "read only" comes from the spec. No `inventory/63-fix-product-rules.md` fragment was written because nothing reusable was created. `PROGRESS.md` row 63 was left for the lead, as the guide says.
