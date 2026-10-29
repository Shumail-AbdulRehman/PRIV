# Native launch recovery — Specification 37

## Current single-spec verification — 2026-10-29

**Full acceptance: Blocked.** Local source recovery and automated checks are
complete for this continuation. No physical Android device or emulator is available;
no native screenshot, permission dialog, sensor, push delivery or native layout
approval is claimed. The first V5 acceptance criterion remains unchecked.
Only Specification37 was worked on;36's separate external gates remain Blocked.

Latest fetched baseline: `d5098aacbf92e1e00676e30e69914dd2a1303c8c`, OPEN/DRAFT
PR104 on `implementation/spec-36-review-acceptance`. This continuation lives on
`implementation/spec-37-native-acceptance` in
`/home/shumail/.local/share/hygene-ops/v5-spec37-20261029/implementation`.
Issue60 was independently found, reused, assigned and claimed before source edits.
The original dirty root and all22 pre-existing present worktrees are preserved;
there is no checkout switch, reset, merge, deploy or production operation.

### Dependency and acceptance audit

All five declared dependencies are Done in the latest tracker, with real code:
09 supplies exact-shift attendance/conditional checkout,17 supplies current-password
and one-use handoff,20 supplies immutable receipt/replacement rules,21 supplies the
fail-closed photo qualification,26 supplies mounted security/attendance/task routes
and `photoChecking`/`allowedActions`. Native callers consume those contracts.
Fresh169 backend tests cover these seams; they are unit evidence, not SQL/provider
or physical-device proof. The active adapter still declares
`privacyAssessment:false` and `fixtureIdentityAssessment:false` in
`backend/src/services/verification-v2/cleanlinessRelease.ts`.

| Requirement | Existing implementation and fresh automated evidence | Additional implementation / remaining proof |
|---|---|---|
| STAFF login, sessions, mandatory replacement | Actual AuthProvider/client/SecureStore, role denial, revoked/stale account handling and retained restrictive gate; credentialRecovery/client/sessionStorage tests pass | No source change needed here; fresh device login/restart/expiry/offline/signout still unverified |
| One-use manager handoff and own-password change | LaunchRecovery/api/recoveryPolicy, draft retention, Unicode limits, success clearing and sign-in handoff; launchRecovery and credential tests pass | Requires actual matched test API and device, not an owner mail provider; no email inbox is assumed for staff |
| Attendance, GPS and lost-response recovery | Home reads exact persisted shift before permission/write; exact checkout ID and uncertain-response reconciliation; attendanceRecovery, attendanceCamera and location tests pass | Added camera/location denial→Settings→explicit retry component checks; actual GPS accuracy/geofence/OS permission cycles remain physical checks |
| Task management and task QR | Existing queries/startCleaning/StartTask; duplicate/background/wrong-code and task-state regression checks pass | No scanner/API redesign; physical printed/screen QR recognition and correct/wrong/expired task flows remain unverified |
| Camera/photo capture | Existing native CameraView, native quality/clock module and manifest authority; lifecycle/policy/shutter tests pass | Fixed unreachable Settings action for permanent denial; actual front/back camera, quality processing, torch/background/restart remain hardware checks |
| Upload/retry and submission receipt | Stable capture/result lookup, explicit retry, no persistent evidence queue, receipt reread/remount; lifecycle and recovery tests pass | Same capture is retained only while screen remains open; real network interruption/upload and real retained receipt require native runtime plus qualified provider/test fixtures |
| Permission recovery vs expired authority | Fresh OS permission on explicit continue, Settings for permanent denial, foreground permission+manifest reread, clear failed-check guidance; seven new task-camera cases pass | Settings never renews server authority or automatically submits/uploads; actual Android return/revocation still unverified |
| Help and push | Existing Help/registration duplicate/error/retry and mandatory security routing tested | Registration is not delivery; physical phone and approved Firebase/Expo push credentials/test project are required for delivery proof |
| English, Urdu, large text and responsive layout | Native vocabulary, Inter/Noto Arabic, LTR account IDs, flexible controls/default scaling and language tests pass | New recovery messages translate into Urdu; actual shaping, large system font, keyboard/Back, insets and compact/large native screen layouts remain unverified |
| Approved V5 appearance | Existing palette/font/My day/Tasks/Help/Start composition retained; new action reuses existing outline Button/Text and approved tokens | Native paired reference/actual screenshots have not been captured or inspected. Earlier RNWeb previews are historical source evidence only |

The unit/whole-suite, scoped-path, typecheck and Expo web-build criteria pass.
The V5 native-runtime criterion does not pass. A build or component tree does not
prove EN/UR native visual fidelity or large-font layout.

### What changed in this continuation

The prepare screen previously displayed camera-denied guidance but rendered its
recovery control only in scan mode, which denial could never enter. It now exposes
Allow camera or Open camera settings in every applicable unsubmitted state. Explicit
continue reads current OS permission and current server authority before scanning;
permanent denial opens Settings without repeating an impossible OS prompt. Failed
Settings opens show existing actionable bilingual guidance. On return, permission
and manifest are read again; failed rechecks leave the scanner paused and explain
recovery. No session or upload is created by that foreground check.

Nine new component cases cover two attendance permission recoveries and seven
photo permission/settings/authority cases. The existing Urdu vocabulary assertion
now covers the recovery labels/messages too. Backend policies, scanner payloads,
capture identity, upload/receipt behavior, providers, packages, lockfiles and the
approved design/v5 reference are unchanged.

### Android / Expo environment actually inspected

- ADB is absent from PATH but available at
  `/home/shumail/.local/share/hygeneops-tools/platform-tools/adb`;
  version1.0.41 /37.0.1-15733141. `adb devices -l` prints its header and no devices.
  USB enumeration shows local host peripherals, no attached Android phone.
- No emulator binary/configured AVD or system image was found; `~/.android/avd`
  is absent. A KVM device node alone does not establish an emulator. The local SDK
  has command-line/build-tools fragments; Java/SDK environment variables and Java
  on PATH are absent. No emulator/JDK/system package was installed for this task.
- Local locked install succeeds: `npm ci --prefix frontend-mobile --ignore-scripts
  --no-audit --no-fund` (787 packages). Expo54.0.37, React Native0.81.5,
  expo-camera17.0.10 and expo-font14.0.12 resolve locally. This changes no tracked
  manifest/lockfile. Initial shared dependency symlinks failed Metro resolution;
  replacing only this worktree's symlink with its own install resolved that failure.
- No mobile .env, .env.local or google-services.json was copied/loaded. No
  EXPO_PUBLIC_API_BASE_URL, GOOGLE_SERVICES_JSON or EXPO_TOKEN is present in this
  session. The build guard correctly exits1 asking for a physical-device API URL.
  The development default is emulator networking, not a confirmed phone/API target.
- Expo dev server started at loopback5198 from this exact worktree, with
  `CI=1 EXPO_NO_DOTENV=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1
  ./node_modules/.bin/expo start --localhost --port 5198` in frontend-mobile.
  `/status` returns `packager-status:running`; requesting
  `/index.bundle?platform=android&dev=true&minify=false` returns200 and compiles
  3607 modules. The14,303,182-byte bundle contains the new recovery message and
  custom CaptureQuality module; SHA256
  `841279d2f944b38394c899dceab7c5a256ca5aa25dfbeb448384e153d04e8d0b`.
  This proves Android JavaScript bundling, not an installed native app. Expo Go
  alone cannot provide the custom CaptureQuality module required by this source.
  Initial `--offline --localhost` flags conflicted; EXPO_OFFLINE with only
  `--localhost` starts correctly. Only the owned5198 process was stopped afterward.

### Existing APK provenance

The available `HygeneOps-staff-2.1.7-ui-20261021.apk` has56,742,055 bytes and fresh
SHA256 `5851b5df48c9e0f7957847d88197a7ddbe13ec9c3d1568e96f6d0df7c25fc717`,
matching its inspection record. That record binds it to build commit
`d69d855a4d893358a3c0467a05a1238d26c73333`, not the latest source. Git comparison
shows33 native files differ in the baseline, before this continuation. Its old
versionName2.1.7/versionCode10 do not prove source freshness. No APK was built,
installed or tested in this session; no signing/device result is reused.

### Checks actually run

- Baseline native suite106pass. Final `npm test --prefix frontend-mobile`:
  **115passed,0failed,0skipped** (4.19s). This includes nine new cases.
- Focused existing file set: launchRecovery, credentialRecovery, attendanceRecovery,
  attendanceCamera, verificationLifecycle, startTaskLifecycle, nativeComposition:
  **51passed,0failed** (3.42s). These overlap the115; do not add them.
- `npm run typecheck --prefix frontend-mobile`: pass.
- `EXPO_NO_DOTENV=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 CI=1
  npm run build:web --prefix frontend-mobile -- --output-dir <private-parent>/web-export`:
  pass, with all four bundled fonts. This is web export, not native visual proof.
- Backend `npm test --prefix backend --` with
  `src/services/attendanceWrites.service.test.ts`,
  `src/services/credentialHandoff.service.test.ts`,
  `src/services/verification-v2/launchPhotoPolicy.test.ts`,
  `src/services/verification-v2/launchQualification.test.ts`,
  `src/routes/launch.route.test.ts`,
  `src/services/verification-v2/staffSubmission.service.test.ts`:
  **169passed,6files,0failed** (4.60s). No full backend/web/SQL/E2E or live API run
  is claimed for this native-only continuation. Spec36's previous450web/1444backend/
  15browser results remain historical, not new runs here.
- Mechanical Impeccable detector on changed VerificationScreen returns `[]`;
  this is not visual acceptance. Whitespace and spec validator are recorded in
  the current handoff.

The four new initial red checks reproduced the missing controls; later fixture
assertions were corrected to account for the fresh OS read and a scoped counter.
Final checks above pass without weakening authority or retry assertions. Existing
react-test-renderer deprecation/install advisories are non-failing.
Persistent private logs, source hashes, environment audit, exports and development
bundle: `/home/shumail/.local/share/hygene-ops/v5-spec37-20261029/`.
No credentials, QR payloads, worker coordinates or private media are committed.

### Exact remaining blocker and stop condition

To close37, attach an authorized physical Android phone and build/install this
continuation's exact source with a device-reachable isolated test API. Supply a
qualified consented photo/privacy/fixture-identity test configuration for positive
photo flows and dedicated push-provider configuration for delivered-notification
proof. Missing active adapter capabilities cannot be enabled by a flag; safe-disabled
photo behavior must remain intact. No production provider/data should be used.

On that fresh build, verify actual sign-in/session/recovery, attendance/GPS/selfie,
correct/wrong/expired QR and task start, camera denial/permanent denial/Settings
return/revocation, photo capture and lost-response/manual same-capture retry,
receipt persistence and push registration/delivery. Compare actual native EN/UR
screens with approved design/v5, at compact/large native sizes and enlarged system
text; check keyboard, OS Back, safe areas and background/foreground. Record actual
build commit, device/runtime, states and paired screenshots. None of these physical
checks passed here. No browser screenshot substitutes for them.

**STOP after this unit.** Six specs remain:30/36/37Blocked,34/40In progress,
41Not started;36Done including decision00.34 is dependency-eligible (19/27Done)
but requires qualified OIDC/MFA/provider facts; there is no independently completable
new spec to start with current access.30/36/37 await their respective external
proof.40 remains ineligible on unfinished dependencies and41 waits40.

---

## Historical 2026-10-21 implementation and evidence (not fresh acceptance)

Implementation branch `implementation/spec-37-native-workflows`, based on Spec28/PR56. Issue60. Local implementation and automated checks complete; independent source/component review passed; lead integration remains pending. This is an Expo/React Native extension of existing screens, not a new app or camera architecture.

## Actual screen integration

- Login retains the STAFF-only API and rejects a non-STAFF DTO before session persistence. A manager-provided one-use handoff opens the real `/common/security/handoff/complete` form; no staff inbox, reset email, shared password or automatic login. Clear code/password drafts only after success. Expired/consumed/uncertain codes give actionable manager help.
- Help & account and the mandatory replacement gate reuse `LaunchRecovery`: current password plus a different new password, confirmation and the server's eight-character/72 UTF-8-byte bcrypt boundary. No raw password/code persistence or logging. The API remains authoritative for same-password rejection, credential epoch, principal activity and one-use token validity. Successful change clears the local session and returns to sign-in; it never reactivates company operations.
- The login DTO intentionally does not expose `mustChangePassword`. Auth uses the real structured `PASSWORD_CHANGE_REQUIRED`403 from `/common/get-current-user`; it retains that session solely for own-password replacement, and AppNavigator exposes only the replacement form/signout while required. Login waits for this check before mounting the operational navigator. The last confirmed restrictive flag is saved within the existing secure session and survives an offline restart; only a successful current-principal read or a fresh login clears it. It is a UI restriction, never an authorization grant. Notification registration/navigation skip this gate. Other operational403s retain own-security access; backend policy still denies operations.
- Home rereads the exact selected persisted shift before camera/location requests and again before uploading. It compares attendance ID, historical site and expected boundaries. Checkout sends the actual `attendanceId`; check-in reuses the existing backend unique eligible-shift contract (there is no new backend check-in-ID parameter). After a lost response, read the same persisted shift and accept only its saved timestamp. A failed reread never authorizes another upload. No background/offline upload or automatic mutation retry was added; existing server CAS/idempotency remains the final race guard.
- VerificationScreen consumes26's actual `photoChecking.available` and allowedActions. Missing/false qualification never requests camera permission, opens the photo camera or starts a session. New upload and slot activation also respect current authority; current server denials remain authoritative. Current21 adapter is unqualified and remains unavailable. This UI does not claim privacy screening, fixture identity, redaction or verification approval.
- Existing same-capture result lookup remains reachable via Check result. Manual retry keeps the same capture/hash/slot/nonce metadata and checks the saved result first; received results are reconciled without reupload. A service failure is distinct from a completed result and requires checking availability before retrying. New processing remains disabled when qualification is absent. Temporary pictures are still memory/screen scoped and discarded on exit; there is no persistent evidence queue.
- Submission rereads persisted state before posting and after a lost response. The receipt is rendered from server `staffSubmittedAt` plus the task ID and site's timezone when supplied. Reopening obtains the same immutable receipt from the API; no local synthetic receipt is created. Submission is explicitly separate from manager verification/review.
- Help opens the phone's actual app settings and retries the existing push registration seam. It distinguishes registered, denied, unsupported/configuration-unavailable and connection-uncertain results. Contact guidance names the assigned manager, without inventing a recipient, support policy or distribution URL. Device permission does not renew server authority.

## Reuse and design boundary

Existing AttendanceCamera, UI Button/Input/Text, staff queries, authenticated client, SecureStore/session adapter, notification registration, direct capture metadata/result API and verification progress are retained. New launch vocabulary lives in a native-only dictionary; the shared EN/UR dictionary remains identical to the web copy. Text uses existing Urdu alignment/LTR secret fields and default platform font scaling; new forms use flexible rows and no fixed text heights. Approved v5 interaction intent is preserved. Historical global native teal tokens were not broadly remapped in this focused unit; no design reference or DESIGN.md was edited. No new dependency, provider, schema, migration or backend change.

## Verification and evidence

- `npm test --prefix frontend-mobile`: **101 tests passed, zero skips**. Existing baseline72 plus29 new cases. Test-only qualified manifests explicitly exercise dormant capture behavior; they do not represent the active provider qualification.
- `npm run typecheck --prefix frontend-mobile`: passed.
- `npm run build:web --prefix frontend-mobile`: passed; this checks Expo web export, not Android signing/install/hardware behavior. Nonfailing existing NO_COLOR/FORCE_COLOR and react-test-renderer deprecation notices remain.
- `git diff --check`: passed.

Evidence sources:

- `src/launch/LaunchRecovery.test.ts`:15 seam tests for exact-shift/lost-response/offline denial, submission reconciliation, qualification/expiry, Unicode password bytes and Urdu vocabulary.
- `tests/launchRecovery.test.mjs`:4 rendered recovery-form cases, duplicate guard, denied draft preservation, secret clearing, one-use handoff and Urdu/LTR/default font scaling.
- `tests/credentialRecovery.test.mjs`:5 actual AuthProvider cases covering login/bootstrap/retained restrictive offline flag, role denial, logout and company suspension.
- `tests/attendanceRecovery.test.mjs`:2 actual HomeScreen cases prove exact checkout ID/lost-response reconciliation and read-before-permission denial.
- `tests/verificationLifecycle.test.mjs`:existing direct-photo tests retained, plus3 actual screen cases for absent/unqualified capability, revocation while scanning and immutable receipt on reopen. Existing same-capture retry, no offline queue, cleanup and sequencing regressions pass.

Logs: `/tmp/hygene-spec37-{tests,type,build}.log`; isolated worktree `/tmp/hygene-spec37`. Dedicated unit mocks use only synthetic accounts, metadata and images. No API provider, production data or database writes.

## Explicit remaining limits

No `adb` executable/emulator/connected physical phone was available. No native screenshots, system font-scale/device Urdu shaping, actual camera/GPS permission cycle, push delivery, OS Back/IME interaction, Android install/signing or performance is claimed. Expo web export and React component trees are local automated evidence only. Impeccable's Android guidance requires emulator/device captures; those runtime checks remain qualification gates39/40. No web detector was run for this native-only unit. Fresh independent finish review: ship at source/component scope only, no material fixes identified. Independent ordinary-extension documenter confirms component/reuse consistency and preserved historical tokens; neither review establishes rendered v5 equivalence or hardware approval. Lead integration remains before completed status.

Actual21 privacy/identity qualification and consented empirical release evidence remain external blockers. This unit keeps the affected new processing unavailable and does not activate it. Safe-disabled implementation and completed historical result reconciliation are not evidence of a qualified photo pipeline.
