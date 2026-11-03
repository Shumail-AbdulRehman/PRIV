# V5 native source composition continuation — 2026-10-29

Specification37 remains **In progress**. This work corrects actual React Native
source against approved design/v5/mobile, without claiming a native runtime,
camera/GPS/push result or physical-device visual acceptance. Baselineadae1b9
already contains accepted28/32; neither is repeated.

## Actual source changes

- My day now leads with date, working-day heading and actual site. The shift
  panel uses a compact heading/status row, retains actual time/attendance state,
  existing shift-detail disclosure and the same permitted attendance action.
  Current server authority, before-camera reconciliation and lost-response
  handling are unchanged.
- Tasks, Help and Start task reuse the existing StaffBrand/language header.
  Start task leads with the actual task and task-bound QR instruction. The88px
  decorative door icon/kicker is removed; scanner lifecycle, exact task-ID
  request, background/duplicate guards and photo access remain unchanged.
- Help groups real alert registration/retry, permissions and own-account
  recovery. An unchecked registration is unknown; success means registered,
  never delivered. A synchronous lock prevents duplicate alert registration,
  and thrown registration errors leave an explicit retry. Existing native
  settings and password replacement/sign-out remain real handlers.
- Cards use the approved10px panel radius. Local Inter regular/semibold and
  Noto Sans Arabic regular/bold assets load through Expo Font14.0.12, the same
  version previously nested under Expo; it is now a declared direct dependency.
  Bundled assets include upstream licensing/provenance. No new font-provider
  request is needed. Latin identifiers retain Inter inside Urdu; mixed web text
  has an explicit Inter/sans fallback. System scaling and RTL stay enabled.
  Failed/pending font loading never blocks access or recovery.

Changed code is limited to App, font assets/helper, existing Text/Card primitives,
four existing screens and native vocabulary. No backend, database, provider,
camera/QR/GPS authority, durable receipt or entitlement rule changed.

## Verification and limits

Whole native suite: **106tests,0failures/0skips**, including five new behavior
cases covering alert duplicate/error/retry, explicit password handoff/sign-out,
Urdu account identifiers and loaded/fallback font behavior. Existing attendance
lost-response and scanner background/duplicate/wrong-task tests still pass.
React test renderer prints its existing deprecation advisory; no test failure is
hidden. `npm run typecheck --prefix frontend-mobile` passes.

`npm run build:web --prefix frontend-mobile -- --output-dir <private parent>/native-web-export`
passes and bundles all four font files. The first font test fixture reused an
identical React element while changing an external mock; updating with a fresh
element corrected the fixture without weakening its language assertions.

Spec40 source preview uses the actual exported React Native Web app, synthetic
stored staff identity/HTTP fixtures and a local static server. It observes My day,
Tasks, Start and Help at390×900 EN/UR, with approved mobile reference captures.
This is **source-preview evidence only**. Expo Camera eagerly imports a web-only
QR worker; the isolated preview serves an explicitly inert decoder fixture
instead of accessing its external CDN. No camera/QR recognition is tested and no
unexpected script error is silently ignored. Early diagnostics exposed Latin
serif fallback in Urdu; the Text family selection was corrected and recaptured.
Preview harness/results: `frontend/e2e/native-source-preview.mjs` and
`docs/implementation/v5-native-source-evidence/` in the coordinator.

Actual Android installation/rendering, Urdu/font-scale/keyboard/Back behavior,
camera/GPS/QR/push, signing and performance remain unverified. Web export and
component trees cannot close that acceptance criterion. Native verification/
photo-provider/private-media acceptance remains separately open in37/40.
