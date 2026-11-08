# Repository survey — 2026-11-07

Read-only local evidence; no private environment files inspected.

## git log --oneline -15

```text
50febf0 fix: stabilize Paddle SDK initialization and event subscriptions
35c80b6 fix: keep polling while Paddle subscription activation is pending
85c9343 fix: restore sandbox owner onboarding and recover stale billing modules
a174441 fix: route owners without a billing account to subscription onboarding
ed95140 test: align workforce lifecycle fixtures with onboarding policy
a400b65 Merge latest UI and workflow changes from ui/company-login-polish
bdeece0 Merge branch 'fix/v5-runtime-data-loading' into main
edf1b31 deploy
c8cacff style(auth): polish company login and clarify platform sign-in
1aa4cce docs(platform): record verified company overview and draft review
5321d7d feat(platform): show company resource counts and focus navigation
f89c8e2 style(platform): refine dashboard layout and responsive presentation
565d28d docs(spec43): record tested local login and draft review
bccbb95 feat(spec43): enable isolated local platform-owner password login
b826856 feat(spec42): support spreadsheet passwords for immediate staff login
```

## git status --short

```text
 M .gitignore
 M frontend/src/pages/Subscription/types.ts
?? backend/src/types/billingLifecycle.ts
?? design/billing-onboarding/
?? docs/plan-project/2026-11-06-analysis/
?? docs/plan-project/billing-onboarding/
?? frontend/src/pages/Subscription/onboarding/
?? specs-billing-onboarding/44-billing-decisions.md
?? specs-billing-onboarding/45-billing-dto-contract.md
?? specs-billing-onboarding/47-billing-setup-shell.md
?? specs-billing-onboarding/48-netlify-api-transport.md
?? specs-billing-onboarding/49-server-lifecycle-readiness.md
?? specs-billing-onboarding/50-billing-view-state.md
?? specs-billing-onboarding/51-billing-client-queries.md
?? specs-billing-onboarding/52-owner-signup-screen.md
?? specs-billing-onboarding/53-checkout-controller.md
?? specs-billing-onboarding/54-plan-selection-screen.md
?? specs-billing-onboarding/55-payment-handoff-screen.md
?? specs-billing-onboarding/56-activation-screen.md
?? specs-billing-onboarding/57-subscriber-billing-screen.md
?? specs-billing-onboarding/58-billing-recovery-screen.md
?? specs-billing-onboarding/59-owner-billing-routing.md
?? specs-billing-onboarding/60-billing-sql-proof.md
?? specs-billing-onboarding/61-sandbox-deployment-package.md
?? specs-billing-onboarding/62-billing-e2e-suite.md
?? specs-billing-onboarding/63-verification-pass.md
?? specs-billing-onboarding/AGENT-GUIDE.md
?? specs-billing-onboarding/ARCHITECTURE.md
?? specs-billing-onboarding/DESIGN-SYSTEM.md
?? specs-billing-onboarding/INVENTORY.md
?? specs-billing-onboarding/README.md
?? specs-billing-onboarding/inventory/45-billing-dto-contract.md
```

## git branch --show-current

```text
fix/v5-runtime-data-loading
```

## git rev-parse HEAD

```text
50febf0967647c913c45b0e575316c5815ca56c0
```

## git ls-tree -r --name-only HEAD specs-billing-onboarding

```text
specs-billing-onboarding/46-paddle-sdk-events.md
specs-billing-onboarding/PROGRESS.md
specs-billing-onboarding/inventory/46-paddle-sdk-events.md
```

## cat frontend/package.json

```text
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "npm run test:unit && npm run test:components",
    "test:unit": "node --experimental-strip-types --test tests/*.test.mjs e2e/*.test.mjs",
    "test:components": "vitest run",
    "test:e2e": "node e2e/run.mjs"
  },
  "dependencies": {
    "@fontsource-variable/geist": "^5.2.8",
    "@fontsource-variable/geist-mono": "^5.3.0",
    "@fontsource-variable/inter": "^5.3.0",
    "@fontsource-variable/manrope": "^5.3.0",
    "@fontsource/noto-sans-arabic": "^5.3.0",
    "@paddle/paddle-js": "^1.6.5",
    "@reduxjs/toolkit": "^2.11.2",
    "@tailwindcss/vite": "^4.2.2",
    "@tanstack/react-query": "^5.102.3",
    "@tanstack/react-query-devtools": "^5.94.5",
    "axios": "^1.13.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "date-fns-tz": "^3.2.0",
    "lucide-react": "^0.577.0",
    "qrcode.react": "^4.2.0",
    "radix-ui": "^1.4.3",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-hook-form": "^7.72.0",
    "react-is": "^19.2.8",
    "react-redux": "^9.2.0",
    "react-router-dom": "^7.13.1",
    "recharts": "^3.8.1",
    "shadcn": "^4.1.0",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.2",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.29.0",
    "@eslint/js": "^9.39.4",
    "@playwright/test": "1.58.2",
    "@rolldown/plugin-babel": "^0.2.1",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@types/babel__core": "^7.20.5",
    "@types/google.maps": "^3.66.7",
    "@types/node": "^24.12.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "babel-plugin-react-compiler": "^1.0.0",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "jsdom": "^29.1.1",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.57.0",
    "vite": "^8.0.1",
    "vitest": "^4.1.11"
  }
}
```

## cat backend/package.json

```text
{
  "name": "fyp",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "prisma generate && tsc -p tsconfig.json",
    "dev": "concurrently \"tsc -b --watch\" \"nodemon dist/app.js\"",
    "start": "node dist/app.js",
    "seed:demo": "tsx prisma/seed-demo.ts",
    "test:deletion": "tsx tests/deletion.integration.ts",
    "test:schedule-deletion": "tsx tests/scheduleDeletion.integration.ts",
    "verification:doctor": "tsx scripts/verificationDoctor.ts",
    "verification:report": "tsx scripts/verificationMigrationReport.ts",
    "test:verification:integration": "tsx tests/verification.integration.ts",
    "test:verification:lifecycle": "tsx tests/verification.lifecycle.integration.ts",
    "verification:benchmark": "tsx scripts/verificationEvaluatorBenchmark.ts",
    "verification:backfill": "tsx scripts/verificationBackfill.ts",
    "verification:spatial-evaluate": "tsx scripts/spatialEvaluation.ts",
    "verification:clef-evaluate": "tsx scripts/clefHeldOutEvaluation.ts",
    "verification:trace": "tsx scripts/verificationTrace.ts",
    "verification:latency:controlled": "tsx scripts/verificationControlledLatency.ts",
    "verification:clef-calibrate": "tsx scripts/clefCalibration.ts",
    "verification:clef-release": "tsx scripts/clefRelease.ts",
    "test:manager:integration": "tsx tests/managerOperations.integration.ts",
    "test:verification:buffered": "tsx tests/bufferedPhoto.integration.ts",
    "test:verification:photo-http": "tsx tests/directPhoto.http.integration.ts",
    "test:verification:latency": "tsx tests/directPhoto.latency.integration.ts",
    "test:staff-notifications:integration": "tsx tests/staffNotifications.integration.ts",
    "test:mobile:integration": "tsx tests/staffMobile.integration.ts",
    "test:review-closure": "tsx tests/reviewClosure.integration.ts",
    "test:performance:integration": "tsx tests/companyPerformance.integration.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^2.1.0",
    "@types/node": "^25.3.3",
    "@types/pg": "^8.18.0",
    "@types/tz-lookup": "^6.1.2",
    "@types/yauzl": "2.10.3",
    "concurrently": "^9.2.1",
    "prisma": "^7.5.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "vitest": "^4.1.11"
  },
  "dependencies": {
    "@paddle/paddle-node-sdk": "^3.10.0",
    "@prisma/adapter-pg": "^7.4.2",
    "@prisma/client": "^7.5.0",
    "bcrypt": "^6.0.0",
    "cloudinary": "^2.9.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "date-fns": "^4.4.0",
    "date-fns-tz": "^3.2.0",
    "dotenv": "^17.3.1",
    "exceljs": "4.4.0",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.1.1",
    "node-cron": "^4.2.1",
    "nodemon": "^3.1.14",
    "openai": "^7.5.0",
    "pg": "^8.20.0",
    "sharp": "^0.35.5",
    "tz-lookup": "^6.1.25",
    "yauzl": "3.2.0",
    "zod": "^4.3.6"
  }
}
```

## find . -maxdepth 3 -type d -not -path */node_modules/* -not -path */.git/*

```text
.
./scripts
./scripts/systemd
./screenshots
./investor-video
./investor-video/output
./investor-video/output/previews
./investor-video/node_modules
./investor-video/assets
./docs
./docs/implementation-evidence
./docs/implementation-evidence/auth-refresh
./docs/implementation-evidence/branding
./docs/implementation-evidence/enterprise
./docs/implementation-evidence/p2-b
./docs/implementation-evidence/feature-photos
./docs/research
./docs/audit
./docs/superpowers
./docs/superpowers/plans
./docs/superpowers/specs
./docs/product-discovery
./docs/phase-p0
./docs/dashboard-balance
./docs/planning
./docs/manager-web-design
./docs/manager-web-design/implemented
./docs/location-map
./docs/loading-skeleton
./docs/loading-skeleton/page-layouts
./docs/web-dashboard-redesign
./docs/implementation
./docs/implementation/followups
./docs/implementation/v5-review-acceptance
./docs/implementation/local-platform-evidence
./docs/implementation/v5-workforce-qa-evidence
./docs/implementation/research
./docs/implementation/v5-workforce-evidence
./docs/implementation/v5-billing-evidence
./docs/implementation/v5-locations-evidence
./docs/implementation/v5-shell-evidence
./docs/implementation/v5-import-evidence
./docs/implementation/planning
./docs/implementation/v5-dashboard-evidence
./docs/implementation/v5-parallel-qa-evidence
./docs/implementation/v5-operator-evidence
./docs/implementation/v5-setup-evidence
./docs/implementation/v5-review-evidence
./docs/implementation/v5-attendance-qa-evidence
./docs/implementation/previews
./docs/implementation/v5-settings-evidence
./docs/implementation/v5-setup-forms-evidence
./docs/implementation/v5-attendance-evidence
./docs/implementation/v5-evidence
./docs/implementation/v5-platform-evidence
./docs/implementation/v5-native-source-evidence
./docs/implementation/v5-help-evidence
./docs/implementation/v5-review-state-evidence
./docs/implementation/v5-operator-acceptance
./docs/implementation/v5-account-state-evidence
./docs/implementation/v5-auth-evidence
./docs/verification
./docs/verification/evidence
./docs/verification/android-latest-20261029
./docs/mobile-reference-ui
./docs/plan-project
./docs/plan-project/research
./docs/plan-project/planning
./docs/plan-project/sandbox-billing-20261105
./docs/plan-project/2026-11-06-analysis
./docs/plan-project/billing-onboarding
./.maps-original-backend
./.maps-original-backend/scripts
./.maps-original-backend/docs
./.maps-original-backend/docs/verification
./.maps-original-backend/var
./.maps-original-backend/verification-releases
./.maps-original-backend/prisma
./.maps-original-backend/prisma/migrations
./.maps-original-backend/tests
./.maps-original-backend/node_modules
./.maps-original-backend/src
./.maps-original-backend/src/config
./.maps-original-backend/src/middlewares
./.maps-original-backend/src/cron
./.maps-original-backend/src/utils
./.maps-original-backend/src/workers
./.maps-original-backend/src/prisma
./.maps-original-backend/src/modules
./.maps-original-backend/src/services
./.maps-original-backend/src/routes
./.maps-original-backend/src/types
./.maps-original-backend/src/validations
./.maps-original-backend/src/controllers
./.maps-original-backend/dist
./.maps-original-backend/dist/config
./.maps-original-backend/dist/middlewares
./.maps-original-backend/dist/cron
./.maps-original-backend/dist/utils
./.maps-original-backend/dist/workers
./.maps-original-backend/dist/prisma
./.maps-original-backend/dist/modules
./.maps-original-backend/dist/services
./.maps-original-backend/dist/routes
./.maps-original-backend/dist/types
./.maps-original-backend/dist/validations
./.maps-original-backend/dist/controllers
./.maps-original-backend/ops
./.ai
./.ai/plan-project
./.ai/plan-project/scripts
./.ai/plan-project/companions
./.ai/plan-project/templates
./.ai/plan-project/references
./.ai/plan-project/assets
./backend
./backend/config
./backend/scripts
./backend/docs
./backend/docs/verification
./backend/verification-releases
./backend/prisma
./backend/prisma/migrations
./backend/tests
./backend/node_modules
./backend/src
./backend/src/config
./backend/src/middlewares
./backend/src/cron
./backend/src/utils
./backend/src/workers
./backend/src/prisma
./backend/src/modules
./backend/src/services
./backend/src/routes
./backend/src/types
./backend/src/validations
./backend/src/controllers
./backend/dist
./backend/dist/config
./backend/dist/middlewares
./backend/dist/cron
./backend/dist/utils
./backend/dist/workers
./backend/dist/prisma
./backend/dist/modules
./backend/dist/services
./backend/dist/routes
./backend/dist/types
./backend/dist/validations
./backend/dist/controllers
./backend/ops
./.impeccable
./.impeccable/questions
./.impeccable/questions/seeds
./.impeccable/surfaces
./.impeccable/review
./.impeccable/review/spec28
./.impeccable/review/spec29
./.impeccable/live
./.impeccable/live/annotations
./.impeccable/live/sessions
./.notifications-original-frontend-mobile
./.notifications-original-frontend-mobile/android
./.notifications-original-frontend-mobile/android/gradle
./.notifications-original-frontend-mobile/android/.gradle
./.notifications-original-frontend-mobile/android/build
./.notifications-original-frontend-mobile/android/app
./.notifications-original-frontend-mobile/scripts
./.notifications-original-frontend-mobile/scripts/__pycache__
./.notifications-original-frontend-mobile/.expo
./.notifications-original-frontend-mobile/.expo/web
./.notifications-original-frontend-mobile/nginx
./.notifications-original-frontend-mobile/build-output
./.notifications-original-frontend-mobile/build-output/photo-fixes-reports
./.notifications-original-frontend-mobile/build-output/latest-fix-reports
./.notifications-original-frontend-mobile/build-output/retake-only-fix-reports
./.notifications-original-frontend-mobile/build-output/verification-ux-reports
./.notifications-original-frontend-mobile/build-output/session-upload-fix-reports
./.notifications-original-frontend-mobile/build-output/attendance-task-fix-reports
./.notifications-original-frontend-mobile/build-output/shutter-fix-reports
./.notifications-original-frontend-mobile/build-output/small-2.1.4-reports
./.notifications-original-frontend-mobile/build-output/direct-2.1.5-reports
./.notifications-original-frontend-mobile/build-output/ui-2.1.3-reports
./.notifications-original-frontend-mobile/build-output/area-qr-reports
./.notifications-original-frontend-mobile/build-output/previous-20261007
./.notifications-original-frontend-mobile/build-output/header-fix-reports
./.notifications-original-frontend-mobile/build-output/sequential-clef-evidence
./.notifications-original-frontend-mobile/modules
./.notifications-original-frontend-mobile/modules/spatial-tracking
./.notifications-original-frontend-mobile/modules/capture-quality
./.notifications-original-frontend-mobile/tests
./.notifications-original-frontend-mobile/src
./.notifications-original-frontend-mobile/src/i18n
./.notifications-original-frontend-mobile/src/auth
./.notifications-original-frontend-mobile/src/api
./.notifications-original-frontend-mobile/src/utils
./.notifications-original-frontend-mobile/src/queries
./.notifications-original-frontend-mobile/src/lib
./.notifications-original-frontend-mobile/src/navigation
./.notifications-original-frontend-mobile/src/verification
./.notifications-original-frontend-mobile/src/screens
./.notifications-original-frontend-mobile/src/components
./.notifications-original-frontend-mobile/assets
./.notifications-original-frontend-mobile/dist
./.notifications-original-frontend-mobile/dist/_expo
./.notifications-original-frontend-mobile/dist/assets
./node_modules
./.maps-original-frontend
./.maps-original-frontend/scripts
./.maps-original-frontend/nginx
./.maps-original-frontend/public
./.maps-original-frontend/public/photos
./.maps-original-frontend/public/brand
./.maps-original-frontend/tests
./.maps-original-frontend/node_modules
./.maps-original-frontend/src
./.maps-original-frontend/src/i18n
./.maps-original-frontend/src/store
./.maps-original-frontend/src/api
./.maps-original-frontend/src/pages
./.maps-original-frontend/src/queries
./.maps-original-frontend/src/lib
./.maps-original-frontend/src/hooks
./.maps-original-frontend/src/routes
./.maps-original-frontend/src/assets
./.maps-original-frontend/src/components
./.maps-original-frontend/dist
./.maps-original-frontend/dist/photos
./.maps-original-frontend/dist/assets
./.maps-original-frontend/dist/brand
./specs-billing-onboarding
./specs-billing-onboarding/inventory
./.agents
./.agents/skills
./.agents/skills/frontend-design
./frontend-mobile
./frontend-mobile/scripts
./frontend-mobile/scripts/__pycache__
./frontend-mobile/nginx
./frontend-mobile/build-output
./frontend-mobile/build-output/photo-fixes-reports
./frontend-mobile/build-output/heads-up-2.1.7-reports
./frontend-mobile/build-output/latest-fix-reports
./frontend-mobile/build-output/retake-only-fix-reports
./frontend-mobile/build-output/push-only-2.1.7-reports
./frontend-mobile/build-output/verification-ux-reports
./frontend-mobile/build-output/session-upload-fix-reports
./frontend-mobile/build-output/attendance-task-fix-reports
./frontend-mobile/build-output/shutter-fix-reports
./frontend-mobile/build-output/small-2.1.4-reports
./frontend-mobile/build-output/direct-2.1.5-reports
./frontend-mobile/build-output/ui-20261021-reports
./frontend-mobile/build-output/ui-2.1.3-reports
./frontend-mobile/build-output/area-qr-reports
./frontend-mobile/build-output/previous-20261007
./frontend-mobile/build-output/header-fix-reports
./frontend-mobile/build-output/sequential-clef-evidence
./frontend-mobile/build-output/notifications-2.1.6-reports
./frontend-mobile/modules
./frontend-mobile/modules/spatial-tracking
./frontend-mobile/modules/capture-quality
./frontend-mobile/tests
./frontend-mobile/src
./frontend-mobile/src/i18n
./frontend-mobile/src/auth
./frontend-mobile/src/api
./frontend-mobile/src/utils
./frontend-mobile/src/queries
./frontend-mobile/src/notifications
./frontend-mobile/src/lib
./frontend-mobile/src/navigation
./frontend-mobile/src/launch
./frontend-mobile/src/verification
./frontend-mobile/src/screens
./frontend-mobile/src/components
./frontend-mobile/assets
./frontend-mobile/assets/fonts
./frontend-mobile/dist
./frontend-mobile/dist/_expo
./frontend-mobile/dist/assets
./frontend-mobile/e2e
./.github
./.github/instructions
./.github/workflows
./specs
./specs/inventory
./.git
./frontend
./frontend/scripts
./frontend/nginx
./frontend/public
./frontend/public/photos
./frontend/public/brand
./frontend/tests
./frontend/node_modules
./frontend/src
./frontend/src/i18n
./frontend/src/store
./frontend/src/test
./frontend/src/api
./frontend/src/pages
./frontend/src/queries
./frontend/src/lib
./frontend/src/hooks
./frontend/src/routes
./frontend/src/assets
./frontend/src/components
./frontend/dist
./frontend/dist/photos
./frontend/dist/assets
./frontend/dist/brand
./frontend/e2e
./frontend/e2e/.artifacts
./design
./design/v4
./design/v4/stages
./design/v4/previews
./design/v4/.impeccable
./design/v4/assets
./design/v4/asset-prompts
./design/v1
./design/v1/assets
./design/qa
./design/v5
./design/v5/stages
./design/v5/previews
./design/v5/assets
./design/v2
./design/v2/assets
./design/v3
./design/v3/previews
./design/v3/assets
./design/billing-onboarding
./design/billing-onboarding/v1
./design/billing-onboarding/evidence
./design/billing-onboarding/revision-2
./design/billing-onboarding/v2
./design/billing-onboarding/assets
./design/billing-onboarding/v3
find: ‘./.maps-original-backend/var’: Permission denied
```
