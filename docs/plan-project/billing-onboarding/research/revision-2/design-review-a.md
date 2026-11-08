# Assessment A — revision 2 v3

Method: independent design review by `/root/billing_revision2_design_review`; fresh Playwright browser, no detector and no Assessment B output. Target: `design/billing-onboarding/revision-2/v3/`, served at `http://127.0.0.1:56789/revision-2/v3/`. Read the revision brief, direction contract and SaaS research before inspection. Review date: 2026-11-06.

**Verdict: accept the visual direction; resolve two P2 interaction/navigation details before calling the prototype final.** The familiar SaaS account → plan → payment → confirmation structure now feels coherent. Its personality comes from the existing blue, mark, Inter/Arabic typography and concrete location/staff/owner capacities. It deliberately uses category conventions for an operational task; that is appropriate to this brief, rather than evidence of an interchangeable marketing template.

## Heuristic scores

| Heuristic | Score / 4 | Evidence / limitation |
|---|---:|---|
| Visibility of system status | 3 | Clear loading, pending, ready and uncertain states; billing rail contradicts Active status |
| Match with real world | 3 | Workspace capacity and recurring price are explicit; three plan tiers are easy to compare |
| User control and freedom | 3 | Back/change, language preservation and modal Escape work; retry loses focus |
| Consistency and standards | 3 | Native radios/dialog and a consistent shell; existing billing retains onboarding navigation |
| Error prevention | 4 | Uncertain payment prioritizes status checking and omits a retry-payment action |
| Recognition rather than recall | 4 | Capacities, selection, interval and continuation summary remain visible together on desktop |
| Flexibility and efficiency | 3 | Keyboard selection and narrow-phone flow work; phone payment requires normal vertical scrolling |
| Aesthetic and minimalist design | 3 | Restrained hierarchy, aligned panels and appropriately quiet summary; some redundant support/footer copy |
| Error recovery | 4 | Known launch failure and uncertain submission have distinct actions and clear account reassurance |
| Help and documentation | 3 | Helpful contextual guidance and reachable help; actual support destinations are deliberately preview stubs |
| **Total** | **33 / 40** | **Strong direction with focused refinements** |

## What works

- Three equal plan panels align name, audience, price and allowances; the blue checked selection and single continuation row avoid competing purchase actions. Desktop primary action ends at y=851 in both languages at both 1366×900 and 1440×900.
- Payment separates the selected-plan summary from the provider handoff. Tax/trial uncertainty and recurring-price-versus-due-today are stated. Card details are a non-editable, clearly labelled illustration; the modal contains zero input fields.
- Confirmation gives a calm, legible progress account instead of prematurely granting access. Uncertain recovery explicitly tells users to check status before trying again. The final ready state ends with one obvious workspace action.

## Priority issues

### P2 — Active billing still presents an unfinished onboarding step

**Selector:** `.screen-billing` together with `.setup-steps li[aria-current="step"]`; source `app.js`, `setupRail()`.

On the existing billing screen, the subscription card says **Active**, while the rail highlights **Confirm subscription** as current and still offers “Need help getting started?”. On phones the blue fourth step is also retained. This implies the subscription still needs onboarding confirmation and undermines the intended distinction between setup and subscriber settings.

**Fix:** Give billing the incumbent settings/workspace navigation, or a compact account/billing rail without setup progress. Keep the onboarding rail on onboarding routes.

**Evidence:** `design/billing-onboarding/revision-2/evidence/review-a/billing-1440-en.png` and `billing-320-ur.png`. Suggested command: `/impeccable onboard`.

### P2 — Successful plan retry drops keyboard focus to the document body

**Selector:** `#retry-plans`; source `app.js`, retry binding and `render()` focus restoration.

Reproduction: load `index.html?state=unavailable`, focus “Try again”, press Enter. The available plans appear, but `document.activeElement` becomes BODY because the removed retry button is the only restoration target. A keyboard user receives no focus handoff into the recovered task and must traverse the shell again.

**Fix:** After recovery, place focus on the plan heading/fieldset or selected radio and announce that plans are available. Preserve the existing selection.

**Evidence:** `design/billing-onboarding/revision-2/evidence/review-a/retry-motion-checks.json`, `index-unavailable-320-en.png`. Suggested command: `/impeccable harden`.

## Cognitive load, emotional journey and personas

No decision point exceeds four visible options: three plans, two intervals, one continuation. The familiar order reduces recall; product capacities do the differentiation. The account form has four necessary fields and clearly says plan/payment follow. The emotional valley at payment is supported by summary, provider ownership and test guidance. Pending/uncertain copy prevents the anxious repeat-purchase action. The active-billing rail is the remaining status contradiction.

- First-time company owner: account → plan → summary is understandable; owner-seat inclusion is visible. The current fourth step on an already active subscription is the principal red flag.
- Urdu-speaking phone owner: RTL layout, English plan names, LTR money/card/date and readable headings survive 320px. No horizontal overflow or cut-off controls was found. Payment has natural vertical scrolling, with summary before the checkout action.
- Keyboard user: account draft survives language switching; native radio arrows preserve focus and update selection; modal Escape closes and returns to `#open-checkout`; retry recovery is the exception above.

## Minor observations

- Example-price status is explicit on plan choice and in the persistent prototype disclosure. Adding “Example” beside the payment recurring-price total would make a direct deep-link review clearer; it is not a pricing-model change.
- The Urdu preview modal retains English illustration/scenario instructions. These are prototype controls, not an implied shipping translation decision.
- The payment trust message appears in both the action region and product footer. This is harmless but slightly repetitive.

## Verification evidence and limits

Captured all six routes at 1440×900, 1366×900, 390×900 and 320×900 in EN/UR (48 baseline captures), then loading/unavailable/ready/uncertain states and checkout dialogs. Screenshots live under `design/billing-onboarding/revision-2/evidence/review-a/`.

`layout-metrics.json`: zero horizontal document overflow in the 48 combinations; every desktop main primary action fits in the first 900px. Small-phone pages scroll vertically in document flow with no fixed continuation covering content. `interaction-checks.json`: account values retained across EN→UR; valid account submission moves to plans; radio keyboard selection and focus preserved; selected Enterprise/yearly/lang persist to payment; modal has zero editable fields; Escape closes and returns focus. `retry-motion-checks.json`: reduced-motion dialog animation is `none`; retry focus defect reproduced. `modal-metrics.json`: dialog dimensions and internal scroll measurements.

This review evaluates the static design only. No real signup, payment, provider request or source-app change occurred. No detector was run and no Assessment B results were consulted. Existing preview server was left running as requested.

Questions for parent synthesis: should active billing reuse the current app settings rail directly, and should example pricing be labelled beside every deep-link summary? No user question is required from this isolated assessment.
