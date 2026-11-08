# Updated repository survey — 2026-11-06

## git rev-parse HEAD

```text
35c80b6a6c0dd4bb549f69d43b2544db2ffee7a0
```

## git log --oneline -15

```text
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
7f6149a docs(spec42): record draft review and final verification handoff
```

## git status --short

```text
?? docs/plan-project/2026-11-06-analysis/
```

## package.json

```json
{
  "name": "mern-heroku-backend-launcher",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": "20.x"
  },
  "scripts": {
    "heroku-prebuild": "npm ci --include=dev --prefix backend",
    "heroku-postbuild": "npm run build --prefix backend",
    "start": "npm start --prefix backend"
  }
}

```

## backend/package.json

```json
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

## frontend/package.json

```json
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

## Tree (up to three directory levels)

- .agents
  - .agents/skills
- .ai
  - .ai/plan-project
- .github
  - .github/instructions
  - .github/workflows
- .impeccable
  - .impeccable/questions
  - .impeccable/review
  - .impeccable/surfaces
- backend
  - backend/config
  - backend/docs
  - backend/ops
  - backend/prisma
  - backend/scripts
  - backend/src
  - backend/tests
  - backend/var
  - backend/verification-releases
- design
  - design/billing-onboarding
  - design/qa
  - design/v1
  - design/v2
  - design/v3
  - design/v4
  - design/v5
- docs
  - docs/audit
  - docs/dashboard-balance
  - docs/implementation
  - docs/implementation-evidence
  - docs/loading-skeleton
  - docs/location-map
  - docs/manager-web-design
  - docs/mobile-reference-ui
  - docs/phase-p0
  - docs/plan-project
  - docs/planning
  - docs/product-discovery
  - docs/research
  - docs/superpowers
  - docs/verification
  - docs/web-dashboard-redesign
- frontend
  - frontend/e2e
  - frontend/nginx
  - frontend/public
  - frontend/scripts
  - frontend/src
  - frontend/tests
- frontend-mobile
  - frontend-mobile/.expo
  - frontend-mobile/android
  - frontend-mobile/assets
  - frontend-mobile/build-output
  - frontend-mobile/e2e
  - frontend-mobile/modules
  - frontend-mobile/nginx
  - frontend-mobile/scripts
  - frontend-mobile/src
  - frontend-mobile/tests
- investor-video
  - investor-video/assets
  - investor-video/output
- screenshots
- scripts
  - scripts/systemd
- specs
  - specs/inventory

## Active surface truth

- Current source workspace-refresh.css uses primary rgb(37 86 216), light slate surfaces, Inter. Brand mark is existing blue SVG. Earlier DESIGN.md teal text is stale for this surface.
- Confirmed live target: Netlify + Heroku, sandbox only. Compose packaging is not assumed to be the live failure.
- Existing specs are 00–43; any later additive implementation specs must start at 44 and preserve original acceptance statuses.
- New design artifacts use design/billing-onboarding/v1–v3 to preserve previous approved design/v1–v5.