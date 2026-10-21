# Spec37 native recovery reuse

- `frontend-mobile/src/launch/LaunchRecovery.tsx`: one form for current-password self replacement and manager one-use code completion; inline draft-preserving errors, duplicate guard, confirmation, UTF-8/bcrypt boundary and success callback. No secret persistence or implicit login.
- `launch/launchApi.ts`: existing authenticated client wrappers for scoped attendance reread, own-password replacement and public handoff completion.
- `launch/recoveryPolicy.ts`: exact persisted attendance reconciliation before/after uncertain writes, immutable submission reconciliation, qualification plus manifest authority, structured mandatory-password denial and same-capture result classification. These are client safety/UX gates; server authorization remains authoritative.
- `launch/launchTranslations.ts`: native-only launch vocabulary consumed through existing translator; shared web/native `urdu` registry unchanged.
- Existing AuthContext now exposes a server-derived/persisted restrictive passwordChangeRequired flag. AppNavigator admits only own replacement/signout in that state; notifications do not enter operational routes. Reuse existing secure session instead of creating another store.
- Actual Home, Verification, Login and Help screens consume these contracts. Receipt comes from persisted manifest, never local success intent. No offline photo queue; old capture metadata/result lookup unchanged.
- `docs/implementation/NATIVE_RECOVERY.md`: exact behavior, source/component proof, automatic checks and unavailable hardware/empirical qualification. Specs39/40 must preserve the active21 gate and qualify actual native hardware separately.

### V5 palette bridge — 2026-10-22
`frontend-mobile/src/theme.ts` centralizes approved V5 native prop colours; NativeWind global.css uses matching HSL tokens. Existing navigation, brand, shutter/progress and button native props consume the same palette. No camera/API/Expo architecture changed.101tests/typecheck/web export pass; native visual/permission/device acceptance remains unverified.
