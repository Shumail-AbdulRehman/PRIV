# v2 — animate

Gate: Operate; plan prices/allowances and progress reading remain still. Checkout opens occasionally and uses spatial consistency; button feedback confirms deliberate action. Prototype-only illustration uses native dialog for focus/Escape; real card UI remains Paddle's responsibility.

| Element | Trigger | Property | Duration | Easing | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Primary/secondary action | Pointer press | transform to .985 | 140ms | existing --ease-out, cubic-bezier(.23,1,.32,1) | No transform |
| Checkout illustration | Open | opacity, scale .97→1 | 220ms | --ease-out | Instant |
| Native dialog backdrop | Open | opacity | 180ms | --ease-out | Instant |
| Checkout illustration | Close/Escape | none | 0ms | none | Instant |
| Plan/interval choice | Change | no animated reading values | 0ms | none | Same |
| Activation confirmation | Server-state preview toggle | instant content/focus | 0ms | none | Same |
| Hover | Fine hover pointer | immediate background/color | 0ms | none | Same |

No library needed. No scroll trigger, looping progress, stagger or transition:all. Input/keyboard selection remains immediate. Native modal close is intentionally immediate to release focus promptly; no symmetric exit is imposed on the real provider. v1 preserved; changes limited to v2 CSS/notes.
