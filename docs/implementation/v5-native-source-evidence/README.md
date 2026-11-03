# Native V5 source preview — not native acceptance

Eight390×900 observations cover actual RN Web exported My day, Tasks, Start task
and Help in EN/UR. Ten PNG artifacts include unchanged V5 mobile references.
The coordinator inspected hierarchy, type, RTL, available actions and no-overflow
states; initial Urdu Latin serif fallback was corrected and recaptured.
`image-index.json` records dimensions/SHA256; `preview-results.json` records scope.

Reproduce from the coordinator with its sibling native export:

```bash
node frontend/e2e/native-source-preview.mjs /absolute/path/to/native-web-export
```

The actual exported app uses synthetic stored identity and intercepted HTTP
responses. Expo Camera's eagerly imported web decoder is explicitly inert and
offline. No native camera, GPS, QR recognition, push, provider, real identity or
real persistence is qualified. No mutable API request is performed. A private
loopback static server and browser are cleaned on exit. Native37 stays In progress.

See `../V5_NATIVE_COMPOSITION.md` for actual source behavior/tests and native gates.
