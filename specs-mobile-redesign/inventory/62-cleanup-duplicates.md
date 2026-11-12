# Spec 62 inventory

- Deleted (no importer): `components/LanguageChoice.tsx`, `components/ui/{card,badge,separator,skeleton,input}.tsx`.
- `StartTaskScreen.tsx` uses the shared `CaptureFrame`, `CameraRoundButton`, `CaptureBusyCard` (test ids `photo-viewfinder`, `photo-scan-line`).
- `ProfileScreen.tsx` `joinedMonthKey` (file-local): `localDate(..).slice(0, 7)` with an `Asia/Karachi` fallback for an invalid zone.
- `tests/support/nativeHarness.mjs`: default `t(text, values)` fills placeholders like the real provider.
- Test tip: mock the icon with the key `/ui/icon` so it matches both `./ui/icon` and `../components/ui/icon`.
