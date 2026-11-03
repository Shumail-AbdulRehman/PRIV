# V5 public authentication evidence — issue86

79 PNGs plus `render-results.json`. Matching1366×900 and390×900, English and Urdu.
36 observations record no horizontal overflow or browser JS errors. Main public
routes also assert the approved40px brand-to-title spacing in the rendered build.

| Approved reference | Actual application |
|---|---|
| [Login desktop](v5-login-1366-en.png) | [Real credential form](app-login-1366-en.png) |
| [Login Urdu phone](v5-login-390-ur.png) | [Translated actual form](app-login-390-ur.png) |
| [Recovery](v5-recovery-1366-en.png) | [Actual recovery](app-recovery-1366-en.png) |
| [Reset Urdu phone](v5-reset-form-390-ur.png) | [Real reset form](app-reset-form-390-ur.png) |
| [Verify](v5-verify-form-1366-en.png) | [Explicit confirmation](app-verify-form-1366-en.png) |
| [Staff handoff](v5-handoff-390-ur.png) | [Actual STAFF session](app-handoff-390-ur.png) |

Additional actual screenshots cover signup, missing/invalid links, independently
reachable account security, delivery unavailable, login denial and pending sign-in.
Signup reuses the V5 login/public shell; there is no dedicated signup gallery entry.

Actual application screenshots use real compiled React/API and synthetic persisted
SQL fixtures in the guarded spec40 runner. No restored customer data or operational
photos. No API response interception. The pending test adds transport delay only,
then forwards the original request; credential fields are masked during capture.
No password/token value is persisted in images, traces, video or saved auth state.

Reset/verify form captures use a shaped but **never-issued** synthetic fragment;
the real app scrubs it before rendering. Explicit verification returns actual400.
These are invalid-link/form tests, not proof of positive delivery or valid token
acceptance. No provider or native-device qualification is implied.

Inspected corrections: replaced the older preview/navbar composition, used actual
V5 journey cards, translated real forms, corrected the stretched language control,
and made recovery links clearly interactive. Real credential forms, password rules,
receipt language and configured unavailable states replace prototype sample controls.
The reviewer bar/gallery/policy-placeholder content is intentionally absent.

See [V5_AUTH.md](../V5_AUTH.md) for functional evidence, intentional differences,
provider limits, remaining acceptance and the new-session checkpoint.
