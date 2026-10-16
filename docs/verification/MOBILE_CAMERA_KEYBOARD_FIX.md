# Camera, sign-in keyboard and task-only photos — 2026-10-12

Changes are implemented in source. No APK was built, per the user's final instruction; the installed 2.1.4 APK does not contain these subsequent mobile changes.

## Changes

Camera/QR preview uses an explicit screen-bounded height (minimum 220 logical units) inside its scroll view, preventing an aspect-ratio-only container from collapsing into a thin strip. Existing camera readiness, lifecycle, capture/timing, restart and durable-save handling remain. An empty/consumed capture session with missing requirements offers a clear QR-renewal recovery action.

Sign-in uses a bounded scroll view, Android height/iOS padding keyboard avoidance, top-aligned content, safe-area spacing, keyboard-dismiss-on-drag and Android keyboard-height bottom space. The sign-in and connection controls remain scrollable/reachable while editing.

New backend capture sessions persist context-policy version 2 with no entrance/layout slots and an acceptable context status; only manager-configured immutable task requirements are allocated. QR, location, boot clock, capture windows, evidence authorization and calibrated acceptance remain.

Existing sequential sessions transition on authorized resume/renewal under the task lock. An audited policy change retains historical slots/photos and GPS data. Only safe, obsolete context/origin-uncertainty issues associated with those retired context photos are resolved. Privacy/service/duplicate/stale-assignment and actual item issues remain independent. Old context slots cannot be activated/uploaded/retaken after retirement and no longer block required item sequencing. Completed/historical sessions are not bulk rewritten.

## Validation

Backend unit tests, mobile tests and TypeScript passed. The mobile harness tests a real-sized camera container, keyboard show/hide scroll-space changes, existing capture lifecycle, cached entrance removal and item selection. The isolated HTTP suite creates new tasks with zero context photos and also emulates an old entrance session: authenticated resume audits retirement, hides the old slot while retaining it in storage, and proceeds through fixture upload, re-cleaning/retake, submission, manager acceptance and queue removal. Legacy database lifecycle regression passed, including presence, authorization, held evidence, epochs and deadlines.

Latest HTTP evidence: `evidence/photo-flow/no-entrance-report.json` (controlled AI/storage). No customer data was bulk migrated. The API/worker use the updated backend code. Physical camera layout and keyboard behavior still need confirmation on the affected phone; simulated rendering tests cannot certify device behavior.

## Follow-up: explicit second QR entry and timer checks

All app routes into task photos request a fresh photo-entry QR scan, including the cleaning screen, Home and Tasks. A cached still-valid photo session cannot bypass this entry scan. The camera/step activation/capture guards remain blocked until the QR-authorized session is durably saved. Existing evidence stays intact; the scan renews previous authority. Internal continuation and upload retries remain separate from new photo-flow entry.

73 mobile tests pass, including fresh photo entry with cached session authority and its second QR scan; 77 relevant backend tests pass. Timed-session tests confirm the default 90-second shared item budget, exclusion of server-checking wait from consumed capture time, immutable activated deadlines, QR renewal on expiry, and capping at the overall authorized session deadline. Overall default is 20 minutes, further bounded by the task's allowed deadline. Required-photo sequence cannot advance while the preceding required view is unresolved. Retired entrance slots cannot consume/block the item sequence. TypeScript and whitespace checks passed. No APK was built.

## Subsequent APK requested and produced

The user subsequently requested an APK. File: `frontend-mobile/build-output/HygeneOps-staff-2.1.4-photo-fixes.apk`, 70,497,717 bytes (67.23 MiB), SHA-256 `b471042d32ff0404424fe38115447b63492f81fd0f7c3b10c8fae04334390517`. Current Android JavaScript was compiled with Expo/Hermes and packaged in the verified 2.1.4/code 7 native binary. Native sources, dependencies and assets match that binary; all existing payloads except `assets/index.android.bundle` are byte-identical. This is a signed bundle update, not a fresh native compilation. 73 mobile tests/typecheck, actual APK inspection, matching update certificate, model/runtime absence and 16 KiB alignment passed. Physical-phone validation remains.
