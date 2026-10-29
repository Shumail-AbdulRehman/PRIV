# Spec38 final visual evidence — 2026-10-29

Source base2011a90 plus the scoped application changes recorded by the manifest's
capture-time diff hash. `production-source.json` records final runtime file hashes;
all final application changes, including existing Android-help fragment navigation,
were present for the final renders. No runtime source changed afterward.

Reproduce from this checkout with existing installed dependencies:

```bash
backend/node_modules/.bin/tsx docs/implementation/v5-help-evidence/capture-spec38.mjs
```

The script uses only private loopback servers and builds in `../visual-runtime`,
never the existing application or database. It imports the actual configuration-only
`customerSupportRouter`/`getSupportContact` and serves compiled React. No SQL is
needed; the import uses an explicit non-listening loopback test URL, never .env.
Its public server is a scoped verification surface, not the full Spec40 backend.

Two separate build/process configurations:

- Unavailable: no policies/distribution or qualified contact; actual API200 explicitly
  unavailable. No recipient, legal text, price, retention promise or URL invented.
- Configured fixture: `.invalid` document/distribution URLs and email, explicitly
  synthetic approval flags in this test process/build only. Actual router/service
  validates and returns that configuration. This is conditional rendering proof,
  never real legal/mail/device qualification. No links followed/email opened.

Every base render makes only credential-free GET `/api/support/contact` requests.
An unrelated synthetic browser cookie is omitted from those requests; response
cache control is private/no-store. Public diagnostics is404. No tenant identity,
workforce record, stored auth state, trace, video or real credentials are used.
External browser HTTP is blocked. Test servers/browser are cleaned in finally.

Matrix:2pages ×2widths(1366/390) ×2languages(EN/UR) ×2configurations =16base app
observations. Eight reference images are shared across configurations. Four FAQ
images and six phone loading/stale-network-error/retry images give34PNGs total.
The two extra state observations group each language's3states;18observations is
not18integrated E2E flows or a whole-product completion count.

Delayed request forwards the original response. Network errors explicitly abort
transport, then retry the actual route. They do not qualify a provider outage.
Assertions cover RTL, overflow, language targets, distinct link names, FAQ,
navigation/main focus/scroll and stale contact hiding. All final34images inspected.
State inspection led to real scroll/focus and label-alignment fixes before final
capture. The four changed loading/error images were reinspected after the final fix;
other final images matched the inspected hashes.

References contain fictional identity/sidebar/reviewer tools and preview ticket
form. Actual Help remains public with a brand/language header and real support
handoff; unsupported ticket submission and reviewer tools are omitted. Information
retains the centered card and expands truthful availability/photo guidance.

No production, physical device, real mailbox/legal/distribution/photo/merchant
qualification. Those existing release gates remain unverified;30 stays Blocked.
