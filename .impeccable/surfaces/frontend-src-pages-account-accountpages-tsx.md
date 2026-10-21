# Account security and organization settings

Primary target: frontend/src/pages/Account/AccountPages.tsx
Related targets: frontend/src/pages/Account/account.css
Mode: Operate. Build path: code.

Approved ordinary extension of design/v5: blue/white semantic workspace tokens, Inter/Arabic, existing AuthShell and field/Button components. Preserve DESIGN.md and design.json; historical teal prose is superseded by approved v5.

Audience and task: owners save persisted company names and prove owner email; owners/managers/staff replace only their own credentials. Public recovery never reveals account existence or promises delivery. Existing forced-password403 must offer own-password replacement without relaxing backend operational authorization.

First viewport: organization title and explanation followed by company-details form with persisted name, then owner verification. Security pages inherit AuthShell with one purpose, persistent labels and explicit confirmation; token pages never perform mutations on GET. Signature interaction is explicit confirmation followed by cache/identity revocation and sign-in notice. No new decorative motion.

Quality bar: the existing approved v5 setup page and recovery reference; calm aligned sections, 48px controls, keyboard focus, no 390px overflow. EN/UR full workflow, LTR email, owner-only organization, separate own security, truthful loading/restricted/config-unavailable/error/conflict states. Use real API data; captures intercept labelled synthetic fixtures only and do not qualify mail or production identity.

Safety: first-import fragment scrub, volatile token only, explicit POST body, no logging/analytics/storage. Sender/legacy enrollment stay unavailable when reported. No production configuration, legal promises, deployment or automatic verification.
