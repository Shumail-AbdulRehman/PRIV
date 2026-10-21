# Hygene Ops closed design system

Source: design/v5 (approved 2026-10-20 in current user instruction). Historical pending labels in source are superseded by that approval. No design artifact changed.

## Direction
Calm blue and white operational workspace, clear text and real data. Retain separate owner/manager/staff/operator boundaries; avoid decorative controls or prototype reviewer tooling. Light mode baseline.

## Colour tokens
Use semantic names from this source transcription; normalize aliases in the token implementation, not per page. Frontmatter below also preserves typography/radii/spacing observed in v5.

```yaml
name: Hygene Ops v5 approved application system
description: Approved 2026-10-20; prototype values transcribed for the real application
colors:
  primary: "#2556d8"
  primary-dark: "#1d42b1"
  selection: "#eef3ff"
  canvas: "#f8fafc"
  surface: "#fff"
  ink: "#0f172a"
  muted: "#475569"
  journey-line: "#dce4ee"
  retained-line: "#e2e8f0"
  journey-success: "#16613d"
  journey-success-soft: "#ecf7f0"
  journey-warning: "#7b4200"
  warning-soft: "#fff7e5"
  journey-danger: "#a32128"
  danger-soft: "#fff0ef"
  retained-success: "#167343"
  retained-success-soft: "#eaf7ef"
  retained-warning: "#8a4b00"
  retained-danger: "#b42328"
typography:
  journey-headline:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-.035em"
  retained-headline:
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-.035em"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.55
  body-urdu:
    fontFamily: "Arabic, Inter, Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.85
  button:
    fontSize: "14px"
    fontWeight: 550
    lineHeight: 1.4
rounded:
  panel: "10px"
  control: "7px"
  chip: "5px"
  journey-dialog: "12px"
spacing:
  flow: "16px"
  stack: "24px"
components:
  journey-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  journey-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  journey-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
```

## Typography
Inter, Arial, sans-serif; Urdu Noto Sans Arabic (v5 Arabic alias), Inter, Arial, sans-serif. Existing installed local font packages may supply equivalent approved faces. Body 15px/1.55 EN, 15px/1.85 UR; headings 30px/1.3 weight 650; h2 19px/1.4; h3 16px; supporting 13/14px. Buttons 14px/1.4 weight 550. Tabular numbers; no new mono font needed.

## Spacing, radii, elevation
Observed spacing: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40px. Panels 10px, fields/buttons 7px, chips 5px, dialogs 12px, circular avatar; one-pixel borders. Source shadow in journeys.css: dialog shadow only; preserve inherited operational shadows until token unit maps them from style.css. No arbitrary decorative elevation.

## Layout conventions
Added sidebar 224px, topbar min 72px; content max 1600px with 28px/32px padding. Retained operational widths follow style.css. Mobile breakpoint 620px; tablet 900px. Use logical inline/block properties; tables adapt/scroll inside container. No page horizontal overflow at 390px.

## Component conventions
Reuse Button/Dialog/Input/DataTable/PageHeader/OperationsState/LanguageChoice. Primary blue action, secondary bordered, quiet text and danger for destructive actions. Visible persistent labels, inline errors linked to fields; busy submit prevents duplicates and explains saving. Reason required for accountable status/annotation. Skeleton for loading; separate no records/no matches/error/stale result. Keep drafts on failed saves/conflicts; no false success.

## States and motion
Source: design/v5/motion.css and stage-motion.js. Ease cubic-bezier(.23,1,.32,1); button feedback 120ms from motion.css; inherited entry/overlay timing must be transcribed from stage-motion.js before introducing it. Only opacity/transform feedback; honor prefers-reduced-motion, no scroll pinning in SaaS workspaces. Disabled opacity .6, 3px blue focus outline + 3px offset; persistent visible keyboard focus.

## Accessibility floor
Text contrast 4.5:1, large text/controls 3:1; 44px targets, mobile 48px, staff primary actions 52px. Keyboard reachability, visible labels, dialog focus/return/Escape, live status/error feedback. Translate complete workflow and errors; set html lang/dir, respect Urdu line height and isolate mixed IDs.

## Native implementation mapping

NativeWind values in `frontend-mobile/global.css` normalize the approved hex palette
to HSL. `frontend-mobile/src/theme.ts` exposes the same primary/canvas/surface/ink/
muted/border/selection values to React Navigation and native style props, which do
not consume CSS variables. This is a bridge for the existing architecture, not a
second theme. Semantic success/warning/error retain their existing meanings. Native
visual acceptance remains pending a real runtime; web export is not that evidence.
