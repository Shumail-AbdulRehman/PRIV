# Revised SaaS billing design

Status: approved as amended by the user on 2026-11-06; Help/Contact UI removed. This replaces the first rejected visual direction. Original v1–v3 remain available one level up as history.

Open [revised plan choice](v3/index.html), [account](v3/account.html) or [payment](v3/payment.html). To explore all states, expand **Design preview** at the bottom of each page. Switch English/Urdu at the top. Plan and interval selection carry into the next screen. On activation, the preview state control switches pending/ready; on recovery it switches known failure/uncertain payment.

The new design adapts the public Linear/Notion plan and account patterns plus their documented billing flow. It keeps Hygene Ops' actual blue/slate/Inter/logo identity and plan capacities. See [brief](brief.md), [direction contract](direction.md) and [sourced reference research](../../../docs/plan-project/billing-onboarding/research/revision-2/saas-patterns.md).

The final design lives in v3; v1 records composition and v2 adds restrained motion. No application code or deployment has changed. No accounts or provider requests occur. All amounts, usage and dates are illustrative; real app implementation must fetch provider prices, trial and totals. Non-editable checkout visuals illustrate Paddle's boundary and do not replace its card fields.

The local server serves the whole billing-onboarding folder. Revised preview path: `/revision-2/v3/`.

## Final review evidence

[Amended desktop plan](evidence/no-help/index-1440-en.png), [amended Urdu phone plan](evidence/no-help/index-320-ur.png), [amended desktop payment](evidence/no-help/payment-1440-en.png), [amended Urdu phone payment](evidence/no-help/payment-320-ur.png). Both independent reviewers marked their original focused findings resolved. Those reviews precede the user-authorized no-Help/Contact amendment and do not certify deployed billing acceptance.

## Approved scope amendment

Removed all help/contact entry points, support-dependent wording, FAQ panels and the help modal from the current v3. Self-service account security, status refresh and checkout recovery remain. This change is authorized by the user's instruction to remove those elements and then write the implementation plan. No further design approval is inferred or required for that already-authorized amendment.
