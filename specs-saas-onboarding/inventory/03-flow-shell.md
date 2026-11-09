# Spec 03 — Flow shell, tokens and motion

## Shared frame

`frontend/src/pages/Onboarding/FlowShell.tsx` exports the default `FlowShell`, `FlowShellProps` and `FlowStep`. Reuse this for the new public/account/checkout screens; leave the existing subscriber settings wrapper alone.

- `size`: `narrow` (default, 520px), `split` (980px), `plan` (880px), `wide` (1040px).
- `step`: `none` (default, no progress), `account`, `plan`, `payment`, `workspace`, `done`. Earlier steps are completed; a current item has `aria-current="step"`. `done` completes all four ticks with no current item. As in the approved prototype, the fourth/current sheet retains at most three prior sheet edges.
- `testMode`: false by default. Only an explicit true shows the tag. Callers must validate browser/server sandbox state; the shell makes no billing decisions.
- `children`: screen content, including the screen's own `h1`. The shell focuses that heading on entry and step changes, falling back to the main sheet while a heading is absent. Same-step rerenders and language changes retain focus and child identity. No child is keyed by language or step.
- `aside`: optional screen-owned worksheet content, rendered only for `size="split"`. The panel shows at 861px and wider; below that it hides and the progress row shows. The shell supplies no example operational rows or screen copy.

The header reuses `BrandLogo` and `LanguageChoice`, with local styles. The unique skip link targets the focusable main sheet. Language comes from the existing context and sets `dir`/`lang` locally. The fixed aurora table and decorative tick mirror correctly in Urdu. The logo asset is unchanged until spec 05.

## Scoped CSS vocabulary

`frontend/src/pages/Onboarding/flow.css` defines the closed design-system palette on `.flow-shell`. No global tokens or workspace rules change. Importing `FlowShell` loads it.

- Type: `.flow-lede`, `.flow-fine`, `.flow-section-title`, `.flow-price`; `.flow-ltr` isolates amounts and similar content in Urdu. Email/password inputs already stay LTR.
- Forms: `.flow-form`, `.flow-field`, `.flow-input`, `.flow-password`, `.flow-password-toggle`, `.flow-field-error`. Existing `Input` (`data-slot="input"`) receives the scoped field style automatically. Screens still supply visible labels, error associations and `aria-invalid`.
- Actions: use existing `Button` with `.flow-button`, optionally `.flow-button-secondary` or `.flow-button-full`. Form actions fill the form width. `aria-busy="true"` supplies a spinner; the caller supplies the action-specific busy label and disables repeated submissions.
- Notices: `.flow-notice`, with `-ok`, `-warn` or `-bad` suffix; screens supply `role="status"` or `role="alert"` and meaningful copy. Chips: `.flow-chip` and corresponding tone suffixes.
- Loading/state motion: `.flow-skeleton`, `.flow-spinner`, `.flow-frame-ready`, `.flow-price-enter`, `.flow-confirming-ring`, `.flow-ready-stamp` (SVG path must use `pathLength="1"`), `.flow-disclosure` on `details`.
- Selection: `.flow-interval` with two buttons and an aria-hidden `.flow-interval-thumb` as the first child; buttons expose `aria-pressed`. Thumb movement mirrors in Urdu. `.flow-plan-row` responds to a checked descendant radio. Screens own layout, labels and numbers.
- Split worksheet: `.flow-panel-headline`, `.flow-worksheet`; rows may reuse `.flow-step-box` with an SVG path using `pathLength="1"`, and `data-complete="true"` on the containing row. Completed worksheet paths draw once, 190ms apart after 420ms. No worksheet copy is created here.

CSS supplies all specified motion. Sheet/content entrances replay when the step changes without remounting children. Reduced motion removes movement and loops, hides confirming rings and permits only the specified 120ms notice/error/frame opacity fades. The language control, focus rings, background and compared numbers never animate. The interval uses a fixed half-width thumb and transform only, following the design system's allowed-property rule.

At 380px and below the sheet reaches the viewport edges. A wide sheet has 4px side padding, leaving 312px for the future card frame at a 320px viewport. Screens must retain that width when composing their contents.

## Verification seam

`frontend/src/pages/Onboarding/FlowShell.test.tsx` covers progress and ready/none states, edge continuity, all sizes, explicit Test mode, shared primitives and skip destinations, responsive/RTL hooks, heading focus and preserved child/input identity. JSDOM checks hooks, not layout. A temporary isolated Vite/Chromium preview under `/tmp/hygene-spec03-review/` checked actual widths, LTR/RTL, reduced motion and keyboard focus; no route or end-to-end test harness was added to the application.
