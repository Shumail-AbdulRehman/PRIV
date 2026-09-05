export class CvServiceUnavailableError extends Error {
  constructor(message = "Image comparison service is unavailable") {
    super(message);
    this.name = "CvServiceUnavailableError";
  }
}

export interface AreaMatchReferenceInput {
  id: number;
  imageUrl: string;
}

export interface AreaMatchResult {
  similarityScore: number;
  areaMatchStatus: "passed" | "flagged" | "blocked";
  areaMatchFlag: boolean;
  bestReferencePhotoId: number;
  colorScore?: number | null;
  ssimScore?: number | null;
  featureScore?: number | null;
  thresholds: { match: number; block: number };
  weights?: { color: number | null; ssim: number | null; feature: number | null };
}

interface DiffAllResponseBody {
  status?: string;
  similarity?: number;
  type?: string;
  verdict?: string;
  error?: string;
}

const DIFF_ALL_ENDPOINT = "https://diff-all.com/api/v1/compare";
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_REFERENCE_IMAGE_BYTES = 10 * 1024 * 1024;

// Thresholds (owner-set, 2026-09-03): pass >= 50, manager review 28-50,
// block < 28.
// Measured Diff All mode=feature distributions: genuine same-scene camera
// captures 22.4-54.4, wrong-but-similar areas ~22.5, clearly-wrong areas
// 6.3-13.2, bit-identical/recompressed 92-100.
// Consequence: genuine photos below 28 (hall 23.1, table 22.4) block — staff
// must re-shoot closer to the reference angle; the 22-28 zone cannot be
// resolved by thresholds since genuine and wrong-but-similar photos overlap
// there (pixel-similarity scoring, not scene understanding).
// TODO: recalibrate with a larger same-scene/different-area photo study once
// enough Diff All credits are available.
export const DIFF_ALL_MATCH_THRESHOLD = Number(
  process.env.DIFFALL_MATCH_THRESHOLD ?? 50
);
export const DIFF_ALL_BLOCK_THRESHOLD = Number(
  process.env.DIFFALL_BLOCK_THRESHOLD ?? 28
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const classifySimilarity = (
  similarityPercent: number,
  matchThreshold: number = DIFF_ALL_MATCH_THRESHOLD,
  blockThreshold: number = DIFF_ALL_BLOCK_THRESHOLD
): Pick<AreaMatchResult, "areaMatchStatus" | "areaMatchFlag"> => {
  if (similarityPercent >= matchThreshold) {
    return { areaMatchStatus: "passed", areaMatchFlag: false };
  }
  if (similarityPercent >= blockThreshold) {
    return { areaMatchStatus: "flagged", areaMatchFlag: true };
  }
  return { areaMatchStatus: "blocked", areaMatchFlag: true };
};

const getApiKey = (): string => {
  const key = process.env.DF_ALL;
  if (!key || key === "replace_me") {
    throw new CvServiceUnavailableError(
      "DF_ALL API key is not configured. Set it in backend/.env to enable area-match verification."
    );
  }
  return key;
};

const downloadImageBuffer = async (url: string): Promise<Buffer> => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Failed to download reference image (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_REFERENCE_IMAGE_BYTES) {
    throw new Error("Reference image exceeds size limit");
  }
  return Buffer.from(arrayBuffer);
};

const comparePair = async (
  staffBuffer: Buffer,
  staffMime: string,
  referenceBuffer: Buffer,
  referenceMime: string
): Promise<number> => {
  const form = new FormData();
  form.append("file1", new Blob([new Uint8Array(staffBuffer)], { type: staffMime }), "staff.jpg");
  form.append("file2", new Blob([new Uint8Array(referenceBuffer)], { type: referenceMime }), "reference.jpg");
  form.append("mode", "feature");

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(DIFF_ALL_ENDPOINT, {
        method: "POST",
        headers: { "X-API-Key": getApiKey() },
        body: form,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const body = (await response.json().catch(() => ({}))) as DiffAllResponseBody;

      if (!response.ok) {
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 408 &&
          response.status !== 429
        ) {
          throw new CvServiceUnavailableError(
            body.error ?? `Diff All rejected the request (${response.status})`
          );
        }
        throw new Error(`Diff All responded ${response.status}`);
      }

      if (typeof body.similarity !== "number" || Number.isNaN(body.similarity)) {
        throw new Error("Diff All returned no similarity score");
      }

      return body.similarity;
    } catch (error) {
      lastError = error;
      if (error instanceof CvServiceUnavailableError) {
        throw error;
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw new CvServiceUnavailableError(
    lastError instanceof Error ? lastError.message : "Diff All request failed"
  );
};

export const compareImagesWithDiffAll = async (
  staffBuffer: Buffer,
  staffMime: string,
  references: AreaMatchReferenceInput[]
): Promise<AreaMatchResult> => {
  if (references.length === 0) {
    throw new CvServiceUnavailableError("No reference images available for area match");
  }

  let bestScore = -1;
  let bestReferencePhotoId = references[0].id;

  const failures: string[] = [];

  for (const reference of references) {
    try {
      const referenceBuffer = await downloadImageBuffer(reference.imageUrl);
      const referenceMime = reference.imageUrl.toLowerCase().includes(".png")
        ? "image/png"
        : "image/jpeg";
      const similarity = await comparePair(
        staffBuffer,
        staffMime,
        referenceBuffer,
        referenceMime
      );
      if (similarity > bestScore) {
        bestScore = similarity;
        bestReferencePhotoId = reference.id;
      }
    } catch (error) {
      failures.push(
        `ref ${reference.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (bestScore < 0) {
    throw new CvServiceUnavailableError(
      `Area match failed for all references (${failures.join("; ")})`
    );
  }

  const similarityScore = Number((bestScore / 100).toFixed(4));
  const { areaMatchStatus, areaMatchFlag } = classifySimilarity(bestScore);

  return {
    similarityScore,
    areaMatchStatus,
    areaMatchFlag,
    bestReferencePhotoId,
    colorScore: null,
    ssimScore: null,
    featureScore: null,
    thresholds: {
      match: Number((DIFF_ALL_MATCH_THRESHOLD / 100).toFixed(4)),
      block: Number((DIFF_ALL_BLOCK_THRESHOLD / 100).toFixed(4)),
    },
    weights: { color: null, ssim: null, feature: null },
  };
};
