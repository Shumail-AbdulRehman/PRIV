---
name: Hygene Ops
description: Calm blue and white operations workspace for cleaning companies and their field staff.
colors:
  primary: "#2556d8"
  primary-dark: "#1d42b1"
  selection: "#eef3ff"
  canvas: "#f5f7fb"
  surface: "#ffffff"
  ink: "#172033"
  muted: "#566379"
  line: "#e3e8f0"
  line-strong: "#cfd7e4"
  soft: "#f8fafc"
  faint: "#7a879b"
  rail: "#eef2fb"
  rail-hover: "#e1e8f6"
  rail-line: "#d9e1f0"
  rail-text: "#3d4a60"
  navy: "#111c36"
  navy-raised: "#1b2848"
  navy-line: "#2b3958"
  navy-text: "#c8d2e5"
  blue-line: "#c9d8fb"
  blue-mid: "#5f8bea"
  neutral-segment: "#c3ccda"
  attention: "#ffd21f"
  attention-hover: "#ffdc4d"
  attention-fill: "#fff7d6"
  attention-line: "#f1dc8a"
  bar-track: "#e8ecf3"
  success-ink: "#16613d"
  success-fill: "#e6f5ec"
  warning-ink: "#7b4200"
  warning-fill: "#fff4e0"
  danger-ink: "#a32128"
  danger-fill: "#fff0ef"
  marketing-primary: "#4264d9"
typography:
  headline:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "17px"
    fontWeight: 750
    lineHeight: 1.3
  figure:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.1
  subtitle:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.5
  body-urdu:
    fontFamily: "Noto Sans Arabic, Tahoma, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
  button:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  chip: "999px"
  small: "6px"
  nav: "8px"
  control: "8px"
  panel: "12px"
  setup-panel: "10px"
  native-control: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  flow: "16px"
  lg: "20px"
  stack: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "40px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "42px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  nav-link:
    textColor: "{colors.rail-text}"
    rounded: "{rounded.nav}"
    padding: "8px 10px"
    height: "47px"
  nav-link-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
  status-success:
    backgroundColor: "{colors.success-fill}"
    textColor: "{colors.success-ink}"
    rounded: "{rounded.chip}"
    padding: "4px 9px"
  status-warning:
    backgroundColor: "{colors.attention}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "4px 9px"
  status-danger:
    backgroundColor: "{colors.danger-fill}"
    textColor: "{colors.danger-ink}"
    rounded: "{rounded.chip}"
    padding: "4px 9px"
---

# Design System: Hygene Ops

## 1. Overview

**Creative North Star: "The Daily Worksheet"**

Hygene Ops is a calm working register for cleaning companies. Dense, readable
records sit on a light canvas, with blue actions and submitted-work progress,
ink attendance, and yellow reserved for matters requiring a person. Flat panels,
clear status words and tick boxes help owners and managers scan the day's work.
Submitted, verified and review closed remain separate facts everywhere.

This document records the locally implemented company workspace as of 2026-11-12.
Its frontmatter describes the workspace's approved tokens, defined in
`frontend/src/workspace-tokens.css` and detailed in
`specs-workspace-redesign/DESIGN-SYSTEM.md`. Public pages, authentication,
onboarding, platform operations and the native staff app retain their own scoped
systems; these workspace values do not replace their tokens or layouts.

The workspace uses a light blue-grey 256px rail, a top bar of at least 72px and
content capped at 1400px. Page padding is 28px by 32px, becoming 20px by 16px on
phones. The permanent rail becomes an accessible drawer below 860px. Page grids
use their own content breakpoints; shared labelled table cards begin below 620px.
Urdu mirrors the interface through logical layout properties and uses Noto Sans
Arabic. User-entered names retain their original text.

**Sanctioned brand and onboarding exception:** Preserve the complete checkbox
logo SVG viewBox, including its blue-to-cyan tick tip. The approved Fresh aurora
background and Mint sky side panel remain scoped to the onboarding flow. Public
marketing keeps its separate visual system. Neither introduces gradients into
operational workspace panels.

**Key Characteristics:**
- Light surfaces with one-pixel rules and moderate operational density.
- Blue actions and submissions; ink attendance; yellow only for attention.
- Manrope titles and large figures, Inter body, Noto Sans Arabic for Urdu.
- Decorative person and location avatars with deterministic name-based tints.
- Visible keyboard focus, readable status words and 40px minimum phone targets.
- Static loading skeletons, useful empty states and Retry with saved-record reassurance.
- Brief interaction feedback; no page-load sequences or animated data.

## 2. Colors

### Primary
- **Working Blue:** Primary actions, submitted work, focus and selected controls.
- **Pressed Blue:** Hover/pressed actions and text on blue wash.
- **Selection Wash and Blue Line:** Selected rows and their borders.
- **Mid Blue and Neutral Segment:** In-progress and not-started work distribution.

### Neutral
- **Worksheet Canvas and Sheet White:** Page background and flat panels.
- **Strong Ink, Quiet Slate and Faint:** Primary text, supporting text and chart references.
- **Rule Line and Strong Line:** Hairlines and field/control borders.
- **Rail:** Light blue-grey navigation, with separate hover, line and text colours.
- **Navy:** Plan/preview surfaces and chart tooltips, with raised, line and text companions.
- **Bar Track:** Meter tracks and static skeletons.

### Status
- **Attention Yellow:** Needs a person; yellow wash/line support explanations.
- **Verified Green:** Complete, verified and on-time facts with a quiet green wash.
- **Warning Brown:** Secondary warnings on a pale warning wash.
- **Missed Red:** Errors, missing/unassigned work and over-limit usage, with a pale red wash.

Avatar backgrounds and foregrounds use the six paired tint tokens in the scoped
workspace stylesheet. Every person/site avatar uses the sum of its name's UTF-16
code units modulo six. Avatars are decorative and never request media or persist data.

### Named Rules
**The Attention Rule.** Yellow means a person needs to act; it is never decoration.

**The Label Always Rule.** Every status has words. Colour alone never establishes submission, verification or closure.

**The Scoped Token Rule.** New workspace styles consume only the closed `--wx-`
token list. Legacy semantic variables remain for existing shared children,
authentication and standalone account screens; never change global tokens to
restyle one screen.

## 3. Typography

**Body Font:** Inter Variable, sans-serif, with tabular numerals.
**Titles and Figures:** Manrope Variable, sans-serif.
**Urdu Font:** Noto Sans Arabic, Tahoma, sans-serif.

### Hierarchy
- **Headline:** Manrope page title, weight 800, tight tracking, once per page.
- **Title:** Manrope panel title, weight 750.
- **Large figure:** Manrope at 32–34px, weight 800 and 1.1 leading.
- **Subtitle:** Inter at 15px, regular weight.
- **Body:** Inter at 14.5px with 1.5 leading.
- **Label / Button:** Inter at 14px, weight 600.
- **Small:** 12.5–13.5px, weight 400–600. Status pills use 12.5px at 600.

The native app retains its separately bundled type and larger controls.

### Named Rules
**The Urdu Air Rule.** Urdu uses 1.85 leading on working text and loses Latin
tracking. Preserve the Arabic font through portals and dialogs.

**The Original Text Rule.** Isolate record names with bdi and keep emails, URLs,
currency, IDs and native time/password fields left-to-right where appropriate.

## 4. Elevation

Panels use a one-pixel rule and no shadow at rest. Side panels, menus and chart
tooltips may use a soft shadow; location cards may gain a subtle hover shadow.
Navy surfaces use their own text and line tokens. Avoid nested panel boundaries.

**The Flat At Rest Rule.** Ordinary records, buttons and fields do not float.
Use surfaces, borders and spacing to establish hierarchy.

## 5. Components

### Buttons and fields
Buttons are 40px high with 8px corners; fields are 42px. Both grow with wrapped
text and retain visible focus. Primary actions use blue; outline actions use
white with the strong line; ghost actions use muted text. Hover, focus, press,
disabled, loading and error feedback remain visible. Phone targets are at least
40px in both dimensions. Paired fields align their labels and controls at the
top, leaving hints and errors below.

### Pills, chips and segments
Status pills carry independent neutral, ok, progress, attention and bad tones.
Chips are 34px pills and grow to phone targets; selected chips and segmented
choices fill with ink. Tabs use a two-pixel blue underline and count pill.

### Panels and records
Small, medium and large corners are 6px, 8px and 12px. Panel padding is 20px by
22px, with 16px between panels. Tables have soft headers, muted 12.5px labels,
13px cell padding, soft hover and blue selected rows. Below 620px opt-in labelled
cards expose every column, sorting and pagination. Row actions preserve nested
links and keyboard access.

### Navigation and language
The rail groups Daily operations, Your organization and Administration. Owner
and manager navigation retain their permission boundaries. Links are 47px with
15.5px text and 20px icons; on desktops up to 840px tall they compact to 40px,
14.5px and 18px. The account/sign-out block stays visible. The phone drawer has
modal semantics, Escape dismissal and focus return. English and اردو remain
visible in the top bar; the selected workspace language uses an ink pill.

### Side panels and protected photos
Side panels enter from the inline end at 440px, or 560px for wide forms, and
fill phone widths. A sticky header/footer surrounds the scrolling body. Dialogs
are named, focus-trapped and return focus to their opener. Attendance and task
photos load through their existing protected components only when opened;
records and overviews do not fetch thumbnails.

### Identity and progress
Person avatars are 36px, small 26px and large 64px; location avatars use a rounded
square. Empty assignments use a dashed outline. Tick boxes carry task progress;
large totals use a bounded meter. Blue means submitted work, ink means attendance.
Missing values stay unavailable rather than becoming zero.

### Charts, states and motion
Work submitted is solid blue, attendance ink/dashed and tasks due faint/dashed,
on one axis. Multiple series have legends; every chart has an accessible summary
and table view. Data never animates. Initial loading uses static skeletons; empty
states teach the next step; errors offer Retry and explain that saved records
have not changed. Background refresh preserves content, drafts and focus.

Press feedback scales to .97 for 120ms with `cubic-bezier(.23,1,.32,1)`.
Side panels translate over 280ms with `cubic-bezier(.32,.72,0,1)` and use a 120ms
fade under reduced motion. Scrims fade over 200ms, inline task panels enter over
180ms, and phone rails translate over 220ms. Reduced motion suppresses those
transforms and scrim animation. Hover/selection colour feedback remains 150ms.

## 6. Do's and Don'ts

### Do:
- **Do** use blue for actions and submitted work, ink for attendance and yellow for attention.
- **Do** preserve every filter, scope parameter, link, permission rule and separate status fact.
- **Do** reuse the shared workspace header, controls, table, states, avatars, pills and SidePanel.
- **Do** translate visible and accessible interface copy through the language provider.
- **Do** mirror layouts with logical properties and preserve verbatim record data.
- **Do** keep 40px phone targets, visible focus, Retry and useful disabled guidance.
- **Do** keep protected photos lazy and unavailable values explicit.

### Don't:
- **Don't** add page-load sequences, animated data or continuous operational motion.
- **Don't** invent sample records, location types or missing aggregate figures.
- **Don't** merge submitted, verified and review closed into one Complete badge.
- **Don't** introduce colours outside the approved workspace token list.
- **Don't** add coloured side stripes, gradients, glass effects or large panel shadows.
- **Don't** nest panels or replace readable records with decorative cards.
- **Don't** apply workspace tokens globally to public, onboarding, platform or native surfaces.
