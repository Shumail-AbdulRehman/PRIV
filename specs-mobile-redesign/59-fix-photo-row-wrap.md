# Spec 59 — Fix: photo row text never breaks mid-word

**Status:** Done
**Depends on:** Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/photoRowLayout.test.mjs`, `specs-mobile-redesign/inventory/59-fix-photo-row-wrap.md`
**Reuses:** `frontend-mobile/src/screens/verification/VerificationProgress.tsx`, `frontend-mobile/src/verification/photoRowState.ts`, `frontend-mobile/src/design/Pill.tsx`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/src/design/tokens.ts`, `frontend-mobile/tests/screens/photoList.test.mjs`, `design/mobile-redesign/v3/style.css`

## Goal

On Task photos, a photo's title and view line always wrap between words, beside or above a long status pill, at every width from 320 in both languages. Today in Urdu at 360 by 700 the "Uploaded, checking" pill squeezes "Whole mirror" into "Who / le / mirr / or". This fixes finding 59 (`docs/plan-project/mobile-redesign/planning/verification.md` §7), plus the one unisolated time on this screen that finding 57 found.

## Scope

The row body in `VerificationProgress.tsx` lines 120 to 151 is one `row` (or `row-reverse`) of three parts: the 44 tile, a `flex: 1` text column (title `{isolate(title)}` line 138, view line lines 140 to 144), and the `Pill` (lines 146 to 151) with no width limit. A long Urdu pill label ("اپ لوڈ ہو گئی، جانچ جاری ہے") takes what it needs, and the text column shrinks below one word. Rows also use the fixed `space.gutter` (lines 162 to 169), while the design narrows the row side padding to 16 below 375 (`v3/style.css` line 89).

- Give the text column a minimum width that holds a normal word at the row-title size, and let the pill move to its own line under the title and view text, aligned to the start side of the text column, when it does not fit beside that minimum. When it fits (English at 390 for every label in `photoRowState.ts` lines 44 to 52), the pill stays at the row end as the design draws it.
- Use `gutterFor(width)` from `tokens.ts` for the row side padding, as the design does below 375.
- Keep the row's accessibility label (`${title}, ${t(row.label)}`), press target, correction line and order unchanged.
- "Results updated · {time}" (line 190) takes `toLocaleTimeString` without isolation; wrap the time with `isolate()` from `StaffText.tsx`, the same fix spec 57 makes elsewhere.
- This spec is the **sole later editor** of `VerificationProgress.tsx` among specs 56 to 63 (owned by spec 35, edited by spec 45) and changes only the row body layout, the row padding and the footer time.

## Explicit non-scope

- `Pill` itself (`design/Pill.tsx`, spec 20): no width cap or wrap inside the pill → not planned.
- Other unisolated times → spec 57.
- The photo capture camera and dock in `VerificationScreen.tsx` → spec 56 edits that file; nothing here.
- e2e photo tests → spec 52 (the lead reruns e2e after this spec).

## Reuse first

- `Pill`, `StaffText`, `isolate`, `gutterFor`, `space.rowGap`, `space.tileSize`. No new token. The test copies the mount from `tests/screens/photoList.test.mjs` and uses its own `useLanguage` mock whose `t` fills values (not the shared harness `t()`, which spec 62 changes).

## Steps

1. Change the row body layout, the row padding and the footer time.
2. Write `tests/screens/photoRowLayout.test.mjs`; run it, `photoList.test.mjs` and the suite.
3. Check the rendered Task photos rows in a browser at the widths below.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/photoRowLayout.test.mjs` passes: the text column has the minimum width and the row allows the pill to move under the text; in Urdu the pill keeps the start side of the text column; at 360 the row side padding is 16 and at 390 it is 20; the accessibility label is unchanged; the min-width assertion fails on the tree before the change. [unit]
- [x] In Urdu the footer reads "Results updated · " followed by the time wrapped as U+2068 time U+2069. [unit]
- [x] `tests/screens/photoList.test.mjs` passes unchanged. [unit]
- [x] Rendered in the web export (Task photos with rows in "Uploaded, checking", "Saved, uploading" and "Waiting for review"), English and Urdu at 320, 360 and 390 wide: no word of a title or view line is split across lines, every pill is fully visible, and in English at 390 the pills sit at the row end; the Log says how this was checked. [runtime]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — `VerificationProgress.tsx`: row body is now a wrapping row (`flexWrap`, `columnGap` rowGap, row gap 8); text column `flexGrow 1, flexShrink 1, flexBasis/minWidth 100` (exported `PHOTO_TEXT_MIN_WIDTH`; 132 was tried first but pushed the English 390 "Uploaded, checking" pill under the text, so 100); pill sits in `RowPill`, which reads `onLayout` and, when the pill lands on a second line, aligns it under the text column start (margin tile + rowGap; `marginRight` in Urdu, since `marginStart` was not mirrored for `row-reverse` on web). Row side padding `gutterFor(width)` (16 at 360, 20 at 390). Footer time `isolate(time)`. Accessibility label, press target, correction line unchanged.
  - Tests: new `tests/screens/photoRowLayout.test.mjs` 5/5; `photoList.test.mjs` 10/10 unchanged. Min-width assertion fails on the old tree (it had `flex: 1` and no export or minWidth; not run against a restored copy). `npm test --prefix frontend-mobile` 642/642, 0 failures. Typecheck 0 errors. `build:web` passes.
  - Runtime: scratch copy of `dist` served on 127.0.0.1, headless Chrome with `playwright-core` (from `frontend/node_modules`, read only), API mocked with `page.route` (checked-in shift, task 501, five photos: two "Uploaded, checking" incl. a long view line, "Waiting for review", "Uploaded"). English and Urdu at 320x640, 360x700, 390x844: document width equals viewport, a per-word range check found no word split across lines in any row, screenshots read (en 390, ur 360, ur 320): English 390 pills at the row end, Urdu 360 and 320 long pills under the text at its start, nothing overlapping. "Saved, uploading" not shown in the browser (needs a camera capture queue; unit-tested). Only page error: blocked jsQR CDN worker script. Screenshots in `/tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/fix59/` (`photos-{en,ur}-{320x640,360x700,390x844}.png`).
