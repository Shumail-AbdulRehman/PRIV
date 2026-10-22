# V5 customer authentication checkpoint — issue86 / spec30

Overall V5/spec30 acceptance remains **incomplete**. This correction implements the
approved public journey composition in the real application. It does not certify
company settings, native visuals, qualified email delivery or platform identity.
Historical issue58/PR62 and registration-defect records are preserved.

## Updated actual screens

- `/login`: centered V5 brand/title/card/language control; real owner/manager/staff
  credential forms; translated field validation, denial and pending states.
- `/signup`: same V5 public composition, real owner/company registration fields,
  translated validation/receipt, preserved atomic signup and session-failed behavior.
- `/recover-owner-account`: V5 recovery heading/form; actual API, neutral receipt
  and honest unavailable-delivery feedback.
- `/reset-owner-password`, `/verify-owner-email`: same public shell; missing/invalid
  links, real form/confirmation and explicit POST security retained. Password/email
  fields use LTR direction inside Urdu layout.
- `/account/security`: shared public security form, still independently reachable
  when billing/company operations are restricted; forced replacement remains separate.
- STAFF role handoff on protected web destinations: V5 public handoff, actual signed-in
  identity and logout; existing approved-distribution guard controls download links.
  No fake native/app-open destination or prototype sample button.

`AuthShell` replaces the old marketing navbar/dashboard sample preview. It reuses
BrandLogo, LanguageChoice, existing controls, typography and blue/white tokens.
The gallery's actual HTML loads `journeys.js`/`journeys.css`; its centered public
composition is authoritative. Unused split-auth functions in `app.js` are not the
rendered login/recovery references. No design/prototype files were modified.

## Functional correction

The confirmed registration race is fixed in GuestRoute. When Redux authenticates
an ADMIN while still on `/signup`, it chooses canonical `/subscription`, agreeing
with the signup hook's `/choose-plan` handoff. Other roles/login/welcome destinations
remain unchanged. Atomic backend creation, session-delivery failure, cache clearing,
billing entitlement and provider requirements are preserved. The original failing
persisted browser test now passes without interception or changed expectations.

## Four independent facts

| Fact | Current evidence / limits |
|---|---|
| Functional implementation | Existing APIs retained; registration destination corrected; staff boundary retained |
| Visual implementation | Actual centered V5 public cards, forms, typography, controls, EN/UR/RTL and phone layout |
| Functional verification |64 Node +235 React tests/19files;50 focused account/auth/role checks;21 real API/SQL browser cases passed |
| Visual verification | Matching1366×900/390×900 English/Urdu reference/app renders,36 zero-overflow/JS-error observations; inspected and corrected language sizing; provider-issued positive reset/verify qualification remains open |

## Evidence and tests

`frontend/e2e/customer-auth-v5.spec.ts` uses the compiled real frontend/backend and
guarded migrated synthetic SQL database. No HTTP response is replaced. A pending
sign-in test delays then forwards the original request to the real API; credential
fields are redacted by the screenshot operation itself. Other captures have empty
password fields. Traces/videos/automatic failure screenshots remain disabled.

A random shaped **never-issued** fragment exercises the real reset/verify form
and actual invalid-token400. It confers no authority, is scrubbed before app reads,
and is kept out of navigation call logs/artifacts. These renders are not proof of
a delivered valid recovery/verification link. Real provider delivery remains unavailable.

79 PNGs and the render manifest are under [v5-auth-evidence](v5-auth-evidence/README.md).
The21-case run covers auth screenshots, actual staff login/logout, pending/rejected
sign-in, real recovery503, persisted registration/password revocation, staff recovery,
manager replacement, refresh concurrency, private media denial, original registration
landing regression, owner session reload/logout, settings persistence/conflict,
read-only setup, role/tenant/site denials, unconfigured billing, restricted-account
security and actual inquiry persistence. It is a scoped run, not whole-product release
qualification. The final five-case capture rerun passes in23.4s; all79 PNG widths match their labels.

Frontend lint, TypeScript and production build pass. The runner separately compiles
backend, browser test types and frontend before serving private production assets.
Backend owner-identity tests60/1file pass; these tests do not qualify delivery.
Backend business code/schema/dependencies were not changed.

## Intentional differences and open gates

- Prototype reviewer bar, gallery link, fictional identity dropdown, fake success,
  policy-decision placeholders and preview actions do not ship. Real credentials,
  owner/company fields and actual password rules necessarily add form height.
- Signup has no separate V5 prototype entry: its existing functional fields use
  the approved login/public-card foundation. It is not a new design artifact.
- Missing and invalid links do not falsely claim expiration or a completed reset.
  No action is consumed on GET; explicit server-authorized POST remains required.
- `/account/security` keeps a public shell rather than requiring company operational
  access, because password replacement must work for restricted accounts. The V5
  settings/security reference is captured; full company settings composition remains
  the next unimplemented visual group.
- No approved Android link is fabricated. Existing38 configuration validation is
  reused. These web captures do not establish native/device acceptance.
- Successful delivered-owner-link/provider states remain unqualified; company
  settings, other web pages and full V5 acceptance remain incomplete.

User requests **stop after this checkpoint and write a handoff for a new session**.
Do not start organization settings or another group in this session. Preserve all
original dirty changes; no merge, reset, deployment or production database changes.
