# Intake (2026-11-09)

Questions asked in one batch, answers verbatim from the selection.

1. Visual direction for signup, login, plan and checkout?
   **Blue brand, far better craft (Recommended).** Keep Hygene Ops blue, Inter and the logo so these screens match the dashboard after login, but redesign layout, hierarchy and motion from scratch.
2. How should activation be confirmed after payment?
   **Webhook plus server check (Recommended).** After checkout, our server also asks Paddle directly about that exact transaction and activates immediately. The browser is still never trusted. Works locally and when webhooks are late.
3. What should login do about the account-type dropdown?
   **Just email and password (Recommended).** Remove the dropdown. One new server endpoint checks owner/manager accounts first, then staff.
4. How should trials on the six sandbox prices be removed?
   **Script in the plan (Recommended).** Sol adds a script that first shows what would change, then, once the user approves, removes trials from those six sandbox prices using the sandbox key. The app also refuses any price that still has a trial.

## Delegated by the brief ("do what you think is best")

- Card entry: Paddle's official inline card form on our payment page, using Paddle sandbox test cards. No app-owned card fields.
- Flow order: account, plan, payment, confirmation, workspace.
- Free trial: removed from the flow.

## Planner decisions recorded here, surfaced to the user at hand-off

- This set supersedes the unexecuted `specs-billing-checkout-repair/` (only its decision spec was done).
- Plan change after a draft exists: allowed by cancelling the unpaid Paddle draft and creating a new one.
- Stuck reservations are repaired by provider-proven reconciliation rather than left as a permanent hold.
- Existing live-mode email verification rule stays unchanged; sandbox already skips it.
