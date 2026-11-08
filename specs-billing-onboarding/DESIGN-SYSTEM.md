# Billing design system

Source: design/billing-onboarding/revision-2/v3 (approved as amended 2026-11-06). Approval basis and fingerprint: design/billing-onboarding/revision-2/approval.json. The amendment removes Help/Contact controls, support-dependent wording and FAQ/help panels. Preserve v1/v2 as stage history.

## Direction

Familiar operational SaaS onboarding adapted from inspected Linear/Notion patterns: a setup rail, three equal selectable capacity panels, one continuation, a focused summary/Paddle handoff and quiet confirmation. Existing Hygene Ops brand is fixed. No marketing hero, invented popularity/savings, decorative payment icon tile or support affordance.

## Colour tokens

The following is the complete source :root list, read directly from approved CSS. In application CSS, scope these beneath `.billing-onboarding`; prefix with `--billing-` if necessary to avoid collisions and record the exact mapping once. Never create a competing global palette or new raw palette classes in feature JSX.

| Source token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#f8fafc` | Neutral sidebar/summary canvas |
| `--paper` | `#fff` | Main/card surface |
| `--ink` | `#0f172a` | Primary text |
| `--muted` | `#475569` | Supporting text |
| `--line` | `#dce4ee` | Rules and control borders |
| `--blue` | `#2556d8` | Selected/primary action/focus |
| `--blue-hover` | `#1d42b1` | Primary hover |
| `--wash` | `#eef3ff` | Selected neutral-blue surface |
| `--green` | `#16613d` | Confirmed state text |
| `--green-wash` | `#ecf7f0` | Confirmed state background |
| `--amber` | `#7b4200` | Sandbox/warning text |
| `--amber-wash` | `#fff7e5` | Recovery state background |
| `--red` | `#a32128` | Error text |
| `--radius` | `10px` | Panel corner radius |
| `--font` | `Inter,Arial,sans-serif` | English font stack |
| `--ease-out` | `cubic-bezier(.23,1,.32,1)` | Direct action/modal easing |

Additional source browser/elevation colours: selection background `#dbe6ff`; interval shadow `#0f172a14`; illustrative workspace shadow `#0f172a0a`; modal backdrop `#0f172a66`; primary action label `#ffffff`. Name these scoped tokens when transcribing; no new colour outside this list is authorized. The abstract account illustration is optional only if all required form content remains; it must carry no invented operational numbers.

Light only for these screens. Existing unrelated app theme behavior is unchanged.

## Typography

English: Inter, Arial, sans-serif using the existing bundled variable font, weights 400/500/550/600/650. Urdu: bundled Noto Sans Arabic 400/600 with Inter, Arial, sans-serif fallback, document dir=rtl. No display/mono family is introduced. Numeric price/date/card/usage fragments use bdi dir=ltr and tabular numerals; translate surrounding units.

| Role | Source size and line treatment |
| --- | --- |
| Page title | 32px/1.25 desktop; 30px at intermediate desktop; 28px <=760; 26px/1.35 <=580; account 30/28/27, confirmation/recovery 30/26 |
| Plan title | 20px desktop, 18 at <=1200/760, 17 at <=580, 16 at <=350 |
| Plan price | 38px/1 desktop, 34 at <=1200, 28/27/25 compact thresholds; weight600, tracking -.04em |
| Order total | 28px/1.2; provider illustration price36 desktop/28 phone |
| Section heading | 18px/1.4 default, settings16, payment23/21/20, compact captions13–15 |
| Body/form | 15px/1.55 default, 14px long explanation/form fields, phone form inputs16px to avoid focus zoom |
| Supporting label | 12–13px, 1.6–1.8 where multi-line; sandbox/price duration >=12px including narrow Urdu |
| Progress dot | 12/11/10px with 28/24/21/19px circles; dot is decoration supported by accessible step label |

Heading tracking -.035em, price floor -.04em; Urdu heading tracking0. Do not turn compact preview-only metadata into 10px product instructions. Body copy is bounded to approximately65ch.

## Spacing, radii, elevation

Use the actual source spacing values: 0/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20/21/22/24/25/26/28/30/32/34/36/40/44/48/52/56/64/72px, only for the roles present in the source. Main paddings are 48/32/24/20/16; plan panels22×20 desktop, compact17/15px; source layout gaps16/12 for cards and52/32/28 for payment. This is a transcription, not permission to scatter one-off values: promote the source values actually consumed into scoped named tokens once in spec47.

Corners: primary controls7px; fields7px; plan/summary/settings panels10px; provider modal12px; small surfaces6/8px; status circles50%. Rule widths1px, selected outline1px outside the border, focus2px with4px offset. Source shadows are limited to interval selection `0 1px 3px` and decorative abstract workspace `0 12px 30px`; primary plan selection uses a clear outline, not a glow.

## Layout conventions

| Width | Approved behavior |
| --- | --- |
| Default desktop | Setup rail240px, sticky100dvh; main max1100, topbar min88; main pad44/48, plans top36; three equal plan columns |
| >=1600 | Rail260, roomier panel padding28 |
| <=1200 | Rail210, main/topbar pad32; compact plan labels |
| <=1000 | Rail becomes top row; progress horizontal; topbar min72; no side support block |
| <=760 | Main pad24; plan panels stack into compact selectable rows with three capacity columns; normal document continuation |
| <=580 | Main pad20; 26px heading; full-width continuation; payment summary before handoff; settings rows stack |
| <=350 | Main pad16; still no horizontal page overflow; label floor remains12px |

Payment main max1050, approximately .92fr/1.08fr columns; summary26px padding, handoff max430. Confirmation/recovery max535px; support/contact panels do not exist. Billing max950 with account settings navigation, never an unfinished onboarding step. No fixed phone CTA that covers content. Wide content reflows within the feature; do not mask overflow defects with body overflow:hidden.

## Component conventions

Use the established Button/Input/brand/language primitives and lucide-react icons. Primary actions are blue with white labels, min48px high; secondary actions are white with a border. Plan selection is a native radio group with full plan, capacity units, price interval and owner-seat accessible names. Entire panel is selectable with visible keyboard outline; one purchase continuation follows the group. Month/year uses labeled pressed-state buttons, no fabricated discount.

Form fields have persistent labels, correct autocomplete, LTR email/password, inline errors with descriptions and no remount on language change. Pending submissions block duplicate actions and show a specific in-progress label. Loading has an explained static skeleton and disabled action; unavailable offers refresh only. Successful retry places focus on the selected radio and announces availability.

Provider-owned card/address UI is never reconstructed in app code. The app shows selected plan, real recurring price, interval, taxes/trial finalization and sandbox-only card guidance. Prototype mock card boxes/Preview successful checkout are excluded. Recurring price is not labelled as a confirmed amount due today. Ready requires server permission, and is distinct from checkout completion.

No Help/Contact buttons, footer links, dialogs, FAQ panels, mailto or unavailable support promises. Existing account-security links and self-service refresh/reopen/status actions remain. Existing Terms/Privacy links may render only when real configured destinations exist; omit unavailable links rather than ship # stubs. Sandbox is not blocked by live-only policy/support configuration.

## States and motion

| Element/state | Behavior |
| --- | --- |
| Default / hover | Quiet borders; primary hover uses --blue-hover; hover styling only on hover:hover and pointer:fine |
| Focus | Visible2px blue outline,4px offset; plan card outlines the focused radio |
| Selected | Checked circle, blue panel border and soft selected affordance; selection/price updates immediate |
| Active press | Transform .985 for140ms using --ease-out |
| Disabled / loading | Explained unavailability, real disabled control; no invented amount or perpetual animated spinner |
| Error / uncertain | Red error or amber recovery context; known launch failure can retry, uncertain submitted payment checks status first |
| Confirmed | Green completed steps and workspace action only after server access=true |
| Occasional native modal | Opacity/scale .97→1 in220ms; backdrop180ms; close immediate and returns focus |
| Reduced motion | No transform or modal animation; state and focus changes still immediate |

Source motion table: design/billing-onboarding/revision-2/v2/NOTES.md. Prices/capacities, progress text, keyboard selection and language changes remain still. No motion library is needed. Actual Paddle overlay structure/motion is provider-owned.

## Accessibility floor

Text contrast >=4.5:1, large text >=3:1; label floor12px, primary/toggle actions48px. Preserve semantic fields/radios/buttons, one h1, current-step/page semantics, keyboard order, error/status announcements, draft/focus on language change, modal Escape/return and reduced motion. Check320/390/768/1366/1440 CSS widths, EN/UR, expanded text and desktop200% zoom during browser acceptance. A width-reflow check alone is not proof of native zoom or a screen-reader audit.
