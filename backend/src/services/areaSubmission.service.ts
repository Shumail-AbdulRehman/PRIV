export const AREA_UPLOAD_WINDOW_SECONDS = 90;

export function isUploadWithinWindow(
  scannedAt: Date,
  uploadedAt: Date,
  windowSeconds: number = AREA_UPLOAD_WINDOW_SECONDS
): boolean {
  const diffMs = uploadedAt.getTime() - scannedAt.getTime();
  return diffMs >= 0 && diffMs <= windowSeconds * 1000;
}

export function canAreaBeUploaded(submission?: {
  scannedAt: Date | null;
  uploadedAt: Date | null;
  status?: string;
}): { ok: true } | { ok: false; reason: string } {
  if (!submission || !submission.scannedAt) {
    return { ok: false, reason: "Area QR has not been scanned" };
  }
  if (submission.uploadedAt && submission.status !== "REJECTED_TIMEOUT") {
    return { ok: false, reason: "Area photo already uploaded" };
  }
  return { ok: true };
}

export function isTaskCompletionEligible(
  referenceImageIds: number[],
  approvedSubmissionReferenceImageIds: number[]
): { ok: true } | { ok: false; missingAreaIds: number[] } {
  const missingAreaIds = referenceImageIds.filter(
    (id) => !approvedSubmissionReferenceImageIds.includes(id)
  );
  if (missingAreaIds.length > 0) {
    return { ok: false, missingAreaIds };
  }
  return { ok: true };
}
