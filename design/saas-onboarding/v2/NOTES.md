# v2 notes (animate stage)

Copy of v1 plus `motion.css` and `motion.js`. Tools: CSS transitions and keyframes only, no animation library.

Gate: this flow is seen once or rarely, so it sits in the first-time tier. Frequently repeated controls still get near-instant colour feedback only.

| Element | Trigger | Properties | Duration | Easing | Purpose | Reduced motion |
|---|---|---|---|---|---|---|
| Step tick | Step completes | `stroke-dashoffset`, box background | 260ms after 60ms delay | ease-out curve | State indication | Instant |
| Finished sheet edges | Step advances | `opacity`, `transform` | 240ms | ease-out curve | Spatial consistency | Instant |
| Sheet | Screen change | `opacity`, `transform` (10px, scale .992) | 240ms | ease-out curve | Prevent jarring change | Instant |
| Screen content | Screen change | `opacity`, `translateY(8px)` | 240ms, 45ms stagger, first 7 items | ease-out curve | Reading order | Instant |
| Primary button | Press | `transform: scale(.98)` | 120ms | ease-out curve | Feedback | Instant |
| Button, field, tab | Hover, focus | Colour | 160ms | ease | Feedback, hover gated | Instant |
| Busy button | Submit | Spinner `rotate` | 700ms loop | linear | State indication | Static spinner, label still changes |
| Interval thumb | Toggle | `transform`, `width` | 200ms | in-out curve | Spatial consistency | Instant |
| Plan row | Select | Background, inset ring, tick border | 120 to 160ms | ease | State, numbers never move | Instant |
| Price text | Plan or interval change | `opacity` from .25 | 160ms | ease-out curve | Prevent jarring change | Instant |
| Notice, field error | Appears | `opacity`, `translateY(-4px)` | 200ms | ease-out curve | State, no shaking | Opacity 120ms |
| Sign-in pad ticks | Page load, once | Tick draw | 190ms apart after 420ms | ease-out curve | Explanation | Static, already ticked |
| Card form skeleton | Loading | `opacity` | 1100ms alternate | ease-in-out | State indication | Static |
| Paddle frame | `checkout.loaded` | Container `opacity` only | 240ms | ease-out curve | Prevent jarring change | Opacity 120ms |
| Confirm current row | Waiting | Ring `opacity`, `transform` | 1200ms loop | ease-out curve | State indication | No ring |
| Ready stamp | Success | Container fade and scale .9, then tick draw | 280ms, draw 420ms | ease-out curve | Delight, first-time only | Instant |
| Disclosure content | Open | `opacity` | 160ms | ease-out curve | Prevent jarring change | Instant |

Deliberately not animated: language switch, field focus ring, the Paddle form's contents, the table background, and any motion on numbers the user is comparing.

Curves: ease-out `cubic-bezier(.23,1,.32,1)`, in-out `cubic-bezier(.77,0,.175,1)`.
