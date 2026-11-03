---
name: Hygene Ops v4 candidate
description: Candidate blue and white offline operational prototype; PENDING USER APPROVAL
colors:
  primary: "#2556d8"
  primary-dark: "#1d42b1"
  canvas: "#f8fafc"
  surface: "#fff"
  surface-soft: "#f1f5f9"
  ink: "#0f172a"
  muted: "#475569"
  line: "#e2e8f0"
  blue-soft: "#eef3ff"
  warning: "#8a4b00"
  warning-soft: "#fff7e5"
  danger: "#b42328"
  danger-soft: "#fff0ef"
  success: "#167343"
  success-soft: "#eaf7ef"
typography:
  headline:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-.035em"
  title:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.02em"
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
rounded:
  container: "10px"
  review-container: "9px"
  control: "7px"
  navigation: "6px"
  badge: "5px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  nav-active:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.navigation}"
    padding: "10px 12px"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
---

# Design System: Hygene Ops v4 candidate

## Overview

**PENDING USER APPROVAL — candidate documentation for `design/v4` only.** This records the implemented offline prototype. It is not the root design system, `specs/DESIGN-SYSTEM.md`, a finalized implementation specification, or evidence of production readiness. The user has not approved v4.

**Creative North Star: "A clear operational workspace"**

This working description reflects the blue/white direction in `brief.md`; it is candidate language, not a separately approved brand metaphor. Professional blue actions, navy text, white navigation and quiet slate surfaces support calm daily work. Product constraints come from `../../PRODUCT.md`: readable English/Urdu, visible exceptions, respectful staff workflows and operational clarity.

Extraction authority is the stylesheet order in `index.html`: `base.css` followed by `style.css`, including its Stage 03 and final mobile overrides. `app.js` supplies the actual Today and Photo Reviews interactions; several secondary routes inherit `legacy.js`. Old green root declarations in `base.css` are overridden and are not the candidate palette. The existing root `DESIGN.md` is intentionally untouched.

**Key Characteristics:**
- White/slate surfaces with a professional blue action and selection vocabulary.
- Compact operational hierarchy with readable labels and tabular numbers.
- Separate submission, task completion, photo requirements and review closure facts.
- English/Urdu direction changes and limited, purposeful feedback motion.

## Colors

The candidate uses one primary accent with semantic success, warning and danger colors; values above describe the effective source cascade.

### Primary
- **Professional Blue:** primary buttons, selected navigation, links and focus outlines.
- **Deep Action Blue:** primary-button hover on fine pointers.
- **Pale Selection Blue:** navigation selection, language selection and informational badges. The inherited variable named mint now resolves to this blue family; its name does not authorize green branding.

### Neutral
- **Navy Ink:** main text and headings.
- **Slate Text:** descriptions, metadata and secondary navigation.
- **White Surface:** sidebar, header, panels, fields and dialogs.
- **Cool Canvas / Soft Slate / Divider Slate:** app background, low-contrast group backgrounds and boundaries respectively.

### Semantic
- **Success Green:** completed facts and successful review/save feedback only.
- **Amber Warning:** late/review-needed signals, missing requirements and explanatory callouts.
- **Critical Red:** overdue and critical missing/failed facts. Pair every semantic color with a label or icon.

**The Fact Before Color Rule.** Green communicates an established success fact; a submitted task or closed review does not imply verified task completion.

Progress graphics retain a small source-specific series palette distinct from the semantic primitives. Those one-off chart colors are not new brand accents.

## Typography

**Body and heading font:** locally bundled Inter, with Arial and sans-serif fallbacks. **Urdu font:** locally bundled Noto Sans Arabic, exposed by the CSS family alias `Arabic`, with Inter and Arial fallbacks. `base.css` defines the local font faces; no remote font service is required.

The hierarchy uses a compact page headline, restrained section titles and 13–15px supporting text. Page headline, title and body roles are recorded above; component-specific review headings use 20px, and mobile page headings use 28px. The final progress number is 29px. Buttons use medium emphasis; numeric data uses tabular figures. Paragraphs are limited to 75ch where the general paragraph rule applies.

Urdu body leading is more open. `app.js` changes the document language to `ur-PK` and direction to RTL, and uses `bdi` around mixed-direction staff, location and time facts. Preserve structural direction changes rather than merely aligning translated text to the right.

## Layout

The effective desktop navigation is 224px wide, reduced to 206px at widths up to 1200px, and replaced with menu navigation at widths up to 1024px. These values are extracted from the effective source, rather than inferred from a proposed layout. The main header is 72px, then 66px at up to 1024px and 64px at up to 650px. A separate prototype preview bar remains visible.

General content is centered with a maximum width of 1600px, 28px/32px/24px outer padding at the base desktop size, and smaller breakpoint-specific gutters. Review content has a separate maximum width of 1920px. The source retains the 4px spacing scale above, but also uses observed optical spacings such as 10px, 14px, 18px and 22px; do not claim a strict exclusive spacing lattice.

Today pairs attendance and task progress, followed by a task table and a compact aside containing urgent signals, review handoff and upcoming work. The default aside is 300px; it narrows at intermediate widths. At up to 800px, the layout stacks; at up to 650px the final order is urgent signals, compact review handoff, task list, then upcoming work. The task table becomes labeled record rows. Today opens task context in a native dialog drawer and links into Photo Reviews; it does not contain the review decision workbench.

Photo Reviews uses three columns only above 1500px: 280px queue, flexible evidence and 310px decision surface. At up to 1500px, the decision surface moves below evidence in the second column; queue widths change to 270px, 248px at up to 1200px, 265px at up to 1024px and 230px at up to 800px. At up to 650px it becomes queue → detail with an explicit back action; evidence and decisions share the detail view. Selected queue accents reverse their inset edge in RTL.

## Elevation & Depth

Panels are chiefly flat, separated by borders and white/slate tonal layers. The source uses a restrained overlay shadow (`0 12px 40px #0f172a14`) for drawers and menus, and a tiny selected queue-tab shadow (`0 1px 3px #0f172a0a`). Dialog backdrops use `#0f172a66`. These are structural cues, not decorative card lift.

Motion tokens belong to the sidecar: 120ms press feedback, 180ms status/viewer feedback and 220ms drawer entry with `cubic-bezier(.23,1,.32,1)`. Pointer-opened drawers enter from 24px on the appropriate direction edge; viewers enter from scale .97. Keyboard-opened dialogs are instant. Reduced motion removes transforms and button transitions and keeps only 180ms opacity feedback. No page or chart choreography is implemented.

## Shapes

Main operational containers use gently curved 10px corners; review containers use 9px. Controls use 7px, navigation and thumbnail shells commonly use 6px, badges use 5px, and avatars remain circular. One-pixel boundaries define groups and tables. Phone viewers become edge-to-edge and square at the outer dialog boundary. Reuse the source's component forms rather than normalizing all corners into a fabricated single radius.

## Components

### Buttons and navigation

Primary actions use Professional Blue and white text; secondary actions use white with a divider border; quiet actions remove the visible fill and border. Base buttons are at least 44px high and become at least 48px at phone width. Fine-pointer hover changes primary fill to Deep Action Blue. Press feedback scales to .985; keyboard focus-active suppresses that transform. The inherited visible focus treatment is a 3px primary outline with a 3px offset. Disabled controls retain source opacity .58.

The white sidebar has labeled links, a company/role panel and profile/settings. Active links use pale blue fill and blue text, with `aria-current`. The final navigation link minimum is 46px; the visible mobile menu changes the navigation layout. Pending-review counts derive from the same scoped review records as the workbench.

### Fields and chips

Fields use white surfaces, 7px corners and a 1px boundary; the final inherited field border is `#ccd7e6`, while the decision textarea has its own source border. Search fields are at least 42px high. Phone decision textareas use 16px text. Labels remain visible, errors are explicit and note validation focuses the relevant field. Status badges combine text and semantic fill; selected tabs and outcomes expose `aria-pressed`.

### Operational panels

White bordered containers organize paired progress, task rows and concise signals. Task search and status filters are in memory. Site selection scopes operational records. The date view is a fixed 20 October 2026 sample, not a live calendar. Staff submission is labeled separately from backend task state.

### Review queue and evidence

The queue provides Pending/Reviewed/All tabs, search, site/date and reason filters. Selection shows staff, site, received timestamp, reason and task facts. Required views are named Basin, Toilet and Floor, not invented before/after pairs. Images fit inside the evidence viewport; zoom steps from 100% to 250% in 25% increments, with enlargement and fit controls. The source provides image-loading, failed-image and missing-view states. Synthetic local WebP assets are explicitly labeled; they are not real workforce evidence or an authorization model.

### Review decision

Two candidate UI outcomes represent supported closure actions: resolve review (`RESOLVE_REVIEW`) and record a performance issue (`RECORD_PERFORMANCE_ISSUE`). Both require a note; the issue path additionally names assigned staff and a category. The prototype records the selected outcome, author, sample time and attributed issue facts in the current page memory. Closure updates review counts and offers the next pending review; it does not verify the task or waive required photos. Error/conflict previews retain the note and ask for refresh. Future CLEAN/DIRTY/UNCERTAIN samples are explicitly labeled proposed, selected by the reviewer, and have no running AI model or numeric confidence.

**The Closure Boundary Rule.** A review decision changes review facts only; submission, verification and missing-photo requirements stay separate.

The preview implements fictional local interactions. Cross-page links preserve closed IDs and counts through query parameters, not full saved decisions. It does not implement backend authorization, durable persistence, real authentication, delivery, upload recovery, idempotency or conflict reconciliation. Real evidence access must use authorized server byte reads under company/site/self scope, as stated in the brief. These documents are a prototype inventory, not implementation specifications.

## Do's and Don'ts

### Do:
- **Do** keep blue action and selection emphasis, navy text and white/slate surfaces in this candidate prototype.
- **Do** show explicit semantic labels, visible keyboard focus, English/Urdu direction changes and reduced-motion behavior.
- **Do** preserve the distinction between staff submission, task completion, photo receipt and review closure.
- **Do** label synthetic evidence and future AI samples plainly.

### Don't:
- **Don't** treat this candidate as user approval, production readiness or a replacement for the root design system.
- **Don't** use success green as general branding or imply a review closure verifies the task.
- **Don't** offer unsupported manual extensions, photo waivers or retake actions.
- **Don't** infer real access control, persistence, model findings or recovery delivery from a local preview.
