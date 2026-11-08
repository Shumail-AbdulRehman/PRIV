# SaaS reference research — 2026-11-06

User rejected the first design and explicitly requested looking at other SaaS products and adapting their flows and designs while matching the existing project. This supersedes the first prototype's capacity-led ledger direction. Brand, actual plan capacities, sandbox-only scope and server-confirmed access remain fixed.

## Method and evidence

Read official primary help/developer sources; inspected public pricing/signup pages in an isolated browser at 1440×1000. No third-party account creation, authenticated billing access or payment occurred. Captures and observations: `design/billing-onboarding/revision-2/references/`. Descriptions below distinguish visible public layouts from documented authenticated flows.

| Reference | Evidence observed | Adaptation to Hygene Ops |
| --- | --- | --- |
| [Linear pricing](https://linear.app/pricing) | Public capture: aligned plan columns, concise plan copy, substantial separation between price and capacities, aligned actions | Use three legible plan panels and align prices/capacities. Retain our light surfaces and blue, rather than Linear's dark palette |
| [Linear signup](https://linear.app/signup) | Public screen: tightly focused account creation with little surrounding navigation | Keep account form narrow with a single next action. Do not copy its Google/SSO options because they are not established product capabilities |
| [Linear billing docs](https://linear.app/docs/billing-and-plans) | Documented billing settings group plan information, payment changes and invoices; monthly/yearly options are explicit | Separate onboarding from existing-subscriber billing; make billing interval obvious. Do not copy Linear's per-user pricing model |
| [Notion pricing](https://www.notion.com/pricing) | Public capture: plan-specific actions, short intended-audience copy, monthly/yearly control, scannable allowance lists | Put three existing capacities inside each plan, selected state in blue, one explicit continuation. Avoid claims of popularity, invented savings, or Free/Contact sales plans |
| [Notion upgrade flow](https://www.notion.com/help/upgrade-or-downgrade-your-plan) | Documented sequence: choose plan, inspect order summary, confirm; workspace-level scope | Show an editable selection and clear renewal basis before launching payment. No reuse of Notion-specific trials, refunds, integrations or claims |
| [Paddle overlay](https://developer.paddle.com/build/checkout/build-overlay-checkout/) | Provider documentation and checkout illustrations distinguish page context from provider-owned card entry | Build a branded app summary with a clear Paddle handoff. The preview modal is labelled an illustration; the application must use actual Paddle-rendered fields |

## New composition

A calm setup rail anchors completed/current steps; the main surface focuses on the current task. Plan choice uses three equal panels, a compact blue selected state and a bottom continuation row. Payment uses a quiet price/renewal summary beside a large provider handoff surface. Confirmation is a focused status surface with no second-purchase action. Existing billing uses a normal settings composition.

This is a layout/interaction adaptation, not a copy of another company's logos, product claims, business terms or authenticated screenshots. Only Hygene Ops' existing mark/fonts/blue palette ship in the prototype. Sample prices remain explicitly illustrative. Actual provider pricing, trial and taxes will replace them during implementation.

## Constraints and tradeoffs

Three plan panels are deliberately chosen because the user requested familiar SaaS patterns after rejecting the table. Mobile panels become compact horizontal choices with native radios; detailed allowances remain available without horizontal scrolling. The setup rail collapses into a short step row. The continue control stays in document flow so it cannot cover content at zoom or in Urdu. Payment recovery, saved account and server-confirmed access remain more important than decorative motion.
