# Spec 05 reuse additions

### attendance-media
`backend/src/services/attendanceMedia.service.ts` — authenticated attendance reference/parser, sanitized upload, scoped bounded JPEG read and safe DTO projection. Use instead of public Cloudinary attendance URLs.

### attendance-photo-route
`backend/src/routes/attendancePhotos.route.ts` — mounted by attendance router; credentialed GET /attendance/:id/photos/check-in or check-out. DTO checkInPhoto/checkOutPhoto expose AVAILABLE/NONE/LEGACY_RESTRICTED and application-relative path, never storage references.
