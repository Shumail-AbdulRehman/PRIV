# Active photo qualification

Spec21 implements the safe unavailable boundary, not empirical qualification.

The active BufferedClefProvider (`photo-categories-v7`) explicitly asks the model
not to assess privacy or exact fixture identity. Its direct request path used to
mark retained review images NOT_REQUIRED without screening. The category adapter
cannot establish that an occupant, private/body content or reflection showing a
person is absent. A resized/EXIF-stripped image is not a redacted image.

New direct-photo processing now returns HTTP503 with structured code
PHOTO_QUALIFICATION_UNAVAILABLE after actor/task/hash authorization and completed
result reconciliation, before any AI or cloud storage. Failed request ownership
is released using the existing same-capture retry protocol. No dirty, wrong-item,
SAFE, verified or successful task result is fabricated. Completed persisted
results remain readable under their existing authorization/privacy rules.

Dormant buffered PHOTO processing has the same gate after its lease check,
before reading the buffer or trusting a cached decision. A cached PASSED result
cannot bypass it. Existing buffer bytes remain retained by existing policy;
no new cleanup or retention policy is introduced. No original, review derivative
or raw private sample is newly uploaded by either guarded path while unavailable.

## Evidence binding

launchQualificationStatus reuses cleanlinessReleaseStatus: checksum-pinned
server-side release file, measured development calibration and held-out rows,
image/room/fixture split separation, independent consent/representativeness review,
expiry, exact model/rubric/evaluator and full pipeline configuration digest.
Changing an adapter/model/configuration invalidates the matching record. Invalid
configurations fail unavailable. No environment boolean can grant approval.

Even a valid historical cleanliness record cannot grant capabilities absent from
the active pipeline: privacyAssessment=false and fixtureIdentityAssessment=false.
Both new processing and automatic approval remain disabled for this adapter.
No release record, approved privacy thresholds or representative consented live
sample set was supplied or generated in this session. Synthetic unit tests prove
the denial boundary only; they are not measured provider qualification. Existing
release tests prove the release reader's record/configuration validation.

## Required release evidence (spec39/40)

Implement and independently review the actual privacy screening path first. Bind
its real adapter, model, rubric, privacy decision policy and dataset digest to the
release record; replacing this guard with a feature boolean is prohibited. Do not
guess privacy thresholds from fixture tests or cleanliness calibration. Collect
consented, access-controlled representative development and held-out samples with
independent labels, including empty scenes, visible occupants, body/private
content, people in reflections and genuinely uncertain/occluded scenes. Record
real counts, errors, service failures and independently reviewed acceptable
criteria. Occupant/private/reflection detections must reject or hold without
serving originals or claiming redaction; uncertainty must never release content.
Service outage is unavailable, not evidence of dirt or a request to clean again.

Record approval and repeat the active-path proof after any adapter/model/rubric/
dataset/policy change. These empirical/approved-policy facts remain release
blockers. No fabricated policy, consent, mail, image or production change is part
of this implementation. Existing legacy evidence is not retrospectively qualified
or rewritten; existing HOLD/PENDING access restrictions remain unchanged.

## Verification

44 focused tests across qualification/direct/buffered seams pass. The real guard
is exercised by both publication paths: no provider/storage/publication call when
unavailable, same-capture retry retained and completed-result reconciliation
preserved. Existing lower-level orchestration tests explicitly mock qualification;
they prove storage/lease/retry behavior only. Full counts recorded in spec21 Log.
