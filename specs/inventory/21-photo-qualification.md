# Spec21 — active photo safety gate

- `backend/src/services/verification-v2/launchQualification.ts`: launchQualificationStatus reports the exact active pipeline digest, existing pinned-release denial reason and absent active privacy/identity capabilities; requireLaunchPhotoQualification returns sanitized503. Reuse for active PHOTO processing instead of boolean flags or synthetic qualification claims.
- `directPhoto.service.ts`: new-processing guard before provider/storage, after existing authority and immutable-result reconciliation; failures release only their processing token for same-capture retry.
- `bufferedPipeline.service.ts`: same guard after live lease before buffer reads/cached result replay. No bytes deleted, leaked or falsely accepted.
- `docs/implementation/PHOTO_QUALIFICATION.md`: truthful safe-disabled boundary and required consented empirical privacy/release evidence; spec39/40 must qualify actual pipeline before activation.
