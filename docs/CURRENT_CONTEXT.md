# Hygene Ops: current project context

Last updated 2026-11-13 (mobile and workspace redesigns plus the photo owner switch pushed; owner turned photo checking on in Heroku). This is a snapshot from a code review plus the onboarding implementation work below, so check a claim against the code before relying on it. Update this file when something below changes.

## What it is

Multi-tenant SaaS for cleaning companies in Pakistan, built as a final-year project and previously called CleanOps. Owners and managers run locations, shifts, attendance, task schedules and photo review. Field staff use a mobile app in English or Urdu.

Roles: `ADMIN` (owner, company-wide), `MANAGER` (assigned locations only), `STAFF` (own work), plus a separate platform operator identity.

Plans (`subscription.service.ts`), as locations / staff / managers: `STARTER` 1/3/1, `PRO` 5/25/3, `ADVANCED` (shown as Enterprise) 20/200/20.

## Repo map

| Path | Purpose |
|---|---|
| `backend/` | Express 5, TypeScript ESM, Prisma 7, PostgreSQL (43 models), Zod, Paddle, Cloudinary, in-process cron |
| `frontend/` | React 19, Vite 8, TanStack Query, Redux for auth identity, Tailwind 4, Radix |
| `frontend-mobile/` | Expo 54, React Native 0.81 staff app, native capture-quality and spatial modules |
| `specs/`, `specs-billing-onboarding/` | Historical implementation specs (00 to 63). Do not edit |
| `specs-billing-checkout-repair/` | Superseded Paddle checkout plan (64 to 85), never executed. Replaced by `specs-saas-onboarding/` |
| `specs-saas-onboarding/` | Account, plan and checkout flow. All 44 specs done and deployed |
| `specs-workspace-redesign/` | Owner/manager workspace redesign, specs 01 to 55. 53 to 55 are Not started |
| `specs-mobile-redesign/` | Staff phone app redesign, specs 00 to 72. Error-message pass postponed |
| `design/` | Design prototypes, not production behaviour |
| `docs/` | Reports, plans and evidence. Most of it is historical |

The three apps have separate installs and lockfiles. The root `package.json` is only a Heroku backend launcher.

Deployment: web on Netlify, with `frontend/public/_redirects` proxying `/api/*` to the Heroku backend. Docker Compose is an alternative path. On 2026-11-13 the owner reported adding the photo settings to Heroku (`PHOTO_CHECKS_OWNER_OVERRIDE=true`, `AI_PROVIDER=clef`, the Cloudflare and Cloudinary keys). Claude has not inspected the live settings, and the Heroku CLI is not installed on this laptop.

Local oddities: `backend/var`, `frontend-mobile/android`, `frontend-mobile/.expo` and `frontend-mobile/node_modules` are symlinks outside the tracked tree, so a fresh clone will not build as-is.

## Which docs to trust

1. The code.
2. This file.
3. `PRODUCT.md`, `DESIGN.md` (visual only, rebuilt 2026-11-09 from shipped code) and `docs/PRODUCT_UI_RULES.md`.
4. `docs/project-audit-2026-11-08/REPORT.md` and `docs/plan-project/2026-11-08-code-flows/` (`FINDINGS.md`, `FLOWS.md`, `ROUTES.md`, `DATA-MODEL.md`). Useful detail, written before this file.

`PROJECT_CONTEXT.md` is stale. It still describes the removed worker, encrypted phone queue and other old systems.

## How it works

Entry points: `backend/src/app.ts`, `frontend/src/main.tsx`, `frontend-mobile/App.tsx`.

**Signup and billing**
1. `companyRegistration.service.ts` creates the company and owner together.
2. `billingLifecycle.service.ts` writes a `*_RESERVED` audit row under a company lock, creates the Paddle customer and draft transaction, then writes `*_READY`.
3. The browser opens Paddle (overlay today, `useBillingCheckout.ts`).
4. The signed webhook (`paddleFulfillment.service.ts`, raw body mounted before JSON parsing) mirrors the data and is the only thing that grants access. Browser events only trigger a re-read.
5. `WorkspaceGate.tsx` lets the owner in once the server allows it.

**Access**
`auth.middleware.ts` reloads the user on every request and checks role, company status and `credentialVersion`. `accountAccess.service.ts` applies per-action policy (`READ_OPERATIONAL`, `START_WORK`, `MANAGE_WORK`, `ADD_CAPACITY`, `COMPLETE_WORK`). Plan limits are enforced under a row lock in `withAccountCapacity`. Passwords are hashed by Prisma extensions on `create` and `update` only (`prisma/prisma.ts`), so `updateMany`, `upsert` and raw SQL are not covered.

**Setup and tasks**
Location, then area, then fixtures, then schedule (`TaskTemplate`). Each `TaskInstance` keeps an immutable snapshot of its requirements (`inventorySnapshot.service.ts`).

**Background jobs**
All run inside the API process, imported by `app.ts`, so each replica runs them. Examples: daily tasks every 90 seconds, reassignment every minute, status and deadlines every 15 minutes (`cron/`).

**Staff day**
1. Check in with selfie and GPS (`attendanceWrites.service.ts`).
2. Scan the task QR to start (`taskInstance.controller.ts`), then clean.
3. Scan again to open a capture session (`captureSession.service.ts`).
4. Upload photos one at a time. Each is processed inside the request (`directPhoto.service.ts`).
5. Submit (`staffSubmission.service.ts`).

Submission is separate from verification (`completion.service.ts`). Managers resolve issues in `exception.service.ts` and `reviewClosure.service.ts`. Keep submitted, verified and review-closed separate in code and UI.

## Open problems, most serious first

Marked **source** when read from code but not reproduced.

1. **Photos are checked with no privacy screening (owner's decision, 2026-11-13).** `verificationReleaseConfiguration()` in `cleanlinessRelease.ts` still hard-codes `privacyAssessment:false`, so the gate in `launchQualification.ts` is closed by default and new photos are refused with "Photo checking is unavailable pending safety qualification". The owner switch `PHOTO_CHECKS_OWNER_OVERRIDE=true` (`photoChecksOverride.ts`, commit `6570a0f`) opens it and lets AI "clean" verdicts pass without a manager; the owner set it on Heroku. Every photo is then stored on Cloudinary and shown to managers unscreened, so a person in a washroom photo is not caught, and the AI's accuracy is unmeasured. The proper fix is real privacy screening plus a measured release record; then the switch can be removed. If the switch is off or the AI settings are invalid, staff can start a task but not finish it unless a manager waives each requirement.
2. **One Paddle failure can lock an owner out (source; may be partly fixed).** A failed customer or transaction create used to leave `*_RESERVED` with no `*_READY`, so every retry got a 409. `billingReservations.service.ts` now records `CUSTOMER_CREATE_FAILED` and `CHECKOUT_FAILED`, and a failed checkout resolves to none; this has not been reproduced either way. Definite rejections are treated the same as timeouts in `callProvider`.
3. **Provider failures are still hidden.** `callProvider` discards Paddle errors; provider-call logging remains with spec 08. Spec 02 now logs unexpected request errors safely by class/code/type, with a server-generated request ID also returned as `X-Request-Id`.
4. **Docker path cannot bill.** Compose has no Paddle or owner-mail variables, and the web image gets no Paddle build values.
5. **Abuse limits.** Login, signup and enterprise inquiries have no rate limit. The account recovery limit uses `req.ip`; spec 02 now validates `TRUST_PROXY_HOPS` (default 0) before routes are mounted, but the real deployment's proxy-hop setting has not been checked.
6. **Wrong sign-outs.** `App.tsx` clears the session on any current-user error, including 503. On mobile, a lost refresh response causes the next refresh to fail and clears the session (source).
7. **Scheduling defects**, reproduced by SQL probes on 2026-11-08 (`FINDINGS.md`): daily tasks start a day early, one worker can be double-booked, overnight tasks can fall outside a shift, and a transfer can get stuck on an old missed checkout.
8. **Deadline job grows forever (source).** `expireVerificationTasks` has no date limit and ignores `staffSubmittedAt`, and it flags photos awaiting review as missing evidence.
9. **Dependencies.** `npm audit` on production dependencies shows 1 critical and 20 high in each of backend and web. Exploitability not assessed.

Smaller:
- Attendance adds up to 200 m to the geofence from phone-reported accuracy, while capture presence does not.
- The server does not require check-in before task start; only the app does.
- Photos judged dirty are discarded, so a manager cannot check that verdict.
- About 2,500 lines across 39 files are unreachable from the app entry points, mostly the old worker pipeline.

Known unverified: real Paddle payments, the live Heroku/Netlify configuration, photo checking on the deployed server, physical phones against Heroku.

## Signup, plan and checkout plan (done)

`specs-saas-onboarding/` is the plan that built the account, plan and checkout flow. All 44 specs are done as of 2026-11-10. The work was merged from `saas-onboarding` into `main` by fast-forward at commit `dbf8121`, on top of the previous `main` commit `805dd40`, with no history rewritten. Check `git log origin/main` to see whether it has been pushed. Pushed to GitHub `main` on 2026-11-10 at `15ce2b6`; Heroku deployed that commit successfully. GitHub Actions failed on that push: CI's frontend job fails because Node tests need `@paddle/paddle-node-sdk` and `sharp`, which that job does not install, and Publish Images failed building the frontend image. **Pushing `main` deploys the backend to Heroku automatically** through the GitHub integration, about 20 seconds later, and the GitHub repository is public. Bugs found after the numbered plan are in `specs-saas-onboarding/fixes/e2e-bug-fixes.md`, and the plan page and checkout address fixes are in commit 94e3078. Latest results: 2,543 backend and 2,446 frontend tests passed (96 Node, 2,350 Vitest), and 27 SQL tests passed earlier. The last full browser run had 198 passed, 1 skipped and 1 failed while code was being changed; that test (`S42-27-28-29`) then passed twice alone. `billingRoutes.test.tsx` and `launchPages.test.tsx` have intermittent heading waits when the machine is busy.

Real sandbox state: all six sandbox prices have no trials. On 2026-11-10 the user completed a real sandbox test-card payment through the new flow on a local run, which linked a Pro subscription using the server check, without a webhook. Declined and 3DS cards, a signed webhook and a deployed run are still unproven. Paddle rejects `status: 'draft'` on transaction create, and rejects a `checkout.url` whose domain is not approved (`cleanops-01.netlify.app` is not approved in the sandbox), so send neither.

Local manual test setup: Docker container `priv-e2e-pg` on 127.0.0.1:56442 (databases `priv_e2e_test`, `hygene_test`, `priv_manual_test`), backend on 8090 with `DATABASE_URL` and `DIRECT_URL` overridden to `priv_manual_test`, web on 127.0.0.1:5199 with `VITE_API_BASE_URL` set to the 8090 API. An older copy of the app from `~/.local/share/hygene-ops` runs on 8080 and 5173.

**Known gap: a cancelled company cannot subscribe again.** Found 2026-11-10 by reading the code; no real cancellation has been run. `billingCheckout.service.ts` returns 409 whenever `billingSubscriptionId` is set, and `billingOnboardingStep.ts` sends any company with a linked subscription to `ACCOUNT` (`/subscription`), which only offers the Paddle portal. As far as known, Paddle cannot restart a cancelled subscription from there, so the company stays read-only until fixed by hand. Recommended fix, not yet approved or built: once a subscription has really ended, send the owner back to choose a plan and pay through the same flow, keeping their data; active and scheduled-to-cancel subscriptions stay blocked so nobody is charged twice.

After cancellation, per `accountAccess.service.ts`: access continues until the paid period ends; afterwards sign-in, read-only records, billing and security still work, new work and added capacity are blocked, and work already started can be finished. There is no grace period, and no code was found that deletes a cancelled company's data. Cancellation reaches the app through Paddle's webhook.

Other open follow-ups are in the Findings of `specs-saas-onboarding/43-verification-pass.md`. The mobile sticky-bar fix on the plan page could not be reproduced in an automated test and needs a human check. The misleading "We could not confirm your previous checkout" message on a Paddle rejection still needs new wording.

It replaces Codex's unexecuted `specs-billing-checkout-repair/`. Design is approved at `design/saas-onboarding/v3/index.html`: Fresh aurora background, Mint sky side panel, Checkbox logo. Research and planning are in `docs/plan-project/saas-onboarding/`.

User decisions, 2026-11-09: free trial removed; Paddle inline card form with sandbox test cards; activation by webhook plus a server read of the exact transaction; email-and-password login with no account-type dropdown; owners may change plan by cancelling the unpaid draft; a dry-run-first script removes trials from sandbox prices.

Open items for the user: the stuck-company billing read in spec 14 has not run, because no record says which company it is, and it needs the company name or owner email. A session on 2026-11-10 accidentally printed the database connection string, so the database password should be changed (`backend/.env` and Heroku together). Still not done as of 2026-11-13.

2026-11-10 sandbox evidence: the user authorized exactly one probe and one trial-removal preview, both now run. All six sandbox prices were active, USD, frequency 1, with trials present (three monthly, three yearly). Duplicate customer returned normalized `customer_already_exists`. The probe exited 1 because draft creation returned `REJECTED` / `invalid_field`; draft read/list and cancellation read-back remain unverified (`NO_KNOWN_TRANSACTION`). The preview exited 0 and reported `WOULD_REMOVE` for all six; no trials were removed. See `docs/plan-project/saas-onboarding/research/sandbox-probe.md` for the real output. Trial removal and stuck-company database inspection remain outside that authorization; no real payment ran. Spec Status lines and PROGRESS were left unchanged.

**Public site redesign, 2026-11-10.** Home, Features, Pricing and the footer were rebuilt from `design/marketing-site/v4/`. Login and signup use the public navbar through `FlowShell`'s `siteNav` prop, with the card centred; other onboarding screens keep their logo header. New styles are in `frontend/src/marketing-redesign.css`, and the product video is in `frontend/public/media/`. Contact sales uses the existing `/subscription/enterprise-inquiries` form in a restyled dialog. The web `/help` and `/service-information` pages were removed on the user's request; "Contact support" on billing screens now appears only when the server has a support email configured, and Terms, Privacy and Exit links currently have no web page to appear on. Public plans show no price amounts because no amounts are recorded in the repo. The video still shows "Investor Explainer" and the old H logo. Frontend type check, lint, build and unit tests passed; the browser end-to-end suite was not run.

**Company dashboard redesign (committed as `f4cf89a` and pushed 2026-11-13).** Specs 01–48 implement the approved `design/workspace-redesign/v3/`: a light role-aware rail, 126 scoped tokens, shared controls/panels/phone tables, Overview/setup/Today/reviews/attendance, locations/team/managers/settings/billing/task photos, and one read-only hourly/full-location-comparison addition to the overview API. There is no workspace schema migration or new runtime dependency. The actual company name comes from the existing subscription read. Staff submission, verification and review closure retain separate meanings; attendance photos stay inside the opened record and task evidence uses the protected viewer. Managers keep assigned-location scope and their Overview variant. Spec 48 also adjusts session/route/billing loading presentation: workspace waits use the skeleton, genuine billing flows use FlowWait, and LoadingSpinner is removed. Authorization and billing decisions remain server-owned.

Spec 49 completed the observe/report gate on the existing uncommitted tree, continuing its interrupted session without a Git checkout or deployment. Clean lockfile installs, both type checks/builds and frontend lint passed. Executed unit results: **3,452 frontend** (100 Node + 3,352 Vitest), **336 supplemental** (6 tokens + 306 dictionary + 24 hourly), and **2,668 backend**, with 7 existing opt-in SQL skips. The complete managed browser run passed **203**, with **1 optional local-platform skip**, zero failures/retries/flaky cases; the archive flow separately passed 3/3 repetitions. The pass reviewed all 283 earlier criteria, checked 96 owner and 16 manager route views plus 68 form/state captures at 1440/390px in English/Urdu, and consolidated all 50 inventory fragments. Source hashes confirm the tested web/backend sources were preserved through the continuation.

Of the six follow-ups, 50 to 52 are now Done (committed in `f4cf89a`) and 53 to 55 remain **Not started**: **50** hides cached private task-photo content after terminal refresh errors (real manager revocation returned 403 for both reads while private regions remained); **51** shares the inherited duplicate staff-location assignment request; **52** corrects 3.6418:1 location-placeholder contrast; **53** preserves 150ms colour feedback under reduced motion; **54** adds missing open/closed task-photo review-state tests; **55** carries the existing local schedule translations through the shared empty state. Before the 2026-11-13 commit: backend and frontend type checks and frontend lint passed, frontend unit tests passed (100 Node, 3,382 Vitest) and the related backend tests passed; the full backend suite and browser suite were not rerun.

**Decided 2026-11-13:** the owner chose to launch with photo verification now, through the owner switch, and to skip privacy screening for now.

## Staff phone app redesign (pushed 2026-11-13)

Plan: `specs-mobile-redesign/` (design `design/mobile-redesign/v3/`). Read `specs-mobile-redesign/PROGRESS.md` first; its Log records every lead decision. Specs 00 to 72 are Done, except the error-message pass, which the owner postponed. **Committed as `c724abe`, fast-forwarded into `main` and pushed to GitHub on 2026-11-13** together with `f4cf89a` (dashboard) and `6570a0f` (photo owner switch); `origin/main` is `6570a0f`. Pushing triggers the Heroku deploy; Claude did not see the deploy result. The previous `main` is kept as branch `backup/main-before-mobile-merge-20261113`.

- **Built:**
  - Part 1: the redesigned staff app.
  - Part 2: the History tab, finished-task details, and the Profile month and work sections, with three new routes in `backend/src/routes/staffMobile.route.ts`.
  - Fixes 54 to 68.
  - Photo speed-ups: server spec 69 and app spec 71.
  - Blocking reused photos: spec 70.
  - A photo-check progress animation: spec 72.
- **Last checks:** mobile unit tests 717/717, e2e 112/112. Backend verification-v2 and verification route tests 582/582 on 2026-11-13, including the owner switch tests.
- **Measured photo time:** about 11 to 13 s per photo before the speed-ups. With a local server, larger photos were not faster, because this laptop's upload link is shared; the hosted server is unmeasured.

**Open bug, highest priority: retake after "retake needed" gets stuck with HTTP 409 `REPLACEMENT_UNPROVEN`.** In `frontend-mobile/src/screens/verification/VerificationScreen.tsx` `scanned()`, replacement targets include only `CLEANING_REQUIRED` requirements. After a `RECAPTURE_REQUIRED` result, rescanning the QR opens a new session, which bumps the requirement's `decisionVersion`. From then on, `/capture-session/:id/renew` fails the check in `backend/src/services/verification-v2/launchPhotoPolicy.ts` `assertFailedViewReplacement` (`attempt.slot.generation !== row.decisionVersion - 1`). This predates the redesign. Photo checking is now on in Heroku, so real staff can hit this; fix it next, with tests.

**Other open items:**
- Postponed error-message pass: the app shows raw text such as "Request failed with status code 409" or the native-build message; it should show clear English and Urdu messages.
- With zero photo requirements, the photo screen shows only "View photo results".
- Photo privacy screening is absent; the owner chose to launch without it (see open problem 1).
- Not yet tested on a real device: the camera-stays-open flow and the animation.
- The owner's choice on a minimum cleaning time before completion photos: none exists today; recommended to flag fast completions.

**Building a test APK:**
- Cloud build with the owner's logged-in Expo account, profile `preview` in `frontend-mobile/eas.json`. The API URL there is `http://192.168.100.198:8080/api`, the laptop's Wi-Fi address. To test against Heroku, build with profile `heroku` instead (same settings, API `https://cleanops-2f9dbc8f50cd.herokuapp.com/api`). The backend has no page at `/`, so "Cannot GET /" there is normal; `/api/verification-capabilities` returning 401 shows it is up.
- Build from a clean copy of `frontend-mobile` without `node_modules`, `android`, `ios`, `dist`, `build-output`, `.expo` or `.env`. Symlink `node_modules`, and use `EAS_NO_VCS=1 npx eas-cli build -p android --profile preview --non-interactive --no-wait`.
- `.easignore` must use root-anchored patterns (`/android/`, `/ios/`, `/node_modules/`). A bare `android/` also drops `modules/*/android`, and the APK then fails photo capture with "Photo verification requires the Hygene Ops native development or production build."
- The APK must contain `expo/modules/capturequality` in its dex.
- The current APK is `frontend-mobile/build-output/HygeneOps-staff-2.2.2-photo-speed.apk`. `app.json` is at version 2.2.2, versionCode 14 (committed in `c724abe`). The free Expo queue can take about an hour.

**Local phone test setup:** `/tmp` is cleared on reboot, so recreate it as follows.
- **Server:**
  - The systemd user service `hygeneops-backend-development` runs an old app copy on 8080. Stop it, and start it again afterwards.
  - Copy `backend/` to a scratch folder without `node_modules`, `dist` or `.env*`, and symlink `node_modules`.
  - Create a `.env` from `backend/.env`, with `DATABASE_URL` and `DIRECT_URL` set to `postgresql://fixture@127.0.0.1:56442/priv_manual_test`. That is Docker `priv-e2e-pg`, trust auth.
  - Add `PHOTO_CHECKS_OWNER_OVERRIDE=true` to the copy's `.env` to open the photo gate. Hand-editing `launchQualification.ts` and `cleanliness.service.ts` is no longer needed.
  - Run `PORT=8080 node_modules/.bin/tsx src/app.ts`.
- **Test data in `priv_manual_test`:**
  - Company 1, location 7 "APK Test Site", whose radius covers the whole Earth.
  - Area 1 "APK Test Washroom" with Indian toilet, Sink and Floor.
  - Staff `apk.tester@hygeneops.test`. The password is in the private Claude memory, not here, because this file is tracked in a public repo.
  - Tasks 1288 and 1289. A new task needs its own `TaskTemplate` (unique per template and date), a `TaskAssignment`, its `TaskVerificationItem` rows and their `TaskEvidenceRequirement` rows; without the last, the photo session has zero slots.
  - The task QR is `signTaskQr` from `backend/src/services/verification-v2/qr.service.ts`.
- **Phone:** it must be on the same Wi-Fi ("4idiots"). A laptop Wi-Fi restart fixed one case of devices not reaching each other.

## Design decisions (2026-11-09)

Register is `product`. Blue (`#2556d8`) is the shipped primary, not teal. North Star is "The Daily Worksheet". Spoken instructions were removed from the docs because `expo-speech` is not installed. Non-visual UI rules live in `docs/PRODUCT_UI_RULES.md`. Impeccable reads `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json`.

## Commands

Run tests with the database and dotenv pointed nowhere, so they cannot touch real data:

```bash
export DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null
cd backend && npx tsc --noEmit -p tsconfig.json && npx vitest run --maxWorkers=2
cd frontend && npx tsc -b --noEmit && npm run test:unit && npx vitest run --maxWorkers=2 && npm run lint
cd frontend-mobile && npx tsc --noEmit && npm test
python3 .ai/plan-project/scripts/validate-specs.py specs-workspace-redesign   # or specs-mobile-redesign
```

Latest results (2026-11-12/13): backend 2,668 passed with 7 opt-in SQL skips (spec 49) and verification tests 582/582 (2026-11-13); frontend 100 Node and 3,382 Vitest passed, type check and lint clean (2026-11-13); mobile 717 unit and 112 e2e passed (2026-11-12); browser suite 203 passed with 1 optional skip (spec 49). The skipped SQL tests need `LAUNCH_PERSISTENCE_TEST_DATABASE_URL`. Backend has no lint script.

## Working rules

- Never print or commit secrets. Private `.env` files exist in the root, `backend/`, `frontend/` and `frontend-mobile/`.
- `*.md` is git-ignored by default. A new Markdown file that should be tracked needs a `!path` exception in `.gitignore`.
- Do not bypass the photo qualification gate in code, clear billing reservations, or grant access outside the signed webhook. The only allowed way past the photo gate is the owner switch `PHOTO_CHECKS_OWNER_OVERRIDE=true` (added 2026-11-13, owner's decision), which skips privacy screening and lets AI "clean" verdicts pass without a manager.
- Do not commit, deploy, migrate an application database or touch a provider account unless the user asks.
- The working tree holds uncommitted design, planning and audit work. Leave it in place.
