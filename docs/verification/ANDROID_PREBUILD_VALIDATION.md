# Android testing APK validation

Date: 2026-10-07. Status: source checks pass; native compilation and APK packaging are pending environmental blockers. This document does not certify an APK or physical washroom accuracy.

## Scope and preservation

Read IMPLEMENTATION_15_18.md, RELEASE_VERIFICATION_19.md and SPATIAL_FIXTURE_VERIFICATION.md; reviewed the existing uncommitted changes before edits. Changes are confined to mobile configuration, dependency compatibility/security patches, lifecycle/authentication fixes and regression coverage. No production migration, Step 20/21 cutover, architecture change, automatic spatial acceptance or automatic cleanliness passing was performed.

There was no frontend-mobile/android directory in this checkout. Generated it with `npx expo prebuild --platform android --no-install`, never `--clean`. Subsequent prebuild reused that directory. Custom modules remain in modules/capture-quality and modules/spatial-tracking and are registered by Expo autolinking. The older temporary project used a reduced module-only build and must not be reused as proof of full app compilation.

## Fixes

- Pin react-native-worklets to the SDK-required 0.5.1 instead of resolving the incompatible 0.5.2.
- Restore Expo dependency validation in start scripts. Expo prebuild now uses native run commands for Android/iOS.
- Add SDK-compatible expo-system-ui so the configured light appearance works on Android.
- Block RECORD_AUDIO explicitly; another plugin had reintroduced it despite the camera plugin's recording setting. The generated manifest contains its removal directive.
- Apply compatible dependency updates, including Axios 1.20.0 and shell-quote 1.12.0, removing the reported critical shell-quote advisory. No forced SDK or NativeWind/Tailwind major migration.
- Unmount the QR camera in background, remount in foreground, handle permanently denied permission via Settings, lock scan callbacks synchronously, and keep the stable native callback connected to current props/state.
- Make spatial startup depend on actual capture eligibility and lifecycle rather than an idle state that could strand a cancelled startup. Stop native tracking on cleanup/expired authority and fall back after polling failure.
- Give a newly started AR camera four seconds to acquire its first frame before declaring it unavailable.
- Reject ARCore CPU camera configurations below the existing 600px minimum evidence dimension and fall back to ordinary camera capture instead of repeatedly rejecting every low-resolution still.
- Handle diagnostic native capability/stop failures without unhandled promise rejections.
- Reject successful and failed Axios responses and multipart responses after an account switch, preventing stale user restoration/revocation and wrong-account acknowledgments.
- Add a physical-device API preflight refusing missing, relative, loopback/emulator and credential-bearing URLs or privileged EXPO_PUBLIC variables.
- Add regression coverage for API validation, account-switch responses, sequential spatial worlds, background recovery, warm-up, native fallback, QR duplicate callbacks and QR background/foreground.

## Checks

| Check | Result |
| --- | --- |
| Mobile TypeScript | Passed |
| Mobile tests | 30 passed, 0 failed; includes actual component lifecycle tests with mocked native adapters |
| Mobile lint | No lint script/configuration in the mobile project |
| Expo dependency compatibility | Passed; dependencies up to date |
| Expo Doctor | 18/18 passed |
| Expo config/prebuild/introspection | Passed |
| Android Metro/Hermes export | Passed; not an APK/native compilation |
| Expo native autolinking | Camera, location, SQLCipher SQLite, SecureStore, FileSystem, crypto, CaptureQuality and SpatialTracking resolved |
| React Native autolinking | NetInfo, AsyncStorage, Worklets and Reanimated Android entries resolved |
| Backend unit/contract tests | 256 tests passed in 32 files |
| Backend Prisma client generation/TypeScript build | Passed |
| Worker compiled-entry checks | Passed |
| PostgreSQL verification integration | Passed in a newly created isolated local test database |
| PostgreSQL verification lifecycle integration | Passed in a separate isolated database |
| Worker process/health/graceful shutdown integration | Passed in another isolated database |
| git diff --check | Passed |
| Native Gradle compilation | Blocked during configuration: incomplete NDK 27.1.12297006, missing source.properties |
| Final APK build | Not started; native pre-build gate has not passed |
| adb | No connected device at time of check |

Native compilation command: `./gradlew :app:compileReleaseKotlin :spatial-tracking:compileReleaseKotlin :capture-quality:compileReleaseKotlin --max-workers=2 --console=plain` with the existing temporary JDK/SDK paths. Standard React Native/Expo root plugins were retained, with no reduced native-build workaround. Configuration resolved Java 17, Gradle 8.14.3, Kotlin 2.1.20, SDK/target/build-tools 36, minimum API 24 and NDK 27.1.12297006. Native C++/SQLCipher/app compilation remains unproven until the NDK is installed and these checks finish.

Test logs are /tmp/hygeneops-apk-mobile-tests.log, /tmp/hygeneops-apk-integration.log, /tmp/hygeneops-apk-lifecycle.log, /tmp/hygeneops-apk-worker.log and /tmp/hygeneops-apk-native-precheck.log. Isolated databases retained: priv_verification_test_1791353973956_775, priv_verification_test_lifecycle_1791353973900 and priv_verification_test_worker_1791353973900. Only these new local fixtures received migrations; configured customer databases were not migrated.

## API, environment and gates

The only required public mobile variable is `EXPO_PUBLIC_API_BASE_URL`. Both mobile .env and the existing EAS preview profile specify `http://192.168.100.198:8080/api`. The user confirmed that the backend will run locally on this machine. This address is the machine's current Wi-Fi IP; the phone must be on the same reachable network, port 8080 must be accessible, and the address must remain stable. The HTTP test setting is supported by generated usesCleartextTraffic=true. No backend listener was available during the initial probes; this must be rechecked before packaging.

`npm --prefix frontend-mobile run validate:device-config` validates the configured URL and rejects privileged public environment variables. It validates configuration, not phone-to-server reachability. Mobile environment and exported Expo extra configuration contain no Cloudflare/Clef tokens, Cloudinary privileged credentials, database URLs or backend signing secrets. Backend/worker credentials stay server-side. The existing emulator fallback in src/config.ts is development convenience and must never substitute for the explicit testing URL.

Application ID: com.hygeneops.staff; native version 2.0.0. Final APK is planned at frontend-mobile/build-output/HygeneOps-testing.apk using the existing local Gradle workflow and a bundled release variant signed with the generated testing/debug key. This is a standalone testing artifact, not Play Store signing. APK path, size, SHA-256, merged package permissions and native binary inclusion cannot be certified until packaging succeeds.

Spatial autoIdentityAcceptance remains false, enforced by the backend policy schema; spatial decisions never produce a pass. Assisted recapture remains disabled by the absent/false deployment flag. Collection also requires a test task snapshot with spatialCaptureEnabled; this validation does not edit company policies or existing task snapshots. The native estimator reports LIMITED_SPATIAL with uncalibrated candidate points; low-resolution AR streams, missing/outdated AR services and unsupported phones use ordinary capture. No actual AR accuracy is established.

Automatic cleanliness passing remains disabled by autoPassAllowed returning false for all fixture types. Current backend .env has no CLEF_CONFIDENCE_THRESHOLD or CLEF_THRESHOLD_VERSION candidate setting, so Clef outputs remain CANNOT_ASSESS under the adapter's explicit unconfigured-threshold behavior. Configure an independently selected, versioned candidate on the test backend to exercise normal CLEAN/DIRTY assessment; do not enable automatic passing. Run the verification worker against the intended test backend database for asynchronous processing. Live provider/storage behavior remains to be tested.

## Remaining warnings and limitations

The final npm audit has 43 reported vulnerabilities (27 high, 16 moderate, zero critical). Remaining advisories include SDK/build-tool transitive packages such as PostCSS, image-size, node-forge, braces and older uuid; they are not silently suppressed or claimed resolved. Available bulk recommendations include incompatible major SDK/UI-tool changes. Runtime Axios was patched. A separate compatible dependency/security review remains necessary before a public release.

Node's experimental SQLite warning and React test renderer's deprecation concern the local mocked-native test harness, not Android packaging. The PostgreSQL concurrent-query deprecation concerns pg 9 compatibility; installed pg 8 integration assertions pass. Gradle reports deprecations for future Gradle 9; this project uses 8.14.3. None establishes physical SQLCipher encryption, SecureStore key lifecycle, camera/GPS behavior, upload vendor behavior or native camera performance.

Initial drive space fell below 1 GB. User is freeing space; request at least 12 GB free for SDK/NDK download, extraction and native intermediates. Do not remove unrelated user data or alter native plugins to bypass this blocker. No phone has yet been installed or launched.

## Real-device checklist (pending an actual APK)

1. Login and same-account recovery.
2. Task loading, including unresolved saved work.
3. Finish task opens the correct verification flow.
4. Camera permission grant, denial and Settings recovery.
5. Location permission grant, denial and Settings recovery.
6. Area QR scans once and rejects the wrong room.
7. GPS verification indoors, poor accuracy and retry.
8. Empty room entrance/layout context capture.
9. Toilet 1 → Toilet 2 → Toilet 3 retains spatial continuity.
10. Same toilet photographed from several angles.
11. Actual adjacent toilets, including similar stalls.
12. Tracking loss/recovery and wider-photo guidance.
13. App background/foreground unmounts cameras and breaks/restarts the world.
14. Internet disconnect/reconnect.
15. Encrypted pending uploads and account/key isolation.
16. Kill/reopen before and after durable save; queued evidence remains recoverable.
17. Upload retry/lost acknowledgment uses the same capture identity.
18. CLEAN/DIRTY Clef processing with explicit test candidate configuration; uncertainty/outages remain review states.
19. Targeted rework preserves passed/accepted views.
20. Final server-confirmed completion or manager review state; CLEAN alone cannot automatically pass.
