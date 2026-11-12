# Physical Android flows (Maestro)

These are **unexecuted** Maestro flows, not device evidence. No Maestro or adb executable and no physical test device were available when they were written or last updated (2026-11-12, spec 52 of the staff app redesign). Packaging an APK does not establish physical-device qualification. Real photo processing remains unavailable; no successful upload, AI result or photo verification is inferred.

Every screen around the camera, QR scanner and GPS is covered in a browser by the Playwright suite (`npm run test:e2e`, files in `e2e-web/`, API answered by fixtures). These flows cover what a browser cannot: a real session restart, a real one-use access code, real permission denial and real phone alerts.

| Flow | What it proves | Labels it relies on |
|---|---|---|
| `01-login-restart.yaml` | A signed-in session survives an app restart | "Staff sign in", "Email", "Password", "Sign in", "My day" |
| `02-recovery.yaml` | A manager's one-use access code sets a new password | "Use manager access code", "Set your new password", "Access code", "New password", "Confirm new password", "Save new password" |
| `03-denied-permissions.yaml` | Denied camera and location never record a check-in | "My day", "Check in", "Camera is needed", "Open settings", "Cancel" |
| `04-help-and-alerts.yaml` | Task alerts retry gives real feedback; Help opens from Profile | "Profile", "My details", "Task alerts", "Permissions", "Retry phone alerts", "Help", "Back" |

The labels were checked against the React Native source on 2026-11-12 (English). They still await execution on a signed physical-device build.

Prerequisites: an explicitly selected physical Android test device; an approved signed test APK with its hash and package `APP_ID`; a dedicated non-production, phone-reachable HTTPS API; isolated synthetic staff, shift and task fixtures; a one-use code provisioned through the real manager workflow. Set the app's connection settings ("Show connection settings" on sign in) to that approved backend before signing in and confirm it does not point to production. Never use the Playwright loopback server from a phone, and never invent a default APK, package or recipient. No unattended install, clear-state, push or production command is authorised here.

Run files one at a time with the installed Maestro CLI after supplying their environment parameters locally (never in chat, committed files or CI logs). Use fresh fixture identities and no production passwords. Credential flows must not keep screenshots, video or traces, including Maestro's automatic failure artifacts: use a private temporary output directory and clear it after recording only redacted case, device and build results. Do not publish raw access codes, cookies or credential input logs.

Bindings beyond `APP_ID` and the test credentials (`E2E_EMAIL`, `E2E_PASSWORD`): `E2E_ONE_USE_CODE` and `E2E_REPLACEMENT_PASSWORD` come from a fresh synthetic recovery fixture; `E2E_EXPECTED_ALERT_RESULT` must be the genuine phone alerts registration outcome. Do not set an expected success string to hide unavailable push.

Still outstanding on a device: the task QR scan and every required photo, "Saved, uploading" from the phone's own upload queue, force-kill and lost-response reconciliation, one-use code replay denial, permission retry after Settings, notification navigation and session renewal, Urdu and right-to-left on the device, and install, update and signature checks. These stay requirements, not fabricated successes.

Syntax references (checked 2026-10-21): https://docs.maestro.dev/maestro-flows/flow-control-and-logic/permissions and https://docs.maestro.dev/reference/commands-available/runflow. Parsing the YAML does not validate Maestro commands or selectors on a device.
