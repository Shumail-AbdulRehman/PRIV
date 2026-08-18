import OpenAI from "openai";
import {
  ImageVerificationProvider,
  VerificationResult,
  VerificationError,
  verificationResultSchema,
  VERIFICATION_SYSTEM_PROMPT,
} from "./imageVerification.types.js";

const openaiResultSchema = verificationResultSchema;
const SYSTEM_PROMPT = VERIFICATION_SYSTEM_PROMPT;

const insertCloudinaryTransform = (url: string): string => {
  const transform = "w_1024,q_auto";
  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/${transform}/`);
  }
  return url;
};

const createImageContent = (url: string) => ({
  type: "image_url" as const,
  image_url: {
    url: insertCloudinaryTransform(url),
    detail: "low" as const,
  },
});

export class OpenAIVerificationProvider implements ImageVerificationProvider {
  private client: OpenAI;
  private model: string;
  private timeoutMs: number;
  private retries: number;

  constructor(
    apiKey: string,
    model = "gpt-4o-mini",
    timeoutMs = 30000,
    retries = 1
  ) {
    this.client = new OpenAI({ apiKey, timeout: timeoutMs });
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.retries = retries;
  }

  async compare(
    referenceImageUrl: string,
    submissionImageUrl: string
  ): Promise<VerificationResult> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "REFERENCE image:" },
                createImageContent(referenceImageUrl),
                { type: "text", text: "STAFF SUBMISSION image:" },
                createImageContent(submissionImageUrl),
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 400,
        });

        const raw = response.choices[0]?.message?.content;

        if (!raw) {
          throw new VerificationError("OpenAI returned an empty response");
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new VerificationError("OpenAI response was not valid JSON");
        }

        const result = openaiResultSchema.safeParse(parsed);

        if (!result.success) {
          throw new VerificationError(
            `OpenAI response schema mismatch: ${result.error.message}`
          );
        }

        return {
          locationMatch: {
            score: result.data.location_match.score,
            reasoning: result.data.location_match.reasoning,
          },
          cleanlinessMatch: {
            score: result.data.cleanliness_match.score,
            reasoning: result.data.cleanliness_match.reasoning,
          },
        };
      } catch (error) {
        lastError = error;

        if (attempt < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw new VerificationError(
      "AI verification service failed after retries",
      lastError
    );
  }
}
