# Independent approved-reference renders

24 fresh immutable V5 reference PNGs: Organization/My account/Security owner tabs,
manager My account, Help and Information at1366×900 and390×900, EN/UR. These are
**reference-only** screenshots; actual React/API/SQL evidence is in sibling
`v5-settings-evidence/` and `v5-help-evidence/` directories.

Rendered with installed Playwright1.58.2 and Google Chrome `/usr/bin/google-chrome`,
fonts settled, no response interception, fresh context per viewport/language.
`reference-manifest.json` records path/action/title/overflow/errors. All24 rendered
without page overflow or JavaScript errors. `capture-references.mjs` writes only this
evidence directory and reads the approved reference through a static server.

To reproduce from repository root, first ensure5197 is free and start a temporary
read-only reference server:

```bash
python3 -m http.server 5197 --bind 127.0.0.1 --directory design/v5
```

Then in another terminal:

```bash
node docs/implementation/v5-parallel-qa-evidence/capture-references.mjs http://127.0.0.1:5197
```

Stop only the temporary server you started. Do not use a customer database,
production service or invented positive operator session for actual-app captures.
The coordinator's guarded existing browser runner owns actual-app evidence.

Full review and acceptance boundaries: [QA report](../V5_PARALLEL_QA.md).
