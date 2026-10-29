# V5 platform visual evidence

This directory is owned by Specification40's explicit visual-correction harness.
The runner is `frontend/e2e/platform-visual.mjs`, with its test-only React entry and
synthetic response store beside it. It is not imported by the application router.

Run serially from the intended integrated checkout:

```bash
node frontend/e2e/platform-visual.mjs --mode all
```

For review against another checkout, use `--source /absolute/checkout` and an
explicit `--out /absolute/evidence`. Available modes: `core`, `states`, `guard`,
`all`. The runner creates its own loopback Vite server on an ephemeral port,
uses an empty temporary env directory, disables the normal proxy, rejects any
unexpected real `/api/` request and removes its temporary runtime on exit. It
does not connect to PostgreSQL, a provider or the existing development services.

## Provenance and limits

- Positive views are the actual exported `CompanyWorkspace` and `ServiceWorkspace`
  with their actual React/query/language/router components and styles. Only
  `operatorRequest` is replaced in the runner's in-memory Vite transform when
  the test-only named-component entry sets its local flag.
- The response store uses synthetic names, metadata, versions and reasons. Its
  recorded saves, conflicts, uncertain results and reloads are in-memory fixture
  behavior, **not SQL persistence or authenticated-route proof**.
- Guard observations load the normal application router directly. The test flag
  is absent, the original unavailable operator branch executes, and no fixture,
  tenant or operator API request is permitted. Local-storage claims do not grant
  access. This does not qualify a positive IdP/MFA/browser session.
- References are the unchanged approved `design/v5` offline prototype. Fictional
  metrics, example contacts, unsupported provider controls and reviewer chrome
  are reference-only; they do not become product data or acceptance claims.
- Core app/reference frames use1366×900 and390×900 viewports, English/Urdu. Extra
  full pages are labelled separately. Significant empty/loading/error/retry and
  conflict/uncertain/pending states supplement the core frames.

Each completed run writes `<mode>-results.json` and `<mode>-manifest.json`, binding
the source root/revision and relevant source hashes to image SHA256/dimensions.
A failed run writes `<mode>-failure.json`; failed/partial observations never become
completed acceptance. The independent QA report records actual executed commands,
inspected images, findings and current status.

Current state: harness prepared; final integrated-source execution is pending.
