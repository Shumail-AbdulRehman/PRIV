# Categorical direct-photo decisions — 2026-10-18

The active direct-photo adapter now uses the selected Clef category. Confidence
and probabilities are retained as diagnostic metadata only; they do not choose,
reject, soften or override a category. One provider request performs all checks.

## Model choices and actions

| Check | Model choice | Meaning / action |
| --- | --- | --- |
| Object | MATCH | Required object category is present; proceed to remaining checks. |
| Object | NOT_MATCH | Required object absent or wrong category; reject and request a new photo without manager review. |
| Object | NOT_SURE | Object cannot be established; manager review. |
| Cleanliness | CLEAN | No visible removable dirt; retains the separate automatic-approval release requirement. |
| Cleanliness | DIRTY | Visible removable dirt, residue, waste or debris; request cleaning and a fresh photo. |
| Cleanliness | NEEDS_ATTENTION | Ambiguous condition, possible permanent staining/damage, or insufficient visible evidence; manager review. |

Permanent wear alone is not dirt. Clear removable dirt belongs in DIRTY.
Object mismatch is answered separately from cleanliness. Visibility, originality
and legacy generic-toilet style checks also use their selected categories without
confidence cutoffs. Multi-surface photos retain deterministic coverage/aggregation
rules: a missing required part requests a retake; any clearly dirty required
surface requests cleaning once object and coverage checks are satisfied.

## Compatibility and approval

The prompt/evaluator version is `photo-categories-v7`, invalidating older cached
assessments. The active adapter does not read confidence-threshold settings.
Original choices and diagnostic scores are stored in
`metadata.screeningAnswers`, with `decisionMode: MODEL_CATEGORIES_V1`.

Database canonical values remain WRONG_ITEM, UNCERTAIN and CANNOT_ASSESS.
New model NEEDS_ATTENTION is explicitly mapped to CANNOT_ASSESS at this adapter
boundary. Historical NEEDS_ATTENTION records meant localized dirt; their existing
normalization remains unchanged. No migration is required.

A CLEAN classification does not itself grant automatic approval. Existing
release qualification remains a separate gate, producing AUTO_PASS_NOT_VALIDATED
when automatic approval is unavailable; the saved model verdict remains CLEAN.
Historical calibration/evaluation tools remain available for older pipelines;
they do not override categories produced by this adapter. Older stored reviews
are not retrospectively reclassified.

## Validation

- 570 backend unit tests passed, including confidence-invariance tests across
  CLEAN, DIRTY and NEEDS_ATTENTION, explicit NOT_SURE, wrong-object rejection,
  malformed categories, and independent evaluator fingerprint configuration.
- TypeScript compilation passed.
- The isolated HTTP regression exercises the real adapter with mocked provider
  responses: low-score CLEAN, DIRTY, NEEDS_ATTENTION and NOT_SURE, wrong-object
  retakes, persistence, review routing, storage and submission guards.
- A read-only live Clef reevaluation used the actual latest test0111 review image
  (attempt 7c576575-4557-473c-808e-c8ea01535fb4), rubric squat_pan / pan, with
  no task or evidence writes. One request took 1545ms and selected DIRECT,
  MATCH, VISIBLE and DIRTY. Diagnostic confidences were .8959, .8475, .8667
  and .5398 respectively; none changed the selected categories. This is provider
  latency for one photo, not a measurement of the complete mobile upload flow.
