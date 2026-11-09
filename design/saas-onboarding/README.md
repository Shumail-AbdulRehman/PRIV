# Account, plan and checkout design

**Approved by the user on 2026-11-09.** The source of truth is `v3/`. Open `v3/index.html` directly in a browser. The dark bar at the bottom jumps between screens and states. Prices are samples and the card form is a labelled preview of Paddle's real form.

## Approved choices

| Item | Choice |
|---|---|
| Background | Fresh aurora |
| Login and signup side panel | Mint sky |
| Logo | Checkbox with the tick breaking out (`assets/hygene-ops-mark.svg`) |

The other Background, Panel and Logo options in the preview bar were for comparison and are not part of the approved design.

## Stages

| Stage | What it did |
|---|---|
| `v1/` | The idea: one sheet of paper on a table, with progress ticked off |
| `v2/` | Motion: drawn ticks, finished sheets settling behind, button and state feedback |
| `v3/` | Polish, then the user's background, logo and side-panel revisions |

The background, logo and side-panel revisions were made on v3. `v1/` and `v2/` are history and do not carry the final background or panel.

Checks on v3: 240 combinations of screen, state, width (320, 390, 768, 1440) and language (English, Urdu), with no page overflow, undersized controls or script errors. These prove the prototype's layout, not the real Paddle form.

`design/` is read-only after approval. A design change during implementation updates `specs-saas-onboarding/DESIGN-SYSTEM.md` and is recorded in that spec's Log.
