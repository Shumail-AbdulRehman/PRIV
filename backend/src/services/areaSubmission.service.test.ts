import { describe, it, expect } from "vitest";
import { isUploadWithinWindow } from "./areaSubmission.service.js";

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
});
