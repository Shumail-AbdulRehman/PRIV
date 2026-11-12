# Spec 60 inventory: e2e build cache isolation

- `frontend-mobile/playwright.config.ts` gives the e2e web build its own temp folder (`<system temp>/hygene-staff-e2e/tmp`, set as `TMPDIR`, `TMP`, `TEMP` in `webServer.env`) and builds with `--clear`. Metro's cache (`<TMPDIR>/metro-cache`) is therefore never shared with a normal `expo export`. Use the same pattern for any other build that inlines `EXPO_PUBLIC_*` values for a test.
- Source guard: `frontend-mobile/tests/e2eBuildIsolation.test.mjs` (loads the real config; asserts the temp folder, `--clear`, output folder and fixture host).
