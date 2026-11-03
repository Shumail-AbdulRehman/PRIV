# Spec 34 local acceptance evidence — 2026-10-29

Full specification status: **Blocked on approved identity-provider configuration
and qualification**. This evidence accepts only the existing unavailable public
boundary, never real OIDC/MFA or an authenticated operator workspace.

## Provenance and checks

Baseline `d25f4111e4d101bad0f45f0309fd05b6a669b1a7` is the fetched, confirmed
OPEN/DRAFT PR105 HEAD. Captures come from this isolated Spec34 checkout:
`/home/shumail/.local/share/hygene-ops/v5-spec34-20261029/implementation`.
The only executable-code change is four additional component security regression
cases; authentication runtime, backend, dependencies and approved design are unchanged.
Source/reference hashes are in `manifest.json`.

The existing Spec40-owned command was run without modifying its harness:

```sh
HYGENE_E2E_DATABASE_URL=postgresql://spec34_test@127.0.0.1:56534/priv_e2e_test npm run test:e2e --prefix frontend -- operator-v5.spec.ts
```

It created a dedicated UUID child database, applied actual migrations, seeded
synthetic two-company owner/manager/staff fixtures, compiled the actual backend
and frontend/browser TypeScript, built private React assets, and started its own
loopback API and Vite preview. It never attached to existing5173/8080services or
loaded a checkout .env. Browser API targets were the runner's allocated loopback
API, with ephemeral ports recorded privately in `browser.log`. All3cases passed
in21.7s, zero retries/skips/flaky/unexpected results. No positive response was
intercepted; no provider was contacted or simulated into an operator session.

1. Actual public login/security/callback, no tenant bootstrap/API request, disabled
   handoffs, callback response removal, EN/UR direction,44px desktop/48px phone
   buttons, no overflow or JavaScript errors.
2. Keyboard skip/focus, language persistence after reload, direct companies,
   company-detail/service/audit/inquiries/unknown routes remain unavailable.
3. Actual owner/manager/staff tenant cookies receive401 from platform company and
   diagnostics endpoints; local platform cleanup preserves their real tenant
   current-user identity. This is real isolated HTTP/SQL proof of denial, not
   proof of provider sign-in or MFA.

The runner removed its child database and servers. A final SQL count confirmed
zero `priv_e2e_test_%` databases, then only the owned56534cluster was stopped.
The historical `v5-operator-evidence/` tree was restored byte-for-byte; fresh
outputs are saved here instead. No credentials, tokens, traces or auth state are saved.

## Visual inspection

Matching viewports are1366×900 and390×900, both EN and UR. All12base actual-app
captures and their12matching references were inspected through six comparison
sheets, plus four cleanup receipts.40PNGs consist of12base actual,12supplemental
full pages,12references and4cleanup receipts; they do not represent40flows.
`render-results.json` records12clean route observations. Source/reference/image
hashes and actual image dimensions are in `manifest.json`.

The centered brand/title/card, identity badge, blue/white surfaces, spacing,
readable wrapping, language controls and RTL follow the approved public foundation.
No new visible defect was found in these available states. Deliberate differences:

- V5's reviewer bar/gallery and sample identity selector are prototype tooling and
  are omitted. The real card explains missing configuration and operator/tenant
  separation instead of offering a fictional provider challenge. This makes the
  real card taller; desktop vertical placement also excludes the reviewer bar.
- V5 operator-security depicts a fictional authenticated operator sidebar/session.
  The actual route shows a public no-session explanation and honest local cache
  cleanup. Its positive authenticated layout/controls remain unverified and cannot
  be accepted without a real provisioned provider session.
- Callback has no dedicated prototype; its shared public composition is compared
  with operator-login. Its rejected-response panel correctly replaces sample
  sign-in content. No callback exchange or valid state/nonce/PKCE is claimed.
- No native UI was changed or physically verified. Browser captures are web evidence.

## Automated evidence

-21focused operator component tests, including4new regressions: callback clears
 operator cache and preserves company identity; external callback return destination
 is ignored without code exchange; late ignored-abort response cannot restore
 cleared data; cancellation failure still removes only operator cache.
- Full frontend64Node+390React/28files,0failures/skips; command
 `npm test --prefix frontend -- -- --maxWorkers=1`. Component suite175.49s under
 concurrent checks; the existing serial setting avoids lazy-shell timing contention.
- Full backend1444passed/7existing integration skips,94files passed/1skipped;
 `DATABASE_URL=postgresql://spec34_unit@127.0.0.1:65432/spec34_unit_nonexistent npm test --prefix backend -- --maxWorkers=2`.
 Missing integration environment is explicit; no unknown database was contacted.
-186focused backend tests/4matched files: operatorIdentity.service,
 platformSupport.service, auth.middleware and launch.route. The initial selector
 also named nonexistent plural `platformCompanies.service.test.ts`; no tests are
 attributed to that selector. The actual singular platformCompany.service tests
 are covered by the full backend run.
- Full frontend lint, backend build/TypeScript, frontend build/TypeScript and
 strict browser TypeScript pass. Backend has no configured lint script.
 Vite's plugin-timing advisory is non-failing; no hosted CI result is inferred.

Private raw logs and inspection sheets live in the Spec34worktree's parent.
An audit of23other existing worktrees and799dirty/untracked path hashes reports
zero HEAD/status/content mismatches. No other specification, production data,
merge, deployment or live identity-provider configuration changed.
