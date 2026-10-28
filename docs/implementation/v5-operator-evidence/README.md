# V5 operator boundary evidence

Source revision: `25440e1` (based on verified combined8ff718e). Captured28Oct2026;
final inspection29Oct2026. `manifest.json` records dimensions, hashes and source
hashes. `render-results.json` records the12 base observations. The40 PNGs contain
12 reference images,12 actual viewport captures,12 supplemental full pages and4
actual cleanup receipts; image counts are not accepted-screen counts.

The actual pages are the private production React build from the isolated
operator worktree, served by the existing guarded Spec40 runner against its own
matching private API. The browser made no API requests from operator entry,
callback, own-security or direct guarded metadata routes. The third browser case
used actual persisted synthetic owner/manager/staff logins solely to prove401
API denial and preservation of tenant identity after local operator cleanup.
No positive HTTP response was replaced, provider activated, or real customer
record accessed. No browser auth-state, trace or video was saved.

At1366×900 and390×900, EN/UR, the login uses the approved public centered brand,
heading, single panel and language control. Final phone EN title and badge
placement were corrected after the initial comparison, then freshly captured.
All12 final base application views were opened and inspected, together with
matching login references and security references. Cleanup receipts in English
and Urdu were inspected. No horizontal overflow or page errors were reported;
44px desktop/48px phone buttons were asserted by the browser.

Intentional differences:

- Prototype reviewer bar/gallery, sample account, fake MFA and fictional
  identities are absent. The real unavailable provider has a disabled action
  and a persistent explanation, company-role separation and recovery guidance.
- No qualified provider exists. `/platform/security` therefore uses the public
  unavailable boundary instead of fabricating the reference's authenticated
  operator sidebar/session facts. Its safe local cleanup is expressly separate
  from provider logout. Positive security/MFA parity remains unverified.
- V5 has no dedicated callback failure entry; its public sign-in reference is
  used for the callback composition. Actual callback rejection is translated,
  URL material is scrubbed, and no operator session is created.
- Public notices are longer than fictional prototype forms. Card height follows
  real copy, the desktop public foundation stays432px wide and phone margins24px.

Reproduce from this worktree using the explicitly owned isolated bootstrap:

```sh
HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56442/priv_e2e_test npm run test:e2e --prefix frontend -- operator-v5.spec.ts
```

Final run: **3 passed in24.7s**. The initial3-case run overlaps these same cases
and is not added as unique coverage. Guarded final run compiles backend,
strict E2E TypeScript and frontend, builds private assets, migrates/creates only
a disposable UUID test database and cleans that runtime/database afterward.

Unit verification is separate:17 operator cases; whole frontend64 Node+276
React/21files; full frontend lint0; TypeScript/production build pass. Overall
Spec34 remains **In progress** until the real IdP/state/nonce/PKCE/MFA and
provider logout/security workflow is selected and qualified.
