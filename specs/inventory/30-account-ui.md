# Spec30 reuse inventory

- `frontend/src/pages/Account/AccountPages.tsx`: CompanySettingsPage (owner only), OwnSecurityPage (standalone/forced), OwnerRecoveryPage (neutral request), OwnerLinkPage (explicit verify/reset). Reuses existing AuthShell/Button/Input/language/auth/query client; avoid duplicate credential forms.
- `frontend/src/pages/Account/api.ts`: typed22 settings read/versioned save,16 owner identity/request/complete,17 own-password client and structured PASSWORD_CHANGE_REQUIRED discriminator. No raw server errors displayed.
- `frontend/src/pages/Account/linkToken.ts`: first-import fixed-path fragment scrub and volatile token; do not move after bootstrap imports or persist tokens. Completion forgets memory.
- `frontend/src/i18n/accountTranslations.ts`: new account EN/UR workflow vocabulary; registered in existing translations without touching manager dictionary.
- `frontend/src/pages/Account/account.css`: scoped v5 form/section/security-shell styling;48px controls and focused AuthShell adaptation.
- Actual route composition is main.tsx (`account/security`, `recover-owner-account`, `verify-owner-email`, `reset-owner-password`), workspaceRoutes.tsx (`settings`), App.tsx (only structured forced-password403), Sidebar (separate own security and owner organization), Login (recovery link and post-change sign-in notice). Spec34 platform routes must remain outside tenant App bootstrap.
- `AccountPages.test.tsx`16 behavior tests and `linkToken.test.tsx`3 immediate-scrub tests; launchPages.test.tsx now proves actual saved owner form and preserves manager route denial. No integrated E2E here.
- `docs/implementation/ACCOUNT_UI.md` maps API behavior, external qualification limits and pending independent review.39 consumes real sender/origin/enrollment qualification;40 consumes actual routes and security transitions. No automatic legacy email verification, manager recovery policy or production delivery claim.
