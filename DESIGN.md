---
name: Hygene Ops
description: Calm blue and white operations workspace for cleaning companies and their field staff.
colors:
  primary: "#2556d8"
  primary-dark: "#1d42b1"
  selection: "#eef3ff"
  canvas: "#f8fafc"
  surface: "#ffffff"
  ink: "#0f172a"
  muted: "#475569"
  line: "#dce4ee"
  success-ink: "#16613d"
  success-fill: "#ecf7f0"
  warning-ink: "#7b4200"
  warning-fill: "#fff7e5"
  danger-ink: "#a32128"
  danger-fill: "#fff0ef"
  marketing-primary: "#4264d9"
typography:
  headline:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  subtitle:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.5
  body:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  body-urdu:
    fontFamily: "Noto Sans Arabic, Tahoma, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Inter Variable, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 550
    lineHeight: 1.4
rounded:
  chip: "5px"
  nav: "6px"
  control: "7px"
  panel: "8px"
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
    height: "44px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "44px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  nav-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    padding: "10px 13px"
    height: "46px"
  nav-link-active:
    backgroundColor: "{colors.selection}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
  status-success:
    backgroundColor: "{colors.success-fill}"
    textColor: "{colors.success-ink}"
    rounded: "{rounded.chip}"
    padding: "5px 9px"
  status-warning:
    backgroundColor: "{colors.warning-fill}"
    textColor: "{colors.warning-ink}"
    rounded: "{rounded.chip}"
    padding: "5px 9px"
  status-danger:
    backgroundColor: "{colors.danger-fill}"
    textColor: "{colors.danger-ink}"
    rounded: "{rounded.chip}"
    padding: "5px 9px"
---

# Design System: Hygene Ops

## 1. Overview

**Creative North Star: "The Daily Worksheet"**

Hygene Ops reads like a clear sheet you work down each day. Surfaces are plain and light, ink is strong, and a single blue marks the next action. A manager scanning today's operation and a cleaner with wet hands on a phone should both find the next step without being taught where it is. In the words of `PRODUCT.md`, the product should feel "dependable and calm during repetitive daily work while communicating exceptions and limits without ambiguity."

Density is moderate on web, where tables and summaries need to compare locations, and generous on the staff app, where large targets and one instruction at a time matter more. The web workspace uses a 224px sidebar, a topbar of at least 72px and content that stops at 1600px. Spacing follows the scale in the tokens. Layout stacks at 620px on phones, reflows at 900px and shows the permanent sidebar from 1024px. Urdu is a full direction, not a translation layer: use logical properties so every layout mirrors correctly.

This system rejects "decorative billing pages, generic marketing-style pricing cards inside authenticated workflows, excessive animation, vague feature names, and upgrade prompts that hide the exact limit a user reached."

**Key Characteristics:**
- Daylight only. The product defines no dark theme.
- One blue for action. Green, amber and red only describe state.
- Flat surfaces separated by one-pixel lines.
- One clear next action per step, with secondary actions in outline or ghost style.
- Large touch targets that grow with text.
- Motion confirms a state change and never decorates.

## 2. Colors

A restrained palette of cool neutrals with one working blue and three quiet status pairs.

### Primary
- **Working Blue** (#2556d8): Primary buttons, links, active icons, focus rings and in-progress status, on web and in the staff app.
- **Pressed Blue** (#1d42b1): Primary hover and pressed states, and informational text.
- **Selection Wash** (#eef3ff): The active navigation row, selected options and informational fills.

### Neutral
- **Worksheet Canvas** (#f8fafc): The page behind panels, on web and native.
- **Sheet White** (#ffffff): Panels, fields, dialogs and the text on primary buttons.
- **Strong Ink** (#0f172a): Headings, body text and field values.
- **Quiet Slate** (#475569): Secondary text, metadata and inactive icons.
- **Rule Line** (#dce4ee): Every border, divider and field outline.

### Status
- **Received Green** (#16613d on #ecf7f0): Received, passed and complete.
- **Attention Amber** (#7b4200 on #fff7e5): Review, rework and warnings.
- **Missed Red** (#a32128 on #fff0ef): Missed attendance, overdue work and destructive actions.

### Public site
- **Marketing Blue** (#4264d9): The public landing, features and pricing pages only. Keep it out of the authenticated workspace.

### Named Rules
**The One Blue Rule.** Blue means "act here" or "this is selected". Never use it to decorate a heading, a chart background or an empty panel.

**The Label Always Rule.** Color never carries meaning alone. Every status has words, because reading ability and color vision both vary among staff.

**The Scoped Token Rule.** Workspace tokens live on `.workspace` and its dialogs, and billing setup has its own scope. Never change a global token to restyle one surface.

## 3. Typography

**Body and Heading Font:** Inter Variable (with Arial, sans-serif)
**Wordmark Font:** Manrope Variable (the product logo only)
**Urdu Font:** Noto Sans Arabic (with Tahoma, sans-serif)

**Character:** One familiar, legible sans used with weight and size contrast. It stays out of the way of repetitive work, and tabular numerals keep counts aligned.

### Hierarchy
- **Headline** (650, 30px, 1.3): The page title, once per page.
- **Title** (650, 19px, 1.4): Section headings inside a page.
- **Subtitle** (650, 15px, 1.5): Panel and group headings.
- **Body** (400, 15px, 1.55): Default text. Paragraphs use 1.6 and stay within 75ch.
- **Label** (400, 13px, 1.5): Field text and compact metadata. Status chips use 12px at 550.
- **Button** (550, 14px, 1.4): All button text. It wraps instead of truncating.

The staff app uses 16 to 18 logical units for instructions and 52px or taller actions. Native screens use bundled Inter and Noto Sans Arabic.

### Named Rules
**The Urdu Air Rule.** Urdu runs at 1.85 line height. Never set it at the English line height, and never give it a substitute Arabic-language font stack without Noto Sans Arabic first.

**The Original Text Rule.** Keep emails, URLs, currency and IDs left-to-right inside Urdu layouts, and keep user-entered location and task names exactly as entered.

## 4. Elevation

The system is flat. Depth comes from the one-pixel Rule Line and the step between Worksheet Canvas and Sheet White. Panels, buttons and fields have no shadow at rest.

### Shadow Vocabulary
- **Pressed-in option** (`box-shadow: 0 1px 3px oklch(0.2 0.01 180 / 0.06)`): The selected language in the language switch.
- **Metric hover** (`box-shadow: 0 2px 8px oklch(0.3 0.02 180 / 0.04)`): A clickable metric on hover only.

### Named Rules
**The Flat At Rest Rule.** Nothing casts a shadow while idle. If a screen looks like a stack of floating cards, remove the shadows and use a line.

## 5. Components

Motion across components is limited to color feedback: background changes take 160ms ease-out, button feedback takes 120ms, and any entrance uses `cubic-bezier(.23, 1, .32, 1)`. Reduced-motion preferences turn animation off.

### Buttons
Direct and unadorned.
- **Shape:** Gently rounded (7px) on web. Native uses 12px, and 16px on large actions.
- **Primary:** Working Blue with white text, at least 44px tall with 9px by 14px padding. Native primaries are at least 52px, and large ones 60px.
- **Hover / Focus:** Hover moves toward Pressed Blue. Focus shows a 3px Working Blue outline.
- **Outline / Ghost:** Outline uses Sheet White with a Rule Line border. Ghost has no border until hover.
- **Destructive:** A tinted red fill with red text, never a solid red block.
- **Disabled:** 55% opacity, always with a nearby explanation of why.

### Chips
- **Style:** Tinted status fill with matching ink, 5px corners and 5px by 9px padding, with no border.
- **State:** The tone comes from the status. Words are always present.

### Cards / Containers
- **Corner Style:** 8px for operational panels, 10px for billing setup panels.
- **Background:** Sheet White on Worksheet Canvas.
- **Shadow Strategy:** None, per The Flat At Rest Rule.
- **Border:** One-pixel Rule Line.
- **Internal Padding:** 16 to 24px on web, 20px on native.

### Inputs / Fields
- **Style:** Sheet White, one-pixel Rule Line border, 7px corners, at least 44px tall, 13px text inside the workspace.
- **Focus:** A 3px Working Blue outline.
- **Error / Disabled:** Errors appear as persistent text beside the field, not by color alone.

### Navigation
- **Web:** A white 224px sidebar with groups for daily operations, your organization and administration. Rows are at least 46px with 14px text and a quiet icon. The active row uses Selection Wash, weight 650 and a blue icon. Below 1024px the sidebar becomes a dialog with a name, Escape behavior and focus return.
- **Staff app:** Three bottom tabs: My day, Tasks, Help & account.

### Data Table
Desktop shows a keyboard-reachable table. Phones show summary rows with visible actions and expandable detail. Reuse the existing table before building another list pattern.

### Language Switch
English and اردو stay visible on every primary surface. The chosen language has a raised white pill inside a quiet track.

## 6. Do's and Don'ts

### Do:
- **Do** use #2556d8 for the single next action on each step, and outline or ghost for everything else.
- **Do** keep frequent web actions at 44px or taller, phone-width web actions at 48px, and staff primary actions at 52px or taller.
- **Do** give every status its words, and every blocked action its reason and next step.
- **Do** use the existing Button, Input, Text, PageHeader, SurfaceCard, OperationStatus and DataTable components before creating a new pattern.
- **Do** use logical CSS properties so Urdu mirrors without separate layouts.
- **Do** state allowances, current usage and unavailable capabilities in concrete language.
- **Do** keep submitted, verified and review-closed visually and verbally separate.

### Don't:
- **Don't** build "decorative billing pages" or use "generic marketing-style pricing cards inside authenticated workflows."
- **Don't** add "excessive animation", or any continuous motion on operational screens.
- **Don't** use "vague feature names" or "upgrade prompts that hide the exact limit a user reached."
- **Don't** use a colored side stripe (a left or right border over 1px) on cards, rows or alerts.
- **Don't** use gradients, gradient text, glass effects or large shadows in the workspace.
- **Don't** nest panels inside panels, or use a modal when inline content will do.
- **Don't** compress submission, verification and review closure into one green Complete badge.
- **Don't** apply marketing patterns or Marketing Blue to workspace screens.
- **Don't** show a fabricated zero where data is missing; show a dash or "No data".
