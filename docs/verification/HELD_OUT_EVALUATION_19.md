# Step 19: running a real held-out evaluation

For the current Clef model runner, frozen threshold configuration, three-class contract, and separate cleanliness/integrity metrics, follow [CLEF_CLEANLINESS.md](CLEF_CLEANLINESS.md). The commands below remain the combined pipeline reporting/release gate.

No real held-out dataset has been supplied. The existing offline harness is `backend/scripts/verificationEvaluatorBenchmark.ts`; it reports supplied labels and predictions. It does not call a provider, fetch images, tune thresholds, or enable production automatic passing. Unit-test examples are synthetic and must never be included in an evaluation dataset.

## Prepare and freeze the evaluation

1. Obtain consented empty-room/fixture photographs across actual phones, lighting, wear, stains, reflections, wrong fixtures and replay transformations. Keep these private; do not commit customer photographs or identifiable labels to this repository.
2. Independent human reviewers label visibility, identity and visible cleanliness separately. Include at least 100 held-out DIRTY and 100 known wrong/replayed examples. These populations may overlap; report them separately. Split development/held-out by both room and fixture before tuning. Never tune on held-out failures and then reuse those same examples as held-out evidence.
3. Freeze the evaluated provider, actual returned model revision, requested alias, prompt/rubric versions, stage adapters, quality/duplicate thresholds and candidate pass policy. Record that manifest alongside the dataset and report. Use one configuration per report. A `promptVersion` should identify the frozen stage-prompt bundle. A changed coverage/privacy/duplicate/cleanliness configuration requires a new evaluation.
4. Run the separate quality/privacy/coverage/duplicate/cleanliness stages outside production task completion, using real images and the frozen configuration. Export the actual predictions, latency and nullable measured cost. Manually entering invented predictions is not evaluation. Include failures/uncertain outcomes; do not drop them from the denominator. `wouldAutoPass` means the evaluated candidate policy would credit this example if enabled, independently of the current always-closed deployment gate. Do not export the production gate's unconditional `false` as the candidate decision; that would conceal wrong/replayed passes.

## Input format

Supply a JSON array, one row per independent example, using the strict contract in `backend/src/services/verification-v2/evaluatorBenchmark.ts`. Required fields:

| Fields | Meaning |
| --- | --- |
| `id`, `roomId`, `fixtureId`, `fixtureType` | Unique example and stable anonymized grouping IDs; fixture type must match the evaluated scope |
| `split` | `development` or `heldout`; only held-out contributes to metrics |
| `consented` | Must be `true` |
| `visibility` | Human `ASSESSABLE` or `UNASSESSABLE` |
| `identity` | Human `CORRECT`, `WRONG` or `REPLAYED` |
| `cleanliness` | Human `CLEAN`, `NEEDS_ATTENTION`, `DIRTY` or `CANNOT_ASSESS` |
| `predictedCleanliness` | Actual `CLEAN`, `NEEDS_ATTENTION`, `DIRTY`, `CANNOT_ASSESS` or `SERVICE_FAILURE` |
| `wouldAutoPass` | Actual frozen candidate-policy decision, boolean |
| `provider`, `model`, `promptVersion`, `rubricVersion` | Recorded evaluated configuration; rubric version is a positive integer |
| `requestedModel` | Optional requested model alias; returned revision belongs in `model` |
| `latencyMs`, `costUsd` | Actual nonnegative latency and cost; unknown cost must be `null` |

Step 19 adds stage fields. Old exports still parse, but missing fields block `targetMet`:

| Fields | Meaning |
| --- | --- |
| `predictedCoverage` | Actual `MATCH`, `WRONG_ITEM`, `MISSING_SURFACE`, `UNCERTAIN` or `SERVICE_FAILURE` |
| `identityConsistent` | Actual coverage identity-consistency decision |
| `qualityPassed`, `privacySafe`, `duplicateClear` | Actual stage results as booleans; unresolved/failed stages are `false` |

If an upstream stage prevents cleanliness assessment, export `CANNOT_ASSESS` for evidence uncertainty or `SERVICE_FAILURE` for an execution failure, and `wouldAutoPass: false`; record the stage reason and raw-result provenance in the private dataset manifest. Such rows remain in metrics. The reporter accepts only the columns above; provenance belongs in a separate private artifact.

Use `[]` as an empty dataset to inspect the report structure; it reports DATASET_UNAVAILABLE, not measured zero error. No fabricated sample result file is supplied.

## Run

```sh
# Safe status report: no dataset, no calls, no production change.
npm --prefix backend run verification:benchmark

# Real labels and recorded predictions. Output must be a new path (no overwrite).
npm --prefix backend run verification:benchmark -- /absolute/private/results.json /absolute/private/report.json

# Optional CI/release assertion; exits 1 if pooled OR any included fixture type lacks its target.
npm --prefix backend run verification:benchmark -- /absolute/private/results.json /absolute/private/report-gated.json --require-targets
```

Default reporting exits 0 even when targets are unmet; inspect `status` and `targetMet`. Validation errors and an existing output path fail. `--require-targets` is an opt-in check, never a deployment switch.

## Read and review the report

`overall` and `perFixture` (grouped by fixture **type**) include:

- DIRTY count, false-clean count/rate and 95% Wilson interval; `falseClean` counts predicted CLEAN even when the candidate policy would refuse credit. `dirtyAutoPasses` is separate.
- Wrong/replayed count, candidate auto-pass count/rate and interval; separate wrong-item and replayed auto-pass counts.
- Predicted CANNOT_ASSESS count/rate, human cannot-assess count and unassessable candidate auto-passes.
- Coverage evaluated count, failures/rate, verdict histogram and known wrong/replayed examples incorrectly receiving a consistent MATCH. Failure means non-MATCH or explicit inconsistent identity. Missing coverage is reported separately rather than treated as success.
- Cleanliness service failures, missing stage evidence, contradictory candidate passes, latency and measured cost. Unknown total cost stays `null`.

The pooled target requires at least 100 DIRTY and 100 wrong/replayed examples, false-clean rate at most 2%, zero wrong/replayed candidate passes, complete stage evidence, no contradictory passes and no passes of human unassessable examples. Each included fixture type has the same conservative minimum for its own `targetMet`; pooled success cannot qualify a sparse type. Rates/intervals without denominators are `null`.

Inspect cohort representativeness, false positives, uncertainty, privacy/quality/coverage failures and per-type sample sizes; a successful report is insufficient to certify the model or devices. Record independent reviewer provenance, frozen manifest and dataset digest with the real report. Unsupported/sparse fixture types remain review-required. A future separately reviewed code change would have to bind allowed types and evaluated versions; `autoPassAllowed()` remains false and no environment variable/report enables it.
