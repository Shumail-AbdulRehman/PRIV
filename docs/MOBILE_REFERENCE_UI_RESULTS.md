# Staff app visual update — 2026-10-12

The supplied mobile references guide the implemented screens: warm off-white background, deep teal primary actions, pale sage icon circles, readable system typography, restrained borders, and generous controls. The actual React Native app has been changed; no APK was built, as requested.

## Changed experience

- Today: compact Hygene Ops/language header, stronger date/title hierarchy, location and shift card, explicit attendance state, expandable shift details, and next-task action. Attendance permission checks, timing restrictions and selfie capture remain.
- Task cards and lists: calmer cards, room icons, readable time windows, short status labels, and clear start/photo actions. Shared card, button, text and navigation styles apply across the app.
- Task start: centered room identity, room icon, numbered QR/cleaning guidance and clearer next action after cleaning starts.
- Photos: compact task context, segmented required-photo progress, one prominent instruction, larger camera view with corner framing, a labeled 88-unit shutter, persistent capture controls and a quieter occupied-room action. Existing durable storage, quality checks, timing, QR renewal, retake/re-cleaning and submission behavior remain intact. No gallery-import action was added from the illustrative reference.
- English/Urdu layouts retain language selection, direction-aware rows and scalable text. Essential instructions retain optional Listen controls.

## Verification

75 mobile regression tests passed, including QR scanner lifecycle, interrupted captures, durable saves, rework and submission. TypeScript and web export passed. Browser checks exercised Home, shift-detail disclosure, Tasks, task-start navigation/back navigation and Help in English/Urdu at 320px and 390px widths; no page errors or home horizontal overflow. Home was additionally checked with 130% simulated text enlargement. Browser checks use fabricated data and do not contact customer records.

Screenshots are in `mobile-reference-ui/`. These are Expo web previews, not native-device screenshots. Native camera framing, touch reach, system text enlargement, spoken Urdu and long-session behavior require physical-device validation. Camera progress/shutter UI was implemented and type-checked; browser tests cannot validate the native camera.

No APK build, signing or installation was performed.
