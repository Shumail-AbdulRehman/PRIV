# Explicit wrong-object results must request a retake

The reported `test0111` Indian-toilet attempt had a valid model answer choosing
`WRONG_ITEM`, confidence `0.8758`, and scores `{MATCH: 0.014, UNCERTAIN: 0.0288,
WRONG_ITEM: 0.9572}`. The adapter applied the `0.9` match-screening threshold to
this negative result, converted it to `UNCERTAIN`, and consequently retained the
photo for manager review with reason `OBJECT_UNCERTAIN`.

The v6 photo adapter preserves an explicit, uniquely winning `WRONG_ITEM`
selection as a rejection even below the acceptance threshold. It still validates
the answer shape, score range/sum, selected maximum and ties. Acceptance of
`MATCH` still requires the configured confidence threshold. A genuine model
`UNCERTAIN`, tied result, or below-threshold positive match remains uncertain;
this change does not treat an unconfirmed match as proof of the correct object.

The rejection policy produces `RECAPTURE_REQUIRED / WRONG_ITEM / keep:false`:
staff must take the required photo, the next step/submission stays blocked, and
neither a Cloudinary upload nor an ordinary manager-review case is created.
Repeated wrong-object photos retain the existing non-escalating retake policy.

The evaluator prefix was bumped from `photo-staged-checks-v5` to
`photo-staged-checks-v6` so cached assessments and release fingerprints reflect
the changed adapter policy.

Validation: 564 backend tests and TypeScript passed. The isolated HTTP suite
replays the recorded answer through the real adapter and all the way through
reservation, persistence, manifest presentation, storage decisions and submission.
Four below-threshold wrong-object results (0.8758, 0.4, 0.1, 0.8999) produce
retakes, zero cloud uploads, zero review cases and rejected submission. A following
valid object still uses the separate cleanliness/release review gate. Model
responses and cloud storage are controlled in this suite; it is not a new model
accuracy evaluation.

The specific pending `test0111` requirement was corrected in a guarded transaction:
its state is now `RECAPTURE_REQUIRED`, the invalid current-attempt pointer was
cleared, and only its matching automatic `OBJECT_UNCERTAIN` issue was resolved.
The original assessment, attempt and protected evidence were retained. An audit
entry and case event record the correction; task deadlines were not changed.
Staff should refresh and scan the room QR to take the required photo again.

The existing local development watcher picked up the compiled backend change.
The policy fix uses the existing mobile response contract and requires no APK
or database migration.
