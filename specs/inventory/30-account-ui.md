# Spec30 reuse inventory

- `frontend/src/pages/Account/AccountPages.tsx`: CompanySettingsPage (owner only), OwnSecurityPage (standalone/forced), OwnerRecoveryPage (neutral request), OwnerLinkPage (explicit verify/reset). Reuses existing AuthShell/Button/Input/language/auth/query client; avoid duplicate credential forms.
- `frontend/src/pages/Account/api.ts`: typed22 settings read/versioned save,16 owner identity/request/complete,17 own-password client and structured PASSWORD_CHANGE_REQUIRED discriminator. No raw server errors displayed.
- `frontend/src/pages/Account/linkToken.ts`: first-import fixed-path fragment scrub and volatile token; do not move after bootstrap imports or persist tokens. Completion forgets memory.
- `frontend/src/i18n/accountTranslations.ts`: new account EN/UR workflow vocabulary; registered in existing translations without touching manager dictionary.
- `frontend/src/pages/Account/account.css`: scoped v5 form/section/security-shell styling;48px controls and focused AuthShell adaptation.
- Actual route composition is main.tsx (`account/security`, `recover-owner-account`, `verify-owner-email`, `reset-owner-password`), workspaceRoutes.tsx (`settings`), App.tsx (only structured forced-password403), Sidebar (separate own security and owner organization), Login (recovery link and post-change sign-in notice). Spec34 platform routes must remain outside tenant App bootstrap.
- `AccountPages.test.tsx`16 behavior tests and `linkToken.test.tsx`3 immediate-scrub tests; launchPages.test.tsx now proves actual saved owner form and preserves manager route denial. No integrated E2E here.
- `docs/implementation/ACCOUNT_UI.md` maps API behavior, external qualification limits and pending independent review.39 consumes real sender/origin/enrollment qualification;40 consumes actual routes and security transitions. No automatic legacy email verification, manager recovery policy or production delivery claim.

## Issue86 V5 public journeys

- `components/common/AuthShell.tsx` + `auth.css`: actual centered journey brand/title/card/language foundation; shared by login, signup, owner recovery/link/security and staff handoff. Reuses existing brand/controls/tokens, no runtime sample dashboard.
- `LoginPage.tsx`, `SignUpPage.tsx`, `accountTranslations.ts`: real credential/company fields, bilingual validation/denial/pending/receipt; existing auth/signup API and hook contracts unchanged.
- `App.tsx` GuestRoute: authenticated ADMIN on signup agrees with canonical billing destination; other role/login/welcome destinations preserved.
- `routes/launchPages.tsx` staff handoff: existing audience gate and logout retained; reuses38 `serviceInformation` approved Android link guard. This post-implementation correction is serialized on the completed38 base; the historical execution DAG is not being replayed.
- `LoginPage.test.tsx`: real request payload/identity/cache behavior, translated validation, signup destination cooperation and failed session delivery. Existing AccountPages/launchPages tests retain owner/staff/role/security boundaries.
- `docs/implementation/V5_AUTH.md`: implementation and four-part acceptance; spec40 consumes actual rendered evidence and original registration regression.
