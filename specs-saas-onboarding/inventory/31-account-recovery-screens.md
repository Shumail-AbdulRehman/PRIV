# Spec 31 — Account recovery screens

`frontend/src/pages/Account/AccountPages.tsx` retains `SecurityShell` as the single local wrapper. Its explicit `publicPage` option renders the existing `FlowShell` at `size="narrow"`, without setup progress. Public owner recovery, email verification and password reset opt in, even when an identity is signed in. Own-password security (including forced replacement) continues to use the existing `AuthShell`; company settings retain their existing settings layout.

Public screens reuse the shared flow field, button, notice, typography and spacing styles, existing Button/Input primitives, language context and English/Urdu dictionaries. Recovery uses the approved neutral receipt and keeps the manager/staff direction to ask the company owner. Missing or rejected links provide recovery/settings actions. The shell retains heading focus, language controls, sign-in navigation and public document titles.

No new API, token helper, exported wrapper or design token was created. `ownerLinkToken`, explicit completion requests, password validation, credential clearing and private-query clearing remain in their existing paths. Reuse these screens rather than adding another recovery flow.

`AccountPages.test.tsx` covers public versus signed-in presentation, neutral recovery, invalid-link actions, Urdu/LTR email, explicit token completion, session/cache clearing and existing company-settings behavior.
