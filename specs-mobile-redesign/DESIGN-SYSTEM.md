# Design system: staff phone app

Source: `design/mobile-redesign/v3` (approved 2026-11-11), including the "Fixes after review" in `v3/NOTES.md`. Motion from `design/mobile-redesign/v2/NOTES.md`.

**A token not listed here does not exist.** Every value lives once in `frontend-mobile/src/design/tokens.ts` (spec 02). This file and that one are the only places a raw hex value may appear in new code. The legacy `src/theme.ts` and `global.css` stay until spec 49 retires what nothing uses.

Light theme only. Portrait phones only. No tablet layout.

## Direction {#direction}

One next step. The top of My day says in one sentence what to do now, and one large yellow button at the bottom does it, always in the same place. Calm white work surfaces, the app's blue for identity and finished work, and yellow only for "this needs you". Must not look like stacked cards, a marketing page or a settings dump.

## Colour {#colour}

Token names are the keys of `colors` in `tokens.ts`.

| Token | Value | Use |
|---|---|---|
| `ink` | `#141c30` | Main text, selected chip fill, message bar |
| `muted` | `#55617a` | Secondary text, inactive tab |
| `subtle` | `#98a4b8` | Row chevrons |
| `offDay` | `#667389` | Calendar day off number |
| `future` | `#b5bfd0` | Future calendar days, disabled month arrow |
| `pillText` | `#3b475e` | Neutral pill and chip text |
| `line` | `#e3e8f0` | Hairlines, empty progress |
| `lineStrong` | `#cbd4e2` | Field and outline button borders, sheet grab handle |
| `canvas` | `#f2f5fb` | Page background behind white blocks, neutral marker fill |
| `segmentTrack` | `#e4e9f3` | Segmented control track |
| `surface` | `#ffffff` | Work sheet, rows, sheets, fields |
| `soft` | `#f7f9fc` | Pressed row, status table background |
| `blue` | `#2556d8` | My day top, primary form button, submitted marker, progress fill |
| `blueDeep` | `#1a3ba3` | Text on blue wash, link text, active tab |
| `blueWash` | `#eaf0ff` | Active tab pip, blue pill, notes, fixture tiles, avatar ring |
| `onBlue` | `#dbe5ff` | Secondary text on blue |
| `onDarkSoft` | `#e9edf5` | Secondary text on night, red and green tops |
| `onCamera` | `#d6deed` | Secondary text on the camera |
| `bannerSoft` | `#c9d3e6` | Secondary text in the offline banner |
| `yellow` | `#ffd21f` | The next-step button, "needs you" marker, needs-you pill, current photo segment |
| `yellowPress` | `#f0c000` | Pressed next-step button |
| `yellowWash` | `#fff6d0` | Check-in reminder note, sheet glyph tile |
| `yellowInk` | `#5a4300` | Text on yellow wash |
| `ok` | `#16613d` | Verified marker, checked-out top, green pill text |
| `okWash` | `#e4f4ea` | Green pill |
| `bad` | `#a32128` | Errors, missed marker text, sign out text |
| `badDeep` | `#7f1a20` | Missed check-out top |
| `badWash` | `#fdeeed` | Error note, missed marker fill |
| `warn` | `#7b4200` | Missed check-out pill and calendar text and outline |
| `warnWash` | `#fff1dc` | Missed check-out fill |
| `late` | `#f08a3c` | Late check-in: calendar day, legend, pill. Never the action yellow |
| `night` | `#0e1526` | Camera screens and their bars |
| `night2` | `#1a2439` | Quiet top (no shift, closed, could not load), offline banner |
| `tintBg` | `#dfe8fc` | Avatar fill |
| `tintFg` | `#4f77d6` | Avatar figure |
| `scrim` | `#0e152680` | Behind sheets and dialogs |
| `cameraButton` | `#ffffff24` | Round buttons on the camera |

**Contrast pairs that must hold** (checked by spec 02's test): `ink` on `surface`, `muted` on `surface`, `blueDeep` on `blueWash`, `ok` on `okWash`, `bad` on `badWash`, `warn` on `warnWash`, `yellowInk` on `yellowWash`, white on `blue`, `ink` on `yellow`, `ink` on `late` are all at least 4.5:1. `onBlue` on `blue` is at least 4.5:1.

## Typography {#type}

Families after spec 03: `InterRegular`, `InterSemiBold`, `InterBold`, `InterExtraBold`, `ManropeBold`, `ManropeExtraBold`, `NotoArabicRegular`, `NotoArabicBold` (registration names chosen in spec 03 and recorded in its fragment). Urdu text uses Noto Arabic; a Latin-only string inside the Urdu interface (a task name, a time) keeps the Latin face. Sizes in px, line heights in px. Urdu body, label and meta sizes are one step larger; Urdu title sizes may be smaller than English but always have taller line heights (the table is the rule).

| Role | Face (English) | English size / line | Urdu size / line | Used for |
|---|---|---|---|---|
| `nowTitle` | Manrope ExtraBold | 31 / 36 | 28 / 43 | My day sentence before check-in |
| `nowTitleCompact` | Manrope ExtraBold | 26 / 30 | 23 / 33 | My day sentence after check-in |
| `nowTitleLong` | Manrope ExtraBold | 27 / 32, 23 / 27 when compact | 25 / 40, 23 / 33 when compact | Entered name longer than 22 characters; max 3 lines |
| `pageTitle` | Manrope ExtraBold | 30 / 35 | 27 / 43 | Tasks, History headings |
| `headline` | Manrope ExtraBold | 27 / 32 | 25 / 40 | Task name on detail screens |
| `moment` | Manrope ExtraBold | 30 / 35 | 25 / 40 | Receipt titles |
| `cameraTitle` | Manrope ExtraBold | 25 / 30 | 25 / 40 | Camera screen titles (white) |
| `sheetTitle` | Manrope ExtraBold | 21 / 26 | 21 / 35 | Bottom sheet and dialog titles |
| `sectionTitle` | Manrope ExtraBold | 20 / 25 | 20 / 29 | "Today's work" |
| `barTitle` | Manrope Bold | 18 / 23 | 18 / 31 | Top bar title |
| `groupTitle` | Manrope Bold | 16.5 / 21 | 16.5 / 28 | "What to clean", "My details" |
| `action` | Manrope ExtraBold | 19 / 24 | 19 / 27 (Noto Bold) | Big action button label |
| `body` | Inter Regular | 16 / 23 | 17 / 31 | Sentences, notes, sheet text |
| `rowTitle` | Inter SemiBold | 16.5 / 21 | 16.5 / 23 | Task row name |
| `meta` | Inter Regular | 14.5 / 20 | 14.5 / 22 | Row time, subtitles |
| `label` | Inter SemiBold | 14 / 20 | 15 / 27 | Pills, legends, tabs, rail, small labels, field labels use `fieldLabel` |
| `fieldLabel` | Inter SemiBold | 15.5 / 22 | 17 / 30 | Form labels |
| `input` | Inter Regular | 17 / 24 | 17 / 24 (LTR, Latin) | Text inside fields |
| `badge` | Inter Bold | 13 / 16 | 13 / 16 | Tab badge number (the one place below 14) |
| `calendarHead` | Inter SemiBold | 14 / 18 | 14.5 / 20, 13 / 18 below 375 wide | Calendar day names |

Numbers use tabular figures where the platform supports it (`fontVariant: ['tabular-nums']`). Text inputs for email, password and codes stay left-to-right in both languages.

## Spacing, radius, size {#layout}

| Token | Value | Use |
|---|---|---|
| `gutter` | 20, 16 when window width is below 375 | Page side padding, row side padding |
| `narrowWidth` | 375 | Width below which narrow rules apply |
| `rowMinHeight` | 76 (64 in My day compact) | Task row |
| `rowPadV` | 13 (8 in My day compact) | Task row vertical padding |
| `markerSize` | 34 | Round status marker |
| `rowGap` | 14 (12 narrow) | Marker to text gap |
| `actionHeight` | 64 | Big action button |
| `actionRadius` | 18 | Big action button |
| `ghostHeight` | 52 | Text-style action under a big action |
| `dockPad` | 10 top, 16 sides, 12 bottom plus safe area | Bottom action dock |
| `fieldHeight` | 60, radius 16 | Text field |
| `chipHeight` | 44, radius 22 | Filter chips |
| `segmentHeight` | 44 inside a 4 padded track, radius 14 track, 11 thumb | Segmented control |
| `touchMin` | 44 (48 for icon-only buttons) | Every touch target |
| `tabMinHeight` | 60 | Tab item; pip 62 by 32, radius 16 |
| `sheetRadius` | 26 | Bottom sheet top corners, dialog |
| `workSheetRadius` | 28, overlaps the blue top by 26 | My day white sheet |
| `cardRadius` | 18 | Fact tables, receipts |
| `tileRadius` | 12 | Fixture tiles (42 square) |
| `badgeOkSize` | 96, radius 30 | Receipt badge |
| `shutter` | 80 diameter with 4 dark gap and 4 white ring | Camera shutter |
| `avatar` | 44 (38 in My day compact), 76 on Profile | Default avatar |

## Components {#components}

- **Big action** (`ActionButton` kind `next`): full width, `actionHeight`, `yellow` fill, `ink` label in `action` type, leading icon 24. One per screen, always in the dock at the bottom. Pressed fill `yellowPress`. Busy shows a spinner and stays the same size.
- **Form submit** (`kind: form`): same size, `blue` fill, white label. Used only to submit a form: sign in, save a password. Yellow is reserved for the working day's next step or something that needs the person.
- **Outline** (`kind: outline`): white with `lineStrong` 1.5 border, `ink` label. **Ghost** (`kind: ghost`): no fill, `blueDeep` label, `ghostHeight`.
- **Static status in the dock**: `canvas` fill, `muted` label, not pressable, role status. Used for "Internet needed to continue", "Check-out opens at {time}", "Waiting for the upload to finish".
- **Status marker** (round, `markerSize`): not started shows the task's position number on `canvas`; in progress a droplet on `blueWash`; needs you (photos, retake, overdue) a camera or clock on `yellow`; submitted or waiting for review a tick on `blue`; verified a double tick on `ok`; accepted with exceptions a tick on `ok`; missed a cross on `badWash`. Never a square, never an empty outline (it must not look like a checkbox).
- **Pill**: `label` type, radius 999, padding 3 by 10 (9 in Urdu). Tones: `neutral` (`canvas` / `pillText`), `blue` (`blueWash` / `blueDeep`), `green` (`okWash` / `ok`), `needsYou` (`yellow` / `ink`), `needsYouSoft` (`yellowWash` / `yellowInk`), `red` (`badWash` / `bad`), `late` (`late` / `ink`), `warn` (`warnWash` / `warn` with 1.5 `warn` outline).
- **Task row**: marker, name (`rowTitle`, entered text, never translated), then a line with the pill and the time range, chevron at the end (hidden below `narrowWidth`). Separator starts after the marker.
- **Bottom sheet**: `surface`, `sheetRadius`, grab handle 40 by 4, glyph tile 50 square radius 16 with tone, title `sheetTitle`, text `body` muted, actions stacked with 8 gap. Opens over a `scrim`. Android back and scrim tap close it unless it is a decision the person must make (location problems close to My day).
- **Dialog**: only for sign out. Centred, radius 26, two text buttons, destructive one in `bad`.
- **Message bar**: `ink` fill, white text, yellow tick, radius 14, 16 from the sides, above the tab bar. Disappears after 2.2 seconds.
- **Offline banner**: `night2` fill, wifi-off icon, two lines. Sits above the screen content.
- **Tab bar**: 4 tabs (My day, Tasks, History, Profile). Active tab: `blueDeep` text and icon, `blueWash` pip. Badge on Tasks: `blue` with white number, `yellow` with `ink` when any task needs the person.
- **Top bar**: 56 high, back arrow button 48, title in `barTitle`. Back arrow mirrors in Urdu.
- **Language toggle**: two segments "English" and "اردو" (each label in its own script). On the blue top it is translucent white with the active segment white. On white screens it is a `canvas` segmented control.
- **Avatar**: default figure icon on `tintBg`, never initials, never a photo.
- **Calendar**: Monday first, 7 columns with 3 gap and 8 side padding. Day cell square, radius 12. On time `blueWash`/`blueDeep`; late `late`/`ink`; absent `badWash`/`bad` with 1.5 `bad` outline; missed check-out `warnWash`/`warn` with 1.5 `warn` outline; off `offDay` regular; today `blue`/white; future `future`.

## States {#states}

- **Loading**: skeleton blocks in the screen's own shape, never a centred spinner for a whole screen (except session restore before sign-in).
- **Empty**: a quiet glyph tile (88 square, radius 26, `blueWash`), a title, one sentence, optional action.
- **Error**: says what failed and that saved data is unchanged, with "Try again".
- **Offline**: banner at the top, and the dock shows the static "Internet needed to continue" instead of the action.
- **Disabled**: never a silently disabled button. If the action is not available, the dock shows the static status that says why, or the screen shows a note with the reason and next step.
- **Pressed**: rows `soft`; buttons scale to 0.97 (shutter 0.93).
- **Focus** (keyboard or switch access): 3 wide `blue` outline.

## Motion {#motion}

Reanimated for movement, `expo-haptics` for haptics. Every animation checks `useReducedMotion()`; under reduced motion it becomes the fallback in the last column.

| Element | Trigger | Property | Duration | Easing | Haptic | Reduced motion |
|---|---|---|---|---|---|---|
| Buttons, chips | Press | scale to 0.97 | 120 ms | `easeOut` = cubic-bezier(.23,1,.32,1) | Light impact on the big action | None |
| Shutter | Press | scale to 0.93 | 120 ms | `easeOut` | Medium impact | None |
| Tabs | Switch | none, instant | 0 | — | None | Same |
| Going deeper | Stack push | native stack slide | platform | platform | None | Fade |
| Next-step sentence | Text changes | translateY 8 to 0, opacity 0 to 1 | 220 ms | `easeOut` | None | Fade 120 ms |
| Bottom sheet | Open | translateY 100% to 0 | 280 ms | `drawer` = cubic-bezier(.32,.72,0,1) | Warning notification on a photo problem | Fade 120 ms |
| Scrim | Open | opacity | 200 ms | ease-out | None | Same |
| Dialog | Open | scale 0.96 to 1, opacity | 180 ms | `easeOut` | None | Fade 120 ms |
| Message bar | Appears | translateY 12 to 0, opacity | 200 ms | `easeOut` | None | Fade 120 ms |
| Busy card on camera | Upload starts | translateY and opacity | 180 ms | `easeOut` | None | Fade 120 ms |
| QR scan line | While scanning | translateY across the frame | 1.9 s alternating | linear | Success when confirmed | Static line |
| Location ring | While locating | scale 1 to 1.55, opacity 0.9 to 0 | 1.5 s loop | ease-out | None | Static |
| Receipt badge and tick | Submitted or attendance saved | scale 0.9 to 1 and opacity, then tick stroke draw | 340 ms and 300 ms (120 ms delay) | `easeOut` | Success | Shown at once |

No other motion. Lists, pull-to-refresh and tab switches do not animate.

## Copy rules {#copy}

- English is the key; every visible string goes through `t()`. New strings live in `src/i18n/staffAppTranslations.ts` (spec 04).
- Entered names (task, area, location, company, people) are never translated and never sit inside an Urdu sentence: in Urdu the label goes on one line and the isolated name on the next (spec 14's `NameLine`).
- Times: "9:30 AM – 1:00 PM" across noon; when both ends share AM or PM it is said once: "9:30 – 11:00 AM", "12:30 – 1:30 PM" (spec 05).
- Status words: Not started, In progress, Photos needed, Retake photo, Overdue, Submitted, Waiting for review, Verified, Accepted with exceptions, Missed. Submitted, Verified and Review closed are never merged.

## Accessibility floor {#a11y}

WCAG AA contrast (pairs above). Text at least 14 (badge 13; Urdu calendar day names 13 below 375 wide). Touch targets at least 44, icon buttons 48. Every icon-only button has an accessibility label. Status is never colour alone: markers sit with a pill or a hidden label. Live regions announce attendance results, upload results and errors. Urdu sets RTL layout; arrows mirror. Android font scaling must not clip the big action or tab labels (labels may wrap to two lines inside the button).
