# Stack and libraries checked, 2026-11-11

All read from the installed packages in `frontend-mobile/node_modules` and `backend/node_modules` on 2026-11-11, or from the npm registry where stated.

| Item | Version or export | Source checked |
|---|---|---|
| Expo | `~54.0.35` | `frontend-mobile/package.json` |
| React Native | `0.81.5` | same |
| React | `19.1.0` | same |
| React Navigation | bottom-tabs `^7.18.17`, native-stack `^7.14.10`, native `^7.2.2` | same |
| TanStack Query | `^5.100.11` | same |
| Reanimated | `~4.1.1`, exports `useReducedMotion` | `react-native-reanimated/lib/typescript/index.d.ts` |
| react-native-svg | `15.12.1` | `package.json` |
| lucide-react-native | `^1.34.0` (installed 1.34.0); icon files are `.mjs` under `dist/esm/icons/`. `History` icon does not exist in this version; use `RotateCcwClock`. `CircleHelp` is `CircleQuestionMark`. | `node_modules/lucide-react-native/dist/esm/icons/` |
| expo-camera | `getCameraPermissionsAsync`, `useCameraPermissions` | `expo-camera/build/index.d.ts` |
| expo-location | `getForegroundPermissionsAsync` | `expo-location/build/Location.d.ts` |
| expo-application | `nativeApplicationVersion` | `expo-application/build/Application.d.ts` |
| expo-haptics | `~15.0.8`, already used in `HomeScreen.tsx` and `TaskCard.tsx` | `package.json` |
| React Native `Modal`, `AccessibilityInfo` | exported | `react-native/index.js.flow` |
| react-test-renderer | `19.1.0` (devDependency) | `package.json` |
| tsx | `^4.23.15`, Node `v24.14.1` (supports glob patterns in `--test`) | `package.json`, `node --version` |
| Backend test runner | Vitest `^4.1.11`; Express `^5.2.1`; no supertest | `backend/package.json` |

## Fonts

| File | Source | Version |
|---|---|---|
| `Inter-Bold.otf`, `Inter-ExtraBold.otf` | Debian `fonts-inter` at `/usr/share/fonts/opentype/inter/` on the planning machine, or the official Inter 4.0 release from rsms/inter | `fontversion 262144` (4.0), identical to the bundled `Inter-Regular.otf` (`fc-query`) |
| `Manrope_700Bold.ttf`, `Manrope_800ExtraBold.ttf` | npm `@expo-google-fonts/manrope@0.4.2` tarball, paths `package/700Bold/` and `package/800ExtraBold/`, licence `package/LICENSE_FONT` (SIL OFL) | `npm view` and `npm pack`, 2026-11-11. 0.4.3 exists (modified 2026-10-28); 0.4.2 is pinned because it is older than two weeks. |

The plan copies font files into `frontend-mobile/assets/fonts/`; it adds no font package as a dependency.

## End-to-end harness

Playwright is installed in `frontend/` (used by the web suite). `frontend-mobile/scripts/check-staff-ui.mjs` already drives the Expo web export with `playwright-core`. The e2e spec adds `@playwright/test` to `frontend-mobile` devDependencies at the same major version as `frontend/` uses.
