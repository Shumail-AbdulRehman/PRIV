# Design brief: Hygene Ops account, plan and checkout flow

## Product and the one job

Hygene Ops is an operations system for cleaning companies in Pakistan. A company owner arrives wanting to run their team from one place. This flow must make one thing easy: **go from "I want this" to an active subscription and an open workspace, without confusion or doubt about being charged.**

The flow is: create account, choose plan, enter card, confirm, open workspace. No free trial.

## Screens to design

All live in one continuous prototype so the journey can be clicked end to end.

| Screen | Purpose |
|---|---|
| Sign in | Returning owners and managers. Email and password only |
| Create account | Name, company, email, password |
| Choose plan | Three plans, monthly or yearly, concrete allowances |
| Payment | Paddle's inline card form beside a live order summary, with sandbox test card help |
| Confirming | Real progress while the server confirms the subscription |
| Ready | Subscription confirmed, explicit entry into the workspace |
| Recovery | Every failure with its reason and one next action |

Payment also needs these states: form loading, form loaded, card declined, form failed to load, processing, offline, saved checkout resumed.

## Stack constraints

React 19, Vite, Tailwind 4, Radix primitives, existing Button and Input. No GSAP and no new animation library: CSS and the Web Animations API only. Prototypes are rebuilt as components. The Paddle form is a cross-origin iframe, so it cannot be styled or animated from inside. It must be at least 312px wide, about 450px tall initially, with its footer fully visible.

## Brand input: fixed, overrides any stage's preferences

User-supplied, from `DESIGN.md`. Blue brand, far better craft.

- Working Blue `#2556d8`, Pressed Blue `#1d42b1`, Selection Wash `#eef3ff`.
- Canvas `#f8fafc`, Sheet White `#ffffff`, Strong Ink `#0f172a`, Quiet Slate `#475569`, Rule Line `#dce4ee`.
- Status pairs: green `#16613d` on `#ecf7f0`, amber `#7b4200` on `#fff7e5`, red `#a32128` on `#fff0ef`.
- Inter Variable for all text. Manrope only in the wordmark. Noto Sans Arabic for Urdu at 1.85 line height.
- Logo: `/brand/hygene-ops-mark.svg` and the "Hygene Ops" wordmark.
- Creative North Star: "The Daily Worksheet". Reads like a clear sheet you work down each day.
- Light only. Flat surfaces with one-pixel lines. Blue means act here or selected.

These override gpt-taste's font bans and marketing-page structure. English and Urdu with full right-to-left layout are required.

## Anti-goals

From `PRODUCT.md`: decorative billing pages, generic marketing-style pricing cards inside authenticated workflows, excessive animation, vague feature names, prompts that hide exact limits.

Also: no identical three-card pricing grid, no gradient text, no glass, no side-stripe borders, no invented discounts, "most popular" labels, customer logos, testimonials or metrics, no free-trial wording, no fake app-owned Pay button beside Paddle's, no spinner with no explanation.

## Must feel

Calm, exact and trustworthy, with one memorable idea: progress is a worksheet that gets ticked off. A first-time owner should know where they are, what happens next, and that they won't be charged twice.
