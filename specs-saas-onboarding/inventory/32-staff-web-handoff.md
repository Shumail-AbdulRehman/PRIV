# Spec 32 — Staff web handoff

`frontend/src/routes/launchPages.tsx` retains `StaffWebHandoff` as the local staff destination used by the existing `WorkspaceAudience` guard. It now uses `FlowShell` at `size="narrow"`, with no onboarding progress, and the approved English/Urdu message directing attendance and cleaning tasks to the company-provided Android app.

Reuse this destination through `WorkspaceAudience`; no second staff guard, shell, download helper, translation dictionary or logout hook was created. The screen reuses `serviceInformation()` for the approved Android link, `useLogout()` for sign out, and the shared flow typography, spacing, buttons and notices. It retains signed-in identity isolation, the Android information link, company guidance when distribution is unavailable, pending sign-out feedback and retryable sign-out errors.

`frontend/src/routes/launchPages.test.tsx` covers the narrow staff shell, English/Urdu instructions, configured/unavailable distribution, sign out and its pending/error states, alongside existing owner/manager routing and route-error coverage.

Verified 2026-11-10: 30 focused route tests and the whole frontend suite (88 Node + 2,108 Vitest tests) passed; frontend types, lint and build passed. No additional reusable component or helper was needed beyond the shared dependencies listed above.
