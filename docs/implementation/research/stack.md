# Existing stack evidence — 2026-10-20

Source: package manifests recorded in planning/repo-survey.md; installed backend/vitest.config.ts and backend/tsconfig.json; real source files in that survey. React 19/Vite/Query/Redux, Expo 54/React Native, Express 5/Zod/Prisma 7/PostgreSQL, Paddle and Cloudinary remain. No new state library, queue, workspace migration or framework rewrite. Apply house layering incrementally to changed boundaries, preserving working layouts and APIs.

Cloudinary authenticated delivery verified against https://cloudinary.com/documentation/control_access_to_media. Use authenticated uploads plus authorized server reads, never return signed delivery links. Existing media.service.ts provides the bounded download pattern; attendance must use a separate identifier namespace. Live provider behavior and cache invalidation require a controlled qualification run, not source inspection.
