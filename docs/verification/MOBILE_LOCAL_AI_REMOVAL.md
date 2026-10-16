# Unused local AI removal — 2026-10-12

Removed the unused CLIP classifier/model/vector assets, ONNX React Native dependency/autolinking, native tensor/model-path exports, preparation scripts, model Metro handling and model-packaging plugin. The shared-NDK alignment hook remains as a small separate plugin. Capture-quality blur/brightness/size inspection and monotonic boot clock are retained on Android/iOS. Server Clef assessment, encrypted evidence queue, authorization/QR/timing, speech and camera guidance remain.

Mobile diagnostics no longer emit unused local category results. Existing saved queue payloads/evidence are not reset or migrated. Historical reports and earlier APKs are kept; they describe previous builds.

70 current mobile tests and TypeScript passed. Five removed tests exclusively exercised the deleted local classifier. APK inspection now requires the local model, ONNX native libraries and ONNX DEX classes to be absent, rather than requiring their inclusion. Standard Android workflow assertions were updated accordingly.

New version: 2.1.4 / code 7. Build snapshot `89d43a8`, isolated branch `build/hygeneops-ui-native-small-20261012`. Run: https://github.com/Shumail-AbdulRehman/PRIV/actions/runs/38260355304 . Current working-tree edits are preserved. Backend was restarted at the user's separate request and listens on port 8080.

## Verified APK result

Fresh native build and local inspection passed. APK size 68,065,158 bytes (64.91 MiB), down from 174.92 MiB: 62.9% smaller. Local model assets, ONNX libraries and ONNX DEX classes are absent. Native speech/camera/capture quality/SQLCipher and both ARM architectures are present. Signing certificate matches the previous APK; 16 KiB archive/native alignment and actual bundled API checks passed. SHA-256 `f123f4286e56ceb248dfad87ccb11ced9afc4286361b7bfd1d5d268b9465a794`. Artifact: `frontend-mobile/build-output/HygeneOps-staff-2.1.4-small.apk`. No physical phone installation/test was performed.
