---
name: Hygene Ops v5 candidate extension
description: PENDING EXPLICIT USER DESIGN APPROVAL; observed offline candidate values only
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
---

# Hygene Ops v5 candidate design record

## Overview

**PENDING EXPLICIT USER DESIGN APPROVAL.** Scope is approved in principle only. This is an observed inventory for the offline `design/v5` candidate, not an approved design system, final implementation specification or `specs/DESIGN-SYSTEM.md`. All D01–D12 remain unresolved. No application implementation is authorized by this record.

The incumbent world is the blue/white operational candidate recorded in [v4/DESIGN.md](../v4/DESIGN.md). V5 extends that world with account and staff journeys; it preserves the name/logo, local fonts, calm surfaces, Today register and separate Photo Reviews workbench. “A clear operational workspace” remains incumbent descriptive language, not a newly approved brand metaphor. Readability, explicit exceptions and respectful English/Urdu workflows follow [PRODUCT.md](../../PRODUCT.md).

There are two actual stylesheet families. Added journeys load `journeys.css`, then `motion.css`; retained operational pages load `base.css`, then `style.css`, then `motion.css`. `stage-motion.js` supplies additional overlay/status feedback. The green declarations at the start of `base.css` are overridden by `style.css` and are not candidate branding. Frontmatter records observed reusable values within these families; it does not close their differences or authorize future implementation tokens.

The sequence is Stage 01 gpt-taste → Stage 02 animate → Stage 03 impeccable. The root candidate is intended to mirror Stage 03 after final refinements. The pinned established-world brief controls this code-led extension; it does not introduce a new identity or marketing composition. Candidate documentation preserves the incumbent files and does not repair existing root PRODUCT/DESIGN/context or sidecar drift. No new sidecar is needed for this ordinary extension; the incumbent v4 sidecar remains untouched.

**Key characteristics:**

- Blue action and selection, navy text, white panels and cool slate canvas.
- Searchable registers, explicit field labels, accountable context and limited semantic color.
- Separate operator, company, staff and public/auth shells; the gallery serves reviewers.
- Distinct photo receipt, submission, verification and review closure facts.

## Colors

### Primary

Professional Blue marks actions, links, selected navigation and keyboard focus. Deep Action Blue is its fine-pointer hover state. Pale Selection Blue supports active navigation and information states. Success green remains semantic rather than a second brand accent.

### Neutral

Navy Ink carries primary content; Slate Text carries supporting facts. White surfaces and a cool canvas separate navigation and work. Source families differ in divider color, recorded separately above. New journey fields use a stronger observed border (`#b5c4d8`); retained fields use their inherited overrides, including `#ccd7e6`. These are source differences, not a new unified token decision.

### Semantic

Journey success/warning/danger foregrounds differ slightly from retained v4 values. Pair tones with visible labels and icons; no general palette replacement is implied. Warning and danger soft fills remain shared; journey success has its own soft fill. Small chart-series shades are source-specific data presentation, not new brand accents.

**The Fact Before Color Rule.** Successful receipt, submitted work, completed work and closed review describe separate facts; green does not merge them.

## Typography

Inter is locally bundled for English and ordinary labels; local Noto Sans Arabic uses the family alias `Arabic`. Journey Inter declares a variable weight range; Arabic includes regular and semibold files. No external font service is required.

Both families use a compact headline and 15px body. Added journey section headings are 19px/1.4 with negative tracking; retained sections commonly use 18px. Added journey subheadings are 16px. Supporting labels commonly use 13–14px. Journey headline leading is slightly more open than retained v4 leading, recorded above rather than silently standardized. Gallery headings use 38px at desktop and 30px on phones; they are reviewer presentation, not an operational heading rule.

Journey phone headings use 27px, secondary headings 20px, paragraphs 16px and primary task buttons 16px. General paragraphs cap at 75ch. Tabular figures support names/time/number facts without introducing a new mono family. Urdu body leading is more open; both document language (`ur-PK`) and structural direction (`rtl`) change. Mixed names, times and site facts use `bdi`. Logical borders/margins and selected-edge treatment preserve reading order, rather than merely right-aligning English layouts.

## Layout

Added journey desktop shells have a 224px sidebar below a 38px reviewer preview bar and a minimum 72px top bar. Content caps at 1600px with 28px/32px/40px padding. Split content uses a flexible main column plus 300px aside, increasing to 340px at 1600px; the last Stage 03 override stacks right-rail fact labels above their values. Forms use two columns and 18px gaps. Flow/stack spacing uses 16px/24px, with additional observed optical spacings; no exclusive spacing lattice is claimed.

At up to 1100px the journey sidebar narrows to 206px, gutters become 24px and the aside narrows to 260px. At up to 900px the sidebar becomes a menu and ordinary splits stack; equal splits remain paired until 650px. Phone gutters become 16px, forms/equal splits become single-column, and summary strips become two columns. Responsive tables hide the header and expose labeled record rows. Tabs scroll horizontally. The menu uses a bounded scrollable overlay; no page-wide role switcher is proposed.

Retained v4 operational pages keep their own breakpoints: sidebar reduction at 1200px, menu at 1024px, Today stacking at 800px and phone row/order changes at 650px. Photo Reviews uses queue/evidence/decision columns above 1500px; below that the decision area moves below evidence, with queue-to-detail phone navigation at 650px. Those observed differences remain inherited, not harmonized by this documentation pass.

The added staff simulation has a 420px desktop phone frame and a 580px minimum content region. At 650px it becomes flat/edge-to-edge, caps at 480px and uses a viewport-based content minimum with sticky bottom tabs. Auth content caps at 480px. The reviewer gallery caps at 1280px and changes from three columns to two at 1100px, then one at 650px. These HTML frames do not certify native Android layouts.

## Elevation & Depth

Panels are flat and bordered, with tonal separation doing most of the work. Added dialogs and menu overlays use the observed structural shadow (`0 16px 50px #10233e26` for dialogs; `0 12px 40px #10233e26` for menu). The desktop phone frame uses a very light shadow (`0 12px 40px #203c5e0a`). Retained overlays retain their v4 shadow (`0 12px 40px #0f172a14`). Dialog backdrops use `#0f172a66`. These differences are recorded as built, not normalized into a new elevation scale.

Motion remains restrained: 120ms button feedback, 180ms status feedback and 220ms occasional dialog entry with `cubic-bezier(.23,1,.32,1)`. Added fine-pointer button feedback scales to .985 and suppresses the transform when focus-visible. Added dialogs scale from .97; feedback fades from .7 opacity. Keyboard-triggered additions skip this animation. Reduced motion removes added button transforms/transitions and replaces dialog transforms with 180ms opacity feedback. Retained drawers keep their direction-aware v4 entry and reduced-motion alternatives. There is no page entrance or chart choreography. The shared observer also runs on retained routes, so this inventory does not claim one exclusive animation mechanism per retained element.

## Shapes

Panels use gently curved corners, controls smaller corners and badges a compact rounding. Added dialogs use their own larger radius; retained review containers remain 9px and navigation/thumb details retain their inherited forms. Added navigation links use 7px corners, and phone frames use 24px before becoming square at the outer boundary on small screens. Avatars and step markers stay circular. One-pixel borders organize rows, panels and field boundaries. Preserve source distinctions rather than forcing every shape into one radius.

## Components

### Actions, fields and navigation

Added primary actions use blue fill/white text; secondary actions use white with a slate border, quiet actions use transparent surfaces and blue text, and destructive previews use semantic danger. Buttons are at least 44px high, 48px on phones; staff task actions are 52px. Visible focus is a 3px blue outline with a 3px offset. Added disabled controls use opacity .6; inherited controls retain their own source values. Fine-pointer hover avoids a persistent touch hover affordance.

Fields retain visible labels, 7px corners, minimum 44px height and 10px/12px padding. Textareas start at 110px and resize vertically. Required validation and `aria-invalid`/error messages explain blocked forms. Dialogs have an accessible title, native `dialog` semantics, explicit close/cancel, Escape handling, draft/conflict refresh and an in-dialog language control. Native HTML focus behavior is evidence for the browser candidate only.

Selected navigation uses pale blue and `aria-current`; language and action tabs use `aria-pressed`. Badges carry text, with success/warning/danger tones. Added tabs are underline selections with a 48px minimum height. Tables pair identifiers with state, plan and sync facts; narrow screens expose data labels instead of squeezed desktop columns.

### Workspaces and candidate state

The operator register supports local search/filter/paging and customer Account/Billing/Activity context. Status previews require a reason and acknowledgement and append fictional actor/time/reason history. Service/audit/inquiry/security examples expose commercial metadata and synthetic diagnostics, with no workforce drilldown. Company ADMIN remains the owner; manager samples omit owner Organization/billing controls and require an assigned site when adding a hire. These visible differences are interface examples, not access enforcement.

Setup links verification/billing with editable sample site, staff/shift, template and schedule steps. Billing shows usage/capacity and lifecycle handoffs without invented prices, durations or effective dates. Recovery acknowledgements remain neutral and do not imply delivery. Added hire rows render the entered name, site and shift in saved demonstration context. Transfer/handover previews retain attributed notes in the visible sample history; they do not imply an effective transfer or access revocation. Attendance annotations retain original captured facts and display attributed context separately.

Added journey mutation context uses browser `window.name`/sessionStorage under a fictional namespace, with reset support; credentials are not serialized. This is demonstration state, not durable application persistence. Inherited v4 decisions retain their original memory/query limitations. Reviewer loading, no-records/no-match, unavailable, denied, save-failure, conflict and offline states illustrate responses; they are not network tests or real restrictions. Conflicts preserve drafts and provide an explicit sample-record refresh.

### Today and Photo Reviews

Retained Today pairs attendance/task progress with a searchable task register and urgent/review/upcoming context. Its drawer provides task context and review handoff. Photo Reviews remains a separate queue/evidence/decision workspace with local synthetic Basin/Toilet/Floor assets, fit/zoom and missing/failed-image states. Resolve-with-note and attributed performance issue remain the supported sample outcomes; note/category validation and next-review/conflict handling stay intact. Closing review does not verify submitted work or waive required views; retired extension/retake actions remain absent.

### Staff daily work and recovery

The added staff phone sample follows check-in → task QR → start cleaning → photo-authority QR → guided three views → receipt/result → submission → My day → checkout. GPS/selfie/QR/photo/push are simulated. Lost response recovery checks the same capture result before continuing. Received, submitted and verified remain different facts; successful submission stays visible when returning to My day. Alert denied/unavailable states expose settings guidance and explicit retry. No hidden offline evidence queue is introduced. Proposed later replacement stays explicitly dependent on D11.

**The Closure Boundary Rule.** A recorded review, attendance note, transfer context or account request changes only its stated fictional context; it does not prove a production side effect.

## Do's and Don'ts

- **Do** preserve the incumbent blue/white identity, local bilingual type, visible focus and plain operational hierarchy while reviewing this extension.
- **Do** keep actor/time/reason and original captured facts visible where the candidate records context.
- **Do** label reviewer controls, synthetic assets, illustrative mutations and unresolved D01–D12 decisions explicitly.
- **Don't** treat this inventory as explicit design approval, an approved token contract or authorization for implementation specifications.
- **Don't** infer native accessibility, security, tenant isolation, provider correctness, capture, delivery, AI evaluation or production persistence from offline HTML.
- **Don't** repair existing root context/sidecar drift or replace v4 documentation as a side effect of this extension.

Verification evidence and its limits belong to [QA.md](QA.md), [COVERAGE.md](COVERAGE.md), `qa-summary.json` and [FINISH-VERDICT.md](FINISH-VERDICT.md). The final reported QA covers 328 layout/state/dialog entries, 114 selected-rule axe scans and 32 passing interaction groups; the independent verdict resolves the two targeted truth fixes only. This documentation pass extracts source behavior; it does not turn those bounded checks into full accessibility certification or close product policy decisions.
