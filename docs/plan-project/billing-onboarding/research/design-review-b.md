# Assessment B — billing onboarding v3

Method: isolated detector/browser evidence agent `/root/billing_design_evidence`. Assessment A findings were neither requested nor read. Target: `design/billing-onboarding/v3`, served at `http://127.0.0.1:56789/v3/index.html`. Reviewed 6 November 2026. This is a static design prototype: no account creation, payment, provider call, production access, or application source changes occurred.

## Deterministic CLI evidence

Executed exactly once:

```sh
.ai/plan-project/companions/impeccable/scripts/impeccable detect --json design/billing-onboarding/v3 > docs/plan-project/billing-onboarding/research/detector.json
```

Exit status **2**, indicating findings. Complete unmodified JSON is in `detector.json` beside this report. **1 warning, 1 rule**:

| Rule | Count | Source | Snippet |
|---|---:|---|---|
| `overused-font` | 1 | `design/billing-onboarding/v3/style.css:1` | `font-family:Inter` |

The six HTML entry files contain almost no interface markup: `app.js` generates the interface at runtime. The static scan therefore does **not** certify rendered forms, accessible names, responsive layout, state changes, or text sizes. Runtime inspection materially expanded coverage.

## Runtime detector and overlays

No native browser automation tool was exposed, so Playwright was loaded using `createRequire(frontend/package.json)`. Both browser scripts created fresh isolated Chromium contexts. Mutation preflight successfully changed the document title and appended an executing script. A dedicated impeccable live server ran in the background on **8400**, PID **116912**. Detector injection succeeded on four representative English desktop pages; after waiting 2.5 seconds, console output and serialized findings were captured.

| Page | Console count | `tiny-text` | `overused-font` | Selectors with tiny text |
|---|---:|---:|---:|---|
| Plans | 5 | 4 | 1 | `div.reviewbar > span`, `p.row-foot`, `p.receipt-note`, `div.card-note > span` |
| Account | 3 | 2 | 1 | `div.reviewbar > span`, `div.form-actions > p` |
| Payment | 6 | 5 | 1 | `div.reviewbar > span`, `p.row-foot`, `div.payment-summary > p.receipt-note`, `aside.receipt > p.receipt-note`, `div.card-note > span` |
| Activation | 2 | 1 | 1 | `div.reviewbar > span` |
| **Page instances** | **16** | **12** | **4** | Shared instances are not distinct underlying defects. |

Every tiny-text finding reported **11px body text**. CSS declarations are on `style.css:5`, generated content on `app.js:17–23`. The runtime font finding refers to `body` with Inter used for 100% of measured text. No runtime detector errors occurred.

False positives / interpretation: the font warning correctly identifies Inter, but font popularity alone is not evidence of a usability defect and does not warrant replacing an established application font. Four tiny-text instances belong to the developer preview strip, so exclude those from product priorities. The remaining eight page instances include meaningful payment disclosures, owner-seat clarification, and the sign-in link. Do not infer a WCAG text-size failure solely from an 11px size; this is a readability concern.

Overlays were actually rendered and saved as `overlay-index.png`, `overlay-account.png`, `overlay-payment.png`, and `overlay-activation.png`. The headless tabs were titled `[Human] …`, but **there is no persistent user-visible browser tab**. Browser contexts were closed. The dedicated live server was stopped successfully using:

```sh
.ai/plan-project/companions/impeccable/scripts/impeccable live-server stop --keep-inject
```

No project entry file received a detector script tag.

## Browser matrix

All six pages (`index`, `account`, `payment`, `activation`, `billing`, `recovery`) were captured in **English and Urdu at 320, 390, 768, and 1366 CSS pixels**, viewport height 900: **48 page/language/width combinations**. Additional dialog screenshots cover 320×667. Total screenshot evidence: **67 PNGs**, under `design/billing-onboarding/evidence/review-b/`.

- **Responsive layout:** 43/48 page variants had no document overflow. Five English 320px pages — every page with the setup stepper — had `scrollWidth=325` at viewport 320. The `Ready` step ends at x=325. Billing has no setup stepper and passes. Urdu and all other tested widths passed. See `account-en-320.png`, `index-en-320.png` and `style.css:5,9`.
- **Text contrast:** a separate computed-style check measured 602 visible text samples across the 12 desktop page/language combinations, compositing solid ancestor backgrounds. No sampled text pair fell below 4.5:1; the lowest was 5.56:1 (blue on pale-blue selection wash). White CTA text on blue was 6.17:1; muted text on white was 7.58:1; active green text was 6.80:1. These checks do not constitute a complete pixel-level accessibility audit and exclude unopened dialog/hover/disabled states.
- **Visible keyboard focus:** plan radio and billing interval controls retain focus through their rerenders and show a 2px blue outline. Native dialog open places focus on the labeled close button. Escape and keyboard close both return visible focus to `#open-checkout` in EN/UR. No background page control was reached in seven dialog Tab steps; one native Chromium cycle briefly reported `BODY`, then resumed the close button. This is not evidence that background controls become operable.
- **Radio keyboard behavior:** ArrowDown changes Pro to Enterprise in both languages, preserves focus, updates selection summary. ArrowUp wraps Starter to Enterprise. Desktop accessible names lack the capacity labels, detailed below.
- **Monthly/yearly:** Enter activates Yearly and changes all row prices plus summary; reversing to Monthly restores $29/$79/$199. Enterprise yearly selection propagates as `plan=ADVANCED&interval=year&lang=…` through payment, unavailable checkout recovery, and subscription status. Summary correctly shows $1,990/year and capacity 20/200/20 in both languages.
- **Dialog:** close button and Escape work in both languages. Dialog has no horizontal overflow at 320 or 390px. At 320×667 the dialog remains within its 600px height limit and scrolls internally (776px EN / 795px UR content height). Close button remains reachable.
- **Pending/ready:** pending excludes the workspace action. Refresh places a translated pending update in the polite live region. The explicit preview toggle switches to ready, focuses the heading, and exposes the workspace action; that action correctly reports its preview-only boundary. No backend confirmation was simulated or claimed.
- **Failed states:** the preview decline button reveals a translated `role=alert`. The preview checkout-unavailable link reaches the recovery page while preserving selected plan/interval/language. The confirmation link remains enabled after a simulated decline; treat this as an incomplete error-state illustration, not a live-payment defect. It allows reviewers to proceed despite an unchanged error and has no editable card input to demonstrate correction.
- **Account guardrails:** required fields block empty submission and focus Full name. Invalid email and a five-character password produce native browser validation; email receives focus. No valid account submission was made.
- **Disabled states:** no `:disabled` or `[aria-disabled=true]` controls exist in any of the 48 base variants. Pending uses conditional omission of workspace access instead. Therefore disabled appearance, disabled announcement, duplicate-submit blocking, and network-in-progress behavior cannot be evaluated from this prototype.

## Concrete issues supported by browser evidence

1. **[P1] Switching language clears entered account data and keyboard focus.** After entering a name/company and pressing Enter on Urdu, both values become empty and focus moves to `BODY`. The full `#app` replacement in `app.js:26` plus language binding in `app.js:27` recreates the form without preserving values or the selected language button. A bilingual owner can lose their work simply by choosing their reading language. Preserve field values and focus across translation changes. Evidence: `browser-results.json` → `language change account preservation`; `account-language-reset.png`.
2. **[P1] Desktop plan radios announce unlabeled capacity numbers.** At 1366px the accessible name is `Pro For teams across locations 5 25 3 $79 per month`, with no Locations, Staff, or Manager seats labels. `.plan-columns` is `aria-hidden`, and `.allowance small` is `display:none` until the mobile breakpoint (`app.js:20`, `style.css:5,9`). This prevents a screen reader user from reliably comparing what each number buys. Preserve those labels for assistive technology at desktop widths or give each radio a complete explicit accessible description. Evidence: both EN and UR plan-fieldset ARIA snapshots in `browser-results.json`.
3. **[P2] Important supporting copy is too small.** The runtime detector identifies 11px tax/final-total disclosures, card-handling reassurance, owner-seat explanation, and sign-in copy. At mobile widths some related metadata becomes 10px. Increase meaningful supporting copy to at least 12–14px and keep review-only strip findings outside product scope. Source: `style.css:5,9`; evidence: runtime detector records and `overlay-index.png` / `overlay-payment.png`.
4. **[P2] English setup stepper overflows 320px.** The final Ready step creates 5px of horizontal document scroll in five routes. Permit steps to shrink/wrap or reduce connector spacing at the narrow breakpoint. Source: `.steps` in `style.css:5,9`; evidence: matrix overflow objects and English 320px screenshots.

Additional state-model limitations to carry into implementation: changing a plan/interval updates only in-memory variables until navigation adds query parameters, so reloading the same plans URL resets to Pro/monthly despite the saved-selection language. This is a static prototype limitation, not proof of missing production persistence. The Urdu billing view leaves `/ month` or `/ year` and the sample billing date in English (`app.js:24`). English developer preview controls, skip-link text and several landmark labels remain under `lang=ur`; translate or mark their actual language in the final interface. The pending screen marks the overall “Ready” progress step current before readiness; decide whether that label should describe activation rather than completion.

## Scope, skips and evidence files

- No Assessment A materials, prior critique findings, production app source, network APIs or provider SDK were used.
- The request log contains only localhost GETs. No non-localhost request was observed. No real account/password/payment operation was performed.
- Native NVDA/VoiceOver speech output, actual hosted Paddle fields, external billing portal behavior, server errors, duplicate submissions, offline transport, subscription webhooks, long-running confirmation, real persistence, and disabled/loading actions are outside this static prototype’s available behavior.
- Pixel-level contrast in imagery/animations, 200% browser zoom, and a full touch-target audit were not performed. Solid-color text pairs, keyboard interactions, responsive matrix, and narrow dialog scrolling were checked directly.
- Raw reproducible scripts: `design/billing-onboarding/evidence/review-b/browser-review.cjs` and `followup-review.cjs`. Raw results: `browser-results.json` (matrix, interaction states, ARIA snapshots, runtime detector output, console and request log) and `followup-results.json` (contrast, malformed-form checks, short-viewport dialog metrics).
- Prototype and application source files were not edited. Only this report and evidence artifacts were written. Parent agent owns synthesis and design approval; this assessment does not ask the user questions.
