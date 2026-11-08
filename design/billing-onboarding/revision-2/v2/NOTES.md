# v2 — purposeful motion

Operate mode: prices, capacities, plan selection, language changes, keyboard radios and confirmation text stay still. Occasional provider/help modals earn short entrance feedback; closure is immediate to release focus. No animation library or scroll effects.

| Element | Trigger | Purpose | Properties | Duration/easing | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Primary action | Press | Feedback | transform .985 | 140ms, existing --ease-out | No transform |
| Native modal | Open | Spatial consistency | opacity and scale .97→1 | 220ms, existing --ease-out | Immediate |
| Native backdrop | Modal open | Spatial consistency | opacity | 180ms, existing --ease-out | Immediate |
| Modal | Close/Escape | Release focus | none | Immediate | Same |
| Plan/interval | Change | Legible data | none | Immediate | Same |
| Hover | Fine hover pointer | Affordance | immediate color/border | No motion | Same |

CSS follows animate's press/modal recipes and existing cubic-bezier(.23,1,.32,1). Native dialogs provide focus containment and Escape. v1 is preserved.
