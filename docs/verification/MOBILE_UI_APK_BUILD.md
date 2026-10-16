# Mobile UI APK — 2026-10-12

Source snapshot: `369bf5e`, isolated branch `build/hygeneops-ui-native-20261012`. Build run: https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/38256262582 . The original working tree and its uncommitted work were retained.

Version 2.1.3 / Android versionCode 6. A fresh native build includes expo-speech alongside camera, encrypted SQLite and the existing native capture modules. Mobile sources, tests and public assets were copied into the isolated build checkout; ignored environment files, credentials, dependencies and earlier APKs were excluded.

Testing API default: http://192.168.100.198:8080/api . A phone must reach this Wi-Fi address. An already-saved server preference takes precedence; it can be changed on the sign-in screen after signing out. Saved evidence is not deleted to change server settings.

The release-variant testing APK is checked for native modules, permissions, bundled photo flow and API URL, archive/native alignment, and Android signatures. Final signing uses the existing local Android testing certificate so installation can update the previous APK in place. It is not a Play Store production signing configuration.

Physical-phone installation, camera capture, native speech voices and GPS/network behavior are not certified by packaging checks.

## Final result

Build and local package inspections passed. Native speech, updated UI and durable receipt code are present. APK version 2.1.3 / code 6, size 183420451 bytes, SHA-256 `b27ed047c6c35a670fbbdc7bab7dffb4de4a1f7c64a318f0730826c8b76a8ae8`. Certificate matches the previous testing APK; no re-signing was necessary. ARM64/32-bit ARM, permissions, 16 KiB alignment and bundled API checks passed. Artifact: `frontend-mobile/build-output/HygeneOps-staff-2.1.3-ui.apk`.
