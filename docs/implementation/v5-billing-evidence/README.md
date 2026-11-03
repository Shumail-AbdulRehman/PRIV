# V5 billing and owner-access evidence — 2026-10-29

86 PNG artifacts:70 actual-app captures and16 untouched V5 reference captures. Full-page companions and repeated visual states are artifacts, not additional unique user flows. Every PNG has an exact width/height and SHA256 in manifest.json.

Baseline paired views: billing and owner access,1366×900 and390×900, English and Urdu. Supplemental captures cover over-limit capacity, provider states/null dates/scheduled change, unlinked/activation-pending/reconciliation, suspended and legacy inactive accounts, loading, initial failure, retained refresh failure and explicit recovery. Actual requests are delayed then forwarded for loading or aborted for named failure tests; no successful API response is fabricated.

All captures come from the real compiled React app, its matched private backend and an18-migration disposable synthetic PostgreSQL UUID child on owned loopback56442. Neither the restored customer database56445 nor user5173/8080 services was used. The runner sanitizes env, disables Paddle, uses one Chromium worker and drops the child/runtime. No auth state, token, payment secret, real worker photo or password field is captured.

Final application source5f90451: main27-case browser regression gate passed; the two later access-state tests change only the harness and also passed. These29 distinct browser cases overlap the existing Spec40 suite and do not complete its full provider/native flow table. Earlier27-case run repeated the same flows before a visual CSS-class collision was corrected; do not add both as54 unique flows.

The coordinator inspected all16 core paired viewport frames and supplementary billing/access state and full-page images. The recovery style collision was fixed and affected frames recaptured: the main recovery action is fully within the desktop and phone viewport. No current core overflow, clipping or unreadable control issue was found. Contract-driven differences and limits are in ../V5_BILLING.md. Source/network review was independent across three agents; final visual review was coordinator-led after QA quota exhaustion.

Positive checkout/portal behaviors are unit-boundary mocks. Actual merchant/catalog/terms, sandbox payment/portal/webhook, IdP, delivered mail, privacy and physical native qualification remain external. No release availability is claimed from these artifacts.
