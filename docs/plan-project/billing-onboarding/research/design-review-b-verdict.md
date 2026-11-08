# Assessment B — focused v3 verdict

Reviewed the supplied v3 batch on 6 November 2026 in a fresh Playwright Chromium context. Scope is limited to the four original Assessment B findings and the newly supplied loading/unavailable illustrations. No detector rerun, source edits, provider requests, or account submission occurred.

**Verdict: three original findings resolved; supporting-copy readability partially resolved. No remaining P1 from the original B review.**

| Original B finding | Verdict | Direct evidence |
|---|---|---|
| Language change clears account values and focus | **Resolved** | At 320, 390, 768 and 1366px, typing all four fields then switching EN→UR→EN preserves every value. Each switch leaves keyboard focus on the selected language button with its visible 2px blue outline: 8/8 checks passed. |
| Desktop radio names omit capacity units | **Resolved** | At 320 and 1366px in both languages, all three radios expose explicit Locations, Staff and Manager-seat labels alongside price/interval. The owner-seat explanation is connected through `aria-describedby`. ArrowDown still selects Enterprise and Yearly updates its accessible name to $1,990 per year in EN/UR. |
| Important support/payment copy is too small | **Partially resolved — P2 remains** | Owner-seat explanation, final-total/taxes copy, card-handling reassurance, price intervals and plan descriptions now measure 12px or more. The original account sign-in copy remains **11px** in both languages at 320 and 1366px (`.form-actions p`, `style.css:5`). Mobile plan capacity labels are now 11px rather than 10px; the payment capacity labels remain 11px. These are the same supporting-copy concern, not a new critique category. |
| English 320px stepper causes horizontal scroll | **Resolved** | All six pages in EN/UR at 320px report `scrollWidth=320` and viewport 320: 12/12 checks passed. Stepper bounds stay within the page; pending activation’s new Confirming label also fits. |

The supporting-copy issue can be closed by raising `.form-actions p`, `.plan-row .allowance small` at the mobile breakpoint, and `.facts-line small` to at least 12px consistently. Existing changes otherwise address the original readability findings without changing the established font.

Brief state check: Loading exposes `role=status`, `aria-busy=true`, and a genuinely disabled Continue button. Unavailable exposes `role=alert`, translated recovery copy, Refresh plans and Get help. Refresh returns three plan radios in both languages. The loading button itself still reads “Continue to payment” under Urdu; this is a minor incomplete translation within the newly checked preview state. No browser page errors occurred.

Evidence is under `design/billing-onboarding/evidence/v3-review-b/`: `results.json` contains retained-value booleans (no typed passwords), focus/outline readings, ARIA snapshots, computed font sizes, stepper rectangles, state semantics and error results; `verdict.cjs` is the reproducible focused browser script. PNGs show the translated populated form, plans/payment at 320 and 1366px, narrow pending/recovery pages, and loading/unavailable states. Screenshots contain only synthetic review data. The browser context was closed after capture.

This verdict does not broaden the original assessment or claim production integration, network loading behavior, native screen-reader speech testing, or actual provider checkout validation.

## Final correction verification

Following the final focused correction, a fresh Chromium context checked only the remaining open items at **320px in EN/UR**. **All original Assessment B findings are now resolved.** `.form-actions p`, all nine `.plan-row .allowance small` labels, and all three `.payment-summary .facts-line small` labels compute to **12px** in each language. The loading action remains disabled and now reads “Continue to payment” in English and “ادائیگی کی طرف جائیں” in Urdu. This supersedes the partial-readability and untranslated-loading-button notes above.

Raw final readings are in `design/billing-onboarding/evidence/v3-review-b/final-corrections.json`; eight `final-*-320.png` screenshots show these exact corrections. No detector was rerun and no prototype source was edited during verification. Earlier resolved findings were not reopened or broadened.
