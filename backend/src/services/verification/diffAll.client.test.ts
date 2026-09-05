import { describe, it, expect } from "vitest";
import { classifySimilarity } from "./diffAll.client.js";

describe("classifySimilarity", () => {
  it("passes at or above the match threshold", () => {
    expect(classifySimilarity(75, 75, 55)).toEqual({
      areaMatchStatus: "passed",
      areaMatchFlag: false,
    });
    expect(classifySimilarity(92.4, 75, 55)).toEqual({
      areaMatchStatus: "passed",
      areaMatchFlag: false,
    });
  });

  it("flags between the block and match thresholds", () => {
    expect(classifySimilarity(55, 75, 55)).toEqual({
      areaMatchStatus: "flagged",
      areaMatchFlag: true,
    });
    expect(classifySimilarity(68, 75, 55)).toEqual({
      areaMatchStatus: "flagged",
      areaMatchFlag: true,
    });
    expect(classifySimilarity(74.9, 75, 55)).toEqual({
      areaMatchStatus: "flagged",
      areaMatchFlag: true,
    });
  });

  it("blocks below the block threshold", () => {
    expect(classifySimilarity(54.9, 75, 55)).toEqual({
      areaMatchStatus: "blocked",
      areaMatchFlag: true,
    });
    expect(classifySimilarity(0, 75, 55)).toEqual({
      areaMatchStatus: "blocked",
      areaMatchFlag: true,
    });
  });

  it("respects custom thresholds", () => {
    expect(classifySimilarity(70, 80, 60).areaMatchStatus).toBe("flagged");
    expect(classifySimilarity(85, 80, 60).areaMatchStatus).toBe("passed");
    expect(classifySimilarity(59, 80, 60).areaMatchStatus).toBe("blocked");
  });

  it("classifies real-world observed scores with default thresholds", () => {
    // Owner bars (50 / 28) against production-observed scores:
    //   keyboard close-up 54.36 and 92+ same-image variants -> passed
    expect(classifySimilarity(92.9).areaMatchStatus).toBe("passed");
    expect(classifySimilarity(54.36).areaMatchStatus).toBe("passed");
    //   hall 23.14, table 22.36, wrong-but-similar 22.5 -> blocked
    //   (the <28 zone cannot separate genuine re-framed from wrong-similar)
    expect(classifySimilarity(27.9).areaMatchStatus).toBe("blocked");
    expect(classifySimilarity(23.14).areaMatchStatus).toBe("blocked");
    expect(classifySimilarity(22.5).areaMatchStatus).toBe("blocked");
    //   clearly-wrong pairs 6.27-13.2 -> blocked
    expect(classifySimilarity(13.2).areaMatchStatus).toBe("blocked");
    expect(classifySimilarity(6.27).areaMatchStatus).toBe("blocked");
  });
});
