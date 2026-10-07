# Android testing APK validation

Date: 2026-10-07. Status: pre-build validation, native compilation, APK packaging and artifact inspection passed. The APK is available for installation; physical-device behavior and washroom accuracy remain unvalidated.

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
| Native Gradle compilation | Passed on GitHub-hosted runner (12m18s), before APK packaging; both arm64-v8a and armeabi-v7a included |
| Final APK build | Passed on first GitHub packaging attempt, after all prerequisite checks; assembleRelease took 2m47s |
| APK package/native inspection | Passed on GitHub and again against downloaded local APK |
| APK signature/hash | Android test/debug certificate, APK Signature Scheme v2 verified; downloaded SHA-256 matches artifact |
| 16 KiB package/ARM64 alignment | zipalign check passed; every packaged ARM64 native library has LOAD alignment of at least 16 KiB |
| adb | No connected device at time of check |

Native compilation command: `./gradlew :app:compileReleaseKotlin :spatial-tracking:compileReleaseKotlin :capture-quality:compileReleaseKotlin --max-workers=2 --console=plain` with the existing temporary JDK/SDK paths. Standard React Native/Expo root plugins were retained, with no reduced native-build workaround. Configuration resolved Java 17, Gradle 8.14.3, Kotlin 2.1.20, SDK/target/build-tools 36, minimum API 24 and NDK 27.1.12297006. The full GitHub pre-packaging check passed using `:app:compileReleaseSources :app:mergeReleaseNativeLibs :app:processReleaseMainManifest -PreactNativeArchitectures=arm64-v8a,armeabi-v7a --no-daemon --max-workers=2 --console=plain`. APK packaging was a separate subsequent step; an assertion verified no release APK existed before it.

Test logs are /tmp/hygeneops-apk-mobile-tests.log, /tmp/hygeneops-apk-integration.log, /tmp/hygeneops-apk-lifecycle.log, /tmp/hygeneops-apk-worker.log and /tmp/hygeneops-apk-native-precheck.log. Isolated databases retained: priv_verification_test_1791353973956_775, priv_verification_test_lifecycle_1791353973900 and priv_verification_test_worker_1791353973900. Only these new local fixtures received migrations; configured customer databases were not migrated.

## GitHub Actions validation

Workflow: [Android testing APK run 37583708355](https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/37583708355), branch build/hygeneops-android-testing-20261007, commit 1b7e0a64c96a133c19463113944fd7bb5cb4c923. A separate worktree snapshots the scoped existing implementation plus validation fixes; original main and its uncommitted work are preserved. No real .env files or configured backend secrets were pushed.

Both prerequisite jobs passed on clean dependency installs: 30 mobile tests, mobile TypeScript, Expo Doctor 18/18, dependency/config checks, Android Metro/Hermes export; 256 backend tests, build, compiled worker checks, PostgreSQL contract/lifecycle/worker-health integration, and the benchmark closed-gate assertion. PostgreSQL service credentials are disposable test-only values. Native compilation passed before the packaging step executed. The workflow finished successfully in approximately 18 minutes (06:50:01–07:08:02 UTC). No APK packaging retry was needed. All three jobs concluded success.

## API, environment and gates

The only required public mobile variable is `EXPO_PUBLIC_API_BASE_URL`. Both mobile .env and the existing EAS preview profile specify `http://192.168.100.198:8080/api`. The user confirmed that the backend will run locally on this machine. This address is the machine's current Wi-Fi IP; the phone must be on the same reachable network, port 8080 must be accessible, and the address must remain stable. The HTTP test setting is supported by generated usesCleartextTraffic=true. No backend listener was available during the initial or final probes. The configured address was confirmed against the machine’s Wi-Fi interface and the user’s local-backend plan; login/task/upload reachability cannot be claimed until the backend is started and the phone can reach this port.

`npm --prefix frontend-mobile run validate:device-config` validates the configured URL and rejects privileged public environment variables. It validates configuration, not phone-to-server reachability. Mobile environment and exported Expo extra configuration contain no Cloudflare/Clef tokens, Cloudinary privileged credentials, database URLs or backend signing secrets. Backend/worker credentials stay server-side. The existing emulator fallback in src/config.ts is development convenience and must never substitute for the explicit testing URL.

Application ID: com.hygeneops.staff; native version 2.0.0. The actual standalone APK is `/home/shumail/bk-Priv/PRIV/frontend-mobile/build-output/HygeneOps-testing.apk`, built with the repository’s Gradle workflow on GitHub using a bundled release variant signed with the generated testing/debug key. This is an installable testing artifact, not Play Store signing. Size: 67,979,162 bytes (64.83 MiB). SHA-256: `4408b1bc9f65348cc5a45502f54b3cf0d904558f4fcc9fbb2186f20168a4b64a`. Both `arm64-v8a` and `armeabi-v7a` native binaries are present. Minimum Android API 24; target API 36; launcher com.hygeneops.staff.MainActivity is exported with MAIN/LAUNCHER.

DEX class definitions prove inclusion of SpatialTracking, CaptureQuality, Expo Camera, Location, SQLite, SecureStore, modern and legacy FileSystem, Crypto and NetInfo. Both ARM ABIs include ARCore JNI and SQLite libraries, with a SQLCipher `cipher_version` probe in each SQLite binary. The bundled Hermes JavaScript contains the explicit confirmed API URL. ARCore manifest metadata is optional and camera.ar is not required. Camera, coarse/fine location, Internet and network-state permissions are present; RECORD_AUDIO is absent. Full permission/native-class inventory is in frontend-mobile/build-output/apk-inspection-local.json. The merged manifest also retains SDK/transitive legacy storage, biometric, vibration, Wi-Fi, overlay, install-referrer and app-local receiver permissions; no claim is made that only the four core permissions exist.

Local inspection re-ran the Python package/DEX/native/bundle checks, SHA-256 comparison, apksigner verification, zipalign 16 KiB archive alignment and ARM64 ELF LOAD segment alignment. The local copy and GitHub artifact hashes match. Installation, launch, logcat and initial-screen checks were not possible: final `adb devices -l` also returned no connected device. No user data was removed.

Spatial autoIdentityAcceptance remains false, enforced by the backend policy schema; spatial decisions never produce a pass. Assisted recapture remains disabled by the absent/false deployment flag. Collection also requires a test task snapshot with spatialCaptureEnabled; this validation does not edit company policies or existing task snapshots. The native estimator reports LIMITED_SPATIAL with uncalibrated candidate points; low-resolution AR streams, missing/outdated AR services and unsupported phones use ordinary capture. No actual AR accuracy is established.

Automatic cleanliness passing remains disabled by autoPassAllowed returning false for all fixture types. Current backend .env has no CLEF_CONFIDENCE_THRESHOLD or CLEF_THRESHOLD_VERSION candidate setting, so Clef outputs remain CANNOT_ASSESS under the adapter's explicit unconfigured-threshold behavior. Configure an independently selected, versioned candidate on the test backend to exercise normal CLEAN/DIRTY assessment; do not enable automatic passing. Run the verification worker against the intended test backend database for asynchronous processing. Live provider/storage behavior remains to be tested.

## Remaining warnings and limitations

The final npm audit has 43 reported vulnerabilities (27 high, 16 moderate, zero critical). Remaining advisories include SDK/build-tool transitive packages such as PostCSS, image-size, node-forge, braces and older uuid; they are not silently suppressed or claimed resolved. Available bulk recommendations include incompatible major SDK/UI-tool changes. Runtime Axios was patched. A separate compatible dependency/security review remains necessary before a public release.

Node's experimental SQLite warning and React test renderer's deprecation concern the local mocked-native test harness, not Android packaging. The PostgreSQL concurrent-query deprecation concerns pg 9 compatibility; installed pg 8 integration assertions pass. Gradle reports deprecations for future Gradle 9; this project uses 8.14.3. The successful native build also retains dependency Kotlin/React Native API deprecation warnings, future Gradle 9 warnings, and two harmless Expo manifest tools:replace warnings (FileSystem provider authorities and image-picker activity export with no competing declaration). Their final manifest entries were inspected. The npm install-script warning for esbuild did not prevent a clean install, bundle export or native APK build. These warnings were not suppressed. Static native/bundle inspection does not establish physical SQLCipher encryption, SecureStore key lifecycle, camera/GPS behavior, upload vendor behavior or native camera performance.

Local SDK/NDK installation was incomplete and local drive space was constrained. At the user’s request, native compilation and APK packaging use GitHub Actions on a standard hosted runner. No local data cleanup, build-system replacement or reduced native plugin workaround was used. No phone has yet been installed or launched.

## Before phone testing

Start the intended local test backend on port 8080 and its verification worker; ensure the phone and machine share a reachable Wi-Fi network and the machine keeps 192.168.100.198. Use only a test company/task with a spatial EVALUATE snapshot, autoIdentityAcceptance:false and candidate collection enabled as described in SPATIAL_FIXTURE_VERIFICATION.md; historical snapshots are immutable. No production database migration or policy changes were performed. Cloudflare/Clef and privileged Cloudinary credentials remain backend-only. Clef candidate assessment additionally requires an independently selected CLEF_CONFIDENCE_THRESHOLD and a CLEF_THRESHOLD_VERSION on the test backend; neither is currently configured and neither enables automatic passing. This release variant hides the __DEV__ diagnostic screen; guided spatial collection still runs when its task manifest enables it. Allow installation from the trusted download source, or connect an authorized USB-debugging device for adb install.

## Real-device checklist (APK built; physical tests pending)

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
