# Legacy attendance photos: controlled transition

New photos are authenticated; APIs withhold all old public URLs. This does not revoke previously shared/cached public assets. Commercial release remains blocked until authorized old-asset delivery/cache closure is verified. No tool here deletes an original, resets a database or applies to production.

## Read-only inventory
From backend, use `npx tsx scripts/attendanceMediaInventory.ts <new-private-manifest-file> [last-id]` with explicitly provided ATTENDANCE_MEDIA_INVENTORY_DATABASE_URL and CLOUDINARY_CLOUD_NAME. There is no DATABASE_URL/.env fallback. The SQL transaction is READ ONLY, up to500 attendance rows per page. Save files outside tracked project paths,0600; never commit customer manifests. Resume using nextCursor; do not overwrite a previous page. Output contains record IDs/reference digests/opaque proposed destinations, no names, email, URLs, credentials or photo content. Missing/unknown account or transformed/foreign URL becomes HELD, never guessed.

Dry run: `npx tsx scripts/attendanceMediaTransition.ts <manifest-file>` returns counts/digest without connecting to DB or provider. Only READY entries can be applied. Run a copy of the original dataset in a disposable local test PostgreSQL database and separate test storage account; do not reuse production credentials.

## Isolated rehearsal only
Before any apply, establish the account owner, legal/privacy authority, backup owner and provider credential scope outside code. Prepare backups and a signed manifest review. Configure ATTENDANCE_MEDIA_TEST_DATABASE_URL explicitly (loopback database whose name contains _test); NODE_ENV must not be production. Set ATTENDANCE_MEDIA_MANIFEST_SHA256 to the exact dry-run digest and ATTENDANCE_MEDIA_TEST_STORAGE_ACK to isolated-storage-account only after verifying the configured Cloudinary account is isolated. Supply explicit test Cloudinary credentials through secure environment, never CLI logs.

Then run `npx tsx scripts/attendanceMediaTransition.ts <manifest-file> --apply-isolated-test`. Source row/company/site/staff/reference hash is reread, source account/folder checked, a private JPEG copy made, private bytes downloaded and SHA256 verified, then only the exact prior reference is conditionally updated. Original provider objects remain unchanged. JPEG copy strips metadata; this is not face redaction or evidence qualification. Upload/readback mismatch yields HELD/UNAVAILABLE and no DB cutover. Rerun same manifest/destination after interruption. Changed source or tenant binding yields CONFLICT. Retain unused private copies for reviewed cleanup; never delete on ambiguous commit.

## Backup, rollback and live cutover gate
1. Record isolated DB/storage identities; take encrypted database backup and original object inventory; prove restore in a second isolated environment. Backups contain private URLs/data and never belong in this repository.
2. Review every HELD/CONFLICT/UNAVAILABLE entry with an authorized data owner. Reconcile all references/counts; test own staff, owner, correct manager and wrong-site/wrong-tenant reads.
3. Rollback application behavior by deploying the previous compatible code only under explicit deployment authorization. Keep photo delivery restricted: do not restore public photo rendering. Database field rollback requires the protected source backup and exact reference CAS after confirming its destination is still unchanged. This script offers no automatic production rollback or destructive cleanup.
4. For live cutover, obtain a separate approved migration/rollback procedure with actual host, storage, backup and accountable actor. This isolated-only tool deliberately refuses production apply. Provider operations for old public assets/CDN invalidation require explicit approval after copy/hash/readback verification and linked-reference inventory. Never infer that replacing an API URL revokes a public URL.
5. Prove old originals, transformations and cached URLs cannot be retrieved outside authorization after provider invalidation/closure. Preserve approved backup/history obligations; retention periods/legal terms are external decisions. No public-object deletion is automated here.
6. Record rehearsal/cutover/rollback proof and exact unresolved gates in PROGRESS/handoff. Unit mocks do not satisfy provider/cache/restore qualification.

Current evidence: unit migration-boundary tests only; no customer inventory, isolated provider copy or production transition executed in this session.
