# Company login polish — 31 October 2026

The user requests improving the company login shown in their screenshot. Work
is limited to presentation and form usability, preserving approved blue/white
tokens and existing owner/manager/staff authentication requests and destinations.
This is a single-session UI refinement, not a new numbered feature specification.

## Changes

- Optional `aside` presentation slot in the existing AuthShell. Only company
  Login supplies it; signup, recovery and operator forms retain the default shell.
- A balanced desktop form and illustrated side panel using the existing bundled
  `auth-cleaning-team.webp`, with the form prioritized on phones/tablets. The
  image is decorative; no fabricated customer or workforce statistics are shown.
- Clear brand/language header, consistent fields and primary action, visible
  focus, structured error feedback and English/Urdu/RTL labels.
- Password visibility uses a type=button toggle, preserves the current value and
  never submits the form or stores credentials. Existing API errors and pending
  submission behavior remain authoritative.
- Password recovery remains available; a separate platform-owner sign-in link
  explains the correct destination for product-owner credentials. The screenshot
  showed a platform identity entered into the company login. No account or
  permission is changed to make that identity work as a company administrator.

## Verification

59 focused login/operator/account component tests passed; full frontend407 React
and64 Node tests passed. Both company account types still use their original
endpoints and existing shared default AuthShell flows remain covered. Two added
unit cases check password visibility without submission, preserved values,
platform/recovery destinations, one language selector and Urdu behavior.

Commands: direct `vitest run --maxWorkers=1` (focused and full); `npm run test:unit`.
Heavy checks ran sequentially at nice15 with one worker. Touched ESLint and
`VITE_LOCAL_PLATFORM_LOGIN=true nice -n 15 npm run build` passed. The Impeccable
mechanical scan of LoginPage, login.css and AuthShell returned no findings.

The existing isolated browser harness passed three real SQL/API/Chromium cases:
rejected sign-in and visibility toggle, actual staff login/handoff/logout, and
pending owner sign-in with duplicate submission disabled and dashboard arrival.
Command: `HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56443/priv_e2e_test nice -n 15 node frontend/e2e/run.mjs customer-auth-v5.spec.ts --grep 'real rejected|actual staff|actual sign-in pending'`.
This also passed backend/browser/frontend TypeScript and an isolated frontend
build. Zero generated child DBs remained; the owned test cluster was stopped.
The full original visual journey case was updated for the explicitly changed
login geometry but was not run in this focused check.

Actual local frontend was rebuilt/restarted. Eight desktop/tablet/phone/small-phone
observations at1366/768/390/320x900 EN/UR passed: no horizontal overflow or browser
errors, single language control, correct aside visibility, password toggle,
required-field feedback and keyboard navigation to platform sign-in. Four actual
API401denial states were captured after emptying credentials. Twelve captures and
results remain outside Git at `~/.local/share/hygene-ops/local-development/login-ui-polish-20261031/`.
Inspected against existing approved blue/white tokens and current V5 composition;
the user-requested desktop split is intentional, with default shared auth layouts
preserved. Only two updated synthetic/masked browser screenshots are committed.

## Files and scope

`frontend/src/pages/Login/{LoginPage.tsx,login.css,LoginPage.test.tsx}`;
`frontend/src/components/common/AuthShell.tsx`;
`frontend/src/i18n/accountTranslations.ts`; existing customer-auth browser tests.

Worktree `/home/shumail/.local/share/hygene-ops/v5-import-20261031`, branch
`ui/company-login-polish`, based on company overview `1aa4cce`/draft113. Original
root changes, the untracked frozen design directory and other worktrees remain
preserved. No backend, schema, billing, platform authorization or original V5
specification status changes. No merge or deployment.
