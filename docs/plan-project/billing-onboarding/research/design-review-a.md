# Assessment A — billing onboarding v3

Method: independent design-review agent `/root/billing_design_review`; no detector output read. The parent owns Assessment B, synthesis and approval. Reviewed 2026-11-06.

Target: `design/billing-onboarding/v3/`, served at `http://127.0.0.1:56789/v3/index.html`. Read the full applicable critique reference and brief. Inspected deployed-login reference, all six EN desktop and UR phone screens, EN phone/UR desktop plan comparison, open provider illustration and ready activation. Used a fresh Playwright browser/context/tab because native browser tooling was unavailable. External hosts were blocked. No account submitted, provider request made, or source edited.

## Verdict

The fixed blue/slate/Inter identity is respected. This feels like billing inside Hygene Ops: locations, staff and owner-inclusive manager seats drive selection, rather than generic marketing claims. The comparison rows, receipt, restrained status list and recognizable existing mark are coherent. Keep this direction. It needs targeted mobile ordering, RTL-number, recovery and state-copy corrections before accepting it as an implementation reference. No new imagery or marketing motion is needed.

## Heuristic scores

All ten apply to this Operate/form surface. These scores assess the illustrated interaction design, not a functioning billing integration.

| # | Heuristic | Score / 4 | Evidence |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Clear pending/confirmed distinction; unconditional saved-account footer weakens accuracy. |
| 2 | Match system / real world | 3 | Capacity language is concrete; Urdu usage fractions reverse meaning. |
| 3 | User control and freedom | 3 | Back/change plan and Escape dismiss work; help has no support exit. |
| 4 | Consistency and standards | 3 | Strong visual consistency; English billing unit and mixed status copy remain in Urdu. |
| 5 | Error prevention | 2 | Pending discourages duplicate payment; ambiguous recovery still prioritizes checkout retry. |
| 6 | Recognition rather than recall | 3 | Capacity repeated clearly; phone payment price appears after the action. |
| 7 | Flexibility and efficiency | 2 | Native plan radio arrows work; phone continuation requires unnecessary scrolling. |
| 8 | Aesthetic and minimalist design | 3 | Restrained hierarchy; duplicate summaries and shared features lengthen phone flow. |
| 9 | Error recovery | 3 | Useful retry/status choices and declined-card example; primary hierarchy is unsafe for uncertain payment. |
| 10 | Help and documentation | 2 | Good contextual explanations, but Get help loops into checkout recovery. |
| **Total** | | **27 / 40** | **Acceptable: focused corrections needed.** |

## Strengths

1. The deployed login's blue mark/primary action, slate canvas and white bordered surfaces carry naturally into billing. The form and comparison remain product UI.
2. Three mutually exclusive capacity choices, aligned desktop allowances and explicit owner inclusion support a real selection decision. No invented popularity or urgency competes with fit.
3. Activation separates submitted checkout from confirmed access and explicitly discourages another payment. Ready names the next task, adding the first location. Native dialog Escape restores focus to Open Paddle checkout; radio ArrowDown changes selection and preserves focus.

## Priority issues

### 1. [P1] Phone reading order separates the payment decision from its price

**What:** At 390px the plan continuation is below four shared features and a repeated full receipt: button top approximately 1519px. On the next screen, Open Paddle checkout is around 914px, before the receipt price at approximately 1133px and sandbox-card guidance around 1472px. A phone user can open checkout without encountering the price on that page; on plans they scroll through non-decision content to proceed.

**Why:** This adds working-memory demand at the precise moment users need certainty about plan, interval, amount and provider boundary.

**Fix:** Put a concise selected-plan/interval/amount summary and continuation immediately after the mobile comparison. Move the shared-feature list after continuation. On payment co-locate amount and essential sandbox-card instructions with the provider-opening action; use one summary rather than a second full capacity receipt. Preserve normal document flow and avoid an obscuring sticky bar.

**Sources:** `design/billing-onboarding/v3/app.js:20`, `:21`, `:23`; `design/billing-onboarding/v3/style.css:8` and `:9` (mobile stacking).

**Suggested commands:** `/impeccable adapt`, `/impeccable layout`.

### 2. [P1] Urdu usage fractions visually reverse used and allowed capacity

**What:** EN billing reads 2 / 5 locations, 8 / 25 staff and 1 / 3 manager seats. UR phone visibly renders 5 / 2, 25 / 8 and 3 / 1. Numeric pairs are plain spans inheriting RTL. The billing amount also retains the English `/ month` unit.

**Why:** This can imply the account is over capacity and contradict the accompanying progress meters. It is a meaning error, not cosmetic punctuation.

**Fix:** Isolate each numerical ratio with an explicit LTR direction or replace it with localized “2 of 5 used” wording whose numbers are isolated. Localize the billing period outside the money token. Check all count/limit, currency and date combinations in both directions.

**Source:** `design/billing-onboarding/v3/app.js:25`.

**Suggested commands:** `/impeccable harden`, `/impeccable clarify`.

### 3. [P1] Recovery privileges another checkout despite an uncertain prior outcome

**What:** The recovery screen says no new payment is confirmed and advises users who completed checkout to check status first. Its filled primary action is nevertheless Try opening checkout again; Check subscription status is secondary. Checkout-open failure and uncertain confirmation share this screen.

**Why:** A person who closed Paddle after submitting card details is nudged toward retrying checkout before resolving their existing subscription. The visual hierarchy works against the written duplicate-payment guardrail.

**Fix:** Show separate recovery variants: known checkout-open failure may prioritize opening checkout; possible submission/unknown confirmation must prioritize checking subscription status and suppress another checkout until status is resolved. Keep the account/plan reassurance in both variants. The static prototype can illustrate these states without network calls.

**Source:** `design/billing-onboarding/v3/app.js:26`.

**Suggested commands:** `/impeccable harden`, `/impeccable clarify`.

### 4. [P2] Global account-saved reassurance is shown before creation and after setup

**What:** The empty Create your workspace form already says “Your account is saved. You can return to finish setup.” The same unfinished-setup copy remains on ready and active billing screens.

**Why:** A first-timer can infer that entering data is already enough to save an account. Active subscribers are told setup is unfinished. These mismatched claims weaken trust in the otherwise precise state model. The prototype correctly declares no storage in its review framing, so this is a product-copy/state-design issue, not a request to add local storage.

**Fix:** Make footer reassurance state-specific: before account creation explain what submitting will do; incomplete saved account may state safe resumption; ready/billing use neutral account/billing help or omit setup reassurance. Do not promise persistence on the unsent form.

**Source:** `design/billing-onboarding/v3/app.js:18`.

**Suggested command:** `/impeccable clarify`.

### 5. [P2] Get help changes the problem to checkout recovery and never reaches help

**What:** Header/footer Get help and pending-state help all lead to `recovery.html`, asserting checkout could not open even when the actual problem is delayed confirmation. Recovery has another Get help in the header pointing to itself; its body offers only Account security.

**Why:** The frightened user at the confirmation valley cannot find a support path, and the page contradicts what just happened. A prototype may leave the final support integration unwired, but the designed destination should still model the right assistance state.

**Fix:** Give help a task-specific panel/section or a clearly labeled prototype support destination, preserve current billing status, and show the route for unresolved confirmation. Keep account-security help distinct. Do not invent a contact address.

**Sources:** `design/billing-onboarding/v3/app.js:18`, `:24`, `:26`.

**Suggested commands:** `/impeccable onboard`, `/impeccable clarify`.

## Cognitive load

**Moderate: 2 of 8 checklist items fail on the phone payment path.** Single focus, chunking, grouping, visual hierarchy, one thing at a time and minimal choices pass. Working memory fails because phone price/context is separated from the checkout action. Progressive disclosure fails because the common feature list delays plan continuation while already-known capacity is repeated on payment. The production task choices stay within the threshold: 3 plans, 2 intervals, 2 recovery actions. The six-link preview bar exceeds four but is explicitly reviewer navigation, not a proposed product decision; do not count it as production menu overload. No unrelated marketing content or additional choice architecture is needed.

## Emotional journey

Creation and selection are calm and practical. Paddle handoff gives specific reassurance about card ownership. Pending is the emotional valley: the difference between checkout completion and subscription confirmation is well explained, but the help destination currently changes the story to checkout failure. Recovery's hierarchy then adds uncertainty. Ready provides a useful finish with a clear Open workspace action and next setup task; its outdated unfinished-setup footer should disappear.

## Persona red flags

- **Jordan, first-timer:** Can choose the next step quickly, but reads account-saved copy before submission and could believe the empty/partial form has already created a saved account. Help from a pending subscription incorrectly describes checkout opening failure.
- **Casey, interrupted phone user:** At 390px the plan button follows the features and another full summary; on payment the amount and card instructions come after the action. They must scroll back and forth to verify the transaction context. Keep memory demands low without adding storage to this static preview.
- **Sam, keyboard/low-vision user:** Native plan radio ArrowDown and dialog Escape/focus restoration worked in this review; visible focus styling exists. Urdu ratio ambiguity remains even with perfect focus. Responsive reflow at a 640×450 CSS viewport showed no horizontal overflow on plans/payment, but this is only a 200%-zoom-equivalent layout check, not a full screen-reader or native browser zoom certification.

## Sample prices and provider illustration

The review bar explicitly calls amounts sample prices and no payment; the sandbox badge and provider illustration repeat that real money is not charged. The modal says hosted-checkout illustration and that no card entry/provider request occurs. That is sufficient to understand this is a static review, not functioning Paddle checkout. The dummy card values are non-input elements, correctly keeping card entry outside the app. Do not infer production amounts, discounts, trial eligibility or exact Paddle appearance from it. Localize the illustration's explanatory sentence for UR reviewers, and repeat a short “sample” qualifier beside modal amount if the screenshot is likely to circulate separately from the page/reviewer bar.

## Minor observations

- The top progress line calls pending activation “Ready” while the main heading correctly says confirming. “Activation” or “Confirming” would better describe the current step until confirmation; the ready state can then use Ready.
- Language/period buttons are 40px tall and the provider close button 44px, below the brief's 48px control requirement. Plan-row hit areas and primary buttons are generous. Treat compliance as a focused adaptation, not a visual redesign.
- Urdu support text renders cleanly and without page overflow in the reviewed widths, though some secondary labels are small. Review at real device zoom before implementation sign-off.
- Six defining screens do not model every billing lifecycle status. This assessment does not certify past-due/canceled/paused states or real saved resumption; those belong to the implementation plan.

## Questions for parent synthesis

The design direction is fixed. The useful prioritization is mobile decision order and recovery safety first, followed by RTL and state/help copy. No question about imagery, brand or marketing motion is warranted. User approval is handled by the parent; no user-facing questions were issued by this assessment agent.

## Evidence

Screenshots are under `design/billing-onboarding/evidence/review-a/`: all six `*-en-1440.png` and `*-ur-390.png` screens; opposite-locale plan views; provider and ready views; a viewport-only phone provider screenshot; and two UR 640px reflow views. Reference: `design/billing-onboarding/evidence/live-login.png`.

**Concrete verdict:** retain the aesthetic and component structure; make the five targeted corrections above before using v3 as the accepted implementation reference. No P0 was observed in this static prototype.
