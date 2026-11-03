# Latest standalone Android testing APK — 29 October 2026

**Built, downloaded and independently inspected.** The APK is ready to install on
an Android 7.0+ ARM64/ARMv7 phone. A physical phone is not connected, so no
installation, sensor, push or native visual acceptance is claimed. Specification
37 remains **Blocked** on its physical/provider qualification gates.

## Build result

| Field | Verified value |
|---|---|
| APK successfully built | YES |
| Primary filename | HygeneOps-Latest.apk |
| Easy-to-find path | `/home/shumail/Downloads/HygeneOps-Latest.apk` |
| Project artifact copy | `/home/shumail/bkacup-16-oct-bkpriv/bk-Priv/PRIV/frontend-mobile/build-output/HygeneOps-staff-2.1.8-latest-20261029.apk` |
| Size | 57,454,943 bytes / 54.79 MiB |
| SHA-256 | `166be51d90f6b52cf1582b4148988fb2d2502ae448096fb79fa59a01a37e8616` |
| Build completed | 2026-10-29 22:59:10 PKT / 2026-10-29T17:59:10Z |
| Build type | Standalone Gradle release variant with standard testing/debug certificate |
| App name | Hygene Ops Staff |
| App version / Android version code | 2.1.8 / 11 |
| Expo / React Native | 54.0.37 / 0.81.5 |
| Android package | com.hygeneops.staff |
| Minimum / target Android API | 24 / 36 |
| ABIs | arm64-v8a and armeabi-v7a |
| Source branch | build/hygeneops-android-testing-20261029 |
| Exact compiled commit | `e73591e25406725cc354bf9b1f5e845da4b658bd` |
| Latest Spec 37 source included | YES, including a9879e4, aa1b6e2 and 643ac41 |
| All completed native source improvements included | YES |
| Requires Expo Metro | NO |
| Configured API | `http://192.168.100.95:8080/api` |
| Physically installed/tested | NO |

Build: [successful run 40923692593](https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/40923692593).
Downloadable artifact: [HygeneOps-testing-apk](https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/40923692593/artifacts/12919548716).
The private-repository artifact requires GitHub access and has seven-day retention;
the local copies are preserved separately. No EAS build was used.
Review: OPEN/DRAFT [PR107](https://github.com/Shumail-AbdulRehman/PRIV/pull/107),
based on Spec34/PR106. Historical build PR80 and native PR101/105 remain unchanged.

## Source and build method

The isolated branch starts from dependency-complete
298fad3816fc1b4634c26460b13ce6bb3ac02d01. Its native tree includes the latest V5
My day, Tasks, Start Task and Help composition, Inter/Noto Arabic fonts, Latin
text inside Urdu screens, and denied-camera/Settings/foreground recovery. All
114 hashed runtime/module/font files are unchanged from that accepted source.

Local Node is 24.14.1. A complete local JDK/Android SDK was absent and only 9.1 GiB
was initially free, so compilation used the existing approved GitHub-hosted Expo
prebuild/Gradle workflow, with JDK 17, SDK 36, NDK 27.1.12297006 and CMake 3.22.1.
A checksum-verified portable Temurin 17 JRE was added only inside the private build
parent to run independent local package/signature inspection; no system toolchain
was replaced. EAS CLI/access was unnecessary.

Scoped build fixes reuse the previous successful expo-asset 12.0.14 patch and
current backend/inspection checks. Dynamic app.config.js preserves Expo's incoming
static config using its documented function form. The first run 40923284345 stopped
at that config Doctor check; the corrected run passes all 18 checks. There was no
failed native APK accepted as a success and no screen/authentication rewrite.

The API defaults and preview profile use the current approved LAN address. App
metadata is advanced to 2.1.8/code 11. Existing Firebase Android client configuration
for this package is supplied through encrypted Actions secret
HYGENEOPS_ANDROID_CLIENT_CONFIG, excluded from committed source and diagnostics.
No service-account private key, database secret or administrator credential is
packaged. The standard existing Expo testing certificate is reused; its fingerprint
matches the prior 21 October UI APK. No new production signing identity was invented.

## Checks actually performed

- Local and hosted native tests: 115 passed, zero failures/skips. TypeScript passes.
- Expo dependency compatibility passes; Expo Doctor 18/18 passes.
- Hosted backend: 1444 passed with 7 existing conditional skips; current isolated
  launch SQL checks, seven persistence invariants and manager contracts pass.
  Those SQL checks use disposable hosted fixture databases, never local/production
  customer data. Backend compilation passes.
- Full native compile passes in 12m 4s; standalone APK assembly passes in 2m 42s.
- Hosted and independent local inspection verify the actual APK manifest, package,
  version, camera/GPS/network/notification permissions, optional ARCore, custom
  CaptureQuality/SpatialTracking modules, camera/location/SecureStore/FileSystem/
  Crypto/NetInfo/Firebase/notification modules, direct uploads and bundled Hermes.
- Signature verification, 16 KiB ZIP alignment, archive CRC, SHA-256 and both ABIs
  pass. All four approved Inter/Noto font files match source bytes inside the APK.
- No persistent photo database, removed speech/ONNX runtime or service-account
  credential JSON is packaged. The bundled API matches the exact configured URL.
- No physical camera/GPS/QR/upload/push/large-font/ENUR native rendering is claimed.
  Zero ADB devices were connected; no app was installed or existing phone data erased.

Machine-readable evidence is in `docs/verification/android-latest-20261029/` on the build branch. Raw logs, source hashes,
portable inspection runtime and preservation audits remain privately under
`/home/shumail/.local/share/hygene-ops/v5-apk-20261029/`.

## Backend and first-launch requirements

The target is the documented restored **local development** copy, using
127.0.0.1:56445/hygene_ops_local. The protected runtime configuration confirms its
expected checkout, development mode and disabled external billing/push. No remote
production environment was loaded, deployed or modified. No database was reset,
seeded or migrated for this APK. The existing services were left running unchanged.

From the build computer, the public support route returns 200 and staff task,
attendance and task-verification routes require authentication (401). A phone is
not available to prove Wi-Fi/firewall reachability or actual login. Keep the backend
running on 8080 and use the same reachable network. If DHCP changes this computer's
192.168.100.95 address, use the existing server-address control before signing in.
A saved server preference can override the bundled default. HTTPS remains required
for public servers; private LAN HTTP is allowed by the existing testing rules.

Task-photo processing remains gated by actual backend provider/privacy qualification.
An unavailable-processing explanation is expected when that qualification is absent;
this build does not bypass it. Real push delivery is also not qualified, and the
local backend retains push disabled. Account recovery uses existing safeguards.
OAuth/OIDC work remains postponed.

## Installation

1. Connect the phone by USB in File Transfer mode and copy HygeneOps-Latest.apk
   from this computer's Downloads folder into the phone's Downloads folder.
2. On the phone, open the file with Files/File Manager. If Android asks, allow
   installation from that file manager, then install/update the app.
3. Alternatively enable USB debugging, authorize this computer and run:

```sh
/home/shumail/.local/share/hygeneops-tools/platform-tools/adb install -r "/home/shumail/Downloads/HygeneOps-Latest.apk"
```

The certificate matches the previous UI APK, but any different installed signing
identity still needs checking. Do not erase existing app data to bypass a mismatch.
Use existing authorized local test staff credentials; no default account was created.
Allow camera and precise location when needed, enable device location services,
and confirm backend reachability. No Expo Metro server is needed.

## First physical tests

1. Staff login, restart/session recovery and required password replacement.
2. Attendance at the assigned site's real geofence; GPS/permission denial,
   check-in/check-out and lost-response recovery without duplicate writes.
3. Assigned task listing, refresh and correct task/site context.
4. Camera/selfie/task-photo controls, denial, permanent-denial Settings recovery
   and foreground return. Respect server photo-qualification unavailability.
5. Photo upload, lost response, explicit retry and persisted receipt where the
   backend grants the real qualified capability; never infer submission is verification.
6. Scan the correct assigned area/task QR; check start/finish and wrong-code denial.
7. English/Urdu, RTL, bundled fonts, large system font, keyboard/Back and insets.

Spec 37 remains Blocked until its actual device/provider/V5 criteria pass. Six
specifications remain; no other specification was completed by packaging this APK.
No PR merge, backend deployment, production change or Google Play publication.
