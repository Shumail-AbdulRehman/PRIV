# Assessment A — focused v3 verdict

Reviewed 2026-11-06 by `/root/billing_design_review`. Scope is only the five original Assessment A issues plus pending-step label and the specifically flagged touch targets. No detector was run or read. No prototype/application file was changed.

**Verdict: all five original priority issues and both requested minor corrections are resolved for this static implementation reference. Accept the revised direction. No remaining A blocker.**

Used a fresh Playwright browser/context/tab against `http://127.0.0.1:56789/v3/`. Inspected EN/UR 390×844 screenshots, live content/order/geometry and relevant source. External hosts were blocked; no account was submitted and no provider call occurred. Screenshots are in `design/billing-onboarding/evidence/v3-review-a/`.

| Original item | Status | Verification |
|---|---|---|
| Mobile price/CTA order | Resolved | Plans now shows a concise selected-price receipt and Continue immediately after comparison/owner-seat note, before shared features. EN CTA top is about 1133px rather than 1519px despite the extra reviewer-state row. Payment shows price at ~746px and sandbox-card guidance at ~989px before checkout action at ~1156px. UR order is the same. Duplicate side receipt is hidden on phones. |
| Urdu usage isolation/period | Resolved | Billing visibly reads `2 / 5`, `8 / 25`, `1 / 3` in the correct order. Source uses `bdi dir="ltr"` inside RTL context. The period is now localized as `ماہانہ` rather than English month. |
| Known versus uncertain recovery | Resolved | Known checkout-open failure retains retry as primary. `recovery.html?state=uncertain` explicitly says payment may already be submitted and has only Check subscription status as the product primary action; it offers no retry checkout action. Provider's response-lost preview reaches that uncertain variant. |
| Truthful footers | Resolved | Unsent account: “Create your owner account, then choose your plan.” Ready: “Setup is complete. Your workspace is ready.” Active billing: “Your company account. Your billing settings.” Saved incomplete-account copy remains on incomplete setup states. EN and UR verified. |
| Contextual help | Resolved for prototype | Pending and recovery Help now open an in-context Account and billing help dialog, preserve route/status, recommend status check before another account/payment, and provide a return-to-current-step action. They no longer claim checkout failed or loop to recovery. The account-security/help destination is an explicitly previewed route rather than a functioning support integration, appropriate to this static scope. |
| Pending step label | Resolved | Current progress step is Confirming / تصدیق while pending and Ready / تیار only after ready. |
| Flagged touch targets | Resolved | Language and interval buttons measure 48px high. Provider close and help close measure 48×48px border boxes. Primary actions remain at least 48px high. |

Relevant source: `design/billing-onboarding/v3/app.js` (`footerCopy`, `shell`, payment, billing, recovery and help bindings); `design/billing-onboarding/v3/style.css` (v3 hierarchy/mobile/control overrides).

Evidence examples: `index-en-390.png`, `index-ur-390.png`, `payment-en-390.png`, `payment-ur-390.png`, `billing-ur-390.png`, `recovery-en-390.png`, `recovery-uncertain-en-390.png`, `recovery-uncertain-ur-390.png`, `account-en-390.png`, `activation-ready-en-390.png`, `help-activation-en-390.png`, `help-activation-ur-390.png`, `help-recovery-en-390.png`, `provider-en-390.png`.

Additional verification within scope: closing help with Escape restores focus to Get help in EN and UR. Back to your current step closes the modal without navigation. The existing blue/slate identity remains intact.

This is a focused correction verdict, so the original full ten-heuristic score is not recomputed from this narrower pass. It is not certification of live billing, saved accounts, provider layout, real support routing or complete accessibility. Those remain implementation responsibilities already outside the static-prototype scope.
