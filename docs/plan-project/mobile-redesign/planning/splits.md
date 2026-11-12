# Feature to spec split, 2026-11-11

## How each feature was split

| Feature | Specs | Why split this way |
|---|---|---|
| Foundations | 01 harness, 02 tokens, 03 fonts, 04 Urdu, 05 formats, 06 task state, 07 route types, 08 photo states | Contracts first so screens fan out from wave 2; every one is independent |
| Shared parts | 14 text, 19 buttons, 20 status parts, 21 bars and toggles, 22 field, 23 sheets, 24 feedback, 25 task row, 26 receipt | One boundary each; screens never style buttons or text themselves |
| My day | 15 decision (pure), 16 attendance hook (logic moved), 29 top area, 30 work sheet, 31 attendance screens, 46 composition | The old 758-line screen mixed rules, side effects and layout; split by layer |
| Doing a task | 33 details, 34 QR scan, 35 photo list, 36 receipt, 45 capture | The photo screen's logic is untouched; only its layout changes, in one Heavy spec |
| Profile and settings | 09 profile read, 37 profile, 38 alerts, 39 help, 40 password | Help & account split into the screens the design draws |
| Sign in | 22 field, 27 access code form, 28 sign in | The access code form is shared with forced and voluntary password change |
| History (Part 2) | 11, 12, 13 services; 18 routes; 10 client contract; 17 queries; 41, 42, 43 views; 47 screen | Server and phone build in parallel against the contract in ARCHITECTURE.md |
| Profile figures (Part 2) | 13 service, 44 sections, 51 wiring | Profile left slots in Part 1 so Part 2 does not rewrite it |
| Navigation | 07 types early, 48 Part 1 wiring, 51 Part 2 wiring | Types first so screens compile; wiring last so no screen waits for the navigator |
| Close out | 49 cleanup, 50 Part 1 release check, 52 e2e, 53 verification | Part 1 is proven before Part 2 becomes visible |

## Splits considered and rejected

- **One spec per screen including its logic** (for example "My day" as one spec): rejected; My day would have been 300 lines of spec mixing attendance rules, permissions, uploads and layout, and it would have blocked check-in work behind design work.
- **Restyle `VerificationScreen` by extracting its logic into hooks first**: rejected; the photo flow carries the product's trust rules and has long lifecycle tests. Changing only the layout, with a diff check that function bodies are untouched, is safer.
- **Extend the Tailwind theme instead of a token module**: rejected in spec 00 (HSL variables, harder Urdu variants, no typed names).
- **History tab in Part 1 with attendance only** (the last 30 records exist today): rejected; a half tab would ship and then change shape in Part 2.
- **Change `staffTaskPresentation` so today's feed shows verified**: rejected; it would change what the Tasks tab shows and how the existing app decides actions. History gets its own endpoint.
- **Jest and React Native Testing Library**: rejected; the repo's working pattern is `node:test` with `react-test-renderer`, and a migration would touch every existing test.
