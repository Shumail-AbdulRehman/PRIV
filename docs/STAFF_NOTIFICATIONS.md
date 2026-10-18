# Staff notifications

The current staff app uses phone push alerts for task and attendance events. Version 2.1.7 removes the in-app notification screen, notification badge/count polling, and all Listen/text-to-speech controls and dependencies. Tapping a phone alert opens Tasks or Shift directly, including while offline; acknowledgement is best effort and does not delay navigation. English/Urdu alert text and action labels are supported. Backend inbox endpoints and delivery records remain for old-client compatibility and durable delivery processing.

## Events

| Event | Trigger and delivery window |
| --- | --- |
| New task | Active, unfinished task assigned to a staff member; expires at the task's shift end. |
| Task reassigned/cancelled | Previous assignee is notified; a new assignee gets the new-task event. Deletion and inactivation also count as cancellation. Ended tasks do not generate updates. |
| Shift approaching | During the 10 minutes before the scheduled shift starts, if not checked in. |
| Missing check-in | Once after a 10-minute grace period; allows a 30-minute catch-up window. |
| Checkout approaching | During the 10 minutes before shift end, only if checked in and not checked out. |

Review outcomes, requests for more photos/cleaning, and shift/location changes do not create notifications.

The reminder worker runs every minute using the location's timezone. It supports overnight shifts, next-day shifts before midnight, and existing attendance windows. Events are deduplicated per staff member, shift window, and event kind. Current attendance/task state is checked again before sending, so obsolete reminders are cancelled.

## Sessions and account safety

Staff refresh sessions default to **30 days**, including when the app is closed. Refreshing rotates the token and renews the device registration's session binding. Existing tokens retain their original expiry until refreshed or the person signs in again. Access-token lifetime is unchanged; manager/admin refresh-token configuration is unchanged.

Native sessions and pending logout revocations use SecureStore. Logout disables staff push registrations, clears local notification state, and persists an offline revocation for retry when the app next has connectivity. A delayed logout for an older session cannot revoke a later login. Delivery checks active staff/company status and the current refresh session. Reusing an installation for a different account replaces its device binding. Inbox access is scoped to the authenticated staff member and company.

## Firebase setup completed (2026-10-18)

- Registered `com.hygeneops.staff` as **Hygene Ops Staff** in Firebase project `hygeneops`.
- Verified Firebase Cloud Messaging API v1 is enabled.
- Downloaded and validated the Android client config at ignored `frontend-mobile/google-services.json`; `app.config.js` loads it automatically.
- Saved the client configuration as the project-scoped `GOOGLE_SERVICES_JSON` secret file in Expo's **preview** environment, matching the current EAS build profile.
- Uploaded and assigned the FCM v1 service-account credential to the existing Expo project `cleanops-staff` under account `shumail-cleanops`.
- Configured the local backend with the matching Expo project ID, a 30-day staff refresh session, and push sending disabled until the rebuilt app is ready.
- Kept the private service-account JSON outside the repository, with owner-only file permissions. Its contents were not printed or added to mobile configuration.

No real push was sent during setup. On 2026-10-18, the staff notification migration (`20261017000100_staff_notifications`) was successfully applied to the configured Supabase database. The direct host was IPv6-only and unreachable from this machine, so `DIRECT_URL` now uses the verified Supabase session endpoint on port 5432; Prisma CLI prefers this URL while the runtime keeps `DATABASE_URL`. The previous local environment was saved in ignored `.env.before-migration-connection-fix` with owner-only permissions. The Android build recorded below includes native push support; backend deployment/restart as needed and a physical-device check remain necessary before confirming phone delivery. The existing Android directory must be regenerated with `expo prebuild --platform android --no-install` before a build so the new notification plugin and Firebase configuration are applied; `npm run build:android` already includes that step.

## Deployment configuration

Apply the included migration before running the updated backend:

```sh
cd backend
npx prisma migrate deploy
npm run build
```

Backend environment variables (also passed through both Compose files):

```dotenv
STAFF_REFRESH_TOKEN_EXPIRY=30d
STAFF_PUSH_ENABLED=false
STAFF_EXPO_PROJECT_ID=68ea9f06-53f5-444f-8760-329fd733ae8e
EXPO_PUSH_ACCESS_TOKEN=
STAFF_CHECKIN_GRACE_MINUTES=10
```

Keep the existing access/refresh signing secrets. `EXPO_PUSH_ACCESS_TOKEN` is needed if enhanced push security is enabled in Expo. The configured project ID must match the mobile app's EAS project. The inbox and event collection work while push sending is disabled.

For Android phone delivery:

1. Configure FCM v1 credentials for this Expo project. The Firebase Android app must use package `com.hygeneops.staff`.
2. Supply the Firebase **client** configuration as ignored `frontend-mobile/google-services.json`, or set the `GOOGLE_SERVICES_JSON` file environment variable. `app.config.js` includes it when present.
3. Store the FCM service account in Expo's credentials service. Never put a service-account JSON file or Expo access token into the mobile app.
4. Install the Android build recorded below (or build with the new `expo-notifications` native dependency/config plugin), sign in on a physical device, and allow notifications. Remote push is unavailable in Expo Go on Android SDK 54. iOS additionally needs APNs credentials.
5. Enable `STAFF_PUSH_ENABLED=true` only after the app and credentials are ready. Smoke-test on a physical phone with the app foregrounded, backgrounded, and closed; also test logout and account switching.

Initial automated verification used isolated databases and a mocked push provider; the application database migration was subsequently applied on 2026-10-18 as recorded above. Install version 2.1.6 or later for native push support.

See Expo's [push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/), [sending and receipts](https://docs.expo.dev/push-notifications/sending-notifications/), and [delivery behavior](https://docs.expo.dev/push-notifications/what-you-need-to-know/).

## Android testing APK built (2026-10-18)

- Artifact: `frontend-mobile/build-output/HygeneOps-staff-2.1.6-notifications.apk` (56,735,127 bytes, approximately 54.1 MiB).
- Version **2.1.6**, Android version code **9**, package `com.hygeneops.staff`; includes ARM64 and ARMv7.
- EAS build `84a93be0-64d6-49d8-92ad-05282a89e1d7` completed successfully using a fresh native prebuild. The isolated source snapshot is recorded in `build-output/notifications-2.1.6-reports/source-manifest.json`.
- The downloaded build was aligned and re-signed with the existing local testing certificate, matching version 2.1.5 so it can be installed as an update. The Expo-hosted original artifact has a different certificate; use the local APK for updates.
- SHA-256: `3be4ef7be77f0b28c8073107f44591656b75058e9c88977787e48b3dcaa17dcb` (also saved alongside the APK).
- API: `http://192.168.100.198:8080/api`; this is a local Wi-Fi testing build. Keep the backend running and the phone on the same reachable network.
- Checks passed: mobile typecheck, 66 mobile tests, Expo dependency compatibility, APK signature and ZIP alignment, package/version/ARM libraries, native camera/location/custom modules, optimized-query and push-registration bundle markers, notification permission/service/default `tasks` channel, Firebase project/sender/app IDs matching the client configuration, and no packaged private service-account JSON.
- Reports are in `frontend-mobile/build-output/notifications-2.1.6-reports/`. No Android device was attached, so installation, native permission prompts, physical sensors, and real push delivery remain unverified.
- At build time push sending was disabled. It was enabled locally on 2026-10-18 at the user’s request (`STAFF_PUSH_ENABLED=true`), and the current workspace’s running backend was restarted through its existing nodemon supervisor. The API responded after restart; the configured Expo project and compiled worker import were verified, and one enabled device registration was present. Ten push-provider/policy tests passed. This confirms activation and registration, not receipt of an alert on a physical phone. The separate systemd service points to an older checkout and was not restarted or modified.

## Event-specific Android alerts (2.1.7)

The original `tasks` and `attendance` channels were created with DEFAULT importance. Android persists channel importance across app updates, so changing those IDs to HIGH in code would not repair existing installs. The new app registers five new channels with HIGH importance, default sound, and distinct vibration patterns. It also registers matching notification categories with actions that open the app; attendance actions do not automatically check a person in or out. Category IDs use underscores instead of channel-ID hyphens, as required by Expo (for example, `staff_task_assigned_v3`).

| Event | Android channel | Visual cue | Action |
| --- | --- | --- | --- |
| New task | `staff-task-assigned-v3` | 🧹 New task assigned; task name | View task |
| Reassigned/cancelled task | `staff-task-changed-v3` | 🔄 Reassigned or ⛔ Cancelled; task name | View updated tasks |
| Shift approaching | `staff-shift-approaching-v3` | 🕒 Shift starts soon | View shift |
| Missing check-in | `staff-missing-check-in-v3` | ⚠️ Check-in needed | Check in |
| Checkout approaching | `staff-checkout-approaching-v3` | ✅ Remember to check out | Check out |

All events share the app's white H status icon, brand blue accent, and full-color large logo. Android controls the layout; the titles, event symbols, context, actions, and vibration distinguish events. Foreground handling requests HIGH priority, sound, and banner/list presentation only for the active staff account. Backend Expo requests use high delivery priority and the registered event channel/category.

Migration `20261018000100_staff_event_alert_channels` adds `StaffPushDevice.alertChannelVersion` with default 1. It was applied to the configured database on 2026-10-18. Existing installs continue receiving alerts through their original `tasks`/`attendance` channels. Only after the updated app successfully creates the new channels/actions does it register version 3, enabling event-specific routing. Do not send messages to an unregistered channel: Expo documents that Android might not display them. No existing device was marked upgraded by the migration.

Install the updated APK over the previous version and open it once. Keep the staff account signed in and allow notifications. Enable Banners/Floating notifications in the phone's app notification settings if disabled. Do Not Disturb and user-selected channel importance still apply; the app preserves these choices. Lock-screen content uses PRIVATE visibility. No full-screen interruption permission is used.

Validation passed: mobile typecheck and 69 tests, backend build and 12 notification tests, isolated PostgreSQL/HTTP delivery tests covering legacy and upgraded device channels, native prebuild icon metadata/densities, and 390px/1440px browser checks confirming the removed page/Listen controls, absent inbox polling, and retained task pagination. Native phone banners and vibration require a physical-device check.

References: [Android channel importance and user control](https://developer.android.com/develop/ui/views/notifications/channels), [Expo message priority, channels, and categories](https://docs.expo.dev/push-notifications/sending-notifications/). Large-icon metadata and foreground priority were verified against the installed Expo SDK 54 source.

## Final Android APK (2.1.7 / code 10)

- Use `frontend-mobile/build-output/HygeneOps-staff-2.1.7-push-alerts.apk`; `LATEST_APK.txt` now points to this file. Size: 59,082,695 bytes (56.3 MiB).
- SHA-256: `efe3d5ef47615e299948696150414eac082f286abd7dad3af5a0f65b9d173b16`.
- Native EAS build: `2929fb66-9ca9-48cb-bf5a-bfdaf68877d3`, successfully compiled Android release with both ARM ABIs and the updated native notification resources, without expo-speech.
- Final review fixed notification category/action identifier compatibility in JavaScript. The final production Hermes bundle was generated locally with `expo export:embed --platform android --entry-file index.ts --dev false --bytecode`, then embedded in that fresh native APK before alignment/signing. Only `assets/index.android.bundle` changed; every native/resource entry stayed byte-identical. Hermes bytecode version matches the native build, and all 18 referenced image-resource variants pixel-match the compiled APK resources.
- The locally signed APK uses the existing testing certificate so it can update the previous app. The unmodified Expo-hosted artifact uses a different certificate and predates the final JavaScript identifier fix; install the local APK above.
- APK verification passed: version/package, signature, 16 KiB ZIP alignment, both ARM ABIs, camera/location/custom capture modules, all five event-channel bundle markers, notification permission/service, small/large logos at five densities, brand accent, matching Firebase client configuration, no private service-account JSON, no speech module, and no removed inbox/speech UI markers.
- Evidence: `frontend-mobile/build-output/push-only-2.1.7-reports/`, including original and final source fingerprints, final-bundle payload/asset compatibility report, APK inspection, signing/alignment, tests, and browser screenshots. Backend push remains enabled. Provider delivery acceptance was observed; native heads-up appearance/vibration on a physical phone remains unverified.
- Install as an update without clearing app data, open once to register event channels, and allow notifications. Use the current local API `http://192.168.100.198:8080/api` with the backend running and phone on the same reachable Wi-Fi. Assign a new task or wait for a current eligible reminder to check the new alert presentation.

## Delivery behavior

Task events are inserted by a PostgreSQL trigger in the same transaction as task writes, including bulk/scheduler writes. Rolling back a task also rolls back its notification. Existing tasks are not backfilled.

The durable delivery worker uses database leases and atomic claims for batches of 50. It retries temporary failures with backoff, up to five attempts, checks Expo receipts, and disables invalid tokens. A receipt for an old push token cannot disable a replacement token. Notifications created before a device's latest account binding remain in the inbox but are not replayed as phone alerts.

An accepted Expo receipt confirms handoff to FCM/APNs, not that the person saw the alert. OS restrictions, permission settings, force-stop, connectivity, expired sessions, and provider outages affect delivery. Network uncertainty after sending can produce duplicate phone alerts; inbox events are deduplicated. Alerts already handed to a provider cannot be recalled by logout. Backend notification records remain durable; the current app exposes phone alerts rather than an inbox screen.

## Verification

```sh
cd backend
npm run build
npm test
VERIFICATION_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:PORT/priv_verification_test npm run test:staff-notifications:integration
```

The integration script only accepts localhost databases with the `priv_verification_test` prefix. It creates a fresh disposable database, applies all migrations, and tests atomic task events, rollback, reminders, concurrent claims, receipt handling, retries, invalid tokens, account isolation, HTTP inbox/read actions, refresh rotation, and logout. Its push transport is mocked; no real notifications are sent.

```sh
cd frontend-mobile
npm run typecheck
npm test
npx expo export --platform web --output-dir /tmp/staff-notifications-web
```

For browser checks, serve that export on port 5191 and run `node tests/notificationsBrowser.mjs` with Playwright installed (or `PLAYWRIGHT_MODULE` pointing to its module). Override `NOTIFICATIONS_TEST_ORIGIN` and `CHROME_EXECUTABLE` as needed. The script checks 390px and 1440px layouts, removed Listen/notification controls, no inbox requests, and working Help/Tasks. `tests/pushNavigation.test.mjs` verifies direct push navigation for all five events while offline and account isolation. Native permission prompts and real heads-up presentation require a device check.
