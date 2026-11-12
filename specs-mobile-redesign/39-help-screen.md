# Spec 39 — Help screen

**Status:** Done
**Depends on:** Spec 07, Spec 21
**Model:** Light — `claude-haiku-5-5` · `gpt-6-luna` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/HelpScreen.tsx`, `frontend-mobile/tests/screens/help.test.mjs`, `specs-mobile-redesign/inventory/39-help-screen.md`
**Reuses:** `frontend-mobile/src/design/TopBar.tsx`, `frontend-mobile/src/design/StaffText.tsx`, `frontend-mobile/tests/nativeComposition.test.mjs`, `design/mobile-redesign/v3/index.html`

## Goal

Help becomes a short, plain page of answers reached from Profile, matching the design (All screens > Profile > Help).

## Scope

Rewrite `HelpScreen.tsx` (export name unchanged; spec 48 registers it as the `HelpGuide` stack route):
- `TopBar` "Help".
- Four answers, each a bold question and a muted answer, separated by hairlines: "How to check in" / "Go to your location. Tap the yellow button. Take a selfie."; "How to finish a task" / "Scan the QR. Clean. Scan the same QR. Take every photo. Submit."; "The QR will not scan" / "Turn on the light and hold the phone steady. If it still fails, ask your manager."; "I forgot my password" / "Ask your manager for a one-use access code."
- Keep the existing permissions sentence: "Camera and location are required for attendance. Task photos also require current server authority. Turning on permissions does not renew expired authority." as a fifth answer titled "Permissions".
- A `blueWash` note: "Ask your manager about your shift, task QR or an access code." No call button (spec 00: no manager phone).
- The alert controls, account block, replace-password and sign-out move out (specs 37, 38, 40). The screen no longer imports `registerPhoneAlerts`, `LaunchRecovery` or `logout`.

## Explicit non-scope

- Profile and alerts → specs 37 and 38. Registering the route → spec 48.

## Reuse first

- `tests/nativeComposition.test.mjs` covers the old Help screen (alerts and account). Under the test-only exception, move those assertions' intent to the new homes: alerts behaviour is now proven by spec 38's test, sign-out by spec 37's. Keep any assertion that still applies to Help; log each removed assertion and where its behaviour is now tested.

## Steps

1. Rewrite the screen.
2. Write its test and update `nativeComposition.test.mjs` as described.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/help.test.mjs` passes: the four questions and the permissions answer render; the note renders; there is no sign-out, alerts or password control; Urdu translates the questions. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/nativeComposition.test.mjs` passes, and the Log lists every assertion moved and where it is now covered. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built: `HelpScreen.tsx` rewritten on `TopBar` (title "Help", Back calls `goBack`), `StaffText` roles and tokens; four answers, the Permissions answer and the blueWash note; no call button; no alerts, account, password or sign-out. Export name unchanged. `HelpScreen` still imports nothing from `LaunchRecovery`, `notifications/native` or `auth`. The StaffTabs Help tab still renders it until spec 48 wires `HelpGuide`.
- **2026-11-11** — Tests: `tests/screens/help.test.mjs` 6 tests pass (English content, one Back action only and no sign-out/alerts/password/call, Back goes back, Urdu strings with row-reverse and rtl, English row ltr, fonts-not-ready render). `tests/nativeComposition.test.mjs` 1 test passes. Mobile suite `npm test --prefix frontend-mobile`: 430 tests, 430 pass, 0 fail. Typecheck 0 errors. `npm run build:web` passes (no export was running).
- **2026-11-11** — Assertions removed from `tests/nativeComposition.test.mjs` (test-only exception, all were HelpScreen tests):
  1. "phone alerts remain unknown until checked and an in-flight registration cannot be duplicated" (alert copy, retry lock, `registerPhoneAlerts` call args) → spec 38, `TaskAlertsScreen`. Spec 38's test file (`tests/screens/taskAlerts.test.mjs`) did not exist when I checked; the lead must confirm it proves this.
  2. "failed alert registration has an actionable retry and never claims delivery" → spec 38, same as above.
  3. "account password handoff remains explicit and completion signs out without alert registration" (Replace password opens LaunchRecovery, completion calls logout) → spec 40, `ChangePasswordScreen`.
  4. "Urdu help keeps account identifiers LTR and uses the current language for registration" → the LTR email display moves to spec 37 (Profile account block); the Urdu registration call moves to spec 38.
  The remaining test ("loaded type follows language...") tests `components/ui/text.tsx` and is kept unchanged; its unused HelpScreen-only mocks (notifications, LaunchRecovery, Button, StaffBrand, ScreenHeader, auth) were removed with the tests.
- **2026-11-11** — Not verified: a 360 by 700 check. The Help screen has no route in the web export until spec 48 registers it, so it cannot be opened in a browser yet. Layout is only checked by unit render. Also not verified: a device, font scaling, a screen reader.
- **2026-11-11** — Missing Urdu for spec 49: the Permissions answer ("Camera and location are required for attendance. Task photos also require current server authority. Turning on permissions does not renew expired authority." and "Turning on permissions does not renew expired authority.") is not in `staffAppTranslations.ts`, so it shows in English in Urdu. The Urdu questions, answers and the note are present.
- **2026-11-11** — States: Help is static (no query, no data), so loading, empty, error and offline do not apply. The fonts-not-ready render is covered instead.

