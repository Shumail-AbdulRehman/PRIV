# Spec07 reuse additions

### attendance-reference
`backend/src/services/attendancePhotoReference.ts` — pure opaque reference parser shared by runtime and migration tooling; use instead of importing DB/provider modules from CLI dry-run.

### media-transition
`backend/src/services/attendanceMediaTransition.service.ts` — redacted manifest, isolated apply guard and injected version/hash/CAS migration boundary; use only with ATTENDANCE_MEDIA_RUNBOOK and explicit external release approval.
