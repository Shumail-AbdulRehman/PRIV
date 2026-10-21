# Specification 30 account UI

Issue58; isolated branch implementation/spec-30-account-ui based on completed28 at2d77fd3. This implementation is awaiting independent Impeccable finish review and documentation review, which the coordinating agent will perform before marking Done/publishing. No production configuration or records were modified.

## Actual behavior

Owner `/settings` reads GET `/company/settings`, submits PATCH `{name,expectedVersion}`, displays the returned saved name/version and preserves the draft on conflict/denial/failure. Reload explicitly fetches the saved version; tenant ID is never supplied. Manager/staff cannot request owner settings via the page. Settings remain operationally restricted by the existing22/26 server guards; own security is independently reachable.

Owner status caches bind company/role/person and verification receipts remount on principal change, preventing cross-account status flashes. Owner identity GET `/owner-identity/status` displays exact verification, sender availability and legacy enrollment requirements. Verification requests require the owner's current password and POST `/owner-identity/email/request`. Accepted requests say delivery unconfirmed; missing sender and legacy bootstrap never imply email trust or sent mail. No email/contact-edit capability is invented because22 only provides company-name changes.

`/account/security` is a standalone own-password form for authenticated owner, manager or staff, outside operational WorkspaceAudience. It POSTs existing `/common/security/password` with current/new password. If session restoration fails with structured403 `PASSWORD_CHANGE_REQUIRED`, App renders the same form directly, including inactive-company sessions; ordinary operational authorization remains enforced on the server. Other403 responses do not activate this exception. Successful password/owner-link completion clears Redux identity and all query caches, sets restored current identity to null, forgets the link and replaces navigation with sign-in plus a security-update notice.

Public `/recover-owner-account` POSTs `/owner-identity/recovery/request`; receipt is neutral for unknown/eligible accounts and explicitly states delivery unconfirmed. Missing sender, rate limits and transport failure are distinct. Managers/staff receive guidance to their company owner, without inventing a manager recovery policy.

Fixed `/verify-owner-email` and `/reset-owner-password` pages consume16's `#token=` links. `linkToken.ts` is the first main import, captures only the exact43-character base64url token for these paths and immediately removes fragment/query before route initialization/auth requests. Token stays only in volatile module memory, never query cache/browser persistence/navigation state/analytics/logs. GET/render does not consume; explicit button/form POST submits token in the body. Missing/malformed/expired/used links have honest guidance. Reload loses the token. Passwords require matching confirmation,8 characters and72 UTF-8 bytes at most; server enforces distinctness and current authorization.

## Reuse, design and boundaries

Existing AuthShell, Button, Input, LanguageChoice, Redux auth and credentialed client are reused. Security-specific CSS hides AuthShell's illustrative preview and keeps the actual task in a focused single column. Organization uses the incumbent workspace shell with separate sections. All new workflow/status/error copy is in accountTranslations; Urdu sets RTL and email remains LTR.48px form controls use approved v5 variables, with no new dependency or global token changes. DESIGN.md and immutable design/v5 are preserved. Existing public navigation English is inherited; its broader information/marketing work belongs33.

Initial visual inspection found global button specificity reducing targets; the final scoped selectors restore48px. Nine named synthetic intercepted React captures at390/1440px cover EN/UR, settings, forced security, unconfirmed receipt, sender unavailable, verify/reset and restriction; no overflow/JavaScript errors. These are visual component fixtures, not integrated E2E or real mail qualification. The fixture interceptor must exclude `/src/api/*` module requests; the early invalid render attempt was corrected before evidence inspection.

## Verification and limits

Focused19 account/token tests pass. Whole frontend57 Node tests and75 component tests/8 files pass, zero skips. The obsolete27 unavailable-settings route test now mounts actual persisted settings through the registered route, retaining owner/manager guards. Full frontend lint and TypeScript/build passed with exit0 after visual refinements; only a non-failing Vite plugin-timing advisory appeared. The subsequent principal-scoped owner-status correction also passed the whole suite, full lint and TypeScript/build with explicit exit0. Mechanical detector ran once over AccountPages.tsx/account.css and returned `[]`. `git diff --check` passed.

No backend/schema/provider/secret/policy change. Actual sender/domain/origin qualification, legacy identity enrollment and real delivery remain39's external gates; no message was sent.40 owns integrated browser/production-like E2E. Root serializes shared ownership/tracker/handoff, integrates29/30/34/37, performs independent review and publishes stacked draft PRs without merge/deployment. User requested a stop after that batch.

Evidence files are `.impeccable/review/spec30/*.png`; synthetic fixture script `/tmp/hygene-account-render.mjs`; check logs `/tmp/hygene-spec30-{focused,tests-final2,lint-final2,build-final2,render-review}.log` and detector `/tmp/hygene-spec30-detect.json`. Temporary logs can disappear; no claim of durable external qualification is made.

Independent finish review found only error-state direct buttons below48px; scoped CSS fixed, all9views recaptured, reviewer scored resolved/ship at that fix scope. Principal cache isolation source/regression retained. Documentation comparison remains lead-owned.

Independent read-only ordinary-extension documenter comparison completed: source, direction brief and9captures match approvedv5/incumbent. Historical rootDESIGN drift preserved; no newworld/assets/sidecars.
