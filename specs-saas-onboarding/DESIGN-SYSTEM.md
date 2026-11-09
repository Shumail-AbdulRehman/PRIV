# Design system: account, plan and checkout flow

Source: `design/saas-onboarding/v3` (approved 2026-11-09), from the user-supplied Hygene Ops brand. A token not listed here does not exist. All tokens live on `.flow-shell` in `frontend/src/pages/Onboarding/flow.css`.

## Direction

"The Daily Worksheet". One sheet of paper sits on a fresh aurora table for the whole journey. Progress is ticked off on it, and each finished step leaves a sheet edge behind the current one. Calm, exact and trustworthy.

Must not look like: a generic pricing-card grid, a decorative billing page, or a screen that leaves the user unsure whether they were charged. No free-trial wording, invented discounts, "most popular" labels, gradient text, glass, or side-stripe borders.

## Colour tokens

Light only. There is no dark theme.

| Token | Value | Use |
|---|---|---|
| `--flow-primary` | `#2556d8` | Primary action, links, focus, ticks |
| `--flow-primary-dark` | `#1d42b1` | Primary hover |
| `--flow-wash` | `#eef3ff` | Selected plan, info notices |
| `--flow-canvas` | `#f8fafc` | Order summary, quiet surfaces |
| `--flow-paper` | `#ffffff` | Sheet, fields, worksheet |
| `--flow-ink` | `#0f172a` | Text, header text |
| `--flow-muted` | `#475569` | Secondary text |
| `--flow-line` | `#dce4ee` | Borders and rules |
| `--flow-placeholder` | `#64748b` | Field placeholder |
| `--flow-skeleton` | `#e8eef6` | Loading blocks |
| `--flow-ok-ink` / `--flow-ok-fill` | `#16613d` / `#ecf7f0` | Done, success notice |
| `--flow-warn-ink` / `--flow-warn-fill` | `#7b4200` / `#fff7e5` | Test mode, review, warnings |
| `--flow-bad-ink` / `--flow-bad-fill` | `#a32128` / `#fff0ef` | Errors, declined |
| `--flow-table-soft` | `#334155` | Inactive language label on the table |
| `--flow-table-track` | `#ffffff99` | Language switch track |
| `--flow-table-base` | `#eaf3ff` | Table base colour |
| `--flow-aurora-blue` | `#7ea6ff` | Top-left bloom |
| `--flow-aurora-mint` | `#6fe0cf` | Top-right bloom |
| `--flow-aurora-sky` | `#a7c4ff` | Bottom-right bloom |
| `--flow-aurora-seafoam` | `#b7f0e4` | Bottom-left bloom |
| `--flow-panel-mint` | `#d6f6ec` | Side panel start |
| `--flow-panel-sky` | `#d6edfb` | Side panel middle |
| `--flow-panel-blue` | `#d2e2ff` | Side panel end |
| `--flow-sheet-behind` | `#ffffffa6` | Second worksheet sheet |

### Composed backgrounds

- **Table**: on the base colour, four radial blooms fading to transparent. Top-left 60% by 70%, top-right 50% by 60%, bottom-right 70% by 70%, bottom-left 55% by 60%, in the colours above. Fixed to the viewport, behind content.
- **Supergraphic**: the logo tick in white at 40% opacity, cropped at the bottom end corner, at most 980px wide and 68vw. Mirrored in right-to-left.
- **Side panel**: 160 degree linear gradient, panel-mint, panel-sky at 55%, panel-blue. Holds the tick in white at 60% opacity, low in the corner, never crossing text.

## Typography

| Role | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Heading | Inter Variable, Arial, sans-serif | 36px, 28px at 560px and below | 650 | 1.15 | -0.035em |
| Panel headline | Inter Variable | 22px | 600 | 1.3 | -0.025em |
| Section title | Inter Variable | 17px | 650 | 1.4 | -0.02em |
| Lede | Inter Variable | 16px | 400 | 1.55 | normal |
| Body | Inter Variable | 15px | 400 | 1.55 | normal |
| Label | Inter Variable | 14px | 550 | 1.4 | normal |
| Fine print | Inter Variable | 13px | 400 | 1.5 | normal |
| Chip | Inter Variable | 12px | 550 | 1.4 | normal |
| Button | Inter Variable | 15px | 600 | 1.4 | normal |
| Plan price | Inter Variable | 22px | 650 | 1.2 | -0.03em |
| Wordmark only | Manrope Variable | 21px, 18px on phones | 750, "Ops" 500 | 1 | -0.05em |
| Urdu, all roles | Noto Sans Arabic, Tahoma, sans-serif | as above | 400 or 600 | 1.85, headings 1.6 | normal |

Numbers use tabular figures. Emails, card numbers and amounts stay left-to-right inside Urdu. Headings balance their lines.

## Spacing, radii, elevation

- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 56px.
- Radii: chip 5px, nav and inner control 5px, control 7px, panel 8px, side worksheet 10px, sheet 12px.
- Sheet shadow: `0 1px 2px rgb(15 23 42 / .04), 0 18px 44px -28px rgb(15 23 42 / .22)` with a one-pixel line border.
- Worksheet shadow: `0 1px 2px rgb(15 23 42 / .05), 0 24px 40px -26px rgb(15 23 42 / .35)`.
- Stacked sheet edges: 40px tall, one-pixel line border, no bottom border, offset 6, 12 and 18px upward, scaled 0.975, 0.95 and 0.925, opacity 1, 0.8 and 0.6.

## Layout conventions

- Sheet max-width: narrow 520px, plan 880px, payment 1040px, sign-in and signup 980px. Centred, 36px top margin at most.
- Sign-in and signup at 861px and up: form column plus 440px side panel, sheet padding zero, form padding 32 to 52px, panel padding 28 to 48px.
- Below 861px: the panel is hidden and the steps row shows.
- Payment: main column 1.3fr, summary 0.9fr, 24 to 48px gap, summary sticky. Below 1024px the summary sits above the form without capacities or the security note.
- At 380px and below: the sheet goes edge to edge and the card form spans the full width, so it is at least 312px at a 320px viewport.
- The page body never scrolls sideways. Use logical properties so Urdu mirrors.

## Component conventions

- **Primary button**: primary colour, paper text, 48px minimum height, control radius, full width in forms.
- **Secondary button**: paper, line border, ink text.
- **Busy button**: spinner and a label naming the action, for example "Creating your account…". Disabled with a progress cursor.
- **Field**: visible label above, 48px high, line border, paper fill. Errors appear below in bad ink, as text, and the field gets `aria-invalid`.
- **Password**: Show or Hide text button inside the end of the field. Always left-to-right.
- **Notice**: fill and ink by tone, 7px radius, 14px text, `role=alert` for errors and `role=status` otherwise. Never colour alone.
- **Steps**: four items, Account, Plan, Card, Workspace. Box 20px, 5px radius. Current has a primary border, done has a primary fill and white tick. `aria-current=step`.
- **Plan row**: a labelled radio across plan name, description, locations, staff, managers, price. Selected: wash fill and 1.5px inset primary ring. Numbers never move. On phones capacities become one row of three.
- **Interval switch**: two buttons in a bordered track with a sliding thumb.
- **Status chip**: tinted fill, matching ink, 5px radius, words always present.
- **Side panel**: headline first, then a worksheet tilted 1.2 degrees, with a second sheet behind it at 2.2 degrees. Tilt direction mirrors in Urdu.
- **Test card box**: warn fill, dashed line border, shown only when browser and server are both sandbox. Copy action. Extra test cards in a disclosure.
- **Order summary**: canvas fill. Plan, interval, capacities, subtotal, tax, due today, renewal line, change plan, security note. Amounts come from Paddle events and show skeletons until `checkout.loaded`.
- **Loading**: skeletons that match the final layout, with a visible label for the card form. No bare spinners except inside busy buttons and the recovery check row.

## States and motion

Curves: ease-out `cubic-bezier(.23,1,.32,1)`, in-out `cubic-bezier(.77,0,.175,1)`. Only `transform`, `opacity`, colour and `stroke-dashoffset` animate.

| Element | Trigger | Properties | Duration | Reduced motion |
|---|---|---|---|---|
| Step tick | Step completes | Stroke draw, box fill | 260ms after 60ms | Instant |
| Sheet edges | Step advances | Opacity, transform | 240ms | Instant |
| Sheet | Screen change | Opacity from .4, 10px rise, scale .992 | 240ms | Instant |
| Screen content | Screen change | Opacity, 8px rise, whole section at once | 200ms | Instant |
| Primary button | Press | Scale .98 | 120ms | Instant |
| Button, field, tab | Hover or focus | Colour, hover gated to fine pointers | 160ms | Instant |
| Busy spinner | Submit | Rotate | 700ms loop | Static |
| Interval thumb | Toggle | Transform, width | 200ms in-out | Instant |
| Plan row | Select | Fill, ring, radio border | 120 to 160ms | Instant |
| Price text | Plan or interval change | Opacity from .25 | 160ms | Instant |
| Notice, field error | Appears | Opacity, 4px | 200ms | Opacity 120ms |
| Sign-in worksheet | Page load, once | Ticks draw 190ms apart after 420ms | 260ms each | Static |
| Card form skeleton | Loading | Opacity to .55 | 1100ms alternate | Static |
| Card form | `checkout.loaded` | Container opacity only | 240ms | Opacity 120ms |
| Confirming row | Waiting | Ring opacity and scale | 1200ms loop | No ring |
| Ready stamp | Success | Fade and scale .9, then tick draw | 280ms, then 420ms | Instant |
| Disclosure | Opens | Content opacity | 160ms | Instant |

Never animated: the language switch, focus rings, anything inside Paddle's form, the table background, and numbers being compared.

Selection uses the wash colour. Field caret uses the primary colour.

## Accessibility floor

Text contrast 4.5:1, large text and controls 3:1. Controls at least 44px, form actions 48px. Visible labels and 3px focus outlines. Status changes announced with `role=status` or `role=alert`. Keyboard reaches everything in reading order. Focus moves to the new heading on a screen change. Works at 200% zoom and at 320px.
