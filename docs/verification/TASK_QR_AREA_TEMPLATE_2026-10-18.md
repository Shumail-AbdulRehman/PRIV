# Inline area templates and automatic task QR codes

Managers now configure reusable area templates inside Location → Area template.
Creation, names/instructions, fixture additions, fixture names/status/removal and
archiving stay inline. Legacy area/detail/create URLs redirect into that location
workspace. Template/fixture records and immutable task requirements are preserved.
The old area setup sidebar, sub-tabs, fixture QR labels, shared schedule QR and
manual QR replacement controls are removed from this manager flow.

Each existing or newly generated verification-v2 task can derive its own signed QR
automatically. No database migration, random-token write or manual rotation step
is necessary. `hygeneops.task.v1` binds task ID, area ID and current area signing
authority under the server QR HMAC key. An unchanged task returns the same code;
two instances using the same area/template return different codes.

`GET /task-instance/:taskId/qr` is available only to an active owner or a manager
with access to that location. It uses no-store responses. Staff and foreign
companies cannot read the QR. Submitted, completed or cancelled/inactive tasks
cannot request one. The manager can view/print the code from Location task history,
Today task details, or an actual weekly-schedule item. A planned schedule preview
has no task instance and therefore no QR until that instance is generated.

Both task start and capture-session creation/renewal/rework strictly verify the
exact task code. Shared area codes, fixture labels, another task's code and
modified codes are rejected. Existing assignment, attendance, location, capture
window, idempotency, locking and submission rules remain in place. Existing
sessions stay bound to their original tasks. The wire field remains `areaQr` so
installed staff apps can scan the new opaque payload without a contract change.
Updated mobile source instructions say task QR; no APK was built for this change.
Previously printed shared-area codes need to be replaced with task-specific codes.

Validation:

- 572 backend, 47 web and 72 mobile unit tests pass. Web lint/build and backend/mobile TypeScript checks pass.

- Backend QR tests cover stable/unique task credentials, tampering, shared-area
  and fixture rejection, task/area mismatches and authority changes.
- Isolated HTTP upload regression passes including two tasks from the same
  template, wrong-task rejection at start and capture, owner/manager location and
  tenant scopes, staff denial, normal upload, cleaning/review and submission.
- Schedule-deletion integration passes with task QR capture authority.
- Browser checks at 1440px and 390px cover inline creation, renaming, version
  conflict recovery without losing edits, fixture additions/rename, old URL
  redirects, per-task QR display, a single printable QR region, Urdu and overflow.
  API responses are fabricated; these checks do not mutate application records.
- The older monolithic verification integration still stops at its pre-existing
  assertion of three capture slots (actual two); it expects an entrance photo
  removed by the current workflow. It is not counted as a passing suite here.

Browser artifacts: `/tmp/priv-area-templates/`.
