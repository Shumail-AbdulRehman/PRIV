import { describe, it, expect } from "vitest";
import {
  isUploadWithinWindow,
  canAreaBeUploaded,
  isTaskCompletionEligible,
} from "./areaSubmission.service.js";

describe("isUploadWithinWindow", () => {
  it("returns true when upload is within 90 seconds of scan", () => {
    const scannedAt = new Date("2026-08-29T10:00:00.000Z");
    const uploadedAt = new Date("2026-08-29T10:01:00.000Z");
    const result = isUploadWithinWindow(scannedAt, uploadedAt, 90);
    expect(result).toBe(true);
  });

  it("returns false when upload is 91 seconds after scan", () => {
    const scannedAt = new Date("2026-08-29T10:00:00.000Z");
    const uploadedAt = new Date("2026-08-29T10:01:31.000Z");
    const result = isUploadWithinWindow(scannedAt, uploadedAt, 90);
    expect(result).toBe(false);
  });

  it("returns false when uploadedAt is before scannedAt", () => {
    const scannedAt = new Date("2026-08-29T10:01:00.000Z");
    const uploadedAt = new Date("2026-08-29T10:00:00.000Z");
    const result = isUploadWithinWindow(scannedAt, uploadedAt, 90);
    expect(result).toBe(false);
  });
});

describe("canAreaBeUploaded", () => {
  it("allows upload when area is scanned and not yet uploaded", () => {
    const result = canAreaBeUploaded({ scannedAt: new Date(), uploadedAt: null });
    expect(result.ok).toBe(true);
  });

  it("rejects upload when area has not been scanned", () => {
    const result = canAreaBeUploaded({ scannedAt: null, uploadedAt: null });
    expect(result.ok).toBe(false);
    expect(result).toHaveProperty("reason");
  });

  it("rejects upload when area already has an approved photo", () => {
    const result = canAreaBeUploaded({
      scannedAt: new Date(),
      uploadedAt: new Date(),
      status: "APPROVED",
    });
    expect(result.ok).toBe(false);
  });

  it("allows retry when previous upload was rejected for timeout", () => {
    const result = canAreaBeUploaded({
      scannedAt: new Date(),
      uploadedAt: null,
      status: "REJECTED_TIMEOUT",
    });
    expect(result.ok).toBe(true);
  });

  it("allows retry when previous photo was blocked by area-match", () => {
    const result = canAreaBeUploaded({
      scannedAt: new Date(),
      uploadedAt: new Date(),
      status: "BLOCKED",
    });
    expect(result.ok).toBe(true);
  });

  it("allows retry when previous attempt failed with a CV service error", () => {
    const result = canAreaBeUploaded({
      scannedAt: new Date(),
      uploadedAt: new Date(),
      status: "CV_ERROR",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects retry when previous photo was approved", () => {
    const result = canAreaBeUploaded({
      scannedAt: new Date(),
      uploadedAt: new Date(),
      status: "APPROVED",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects upload for an unknown non-retryable status with a stored photo", () => {
    const result = canAreaBeUploaded({
      scannedAt: new Date(),
      uploadedAt: new Date(),
      status: "PENDING",
    });
    expect(result.ok).toBe(false);
  });
});

describe("isTaskCompletionEligible", () => {
  it("returns ok when all reference areas have approved submissions", () => {
    const result = isTaskCompletionEligible([1, 2, 3], [1, 2, 3]);
    expect(result.ok).toBe(true);
  });

  it("returns missing areas when some are not submitted", () => {
    const result = isTaskCompletionEligible([1, 2, 3], [1, 3]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missingAreaIds).toEqual([2]);
    }
  });
});
