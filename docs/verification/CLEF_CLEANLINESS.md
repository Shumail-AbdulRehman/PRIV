# Clef cleanliness integration

Automatic passing remains **disabled for every fixture** (`autoPassAllowed` always returns false). No real held-out evaluation, live Cloudflare request, production migration or cutover was performed. Credentials permit inference; they cannot enable VERIFIED_COMPLETE.

## Capture and policy flow

React Native obtains the existing QR/GPS/assignment-bound session and captures a required view. It durably saves/uploads to the backend; the app never calls Cloudflare. The backend stores protected original and sanitized media and enqueues the existing durable verification job.

The worker validates image quality, runs privacy assessment, and performs coverage/item/view identity and duplicate checks. Duplicate candidate processing remains within the existing coverage stage. Wrong/missing identity, exact replay, incomplete duplicate evidence or privacy hold prevents a Clef call. Presence/assignment/QR/session authority is independently checked when applying results and completing tasks.

The CLEANLINESS job sends only the protected sanitized JPEG and immutable fixture type, required view and rubric criteria. Clef is asked a typed cleanliness question for each required surface. It receives no fixture IDs, QR, GPS, task details, room-context photos, reference photos or duplicate candidate images. Unknown/hidden/ambiguous surfaces cannot receive clean credit.

The backend calls Workers AI REST:

`POST https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run/@cf/cloudflare/clef`

The dedicated `ClefCleanlinessProvider` follows the existing `CleanlinessProvider.evaluate` interface. Default selector is `clef`; optional `clef-flash` is an explicitly different configuration, with no fallback. This uses Clef's **System One** typed `choice` questions and embedded base64 JPEGs, not chat completions. API contract: [Cloudflare Clef documentation](https://developers.cloudflare.com/workers-ai/models/clef/), including its linked input/output JSON schemas. Hosted model names are aliases; Cloudflare does not supply an immutable weights revision in this documented contract. Record the evaluated time/configuration and re-evaluate vendor/model changes.

Privacy and coverage keep their existing `AI_PROVIDER` configuration. Clef does not replace them. The legacy v1 verification flow is unchanged.

## Configuration (server only)

Use `backend/.env` for local backend/worker commands. Tracked configuration instructions are in `backend/.env.verification.example`; root `.env.example` and `.env.deploy.example` and both Compose backend/worker environments include the same variables. Compose consumes its root environment, not `backend/.env` automatically. Supply credentials to the deployed **verification-worker** as well as the backend. Never add `EXPO_PUBLIC_` or `VITE_` equivalents.

| Variable | Meaning |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Your server-side Workers AI token |
| `CLOUDFLARE_ACCOUNT_ID` | Account owning Workers AI, 32 hexadecimal characters |
| `CLEF_MODEL` | `clef` (default), or explicitly `clef-flash` |
| `CLEF_TIMEOUT_MS` | 30000 default, bounded 100–60000 |
| `CLEF_CONFIDENCE_THRESHOLD` | Empty by default; no invented production cutoff |
| `CLEF_THRESHOLD_VERSION` | `unvalidated-no-threshold` by default; set a distinct candidate version with each candidate threshold |

For evaluation, choose a threshold **on development data**, record it with a distinct version, and freeze it before held-out evaluation. Values range from 0 to 1. With no threshold, raw predictions are persisted but the effective verdict is CANNOT_ASSESS. Setting a candidate threshold never opens automatic passing. Confidence is Clef's documented derived confidence, not a calibrated probability of correctness; both it and all per-option probabilities are retained.

Cleanliness evaluator versions hash the selected model, adapter/prompt version, threshold and threshold version. Jobs are unique by immutable attempt/stage/evaluator version. A worker rejects a queued Clef version if its deployment configuration changed. Preserve the job's original configuration when draining queued work; do not silently infer it with a new model/cutoff. Rubric/view/media are immutable attempt snapshots. Recorded successful jobs are reused, including uncertain/invalid inference results.

## Outcomes, compatibility and staff actions

- **CLEAN:** Every required visible surface meets the rubric and configured candidate threshold. Clef stage/prediction is saved successfully; the requirement stays REVIEW_REQUIRED while the automatic-pass gate is closed. Staff sees manager-review guidance. Only the completion service can finalize a task after all independent gates; an audited manager acceptance produces completion with exceptions.
- **DIRTY:** At least one required surface fails cleanliness and none is unassessable. Policy creates CLEANING_REQUIRED only for that requirement/view. Catalog-generated copy names supported affected surfaces, e.g. “Clean the bowl and take another photo.” Passed views remain passed.
- **CANNOT_ASSESS:** Low confidence, tied/ambiguous output, absent candidate threshold, unreadable surface, missing/invalid/malformed inference. It requests a better capture, never accuses staff of dirt. The existing per-view recapture counter escalates at its configured limit (default third failure). Missing/invalid successful API output is saved with `assessmentStatus: INVALID_RESPONSE`.
- **SERVICE_FAILURE:** Timeout, network/service outage, rate limit, authentication/configuration or unsupported-image/API errors remain technical failures. The durable queue records an error code, retries with existing backoff/jitter, and escalates to service review after retry exhaustion. They consume no cleaning failure allowance and never become DIRTY.

New provider outputs use CLEAN / DIRTY / CANNOT_ASSESS. Historical NEEDS_ATTENTION records remain immutable/readable; the typed validator and staff DTO adapt them to DIRTY, while legacy policy readers continue accepting the stored class. Existing v1 rubric snapshots remain valid; new rubric outcomes no longer offer NEEDS_ATTENTION. No database migration is required.

Successful job/attempt JSON retains model/requested model, adapter/prompt/rubric/evaluator versions, confidence, raw per-surface choices/probabilities, threshold/version/unvalidated status, duration, request identifier, usage when returned, unknown monetary cost as null, status and retry count. Failure job JSON retains available safe telemetry; the last error/retry count is durable. No image bytes, tokens or signed URLs enter these metrics. Staff DTOs expose only enumerated verdicts and catalog instructions.

## Real held-out evaluation

No labelled real dataset is included. Synthetic unit/integration fixtures are tooling checks, never accuracy evidence.

Prepare a private JSON array. Each row needs consent, independent human labels, room/fixture IDs and development/heldout split, a sanitized local JPEG, required view, and its immutable rubric. Privacy must be independently cleared (`privacySafe: true`) before the runner sends an image. Resolve relative image paths from the manifest directory. For example:

```json
[
  {
    "id": "heldout-sink-001",
    "roomId": "room-heldout-a",
    "fixtureId": "sink-a-1",
    "fixtureType": "SINK",
    "split": "heldout",
    "consented": true,
    "visibility": "ASSESSABLE",
    "identity": "CORRECT",
    "cleanliness": "DIRTY",
    "privacySafe": true,
    "rubricVersion": 1,
    "imagePath": "images/sink-001.jpg",
    "requiredView": "basin_tap",
    "rubric": {
      "version": 1,
      "criteria": [
        "Required surface is fully visible and assessable.",
        "No visible loose waste, soil, residue or pooled liquid on the required surface.",
        "Distinguish permanent wear, discoloration or damage from removable dirt.",
        "If visibility or condition is ambiguous return CANNOT_ASSESS."
      ],
      "views": [{"key": "basin_tap"}],
      "surfacesByView": {"basin_tap": ["basin", "drain", "tap"]}
    }
  }
]
```

Use fixture-type labels consistently: `SINK` (basin/sink), `INDIAN_TOILET`, `WESTERN_TOILET`, `FLOOR`, and supported others (`MIRROR`, `BIN`, etc.). Do not relabel an unknown toilet subtype as a known one. Use separately human-labelled CANNOT_ASSESS/UNASSESSABLE cases for unusable images. Historical NEEDS_ATTENTION labels are still accepted by the reporter but new datasets should use the three-class contract.

The CLI performs **paid inference** and does not contact the task database. From the backend directory (so dotenv reads `backend/.env`):

```sh
cd backend
# First set CLEF_CONFIDENCE_THRESHOLD and CLEF_THRESHOLD_VERSION to your frozen candidate.
npm run verification:clef-evaluate -- /absolute/private/manifest.json /absolute/private/clef-predictions.json
# Resume an interrupted run without re-inferring saved rows:
npm run verification:clef-evaluate -- /absolute/private/manifest.json /absolute/private/clef-predictions.json --resume
npm run verification:benchmark -- /absolute/private/clef-predictions.json /absolute/private/new-clef-report.json
```

It validates consent, duplicate IDs, room/fixture split leakage and rubric surfaces before inference, checkpoints after each image and checks input/image/config hashes on resume. Existing files are not overwritten on a fresh run. Saved SERVICE_FAILURE rows also remain saved on resume; retry those only in an explicit new run. A process interruption after the API call but before the checkpoint cannot guarantee vendor-side exactly-once billing. Normal durable jobs avoid rebilling when a successful result is already recorded.

`cleanliness` and `cleanlinessPerFixture` report total CLEAN/DIRTY, correct CLEAN/DIRTY, false CLEAN on DIRTY, false DIRTY on CLEAN, CANNOT_ASSESS, service/unusable counts, sorted confidence distributions and Wilson intervals. **False CLEAN rate on human-labelled DIRTY is the primary metric.** WRONG/REPLAYED examples are excluded from these cleanliness populations and counted separately under integrity/legacy pipeline metrics.

The Clef-only runner always writes `wouldAutoPass: false` and does not fabricate privacy/coverage/duplicate predictions. Provide actual separately measured quality/privacy/coverage/identity/duplicate evidence and hypothetical candidate policy passes to the existing combined reporter when evaluating the full release gate. `--require-targets` still requires the original independent integrity/stage evidence and per-fixture populations. A cleanliness-only run cannot establish the entire pipeline release gate. The report never activates runtime passing. Existing held-out release targets remain in force (at least 100 DIRTY, 100 wrong/replayed, false-clean <=2%, zero wrong/replay candidate passes); review sparse fixture types independently.

## Manual Cloudflare setup

1. Enable/access Workers AI for your Cloudflare account and confirm model availability and billing/quota.
2. Ensure the API token has account-scoped **Workers AI Read** permission on the account matching `CLOUDFLARE_ACCOUNT_ID` (Cloudflare's REST getting-started permission). Keep the token in backend/worker secrets.
3. No custom Cloudflare Worker, public image bucket, mobile SDK, DNS change or AI Gateway is required. HygeneOps calls the Workers AI REST endpoint directly.
4. Configure and evaluate the candidate threshold/version, collect the real labelled data, and review the measured report before a separately scoped activation change. This implementation contains no environment bypass for that gate.

## Validation for this implementation

- Backend unit regressions: **228 tests passed, 29 files**.
- Backend build (Prisma client generation and TypeScript): passed.
- New evaluation/reporter scripts: separate TypeScript no-emit check passed.
- Compiled worker entry syntax checks: passed.
- Isolated PostgreSQL verification integration, lifecycle and compiled-worker process suites: passed. The main suite exercises the actual Clef adapter against mocked HTTP, durable result persistence, timeout retry, rate-limit exhaustion, no rebilling, the closed CLEAN gate, and third-unresolved-result escalation. Existing replay/privacy/identity/authority/completion/passed-view preservation assertions remain.
- Synthetic evaluation CLI inference, checkpoint/resume without repeated inference, and report generation: passed. These artifacts live under `/tmp/hygeneops-clef-cli-smoke` and are **not real evaluation evidence**.
- `git diff --check`: passed.

Final retained local databases: main `priv_verification_test_1791317401850_385`, lifecycle `priv_verification_test_lifecycle_1791317190054`, worker `priv_verification_test_worker_1791317191263`. All suites create fresh local test databases and retain them; the customer database is not used. Expected negative-constraint Prisma logs and the existing pg concurrent-query deprecation warning remain.
