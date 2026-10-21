# Native launch recovery — Specification 37

Implementation branch `implementation/spec-37-native-workflows`, based on Spec28/PR56. Issue60. Local implementation and automated checks complete; independent finish review and lead integration remain pending. This is an Expo/React Native extension of existing screens, not a new app or camera architecture.

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

No `adb` executable/emulator/connected physical phone was available. No native screenshots, system font-scale/device Urdu shaping, actual camera/GPS permission cycle, push delivery, OS Back/IME interaction, Android install/signing or performance is claimed. Expo web export and React component trees are local automated evidence only. Impeccable's Android guidance requires emulator/device captures; those runtime checks remain qualification gates39/40. No web detector was run for this native-only unit. Independent finish source/component review remains pending with the lead before marking37 Done.

Actual21 privacy/identity qualification and consented empirical release evidence remain external blockers. This unit keeps the affected new processing unavailable and does not activate it. Safe-disabled implementation and completed historical result reconciliation are not evidence of a qualified photo pipeline.
