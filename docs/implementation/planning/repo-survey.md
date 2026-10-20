# Implementation continuation survey — 2026-10-20

$ git log --oneline -15
c25dc1a Add project analysis and sample staff fixture
7d37761 18-oct
9f79b3d Simplify area templates and generate unique QR codes per task
8b0afdf Save progress on photo verification, schedule deletion, and staff workflows
28607c1 Checkpoint current web, mobile, maps, and verification improvements
21cc0ce 16 oct
8f0cef3 16-oct
405bf55 10oct
458e8e6 implement inventory verification workflow through steps 18
62ab18d implement inventory verification backend and manager setup
d298e51 fixed an ts error


$ git status --short
 M .github/workflows/ci.yml
 M .gitignore
 M DESIGN.md
 M backend/package.json
 M backend/src/controllers/managerOperations.controller.ts
 M backend/src/routes/manager.route.ts
 M frontend/src/i18n/managerTranslations.ts
 M frontend/src/pages/Dashboard/DashboardPage.tsx
?? .agents/skills/animate
?? .agents/skills/gpt-taste
?? .agents/skills/impeccable
?? .agents/skills/plan-project
?? .ai/
?? backend/src/services/companyPerformance.service.test.ts
?? backend/src/services/companyPerformance.service.ts
?? backend/tests/companyPerformance.integration.ts
?? design/
?? docs/OVERVIEW_PERFORMANCE.md
?? docs/plan-project/
?? frontend/src/pages/Dashboard/performance.css
?? frontend/src/pages/Dashboard/performance.ts
?? frontend/tests/performanceBrowser.mjs
?? investor-video/


package.json
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


backend/package.json
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
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.1.1",
    "node-cron": "^4.2.1",
    "nodemon": "^3.1.14",
    "openai": "^7.5.0",
    "pg": "^8.20.0",
    "sharp": "^0.35.5",
    "tz-lookup": "^6.1.25",
    "zod": "^4.3.6"
  }
}


frontend/package.json
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
    "test": "node --experimental-strip-types --test tests/*.test.mjs"
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
    "@rolldown/plugin-babel": "^0.2.1",
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
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.57.0",
    "vite": "^8.0.1"
  }
}


frontend-mobile/package.json
{
  "name": "frontend-mobile",
  "version": "2.1.7",
  "main": "index.ts",
  "scripts": {
    "start": "expo start --lan",
    "start:local": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "web:lan": "expo start --web --host lan",
    "build:web": "expo export --platform web",
    "typecheck": "tsc --noEmit",
    "validate:device-config": "node scripts/validate-device-config.mjs",
    "test": "tsx --test src/api/*.test.ts src/auth/*.test.ts src/notifications/*.test.ts src/queries/*.test.ts src/verification/*.test.ts tests/*.test.mjs",
    "build:android": "npm run validate:device-config && expo prebuild --platform android --no-install && expo run:android",
    "build:ios": "expo prebuild --platform ios --no-install && expo run:ios"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/netinfo": "^11.4.1",
    "@react-navigation/bottom-tabs": "^7.18.17",
    "@react-navigation/native": "^7.2.2",
    "@react-navigation/native-stack": "^7.14.10",
    "@tanstack/react-query": "^5.100.11",
    "axios": "^1.15.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "expo": "~54.0.35",
    "expo-application": "~7.0.8",
    "expo-asset": "12.0.13",
    "expo-build-properties": "~1.0.10",
    "expo-camera": "~17.0.10",
    "expo-constants": "~18.0.14",
    "expo-crypto": "~15.0.9",
    "expo-device": "~8.0.10",
    "expo-file-system": "~19.0.24",
    "expo-haptics": "~15.0.8",
    "expo-image-manipulator": "~14.0.8",
    "expo-image-picker": "~17.0.11",
    "expo-location": "~19.0.8",
    "expo-notifications": "~0.32.17",
    "expo-secure-store": "~15.0.8",
    "expo-status-bar": "~3.0.9",
    "expo-system-ui": "~6.0.9",
    "lucide-react-native": "^1.34.0",
    "nativewind": "4.1.23",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.0",
    "react-native-worklets": "0.5.1",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^3.4.19",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "@types/react-test-renderer": "^19.1.0",
    "babel-preset-expo": "~54.0.11",
    "react-refresh": "^0.14.2",
    "react-test-renderer": "19.1.0",
    "tsx": "^4.23.15",
    "typescript": "~5.9.2"
  },
  "private": true,
  "expo": {
    "autolinking": {
      "nativeModulesDir": "./modules"
    }
  }
}


Source tree
backend/src/app.ts
backend/src/config/paddle.ts
backend/src/controllers/area.controller.ts
backend/src/controllers/assignment.controller.ts
backend/src/controllers/attendance.controller.ts
backend/src/controllers/common.controller.ts
backend/src/controllers/enterpriseInquiry.controller.test.ts
backend/src/controllers/enterpriseInquiry.controller.ts
backend/src/controllers/location.controller.ts
backend/src/controllers/locationSchedule.controller.test.ts
backend/src/controllers/locationSchedule.controller.ts
backend/src/controllers/manager.controller.ts
backend/src/controllers/managerOperations.controller.ts
backend/src/controllers/mapConfig.controller.test.ts
backend/src/controllers/mapConfig.controller.ts
backend/src/controllers/paddleWebhook.controller.test.ts
backend/src/controllers/paddleWebhook.controller.ts
backend/src/controllers/staff.controller.ts
backend/src/controllers/subscription.controller.ts
backend/src/controllers/taskInstance.controller.ts
backend/src/controllers/taskInstance.guided.test.ts
backend/src/controllers/taskTemplate.controller.ts
backend/src/controllers/taskTemplate.creation.test.ts
backend/src/cron/attendanceCron.ts
backend/src/cron/attendanceStatusCron.ts
backend/src/cron/dailyTaskScheduler.ts
backend/src/cron/deletedMediaCron.ts
backend/src/cron/onceTaskScheduler.ts
backend/src/cron/staffNotificationCron.ts
backend/src/cron/startupCron.ts
backend/src/cron/taskInstanceWindow.test.ts
backend/src/cron/taskInstanceWindow.ts
backend/src/cron/taskReassignmentCron.ts
backend/src/cron/taskStatusCron.ts
backend/src/middlewares/auth.middleware.test.ts
backend/src/middlewares/auth.middleware.ts
backend/src/middlewares/authorize.middleware.ts
backend/src/middlewares/upload.middleware.ts
backend/src/prisma/prisma.ts
backend/src/routes/area.route.ts
backend/src/routes/assignment.route.ts
backend/src/routes/attendance.route.ts
backend/src/routes/common.route.ts
backend/src/routes/evidence.route.ts
backend/src/routes/location.route.ts
backend/src/routes/manager.route.ts
backend/src/routes/staff.route.ts
backend/src/routes/staffMobile.route.ts
backend/src/routes/staffNotification.route.ts
backend/src/routes/subscription.route.ts
backend/src/routes/taskInstance.route.ts
backend/src/routes/taskTemplate.route.ts
backend/src/routes/verification.readiness.test.ts
backend/src/routes/verification.route.ts
backend/src/routes/verificationException.route.ts
backend/src/services/area.service.ts
backend/src/services/auditLog.service.ts
backend/src/services/companyPerformance.service.test.ts
backend/src/services/companyPerformance.service.ts
backend/src/services/dashboardTrends.service.test.ts
backend/src/services/dashboardTrends.service.ts
backend/src/services/deletedMedia.service.test.ts
backend/src/services/deletedMedia.service.ts
backend/src/services/deletion.service.ts
backend/src/services/managerOperations.service.ts
backend/src/services/mobile/staffMobile.service.ts
backend/src/services/operationsOverviewAggregate.ts
backend/src/services/operationsScope.service.test.ts
backend/src/services/operationsScope.service.ts
backend/src/services/paddleFulfillment.service.test.ts
backend/src/services/paddleFulfillment.service.ts
backend/src/services/reviewList.service.test.ts
backend/src/services/reviewList.service.ts
backend/src/services/scheduleDeletion.service.ts
backend/src/services/schedulePreview.service.test.ts
backend/src/services/schedulePreview.service.ts
backend/src/services/staff-notifications/inbox.service.ts
backend/src/services/staff-notifications/policy.test.ts
backend/src/services/staff-notifications/policy.ts
backend/src/services/staff-notifications/push.provider.test.ts
backend/src/services/staff-notifications/push.provider.ts
backend/src/services/staff-notifications/reminders.service.ts
backend/src/services/staff-notifications/session.ts
backend/src/services/staff-notifications/worker.service.ts
backend/src/services/subscription.service.ts
backend/src/services/taskAssignment.service.test.ts
backend/src/services/taskAssignment.service.ts
backend/src/services/templateAssignment.service.test.ts
backend/src/services/templateAssignment.service.ts
backend/src/services/verification-v2/authorization.service.test.ts
backend/src/services/verification-v2/authorization.service.ts
backend/src/services/verification-v2/bufferedEvidence.service.ts
backend/src/services/verification-v2/bufferedPhoto.provider.test.ts
backend/src/services/verification-v2/bufferedPhoto.provider.ts
backend/src/services/verification-v2/bufferedPipeline.service.test.ts
backend/src/services/verification-v2/bufferedPipeline.service.ts
backend/src/services/verification-v2/captureSession.presence.test.ts
backend/src/services/verification-v2/captureSession.security.test.ts
backend/src/services/verification-v2/captureSession.service.ts
backend/src/services/verification-v2/cleanliness.service.ts
backend/src/services/verification-v2/cleanlinessRelease.test.ts
backend/src/services/verification-v2/cleanlinessRelease.ts
backend/src/services/verification-v2/clef.provider.test.ts
backend/src/services/verification-v2/clef.provider.ts
backend/src/services/verification-v2/clefConfiguration.ts
backend/src/services/verification-v2/clefPhoto.provider.test.ts
backend/src/services/verification-v2/clefPhoto.provider.ts
backend/src/services/verification-v2/compatibility.service.test.ts
backend/src/services/verification-v2/compatibility.service.ts
backend/src/services/verification-v2/completion.lifecycle.test.ts
backend/src/services/verification-v2/completion.service.ts
backend/src/services/verification-v2/contextPolicy.test.ts
backend/src/services/verification-v2/contextPolicy.ts
backend/src/services/verification-v2/contracts.test.ts
backend/src/services/verification-v2/contracts.ts
backend/src/services/verification-v2/coverage.service.ts
backend/src/services/verification-v2/deadline.service.ts
backend/src/services/verification-v2/directPhoto.service.test.ts
backend/src/services/verification-v2/directPhoto.service.ts
backend/src/services/verification-v2/directProcessing.ts
backend/src/services/verification-v2/dispatcher.test.ts
backend/src/services/verification-v2/dispatcher.ts
backend/src/services/verification-v2/duplicate.service.ts
backend/src/services/verification-v2/evaluatorBenchmark.test.ts
backend/src/services/verification-v2/evaluatorBenchmark.ts
backend/src/services/verification-v2/evaluators.test.ts
backend/src/services/verification-v2/evidence.service.ts
backend/src/services/verification-v2/evidenceBuffer.test.ts
backend/src/services/verification-v2/evidenceBuffer.ts
backend/src/services/verification-v2/evidenceBufferCleanup.ts
backend/src/services/verification-v2/evidenceContent.security.test.ts
backend/src/services/verification-v2/exception.service.ts
backend/src/services/verification-v2/imageCache.test.ts
backend/src/services/verification-v2/imageCache.ts
backend/src/services/verification-v2/inventoryPresets.test.ts
backend/src/services/verification-v2/inventoryPresets.ts
backend/src/services/verification-v2/inventorySnapshot.service.ts
backend/src/services/verification-v2/jobQueue.failure.test.ts
backend/src/services/verification-v2/jobQueue.service.ts
backend/src/services/verification-v2/latency.ts
backend/src/services/verification-v2/media.service.test.ts
backend/src/services/verification-v2/media.service.ts
backend/src/services/verification-v2/photoDecision.service.test.ts
backend/src/services/verification-v2/photoDecision.service.ts
backend/src/services/verification-v2/photoResultPolicy.test.ts
backend/src/services/verification-v2/photoResultPolicy.ts
backend/src/services/verification-v2/pipeline.persistence.test.ts
backend/src/services/verification-v2/pipeline.service.ts
backend/src/services/verification-v2/presence.service.ts
backend/src/services/verification-v2/provider.contract.test.ts
backend/src/services/verification-v2/provider.service.test.ts
backend/src/services/verification-v2/provider.service.ts
backend/src/services/verification-v2/qr.service.test.ts
backend/src/services/verification-v2/qr.service.ts
backend/src/services/verification-v2/quality.service.test.ts
backend/src/services/verification-v2/quality.service.ts
backend/src/services/verification-v2/readiness.service.test.ts
backend/src/services/verification-v2/readiness.service.ts
backend/src/services/verification-v2/retention.service.test.ts
backend/src/services/verification-v2/retention.service.ts
backend/src/services/verification-v2/retireContextPhotos.test.ts
backend/src/services/verification-v2/retireContextPhotos.ts
backend/src/services/verification-v2/reviewClosure.service.test.ts
backend/src/services/verification-v2/reviewClosure.service.ts
backend/src/services/verification-v2/reviewEvidenceSummary.test.ts
backend/src/services/verification-v2/reviewEvidenceSummary.ts
backend/src/services/verification-v2/rubrics.ts
backend/src/services/verification-v2/sequentialCapture.service.test.ts
backend/src/services/verification-v2/sequentialCapture.service.ts
backend/src/services/verification-v2/sequentialPipeline.test.ts
backend/src/services/verification-v2/sequentialPolicy.ts
backend/src/services/verification-v2/spatial.contracts.ts
backend/src/services/verification-v2/spatialEvaluation.test.ts
backend/src/services/verification-v2/spatialEvaluation.ts
backend/src/services/verification-v2/spatialIdentity.service.test.ts
backend/src/services/verification-v2/spatialIdentity.service.ts
backend/src/services/verification-v2/spatialPipeline.test.ts
backend/src/services/verification-v2/staffPhotoInstructions.test.ts
backend/src/services/verification-v2/staffPhotoInstructions.ts
backend/src/services/verification-v2/staffSubmission.service.test.ts
backend/src/services/verification-v2/staffSubmission.service.ts
backend/src/services/verification-v2/standardPrivacy.service.ts
backend/src/services/verification-v2/toiletViews.test.ts
backend/src/services/verification-v2/toiletViews.ts
backend/src/services/verification-v2/transaction.ts
backend/src/services/verification-v2/verificationPolicy.service.test.ts
backend/src/services/verification-v2/verificationPolicy.service.ts
backend/src/services/verification-v2/workerHealthPolicy.test.ts
backend/src/services/verification-v2/workerHealthPolicy.ts
backend/src/types/express.d.ts
backend/src/types/jwt.ts
backend/src/utils/ApiError.ts
backend/src/utils/ApiResponse.ts
backend/src/utils/auth.ts
backend/src/utils/cloudinary.ts
backend/src/utils/cookies.ts
backend/src/utils/dateTime.ts
backend/src/utils/geofencing.ts
backend/src/utils/scope.ts
backend/src/utils/syncAttendanceWindow.ts
backend/src/validations/area.validation.ts
backend/src/validations/attendance.validation.ts
backend/src/validations/location.validation.test.ts
backend/src/validations/location.validation.ts
backend/src/validations/manager.validation.ts
backend/src/validations/staff.validation.ts
backend/src/validations/taskTemplate.validation.ts
frontend/src/App.css
frontend/src/App.tsx
frontend/src/api/auth.ts
frontend/src/api/client.ts
frontend/src/assets/area-floor.webp
frontend/src/assets/area-mirror.webp
frontend/src/assets/area-sink.webp
frontend/src/assets/auth-cleaning-team.webp
frontend/src/assets/cleaning-operations-1200.webp
frontend/src/assets/cleaning-operations-800.webp
frontend/src/assets/cleaning-operations.jpg
frontend/src/assets/hero-cleaning-v2.webp
frontend/src/assets/hero-cleaning-v3.webp
frontend/src/assets/hero.png
frontend/src/assets/react.svg
frontend/src/assets/vite.svg
frontend/src/components/common/AttentionList.tsx
frontend/src/components/common/AuthShell.tsx
frontend/src/components/common/AuthWorkspacePreview.tsx
frontend/src/components/common/BrandLogo.tsx
frontend/src/components/common/DataTable.tsx
frontend/src/components/common/DeleteButton.tsx
frontend/src/components/common/EmptyState.tsx
frontend/src/components/common/FilterBar.tsx
frontend/src/components/common/LanguageChoice.tsx
frontend/src/components/common/LoadingSkeleton.tsx
frontend/src/components/common/LoadingSpinner.tsx
frontend/src/components/common/OperationStatus.tsx
frontend/src/components/common/OperationalSummary.tsx
frontend/src/components/common/PageHeader.tsx
frontend/src/components/common/PageLoadingSkeleton.tsx
frontend/src/components/common/Pagination.tsx
frontend/src/components/common/ScopeFilters.tsx
frontend/src/components/common/StatCard.tsx
frontend/src/components/common/StatusBadge.tsx
frontend/src/components/common/SurfaceCard.tsx
frontend/src/components/common/TaskWorker.tsx
frontend/src/components/common/WorkProgress.tsx
frontend/src/components/common/WorkspaceBrand.tsx
frontend/src/components/common/WorkspaceTheme.ts
frontend/src/components/common/auth-preview.css
frontend/src/components/common/brand.css
frontend/src/components/common/loading-skeleton.css
frontend/src/components/common/loadingLayout.ts
frontend/src/components/landing/ConsolePreview.tsx
frontend/src/components/landing/DashboardPanel.tsx
frontend/src/components/landing/GeofenceDiagram.tsx
frontend/src/components/landing/LifecycleStrip.tsx
frontend/src/components/landing/VerificationDiagram.tsx
frontend/src/components/layout/DashboardLayout.tsx
frontend/src/components/layout/PublicLayout.tsx
frontend/src/components/layout/PublicNavbar.tsx
frontend/src/components/layout/Sidebar.tsx
frontend/src/components/marketing/MarketingCTA.tsx
frontend/src/components/marketing/ProductVisuals.tsx
frontend/src/components/onboarding/WorkspaceGate.tsx
frontend/src/components/ui/badge-variants.ts
frontend/src/components/ui/badge.tsx
frontend/src/components/ui/button-variants.ts
frontend/src/components/ui/button.tsx
frontend/src/components/ui/card.tsx
frontend/src/components/ui/dialog.tsx
frontend/src/components/ui/input.tsx
frontend/src/components/ui/textarea.tsx
frontend/src/hooks/useAuth.ts
frontend/src/hooks/useDebouncedValue.ts
frontend/src/hooks/useOnline.ts
frontend/src/i18n/LanguageProvider.tsx
frontend/src/i18n/context.ts
frontend/src/i18n/managerTranslations.ts
frontend/src/i18n/translations.ts
frontend/src/index.css
frontend/src/lib/attendance.ts
frontend/src/lib/invalidateWorkspace.ts
frontend/src/lib/onboarding.ts
frontend/src/lib/paddle.ts
frontend/src/lib/utils.ts
frontend/src/main.tsx
frontend/src/marketing.css
frontend/src/pages/Area/AreaDailyWork.tsx
frontend/src/pages/Area/AreaDetailPage.tsx
frontend/src/pages/Area/AreaSetupPage.tsx
frontend/src/pages/Area/AreaTemplateForm.tsx
frontend/src/pages/Area/InventorySelector.tsx
frontend/src/pages/Area/LocationAreasTab.tsx
frontend/src/pages/Area/MigrationSetup.tsx
frontend/src/pages/Area/StandardPhotoPreview.tsx
frontend/src/pages/Area/TemplateInventoryEditor.tsx
frontend/src/pages/Area/api.ts
frontend/src/pages/Area/queries.ts
frontend/src/pages/Area/standardPrivacy.ts
frontend/src/pages/Area/types.ts
frontend/src/pages/Assignment/api.ts
frontend/src/pages/Assignment/queries.ts
frontend/src/pages/Attendance/AttendancePage.tsx
frontend/src/pages/Attendance/api.ts
frontend/src/pages/Attendance/queries.ts
frontend/src/pages/Dashboard/DashboardPage.tsx
frontend/src/pages/Dashboard/performance.css
frontend/src/pages/Dashboard/performance.ts
frontend/src/pages/Exceptions/DecisionForm.tsx
frontend/src/pages/Exceptions/ExceptionDetailPage.tsx
frontend/src/pages/Exceptions/ExceptionInboxPage.tsx
frontend/src/pages/Exceptions/ReviewSummary.tsx
frontend/src/pages/Exceptions/actionPresentation.ts
frontend/src/pages/Exceptions/api.ts
frontend/src/pages/Exceptions/performancePresentation.ts
frontend/src/pages/Exceptions/queries.ts
frontend/src/pages/Exceptions/reviewDiagnosis.ts
frontend/src/pages/Exceptions/reviewPresentation.ts
frontend/src/pages/Exceptions/types.ts
frontend/src/pages/Landing/FeaturesPage.tsx
frontend/src/pages/Landing/LandingPage.tsx
frontend/src/pages/Location/LocationDetailPage.tsx
frontend/src/pages/Location/LocationFormDialog.tsx
frontend/src/pages/Location/LocationMapPicker.tsx
frontend/src/pages/Location/LocationOverview.tsx
frontend/src/pages/Location/LocationsPage.tsx
frontend/src/pages/Location/api.ts
frontend/src/pages/Location/components/LocationScheduleTab.tsx
frontend/src/pages/Location/components/LocationTemplatesTab.tsx
frontend/src/pages/Location/currentPosition.ts
frontend/src/pages/Location/location-map.css
frontend/src/pages/Location/mapsSdk.ts
frontend/src/pages/Location/queries.ts
frontend/src/pages/Location/scheduleTypes.ts
frontend/src/pages/Location/types.ts
frontend/src/pages/Login/LoginPage.tsx
frontend/src/pages/Login/api.ts
frontend/src/pages/Login/queries.ts
frontend/src/pages/Login/types.ts
frontend/src/pages/Manager/OperationsState.tsx
frontend/src/pages/Manager/OwnerTrends.tsx
frontend/src/pages/Manager/TodayStatusPage.tsx
frontend/src/pages/Manager/operations.ts
frontend/src/pages/Managers/ManagerFormDialog.tsx
frontend/src/pages/Managers/ManagersPage.tsx
frontend/src/pages/Managers/api.ts
frontend/src/pages/Managers/queries.ts
frontend/src/pages/Managers/types.ts
frontend/src/pages/Pricing/ChoosePlanPage.tsx
frontend/src/pages/Pricing/EnterprisePlan.tsx
frontend/src/pages/Pricing/PaddlePricing.tsx
frontend/src/pages/Pricing/PricingPage.tsx
frontend/src/pages/Pricing/WelcomePage.tsx
frontend/src/pages/Pricing/tiers.ts
frontend/src/pages/Signup/SignUpPage.tsx
frontend/src/pages/Signup/api.ts
frontend/src/pages/Signup/queries.ts
frontend/src/pages/Signup/types.ts
frontend/src/pages/Staff/StaffCreateDialog.tsx
frontend/src/pages/Staff/StaffDetailPage.tsx
frontend/src/pages/Staff/StaffPage.tsx
frontend/src/pages/Staff/StaffPerformanceIssues.tsx
frontend/src/pages/Staff/api.ts
frontend/src/pages/Staff/queries.ts
frontend/src/pages/Subscription/SubscriptionPage.tsx
frontend/src/pages/Subscription/api.ts
frontend/src/pages/Subscription/queries.ts
frontend/src/pages/Subscription/types.ts
frontend/src/pages/Task/api.ts
frontend/src/pages/Task/components/AreaSubmissionsPanel.tsx
frontend/src/pages/Task/components/TaskQr.tsx
frontend/src/pages/Task/components/TaskScheduleWizard.tsx
frontend/src/pages/Task/queries.ts
frontend/src/pages/Task/taskAssignee.ts
frontend/src/pages/Task/taskScheduleForm.ts
frontend/src/pages/Task/types.ts
frontend/src/pages/Verification/ProtectedEvidence.tsx
frontend/src/pages/Verification/VerificationHistoryPage.tsx
frontend/src/pages/Verification/api.ts
frontend/src/pages/Verification/presentation.ts
frontend/src/pages/Verification/types.ts
frontend/src/queries/auth.ts
frontend/src/routes/workspacePages.tsx
frontend/src/store/slices/authSlice.ts
frontend/src/store/store.ts
frontend/src/workspace-refresh.css
frontend/src/workspace.css
frontend-mobile/src/api/client.test.ts
frontend-mobile/src/api/client.ts
frontend-mobile/src/api/serverAddress.ts
frontend-mobile/src/api/startCleaning.test.ts
frontend-mobile/src/api/startCleaning.ts
frontend-mobile/src/auth/AuthContext.tsx
frontend-mobile/src/auth/logoutQueue.test.ts
frontend-mobile/src/auth/logoutQueue.ts
frontend-mobile/src/auth/pendingLogout.ts
frontend-mobile/src/auth/sessionStorage.test.ts
frontend-mobile/src/auth/sessionStorage.ts
frontend-mobile/src/components/AttendanceCamera.tsx
frontend-mobile/src/components/EmptyState.tsx
frontend-mobile/src/components/FactRow.tsx
frontend-mobile/src/components/LanguageChoice.tsx
frontend-mobile/src/components/LoadingState.tsx
frontend-mobile/src/components/PhotoCaptureControls.tsx
frontend-mobile/src/components/PhotoGuide.tsx
frontend-mobile/src/components/ScreenHeader.tsx
frontend-mobile/src/components/StaffBrand.tsx
frontend-mobile/src/components/StatCard.tsx
frontend-mobile/src/components/StatusBadge.tsx
frontend-mobile/src/components/TaskCard.tsx
frontend-mobile/src/components/ui/badge.tsx
frontend-mobile/src/components/ui/button.tsx
frontend-mobile/src/components/ui/card.tsx
frontend-mobile/src/components/ui/icon.tsx
frontend-mobile/src/components/ui/input.tsx
frontend-mobile/src/components/ui/separator.tsx
frontend-mobile/src/components/ui/skeleton.tsx
frontend-mobile/src/components/ui/text.tsx
frontend-mobile/src/config.ts
frontend-mobile/src/i18n/LanguageProvider.tsx
frontend-mobile/src/i18n/translations.ts
frontend-mobile/src/lib/utils.ts
frontend-mobile/src/navigation/AppNavigator.tsx
frontend-mobile/src/navigation/StaffTabs.tsx
frontend-mobile/src/notifications/NotificationNavigation.tsx
frontend-mobile/src/notifications/NotificationProvider.tsx
frontend-mobile/src/notifications/api.ts
frontend-mobile/src/notifications/channels.test.ts
frontend-mobile/src/notifications/channels.ts
frontend-mobile/src/notifications/model.test.ts
frontend-mobile/src/notifications/model.ts
frontend-mobile/src/notifications/native.ts
frontend-mobile/src/queries/mobileWork.test.ts
frontend-mobile/src/queries/mobileWork.ts
frontend-mobile/src/queries/staff.ts
frontend-mobile/src/screens/HelpScreen.tsx
frontend-mobile/src/screens/HomeScreen.tsx
frontend-mobile/src/screens/LoginScreen.tsx
frontend-mobile/src/screens/StartTaskScreen.tsx
frontend-mobile/src/screens/TasksScreen.tsx
frontend-mobile/src/screens/verification/SpatialDiagnosticScreen.tsx
frontend-mobile/src/screens/verification/VerificationProgress.tsx
frontend-mobile/src/screens/verification/VerificationScreen.tsx
frontend-mobile/src/types.ts
frontend-mobile/src/utils/attendance.ts
frontend-mobile/src/utils/format.ts
frontend-mobile/src/utils/taskStatus.ts
frontend-mobile/src/utils/upload.ts
frontend-mobile/src/verification/api.ts
frontend-mobile/src/verification/auth.test.ts
frontend-mobile/src/verification/captureAccount.ts
frontend-mobile/src/verification/capturePolicy.ts
frontend-mobile/src/verification/errors.test.ts
frontend-mobile/src/verification/errors.ts
frontend-mobile/src/verification/feedback.test.ts
frontend-mobile/src/verification/feedback.ts
frontend-mobile/src/verification/fileUri.test.ts
frontend-mobile/src/verification/fileUri.ts
frontend-mobile/src/verification/location.test.ts
frontend-mobile/src/verification/location.ts
frontend-mobile/src/verification/policy.test.ts
frontend-mobile/src/verification/policy.ts
frontend-mobile/src/verification/presentation.test.ts
frontend-mobile/src/verification/presentation.ts
frontend-mobile/src/verification/sequentialPolicy.test.ts
frontend-mobile/src/verification/spatialSession.test.ts
frontend-mobile/src/verification/spatialSession.ts
frontend-mobile/src/verification/spatialTypes.ts
frontend-mobile/src/verification/taskPresentation.ts
frontend-mobile/src/verification/taskStatus.test.ts
frontend-mobile/src/verification/types.ts
backend/prisma/migrations/20260902120000_baseline/migration.sql
backend/prisma/migrations/20260911000100_subscription_plans/migration.sql
backend/prisma/migrations/20260911000200_rename_subscription_plans/migration.sql
backend/prisma/migrations/20260911000300_paddle_fulfillment/migration.sql
backend/prisma/migrations/20260911000400_billing_status_default/migration.sql
backend/prisma/migrations/20260917000000_permanent_deletion_media/migration.sql
backend/prisma/migrations/20260924000100_enterprise_inquiries/migration.sql
backend/prisma/migrations/202610040001_inventory_verification/migration.sql
backend/prisma/migrations/202610040002_verification_foundation_constraints/migration.sql
backend/prisma/migrations/202610040003_verification_history_bindings/migration.sql
backend/prisma/migrations/202610060001_verification_lifecycle/migration.sql
backend/prisma/migrations/202610060002_verification_followup/migration.sql
backend/prisma/migrations/202610070001_spatial_observations/migration.sql
backend/prisma/migrations/202610100001_sequential_capture/migration.sql
backend/prisma/migrations/202610130001_direct_photo_processing/migration.sql
backend/prisma/migrations/20261017000100_staff_notifications/migration.sql
backend/prisma/migrations/20261018000100_staff_event_alert_channels/migration.sql
backend/prisma/migrations/migration_lock.toml
backend/prisma/schema.prisma
backend/prisma/seed-demo.ts