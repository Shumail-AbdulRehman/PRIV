# v3 — independent review and focused polish

Status: approved as amended by the user on 2026-11-06; Help/Contact UI removed. Copied from v2. v1/v2 and the original rejected design are preserved. This remains a static prototype, with no app or provider mutation.

## Direction retained

Reference-informed SaaS account → plan panels → editable order summary → Paddle handoff → confirmation. Blue/slate/white/Inter/Arabic and the existing mark remain the actual product identity. Plan capacities are grounded in the source; amounts/dates/usage are illustrative, not a proposed pricing change.

## Independent assessment

Assessment A inspected the six screens in EN/UR across desktop and phone, plus alternate states and keyboard behavior. It accepted the visual direction at 33/40 and identified two P2 defects. Assessment B ran one source detector and an isolated browser matrix, then verified radio names/focus, language draft preservation, native modal behavior and state recovery. Its source detector returned only the fixed-brand Inter warning; the runtime view also identified a decorative payment icon. B findings were withheld from the parent until A completed.

Reports and focused verdicts: `docs/plan-project/billing-onboarding/research/revision-2/`. Evidence is under this revision's evidence/ and the report's evidence/review-b/ subfolder.

## Focused correction batch

- Existing active billing receives account-settings navigation, with Plan & billing selected and reachable account security/help, instead of unfinished onboarding progress or getting-started copy.
- Successful plan retry transfers keyboard focus to the preserved selected radio and announces availability in the current language.
- Sandbox and recurring-price duration labels have a 12px minimum on compact screens, including Urdu at 320px.
- Removed the boxed decorative payment icon. The payment heading and task carry the hierarchy directly.

## Motion and limitations

Preserve the v2 motion table: 140ms action press; 220ms native-modal opacity/scale entrance; 180ms backdrop opacity; immediate close and reading/selection changes; no motion under reduced-motion. Native browser dialogs own focus management. No animation library is installed.

Inter is a deliberate fixed-brand exception to the overused-font detector rule. No second CLI detector ran after the polish batch. Prototype checkout fields are non-editable illustrations; actual card/address/tax/trial UX belongs to Paddle. Native zoom, physical-device use, real screen-reader use and deployed authentication/provider/webhook acceptance remain implementation-time validation, not claims of this prototype review.

Only an approved design can feed the feature design-system steering document and executable specifications. The user authorized proceeding to implementation planning after these removals.

## Approved scope amendment

Removed all help/contact entry points, support-dependent wording, FAQ panels and the help modal from the current v3. Self-service account security, status refresh and checkout recovery remain. This change is authorized by the user's instruction to remove those elements and then write the implementation plan. No further design approval is inferred or required for that already-authorized amendment.
