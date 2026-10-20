# Spec09 reuse additions

### attendance-writes
`backend/src/services/attendanceWrites.service.ts` — injected DB/storage service for active actor/site scoped conditional check-in/out and replay reconciliation; use instead of HTTP-controller write logic. attendanceDateScope binds every local date interval to its site.

### private-orphan-cleanup
`backend/src/services/deletedMedia.service.ts` — existing durable outbox also accepts validated attendance:v1 references; deletes only after reference recheck with authenticated type. Use only for confirmed unused assets, never ambiguous saves.
