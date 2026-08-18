import { z } from "zod";

export interface VerificationScore {
  score: number;
  reasoning: string;
}

export interface VerificationResult {
  locationMatch: VerificationScore;
  cleanlinessMatch: VerificationScore;
}

export interface ImageVerificationProvider {
  compare(referenceImageUrl: string, submissionImageUrl: string): Promise<VerificationResult>;
}

export class VerificationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

export const verificationResultSchema = z.object({
  location_match: z.object({
    score: z.number().int().min(0).max(100),
    reasoning: z.string(),
  }),
  cleanliness_match: z.object({
    score: z.number().int().min(0).max(100),
    reasoning: z.string(),
  }),
});

export const VERIFICATION_SYSTEM_PROMPT = `You are comparing two images of a cleaning task: a REFERENCE image showing the target area and expected cleanliness standard, and a STAFF SUBMISSION image taken after cleaning.

Evaluate two things:
1. location_match — whether the staff image shows the same physical area/location as the reference, tolerating differences in camera angle, lighting, and minor object placement.
2. cleanliness_match — whether the staff image shows a level of cleanliness comparable to the reference.

Score each from 0 to 100. Respond only with JSON matching this exact schema:
{"location_match":{"score":number,"reasoning":"string"},"cleanliness_match":{"score":number,"reasoning":"string"}}`;
