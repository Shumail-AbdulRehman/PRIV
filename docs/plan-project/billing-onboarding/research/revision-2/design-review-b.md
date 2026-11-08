# Assessment B — detector and browser evidence

Method: isolated Assessment B agent `/root/billing_revision2_browser_review`. Assessment A output was not read. This verdict was formed independently and saved before root synthesis.

Target: `design/billing-onboarding/revision-2/v3/`, served at `http://127.0.0.1:56789/revision-2/v3/`. This is a static design prototype. No prototype or application files were edited. The existing preview server was left running.

## Scope and evidence

A fresh Playwright Chromium browser/context was created using `createRequire` from `frontend/package.json`; no native browser tool was exposed. The 48-case matrix covers account, plans (`index`), payment, activation, billing and recovery, each in EN and UR at 320, 390, 768 and 1366 CSS px. Heights were 844, 844, 1024 and 900 px respectively. Four additional UR/320 cases cover loading, unavailable, ready and uncertain. EN/UR state interactions were also exercised at desktop width.

Evidence is in `evidence/review-b/` beside this report:

- `browser-results.json`: per-case document/element overflow, text sizes, primary-action bounds, 46 raw interaction checks, requests, console and page errors.
- `supplemental-results.json`: detailed modal Tab sequences, actual radio focus styles, overlay injection results and console output.
- `browser-review.cjs` and `supplemental-review.cjs`: reproducible inspection scripts.
- Twelve representative full-page screenshots: all six screens at EN/1366 and UR/390. Four UR/320 state screenshots, checkout decline and radio-focus screenshots, plus three injected overlay screenshots.

## Deterministic detector

The required CLI command ran exactly once:

```text
.ai/plan-project/companions/impeccable/scripts/impeccable detect --json design/billing-onboarding/revision-2/v3
```

Exit code 2 denotes findings. Full JSON is saved at `detector.json` beside this report.

| Rule | Count | Location | Assessment |
|---|---:|---|---|
| `overused-font` | 1 | `design/billing-onboarding/revision-2/v3/style.css:1` | Intentional product consistency, not a recommended change: the user explicitly requested the existing Inter/blue/slate identity. |

No other source findings were returned.

## Browser overlay

Mutable injection preflight succeeded: the script element was appended, its inline body executed and the title changed. A review-only Impeccable live server was started on port 58403, and `detect.js` successfully loaded and auto-ran on account, plans and payment in a private headless `[Human]` context. The review server was stopped with `live-server stop --keep-inject`; the existing port 56789 preview was not stopped. No HTML injection was written to source.

Console findings were account: 1 (`overused-font`), plans: 1 (`overused-font`), payment: 2 (`overused-font`, `icon-tile-stack`). The payment finding identifies the 46×46 `.payment-symbol` card icon above “Add your payment method” in `app.js`'s payment branch. This is a minor optional simplification, not an accessibility failure or a reason to depart from the requested familiar SaaS layout. The source detector JSON remains the canonical deterministic scan; these are additional per-view browser findings, not extra CLI runs.

Overlay DOM nodes and rendered screenshots were recorded. These tabs were isolated headless inspection tabs and were closed; no persistent user-visible browser overlay is claimed.

## Verified behavior

- **Overflow:** zero document-width or visible-element overflow in all 52 measured cases, including RTL and 320 px. No page errors occurred.
- **Requests:** all prototype requests used the existing localhost preview origin. Zero external requests; no Paddle, account, payment, portal or workspace action was sent externally. Overlay loading used only the separately started local review server.
- **Typography:** normal supporting body text measured 12–15 px; most phone plan capacity labels measured 12 px. The mobile sandbox badge measures 11 px, and the 320 px plan price duration is 11 px (see P2 below). Local Inter and Arabic fonts loaded successfully.
- **Plan semantics:** three native `input[type=radio]` controls share `name=plan`, sit in a labeled fieldset and expose plan/capacity/price accessible names plus the owner-note description. ArrowRight changes selection and focused radio; ArrowLeft reverses it; Space selects. RTL arrow behavior mirrors logically. Actual keyboard focus paints a 2 px solid card outline in EN and UR. Changing interval retains focus on its button, selected plan and downstream plan/interval/language URL values.
- **Language:** switching EN→UR→EN preserves name, company, email and password in the account form; focus stays on the selected language button. UR correctly sets `lang=ur` and `dir=rtl`. Native field labels and autocomplete are present.
- **Help:** native modal opens with focus inside; Escape dismisses it and restores the opener. Form values remain. The Tab audit did not reach any background interactive element.
- **Checkout:** native modal opens with focus inside; Escape closes and restores the checkout button; reopening retains the Enterprise/year selection. The declined-card scenario exposes its alert. No actual editable provider fields or provider calls are represented; the modal explicitly labels itself a checkout illustration.
- **Loading:** busy status and disabled continuation appear; unavailable offers an alert, retry and help. Retry restores available plans while retaining Starter/year.
- **Pending:** no workspace or new-payment CTA appears. Refresh announces that confirmation is pending and the screen warns against entering a card again.
- **Ready:** workspace CTA replaces refresh. Its action explicitly produces a design-preview notice, as expected for this static scope.
- **Recovery:** ordinary recovery retains plan and interval and offers both retry and status. Uncertain recovery's primary action goes to subscription status, with no new-checkout CTA.

### Interpreting the two raw modal-check failures

The first script's strict “every Tab leaves `document.activeElement` inside the dialog” assertions failed twice. Detailed follow-up found the native Chromium focus cycle briefly assigns `BODY` at its browser/document boundary: 4 of 16 recorded steps for help and 3 of 16 for checkout. Both dialogs remained `:modal`; **zero background interactive controls were focused**. Escape/restore passed. These raw failures are overstrict automation assertions, not evidence of an actionable focus-trap defect. The supplemental sequences preserve this distinction rather than silently rewriting the raw checks.

## Independent B priorities

**[P2] Keep compact supporting copy at least 12 px.** The `.sandbox` label remains 11 px on all six screens at 320/390, and `.plan-price > span` drops to 11 px at ≤350 px. The latter carries recurring billing duration and is more consequential than decorative metadata. UR script at this size is especially small. Retain 12 px minimum for these two selectors and let them wrap; the current matrix has room and no horizontal overflow. This is a polish/legibility issue, not a task blocker.

**[P3] Optional payment-icon simplification.** The live detector flags the boxed card icon above the payment heading. Removing its square outline or using an inline heading icon would reduce generic decorative structure. Keep the established layout and identity; there is no need for a large redesign.

No P0/P1 browser blocker was found in this static target. This assessment does not classify conventional plan cards, familiar onboarding rails or required Inter as defects.

## Observations and limits

The primary plan CTA is visible at y=803–851 in the EN/1366×900 viewport. On phones, the plan CTA follows all plan choices (EN y=996–1044 at 390; 1021–1069 at 320), and payment follows its order summary (EN y=1069–1117 at 390; 1093–1141 at 320). This requires ordinary vertical scrolling; it is not clipping or an overflow defect. A sticky mobile continuation could be considered later only if user testing shows difficulty.

This is prototype verification, not integration validation. Account creation, real Paddle readiness, webhooks, persistence across refresh, sign-in, support, workspace entry and portal authorization were not implemented or verified by these static pages. Native radio/dialog browser behavior and exposed accessibility semantics were checked; this was not a screen-reader session or an exhaustive WCAG audit. Representative screenshots were visually inspected; the complete 48-case baseline matrix was measured programmatically.
