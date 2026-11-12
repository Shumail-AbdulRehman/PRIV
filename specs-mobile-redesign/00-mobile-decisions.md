# Spec 00 — Decisions

**Status:** Done
**Depends on:** —
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** —
**Reuses:** `design/mobile-redesign/v3/index.html`, `design/mobile-redesign/brief.md`, `docs/PRODUCT_UI_RULES.md`, `docs/plan-project/mobile-redesign/planning/intake.md`

## Goal

Record every decision for this redesign so no implementing session reopens it.

## Scope

| Topic | Decision | Rejected |
|---|---|---|
| Design source | `design/mobile-redesign/v3/` with its "Fixes after review", approved 2026-11-11. `staff-app-design.html` is the same design in one file | v1 and v2 (history only) |
| Scope | Staff Android app in `frontend-mobile/`, plus three read-only staff endpoints | Web workspace, manager screens, iOS-specific work, dark theme, tablets |
| Delivery order | Part 1 (specs 01 to 50): new look on data the server already sends, no server change, shippable alone. Part 2 (11 to 13, 17, 18, 41 to 44, 47, 51): History and profile figures | One big release |
| Styling | New parts use `StyleSheet` with `src/design/tokens.ts`; legacy NativeWind stays until unused | Extending the Tailwind theme (HSL variables, harder Urdu variants) |
| Fonts | Copy Inter Bold and ExtraBold (Inter 4.0, same as the bundled Regular) and Manrope Bold and ExtraBold TTF (SIL OFL, from `@expo-google-fonts/manrope@0.4.2`) into `assets/fonts/`. No font package dependency | Adding font packages; dropping Manrope |
| Strings | New Urdu in `staffAppTranslations.ts`; shared `urdu` object untouched (web parity test) | Editing the shared dictionary |
| Manager contact | Profile shows the manager's **name only**. The owner accepted "show the phone with a Call button", but `Manager` has no phone field; adding one needs a migration and a web form, which are out of scope. Revisit as a separate plan | Migration in this plan |
| Performance issues | Not shown to staff | Showing manager-recorded issues |
| History photos | Results only, no photos | Photo thumbnails |
| Check-out with open work | Allowed after a warning sheet ("Go back to my work" first) | Blocking check-out |
| Verified outcome for staff | Shown only in History through the new endpoint, with Submitted, Verified and Review closed separate. Today's feed keeps hiding it | Changing `staffTaskPresentation` |
| Photo row states | Design states plus "Uploaded, checking" for photos the server has but has not finished checking | Showing "Uploaded" for photos still being checked |
| Tabs | My day (`Shift`), Tasks, History (Part 2), Profile. Help moves inside Profile. Route names `Shift` and `Tasks` kept | Renaming routes (breaks notifications) |
| Photo window | Show "{time} left. After that, scan the task QR again." from the real countdown | Hiding the countdown |
| Tests | Unit: `node:test` through `tsx`, `react-test-renderer`, shared harness (spec 01). Backend: Vitest. E2E: Playwright against the web export with the API mocked (spec 52); Maestro device flows updated but run only on a device | Jest migration; e2e against a live backend |
| Lint | None added to `frontend-mobile` | Adding ESLint |
| Delivery rules | No issues or PRs unless asked, no commits or pushes without the owner, never push `main` | Automatic PRs |

Where the code differs from these words, the code wins and the session logs it.

## Explicit non-scope

- Implementation of any decision above → spec 01 onward.
- Enabling photo verification on the server (`privacyAssessment`), a product decision recorded in `docs/CURRENT_CONTEXT.md` → spec 53 records that it is still off.

## Steps

1. Read this table before any other spec. Changing a decision needs the owner's approval and a new decision spec.

## Done when

- [x] Every decision above is recorded and `design/mobile-redesign/README.md` marks v3 approved. [static]

## Log

- **2026-11-11** — Recorded during planning after the owner said to use the planner's recommendations. The manager phone recommendation could not be honoured as stated (no field); recorded above.
