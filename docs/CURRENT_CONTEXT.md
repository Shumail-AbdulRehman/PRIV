# Hygene Ops: current project context

Last updated 2026-11-09, on branch `saas-onboarding`. This is a snapshot from a code review plus the onboarding implementation work below, so check a claim against the code before relying on it. Update this file when something below changes.

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
| `specs-billing-checkout-repair/` | Current Paddle checkout repair plan (64 to 85). Only 64 is done |
| `design/` | Design prototypes, not production behaviour |
| `docs/` | Reports, plans and evidence. Most of it is historical |

The three apps have separate installs and lockfiles. The root `package.json` is only a Heroku backend launcher.

Deployment: web on Netlify, with `frontend/public/_redirects` proxying `/api/*` to the Heroku backend. Docker Compose is an alternative path. The live settings have not been inspected.

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

1. **Tasks cannot be finished.** `verificationReleaseConfiguration()` in `cleanlinessRelease.ts` hard-codes `privacyAssessment:false`, so new photos are refused. Task start has no such check, so staff start work and then hit "Task photos are unavailable". The only exit is a manager waiving each requirement. Do not just flip the flag: the direct upload path has no privacy step and marks stored photos `NOT_REQUIRED` (`directPhoto.service.ts:93`).
2. **One Paddle failure can lock an owner out (source).** A failed customer or transaction create leaves `*_RESERVED` with no `*_READY`, and every retry gets a 409. No code clears it. Definite rejections are treated the same as timeouts in `callProvider`.
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

Known unverified: real Paddle payments, the live Heroku/Netlify configuration, physical phones.

## Signup, plan and checkout plan (current work)

`specs-saas-onboarding/` is the active plan: 44 specs for `gpt-6.1-sol`. Start at its `README.md`. Status is in its `PROGRESS.md`. Specs 00–03 are done; spec 04 is the next lowest-numbered eligible spec. Spec 01 added the lifecycle/outcome contract. Spec 02 added safe structured request-error logging and correlation IDs, validated proxy hops, and guarded Express 5 listen failures so a bind error requests exit 1 without a successful-listen message or startup callback. Spec 03 added `pages/Onboarding/FlowShell.tsx` and scoped `flow.css`: aurora background, paper/stacked sheets, progress, responsive panel slot, focus handling and reduced motion. It remains additive; future screen specs adopt it, spec 04 adds Urdu copy and spec 05 replaces the logo asset. Provider-call logging still belongs to spec 08. Open problems 2, 3, 5 and 6 above remain until their implementation specs pass. Deploy nothing until spec 43 passes.

The planning baseline is committed on `saas-onboarding` as `9052ea5`. The planner unblocked spec 01 by allowing missing onboarding fields until spec 36 sends them and adding a narrow test-only scope exception. The client now parses a missing step as `null`, validates confirm/reconcile outcomes with optional company scope, and ignores legacy catalog trial metadata. The checkout replacement flag stays optional on the wire until spec 26 sends it, and parses to `false` when absent. Server step derivation, provider changes and HTTP wiring remain with their later specs.

It replaces Codex's unexecuted `specs-billing-checkout-repair/`. Design is approved at `design/saas-onboarding/v3/index.html`: Fresh aurora background, Mint sky side panel, Checkbox logo. Research and planning are in `docs/plan-project/saas-onboarding/`.

User decisions, 2026-11-09: free trial removed; Paddle inline card form with sandbox test cards; activation by webhook plus a server read of the exact transaction; email-and-password login with no account-type dropdown; owners may change plan by cancelling the unpaid draft; a dry-run-first script removes trials from sandbox prices.

Approval needed when run: spec 14 (real Paddle sandbox probe, and reading the stuck company's billing rows) and spec 16 (removing trials from sandbox prices).

**Open decision:** launch with photo verification (needs real privacy screening and validation) or without it (staff need another way to finish). Recommended: launch attendance and scheduling first.

## Design decisions (2026-11-09)

Register is `product`. Blue (`#2556d8`) is the shipped primary, not teal. North Star is "The Daily Worksheet". Spoken instructions were removed from the docs because `expo-speech` is not installed. Non-visual UI rules live in `docs/PRODUCT_UI_RULES.md`. Impeccable reads `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json`. Spec 03 now supplies the approved onboarding colours in the isolated shared shell; screens adopt it in their later specs. The logo asset rollout remains spec 05.

## Commands

Run tests with the database and dotenv pointed nowhere, so they cannot touch real data:

```bash
export DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null
cd backend && npx tsc --noEmit -p tsconfig.json && npx vitest run --maxWorkers=2
cd frontend && npx tsc -b --noEmit && npm run test:unit && npx vitest run --maxWorkers=2 && npm run lint
cd frontend-mobile && npx tsc --noEmit && npm test
python3 .ai/plan-project/scripts/validate-specs.py specs-billing-checkout-repair
```

Last backend result (2026-11-09, spec 02): type check clean and build passed; **1,642 passed and 7 skipped** (the skipped SQL tests need `LAUNCH_PERSISTENCE_TEST_DATABASE_URL`). The total includes 26 logger and 60 route/startup tests. The build printed a Prisma upgrade advisory. No real database or Paddle checks ran; the occupied-port check used local HTTP and an injected exit function. Backend has no lint script.

Spec validation (spec 03): 44 specs, 0 errors, 52 nonblocking planning warnings, including the missing-issue warnings required by this run's no-issue/no-PR override.

Last web result (2026-11-09, spec 03): type check and lint clean, build passed; **81 Node and 860 Vitest tests passed**, including **28** focused shell cases (0 failures/skips). A temporary isolated Vite/Chromium component preview verified 25 responsive/RTL/reduced-motion cases, keyboard focus/draft continuity and 10 inspected captures; no application end-to-end suite, provider or database was used. Frontend builds report a plugin-timing advisory; Node tests report the mobile translation module-type warning. Mobile's prior result is 115 passed. Backend/mobile were not rerun for frontend-only spec 03.

## Working rules

- Never print or commit secrets. Private `.env` files exist in the root, `backend/`, `frontend/` and `frontend-mobile/`.
- `*.md` is git-ignored by default. A new Markdown file that should be tracked needs a `!path` exception in `.gitignore`.
- Do not bypass the photo qualification gate, clear billing reservations, or grant access outside the signed webhook.
- Do not commit, deploy, migrate an application database or touch a provider account unless the user asks.
- The working tree holds uncommitted design, planning and audit work. Leave it in place.
