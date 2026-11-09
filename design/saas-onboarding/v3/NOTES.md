# v3 notes (impeccable stage)

Copy of v2, critiqued and polished. Review was one design pass plus the deterministic detector and rendered checks.

## Changed from v2

- Replaced the staggered content entrance with one 200ms section fade. The product register rejects page-load choreography. The authored moments are the drawn tick, the sheets settling behind, and the Ready stamp.
- Skeletons were almost invisible, now use a dedicated skeleton colour and a visible loading label.
- Language button text raised from 4.2:1 to AA contrast.
- Stacked sheet edges now align with the sheet at every width and are hidden when the sheet goes edge to edge.
- Headings use a fixed scale (36px, 28px on phones) instead of fluid type.
- Added screens: forgot password, staff handoff.
- Added states: deactivated login, plan page with a checkout in progress, extra test cards, order totals loading.
- Shorter payment-conflict heading so it fits in Urdu.
- Themed selection and caret.

## Findings left standing

- Detector colour advisories for table, skeleton, placeholder and pad-rule colours: intentional, added as onboarding tokens in the design system.
- Detector font warning for the wordmark: Manrope is documented in `DESIGN.md`.
- Dark fake Pay button and field styling are the Paddle preview fixture only and are not rebuilt.
- Reviewer bar is prototype tooling only. `--review-h` becomes 0 in the application.
- Paddle's real frame height and look cannot be judged until tested against the sandbox.

## User revision, 2026-11-09

The blue table was rejected. All three stages now use a pale daylight table (`#eef2f8`) with the sheet defined by a line and a soft lift. The preview bar can compare other backgrounds.

New logo in `assets/hygene-ops-mark.svg`: the H's crossbar is a bold checkmark. Candidates that read as an "M" or "K" were rejected after testing at 16 to 96px.

Second logo round: chosen default is the checkbox with a tick breaking out of it and a teal tip. Water drop and woven H remain selectable in the preview bar until the user decides. The flat pale table was also rejected as too dry; v3 now uses layered colour with a tick supergraphic, and the login and signup card has a blue panel holding a white worksheet.

The blue login and signup panel was too dark. It is now a light pastel panel (mint sky by default, peach and lilac selectable) with the headline first, a slightly tilted two-sheet worksheet, and coloured status tags.
