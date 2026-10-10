# Bundled local fixture category check

The staff shutter checks a still photograph using the real quantized CLIP ViT-B/32
vision encoder through `onnxruntime-react-native@1.24.3`. It compares the image
embedding with genuine text embeddings generated from the matching quantized text
encoder. This is category guidance only. The backend remains authoritative for
coverage, fixture instance, view, duplicate/replay, spatial identity and cleanliness.

## Artifact provenance

- [ONNX export source](https://huggingface.co/Xenova/clip-vit-base-patch32), revision
  `d15189d7028b43f1d3e65039190477f6af591c2a`.
- [Original CLIP](https://github.com/openai/CLIP), MIT license; license copied into
  `frontend-mobile/assets/models/CLIP-LICENSE.txt`.
- Vision source `onnx/vision_model_quantized.onnx`, bundled as `clip-vision-int8.onnx`:
  **89,117,001 bytes** (89.1 MB decimal, 85.0 MiB), SHA256
  `583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299`.
- Text encoder source `onnx/text_model_quantized.onnx`, build tooling only:
  SHA256 `73baab855d406190da9faa498cfedf65f15cf309f4cc7385b7b032e6d08e5c3a`.
- Twenty prompts produce 512-dimensional normalized vectors. Three prompts each
  cover TOILET, SINK/basin, MIRROR, BIN and FLOOR. Five OTHER prompts cover rooms,
  entrance/door, walls, people and dark/blurred images.
- Tokenizer and preprocessor files are pinned and hash-checked by the preparation
  script. Tokenizer pads with the checkpoint's EOS ID 49407.

## Reproduction

Create a tooling-only Python virtual environment, install
`frontend-mobile/scripts/local-category/requirements.txt`, then run
`frontend-mobile/scripts/local-category/prepare.py`. It downloads pinned source
files, validates hashes and regenerates `clip-text-vectors.json`. Model/source
download occurs only in build tooling, never on a staff device.

The Expo plugin `scripts/with-local-category-model.cjs` validates the model hash
and packages it into Android assets/iOS app resources. It pins Android and iOS
ONNX native runtime version 1.24.3 (the upstream RN package otherwise uses a
floating native runtime). Android copies the packaged model to app-private files
and validates its hash before opening it; iOS opens the verified app resource.
Android library modules also inherit the Expo root NDK version. Without this,
expo-sqlite used AGP's default NDK 27.0 while the app used NDK 27.1, downloading a
second toolchain during configuration. This aligns genuine toolchain versions;
it never modifies or fabricates SDK metadata.
Metro understands ONNX asset files. The Expo asset plugin was not used because
its version 12 rejects `.onnx` assets.

**A new APK and new iOS native build are required.** An older build, Expo Go,
missing native module/model, inference errors or unsupported fixture categories
yield UNCERTAIN. There is no runtime download or remote detection fallback.

## Preprocessing and execution

Photos must be local file URIs. Native preprocessing honors EXIF orientation,
center-crops to a square and resizes to 224x224 RGB, normalized with the checkpoint
means/stds into a `[1,3,224,224]` float32 tensor. Android uses bilinear interpolation;
iOS uses UIKit/CoreGraphics high-quality interpolation. This differs slightly
from the reference Pillow bicubic resampling and needs real-device validation.
The bridge transfers only the transient normalized tensor; the check stores no
image or tensor. CPU inference is serial, bounded to two intra-op threads and one
inter-op thread. Outputs/tensors are disposed after use; the model session is
reused. A 25-second UX timeout becomes UNCERTAIN. React Native ORT cannot cancel a
running native inference; the busy guard remains set until it settles so another
shutter cannot create overlapping model work.

## Decision policy

Cosine similarity is **not a calibrated confidence probability**. Current
thresholds are conservative starter policy, not validated washroom thresholds:

- MATCH: expected category ranks first, mean cosine >=0.23 and runner-up gap >=0.025.
- CLEAR_MISMATCH: another supported fixture ranks first, cosine >=0.30, expected
  category gap >=0.09, runner-up gap >=0.05, and at least two of its prompts beat
  the expected category mean by >=0.07.
- Otherwise UNCERTAIN. OTHER/distractor winners never produce a fixture accusation.

MATCH allows durable save/upload. CLEAR_MISMATCH keeps the same capture step,
explains the expected fixture and never saves/enqueues/uploads the rejected
photo. UNCERTAIN explicitly offers retake or continue to authoritative backend
checking; it is never converted to MATCH. Entrance context bypasses fixture
classification because it is not one of the fixture categories.

## Actual smoke measurements

The bundled model was loaded and executed through Python ONNX Runtime 1.24.3 CPU,
two threads, against existing repo `area-sink.webp`, `area-mirror.webp`,
`area-floor.webp`. A measured run took **292.4 ms model load** and **52.3, 53.2,
53.8 ms inference**. All three multi-object room photographs produce UNCERTAIN
with the conservative policy. The sink photograph's category means were mirror
0.2798, toilet 0.2758, sink 0.2747: small differences are deliberately not trusted.
These measurements prove the real model executes, not accuracy or mobile speed.

Expect phone latency to vary (rough planning range about 0.2-2 seconds warm,
potentially longer on lower-end hardware); no phone timing has been measured.
The APK increase includes the 89.1 MB model plus native ONNX runtime per shipped
ABI; exact compressed APK growth and peak resident memory require the new build
and device measurements. Android also keeps an 89.1 MB app-private model copy.

## Actual Android compilation

An isolated prebuild under `/tmp/hygene-workflow-native` compiled with real JDK17,
Android API36, NDK27.1.12297006 and CMake3.22.1. A missing/incomplete old NDK was
recovered from Google's official archive (SHA1 verified against SDK repository
metadata); no SDK metadata was fabricated and the previous SDK/APK was untouched.

- `:capture-quality:compileDebugKotlin`, `:spatial-tracking:compileDebugKotlin`,
  `:app:compileDebugKotlin`, `:onnxruntime-react-native:compileDebugJavaWithJavac`,
  `:app:mergeDebugAssets`, `:app:processDebugMainManifest` passed. 299 tasks,
  275 executed; 14m05s including initial dependency downloads.
- After reapplying the latest source config plugin with Expo prebuild, the
  permanent root-NDK inheritance hook worked without the temporary init script.
  `:onnxruntime-react-native:externalNativeBuildDebug` passed for arm64-v8a:
  CMake configure/build, 28 tasks, 4 executed, 1m10s.
- The generated `libonnxruntimejsi.so` is a genuine AArch64 ELF shared library
  (5.4 MiB with debug symbols). The arm64 ONNX core library is approximately
  25 MiB uncompressed, in addition to the 89.1 MB model; final release APK
  compression/ABI composition remains unmeasured.
- The merged model SHA256 exactly matches the pinned source and the merged MIT
  license is byte-identical to the repository copy.

Builds used `-PreactNativeArchitectures=arm64-v8a`, two Gradle workers and bounded
JVM heaps. Temporary tooling/generated cache relocation into RAM was necessary
because the disk started with under 2 GB available. This is compilation evidence
only: no APK was assembled, no iOS native compilation ran, and no phone inference,
native preprocessing equivalence or end-to-end real-device behavior was tested.

Real washroom photos, unusual basins/toilets, close-ups, reflections, multiple
visible fixtures, dark images and mid/low-end devices need held-out calibration.
Current smoke examples' uncertainty demonstrates why staff must have the explicit
backend continuation path rather than an aggressive local blocking gate. Model,
prompt or threshold updates require regenerated provenance, regression checks,
device evaluation and a new native build when the bundled artifact changes.
